import { DBService } from 'common-db/service/DBService';
import { DBCollection } from 'common-db/DBCollection';
import { ProductSales } from '../../model/Product';

export class ProductService {
  public static async getProductSales(sku?: string, days = 89): Promise<ProductSales[]> {
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);

    const orders = await DBService.getCollection(DBCollection.ORDERS);

    return await orders.aggregate()
      .match({
        OrderDate: {
          $gt: start,
          $lt: end
        },
        ...(sku && { 'Items.sku': sku }),
      })
      .unwind('$Items')
      .group({
        _id: '$Items.sku',
        count: {
          $sum: '$Items.Quantity',
        },
      })
      .project<ProductSales>({
        _id: 0,
        sku: '$_id',
        sales: '$count',
      })
      .toArray();
  }

  public async getProductTypes(): Promise<string[]> {
    const collection = await DBService.getCollection(DBCollection.PRODUCT_TYPES);

    return await collection.distinct('name');
  }

  public static async getProductColors(colorIds?: string[]): Promise<string[]> {
    if (!colorIds) {
      return [];
    }

    return (await DBService.getCollection(DBCollection.COLORS)).distinct('colorName', { _id: { $in: colorIds.map(DBService.newId)}});
  }
}
