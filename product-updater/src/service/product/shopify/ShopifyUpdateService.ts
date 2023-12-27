import {
  BaseProductUpdateData,
  ProductUpdate3dPreviewData,
  ProductUpdateEventTypes,
  ProductUpdateGeneralSubType,
  ProductUpdatePreviewsSubType,
  ProductUpdateSquareImageData,
  ProductUpdateType,
  QueueUpdate,
  Update,
  UpdateAction
} from '../../../model/ProductUpdate';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { ProductLogsService } from '../ProductLogsService';
import { ProductChangeActions, ProductDeleteActions } from '../../../model/Product';
import {
  ProductGeneralTypeUpdateData,
  ProductMetafieldUpdateData,
  ProductNameTypeUpdateData,
  ShopifyProductUpdate,
  ShopifyProductUpdateDto
} from '../../../model/Shopify';
import { ProductCategorizationShopifyBuilder } from '../builder/categorization/ProductCategorizationShopifyBuilder';
import { ProductNameShopifyBuilder } from '../builder/name/ProductNameShopifyBuilder';
import { ProductGeneralShopifyBuilder } from '../builder/general/ProductGeneralShopifyBuilder';
import { ProductPreviewsShopifyBuilder } from '../builder/previews/ProductPreviewsShopifyBuilder';
import { ShopifyProductService } from '../../shopify/ShopifyProductService';
import { ProductUpdateHelper } from '../ProductUpdateHelper';
import { SKIP_SHOPIFY_METAFIELD_UPDATE } from './ShopifyUpdateBuilder';
import { ShopifyImageService } from '../../shopify/ShopifyImageService';

export class ShopifyUpdateService {

  public static validateUpdateEvent(update: QueueUpdate): void {
    let error: string | undefined;

    if (!update.task_token) {
      error = 'Task Token is required in order to proceed';
    } else if (!update.sku) {
      error = 'Product SKU is required in order to proceed';
    } else if (!update.shopify_id) {
      error = 'Product ShopifyId is required in order to proceed';
    }

    if (error) throw ErrorUtil.badRequest(error, undefined, JSON.stringify(update));

    update.updates?.forEach(item => ProductUpdateHelper.validateProductUpdateItem(item));
  }

