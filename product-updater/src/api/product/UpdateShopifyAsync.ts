import { QueueClient, SQSEvent, SQSRecord } from 'common-util/aws/QueueClient';
import { WorkflowClient } from 'common-util/aws/WorkflowClient';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { QueueUpdate, Update, UpdateAction } from '../../model/ProductUpdate';
import { ShopifyUpdateService } from '../../service/product/shopify/ShopifyUpdateService';

export async function handleMessage(record: SQSRecord): Promise<void> {
  if (!record.body) {
    throw ErrorUtil.missingParams('Request body is missing', ['Request body']);
  }

  const update = JSON.parse(record.body) as QueueUpdate;
  const eventResult = await handleEvent(record);
  await WorkflowClient.sendTaskSuccess(update.task_token, JSON.stringify(eventResult));
}

export async function handleEvent(record: SQSRecord): Promise<Update[]> {
  const update = JSON.parse(record.body) as QueueUpdate;

  if (update?.action === UpdateAction.delete && update?.shopify_id) {
    await ShopifyUpdateService.setProductStatusToDraft(update.shopify_id, update.sku, update.execution_id);
    return update.updates;
  } else {
    ShopifyUpdateService.validateUpdateEvent(update);
    let result: Update[] = update.updates;
    if (!update.updates?.length) {
      console.log(`Skipped Shopify update for product ${update.sku} as no updates requested`);
    } else if (!update.skip_update) {
      result = await ShopifyUpdateService.handleProductUpdate(update, update.execution_id);
    } else {
      console.log(`Skipped Shopify update for product ${update.sku}`);
    }
    return result;
  }
}

export const handler = async (event: SQSEvent): Promise<void> => {
  await QueueClient.handleMessages('SHOPIFY_UPDATES_QUEUE', event, handleMessage);
};
