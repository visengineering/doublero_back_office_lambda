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
  TreeUpdateData,
  Update,
  UpdateAction,
} from '../../../../model/ProductUpdate';
import type { Atmosphere, Business, Color, Medium, Style } from '../../../../model/Product';
import { DataUtil } from 'common-util/DataUtil';
import { DBObjectId, DBService } from 'common-db/service/DBService';
import { DBCollection } from 'common-db/DBCollection';
import { ProductDBService } from 'common-db/service/ProductDBService';
import { Category, HierarchicalEntity, Product, ProductExtras } from 'common-db/model/Product';
import { ProductLoaders, ProductUpdateBuilder } from '../../ProductUpdateBuilder';

export class ProductCategorizationUpdateBuilder extends ProductUpdateBuilder {

  protected updateType(): ProductUpdateType {
    return ProductUpdateType.categorization;
  }

  protected loaders(): ProductLoaders {
    return {
      [ProductUpdateCategorizationSubType.artist]: (product: Product) => {
        return this.prepareArtistUpdates(product?.extra_data?.find(extra => extra));
      },
      [ProductUpdateCategorizationSubType.atmospheres]: (product: Product) => {
        return this.prepareAtmospheresUpdates(product?.extra_data?.find(extra => extra));
      },
      [ProductUpdateCategorizationSubType.businesses]: (product: Product) => {
        return this.prepareBusinessesUpdates(product?.extra_data?.find(extra => extra));
      },
      [ProductUpdateCategorizationSubType.personas]: (product: Product) => {
        return this.preparePersonasUpdates(product?.extra_data?.find(extra => extra));
      },
      [ProductUpdateCategorizationSubType.occasions]: (product: Product) => {
        return this.prepareOccasionsUpdates(product?.extra_data?.find(extra => extra));
      },
      [ProductUpdateCategorizationSubType.categories_main]: (product: Product) => {
        return this.prepareMainCategoryUpdates(product?.extra_data?.find(extra => extra));
      },
      [ProductUpdateCategorizationSubType.categories_guest]: (product: Product) => {
        return this.prepareGuestCategoriesUpdates(product?.extra_data?.find(extra => extra));
      },
      [ProductUpdateCategorizationSubType.categories_all]: (product: Product) => {
        return this.prepareAllCategoriesUpdates(product?.extra_data?.find(extra => extra));
      },
      [ProductUpdateCategorizationSubType.colors_main]: (product: Product) => {
        return this.prepareMainColorUpdates(product?.extra_data?.find(extra => extra));
      },
      [ProductUpdateCategorizationSubType.colors_secondary]: (product: Product) => {
        return this.prepareSecondaryColorsUpdates(product?.extra_data?.find(extra => extra));
      },
      [ProductUpdateCategorizationSubType.mediums]: (product: Product) => {
        return this.prepareMediumsUpdates(product?.extra_data?.find(extra => extra));
      },
      [ProductUpdateCategorizationSubType.styles]: (product: Product) => {
        return this.prepareStylesUpdates(product?.extra_data?.find(extra => extra));
      },
    };
  }

  private async prepareMainCategoryUpdates(extras: ProductExtras | undefined): Promise<Update> {
    const update: Update = this.prepareUpdate(ProductUpdateType.categorization, ProductUpdateCategorizationSubType.categories_main);

    if (extras?.main_category?._id) {
      const categories = await ProductDBService.loadCategoryTree([extras.main_category._id]);

      if (categories.length > 0) {
        // noinspection UnnecessaryLocalVariableJS
        const data: ProductUpdateCategoriesData = {
          main_category: ProductCategorizationUpdateBuilder.prepareCategoryUpdateData(categories[0]),
        };
        update.data = data;
        update.action = UpdateAction.update;
      }
    }

    return update;
  }

  private async prepareGuestCategoriesUpdates(extras: ProductExtras | undefined): Promise<Update> {
    const update: Update = this.prepareUpdate(ProductUpdateType.categorization, ProductUpdateCategorizationSubType.categories_guest);

    if (extras?.guest_categories?.length) {
      const categories = await ProductDBService.loadCategoryTree(extras.guest_categories.map(c => c._id));

      if (categories.length > 0) {
        // noinspection UnnecessaryLocalVariableJS
        const data: ProductUpdateCategoriesData = {
          guest_categories: categories.map(category => ProductCategorizationUpdateBuilder.prepareCategoryUpdateData(category)),
        };
        update.data = data;
        update.action = UpdateAction.update;
      }
    }

    return update;
  }

