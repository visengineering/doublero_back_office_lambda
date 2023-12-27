import { FeedLogsService } from './FeedLogsService';
import * as csv from '@fast-csv/format';
import { Row } from '@fast-csv/format';
import { RequestUtil } from 'common-util/RequestUtil';
import { FeedLog } from '../../model/FeedLog';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { S3Client } from 'common-util/aws/S3Client';
import { CloudFrontClient } from 'common-util/aws/CloudFrontClient';
import { Readable } from 'stream';
import { FeedItem } from '../../model/Feed';
import { CloudFrontSingSecret, FeedSecret } from '../../model/Secret';
import { SecretManagerClient } from 'common-util/aws/SecretManagerClient';
import { NotFoundError } from 'common-util/error/NotFoundError';

export abstract class FeedService {

  protected readonly GOOGLE_PRODUCT_CATEGORY = 'Home & Garden > Decor > Artwork > Posters, Prints, & Visual Artwork';

  protected abstract getFeedName(): string;

  protected abstract getFeedBucketKey(): string;

  protected abstract getFeedSecretEnvKey(): string;

  protected abstract getFeedItemsCount(): Promise<number>;

  protected abstract getFeedExportHeader(): string[];

  protected abstract getFeedContent(): Promise<Readable>;

  protected abstract transformItem(product: Row): FeedItem;

  protected abstract populateItem(sku: string): Promise<void>;

  private static feedSecret: string;
  private static cfSignSecret: string;

  protected async getFeedSecret(): Promise<FeedSecret> {
    if (!FeedService.feedSecret) {
      const secretName = RequestUtil.getEnvParam(this.getFeedSecretEnvKey());
      FeedService.feedSecret = await SecretManagerClient.getSecretValue(secretName);
    }

    if (!FeedService.feedSecret) {
      throw ErrorUtil.configuration('Secret value is missing', [this.getFeedSecretEnvKey()]);
    }

    return JSON.parse(FeedService.feedSecret) as FeedSecret;
  }

  private static async getCFSignSecret(): Promise<CloudFrontSingSecret> {
    if (!FeedService.cfSignSecret) {
      const secretName = RequestUtil.getEnvParam('CLOUD_FRONT_SIGN_SECRET');
      FeedService.cfSignSecret = await SecretManagerClient.getSecretValue(secretName);
    }

    if (!FeedService.cfSignSecret) {
      throw ErrorUtil.configuration('Secret value is missing', ['CLOUD_FRONT_SIGN_SECRET']);
    }

    return JSON.parse(FeedService.cfSignSecret) as CloudFrontSingSecret;
  }

  public async downloadFeed(apiKey: string, referrer: string): Promise<string> {
    const startTime = process.hrtime();

    const log: FeedLog = FeedLogsService.prepareLog(`${this.getFeedName()} - download`, referrer);

    const feedKey = (await this.getFeedSecret()).api_key;
    if (feedKey != apiKey) {
      log.success = false;
      log.error = {
        name: 'Wrong key',
      };
      await FeedLogsService.saveFeedLog(log);

      throw ErrorUtil.forbidden('Access to the feed forbidden, wrong key provided');
    }

    try {
      const url = `https://${(RequestUtil.getEnvParam('FEEDS_DOMAIN'))}/${this.getFeedBucketKey()}`;

      const signSecret = await FeedService.getCFSignSecret();
      const signedUrl = CloudFrontClient.getSignedUrl(signSecret.key_id, signSecret.private_key, url);

      log.execution_time = FeedService.getExecutionTime(startTime);
      await FeedLogsService.saveFeedLog(log);

      return signedUrl;
    } catch (err) {
      log.success = false;
      log.execution_time = FeedService.getExecutionTime(startTime);
      log.error = <Error>err;
      await FeedLogsService.saveFeedLog(log);

      throw ErrorUtil.general(`Error while getting feed download URL: ${(<Error>err).message}`, <Error>err);
    }
  }

  public async generateFeed(): Promise<void> {
    let recordsCount = 0;
    const startTime = process.hrtime();

    const log: FeedLog = FeedLogsService.prepareLog(`${this.getFeedName()} - generate`, 'system');

    try {
      console.log(`Generating ${this.getFeedName()} feed...`);

      recordsCount = await this.getFeedItemsCount();

      const bucket = RequestUtil.getEnvParam('FEEDS_BUCKET');
      const key = this.getFeedBucketKey();

      const s3Upload = await S3Client.uploadS3FileAsStream(bucket, key, 'text/csv');
      const csvStream = csv
        .format({headers: this.getFeedExportHeader(), includeEndRowDelimiter: true})
        .transform((item: Row) => this.transformItem(item));

      (await this.getFeedContent())
        .pipe(csvStream)
        .pipe(s3Upload.stream);

      await s3Upload.promise;

      const distributionId = RequestUtil.getEnvParam('FEEDS_DISTRIBUTION_ID');
      await CloudFrontClient.createInvalidation(distributionId, `/${key}`, log.date.getTime().toString());

      console.log(`Successfully uploaded ${this.getFeedName()} feed (bucket=${bucket}, key=${key})`);

      log.items = recordsCount;
      log.execution_time = FeedService.getExecutionTime(startTime);
      await FeedLogsService.saveFeedLog(log);
    } catch (err) {
      log.success = false;
      log.items = recordsCount;
      log.execution_time = FeedService.getExecutionTime(startTime);
      log.error = <Error>err;

      await FeedLogsService.saveFeedLog(log);

      throw ErrorUtil.general(`Error while generating ${this.getFeedName()} feed: ${(<Error>err).message}`, <Error>err);
    }
  }

  public async populateFeed(sku: string): Promise<void> {
    const startTime = process.hrtime();

    const log: FeedLog = FeedLogsService.prepareLog(`${this.getFeedName()} - populate`, 'system');
    log.data = sku;

    try {
      console.log(`Populating ${this.getFeedName()} feed for ${sku}...`);

      await this.populateItem(sku);

      console.debug(`Successfully populated ${this.getFeedName()} feed for ${sku}`);

      log.items = 1;
      log.execution_time = FeedService.getExecutionTime(startTime);

      await FeedLogsService.saveFeedLog(log);
    } catch (err) {
      log.success = false;
      log.items = 1;
      log.execution_time = FeedService.getExecutionTime(startTime);
      log.error = <Error>err;

      await FeedLogsService.saveFeedLog(log);

      if (err instanceof NotFoundError) {
        throw err;
      } else {
        throw ErrorUtil.general(`Error while populating ${this.getFeedName()} feed for ${sku}: ${(<Error>err).message}`, <Error>err);
      }
    }
  }

  private static getExecutionTime(startTime: [number, number]) {
    const executionTime = process.hrtime(startTime);

    return `${executionTime[0]}s ${Math.ceil(executionTime[1] / 1000000)}ms`;
  }

  protected getSalesCustomLabel(sales = 0): number {
    let label: number;

    if (sales >= 40) {
      label = 5;
    } else if (sales >= 21 && sales < 40) {
      label = 4;
    } else if (sales >= 11 && sales < 21) {
      label = 3;
    } else if (sales >= 4 && sales < 11) {
      label = 2;
    } else if (sales >= 1 && sales < 4) {
      label = 1;
    } else {
      label = 0;
    }

    return label;
  }

  protected getProductDescription(title = '', description = ''): string {
    return (
      description ||
      `${title} is a beautiful addition to any decor style. Bring this stunning canvas print into your home to easily refresh your walls and elevate your decor.`
    );
  }
}
