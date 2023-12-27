import { ErrorUtil } from 'common-util/ErrorUtil';
import { ProductUpdateEventTypes, Update } from '../../model/ProductUpdate';
import { ProductImagesService } from '../../service/product/builder/images/ProductImagesService';
import { ProductLogsService } from '../../service/product/ProductLogsService';
import { ProductChangeActions } from '../../model/Product';

interface Event {
  sku: string;
  updates: Update[];
  execution_id?: string;
  batch_id?: string;
}

async function saveProductUpdateLog(sku: string, updates: Update[], executionId?: string) {
  const logTypes: Partial<ProductUpdateEventTypes> = {};
  updates.forEach(update => {
    if (!logTypes[update.type]) logTypes[update.type] = [];
    if (!logTypes[update.type]?.includes(update.sub_type)) logTypes[update.type]?.push(update.sub_type);
  });

  await ProductLogsService.saveLog(sku, ProductChangeActions.product_updater_update_finished, JSON.stringify(logTypes), executionId);
}

export const handler = async (event: Event): Promise<void> => {
  if (!event.sku) throw ErrorUtil.badRequest(`Product SKU is required in order to proceed (${JSON.stringify(event)})`);

  console.log(`Got save product images request for ${event.sku}`);

  await ProductImagesService.saveProductImagesUpdate(event.sku, event.updates, event.batch_id);

  await saveProductUpdateLog(event.sku, event.updates, event.execution_id);
};
