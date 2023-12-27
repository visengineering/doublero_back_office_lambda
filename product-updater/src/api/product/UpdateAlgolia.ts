import { ProductUpdate, UpdateAction } from '../../model/ProductUpdate';
import { AlgoliaUpdateService } from '../../service/product/algolia/AlgoliaUpdateService';

interface Event {
  product: ProductUpdate;
  action?: UpdateAction;
  execution_id?: string
}

export const handler = async (event: Event): Promise<void> => {

  AlgoliaUpdateService.validateUpdateEvent(event?.product);
  if (event?.action === UpdateAction.delete) {
    console.log(`Handling Algolia delete for product ${event.product.sku}`);
    await AlgoliaUpdateService.handleDeleteAction(event.product.sku, event.execution_id);
  } else {
    console.log(`Handling Algolia update for product ${event.product.sku}`);
    if (event.product.updates.length) {
      await AlgoliaUpdateService.handleProductUpdate(event.product, event.execution_id);
    } else {
      console.log(`Skipped Algolia update for product ${event.product.sku} as no updates requested`);
    }
  }
};
