import { ProductUpdateSubType, ProductUpdateType, Update, UpdateAction, UpdateDataType } from '../../../model/ProductUpdate';
import { ShopifyProductUpdate, ShopifySkipMetafield } from '../../../model/Shopify';
import { ErrorUtil } from 'common-util/ErrorUtil';

export type ShopifyTransformer = (data: UpdateDataType, action: UpdateAction, context?: unknown) => ShopifyProductUpdate;
export type ShopifyAsyncTransformer = (data: UpdateDataType, action: UpdateAction, context?: unknown) => Promise<ShopifyProductUpdate>;
export type ShopifyTransformers = {
  [key in ProductUpdateSubType]?: ShopifyTransformer | ShopifyAsyncTransformer;
};

export const SKIP_SHOPIFY_METAFIELD_UPDATE: ShopifySkipMetafield = 'skip-metafield-update';

export abstract class ShopifyUpdateBuilder {
  protected abstract updateType(): ProductUpdateType;

  protected abstract transformers(): ShopifyTransformers;

  protected verifyUpdate(update: Update, transformers: ShopifyTransformers) {
    if (update.type !== this.updateType()) {
      throw ErrorUtil.notAllowed(`Product update with type=${update.type} is not supported`);
    }

    if (!transformers[update.sub_type]) {
      throw ErrorUtil.notAllowed(`Product update with type=${update.type} and sub type=${update.sub_type} is not supported`);
    }
    return transformers;
  }

  protected getTransformer(transformers: ShopifyTransformers, subType: ProductUpdateSubType) {
    return <ShopifyTransformer>transformers[subType];
  }

  protected getAsyncTransformer(transformers: ShopifyTransformers, subType: ProductUpdateSubType) {
    return <ShopifyAsyncTransformer>transformers[subType];
  }

  public buildUpdate(productId: number, update: Update): ShopifyProductUpdate {
    const transformers = this.transformers();
    this.verifyUpdate(update, transformers);

    return this.getTransformer(transformers, update.sub_type)(update.data, update.action, productId);
  }

  public buildAsyncUpdate(productId: number, update: Update): Promise<ShopifyProductUpdate> {
    const transformers = this.transformers();
    this.verifyUpdate(update, transformers);

    return this.getAsyncTransformer(transformers, update.sub_type)(update.data, update.action, productId);
  }

  public buildRelatedUpdates(productId: number, updates: Update[]): ShopifyProductUpdate {
    return {};
  }
}
