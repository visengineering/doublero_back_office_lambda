/* eslint-disable @typescript-eslint/no-explicit-any */
import { AttributeMap, DynamoClient } from 'common-util/aws/DynamoClient';
import { RequestUtil } from 'common-util/RequestUtil';
import { WorkflowClient } from 'common-util/aws/WorkflowClient';

async function handleProductRetry(record: AttributeMap, workflow: string, table: string): Promise<void> {
  const input = {
    sku: record.id.S,
    types: JSON.parse(<string>record.types.S),
    skip_shopify_update: record.skip_shopify_update.BOOL || false,
    batch_id: record.batch_id?.S || '',
    attempt: parseInt(record.attempt.N || '0') + 1,
  };

  console.log(`Scheduling product update retry for ${input.sku}`);

  await WorkflowClient.startExecution(workflow, JSON.stringify(input));

  await DynamoClient.deleteItem(table, {
    id: {
      S: input.sku,
    }
  });
}

export const handler = async (event: never): Promise<void> => {
  const table = RequestUtil.getEnvParam('PRODUCT_UPDATES_TABLE');
  const workflow = RequestUtil.getEnvParam('PRODUCT_UPDATES_WORKFLOW_ARN');

  const records = await DynamoClient.scan(table, undefined, undefined, undefined,
    ['id', 'types', 'skip_shopify_update', 'batch_id', 'attempt'], 50);

  if (records.Items?.length) {
    const promises: Promise<void>[] = [];

    records.Items
      .filter((record: any) => !!record.id?.S && !!record.types?.S)
      .forEach((record: any) => {
        promises.push(handleProductRetry(record, workflow, table));
      });

    await Promise.allSettled(promises);
  }
};
