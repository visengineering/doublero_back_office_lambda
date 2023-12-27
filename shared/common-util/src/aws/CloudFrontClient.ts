import { CommunicationError } from '../error/CommunicationError';
import Cloudfront, { CreateInvalidationRequest } from 'aws-sdk/clients/cloudfront';
import { Signer } from 'aws-sdk/lib/cloudfront/signer';

export class CloudFrontClient {

  private static readonly DEFAULT_GET_URL_TIMEOUT = 172800;   // 2 days

  private static readonly client = new Cloudfront({
    region: process.env.AWS_REGION,
  });

  public static async createInvalidation(distributionId: string, path: string, reference: string): Promise<void> {
    console.log(`Creating invalidation for distribution ${distributionId} and path ${path}`);

    const params: CreateInvalidationRequest = {
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: reference,
        Paths: {
          Quantity: 1,
          Items: [
            path
          ]
        }
      }
    };

    try {
      await this.client.createInvalidation(params).promise();
    } catch (e) {
      const error = <Error>e;
      console.error(`Error creating invalidation for distribution ${distributionId} and path ${path}: ${error.message}`);
      console.error(e);

      throw new CommunicationError(error.message, error);
    }
  }

  public static getSignedUrl(keyId: string, privateKey: string,
                             url: string, expiresIn = CloudFrontClient.DEFAULT_GET_URL_TIMEOUT): string {
    console.log(`Creating signed Url for url ${url} using key id ${keyId}`);

    const signer = new Cloudfront.Signer(keyId, privateKey.replace(/\\n/g, '\n'));

    try {
      const data: Signer.SignerOptionsWithoutPolicy = {
        expires: Math.floor((new Date()).getTime() / 1000) + expiresIn,
        url
      };

      return signer.getSignedUrl(data);
    } catch (e) {
      const error = <Error>e;
      console.error(`Error signing url ${url} using key id ${keyId}: ${error.message}`);
      console.error(e);

      throw new CommunicationError(error.message, error);
    }
  }

}
