import {
  ProductUpdateArtistData,
  ProductUpdateAtmospheresData,
  ProductUpdateBusinessesData,
  ProductUpdateCategoriesData,
  ProductUpdateCategorizationSubType,
  ProductUpdateColorsData,
  ProductUpdateMediumsData,
  ProductUpdateOccasionsData,
  ProductUpdatePersonasData,
  ProductUpdateStylesData,
  ProductUpdateType,
  UpdateAction,
  UpdateDataType
} from '../../../../model/ProductUpdate';
import {
  ProductMetafieldUpdateData,
  ShopifyCategorizationMetafield,
  ShopifyMetafieldName,
  ShopifyMetafieldNamespace,
  ShopifyMetafieldType
} from '../../../../model/Shopify';
import { ShopifyTransformers, ShopifyUpdateBuilder, SKIP_SHOPIFY_METAFIELD_UPDATE } from '../../shopify/ShopifyUpdateBuilder';
import { ProductCategorizationHelper } from './ProductCategorizationHelper';

export class ProductCategorizationShopifyBuilder extends ShopifyUpdateBuilder {

  protected updateType(): ProductUpdateType {
    return ProductUpdateType.categorization;
  }

  protected transformers(): ShopifyTransformers {
    return {
      [ProductUpdateCategorizationSubType.artist]: (update: UpdateDataType, action = UpdateAction.update, productId?: unknown) => {
        const value = ProductCategorizationHelper.prepareCategorizationHandle((<ProductUpdateArtistData>update).identifier);

        return ProductCategorizationShopifyBuilder.prepareMetafieldUpdate(<number>productId,
          ShopifyCategorizationMetafield.artist, value, action);
      },
      [ProductUpdateCategorizationSubType.atmospheres]: (update: UpdateDataType, action = UpdateAction.update, productId?: unknown) => {
        const value = ProductCategorizationHelper.prepareCategorizationValueForList(
          (<ProductUpdateAtmospheresData>update)?.atmospheres?.map(a => a.identifier)
        );

        return ProductCategorizationShopifyBuilder.prepareMetafieldUpdate(<number>productId,
          ShopifyCategorizationMetafield.atmospheres, value, action);
      },
      [ProductUpdateCategorizationSubType.businesses]: (update: UpdateDataType, action = UpdateAction.update, productId?: unknown) => {
        const value = ProductCategorizationHelper.prepareCategorizationValueForTree((<ProductUpdateBusinessesData>update).businesses);

        return ProductCategorizationShopifyBuilder.prepareMetafieldUpdate(<number>productId,
          ShopifyCategorizationMetafield.businesses, value, action);
      },
      [ProductUpdateCategorizationSubType.personas]: (update: UpdateDataType, action = UpdateAction.update, productId?: unknown) => {
        const value = ProductCategorizationHelper.prepareCategorizationValueForTree((<ProductUpdatePersonasData>update).personas);

        return ProductCategorizationShopifyBuilder.prepareMetafieldUpdate(<number>productId,
          ShopifyCategorizationMetafield.personas, value, action);
      },
      [ProductUpdateCategorizationSubType.occasions]: (update: UpdateDataType, action = UpdateAction.update, productId?: unknown) => {
        const value = ProductCategorizationHelper.prepareCategorizationValueForTree((<ProductUpdateOccasionsData>update).occasions);

        return ProductCategorizationShopifyBuilder.prepareMetafieldUpdate(<number>productId,
          ShopifyCategorizationMetafield.occasions, value, action);
      },
      [ProductUpdateCategorizationSubType.categories_guest]: (update: UpdateDataType,
                                                              action = UpdateAction.update, productId?: unknown) => {
        const value = ProductCategorizationHelper.prepareCategorizationValueForTree((<ProductUpdateCategoriesData>update).guest_categories);

        return ProductCategorizationShopifyBuilder.prepareMetafieldUpdate(<number>productId,
          ShopifyCategorizationMetafield.categories_guest, value, action);
      },
      [ProductUpdateCategorizationSubType.categories_main]: (update: UpdateDataType,
                                                             action = UpdateAction.update, productId?: unknown) => {
        const data = <Partial<ProductUpdateCategoriesData>>update;
        const value = ProductCategorizationHelper.prepareCategorizationHandle(data.main_category?.slug, data.main_category?.suffix);

        return ProductCategorizationShopifyBuilder.prepareMetafieldUpdate(<number>productId,
          ShopifyCategorizationMetafield.categories_main, value, action);
      },
      [ProductUpdateCategorizationSubType.categories_all]: (update: UpdateDataType,
                                                            action = UpdateAction.update, productId?: unknown) => {
        return ProductCategorizationShopifyBuilder.prepareMetafieldUpdate(<number>productId, SKIP_SHOPIFY_METAFIELD_UPDATE, '', action);
      },
      [ProductUpdateCategorizationSubType.colors_main]: (update: UpdateDataType, action = UpdateAction.update, productId?: unknown) => {
        const value = ProductCategorizationHelper.prepareCategorizationHandle(
          (<Partial<ProductUpdateColorsData>>update).main_color?.identifier
        );

        return ProductCategorizationShopifyBuilder.prepareMetafieldUpdate(<number>productId, ShopifyCategorizationMetafield.colors_main,
          value, action);
      },
      [ProductUpdateCategorizationSubType.colors_secondary]: (update: UpdateDataType,
                                                              action = UpdateAction.update, productId?: unknown) => {
        const value = ProductCategorizationHelper.prepareCategorizationValueForTree((<ProductUpdateColorsData>update).secondary_colors);

        return ProductCategorizationShopifyBuilder.prepareMetafieldUpdate(<number>productId,
          ShopifyCategorizationMetafield.colors_secondary, value, action);
      },
      [ProductUpdateCategorizationSubType.mediums]: (update: UpdateDataType, action = UpdateAction.update, productId?: unknown) => {
        const value = ProductCategorizationHelper.prepareCategorizationValueForList(
          (<Partial<ProductUpdateMediumsData>>update)?.mediums?.map(m => m.identifier)
        );

        return ProductCategorizationShopifyBuilder.prepareMetafieldUpdate(<number>productId,
          ShopifyCategorizationMetafield.mediums, value, action);
      },
      [ProductUpdateCategorizationSubType.styles]: (update: UpdateDataType, action = UpdateAction.update, productId?: unknown) => {
        const value = ProductCategorizationHelper.prepareCategorizationValueForTree((<ProductUpdateStylesData>update).styles);

        return ProductCategorizationShopifyBuilder.prepareMetafieldUpdate(<number>productId,
          ShopifyCategorizationMetafield.styles, value, action);
      },
    };
  }

  private static prepareMetafieldUpdate(productId: number, key: ShopifyMetafieldName,
                                        value = '', action: UpdateAction): ProductMetafieldUpdateData {
    return {
      productId,
      key,
      namespace: ShopifyMetafieldNamespace.categorization,
      type: ShopifyMetafieldType.string,
      value: action == UpdateAction.update ? value : '',
    };
  }

}
