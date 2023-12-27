import { ErrorUtil } from 'common-util/ErrorUtil';
import { ProductDelete, ProductUpdate, ProductUpdateEventTypes, UpdateAction } from '../../model/ProductUpdate';
import { ProductUpdateService } from '../../service/product/ProductUpdateService';

interface Event {
  sku: string;
  types: ProductUpdateEventTypes;
  skip_shopify_update?: boolean;
  action?: UpdateAction;
  shopify_id?: number;
  execution_id?: string;
}

export const handler = async (event: Event): Promise<ProductUpdate|ProductDelete> => {
 
  if (!event.sku) throw ErrorUtil.badRequest(`Product SKU is required in order to proceed (${JSON.stringify(event)})`);
  if (event?.action === UpdateAction.delete) {
    console.log(`Got product delete request: ${JSON.stringify(event)}`);
    return await ProductUpdateService.prepareDeleteInput(event.sku, event.action, event.shopify_id, event.execution_id);
  } else {
      if (!event.types || !Object.keys(event.types).length) {
        throw ErrorUtil.badRequest(`At least 1 type is required in order to proceed (${JSON.stringify(event)})`);
      }
      console.log(`Got product update request: ${JSON.stringify(event)}`);
      return await ProductUpdateService.prepareProductUpdates(event.sku, event.types,
        event.skip_shopify_update || false, event.execution_id);
    }
};