  private async prepareAllCategoriesUpdates(extras: ProductExtras | undefined): Promise<Update> {
    const update: Update = this.prepareUpdate(ProductUpdateType.categorization, ProductUpdateCategorizationSubType.categories_all);

    const categoryAllIds = [];
    if (extras?.guest_categories?.length) {
      extras.guest_categories.map(c => categoryAllIds.push(c._id));
    }
    if (extras?.main_category?._id) {
      categoryAllIds.push(extras.main_category._id);
    }

    if (categoryAllIds.length) {
      const categoriesAll = await ProductDBService.loadCategoryTree([...new Set(categoryAllIds)]);

      if (categoriesAll.length > 0) {
        // noinspection UnnecessaryLocalVariableJS
        const data: ProductUpdateCategoriesData = {
          categories_all: categoriesAll.map(category => ProductCategorizationUpdateBuilder.prepareCategoryUpdateData(category)),
        };
        update.data = data;
        update.action = UpdateAction.update;
      }
    }

    return update;
  }

  private static async loadStylesTree(ids: DBObjectId[]): Promise<Style[]> {
    const collection = await DBService.getCollection(DBCollection.STYLES);
    return await collection.aggregate<Style>([
      {
        $match: { _id: { $in: ids } },
      },
      {
        $graphLookup: {
          from: DBCollection.STYLES,
          startWith: '$parent',
          connectFromField: 'parent',
          connectToField: '_id',
          as: 'parents',
          maxDepth: 5,
          depthField: 'level'
        }
      },
      {
        $project: {
          _id: 0,
          name: 1,
          identifier: 1,
          parents: {
            name: 1,
            identifier: 1,
            level: 1
          },
        }
      }
    ]).toArray() || [];
  }

  private async prepareStylesUpdates(extras: ProductExtras | undefined): Promise<Update> {
    const update: Update = this.prepareUpdate(ProductUpdateType.categorization, ProductUpdateCategorizationSubType.styles);

    if (extras?.collection_styles?.length) {
      const styles = await ProductCategorizationUpdateBuilder.loadStylesTree(extras.collection_styles.map(style => style._id));

      if (styles.length > 0) {
        // noinspection UnnecessaryLocalVariableJS
        const data: ProductUpdateStylesData = {
          styles: styles.map(style => ProductCategorizationUpdateBuilder.prepareTreeUpdateData(style)),
        };
        update.data = data;
        update.action = UpdateAction.update;
      }
    }

    return update;
  }

  private static async loadAtmospheres(ids: DBObjectId[]): Promise<Atmosphere[]> {
    const collection = await DBService.getCollection(DBCollection.ATMOSPHERES);
    return await collection.find<Atmosphere>(
      {
        _id: { $in: ids }
      }, {
      projection: {
        _id: 0,
        name: 1,
        identifier: 1,
      }
    }
    ).toArray() || [];
  }

  private async prepareAtmospheresUpdates(extras: ProductExtras | undefined): Promise<Update> {
    const update: Update = this.prepareUpdate(ProductUpdateType.categorization, ProductUpdateCategorizationSubType.atmospheres);

    if (extras?.atmospheres?.length) {
      const atmospheres = await ProductCategorizationUpdateBuilder.loadAtmospheres(extras.atmospheres.map(atmosphere => atmosphere._id));

      if (atmospheres.length > 0) {
        // noinspection UnnecessaryLocalVariableJS
        const data: ProductUpdateAtmospheresData = {
          atmospheres: atmospheres.map(atmosphere => ({
            identifier: atmosphere.identifier,
            name: atmosphere.name
          })),
        };
        update.data = data;
        update.action = UpdateAction.update;
      }
    }

    return update;
  }

  private static async loadMediums(ids: DBObjectId[]): Promise<Medium[]> {
    const collection = await DBService.getCollection(DBCollection.MEDIUMS);
    return await collection.find<Medium>(
      {
        _id: { $in: ids }
      }, {
      projection: {
        _id: 0,
        name: 1,
        identifier: 1,
      }
    }
    ).toArray() || [];
  }

