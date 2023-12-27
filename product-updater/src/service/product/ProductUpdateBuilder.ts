import {
  ProductImagesUpdate,
  ProductUpdateSubType,
  ProductUpdateType,
  Update,
  UpdateAction,
  UpdateDataType
} from '../../model/ProductUpdate';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { Product } from 'common-db/model/Product';

export type ProductUpdateLoader = (product: Product, context?: unknown) => Promise<Update>;
export type ProductImageUpdateLoader = (product: Product, context?: unknown) => Promise<ProductImagesUpdate>;
export type ProductLoaders = {
  [key in ProductUpdateSubType]?: ProductUpdateLoader | ProductImageUpdateLoader;
};

export abstract class ProductUpdateBuilder {
  protected abstract updateType(): ProductUpdateType;

  protected abstract loaders(): ProductLoaders;

  protected verifyUpdateType(type: ProductUpdateType, subType: ProductUpdateSubType, loaders: ProductLoaders) {
    if (type !== this.updateType()) {
      throw ErrorUtil.notAllowed(`Product update with type=${type} is not supported`);
    }

    if (!loaders[subType]) {
      throw ErrorUtil.notAllowed(`Product update with type=${type} and sub type=${subType} is not supported`);
    }
    return loaders;
  }

  protected getLoader(loaders: ProductLoaders, subType: ProductUpdateSubType) {
    return <ProductUpdateLoader>loaders[subType];
  }

  protected getImageLoader(loaders: ProductLoaders, subType: ProductUpdateSubType) {
    return <ProductImageUpdateLoader>loaders[subType];
  }

  private loadUpdate(product: Product, subType: ProductUpdateSubType, loaders: ProductLoaders): Promise<Update> {
    this.verifyUpdateType(this.updateType(), subType, loaders);

    return this.getLoader(loaders, subType)(product);
  }

  public async loadUpdates(product: Product, subTypes: ProductUpdateSubType[]): Promise<Update[]> {
    const loaders = this.loaders();

    const updates: Update[] = [];

    for (const subType of subTypes) {
      updates.push(await this.loadUpdate(product, subType, loaders));
    }

    return updates;
  }

  public async loadImageUpdate(product: Product, subType: ProductUpdateSubType, context?: unknown): Promise<ProductImagesUpdate> {
    const loaders = this.loaders();
    this.verifyUpdateType(this.updateType(), subType, loaders);

    return this.getImageLoader(loaders, subType)(product, context);
  }

  public async loadRelatedUpdates(product: Product, subTypes: ProductUpdateSubType[]): Promise<Promise<ProductImagesUpdate>[]> {
    return Promise.resolve([]);
  }

  protected prepareUpdate(type: ProductUpdateType, sub_type: ProductUpdateSubType,
                          data: UpdateDataType = {}, action = UpdateAction.delete): Update {
    return {
      type,
      sub_type,
      action,
      data,
    };
  }
}
