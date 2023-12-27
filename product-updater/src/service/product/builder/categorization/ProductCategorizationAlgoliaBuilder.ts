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
  AlgoliaProductAllCategoryType,
  AlgoliaProductArtistType,
  AlgoliaProductAtmosphereType,
  AlgoliaProductBusinessesType,
  AlgoliaProductColorsMainType,
  AlgoliaProductColorsSecondaryType,
  AlgoliaProductGuestCategoryType,
  AlgoliaProductMainCategoryType,
  AlgoliaProductMediumsType,
  AlgoliaProductOccasionsType,
  AlgoliaProductPersonasType,
  AlgoliaProductStylesType
} from '../../../../model/Algolia';
import { AlgoliaTransformers, AlgoliaUpdateBuilder } from '../../algolia/AlgoliaUpdateBuilder';
import { ProductCategorizationHelper } from './ProductCategorizationHelper';

export class ProductCategorizationAlgoliaBuilder extends AlgoliaUpdateBuilder {

  protected updateType(): ProductUpdateType {
    return ProductUpdateType.categorization;
  }

  protected transformers(): AlgoliaTransformers {
    return {
      [ProductUpdateCategorizationSubType.artist]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductCategorizationAlgoliaBuilder.prepareAristUpdate(<ProductUpdateArtistData>data, action);
      },
      [ProductUpdateCategorizationSubType.atmospheres]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductCategorizationAlgoliaBuilder.prepareAtmospheresUpdate(<ProductUpdateAtmospheresData>data, action);
      },
      [ProductUpdateCategorizationSubType.businesses]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductCategorizationAlgoliaBuilder.prepareBusinessesUpdate(<ProductUpdateBusinessesData>data, action);
      },
      [ProductUpdateCategorizationSubType.personas]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductCategorizationAlgoliaBuilder.preparePersonasUpdate(<ProductUpdatePersonasData>data, action);
      },
      [ProductUpdateCategorizationSubType.occasions]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductCategorizationAlgoliaBuilder.prepareOccasionsUpdate(<ProductUpdateOccasionsData>data, action);
      },
      [ProductUpdateCategorizationSubType.categories_guest]: () => {
        return ProductCategorizationAlgoliaBuilder.prepareGuestCategoriesUpdate();
      },
      [ProductUpdateCategorizationSubType.categories_main]: () => {
        return ProductCategorizationAlgoliaBuilder.prepareMainCategoriesUpdate();
      },
      [ProductUpdateCategorizationSubType.categories_all]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductCategorizationAlgoliaBuilder.prepareAllCategoriesUpdate(<ProductUpdateCategoriesData>data, action);
      },
      [ProductUpdateCategorizationSubType.colors_main]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductCategorizationAlgoliaBuilder.prepareMainColorUpdate(<ProductUpdateColorsData>data, action);
      },
      [ProductUpdateCategorizationSubType.colors_secondary]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductCategorizationAlgoliaBuilder.prepareSecondaryColorsUpdate(<ProductUpdateColorsData>data, action);
      },
      [ProductUpdateCategorizationSubType.mediums]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductCategorizationAlgoliaBuilder.prepareMediumsUpdate(<ProductUpdateMediumsData>data, action);
      },
      [ProductUpdateCategorizationSubType.styles]: (data: UpdateDataType, action = UpdateAction.update) => {
        return ProductCategorizationAlgoliaBuilder.prepareStylesUpdate(<ProductUpdateStylesData>data, action);
      },
    };
  }

  private static prepareAristUpdate(data?: ProductUpdateArtistData, action = UpdateAction.update): AlgoliaProductArtistType {
    if (action == UpdateAction.delete) return { artist_name: '' };

    return {
      artist_name: data?.name || ''
    };
  }

  private static prepareAtmospheresUpdate(data?: ProductUpdateAtmospheresData,
    action = UpdateAction.update): AlgoliaProductAtmosphereType {
    if (action == UpdateAction.delete) return { extra_atmospheres: [] };

    return {
      extra_atmospheres: ProductCategorizationHelper.transformTreeToArray(data?.atmospheres) || []
    };
  }

  private static prepareBusinessesUpdate(data?: ProductUpdateBusinessesData,
    action = UpdateAction.update): AlgoliaProductBusinessesType {
    return ProductCategorizationHelper.transformTreeToNestedObject(
      action == UpdateAction.update ? data?.businesses || [] : [],
      'extra_businesses_lv',
      3);
  }

  private static preparePersonasUpdate(data?: ProductUpdatePersonasData,
    action = UpdateAction.update): AlgoliaProductPersonasType {
    return ProductCategorizationHelper.transformTreeToNestedObject(
      action == UpdateAction.update ? data?.personas || [] : [],
      'extra_personas_lv',
      3);
  }

  private static prepareOccasionsUpdate(data?: ProductUpdateOccasionsData,
    action = UpdateAction.update): AlgoliaProductOccasionsType {
    return ProductCategorizationHelper.transformTreeToNestedObject(
      action == UpdateAction.update ? data?.occasions || [] : [],
      'extra_occasions_lv',
      3);
  }

  private static prepareGuestCategoriesUpdate(): AlgoliaProductGuestCategoryType {
    return ProductCategorizationHelper.transformTreeToNestedObject([], 'extra_guest_categories_lv', 6);
  }

  private static prepareMainCategoriesUpdate(): AlgoliaProductMainCategoryType {
    return ProductCategorizationHelper.transformTreeToFlatObject(undefined, 'extra_main_category_lv', 6);
  }

  private static prepareAllCategoriesUpdate(data?: ProductUpdateCategoriesData,
    action = UpdateAction.update): AlgoliaProductAllCategoryType {
    return ProductCategorizationHelper.transformTreeToNestedObject(
      action == UpdateAction.update ? data?.categories_all || [] : [],
      'extra_all_categories_lv',
      6);
  }

  private static prepareMainColorUpdate(data?: ProductUpdateColorsData,
    action = UpdateAction.update): AlgoliaProductColorsMainType {
    return ProductCategorizationHelper.transformTreeToFlatObject(
      action == UpdateAction.update ? data?.main_color : undefined,
      'extra_colors_main_lv',
      2);
  }

  private static prepareSecondaryColorsUpdate(data?: ProductUpdateColorsData,
    action = UpdateAction.update): AlgoliaProductColorsSecondaryType {
    return ProductCategorizationHelper.transformTreeToNestedObject(
      action == UpdateAction.update ? data?.secondary_colors || [] : [],
      'extra_colors_secondary_lv',
      2);
  }

  private static prepareMediumsUpdate(data?: ProductUpdateMediumsData,
    action = UpdateAction.update): AlgoliaProductMediumsType {
    if (action == UpdateAction.delete) return { extra_mediums: [] };

    return {
      extra_mediums: ProductCategorizationHelper.transformTreeToArray(data?.mediums) || []
    };
  }

  private static prepareStylesUpdate(data?: ProductUpdateStylesData, action = UpdateAction.update): AlgoliaProductStylesType {
    return ProductCategorizationHelper.transformTreeToNestedObject(
      action == UpdateAction.update ? data?.styles || [] : [],
      'extra_styles_lv',
      3);
  }
}
