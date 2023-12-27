import {
  ProductUpdateGeneralData,
  ProductUpdateGeneralSubType,
  ProductUpdateLabelsData,
  ProductUpdateProjectSourceData,
  ProductUpdateSquareImageData,
  ProductUpdateTagsData,
  ProductUpdateType,
  UpdateAction,
  UpdateDataType,
} from '../../../../model/ProductUpdate';
import {
  ProductGeneralUpdateData,
  ProductMetafieldUpdateData,
  ProductTagsUpdateData,
  ShopifyGeneralMetafield,
  ShopifyMetafieldNamespace,
  ShopifyMetafieldType
} from '../../../../model/Shopify';
import { ShopifyTransformers, ShopifyUpdateBuilder, SKIP_SHOPIFY_METAFIELD_UPDATE } from '../../shopify/ShopifyUpdateBuilder';
import { ShopifyImageService } from '../../../shopify/ShopifyImageService';

export class ProductGeneralShopifyBuilder extends ShopifyUpdateBuilder {

  protected updateType(): ProductUpdateType {
    return ProductUpdateType.general;
  }

  protected transformers(): ShopifyTransformers {
    return {
      [ProductUpdateGeneralSubType.general]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductGeneralShopifyBuilder.prepareGeneralUpdate(<ProductUpdateGeneralData>data);
      },
      [ProductUpdateGeneralSubType.tags]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductGeneralShopifyBuilder.prepareTagsUpdate(<ProductUpdateTagsData>data);
      },
      [ProductUpdateGeneralSubType.labels]: (data: UpdateDataType, action = UpdateAction.update, productId?: unknown) => {
        return ProductGeneralShopifyBuilder.prepareLabelsUpdate(<number>productId, <ProductUpdateLabelsData>data);
      },
      [ProductUpdateGeneralSubType.square_image]: (data: UpdateDataType, action = UpdateAction.update, productId?: unknown) => {
        return ProductGeneralShopifyBuilder.prepareSquareImageUpdate(<number>productId, <ProductUpdateSquareImageData>data);
      },
      [ProductUpdateGeneralSubType.sku]: (data: UpdateDataType, action = UpdateAction.update, productId?: unknown) => {
        return ProductGeneralShopifyBuilder.prepareSkuUpdate(<number>productId, <ProductUpdateGeneralData>data);
      },
      [ProductUpdateGeneralSubType.project_source]: (data: UpdateDataType, action = UpdateAction.update, productId?: unknown) => {
        return ProductGeneralShopifyBuilder.prepareProjectSourceMetafieldUpdate(
          <number>productId,
          <ProductUpdateProjectSourceData>data
        );
      },
    };
  }

  private static prepareGeneralUpdate(data?: ProductUpdateGeneralData): ProductGeneralUpdateData {
    return {
      productType: data?.product_type || 'unknown',
    };
  }

  private static prepareLabelsUpdate(productId: number,
                                     data?: ProductUpdateLabelsData): ProductMetafieldUpdateData[] {
    return [
      {
        productId,
        key: ShopifyGeneralMetafield.labels,
        namespace: ShopifyMetafieldNamespace.product,
        type: ShopifyMetafieldType.json,
        value: JSON.stringify(data?.labels || []),
      },
      {
        productId,
        key: ShopifyGeneralMetafield.design_project,
        namespace: ShopifyMetafieldNamespace.product,
        type: ShopifyMetafieldType.string,
        value: data?.design_project || '',
      },
    ];
  }

  private static prepareTagsUpdate(data?: ProductUpdateTagsData): ProductTagsUpdateData {
    return {
      tags: data?.tags || []
    };
  }

  private static async prepareSquareImageUpdate(productId: number,
                                                data?: ProductUpdateSquareImageData): Promise<ProductMetafieldUpdateData[]> {
    const update: ProductMetafieldUpdateData = {
      productId,
      key: ShopifyGeneralMetafield.square_image,
      namespace: ShopifyMetafieldNamespace.images,
      type: ShopifyMetafieldType.string,
      value: data?.square_image_cdn || '',
    };

    if (!data?.square_image_cdn && data?.square_image_src_upload_url) {
      update.value = (await ShopifyImageService.productAppendImage(productId, data.square_image_src_upload_url))?.url;
    } else if (!data?.square_image_cdn) {
      update.key = SKIP_SHOPIFY_METAFIELD_UPDATE;
    }

    return [update];
  }

  private static prepareProjectSourceMetafieldUpdate(
    productId: number,
    data?: ProductUpdateProjectSourceData,
  ): ProductMetafieldUpdateData[] {
    const update: ProductMetafieldUpdateData = {
      productId,
      key: data?.story ? ShopifyGeneralMetafield.project_source : SKIP_SHOPIFY_METAFIELD_UPDATE,
      namespace: ShopifyMetafieldNamespace.story,
      type: ShopifyMetafieldType.string,
      value: data?.story || '',
    };

    return [update];
  }

  private static prepareSkuUpdate(
    productId: number,
    data?: ProductUpdateGeneralData,
  ): ProductMetafieldUpdateData[] {
    const update: ProductMetafieldUpdateData = {
      productId,
      key: ShopifyGeneralMetafield.sku,
      namespace: ShopifyMetafieldNamespace.product,
      type: ShopifyMetafieldType.string,
      value: data?.sku || '',
    };

    return [update];
  }
}
