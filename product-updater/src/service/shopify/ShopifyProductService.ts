import Shopify, { IProduct } from 'shopify-api-node';
import {
  ProductMetafieldUpdateData,
  ShopifyMetafieldName,
  ShopifyMetafieldNamespace,
  ShopifyMetafieldType,
  ShopifyProductUpdate,
} from '../../model/Shopify';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { ShopifyService } from './ShopifyService';

interface MetafieldsSetInput {
  metafields: MetafieldsInput[];
}

interface MetafieldsInput {
  key: ShopifyMetafieldName;
  namespace: ShopifyMetafieldNamespace;
  ownerId: string;
  type: ShopifyMetafieldType;
  value: string;
}

interface MetafieldsDeleteInput {
  input: {
    id: string;
  };
}

interface MetafieldsUpdateResult {
  metafieldsSet?: {
    userErrors?: Error[];
  };
  metafieldDelete?: {
    userErrors?: Error[];
  };
}

interface MetafieldsGetResult {
  product?: {
    metafield?: {
      id: string;
      value: string;
    }
  };
}

interface ProductUpdateResult {
  productUpdate?: {
    product?: {
      id: string,
    },
    userErrors?: Error[];
  };
}

export class ShopifyProductService extends ShopifyService {

  private static async getProductMetafield(productId: number, key: ShopifyMetafieldName,
                                           namespace: ShopifyMetafieldNamespace, client: Shopify): Promise<MetafieldsGetResult> {
    try {
      const query = `{
        product(id:"${this.getProductGId(productId)}") {
          metafield(namespace: "${namespace}", key: "${key}") {
              id
              value
          }
        }
      }`;

      console.info(`Getting Shopify product ${productId} metafield ${key} from ${namespace} namespace`);

      return await client.graphql(query) as MetafieldsGetResult;
    } catch (e) {
      const error = e as Error;
      throw ErrorUtil.communication(`Error while getting product metafield: ${error.message}`, error, `productId=${productId},field=${key},namespace=${namespace}`);
    }
  }

  public static async deleteProductMetafield(metafield: ProductMetafieldUpdateData): Promise<void> {
    const client = await this.getClient();

    const oldMetafield = await this.getProductMetafield(metafield.productId, metafield.key, metafield.namespace, client);

    if (!oldMetafield.product?.metafield?.id) {
      console.log(`Skipping metafield ${metafield.key} from ${metafield.namespace} namespace delete as one was not found`);
      return;
    }

    let result: MetafieldsUpdateResult = {};

    try {
      const query = `mutation metafieldDelete($input: MetafieldDeleteInput!) {
        metafieldDelete(input: $input) {
          userErrors {
            field
            message
          }
          deletedId
        }
      }`;

      const input: MetafieldsDeleteInput = {
        input: {
          id: oldMetafield.product?.metafield?.id
        }
      };

      console.info(`Deleting product ${metafield.productId} metafield ${metafield.key} from ${metafield.namespace} namespace`);

      result = await client.graphql(query, input);
    } catch (e) {
      const error = e as Error;
      throw ErrorUtil.communication(`Error while deleting product metafield: ${error.message}`, error, `productId=${metafield.productId},field=${metafield.key},namespace=${metafield.namespace}`);
    }

    this.handleUserErrors(result.metafieldsSet?.userErrors);
  }

  public static async setProductMetafields(metafields: ProductMetafieldUpdateData[]): Promise<void> {
    const client = await this.getClient();

    let result: MetafieldsUpdateResult = {};

    try {
      const query = `mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          userErrors {
            field
            message
          }
          metafields {
            key
            namespace
            type
            value
          }
        }
      }`;

      const input: MetafieldsSetInput = {
        metafields: []
      };

      metafields.forEach(field => {
        input.metafields.push({
          key: field.key,
          namespace: field.namespace,
          ownerId: this.getProductGId(field.productId),
          type: field.type,
          value: <string>field.value
        });

        console.info(`Updating Shopify product ${field.productId} field ${field.key} of type ${field.type} with data: ${field.value}`);
      });

      result = await client.graphql(query, input);
    } catch (e) {
      const error = e as Error;

      throw ErrorUtil.communication(`Error while product data update: ${error.message}`, error, `metafields=${JSON.stringify(metafields)}`);
    }

    this.handleUserErrors(result.metafieldsSet?.userErrors);
  }

  public static async updateRawProductData(productId: number, data: ShopifyProductUpdate): Promise<void> {
    const client = await this.getClient();

    let result: ProductUpdateResult = {};

    try {
      const query = `mutation ($input: ProductInput!) {
        productUpdate(input: $input) {
            product {
              id
            }
            userErrors {
                field
                message
            }
        }
      }`;
      const input = {
        input: {
          id: this.getProductGId(productId),
          ...data
        }
      };
      result = await client.graphql(query, input) as ProductUpdateResult;
      console.log(`Updated product (${productId}) information:`, result);
    } catch (e) {
      const error = e as Error;
      throw ErrorUtil.communication(`Error updating product data: ${error.message}`, error, `data=${JSON.stringify(data)}`);
    }

    this.handleUserErrors(result?.productUpdate?.userErrors);
  }
  public static async changeProductStatusToDraft(id:number): Promise<IProduct> {
    try {
      const client = await this.getClient();
      return client.product.update(id, {'status':'draft'});
    } catch (e) {
      const error = e as Error;
      throw ErrorUtil.communication(`Error updating product status: ${error.message}`, error);
    }
  }

}
