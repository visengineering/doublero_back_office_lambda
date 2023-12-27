import { QueueClient, SQSEvent, SQSRecord } from 'common-util/aws/QueueClient';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { RequestUtil } from 'common-util/RequestUtil';
import { ProductUpdateEventTypes, UpdateAction } from '../../model/ProductUpdate';
import { DynamoClient } from 'common-util/aws/DynamoClient';

interface Message {
  sku: string;
  types: ProductUpdateEventTypes;
  action?:UpdateAction;
  shopify_id?: number;
  skip_shopify_update?: boolean;
}

async function handleMessage(record: SQSRecord): Promise<void> {
  if (!record.body) throw ErrorUtil.missingParams('Request body is missing', ['Request body']);

  const message = JSON.parse(record.body) as Message;

  if (!message.sku) {
    throw ErrorUtil.badRequest('Product SKU is required in order to proceed', undefined, record.body);
  } else if (!message.types || !Object.keys(message.types).length) {
    throw ErrorUtil.badRequest('Product update types are required in order to proceed', undefined, record.body);
  }

  const table = RequestUtil.getEnvParam('PRODUCT_UPDATES_TABLE');

  await DynamoClient.putItem(table, {
    id: {
      S: message.sku,
    },
    types: {
      S: JSON.stringify(message.types),
    },
    action:{
      S: message.action,
    },
    shopify_id:{
      N: '' + message.shopify_id,
    },
    skip_shopify_update: {
      BOOL: message.skip_shopify_update || false
    },
    attempt: {
      N: '0'
    },
    error_info: {
      S: 'Update scheduling failed, so added for retry'
    }
  });

  console.info(`Product update re-try scheduled for ${message.sku} with types: ${JSON.stringify(message.types)}`);
}

async function handleMessageError(record: SQSRecord): Promise<void> {
  await QueueClient.deleteMessage(RequestUtil.getEnvParam('SCHEDULED_UPDATES_DLQ'), record.receiptHandle);
}

export const handler = async (event: SQSEvent): Promise<void> => {
  await QueueClient.handleMessages('SCHEDULED_UPDATES_DLQ', event, handleMessage, handleMessageError);
};
