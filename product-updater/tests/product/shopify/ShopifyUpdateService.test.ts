import { TestHelper } from '../../TestHelper';
import {
  ProductUpdateCategorizationSubType,
  ProductUpdateNameSubType,
  ProductUpdateType,
  UpdateAction
} from '../../../src/model/ProductUpdate';
import { ShopifyProductService } from '../../../src/service/shopify/ShopifyProductService';
import { ShopifyCategorizationMetafield, ShopifyMetafieldNamespace } from '../../../src/model/Shopify';
import { ShopifyUpdateService } from '../../../src/service/product/shopify/ShopifyUpdateService';
import { ProductCategorizationHelper } from '../../../src/service/product/builder/categorization/ProductCategorizationHelper';

jest.mock('../../../src/service/shopify/ShopifyProductService', () => ({
  ShopifyProductService: {
    updateRawProductData: jest.fn(),
    getShopDataNamespace: jest.fn(),
    setProductMetafields: jest.fn(),
    deleteProductMetafield: jest.fn(),
  }
}));

jest.mock('common-db/service/DBService', () => ({
  DBService: {
    PRODUCTS_CHANGE_LOGS: 'whatever',
    // ts-ignore
    getCollection: jest.fn().mockReturnValue({
      insertOne: jest.fn().mockImplementationOnce(() => {
        // NO-OP
      })
    })
  }
}));

describe('service/product/shopify/ShopifyUpdateService', () => {

  it(`handleProductUpdate (multiple updates)`, async () => {
    const categorizationUpdates = [
      TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.artist, ProductUpdateType.categorization, {
        name: 'James Bond',
        identifier: 'james-bond'
      }),
      TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_main, ProductUpdateType.categorization, {
        main_color: {
          identifier: 'limegreen',
          name: 'Limegreen'
        }
      }),
      TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.mediums, ProductUpdateType.categorization, {
        mediums: [
          { identifier: 'photography', name: 'Photography' },
          {
            identifier: 'hand-drawings-and-sketches',
            name: 'Hand Drawings and Sketches'
          }
        ]
      }, UpdateAction.delete),
      TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.atmospheres,
        ProductUpdateType.categorization, {}, UpdateAction.delete),
    ];
    const nameUpdates = [
      TestHelper.prepareUpdate(ProductUpdateNameSubType.name, ProductUpdateType.name, {
        title: 'Golden Love II Wall Art',
        description: 'Golden Love II highlights the bonding and beauty of relationships.'
      }),
      TestHelper.prepareUpdate(ProductUpdateNameSubType.url, ProductUpdateType.name, {
        url: '/products/golden-love-ii-wall-art',
      }),
    ];
    const update = TestHelper.prepareProductUpdate([...categorizationUpdates, ...nameUpdates]);

    await ShopifyUpdateService.handleProductUpdate(update);

    const updateRawProductDataSpy = jest.spyOn(ShopifyProductService, 'updateRawProductData');
    const setProductMetafieldsSpy = jest.spyOn(ShopifyProductService, 'setProductMetafields');
    const deleteProductMetafieldSpy = jest.spyOn(ShopifyProductService, 'deleteProductMetafield');

    expect(updateRawProductDataSpy).toBeCalledTimes(1);
    expect(updateRawProductDataSpy).toHaveBeenCalledWith(update.shopify_id,
      {
        title: 'Golden Love II Wall Art',
        descriptionHtml: 'Golden Love II highlights the bonding and beauty of relationships.',
        handle: 'golden-love-ii-wall-art',
        redirectNewHandle: true,
      }
    );

    expect(setProductMetafieldsSpy).toBeCalledTimes(1);
    expect(setProductMetafieldsSpy).toBeCalledWith([
      TestHelper.prepareMetafieldUpdate(update.shopify_id, ShopifyCategorizationMetafield.artist,
        `james-bond-${ProductCategorizationHelper.SHOP_CATEGORIZATION_HANDLE_SUFFIX}`, ShopifyMetafieldNamespace.categorization),
      TestHelper.prepareMetafieldUpdate(update.shopify_id, ShopifyCategorizationMetafield.colors_main,
        `limegreen-${ProductCategorizationHelper.SHOP_CATEGORIZATION_HANDLE_SUFFIX}`, ShopifyMetafieldNamespace.categorization),
    ]);

    expect(deleteProductMetafieldSpy).toBeCalledTimes(2);
    expect(deleteProductMetafieldSpy).toHaveBeenNthCalledWith(1,
      TestHelper.prepareMetafieldUpdate(update.shopify_id, ShopifyCategorizationMetafield.mediums, '', ShopifyMetafieldNamespace.categorization)
    );
    expect(deleteProductMetafieldSpy).toHaveBeenNthCalledWith(2,
      TestHelper.prepareMetafieldUpdate(update.shopify_id,
        ShopifyCategorizationMetafield.atmospheres, '', ShopifyMetafieldNamespace.categorization)
    );
  });

});
