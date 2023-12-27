import { FeedLog } from '../../model/FeedLog';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { DBService } from 'common-db/service/DBService';
import { DBCollection } from 'common-db/DBCollection';
import { Page } from 'common-util/RequestUtil';

export class FeedLogsService {

  static prepareLog(name: string, caller: string, items = 0, success = true): FeedLog {
    return {
      date: new Date(),
      name,
      items,
      success,
      url: caller,
      execution_time: ''
    };
  }

  static async saveFeedLog(log: FeedLog): Promise<void> {
    try {
      const collection = await DBService.getCollection(DBCollection.FEED_LOGS);

      await collection.insertOne(log);
    } catch (err) {
      throw ErrorUtil.communication(`Feed log save failed: ${(<Error>err).message}`, <Error>err);
    }
  }

  public async getFeedLogs(page: Page<never>, name: string, title: string): Promise<Page<FeedLog>> {
    try {
      const collection = await DBService.getCollection(DBCollection.FEED_LOGS);
      const limit = page.page_size;
      const skip = page.page * limit;

      const filterQuery = {
        ...(title && { url: title }),
        ...(name && { name: name })
      };
      const feedLogs = await collection.find<FeedLog>(filterQuery)
        .skip(skip)
        .limit(limit)
        .toArray();

      const feedLogsCount = await collection.find<FeedLog>(filterQuery).count();

      return {
        total_items: feedLogsCount,
        page_size: page.page_size,
        page: page.page,
        content: feedLogs,
      };

    } catch (err) {
      const error = <Error>err;
      throw ErrorUtil.communication(`Feed logs get request failed: ${error.message}`, error);
    }
  }

  public async getFeedLogFilters(): Promise<{ [n: string]: string[] }> {
    try {
      const collection = await DBService.getCollection(DBCollection.FEED_LOGS);
      const feedLogDocuments = await collection.aggregate([
        {
          $group: {
            _id: { name: '$name' },
            titles: { $addToSet: '$url' }
          }
        }
      ]).toArray();

      return feedLogDocuments.reduce((acc, currentValue) => {
        acc[currentValue._id.name] = currentValue.titles;
        return acc;
      }, {});
    } catch (err) {
      throw ErrorUtil.communication(`Feed log get filters request failed: ${(<Error>err).message}`, <Error>err);
    }
  }
}
