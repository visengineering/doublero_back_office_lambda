import {
  ProductUpdateCategorizationSubType,
  ProductUpdateNameSubType,
  ProductUpdatePreviewsSubType,
  ProductUpdateType
} from '../../src/model/ProductUpdate';
import { BadRequestError } from 'common-util/error/BadRequestError';
import { ProductUpdateHelper } from '../../src/service/product/ProductUpdateHelper';

describe('service/product/ProductUpdateHelper', () => {

  it(`getUpdateSubTypes (default)`, async () => {
    const categorizationSubTypes = ProductUpdateHelper.getUpdateSubTypes<ProductUpdateCategorizationSubType>(
      ProductUpdateType.categorization
    );
    const expectedCategorizationSubTypes = [
      ProductUpdateCategorizationSubType.artist,
      ProductUpdateCategorizationSubType.atmospheres,
      ProductUpdateCategorizationSubType.businesses,
      ProductUpdateCategorizationSubType.personas,
      ProductUpdateCategorizationSubType.occasions,
      ProductUpdateCategorizationSubType.categories_guest,
      ProductUpdateCategorizationSubType.categories_main,
      ProductUpdateCategorizationSubType.categories_all,
      ProductUpdateCategorizationSubType.colors_main,
      ProductUpdateCategorizationSubType.colors_secondary,
      ProductUpdateCategorizationSubType.mediums,
      ProductUpdateCategorizationSubType.styles,
    ];

    const nameSubTypes = ProductUpdateHelper.getUpdateSubTypes<ProductUpdateNameSubType>(ProductUpdateType.name);
    const expectedNameSubTypes = [
      ProductUpdateNameSubType.name,
      ProductUpdateNameSubType.url,
    ];

    expect(categorizationSubTypes.sort()).toEqual(expectedCategorizationSubTypes.sort());
    expect(nameSubTypes.sort()).toEqual(expectedNameSubTypes.sort());
  });

  it(`getUpdateSubTypes (user specified)`, async () => {
    const categorizationSubTypes = ProductUpdateHelper.getUpdateSubTypes<ProductUpdateCategorizationSubType>(
      ProductUpdateType.categorization,
      [ProductUpdateCategorizationSubType.atmospheres, ProductUpdateCategorizationSubType.colors_main]
    );

    const expectedCategorizationSubTypes = [
      ProductUpdateCategorizationSubType.atmospheres,
      ProductUpdateCategorizationSubType.colors_main,
    ];

    const nameSubTypes = ProductUpdateHelper.getUpdateSubTypes<ProductUpdateNameSubType>(ProductUpdateType.name, [
      ProductUpdateNameSubType.url,
    ]);
    const expectedNameSubTypes = [
      ProductUpdateNameSubType.url,
    ];

    expect(categorizationSubTypes.sort()).toEqual(expectedCategorizationSubTypes.sort());
    expect(nameSubTypes).toEqual(expectedNameSubTypes);
  });

  it(`getUpdateSubTypes (user specified, incorrect all)`, async () => {
    const expression = () => {
      ProductUpdateHelper.getUpdateSubTypes<ProductUpdateCategorizationSubType>(ProductUpdateType.categorization,
        [ProductUpdateNameSubType.name, ProductUpdatePreviewsSubType.previews_room]);
    };

    expect(expression).toThrow(BadRequestError);
    expect(expression).toThrow('Some of the requested subtypes are incorrect');
  });

  it(`getUpdateSubTypes (user specified, incorrect partial)`, async () => {
    const expression = () => {
      ProductUpdateHelper.getUpdateSubTypes<ProductUpdateCategorizationSubType>(ProductUpdateType.categorization,
        [ProductUpdateCategorizationSubType.atmospheres, ProductUpdatePreviewsSubType.previews_room]);
    };

    expect(expression).toThrow(BadRequestError);
    expect(expression).toThrow('Some of the requested subtypes are incorrect');
  });

});
