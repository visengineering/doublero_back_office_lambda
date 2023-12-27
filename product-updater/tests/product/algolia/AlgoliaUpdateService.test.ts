import { TestHelper } from '../../TestHelper';
import { ProductUpdateCategorizationSubType, ProductUpdateNameSubType, ProductUpdateType } from '../../../src/model/ProductUpdate';
import { AlgoliaProductService } from '../../../src/service/algolia/AlgoliaProductService';
import { AlgoliaUpdateService } from '../../../src/service/product/algolia/AlgoliaUpdateService';

jest.mock('../../../src/service/algolia/AlgoliaProductService', () => ({
  AlgoliaProductService: {
    updateProductPartial: jest.fn()
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

describe('service/product/algolia/AlgoliaUpdateService', () => {

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
      }),
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
    const productUpdates = [...categorizationUpdates, ...nameUpdates];
    const update = TestHelper.prepareProductUpdate(productUpdates);

    await AlgoliaUpdateService.handleProductUpdate(update);

    const updateProductPartialSpy = jest.spyOn(AlgoliaProductService, 'updateProductPartial');
    expect(updateProductPartialSpy).toBeCalledWith({
      objectID: update.sku,
      title: 'Golden Love II Wall Art',
      description: 'Golden Love II highlights the bonding and beauty of relationships.',
      url: '/products/golden-love-ii-wall-art',
      artist_name: 'James Bond',
      extra_colors_main_lv1: 'Limegreen',
      extra_colors_main_lv2: '',
      extra_mediums: ['Photography', 'Hand Drawings and Sketches'],
    });
  });

});
