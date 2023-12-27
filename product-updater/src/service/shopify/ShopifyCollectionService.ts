import { ErrorUtil } from 'common-util/ErrorUtil';
import { CollectionInput, GraphqlCollectionCreate, GraphqlCollectionCreateResponse, GraphqlCollectionUpdate, GraphqlCollectionUpdateResponse, Publication } from '../../model/Shopify';
import { ShopifyService } from './ShopifyService';

export const ARTISTS_COLLECTION_TEMPLATE_SUFFIX = 'algolia.artist';

export class ShopifyCollectionService extends ShopifyService {
  private static publications: Publication[];

  public static async createShopifyCollection(data: CollectionInput): Promise<GraphqlCollectionCreate> {
    const client = await this.getClient();

    const input = {
      input: data
    };

    try {
      const query = `mutation collectionCreate($input: CollectionInput!) {
            collectionCreate(input: $input) {
              collection {
                id
                title
                descriptionHtml
                handle
                image {
                  id
                  src
                }
              }
              userErrors {
                field
                message
              }
            }
          }`;
      const response: GraphqlCollectionCreateResponse = await client.graphql(query, input);
      this.handleUserErrors(response?.collectionCreate?.userErrors);
      
      return response.collectionCreate;

    } catch (e) {
      const error = e as Error;
      throw ErrorUtil.communication(`Error while creating new collection: ${error.message}`, error, `data=${JSON.stringify(input)}`);
    }
  }

  public static async updateShopifyCollection(data: CollectionInput): Promise<GraphqlCollectionUpdate> {
    const client = await this.getClient();

    const input = {
      input: { ...data, redirectNewHandle: true }
    };

    try {
      const query = `mutation collectionUpdate($input: CollectionInput!) {
            collectionUpdate(input: $input) {
              collection {
                id
                title
                descriptionHtml
                handle
                image {
                  id
                  src
                }
              }
              userErrors {
                field
                message
              }
            }
          }`;
      const response: GraphqlCollectionUpdateResponse = await client.graphql(query, input);
      this.handleUserErrors(response?.collectionUpdate?.userErrors);
      return response.collectionUpdate;

    } catch (e) {
      const error = e as Error;
      throw ErrorUtil.communication(`Error while creating new collection: ${error.message}`, error, `data=${JSON.stringify(input)}`);
    }
  }
}
