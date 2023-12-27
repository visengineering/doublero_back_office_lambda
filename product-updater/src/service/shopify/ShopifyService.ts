import Shopify from 'shopify-api-node';
import { RequestUtil } from 'common-util/RequestUtil';
import { SecretManagerClient } from 'common-util/aws/SecretManagerClient';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { Environment } from '../../model/Environment';

interface ShopifySecret {
  shop_name: string;
  api_key: string;
  api_pass: string;
}

export abstract class ShopifyService {

  private static readonly SHOPIFY_API_VERSION = '2022-01';

  private static secret: string;

  private static async getAccessSecret(): Promise<ShopifySecret> {
    if (!this.secret) {
      const secretName = RequestUtil.getEnvParam('SHOPIFY_SECRET');
      this.secret = await SecretManagerClient.getSecretValue(secretName);
    }

    if (!this.secret) {
      throw ErrorUtil.configuration('Secret value is missing', ['SHOPIFY_SECRET']);
    }

    return JSON.parse(this.secret) as ShopifySecret;
  }

  protected static async getClient(): Promise<Shopify> {
    const secret = await this.getAccessSecret();

    return new Shopify({
      shopName: secret.shop_name,
      apiKey: secret.api_key,
      password: secret.api_pass,
      apiVersion: this.SHOPIFY_API_VERSION,
    });
  }

  protected static getProductGId(shopifyId: number): string {
    return `gid://shopify/Product/${shopifyId}`;
  }

  protected static handleUserErrors(errors: Error[] = []) {
    if (errors.length > 0) {
      if ((errors[0].message == 'Product does not exist' || errors[0].message == 'Owner must exist')
        && RequestUtil.getEnvParam('ENVIRONMENT') !== Environment.prod) {
        // skip throwing missing product error for non prod environments
        console.error(`Shopify error ignored: ${JSON.stringify(errors[0])}`);
      } else {
        throw ErrorUtil.communication(errors[0].message);
      }
    }
  }

}
