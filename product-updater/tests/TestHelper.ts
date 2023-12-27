import {
  ImageUpload,
  ProductUpdate,
  ProductUpdateSubType,
  ProductUpdateType,
  Update,
  UpdateAction,
  UpdateDataType
} from '../src/model/ProductUpdate';
import { DataUtil } from 'common-util/DataUtil';
import { ProductMetafieldUpdateData, ShopifyMetafieldName, ShopifyMetafieldNamespace, ShopifyMetafieldType } from '../src/model/Shopify';

export class TestHelper {
  public static prepareUpdate = (sub_type: ProductUpdateSubType, type: ProductUpdateType,
                                 data: UpdateDataType, action = UpdateAction.update): Update => {
    return {
      type,
      sub_type,
      action,
      data
    };
  };

  public static prepareProductUpdate = (updates: Update[] = [], images: ImageUpload[] = []): ProductUpdate => {
    return {
      sku: DataUtil.generateId(),
      shopify_id: this.prepareShopifyId(),
      updates,
      images
    };
  };

  public static prepareShopifyId(): number {
    return DataUtil.getRandomInt(10000000, 90000000);
  }

  public static prepareMetafieldUpdate = (productId: number, key: ShopifyMetafieldName, value: string,
                                          namespace: ShopifyMetafieldNamespace,
                                          type = ShopifyMetafieldType.string): ProductMetafieldUpdateData => {
    return {
      key,
      namespace,
      productId,
      type,
      value
    };
  };
}