  private async prepareMediumsUpdates(extras: ProductExtras | undefined): Promise<Update> {
    const update: Update = this.prepareUpdate(ProductUpdateType.categorization, ProductUpdateCategorizationSubType.mediums);

    if (extras?.mediums?.length) {
      const mediums = await ProductCategorizationUpdateBuilder.loadMediums(extras.mediums.map(medium => medium._id));

      // noinspection UnnecessaryLocalVariableJS
      const data: ProductUpdateMediumsData = {
        mediums: mediums.map(medium => ({
          identifier: medium.identifier,
          name: medium.name
        })),
      };
      update.data = data;
      update.action = UpdateAction.update;
    }

    return update;
  }

  private static async loadCollectionTree(ids: DBObjectId[], dbCollection: DBCollection): Promise<Business[]> {
    const collection = await DBService.getCollection(dbCollection);
    return await collection.aggregate<Business>([
      {
        $match: { _id: { $in: ids } },
      },
      {
        $graphLookup: {
          from: dbCollection,
          startWith: '$parent',
          connectFromField: 'parent',
          connectToField: '_id',
          as: 'parents',
          maxDepth: 7,
          depthField: 'level'
        }
      },
      {
        $project: {
          _id: 0,
          name: 1,
          identifier: 1,
          parents: {
            name: 1,
            identifier: 1,
            level: 1
          },
        }
      }
    ]).toArray() || [];
  }

  private async prepareBusinessesUpdates(extras: ProductExtras | undefined): Promise<Update> {
    const update: Update = this.prepareUpdate(ProductUpdateType.categorization, ProductUpdateCategorizationSubType.businesses);

    if (extras?.businesses?.length) {
      const businesses = await ProductCategorizationUpdateBuilder.loadCollectionTree(
        extras.businesses.map(business => business._id),
        DBCollection.BUSINESSES
      );

      if (businesses.length > 0) {
        // noinspection UnnecessaryLocalVariableJS
        const data: ProductUpdateBusinessesData = {
          businesses: businesses.map(business => ProductCategorizationUpdateBuilder.prepareTreeUpdateData(business))
        };
        update.data = data;
        update.action = UpdateAction.update;
      }
    }

    return update;
  }

  private async preparePersonasUpdates(extras: ProductExtras | undefined): Promise<Update> {
    const update: Update = this.prepareUpdate(ProductUpdateType.categorization, ProductUpdateCategorizationSubType.personas);

    if (extras?.personas?.length) {
      const personas = await ProductCategorizationUpdateBuilder.loadCollectionTree(
        extras.personas.map(persona => persona._id),
        DBCollection.PERSONAS,
      );

      if (personas.length > 0) {
        // noinspection UnnecessaryLocalVariableJS
        const data: ProductUpdatePersonasData = {
          personas: personas.map(persona => ProductCategorizationUpdateBuilder.prepareTreeUpdateData(persona))
        };
        update.data = data;
        update.action = UpdateAction.update;
      }
    }

    return update;
  }

  private async prepareOccasionsUpdates(extras: ProductExtras | undefined): Promise<Update> {
    const update: Update = this.prepareUpdate(ProductUpdateType.categorization, ProductUpdateCategorizationSubType.occasions);

    if (extras?.occasions?.length) {
      const occasions = await ProductCategorizationUpdateBuilder.loadCollectionTree(
        extras.occasions.map(occasion => occasion._id),
        DBCollection.OCCASIONS,
      );

      if (occasions.length > 0) {
        // noinspection UnnecessaryLocalVariableJS
        const data: ProductUpdateOccasionsData = {
          occasions: occasions.map(occasion => ProductCategorizationUpdateBuilder.prepareTreeUpdateData(occasion))
        };
        update.data = data;
        update.action = UpdateAction.update;
      }
    }

    return update;
  }

  private static async loadColorsTree(ids: DBObjectId[]): Promise<Color[]> {
    const collection = await DBService.getCollection(DBCollection.COLORS);
    return await collection.aggregate<Color>([
      {
        $match: { _id: { $in: ids } },
      },
      {
        $lookup: {
          from: DBCollection.COLORS,
          let: { multiLevelColorParent: '$multiLevelColorParent' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$multiLevelColorParent' }] } } },
            { $project: { _id: 0, name: '$colorName', identifier: 1 } }
          ],
          as: 'parents'
        }
      },
      {
        $project: {
          _id: 0,
          name: '$colorName',
          identifier: 1,
          parents: 1,
        }
      }
    ]).toArray() || [];
  }

