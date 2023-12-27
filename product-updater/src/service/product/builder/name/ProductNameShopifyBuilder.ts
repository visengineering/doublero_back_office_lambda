import {
  ProductUpdateNameData,
  ProductUpdateNameSubType,
  ProductUpdateType,
  ProductUpdateUrlData, UpdateAction,
  UpdateDataType
} from '../../../../model/ProductUpdate';
import { ProductNameUpdateData, ProductUrlUpdateData } from '../../../../model/Shopify';
import { ShopifyTransformers, ShopifyUpdateBuilder } from '../../shopify/ShopifyUpdateBuilder';
import { ErrorUtil } from 'common-util/ErrorUtil';

export class ProductNameShopifyBuilder extends ShopifyUpdateBuilder {

  protected updateType(): ProductUpdateType {
    return ProductUpdateType.name;
  }

  protected transformers(): ShopifyTransformers {
    return {
      [ProductUpdateNameSubType.name]: (data: UpdateDataType, action: UpdateAction) => {
        if (action == UpdateAction.delete) {
          throw ErrorUtil.notAllowed(`Action ${UpdateAction.delete} is not supported for type '${this.updateType()}' and subtype '${ProductUpdateNameSubType.name}'`);
        }

        return ProductNameShopifyBuilder.prepareTitleAndDescription(<ProductUpdateNameData>data);
      },
      [ProductUpdateNameSubType.url]: (data: UpdateDataType, action: UpdateAction) => {
        if (action == UpdateAction.delete) {
          throw ErrorUtil.notAllowed(`Action ${UpdateAction.delete} is not supported for type '${this.updateType()}' and subtype '${ProductUpdateNameSubType.url}'`);
        }

        return ProductNameShopifyBuilder.prepareUrlAndRedirect(<ProductUpdateUrlData>data);
      },
    };
  }

  private static prepareTitleAndDescription(data: ProductUpdateNameData): ProductNameUpdateData {
    return {
      title: data.title,
      descriptionHtml: data.description || '',
    };
  }

  private static prepareUrlAndRedirect(data: ProductUpdateUrlData): ProductUrlUpdateData {
    return {
      handle: data.url.replace('/products/', ''),
      redirectNewHandle: true,
    };
  }
}
