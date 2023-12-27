import { QueueClient, SQSEvent, SQSRecord } from 'common-util/aws/QueueClient';
import { WorkflowClient } from 'common-util/aws/WorkflowClient';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { ProductUpdateEventTypes, UpdateAction } from '../../model/ProductUpdate';
import { RequestUtil } from 'common-util/RequestUtil';

interface Message {
  sku: string;
  types: ProductUpdateEventTypes;
  action?: UpdateAction;
  shopify_id?: number;
  skip_shopify_update?: boolean;
  batch_id?: string;
}

function delay(time = 1000) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function handleMessage(record: SQSRecord): Promise<void> {
  if (!record.body) {
    throw ErrorUtil.missingParams('Request body is missing', ['Request body']);
  }

  const message = JSON.parse(record.body) as Message;

  if (!message.sku) {
    throw ErrorUtil.badRequest('Product SKU is required in order to proceed', undefined, record.body);
  } else if (!message.types || !Object.keys(message.types).length) {
    throw ErrorUtil.badRequest('Product update types are required in order to proceed', undefined, record.body);
  }

  const input = {
    sku: message.sku,
    types: message.types,
    action: message.action,
    shopify_id: message.shopify_id,
    skip_shopify_update: message.skip_shopify_update || false,
    batch_id: message.batch_id || '',
    attempt: 0,
  };

  const workflow = RequestUtil.getEnvParam('PRODUCT_UPDATES_WORKFLOW_ARN');
  await WorkflowClient.startExecution(workflow, JSON.stringify(input));

  console.log(`Scheduled product update for ${input.sku} with types: ${JSON.stringify(input.types)}`);
}

export const handler = async (event: SQSEvent): Promise<void> => {
  await QueueClient.handleMessages('SCHEDULED_UPDATES_QUEUE', event, handleMessage);

  await delay(parseInt(RequestUtil.getEnvParam('WAIT_TIME_DELAY')));
};
