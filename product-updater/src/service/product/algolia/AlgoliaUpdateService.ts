import { ProductUpdate, ProductUpdateEventTypes, ProductUpdateType, Update } from '../../../model/ProductUpdate';
import { AlgoliaUpdateProduct } from '../../../model/Algolia';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { ProductCategorizationAlgoliaBuilder } from '../builder/categorization/ProductCategorizationAlgoliaBuilder';
import { ProductNameAlgoliaBuilder } from '../builder/name/ProductNameAlgoliaBuilder';
import { ProductGeneralAlgoliaBuilder } from '../builder/general/ProductGeneralAlgoliaBuilder';
import { AlgoliaProductService } from '../../algolia/AlgoliaProductService';
import { ProductLogsService } from '../ProductLogsService';
import { ProductChangeActions, ProductDeleteActions } from '../../../model/Product';
import { ProductPreviewsAlgoliaBuilder } from '../builder/previews/ProductPreviewsAlgoliaBuilder';
import { ProductUpdateHelper } from '../ProductUpdateHelper';

export class AlgoliaUpdateService {

  public static validateUpdateEvent(update: ProductUpdate): void {
    let error: string | undefined;

    if (!update.sku) {
      error = 'Product SKU is required in order to proceed';
    }

    if (error) throw ErrorUtil.badRequest(error, undefined, JSON.stringify(update));

    update.updates?.forEach(item => ProductUpdateHelper.validateProductUpdateItem(item));
  }

  public static async handleProductUpdate(productUpdate: ProductUpdate, executionId?: string): Promise<void> {
    let data: AlgoliaUpdateProduct = {
      objectID: productUpdate.sku,
    };

    const logTypes: Partial<ProductUpdateEventTypes> = {};

    const previewUpdates: Update[] = [];

    for (const update of productUpdate.updates) {
      switch (update.type) {
        case ProductUpdateType.categorization:
          data = { ...data, ...(new ProductCategorizationAlgoliaBuilder().buildUpdate(update)) };
          break;
        case ProductUpdateType.name:
          data = { ...data, ...(new ProductNameAlgoliaBuilder().buildUpdate(update)) };
          break;
        case ProductUpdateType.general:
          data = { ...data, ...(new ProductGeneralAlgoliaBuilder().buildUpdate(update)) };
          break;
        case ProductUpdateType.previews:
          previewUpdates.push(update);
          break;
        default:
          throw ErrorUtil.notAllowed(`Product update with type=${update.type} is not supported`);
      }

      if (!logTypes[update.type]) logTypes[update.type] = [];
      if (!logTypes[update.type]?.includes(update.sub_type)) logTypes[update.type]?.push(update.sub_type);
    }

    if (previewUpdates.length) {
      data = { ...data, ...(new ProductPreviewsAlgoliaBuilder().buildRelatedUpdates(previewUpdates)) };
    }

    const res = await AlgoliaProductService.updateProductPartial(data);

    console.log(`Scheduled Algolia partial update for product ${productUpdate.sku}: ${JSON.stringify(res)}`);

    await ProductLogsService.saveLog(productUpdate.sku, ProductChangeActions.product_updater_algolia_updated,
      JSON.stringify(logTypes), executionId);
  }

  public static async handleDeleteAction(sku: string, executionId?:string){

    await AlgoliaProductService.deleteProductFromAlgolia(sku);

    await ProductLogsService.saveLog(sku, ProductDeleteActions.product_updater_algolia_deleted,
      'algolia-deleted', executionId);
  }
}
