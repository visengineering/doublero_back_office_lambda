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
import { ProductGeneralShopifyBuilder } from '../../../../src/service/product/builder/general/ProductGeneralShopifyBuilder';
import {
  ProductGeneralUpdateData,
  ProductMetafieldUpdateData,
  ProductTagsUpdateData,
  ShopifyGeneralMetafield,
  ShopifyMetafieldNamespace,
  ShopifyMetafieldType
} from '../../../../src/model/Shopify';
import { deepStrictEqual } from 'assert';
import { ProductLabel } from '../../../../src/model/Product';

jest.mock('../../../../src/service/shopify/ShopifyImageService', () => ({
  ShopifyImageService: {
    productAppendImage: jest.fn().mockImplementationOnce(() => Promise.resolve({ url: 'new url'}))
  }
}));

describe('service/product/builder/name/ProductGeneralShopifyBuilder', () => {

  const productId = TestHelper.prepareShopifyId();

  // incorrect data

  it(`buildUpdate for type: unsupported type`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateGeneralSubType.general, ProductUpdateType.categorization, {});
    const expression = () => {
      (new ProductGeneralShopifyBuilder()).buildUpdate(productId, update);
    };

    expect(expression).toThrow(NotAllowedError);
    expect(expression).toThrow(`Product update with type=${ProductUpdateType.categorization} is not supported`);
  });

  it(`buildUpdate for type: unsupported sub-type`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.atmospheres, ProductUpdateType.general, {});
    const expression = () => {
      (new ProductGeneralShopifyBuilder()).buildUpdate(productId, update);
    };

    expect(expression).toThrow(NotAllowedError);
    expect(expression).toThrow(
      `Product update with type=${ProductUpdateType.general} and sub type=${ProductUpdateCategorizationSubType.atmospheres} is not supported`
    );
  });

  // Tags

  it(`buildUpdate for type: ${ProductUpdateGeneralSubType.tags}`, () => {
    const tags = [
      'test',
      'test 2'
    ];

    const data: ProductUpdateTagsData = {
      tags: tags
    };

    const update = TestHelper.prepareUpdate(ProductUpdateGeneralSubType.tags, ProductUpdateType.general, data);

    const expected: ProductTagsUpdateData = {
      tags
    };

    const result = (new ProductGeneralShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  // General

  it(`buildUpdate for type: ${ProductUpdateGeneralSubType.general}`, () => {
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

    const update = TestHelper.prepareUpdate(ProductUpdateGeneralSubType.general, ProductUpdateType.general, data);

    const expected: ProductGeneralUpdateData = {
      productType: product_type,
    };

    const result = (new ProductGeneralShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateGeneralSubType.general}`, () => {
    const labels = [ProductLabel.exclusive, ProductLabel.personalized, ProductLabel.licensed];
    const designProject = 'whatever';

    const data: ProductUpdateLabelsData = {
      labels,
      design_project: designProject
    };

    const update = TestHelper.prepareUpdate(ProductUpdateGeneralSubType.labels, ProductUpdateType.general, data);

    const expected: ProductMetafieldUpdateData[] = [
      {
        productId,
        key: ShopifyGeneralMetafield.labels,
        namespace: ShopifyMetafieldNamespace.product,
        type: ShopifyMetafieldType.json,
        value: JSON.stringify(labels),
      },
      {
        productId,
        key: ShopifyGeneralMetafield.design_project,
        namespace: ShopifyMetafieldNamespace.product,
        type: ShopifyMetafieldType.string,
        value: designProject,
      }
    ];

    const result = (new ProductGeneralShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  // Square image  sadf

  it(`buildUpdate for type: ${ProductUpdateGeneralSubType.square_image}`, async () => {
    const data: ProductUpdateSquareImageData = {
      square_image_src: '111',
      square_image_src_upload_hash: '222',
      square_image_src_upload_url: '333',
    };

    const update = TestHelper.prepareUpdate(ProductUpdateGeneralSubType.square_image, ProductUpdateType.general, data);

    const expected: ProductMetafieldUpdateData[] = [{
      productId,
      key: ShopifyGeneralMetafield.square_image,
      namespace: ShopifyMetafieldNamespace.images,
      type: ShopifyMetafieldType.string,
      value: 'new url',
    }];

    const result = await (new ProductGeneralShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

});
