import { CommunicationError } from '../error/CommunicationError';
import { ErrorUtil } from '../ErrorUtil';
import { SQSEvent as AWSSQSEvent, SQSRecord as AWSSQSRecord } from 'aws-lambda';
import SQS, { DeleteMessageRequest, MessageAttributeValue, } from 'aws-sdk/clients/sqs';
import { RequestUtil } from '../RequestUtil';

export type MessageAttributes = { [key: string]: MessageAttributeValue };
export type SQSEvent = AWSSQSEvent;
export type SQSRecord = AWSSQSRecord;

export interface MessageDetails {
  id: string;
  message: string;
  attrs?: MessageAttributes;
}

export class QueueClient {

  private static readonly client = new SQS({
    region: RequestUtil.getEnvParam('AWS_REGION'),
  });

  public static async handleMessages(queue: string, event: SQSEvent,
                                     handleMessage: (record: SQSRecord) => Promise<void>,
                                     handleError?: (record: SQSRecord, error: Error) => Promise<void>): Promise<void> {
    if (!process.env[queue]) {
      throw ErrorUtil.missingParams('Environment param is missing', [queue]);
    }

    const successful: string[] = [];
    const errors: Map<SQSRecord, Error> = new Map<SQSRecord, Error>();

    for (const record of event.Records) {
      try {
        console.log(`Handling message: ${JSON.stringify(record)}`);

        await handleMessage(record);
        successful.push(record.receiptHandle);
      } catch (e) {
        const error = <Error>e;
        console.error(`Error while processing message ${record.receiptHandle}: ${error.message}`);
        console.error(e);
        errors.set(record, error);
      }
    }

    if (errors.size > 0) { // if there are errors, manually delete successful messages, so they are not re-processed again
      for (const handle of successful) {
        await this.deleteMessage(RequestUtil.getEnvParam(queue), handle);
      }

      if (handleError) {
        const promises: Promise<void>[] = [];
        errors.forEach((error: Error, record: SQSRecord) => {
          promises.push(handleError(record, error));
        });
        await Promise.allSettled(promises);
      }

      throw new Error(`Error processing messages: ${JSON.stringify(errors.keys())}`);
    } // otherwise, Lambda will delete all handles automatically
  }

  public static async deleteMessage(queueUrl: string, handle: string): Promise<void> {
    console.log(`Deleting message ${handle} from the queue ${queueUrl}`);

    const param: DeleteMessageRequest = {
      QueueUrl: queueUrl,
      ReceiptHandle: handle,
    };

    try {
      await this.client.deleteMessage(param).promise();
    } catch (e) {
      const error = <Error>e;
      console.error(`Error deleting message from the queue: ${error.message}`);
      console.error(e);

      throw new CommunicationError(error.message, error);
    }
  }
}
