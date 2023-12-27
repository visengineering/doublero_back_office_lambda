import { DBDocument, DBObjectId, DBService } from './DBService';
import { Category, Product, ProductStatus, ProductTag } from '../model/Product';
import { DBCollection } from '../DBCollection';
import { ErrorUtil } from 'common-util/ErrorUtil';

export class ProductDBService {

  private static readonly PRODUCT_SUFFIXES = [
    ' Multi Panel Canvas Wall Art',
    ' Multi Panel Canvas',
    ' Canvas Wall Art',
    ' Canvas Set Wall Art',
    ' Wall Art',
  ];

  public static async getProduct(sku: string, projection: DBDocument): Promise<Product> {
    const productsCollection = await DBService.getCollection(DBCollection.PRODUCTS);
    const products = await productsCollection.aggregate<Product>([
      {
        $match: {
          sku,
          status: ProductStatus.live
        }
      },
      {
        $lookup: {
          from: DBCollection.PRODUCT_EXTRAS,
          localField: 'extras',
          foreignField: '_id',
          as: 'extra_data'
        }
      },
      {
        $project: projection
      }
    ])
      .limit(1)
      .toArray();

    if (!products.length) {
      throw ErrorUtil.notFound(`Product with SKU=${sku} and status=${ProductStatus.live} was not found`);
    }

    return products[0];
  }

  public static cleanProductTitle(title = ''): string {
    for (const suffix of this.PRODUCT_SUFFIXES) {
      title = title.replace(suffix, '');
    }

    return title;
  }

  public static async loadCategoryTree(ids: DBObjectId[]): Promise<Category[]> {
    const collection = await DBService.getCollection(DBCollection.CATEGORIES);
    const documents = await collection.aggregate([
      {
        $match: { _id: { $in: ids } },
      },
      {
        $graphLookup: {
          from: DBCollection.CATEGORIES,
          startWith: '$parent',
          connectFromField: 'parent',
          connectToField: '_id',
          as: 'parents',
          maxDepth: 10,
          depthField: 'level',
        }
      },
      {
        $project: {
          _id: 0,
          name: 1,
          slug: 1,
          suffix: 1,
          status: 1,
          parents: {
            name: 1,
            slug: 1,
            status: 1,
            suffix: 1,
            level: 1
          },
        }
      }
    ]).toArray() || [];

    let categories = documents as Category[];

    if (categories.length) {
      categories = categories.map((category: Category) => {
        if (category.parents?.length) {
          category.parents = category.parents
            .sort((a, b) => {
              const paramA = a?.level || 0;
              const paramB = b?.level || 0;
              return paramA - paramB;
            })
            .filter((parent) => parent.status === 'Live')
            .map((elem, index) => ({ ...elem, level: index }));
        }

        if (category.status === 'Draft' && category.parents?.length) {
          const newCategory = { ...category.parents[0] };
          delete newCategory.level;
          newCategory.parents = category.parents
            .filter(c => c.identifier !== newCategory.identifier)
            .map((item, index) => ({ ...item, level: index }));

          return newCategory;
        }
        return category;
      });
    }
    return categories.filter(category => (category.status === 'Live' || !!category.parents?.length));
  }

  public static filterProductTags(productTags: ProductTag[] ): string[] {
    return productTags.filter(tag => tag?.export !== false && tag?.pending !== true)
      .map(tag => tag.name) || [];
  }
}
