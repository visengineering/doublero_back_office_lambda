import { Collection, Document, MongoClient, ObjectId } from 'mongodb';
import { SecretManagerClient } from 'common-util/aws/SecretManagerClient';
import { RequestUtil } from 'common-util/RequestUtil';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { DBCollection } from '../DBCollection';
import { ObjectIdLike } from 'bson';

export type DBClient = MongoClient;
export type DBObjectId = ObjectId;
export type DBCollectionObject = Collection;
export type DBDocument = Document;

export class DBService {
  private static client: MongoClient;
  private static clientPromise: Promise<void>;

  static init(): void {
    DBService.clientPromise = DBService.initDBConnection();
  }

  private static async initDBConnection(): Promise<void> {
    console.time('Getting DB Secret');
    const dbSecret = await SecretManagerClient.getSecretValue(RequestUtil.getEnvParam('DB_ACCESS_SECRET'));
    const url = JSON.parse(dbSecret)['url'];
    if (!url) throw ErrorUtil.configuration('DB connection URL is not configured', ['mongo db url']);
    console.timeEnd('Getting DB Secret');

    console.time('DB Connect');
    DBService.client = await MongoClient.connect(url);
    console.timeEnd('DB Connect');
  }

  public static async getClient(): Promise<MongoClient> {
    try {
      if (!this.clientPromise) this.init();

      await DBService.clientPromise;
    } catch (e) {
      const error = e as Error;
      throw ErrorUtil.communication(`DB connection was not established: ${error.message}`, error);
    }

    return this.client;
  }

  public static async getCollection(collection: DBCollection): Promise<Collection<object>> {
    const client = await this.getClient();

    return client.db().collection(collection);
  }

  public static isValidId(id: number | string | ObjectId | Uint8Array | ObjectIdLike): boolean {
    return ObjectId.isValid(id);
  }

  public static newId(id: string): ObjectId {
    return new ObjectId(id);
  }

}
