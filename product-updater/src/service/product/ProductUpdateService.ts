import {
  ProductDelete,
  ProductImagesUpdate,
  ProductUpdate,
  ProductUpdateEventTypes,
  ProductUpdateGeneralSubType,
  ProductUpdateType,
  Update,
  UpdateAction
} from '../../model/ProductUpdate';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { Product } from 'common-db/model/Product';
import { ProductLogsService } from './ProductLogsService';
import { ProductChangeActions, ProductDeleteActions } from '../../model/Product';
import { ProductCategorizationUpdateBuilder } from './builder/categorization/ProductCategorizationUpdateBuilder';
import { ProductNameUpdateBuilder } from './builder/name/ProductNameUpdateBuilder';
import { ProductDBService } from 'common-db/service/ProductDBService';
import { ProductUpdateHelper } from './ProductUpdateHelper';
import { ProductImagesUpdateBuilder } from './builder/images/ProductImagesUpdateBuilder';
import { ProductPreviewsUpdateBuilder } from './builder/images/ProductPreviewsUpdateBuilder';
import { ProductGeneralUpdateBuilder } from './builder/general/ProductGeneralUpdateBuilder';

export class ProductUpdateService {

  private static async getProductDetails(sku: string): Promise<Product> {
    return await ProductDBService.getProduct(sku, {
      _id: 0,
      sku: 1,
      exclusive: 1,
      personalized: 1,
      hot_deal: 1,
      push_pin: 1,
      shopify_id: 1,
      title: 1,
      description: 1,
      url: 1,
      created_at: 1,
      last_updated: 1,
      published_at: 1,
      edit_status: 1,
      variants: 1,
      product_type: 1,
      extra_data: {
        artist: 1,
        displayed_artist: 1,
        main_category: {
          _id: 1,
        },
        guest_categories: {
          _id: 1,
        },
        atmospheres: {
          _id: 1,
        },
        mediums: 1,
        collection_main_color: 1,
        cloudinaryColors: 1,
        collection_styles: {
          _id: 1,
        },
        businesses: {
          _id: 1,
        },
        personas: {
          _id: 1,
        },
        occasions: {
          _id: 1,
        },
        styles: 1,
        substyles: 1,
        subCollections: 1,
        rooms: 1,
        tags: 1,
        colors: 1,
        product_tags: 1,
        designProject: 1,
        brand: {
          name: 1
        },
        story: 1,
      },
      layouts: 1,
      main_product_image: 1,
      main_product_image_upload_hash: 1,
      shopify_main_product_image: 1,
      isHidden: 1,
    });
  }

  public static async prepareProductUpdates(sku: string,
    types: ProductUpdateEventTypes,
    skipShopifyUpdate: boolean,
    executionId?: string): Promise<ProductUpdate> {
    const product = await this.getProductDetails(sku);

    if (product.isHidden) {
      throw ErrorUtil.notAllowed(`Product update for hidden products is not supported`);
    }

    const result: ProductUpdate = {
      sku: product.sku,
      shopify_id: product.shopify_id,
      updates: [],
      images: []
    };

    const logTypes: Partial<ProductUpdateEventTypes> = {};

    const updatePromises: Promise<Update[]>[] = [];
    const updateImagePromises: Promise<ProductImagesUpdate>[] = [];

    for (const type of Object.keys(types)) {
      console.log(`Preparing product (sku=${sku}) update details for type ${type}`);

      const updateType = <ProductUpdateType>type;
      const subTypes = ProductUpdateHelper.getUpdateSubTypes(updateType, types[updateType]);
      logTypes[updateType] = subTypes;

      switch (type) {
        case ProductUpdateType.categorization:
          updatePromises.push((new ProductCategorizationUpdateBuilder()).loadUpdates(product, subTypes));
          break;
        case ProductUpdateType.name:
          updatePromises.push((new ProductNameUpdateBuilder()).loadUpdates(product, subTypes));
          break;
        case ProductUpdateType.general:
          if (subTypes.includes(ProductUpdateGeneralSubType.square_image)) {
            updateImagePromises.push((new ProductImagesUpdateBuilder().loadImageUpdate(product,
              ProductUpdateGeneralSubType.square_image, { skipShopifyUpdate })));
          }

          if (subTypes.some(type => type != ProductUpdateGeneralSubType.square_image)) {
            updatePromises.push((new ProductGeneralUpdateBuilder()).loadUpdates(product,
              subTypes.filter(type => type != ProductUpdateGeneralSubType.square_image))
            );
          }

          break;
        case ProductUpdateType.previews:
          updateImagePromises.push(...await (new ProductPreviewsUpdateBuilder().loadRelatedUpdates(product, subTypes)));
          break;
        default:
          throw ErrorUtil.notAllowed(`Product update with type=${type} is not supported`);
      }
    }

    const updates = await Promise.all(updatePromises);
    updates.forEach(update => result.updates.push(...update));

    const imageUpdates = await Promise.all(updateImagePromises);
    imageUpdates.forEach(item => {
      result.updates.push(...item.updates);
      result.images.push(...item.images);
    });

    await ProductLogsService.saveLog(product.sku, ProductChangeActions.product_updater_update_started,
      JSON.stringify(logTypes), executionId);

    return result;
  }

  public static async prepareDeleteInput(sku: string, action: UpdateAction, shopify_id?: number,  executionId?: string):
    Promise<ProductDelete> {
      await ProductLogsService.saveLog(sku, ProductDeleteActions.product_updater_delete_started,
      'delete', executionId);
      return {
        sku,
        shopify_id,
        action,
        updates: [],
        images: []
      };
  }

}
