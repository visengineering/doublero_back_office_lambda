import { ProductUpdateGeneralSubType, ProductUpdateType, Update } from '../../../../src/model/ProductUpdate';
import { deepStrictEqual } from 'assert';
import { ProductLabel } from '../../../../src/model/Product';
import { Product } from 'common-db/model/Product';
import { ProductGeneralUpdateBuilder } from '../../../../src/service/product/builder/general/ProductGeneralUpdateBuilder';
import { TestHelper } from '../../../TestHelper';
// test compile
describe('service/product/builder/general/ProductGeneralUpdateBuilder', () => {

  it(`prepare Labels update data: exclusive + personalized`, async () => {
    const product: Partial<Product> = {
      exclusive: true,
      hot_deal: false,
      personalized: true,
    };

    const result = await (new ProductGeneralUpdateBuilder()
      .loadUpdates(<Product>product, [ProductUpdateGeneralSubType.labels]));

    const update = TestHelper.prepareUpdate(ProductUpdateGeneralSubType.labels, ProductUpdateType.general, {
      labels: [ProductLabel.exclusive, ProductLabel.personalized]
    });
    const expected: Update[] = [update];

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`prepare Labels update data: hot_deal`, async () => {
    const product: Partial<Product> = {
      exclusive: false,
      hot_deal: true,
    };

    const result = await (new ProductGeneralUpdateBuilder()
      .loadUpdates(<Product>product, [ProductUpdateGeneralSubType.labels]));

    const update = TestHelper.prepareUpdate(ProductUpdateGeneralSubType.labels, ProductUpdateType.general, {
      labels: [ProductLabel.hot_deal]
    });
    const expected: Update[] = [update];

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`prepare Labels update data: hot_deal + licensed`, async () => {
    const product: Partial<Product> = {
      hot_deal: true,
      extra_data: [{
        brand: {
          name: 'Test Brand'
        },
        designProject: 'Some fancy project'
      }]
    };

    const result = await (new ProductGeneralUpdateBuilder()
      .loadUpdates(<Product>product, [ProductUpdateGeneralSubType.labels]));

    const update = TestHelper.prepareUpdate(ProductUpdateGeneralSubType.labels, ProductUpdateType.general, {
      labels: [ProductLabel.hot_deal, ProductLabel.licensed],
      design_project: 'Some fancy project',
    });
    const expected: Update[] = [update];

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`prepare Labels update data: branded`, async () => {
    const product: Partial<Product> = {
      extra_data: [{
        brand: {
          name: 'some brand'
        }
      }]
    };

    const result = await (new ProductGeneralUpdateBuilder()
      .loadUpdates(<Product>product, [ProductUpdateGeneralSubType.labels]));

    const update = TestHelper.prepareUpdate(ProductUpdateGeneralSubType.labels, ProductUpdateType.general, {
      labels: [ProductLabel.licensed],
    });
    const expected: Update[] = [update];

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`prepare Labels update data: not branded`, async () => {
    const product: Partial<Product> = {
      extra_data: [{
        brand: {}
      }]
    };

    const result = await (new ProductGeneralUpdateBuilder()
      .loadUpdates(<Product>product, [ProductUpdateGeneralSubType.labels]));

    const update = TestHelper.prepareUpdate(ProductUpdateGeneralSubType.labels, ProductUpdateType.general, {
      labels: [],
    });
    const expected: Update[] = [update];

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });
});