  public static async handleProductUpdate(productUpdate: BaseProductUpdateData, executionId?: string): Promise<Update[]> {
    const productId = productUpdate.shopify_id;

    const updateMetafields: ProductMetafieldUpdateData[] = [];
    const deleteMetafields: ProductMetafieldUpdateData[] = [];

    const previewUpdates: Update[] = [];
    const rawProductUpdatesData: ShopifyProductUpdate[] = [];

    const logTypes: Partial<ProductUpdateEventTypes> = {};

    for (const update of productUpdate.updates) {
      let updatesDto: ShopifyProductUpdate | ShopifyProductUpdateDto;
      let metafield: ProductMetafieldUpdateData | undefined;
      let metafields: ProductMetafieldUpdateData[] | undefined;
      const generalMetafieldSubtypes = [
        ProductUpdateGeneralSubType.square_image,
        ProductUpdateGeneralSubType.labels,
        ProductUpdateGeneralSubType.project_source,
        ProductUpdateGeneralSubType.sku
      ];

      switch (update.type) {
        case ProductUpdateType.categorization:
          metafield = <ProductMetafieldUpdateData>(new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

          if (metafield.key == SKIP_SHOPIFY_METAFIELD_UPDATE) break;

          this.handleMetafieldUpdate(metafield, deleteMetafields, updateMetafields, update.action);

          break;
        case ProductUpdateType.previews:
          if (update.sub_type === ProductUpdatePreviewsSubType.previews_3d 
            && !!(<ProductUpdate3dPreviewData>update.data).shopify_cdn_upload_url) {
            const imageUpdate = await ShopifyImageService
              .productImageUpdate(productId, 
                (<ProductUpdate3dPreviewData>update.data).shopify_cdn_upload_url || '', 
                (<ProductUpdate3dPreviewData>update.data).shopify_cdn_id);

            (<ProductUpdate3dPreviewData>update.data).preview_3d = imageUpdate.url;
            (<ProductUpdate3dPreviewData>update.data).shopify_cdn_id = imageUpdate.id;
            (<ProductUpdate3dPreviewData>update.data).shopify_cdn_upload_url = undefined;
          }
          previewUpdates.push(update);

          break;
        case ProductUpdateType.name:
          rawProductUpdatesData.push((new ProductNameShopifyBuilder()).buildUpdate(productId, update));

          break;
        case ProductUpdateType.general:

          if (generalMetafieldSubtypes.includes(<ProductUpdateGeneralSubType>update.sub_type)) {
            metafields = <ProductMetafieldUpdateData[]>(await (new ProductGeneralShopifyBuilder()).buildAsyncUpdate(productId, update));

            metafields
              .filter(metafield => metafield.key != SKIP_SHOPIFY_METAFIELD_UPDATE)
              .forEach(metafield => {
                if (update.sub_type == ProductUpdateGeneralSubType.square_image) {
                  (<ProductUpdateSquareImageData>update.data).square_image_cdn = <string>metafield.value;
                }

                this.handleMetafieldUpdate(metafield, deleteMetafields, updateMetafields, update.action);
              });

            break;
          }

          updatesDto = (new ProductGeneralShopifyBuilder()).buildUpdate(productId, update);

          if (update.sub_type == ProductUpdateGeneralSubType.general) {
            if ((<ShopifyProductUpdateDto>updatesDto).update) {
              rawProductUpdatesData.push((<ShopifyProductUpdateDto>updatesDto).update);
            }
            (<ShopifyProductUpdateDto>updatesDto).metafields?.forEach(metafield => {
              this.handleMetafieldUpdate(metafield, deleteMetafields, updateMetafields, update.action);
            });
          } else {
            rawProductUpdatesData.push(updatesDto);
          }

          break;
        default:
          throw ErrorUtil.notAllowed(`Product update with type=${update.type} is not supported`);
      }

      if (!logTypes[update.type]) logTypes[update.type] = [];
      if (!logTypes[update.type]?.includes(update.sub_type)) logTypes[update.type]?.push(update.sub_type);
    }

    if (previewUpdates.length) {
      const metafields = <ProductMetafieldUpdateData[]>(new ProductPreviewsShopifyBuilder()).buildRelatedUpdates(productId, previewUpdates);
      metafields
        .filter(metafield => metafield.key != SKIP_SHOPIFY_METAFIELD_UPDATE)
        .forEach(metafield => this.handleMetafieldUpdate(metafield, deleteMetafields, updateMetafields));
    }

    if (rawProductUpdatesData.length) {
      const data = rawProductUpdatesData.reduce((u1, u2) =>
        ({ ...<ProductNameTypeUpdateData | ProductGeneralTypeUpdateData>u1, ...u2 }), {});
      if (Object.keys(data).length) await ShopifyProductService.updateRawProductData(productId, data);
    }

    if (updateMetafields.length) await ShopifyProductService.setProductMetafields(updateMetafields);
    for (const metafield of deleteMetafields) {
      await ShopifyProductService.deleteProductMetafield(metafield);
    }

    await ProductLogsService.saveLog(productUpdate.sku, ProductChangeActions.product_updater_shopify_updated,
      JSON.stringify(logTypes), executionId);

    return productUpdate.updates;
  }

  private static handleMetafieldUpdate(metafield: ProductMetafieldUpdateData,
                                       deleteMetafields: ProductMetafieldUpdateData[],
                                       updateMetafields: ProductMetafieldUpdateData[],
                                       action = UpdateAction.update) {
    if (action == UpdateAction.delete || !metafield.value) {
      deleteMetafields.push(metafield);
    } else {
      updateMetafields.push(metafield);
    }
  }

  public static async setProductStatusToDraft(shopify_id: number, sku: string, executionId?: string){
    await ProductLogsService.saveLog(sku, ProductDeleteActions.product_updater_shopify_deleted,
      'shopify-Deleted', executionId);
    return await ShopifyProductService.changeProductStatusToDraft(shopify_id);
  }
}
