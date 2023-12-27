import { ProductUpdateSubType, ProductUpdateType, Update, UpdateAction, UpdateDataType } from '../../../model/ProductUpdate';
import { AlgoliaUpdateProductType } from '../../../model/Algolia';
import { ErrorUtil } from 'common-util/ErrorUtil';

export type AlgoliaTransformer = (data: UpdateDataType, action: UpdateAction, context?: unknown) => AlgoliaUpdateProductType;
export type AlgoliaTransformers = {
  [key in ProductUpdateSubType]?: AlgoliaTransformer;
};

export abstract class AlgoliaUpdateBuilder {
  protected abstract updateType(): ProductUpdateType;

  protected abstract transformers(): AlgoliaTransformers;

  protected verifyUpdate(update: Update, transformers: AlgoliaTransformers) {
    if (update.type !== this.updateType()) {
      throw ErrorUtil.notAllowed(`Product update with type=${update.type} is not supported`);
    }

    if (!transformers[update.sub_type]) {
      throw ErrorUtil.notAllowed(`Product update with type=${update.type} and sub type=${update.sub_type} is not supported`);
    }
    return transformers;
  }

  protected getTransformer(transformers: AlgoliaTransformers, subType: ProductUpdateSubType) {
    return <AlgoliaTransformer>transformers[subType];
  }

  public buildUpdate(update: Update): AlgoliaUpdateProductType {
    const transformers = this.transformers();
    this.verifyUpdate(update, transformers);

    return this.getTransformer(transformers, update.sub_type)(update.data, update.action);
  }

  public buildRelatedUpdates(updates: Update[]): AlgoliaUpdateProductType {
    return {};
  }
}
