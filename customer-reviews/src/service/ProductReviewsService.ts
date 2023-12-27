import { Page, Sort } from 'common-util/RequestUtil';
import { DataUtil } from 'common-util/DataUtil';
import { DBService } from 'common-db/service/DBService';
import { DBCollection } from 'common-db/DBCollection';
import {
  ProductReviewBase,
  ProductReviewFilters,
  ProductReviewProductType,
  ProductReviewSource,
  ProductReviewWithStats,
  TimeStatsBase
} from '../model/ProductReview';
import { ProductReviewConfig } from '../model/ProductReviewConfig';

export class ProductReviewsService {
  public async getProductReviewsWithPagination(page: Page<never>, query?: string, source?: ProductReviewSource,
                                               productType?: ProductReviewProductType): Promise<Page<ProductReviewWithStats>> {
    const queryOptions: object[] = [];

    if (query) {
      const escapedSearchString = DataUtil.regExpEscape(query);

      queryOptions.push({
        $or: [
          {
            ProductName: {$regex: new RegExp(escapedSearchString, 'i')},
          },
          {
            SKU: {$regex: new RegExp('^' + escapedSearchString)},
          },
        ],
      });
    }

    if (source) {
      queryOptions.push({
        SourceProvider: source,
      });
    }

    if (productType) {
      if (productType === ProductReviewProductType.ARTIST) {
        queryOptions.push({
          $and: [
            {
              Author: {$exists: true, $ne: ''},
            },
          ],
        });
      } else if (productType === ProductReviewProductType.STOCK_PHOTO) {
        queryOptions.push({
          $or: [
            {
              Author: {$exists: false},
            },
            {
              Author: {$exists: true, $eq: null},
            },
          ],
        });
      }
    }

    const productReviewsQuery = queryOptions.length ? {$and: queryOptions} : {};

    const totalCount = await ProductReviewsService.getCountForProductReviewsForStats(productReviewsQuery);
    const currentPage = page.page >= 0 ? page.page : 0;
    const skip = currentPage * page.page_size;

    const productReviewsBase = await ProductReviewsService.getProductReviewsForStats(productReviewsQuery, skip, page.page_size, page.sort);
    const productReviewsWithStats = await this.fillProductReviewsWithStats(productReviewsBase);

    return {
      ...page,
      page: currentPage,
      total_items: totalCount,
      content: productReviewsWithStats,
    };
  }

  private static mapSortFilters(sortObject: Sort = {review_age: -1}): Sort {
    let filterObject = {};
    const sortObjectKeys = Object.keys(sortObject);

    if (sortObjectKeys.length) {
      sortObjectKeys.map((key: string) => {
        if (key === ProductReviewFilters.REVIEWS_AGE) {
          filterObject = {...filterObject, Date: sortObject[key]};
        } else if (key === ProductReviewFilters.PRODUCT_AGE) {
          filterObject = {...filterObject, 'Product.created_at': sortObject[key]};
        } else if (key === ProductReviewFilters.RATING) {
          filterObject = {...filterObject, 'Rating': sortObject[key]};
        } else if (key === ProductReviewFilters.NUMBER_OF_REVIEWS) {
          filterObject = {...filterObject, ReviewsCount: sortObject[key]};
        } else {
          filterObject = {Date: -1};
        }
      });
    } else {
      filterObject = {Date: -1};
    }


    return filterObject;
  }

  private static async getProductReviewsForStats(query: object, skip: number, limit: number,
                                                 sort?: Sort): Promise<ProductReviewBase[]> {
    const productReviewCollection = await DBService.getCollection(DBCollection.PRODUCT_REVIEWS);
    const convertedFilters = ProductReviewsService.mapSortFilters(sort);
    return productReviewCollection.aggregate<ProductReviewBase>([
      {
        $lookup: {
          from: 'products',
          localField: 'SKU',
          foreignField: 'sku',
          as: 'product',
        }
      },
      {$unwind: '$product'},
      {
        $project: {
          _id: 1,
          Images: 1,
          Comments: 1,
          Date: 1,
          Author: 1,
          Rating: 1,
          ProductName: 1,
          SKU: 1,
          OrderID: 1,
          SourceProvider: 1,
          Product: {
            url: '$product.url',
            sku: '$product.sku',
            created_at: '$product.created_at',
            title: '$product.title',
          },
        }
      },
      {$match: query},
      {
        $group: {
          _id: {SKU: '$SKU'},
          Images: {$first: '$Images'},
          Comments: {$first: '$Comments'},
          Date: {$first: '$Date'},
          Author: {$first: '$Author'},
          Rating: {$first: '$Rating'},
          ProductName: {$first: '$ProductName'},
          SKU: {$first: '$SKU'},
          OrderID: {$first: '$OrderID'},
          SourceProvider: {$first: '$SourceProvider'},
          Product: {$first: '$Product'},
          ReviewsCount: {$sum: 1},
        }
      },
      {$sort: convertedFilters},
      {$skip: skip},
      {$limit: limit},
      {$project: {ReviewsCount: 0}}
    ]).toArray();
  }


