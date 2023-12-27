import { ProductLoaders, ProductUpdateBuilder } from '../../ProductUpdateBuilder';
import {
  ProductImagesUpdate,
  ProductUpdatePreviewsSubType,
  ProductUpdateSubType,
  ProductUpdateType,
  UpdateAction
} from '../../../../model/ProductUpdate';
import { Product, ProductLayout } from 'common-db/model/Product';
import { ProductLayoutsDBService } from 'common-db/service/ProductLayoutsDBService';
import { ProductPreviews3dUpdateLoader } from './loaders/ProductPreviews3dUpdateLoader';
import { ProductPreviewsRoomUpdateLoader } from './loaders/ProductPreviewsRoomUpdateLoader';

export class ProductPreviewsUpdateBuilder extends ProductUpdateBuilder {

  protected updateType(): ProductUpdateType {
    return ProductUpdateType.previews;
  }

  protected loaders(): ProductLoaders {
    return {
      [ProductUpdatePreviewsSubType.layouts]: async (product: Product) => {
        const layouts = await ProductLayoutsDBService.prepareLayouts(product);

        return {
          updates: [
            this.prepareUpdate(ProductUpdateType.previews, ProductUpdatePreviewsSubType.layouts, layouts, UpdateAction.update)
          ],
          images: []
        };
      },
      [ProductUpdatePreviewsSubType.previews_3d]: (product: Product, context?: unknown) => {
        return ProductPreviews3dUpdateLoader.load3dPreviews(product, <ProductLayout[]>context);
      },
      [ProductUpdatePreviewsSubType.previews_room]: (product: Product, context?: unknown) => {
        return ProductPreviewsRoomUpdateLoader.loadRoomPreviews(product, <ProductLayout[]>context);
      },
    };
  }

  public async loadRelatedUpdates(product: Product, subTypes: ProductUpdateSubType[]): Promise<Promise<ProductImagesUpdate>[]> {
    const result: Map<string, Promise<ProductImagesUpdate>> = new Map();
    const layoutsData = await this.getImageLoader(this.loaders(), ProductUpdatePreviewsSubType.layouts)(product);

    const productLayouts = <ProductLayout[]>layoutsData.updates.find(u => u)?.data;
    result.set(ProductUpdatePreviewsSubType.layouts, Promise.resolve<ProductImagesUpdate>(layoutsData));

    for (const subType of subTypes) {
      if (!result.has(subType)) {
        result.set(subType, this.getImageLoader(this.loaders(), subType)(product, productLayouts));
      }
    }

    return [...result.values()];
  }
}
