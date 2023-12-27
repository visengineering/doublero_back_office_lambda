import { Product } from 'common-db/model/Product';
import { ProductUpdateNameSubType, ProductUpdateType, Update, UpdateAction, } from '../../../../model/ProductUpdate';
import { ProductLoaders, ProductUpdateBuilder } from '../../ProductUpdateBuilder';

export class ProductNameUpdateBuilder extends ProductUpdateBuilder {

  protected updateType(): ProductUpdateType {
    return ProductUpdateType.name;
  }

  protected loaders(): ProductLoaders {
    return {
      [ProductUpdateNameSubType.name]: (product: Product) => {
        return Promise.resolve(this.prepareNameData(product));
      },
      [ProductUpdateNameSubType.url]: (product: Product) => {
        return Promise.resolve(this.prepareUrlData(product));
      },
    };
  }

  private prepareNameData(product: Product): Update {
    return this.prepareUpdate(
      ProductUpdateType.name,
      ProductUpdateNameSubType.name,
      { title: product.title, description: product.description },
      UpdateAction.update
    );
  }

  private prepareUrlData(product: Product): Update {
    return this.prepareUpdate(ProductUpdateType.name, ProductUpdateNameSubType.url, { url: product.url }, UpdateAction.update);
  }
}
