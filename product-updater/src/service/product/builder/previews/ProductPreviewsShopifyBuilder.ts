import {
  ProductUpdate3dPreviewData,
  ProductUpdateLayoutData,
  ProductUpdatePreviewsSubType,
  ProductUpdateRoomPreviewData,
  ProductUpdateType,
  Update,
  UpdateAction,
  UpdateDataType
} from '../../../../model/ProductUpdate';
import {
  ProductLayoutImageUpdateData,
  ProductLayoutMapUpdateData,
  ProductMetafieldUpdateData,
  ShopifyMetafieldNamespace,
  ShopifyMetafieldType,
  ShopifyPreviewsMetafield,
  ShopifyProductUpdate
} from '../../../../model/Shopify';
import { ShopifyTransformers, ShopifyUpdateBuilder } from '../../shopify/ShopifyUpdateBuilder';

export class ProductPreviewsShopifyBuilder extends ShopifyUpdateBuilder {

  protected updateType(): ProductUpdateType {
    return ProductUpdateType.previews;
  }

  protected transformers(): ShopifyTransformers {
    return {
      [ProductUpdatePreviewsSubType.layouts]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductPreviewsShopifyBuilder.prepareLayoutPreviewUpdate(<ProductUpdateLayoutData[]>data);
      },
      [ShopifyPreviewsMetafield.previews_3d]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductPreviewsShopifyBuilder.prepare3dPreviewUpdate(<ProductUpdate3dPreviewData>data);
      },
      [ShopifyPreviewsMetafield.previews_room]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductPreviewsShopifyBuilder.prepareRoomPreviewUpdate(<ProductUpdateRoomPreviewData>data);
      },
    };
  }

  public buildRelatedUpdates(productId: number, updates: Update[]): ShopifyProductUpdate {
    const transformers = this.transformers();
    updates.forEach(update => this.verifyUpdate(update, transformers));

    const result: ProductMetafieldUpdateData[] = [];

    const preview3dData = updates
      .filter(update => update.sub_type == ProductUpdatePreviewsSubType.previews_3d)
      .map(update => this.getTransformer(transformers, update.sub_type)(<ProductUpdate3dPreviewData>update.data, update.action))
      .reduce((data1, data2) => ({ ...<ProductLayoutImageUpdateData>data1, ...data2 }), {});

    const layoutsUpdate = updates.find(update => update.sub_type === ProductUpdatePreviewsSubType.layouts);

    if (Object.keys(preview3dData).length) {
      result.push({
        productId,
        key: ShopifyPreviewsMetafield.previews_3d,
        namespace: ShopifyMetafieldNamespace.previews,
        type: ShopifyMetafieldType.json,
        value: JSON.stringify(preview3dData),
      });
    }

    // TODO: Make conventional approach for this functionality
    if (layoutsUpdate) {
      layoutsUpdate.data = (<ProductUpdateLayoutData[]>layoutsUpdate.data)?.map(data => {
        const update3d = updates.find(update =>
          update.sub_type === ProductUpdatePreviewsSubType.previews_3d
          && (<ProductUpdate3dPreviewData>update.data).layout === data.layout
          && (<ProductUpdate3dPreviewData>update.data).short_layout === data.short_layout);

        if (update3d) {
          data.preview_3d = (<ProductUpdate3dPreviewData>update3d.data).preview_3d || data.preview_3d;
        }

        return data;
      });

      const layoutsData = this.getTransformer(transformers, layoutsUpdate.sub_type)(layoutsUpdate.data, layoutsUpdate.action);
      result.push({
        productId,
        key: ShopifyPreviewsMetafield.layouts,
        namespace: ShopifyMetafieldNamespace.product,
        type: ShopifyMetafieldType.json,
        value: JSON.stringify(layoutsData),
      });
    }

    return result;
  }

  private static prepare3dPreviewUpdate(data: ProductUpdate3dPreviewData): ProductLayoutImageUpdateData {
    return {
      ...(data.preview_3d && { [data.short_layout]: data.preview_3d }),
    };
  }

  private static prepareLayoutPreviewUpdate(data: ProductUpdateLayoutData[]): ProductLayoutMapUpdateData {
    return (data)?.reduce((update, layout) => {
      update[layout.short_layout] = {
        master_name: layout.layout,
        master_handle: layout.master_handle,
        shape: layout.shape,
        previews: {
          '3d': { auto: layout.preview_3d },
          rooms: layout.rooms?.map(room => ({ room: room.room_type, url: room.image_link })) || []
        }
      };
      return update;
    }, <ProductLayoutMapUpdateData>{}) || {};
  }

  private static prepareRoomPreviewUpdate(data: ProductUpdateRoomPreviewData): ProductLayoutImageUpdateData {
    return {};
  }
}
