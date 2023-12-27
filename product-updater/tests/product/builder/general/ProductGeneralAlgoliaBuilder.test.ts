import { ProductGeneralAlgoliaBuilder } from '../../../../src/service/product/builder/general/ProductGeneralAlgoliaBuilder';
import { TestHelper } from '../../../TestHelper';
import {
  ProductUpdateCategorizationSubType,
  ProductUpdateGeneralData,
  ProductUpdateGeneralSubType,
  ProductUpdateLabelsData,
  ProductUpdateSquareImageData,
  ProductUpdateTagsData,
  ProductUpdateType
} from '../../../../src/model/ProductUpdate';
import { NotAllowedError } from 'common-util/error/NotAllowedError';
import { deepStrictEqual } from 'assert';
import {
  AlgoliaProductGeneralSubType,
  AlgoliaProductLabelsSubType,
  AlgoliaProductMainImageType,
  AlgoliaProductTagsSubType
} from '../../../../src/model/Algolia';
import { ProductLabel } from '../../../../src/model/Product';
// test compile
describe('service/product/builder/general/ProductGeneralAlgoliaBuilder', () => {
  // incorrect data

  it(`buildUpdate for type: unsupported type`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateGeneralSubType.general, ProductUpdateType.categorization, {});
    const expression = () => {
      (new ProductGeneralAlgoliaBuilder()).buildUpdate(update);
    };

    expect(expression).toThrow(NotAllowedError);
    expect(expression).toThrow(`Product update with type=${ProductUpdateType.categorization} is not supported`);
  });

  it(`buildUpdate for type: unsupported sub-type`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.atmospheres, ProductUpdateType.general, {});
    const expression = () => {
      (new ProductGeneralAlgoliaBuilder()).buildUpdate(update);
    };

    expect(expression).toThrow(NotAllowedError);
    expect(expression).toThrow(
      `Product update with type=${ProductUpdateType.general} and sub type=${ProductUpdateCategorizationSubType.atmospheres} is not supported`
    );
  });

  it(`buildUpdate for sub-type: ${ProductUpdateGeneralSubType.tags}`, () => {
    const data: ProductUpdateTagsData = {
      tags: [
        'test',
        'test 2'
      ],
    };

    const expected: AlgoliaProductTagsSubType = {
      tags: [
        'test',
        'test 2'
      ],
      tags_auto: []
    };

    const update = TestHelper.prepareUpdate(ProductUpdateGeneralSubType.tags, ProductUpdateType.general, data);

    const result = (new ProductGeneralAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for sub-type: ${ProductUpdateGeneralSubType.general}`, () => {
    const created_at = new Date('Tue Apr 19 2022 17:20:01 GMT+0200 (Central European Summer Time)');
    const published_at = new Date('Tue Apr 19 2022 17:20:30 GMT+0200 (Central European Summer Time)');
    const last_updated_at = new Date('Tue Apr 19 2022 17:21:16 GMT+0200 (Central European Summer Time)');
    const shopify_id = 123321;
    const sku = 'HEL-LL-OO';
    const product_type = 'whatever';

    const data: ProductUpdateGeneralData = {
      sku,
      shopify_id,
      created_at,
      published_at,
      last_updated_at,
      product_type,
      vendor: 'Elephantstock',
      options: [],
      published: true,
    };

    const expected: AlgoliaProductGeneralSubType = {
      sku,
      shopify_id,
      created_at: created_at.getTime(),
      published_at: published_at.getTime(),
      last_updated_at: last_updated_at.getTime(),
      product_type,
    };

    const update = TestHelper.prepareUpdate(ProductUpdateGeneralSubType.general, ProductUpdateType.general, data);

    const result = (new ProductGeneralAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for sub-type: ${ProductUpdateGeneralSubType.labels}`, () => {
    const data: ProductUpdateLabelsData = {
      labels: [ProductLabel.exclusive, ProductLabel.personalized, ProductLabel.licensed],
      design_project: 'whatever'
    };

    const expected: AlgoliaProductLabelsSubType = {
      labels: [ProductLabel.exclusive, ProductLabel.personalized, ProductLabel.licensed],
      design_project: 'whatever'
    };

    const update = TestHelper.prepareUpdate(ProductUpdateGeneralSubType.labels, ProductUpdateType.general, data);

    const result = (new ProductGeneralAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for sub-type: ${ProductUpdateGeneralSubType.square_image}`, () => {
    const data: ProductUpdateSquareImageData = {
      square_image_cdn: 'https://google.com',
      square_image_src: '',
      square_image_src_upload_hash: '',
      square_image_src_upload_url: '',
    };

    const expected: AlgoliaProductMainImageType = {
      square_image: 'https://google.com',
      main_image: data.square_image_src
    };

    const update = TestHelper.prepareUpdate(ProductUpdateGeneralSubType.square_image, ProductUpdateType.general, data);

    const result = (new ProductGeneralAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });
});