  private static async getCountForProductReviewsForStats(query: object) {
    const productReviewCollection = await DBService.getCollection(DBCollection.PRODUCT_REVIEWS);
    const uniqueSkus = await productReviewCollection.distinct('SKU', query);
    return uniqueSkus.length;
  }

  private async fillProductReviewsWithStats(productReviewsBase: ProductReviewBase[]): Promise<ProductReviewWithStats[]> {
    const start = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    const end = new Date();

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    const skus = productReviewsBase.reduce((acc: string[], item) => {
      return [...acc, item.SKU];
    }, []);

    const productReviewsAllTimeStats = await ProductReviewsService.getReviewTimeStats(null, skus);
    const productReviewsLast7DaysStats = await ProductReviewsService.getReviewTimeStats({start, end}, skus);
    return productReviewsBase.map((productReview) => {
      const productReviewStatsAllTime = productReviewsAllTimeStats.find((item) => productReview['_id']['SKU'] === item['_id']['SKU']);
      const productReviewStats7Days = productReviewsLast7DaysStats.find((item) => productReview['_id']['SKU'] === item['_id']['SKU']);

      return {
        ...productReview,
        avgAllTime: productReviewStatsAllTime ? {
          RatingAverage: +productReviewStatsAllTime?.RatingAverage.toPrecision(2) || 0,
          ReviewsCount: productReviewStatsAllTime?.ReviewsCount || 0,
        } : {},
        avgLast7Day: productReviewStats7Days ? {
          RatingAverage: +productReviewStats7Days?.RatingAverage.toPrecision(2) || 0,
          ReviewsCount: productReviewStats7Days?.ReviewsCount || 0,
        } : {},
      };
    });
  }

  private static async getReviewTimeStats(dateFilter: { start: Date; end: Date } | null, skus: string[]): Promise<TimeStatsBase[]> {
    const productReviewCollection = await DBService.getCollection(DBCollection.PRODUCT_REVIEWS);

    const options: { $and: object[] } = {$and: [{SKU: {$in: skus}}]};
    if (dateFilter) {
      options.$and.push(
        {
          Date: {
            $gte: dateFilter.start,
            $lte: dateFilter.end
          }
        }
      );
    }
    return productReviewCollection.aggregate<TimeStatsBase>()
      .match(options)
      .group({
        _id: {SKU: '$SKU'},
        RatingAverage: {$avg: '$Rating'},
        ReviewsCount: {$sum: 1},
      })
      .toArray();
  }

  public async getReviewsBySku(page: Page<never>, sku: string): Promise<Page<ProductReviewBase>> {
    const totalCount = await ProductReviewsService.getReviewsCountBySku(sku);
    const currentPage = page.page >= 0 ? page.page : 0;
    const skip = currentPage * page.page_size;
    const sort = ProductReviewsService.mapSortFilters(page?.sort);
    const productReviewCollection = await DBService.getCollection(DBCollection.PRODUCT_REVIEWS);
    const reviewItems = await productReviewCollection
      .find<ProductReviewBase>({SKU: sku})
      .sort(sort)
      .skip(skip)
      .limit(page.page_size)
      .toArray();

    return {
      ...page,
      page: currentPage,
      total_items: totalCount,
      content: reviewItems,
    };
  }

  private static async getReviewsCountBySku(sku: string) {
    const productReviewCollection = await DBService.getCollection(DBCollection.PRODUCT_REVIEWS);
    return productReviewCollection.count({SKU: sku});
  }

  public async getReviewsConfigs() {
    const productReviewConfigsCollection = await DBService.getCollection(DBCollection.PRODUCT_REVIEW_CONFIGS);
    return productReviewConfigsCollection.find<ProductReviewConfig>({}).toArray();
  }

  public async updateReviewsConfigs(reviewConfigs: ProductReviewConfig[]) {
    const productReviewConfigsCollection = await DBService.getCollection(DBCollection.PRODUCT_REVIEW_CONFIGS);
    const productReviewsConfigUpdates = [];
    for (const config of reviewConfigs) {
      const nameKey = config['Name'];
      let updateValue = config['Value'];
      if (Array.isArray(updateValue)) {
        updateValue = updateValue.join(',');
      }
      updateValue = updateValue.toString();
      productReviewsConfigUpdates.push(
        {
          updateOne: {
            filter: {Name: nameKey},
            update: {$set: {Value: updateValue}}
          }
        }
      );
    }
    await productReviewConfigsCollection.bulkWrite(productReviewsConfigUpdates);
  }
}
