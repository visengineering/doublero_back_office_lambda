import { QueueClient, SQSEvent, SQSRecord } from 'common-util/aws/QueueClient';
import { WorkflowClient } from 'common-util/aws/WorkflowClient';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { RequestUtil } from 'common-util/RequestUtil';

interface UpdateMessage {
  task_token: string;
}

async function handleMessage(record: SQSRecord): Promise<void> {
  if (!record.body) throw ErrorUtil.missingParams('Request body is missing', ['Request body']);

  const update = JSON.parse(record.body) as UpdateMessage;
  if (!update.task_token) throw ErrorUtil.badRequest(`Task Token is required in order to proceed (${JSON.stringify(update)})`);

  console.info(`Notifying workflow about failed message with token ${update.task_token}: ${JSON.stringify(record.body)}`);

  try {
    await WorkflowClient.sendTaskFail(update.task_token, 'Communication', `Message got to DLQ: ${JSON.stringify(record.body)}`);
  } catch (e) {
    // it is OK to ignore errors here
    console.error(e);
  }
}

async function handleMessageError(record: SQSRecord, error: Error): Promise<void> {
  await QueueClient.deleteMessage(RequestUtil.getEnvParam('SHOPIFY_UPDATES_DLQ'), record.receiptHandle);
}

export const handler = async (event: SQSEvent): Promise<void> => {
  await QueueClient.handleMessages('SHOPIFY_UPDATES_DLQ', event, handleMessage, handleMessageError);
};
