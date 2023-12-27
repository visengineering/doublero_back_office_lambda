import { ProductLoaders, ProductUpdateBuilder } from '../../ProductUpdateBuilder';
import { ProductUpdateGeneralSubType, ProductUpdateType } from '../../../../model/ProductUpdate';
import { Product } from 'common-db/model/Product';
import { ProductMainImagesUpdateLoader } from './loaders/ProductMainImagesUpdateLoader';

export class ProductImagesUpdateBuilder extends ProductUpdateBuilder {

  protected updateType(): ProductUpdateType {
    return ProductUpdateType.general;
  }

  protected loaders(): ProductLoaders {
    return {
      [ProductUpdateGeneralSubType.square_image]: (product: Product, context?: unknown) => {
        return ProductMainImagesUpdateLoader.loadMainImageUpdate(product, <{[key: string]: boolean}>context);
      },
    };
  }

}
