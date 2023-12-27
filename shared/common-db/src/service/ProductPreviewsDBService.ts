import { ProductPreview } from '../model/Product';
import { DBService } from './DBService';
import { DBCollection } from '../DBCollection';

export class ProductPreviewsDBService {

  public static async getProductPreview(sku: string, wholePreview = false): Promise<ProductPreview | null> {
    const previewCollection = await DBService.getCollection(DBCollection.PRODUCT_PREVIEWS);
    const projection = wholePreview
      ? undefined
      : {
        _id: 0,
        layouts: {
          layout_name: 1,
          images: 1,
          chosen_room_ids: 1,
          preview_3d: 1,
          shopify_cdn_url: 1,
          shopify_cdn_id: 1,
        }
      };

    return await previewCollection.findOne<ProductPreview>(
      { sku },
      {
        projection: projection
      });
  }

}
