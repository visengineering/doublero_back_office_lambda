import {
  ProductUpdateNameData,
  ProductUpdateNameSubType,
  ProductUpdateType,
  ProductUpdateUrlData,
  UpdateAction,
  UpdateDataType
} from '../../../../model/ProductUpdate';
import { AlgoliaProductNameSubType, AlgoliaProductUrlSubType } from '../../../../model/Algolia';
import { AlgoliaTransformers, AlgoliaUpdateBuilder } from '../../algolia/AlgoliaUpdateBuilder';
import { ErrorUtil } from 'common-util/ErrorUtil';

export class ProductNameAlgoliaBuilder extends AlgoliaUpdateBuilder {
  protected updateType(): ProductUpdateType {
    return ProductUpdateType.name;
  }

  protected transformers(): AlgoliaTransformers {
    return {
      [ProductUpdateNameSubType.name]: (data: UpdateDataType, action: UpdateAction) => {
        if (action == UpdateAction.delete) {
          throw ErrorUtil.notAllowed(`Action ${UpdateAction.delete} is not supported for type '${this.updateType()}' and subtype '${ProductUpdateNameSubType.name}'`);
        }

        return ProductNameAlgoliaBuilder.prepareNameUpdate(<ProductUpdateNameData>data);
      },
      [ProductUpdateNameSubType.url]: (data: UpdateDataType, action: UpdateAction) => {
        if (action == UpdateAction.delete) {
          throw ErrorUtil.notAllowed(`Action ${UpdateAction.delete} is not supported for type '${this.updateType()}' and subtype '${ProductUpdateNameSubType.url}'`);
        }

        return ProductNameAlgoliaBuilder.prepareUrlUpdate(<ProductUpdateUrlData>data);
      },
    };
  }

  private static prepareNameUpdate(data: ProductUpdateNameData): AlgoliaProductNameSubType {
    return {
      title: data.title,
      description: data.description || '',
    };
  }

  private static prepareUrlUpdate(data?: ProductUpdateUrlData): AlgoliaProductUrlSubType {
    return {
      url: data?.url || ''
    };
  }
}
