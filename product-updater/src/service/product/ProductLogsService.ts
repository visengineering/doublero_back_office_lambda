import { ErrorUtil } from 'common-util/ErrorUtil';
import { DBService } from 'common-db/service/DBService';
import { DBCollection } from 'common-db/DBCollection';
import { ProductChangeLog } from '../../model/Product';

export class ProductLogsService {

  private static prepareLog(sku: string, action: string, details = '', caller = 'product_updater'): ProductChangeLog {
    return {
      date: new Date(),
      sku,
      action,
      details,
      user_name: caller,
    };
  }

  public static async saveLog(sku: string, action: string, details = '', execution_id?: string): Promise<void> {
    try {
      const log = this.prepareLog(sku, action, details);
      log.execution_id = execution_id;

      const collection = await DBService.getCollection(DBCollection.PRODUCTS_CHANGE_LOGS);

      await collection.insertOne(log);
    } catch (err) {
      const error = <Error>err;
      throw ErrorUtil.communication(`Feed log save failed: ${error.message}`, error);
    }
  }
}
