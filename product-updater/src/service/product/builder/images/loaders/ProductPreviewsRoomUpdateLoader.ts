import { ProductImagesUpdate, ProductUpdatePreviewsSubType, ProductUpdateType, UpdateAction, } from '../../../../../model/ProductUpdate';
import { Product, ProductLayout } from 'common-db/model/Product';

export class ProductPreviewsRoomUpdateLoader {

  public static async loadRoomPreviews(product: Product, productLayouts: ProductLayout[]): Promise<ProductImagesUpdate> {
    const result: ProductImagesUpdate = {
      updates: [],
      images: [],
    };

    const layouts: string[] = product.layouts || [];

    for (const layout of layouts) {
      const layoutData = productLayouts.find(item => item.layout == layout);

      if (!layoutData) continue;

      result.updates.push({
        type: ProductUpdateType.previews,
        sub_type: ProductUpdatePreviewsSubType.previews_room,
        action: UpdateAction.update,
        data: {
          layout: layout,
          rooms: layoutData.rooms.map(room => ({
            room_id: room.room_id,
            image_link: room.image_link || ''
          })),
        },
      });
    }

    return result;
  }

}
