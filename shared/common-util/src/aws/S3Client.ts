import { CommunicationError } from '../error/CommunicationError';
import S3, { DeleteObjectRequest, PutObjectRequest } from 'aws-sdk/clients/s3';
import * as stream from 'stream';
import { Transform } from 'stream';

export interface UploadStreamData {
  stream: Transform;
  promise: Promise<unknown>;
}

export class S3Client {

  private static readonly client = new S3({
    region: process.env.AWS_REGION,
    s3ForcePathStyle: true,
  });

  private static readonly DEFAULT_GET_URL_TIMEOUT = 172800;   // 2 days

  public static async signForGet(bucket: string, key: string,
                                 expiresIn = S3Client.DEFAULT_GET_URL_TIMEOUT): Promise<string> {
    console.log(`Creating get pre-sign URL for object (bucket=${bucket}, key=${key})`);

    const params = {
      Bucket: bucket,
      Key: key,
      Expires: expiresIn,
    };

    try {
      return await this.client.getSignedUrlPromise('getObject', params);
    } catch (e) {
      const error = <Error>e;
      console.error(`Error creating get pre-sign URL for object (bucket=${bucket}, key=${key}): ${error.message}`);
      console.error(e);

      throw new CommunicationError(error.message, error);
    }
  }

  public static async uploadS3FileAsStream(bucket: string, key: string, contentType: string,
                                           tags?: Map<string, string>): Promise<UploadStreamData> {
    try {
      console.log(`Preparing file S3 upload stream (bucket=${bucket}, key=${key})`);

      const writeStream = new stream.PassThrough();

      const params: PutObjectRequest = {
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        Body: writeStream
      };

      if (tags) {
        params.Tagging = [...tags.keys()].map(tag => `${tag}=${tags.get(tag)}`).join('&');
      }

      return {
        stream: writeStream,
        promise: this.client.upload(params).promise(),
      };
    } catch (e) {
      const error = <Error>e;
      throw new CommunicationError(`Error while preparing file S3 upload stream of bucket ${bucket} and key ${key}: ${error.message}`, error);
    }
  }

  public static async deleteObject(bucket: string, key: string): Promise<void> {
    console.log(`Deleting object (bucket=${bucket}, key=${key})`);

    const params: DeleteObjectRequest = {
      Bucket: bucket,
      Key: key,
    };

    try {
      await this.client.deleteObject(params);
    } catch (e) {
      const error = <Error>e;
      console.error(`Error deleting object (bucket=${bucket}, key=${key}): ${error.message}`);
      console.error(e);

      throw new CommunicationError(error.message, error);
    }
  }
}