  private static capitalizeColorNames(color: Color): Color {
    return ({
      ...color,
      name: DataUtil.capitalizeFirstLettersForSentence(color.name),
      parents: color?.parents?.length ? color.parents.map(parentColor => ({
        ...parentColor,
        name: DataUtil.capitalizeFirstLettersForSentence(parentColor.name),
      }))
        : []
    });
  }

  private async prepareMainColorUpdates(extras: ProductExtras | undefined): Promise<Update> {
    const update: Update = this.prepareUpdate(ProductUpdateType.categorization, ProductUpdateCategorizationSubType.colors_main);

    if (extras?.collection_main_color) {
      const mainColors = DBService.isValidId(extras.collection_main_color)
        ? await ProductCategorizationUpdateBuilder.loadColorsTree([DBService.newId(extras.collection_main_color)])
        : [];

      const mainColorsCapitalized = mainColors.map(color => ProductCategorizationUpdateBuilder.capitalizeColorNames(color));
      if (mainColorsCapitalized.length > 0) {
        // noinspection UnnecessaryLocalVariableJS
        const data: ProductUpdateColorsData = {
          main_color: ProductCategorizationUpdateBuilder.prepareTreeUpdateData(mainColorsCapitalized[0]),
        };
        update.data = data;
        update.action = UpdateAction.update;
      }
    }

    return update;
  }

  private async prepareSecondaryColorsUpdates(extras: ProductExtras | undefined): Promise<Update> {
    const update: Update = this.prepareUpdate(ProductUpdateType.categorization, ProductUpdateCategorizationSubType.colors_secondary);

    if (extras?.cloudinaryColors?.length) {
      const ids = extras.cloudinaryColors
        .filter(c => DBService.isValidId(c))
        .map(c => DBService.newId(c));
      const colors = ids.length > 0
        ? await ProductCategorizationUpdateBuilder.loadColorsTree(ids)
        : [];
      const colorsCapitalized = colors.map(color => ProductCategorizationUpdateBuilder.capitalizeColorNames(color));

      if (colorsCapitalized.length > 0) {
        // noinspection UnnecessaryLocalVariableJS
        const data: ProductUpdateColorsData = {
          secondary_colors: colorsCapitalized.map(color => ProductCategorizationUpdateBuilder.prepareTreeUpdateData(color)),
        };
        update.data = data;
        update.action = UpdateAction.update;
      }
    }

    return update;
  }

  private async prepareArtistUpdates(extras?: ProductExtras): Promise<Update> {
    const update: Update = this.prepareUpdate(ProductUpdateType.categorization, ProductUpdateCategorizationSubType.artist);

    if (extras?.displayed_artist) {
      // noinspection UnnecessaryLocalVariableJS
      const data: ProductUpdateArtistData = {
        name: extras.displayed_artist,
        identifier: DataUtil.getUrlHandle(extras.displayed_artist),
      };
      update.data = data;
      update.action = UpdateAction.update;
    }

    return update;
  }

  private static prepareTreeUpdateData(entity: HierarchicalEntity): TreeUpdateData {
    const parents = (entity.parents || []).map(parent => ({
      name: parent.name,
      identifier: parent.identifier,
      level: parent.level as number,
    }));
    return {
      name: entity.name,
      identifier: entity.identifier,
      ...(parents.length > 0 && { parents: parents })
    };
  }

  private static prepareCategoryUpdateData(category: Category): TreeUpdateData {
    const data = this.prepareTreeUpdateData(category);

    if (category.suffix) data.suffix = category.suffix;
    if (category.slug) data.slug = category.slug.startsWith('/') ? category.slug.substring(1) : category.slug;
    if (category.parents && category.parents.length > 0) {
      const parents = data.parents as TreeUpdateData[];
      category.parents.forEach((cat, index) => {
        if (cat.suffix) parents[index].suffix = cat.suffix;
        if (cat.slug) parents[index].slug = cat.slug.startsWith('/') ? cat.slug.substring(1) : cat.slug;
      });
    }

    return data;
  }
}
