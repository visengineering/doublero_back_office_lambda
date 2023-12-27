import {
  ProductUpdateBaseData,
  ProductUpdateGeneralData,
  ProductUpdateGeneralSubType,
  ProductUpdateLabelsData,
  ProductUpdateProjectSourceData,
  ProductUpdateType,
  Update,
  UpdateAction,
} from '../../../../model/ProductUpdate';
import { Product } from 'common-db/model/Product';
import { ProductLoaders, ProductUpdateBuilder } from '../../ProductUpdateBuilder';
import { ProductDBService } from 'common-db/service/ProductDBService';
import { ProductLabel } from '../../../../model/Product';

export class ProductGeneralUpdateBuilder extends ProductUpdateBuilder {

  protected updateType(): ProductUpdateType {
    return ProductUpdateType.general;
  }

  protected loaders(): ProductLoaders {
    return {
      [ProductUpdateGeneralSubType.general]: (product: Product) => {
        return Promise.resolve(this.prepareGeneralData(product));
      },
      [ProductUpdateGeneralSubType.sku]: (product: Product) => {
        return Promise.resolve(this.prepareSkuData(product));
      },
      [ProductUpdateGeneralSubType.labels]: (product: Product) => {
        return Promise.resolve(this.prepareLabelsData(product));
      },
      [ProductUpdateGeneralSubType.tags]: (product: Product) => {
        return Promise.resolve(this.prepareTagsData(product));
      },
      [ProductUpdateGeneralSubType.project_source]: (product: Product) => {
        return Promise.resolve(this.prepareStoryData(product));
      },
    };
  }

  private prepareTagsData(product: Product): Update {
    const extras = product?.extra_data?.find(extra => extra);

    const tags = ProductDBService.filterProductTags(extras?.product_tags || []);

    return this.prepareUpdate(ProductUpdateType.general, ProductUpdateGeneralSubType.tags, { tags }, UpdateAction.update);
  }

  private prepareLabelsData(product: Product): Update {
    const data: ProductUpdateLabelsData = {
      labels: [],
    };

    const extras = product?.extra_data?.find(extra => extra);

    if (product.exclusive) data.labels.push(ProductLabel.exclusive);
    if (product.personalized) data.labels.push(ProductLabel.personalized);
    if (product.hot_deal) data.labels.push(ProductLabel.hot_deal);
    if (product.push_pin) data.labels.push(ProductLabel.push_pin);
    if (extras?.brand?.name) data.labels.push(ProductLabel.licensed);
    if (extras?.designProject) data.design_project = extras.designProject;

    return this.prepareUpdate(ProductUpdateType.general, ProductUpdateGeneralSubType.labels, data, UpdateAction.update);
  }

  private prepareGeneralData(product: Product): Update {
    const data: ProductUpdateGeneralData = {
      sku: product.sku,
      product_type: product.product_type,
      created_at: product.created_at || null,
      last_updated_at: product.last_updated || null,
      published_at: product.published_at || null,
      vendor: 'ElephantStock',
      shopify_id: product.shopify_id,
      options: [
        {
          name: 'Layout',
          position: 1,
        },
        {
          name: 'Size',
          position: 2,
        },
      ],
      published: (product.edit_status === 'approved')
    };

    return this.prepareUpdate(ProductUpdateType.general, ProductUpdateGeneralSubType.general, data, UpdateAction.update);
  }

  private prepareSkuData(product: Product): Update {
    const data: ProductUpdateBaseData = {
      sku: product.sku
    };

    return this.prepareUpdate(ProductUpdateType.general, ProductUpdateGeneralSubType.sku, data, UpdateAction.update);
  }

  private prepareStoryData(product: Product): Update {
    const extras = product?.extra_data?.find(extra => extra);

    const data: ProductUpdateProjectSourceData = {
      story: extras?.story || '',
    };

    return this.prepareUpdate(ProductUpdateType.general, ProductUpdateGeneralSubType.project_source, data, UpdateAction.update);
  }

}
