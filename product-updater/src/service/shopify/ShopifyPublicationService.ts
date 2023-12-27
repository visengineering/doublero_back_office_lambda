import { ErrorUtil } from 'common-util/ErrorUtil';
import { GraphqlPublishablePublish, GraphqlPublishablePublishResponse, GraphqlQueryResponse, Publication } from '../../model/Shopify';
import { ShopifyService } from './ShopifyService';

export class ShopifyPublicationService extends ShopifyService {
  private static publications: Publication[];

  public static async publishToAllPublications(shopifyId?: string): Promise<GraphqlPublishablePublish> {

    if (!shopifyId) throw ErrorUtil.badRequest(`Publishing requires shopify entity id in method: publishToAllPublications.`);

    const client = await this.getClient();
    const publications = await this.getPublications();

    const input = {
      id: shopifyId,
      input: publications.map(publication => {
        return {
          publicationId: publication.id,
        };
      })
    };

    try {
      const query = `mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
                        publishablePublish(id: $id, input: $input) {
                          userErrors {
                            field
                            message
                          }
                        }
                      }`;

      const response: GraphqlPublishablePublishResponse = (await client.graphql(query, input));
      this.handleUserErrors(response?.publishablePublish?.userErrors);
      return response.publishablePublish;

    } catch (e) {
      const error = e as Error;
      throw ErrorUtil.communication(`Error while publishing collection: ${error.message}`, error, `data=${JSON.stringify(input)}`);
    }

  }

  public static async getPublications(): Promise<Publication[]> {
    if (this.publications) return this.publications;

    const client = await this.getClient();

    try {
      const query = `query publications {
                        publications(first: 20) {
                          edges {
                            node {
                              id
                              name
                            }
                          }
                        }
                      }`;

      const response: GraphqlQueryResponse<Publication> = (await client.graphql(query));
      this.publications = response.publications?.edges?.map(edge => edge.node);
    } catch (e) {
      const error = e as Error;
      throw ErrorUtil.communication(`Error while loading list of publications: ${error.message}`, error);
    }

    return this.publications;
  }
}
