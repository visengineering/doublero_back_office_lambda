import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch';
import { ChunkedBatchResponse, PartialUpdateObjectResponse } from '@algolia/client-search';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { RequestUtil } from 'common-util/RequestUtil';
import { SecretManagerClient } from 'common-util/aws/SecretManagerClient';

type IndexEnvType = 'PRODUCT_INDEX' | 'ARTIST_INDEX';

export enum INDEX_ENV {
  PRODUCT_CATALOG = 'PRODUCT_INDEX',
  ARTIST = 'ARTIST_INDEX'
}

interface AlgoliaSecret {
  app_id: string;
  api_key: string;
}

export class AlgoliaServiceAbstract {
  private static client: SearchClient | undefined;
  private static indexes: Record<string, SearchIndex> = {};
  private static secret: AlgoliaSecret | undefined;

  private static async getClient(): Promise<SearchClient> {
    if (!this.client) {
      const { api_key, app_id } = await this.getAlgoliaSecret();
      this.client = algoliasearch(app_id, api_key);
    }
    return this.client;
  }

  protected static async getIndex(indexLabel: IndexEnvType): Promise<SearchIndex> {
    if (!(indexLabel in this.indexes)) {
      try {
        const algoliaIndex = RequestUtil.getEnvParam(indexLabel);
        const client = await this.getClient();

        this.indexes[indexLabel] = client.initIndex(algoliaIndex);
      } catch (e) {
        const error = e as Error;
        throw ErrorUtil.communication(`Unable to initialize Algolia ${indexLabel} index: ${error.message}`, error);
      }
    }

    return this.indexes[indexLabel];
  }

  protected static async deleteProductFromIndex(
    objectID: string,
    indexLabel: IndexEnvType
  ){
    try {
      const index = await this.getIndex(indexLabel);
      return index.deleteObject(objectID);
    } catch (e) {
      const error = e as Error;
      throw ErrorUtil.communication(`Error while Deleting Algolia product from index: ${error.message}`, error);
    }
  }

  protected static async updatePartial(
    object: Record<string, string | string[] | number | object | null | boolean>,
    indexLabel: IndexEnvType
  ): Promise<PartialUpdateObjectResponse> {
    try {
      const index = await this.getIndex(indexLabel);

      return index.partialUpdateObject(object, {
        createIfNotExists: false,
      });
    } catch (e) {
      const error = e as Error;
      throw ErrorUtil.communication(`Error while updating Algolia product index: ${error.message}`, error);
    }
  }

  protected static async batchUpdatePartial(
    objects: Record<string, string | string[] | number | object | null | boolean>[],
    indexLabel: IndexEnvType
  ): Promise<ChunkedBatchResponse> {
    try {
      const index = await this.getIndex(indexLabel);

      return index.partialUpdateObjects(objects, {
        createIfNotExists: false,
      });
    } catch (e) {
      const error = e as Error;
      throw ErrorUtil.communication(`Error while updating Algolia product index using batch update: ${error.message}`, error);
    }
  }

  protected static async replaceAll(object: Record<string, string | object | number | null | undefined>[], indexLabel: IndexEnvType)
    : Promise<ChunkedBatchResponse> {
    try {
      const index = await this.getIndex(indexLabel);

      return index.replaceAllObjects(object);
    } catch (e) {
      const error = e as Error;
      throw ErrorUtil.communication(`Error while updating Algolia product index: ${error.message}`, error);
    }
  }

  private static async getAlgoliaSecret(): Promise<AlgoliaSecret> {
    if (!this.secret) {
      const secretName = RequestUtil.getEnvParam('ALGOLIA_SECRET');
      const secret = await SecretManagerClient.getSecretValue(secretName);
      this.secret = JSON.parse(secret);
    }

    if (!this.secret) {
      throw ErrorUtil.configuration('Secret value is missing', ['ALGOLIA_SECRET']);
    }

    return this.secret;
  }
}
