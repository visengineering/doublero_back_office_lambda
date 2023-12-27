import { deepStrictEqual } from 'assert';
import { ProductNameAlgoliaBuilder } from '../../../../src/service/product/builder/name/ProductNameAlgoliaBuilder';
import { TestHelper } from '../../../TestHelper';
import {
  ProductUpdateCategorizationSubType,
  ProductUpdateNameData,
  ProductUpdateNameSubType,
  ProductUpdateType,
  ProductUpdateUrlData,
  UpdateAction
} from '../../../../src/model/ProductUpdate';
import { NotAllowedError } from 'common-util/error/NotAllowedError';
import { AlgoliaProductNameSubType, AlgoliaProductUrlSubType } from '../../../../src/model/Algolia';

describe('service/product/builder/name/ProductNameAlgoliaBuilder', () => {

  // incorrect data

  it(`buildUpdate for type: unsupported type`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateNameSubType.url, ProductUpdateType.categorization, {});
    const expression = () => {
      (new ProductNameAlgoliaBuilder()).buildUpdate(update);
    };

    expect(expression).toThrow(NotAllowedError);
    expect(expression).toThrow(`Product update with type=${ProductUpdateType.categorization} is not supported`);
  });

  it(`buildUpdate for type: unsupported sub-type`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.atmospheres, ProductUpdateType.name, {});
    const expression = () => {
      (new ProductNameAlgoliaBuilder()).buildUpdate(update);
    };

    expect(expression).toThrow(NotAllowedError);
    expect(expression).toThrow(
      `Product update with type=${ProductUpdateType.name} and sub type=${ProductUpdateCategorizationSubType.atmospheres} is not supported`
    );
  });

  // name

  it(`buildUpdate for type: ${ProductUpdateNameSubType.name}`, () => {
    const data: ProductUpdateNameData = {
      title: 'Golden Love II Wall Art',
      description: 'Golden Love II highlights the bonding and beauty of relationships.',
    };
    const update = TestHelper.prepareUpdate(ProductUpdateNameSubType.name, ProductUpdateType.name, data);

    const expected: AlgoliaProductNameSubType = {
      title: 'Golden Love II Wall Art',
      description: 'Golden Love II highlights the bonding and beauty of relationships.',
    };
    const result = (new ProductNameAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateNameSubType.name} (delete)`, () => {
    const data: ProductUpdateNameData = {
      title: 'Golden Love II Wall Art',
      description: 'Golden Love II highlights the bonding and beauty of relationships.',
    };

    const update = TestHelper.prepareUpdate(ProductUpdateNameSubType.name, ProductUpdateType.name, data, UpdateAction.delete);

    const expression = () => {
      (new ProductNameAlgoliaBuilder()).buildUpdate(update);
    };

    expect(expression).toThrow(NotAllowedError);
    expect(expression).toThrow(`Action ${UpdateAction.delete} is not supported for type '${ProductUpdateType.name}' and subtype '${ProductUpdateNameSubType.name}'`);
  });

  it(`buildUpdate for type: ${ProductUpdateNameSubType.name} (partial data)`, () => {
    const data: ProductUpdateNameData = {
      title: 'Golden Love II Wall Art',
    };
    const update = TestHelper.prepareUpdate(ProductUpdateNameSubType.name, ProductUpdateType.name, data);

    const expected: AlgoliaProductNameSubType = {
      title: 'Golden Love II Wall Art',
      description: '',
    };
    const result = (new ProductNameAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });


  // url


  it(`buildUpdate for type: ${ProductUpdateNameSubType.url}`, () => {
    const data: ProductUpdateUrlData = {
      url: '/products/golden-love-ii-wall-art'
    };
    const update = TestHelper.prepareUpdate(ProductUpdateNameSubType.url, ProductUpdateType.name, data);

    const expected: AlgoliaProductUrlSubType = {
      url: '/products/golden-love-ii-wall-art'
    };
    const result = (new ProductNameAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateNameSubType.url} (delete)`, () => {
    const data: ProductUpdateUrlData = {
      url: '/products/golden-love-ii-wall-art'
    };

    const update = TestHelper.prepareUpdate(ProductUpdateNameSubType.url, ProductUpdateType.name, data, UpdateAction.delete);

    const expression = () => {
      (new ProductNameAlgoliaBuilder()).buildUpdate(update);
    };

    expect(expression).toThrow(NotAllowedError);
    expect(expression).toThrow(`Action ${UpdateAction.delete} is not supported for type '${ProductUpdateType.name}' and subtype '${ProductUpdateNameSubType.url}'`);
  });

});
