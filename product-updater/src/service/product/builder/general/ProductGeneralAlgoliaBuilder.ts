import {
  ProductUpdateGeneralData,
  ProductUpdateGeneralSubType,
  ProductUpdateLabelsData,
  ProductUpdateSquareImageData,
  ProductUpdateTagsData,
  ProductUpdateType,
  UpdateAction,
  UpdateDataType
} from '../../../../model/ProductUpdate';
import {
  AlgoliaProductBaseSubType,
  AlgoliaProductGeneralSubType,
  AlgoliaProductLabelsSubType,
  AlgoliaProductMainImageType,
  AlgoliaProductTagsSubType,
  AlgoliaUpdateProductType,
} from '../../../../model/Algolia';
import { AlgoliaTransformers, AlgoliaUpdateBuilder } from '../../algolia/AlgoliaUpdateBuilder';

export class ProductGeneralAlgoliaBuilder extends AlgoliaUpdateBuilder {
  protected updateType(): ProductUpdateType {
    return ProductUpdateType.general;
  }

  protected transformers(): AlgoliaTransformers {
    return {
      [ProductUpdateGeneralSubType.general]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductGeneralAlgoliaBuilder.prepareGeneralUpdate(<ProductUpdateGeneralData>data);
      },
      [ProductUpdateGeneralSubType.sku]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductGeneralAlgoliaBuilder.prepareSkuUpdate(<ProductUpdateGeneralData>data);
      },
      [ProductUpdateGeneralSubType.labels]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductGeneralAlgoliaBuilder.prepareLabelsUpdate(<ProductUpdateLabelsData>data);
      },
      [ProductUpdateGeneralSubType.tags]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductGeneralAlgoliaBuilder.prepareTagsUpdate(<ProductUpdateTagsData>data);
      },
      [ProductUpdateGeneralSubType.square_image]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductGeneralAlgoliaBuilder.prepareMainImageUpdate(<ProductUpdateSquareImageData>data);
      },
      [ProductUpdateGeneralSubType.project_source]: (data: UpdateDataType, action = UpdateAction.update) => {
        return <AlgoliaUpdateProductType>{};
      },

    };
  }

  private static prepareGeneralUpdate(data: ProductUpdateGeneralData): AlgoliaProductGeneralSubType {
    return {
      sku: data.sku,
      shopify_id: data.shopify_id,
      created_at: (data.created_at ? (new Date(data.created_at)).getTime() : null),
      last_updated_at: (data.last_updated_at ? (new Date(data.last_updated_at)).getTime() : null),
      published_at: (data.published_at ? (new Date(data.published_at)).getTime() : null),
      product_type: data.product_type,
    };
  }

  private static prepareSkuUpdate(data: ProductUpdateGeneralData): AlgoliaProductBaseSubType {
    return {
      sku: data.sku
    };
  }

  private static prepareLabelsUpdate(data: ProductUpdateLabelsData): AlgoliaProductLabelsSubType {
    return {
      labels: data.labels || [],
      design_project: data.design_project || '',
    };
  }

  private static prepareTagsUpdate(data?: ProductUpdateTagsData): AlgoliaProductTagsSubType {
    return {
      tags: data?.tags || [],
      tags_auto: []
    };
  }

  private static prepareMainImageUpdate(data?: ProductUpdateSquareImageData): AlgoliaProductMainImageType {
    return { square_image: data?.square_image_cdn || '',  main_image: data?.square_image_src || '',};
  }
}
