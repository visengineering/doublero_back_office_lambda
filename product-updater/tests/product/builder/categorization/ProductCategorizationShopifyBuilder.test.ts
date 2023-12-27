import { deepStrictEqual } from 'assert';
import { TestHelper } from '../../../TestHelper';
import {
  ProductUpdateArtistData,
  ProductUpdateAtmospheresData,
  ProductUpdateBusinessesData,
  ProductUpdateCategoriesData,
  ProductUpdateCategorizationSubType,
  ProductUpdateColorsData,
  ProductUpdateMediumsData,
  ProductUpdateNameSubType,
  ProductUpdateStylesData,
  ProductUpdateType,
  UpdateAction
} from '../../../../src/model/ProductUpdate';
import {
  ProductCategorizationShopifyBuilder
} from '../../../../src/service/product/builder/categorization/ProductCategorizationShopifyBuilder';
import { ShopifyCategorizationMetafield, ShopifyMetafieldNamespace, ShopifySkipMetafield } from '../../../../src/model/Shopify';
import { ProductCategorizationHelper } from '../../../../src/service/product/builder/categorization/ProductCategorizationHelper';
import { NotAllowedError } from 'common-util/error/NotAllowedError';

describe('service/product/builder/categorization/ProductCategorizationShopifyBuilder.ts', () => {
  const suffix = ProductCategorizationHelper.SHOP_CATEGORIZATION_HANDLE_SUFFIX;
  const div = ProductCategorizationHelper.SHOP_CATEGORIZATION_HANDLE_SEPARATOR;

  const productId = TestHelper.prepareShopifyId();

  function prepareCategorizationMetafield(productId: number, key: ShopifyCategorizationMetafield | ShopifySkipMetafield, value: string) {
    return TestHelper.prepareMetafieldUpdate(productId, key, value, ShopifyMetafieldNamespace.categorization);
  }

  // incorrect data

  it(`buildUpdate for type: unsupported type`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.artist, ProductUpdateType.general, {});
    const expression = () => {
      (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);
    };

    expect(expression).toThrow(NotAllowedError);
    expect(expression).toThrow(`Product update with type=${ProductUpdateType.general} is not supported`);
  });

  it(`buildUpdate for type: unsupported sub-type`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateNameSubType.name, ProductUpdateType.categorization, {});
    const expression = () => {
      (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);
    };

    expect(expression).toThrow(NotAllowedError);
    expect(expression).toThrow(
      `Product update with type=${ProductUpdateType.categorization} and sub type=${ProductUpdateNameSubType.name} is not supported`
    );
  });

  // Artist

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.artist}`, () => {
    const data: ProductUpdateArtistData = {
      name: 'James Bond',
      identifier: 'james-bond'
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.artist, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.artist, `james-bond-${suffix}`);
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.artist} (delete)`, () => {
    const data: ProductUpdateArtistData = {
      name: 'James Bond',
      identifier: 'james-bond'
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.artist, ProductUpdateType.categorization,
      data, UpdateAction.delete);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.artist, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.artist} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.artist, ProductUpdateType.categorization, {});

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.artist, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.artist} (partial data)`, () => {
    const data: ProductUpdateArtistData = {
      name: '',
      identifier: ''
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.artist, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.artist, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });


  // Atmospheres


  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.atmospheres}`, () => {
    const data: ProductUpdateAtmospheresData = {
      atmospheres: [{
        identifier: 'festive',
        name: 'Festive'
      }]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.atmospheres, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.atmospheres, `festive-${suffix}`);
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.atmospheres} (multiple)`, () => {
    const data: ProductUpdateAtmospheresData = {
      atmospheres: [{
        identifier: 'festive',
        name: 'Festive'
      },
        {
          identifier: 'festive-123',
          name: 'Festive 2'
        }]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.atmospheres, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.atmospheres,
      `festive-${suffix}${div}festive-123-${suffix}`);
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.atmospheres} (delete)`, () => {
    const data: ProductUpdateAtmospheresData = {
      atmospheres: [{
        identifier: 'festive',
        name: 'Festive'
      }]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.atmospheres, ProductUpdateType.categorization,
      data, UpdateAction.delete);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.atmospheres, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.atmospheres} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.atmospheres, ProductUpdateType.categorization, {});

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.atmospheres, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.atmospheres} (partial data 1)`, () => {
    const data: ProductUpdateAtmospheresData = {
      atmospheres: []
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.atmospheres, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.atmospheres, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.atmospheres} (partial data 2)`, () => {
    const data: ProductUpdateAtmospheresData = {
      atmospheres: [{
        identifier: '',
        name: ''
      }]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.atmospheres, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.atmospheres, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });


  // businesses


  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.businesses}`, () => {
    const data: ProductUpdateBusinessesData = {
      businesses: [
        { name: 'By Office', identifier: 'by-office' },
        {
          name: 'Corporate',
          identifier: 'corporate',
          parents: [
            { name: 'By Office', identifier: 'by-office', level: 1 },
            { name: 'By Style', identifier: 'by-style', level: 0 }
          ]
        },
        { name: 'By Vibe', identifier: 'by-vibe' }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.businesses, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.businesses,
      `by-office-${suffix}${div}corporate-${suffix}${div}by-vibe-${suffix}`);
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.businesses} (small tree)`, () => {
    const data: ProductUpdateBusinessesData = {
      businesses: [
        { name: 'By Office', identifier: 'by-office' },
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.businesses, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.businesses, `by-office-${suffix}`);
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.businesses} (delete)`, () => {
    const data: ProductUpdateBusinessesData = {
      businesses: [
        { name: 'By Office', identifier: 'by-office' },
        {
          name: 'Corporate',
          identifier: 'corporate',
          parents: [
            { name: 'By Style', identifier: 'by-style', level: 0 }
          ]
        }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.businesses, ProductUpdateType.categorization,
      data, UpdateAction.delete);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.businesses, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.businesses} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.businesses, ProductUpdateType.categorization, {});

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.businesses, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.businesses} (partial data 1)`, () => {
    const data: ProductUpdateBusinessesData = {
      businesses: []
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.businesses, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.businesses, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.businesses} (partial data 2)`, () => {
    const data: ProductUpdateBusinessesData = {
      businesses: [
        { name: '', identifier: '' },
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.businesses, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.businesses, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });


  // categories_guest


  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_guest}`, () => {
    const data: ProductUpdateCategoriesData = {
      guest_categories: [
        {
          name: 'Sky & Sea',
          identifier: 'sky-and-sea-1',
          slug: 'sky-and-sea',
          parents: [
            {
              name: 'Sky',
              identifier: 'sky-1',
              slug: 'sky',
              level: 0,
              suffix: 'wall-art'
            },
            {
              name: 'Nature',
              identifier: 'nature-1',
              slug: 'nature',
              level: 1,
              suffix: 'wall-art'
            }
          ],
          suffix: 'wall-art'
        },
        {
          name: 'Suspension Bridge',
          identifier: 'suspension-bridge-1',
          slug: 'suspension-bridge',
          parents: [
            {
              name: 'Architecture',
              identifier: 'architecture-1',
              slug: 'architecture',
              level: 2,
              suffix: 'wall-art'
            },
            {
              name: 'City Bridge',
              identifier: 'city-bridge-1',
              slug: 'city-bridge',
              level: 0,
              suffix: 'wall-art'
            },
            {
              name: 'Bridges',
              identifier: 'bridges-1',
              slug: 'bridges',
              level: 1,
              suffix: 'wall-art'
            }
          ],
          suffix: 'wall-art-123'
        },
        {
          name: 'Golden Gate Bridge',
          identifier: 'golden-gate-bridge-famous-bridges-1',
          slug: 'golden-gate-bridge-famous-bridges',
          parents: [
            {
              name: 'Architecture',
              identifier: 'architecture-1',
              slug: 'architecture',
              level: 2,
              suffix: 'wall-art'
            },
            {
              name: 'Bridges',
              identifier: 'bridges-1',
              slug: 'bridges',
              level: 1,
              suffix: 'wall-art'
            },
            {
              name: 'Famous Bridges',
              identifier: 'famous-bridges-1',
              slug: 'famous-bridges',
              level: 0,
              suffix: 'wall-art'
            }
          ],
          suffix: 'wall-art'
        },
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_guest, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.categories_guest,
      `sky-and-sea-${suffix}${div}suspension-bridge-${suffix}-123${div}golden-gate-bridge-famous-bridges-${suffix}`);
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_guest} (small tree)`, () => {
    const data: ProductUpdateCategoriesData = {
      guest_categories: [
        {
          name: 'Seascapes & Ocean',
          identifier: '',
          slug: 'seascapes-and-ocean',
          parents: [
            {
              name: 'Beach',
              identifier: '',
              slug: 'beach',
              level: 0,
              suffix: 'wall-art'
            },
            {
              name: 'Coastal & Nautical',
              identifier: '',
              slug: 'coastal-and-nautical',
              level: 1,
              suffix: 'wall-art'
            }
          ],
          suffix: '123'
        }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_guest, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.categories_guest, 'seascapes-and-ocean-123');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_guest} (delete)`, () => {
    const data: ProductUpdateCategoriesData = {
      guest_categories: [
        {
          name: 'Seascapes & Ocean',
          identifier: 'seascapes-and-ocean',
          parents: [
            {
              name: 'Beach',
              identifier: 'beach',
              level: 0,
              suffix: 'wall-art'
            },
            {
              name: 'Coastal & Nautical',
              identifier: 'coastal-and-nautical',
              level: 1,
              suffix: 'wall-art'
            }
          ],
          suffix: 'wall-art'
        }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_guest, ProductUpdateType.categorization,
      data, UpdateAction.delete);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.categories_guest, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_guest} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_guest, ProductUpdateType.categorization, {});

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.categories_guest, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_guest} (partial data 1)`, () => {
    const data: ProductUpdateCategoriesData = {
      guest_categories: []
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_guest, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.categories_guest, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_guest} (partial data 2)`, () => {
    const data: ProductUpdateCategoriesData = {
      guest_categories: [
        {
          name: '',
          identifier: '',
          suffix: ''
        }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_guest, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.categories_guest, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });


  // categories_main

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_main}`, () => {
    const data: ProductUpdateCategoriesData = {
      main_category: {
        name: 'Cape Town',
        identifier: 'cape-town-1',
        slug: 'cape-town',
        parents: [
          {
            name: 'Africa',
            identifier: 'africa-1',
            slug: 'africa',
            level: 1,
            suffix: 'wall-art'
          },
          {
            name: 'South Africa',
            identifier: 'south-africa-1',
            slug: 'south-africa',
            level: 0,
            suffix: 'wall-art'
          }
        ],
        suffix: 'canvas'
      }
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_main, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.categories_main, 'cape-town-canvas');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_main} (delete)`, () => {
    const data: ProductUpdateCategoriesData = {
      main_category: {
        name: 'Cape Town',
        identifier: '',
        slug: 'cape-town',
        parents: [
          {
            name: 'South Africa',
            identifier: '',
            slug: 'south-africa',
            level: 0,
            suffix: 'wall-art'
          },
          {
            name: 'Around The Globe',
            identifier: '',
            slug: 'around-the-globe',
            level: 1,
            suffix: 'wall-art'
          }
        ],
        suffix: 'wall-art'
      }
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_main, ProductUpdateType.categorization,
      data, UpdateAction.delete);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.categories_main, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_main} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_main, ProductUpdateType.categorization, {});

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.categories_main, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_main} (partial data)`, () => {
    const data: ProductUpdateCategoriesData = {
      main_category: {
        name: '',
        identifier: '',
        suffix: ''
      }
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_main, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.categories_main, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });


  // categories_all


  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_all}`, () => {
    const data: ProductUpdateCategoriesData = {
      categories_all: [
        {
          name: 'Seascapes & Ocean',
          identifier: 'seascapes-and-ocean-1',
          slug: 'seascapes-and-ocean',
          parents: [],
          suffix: 'wall-art'
        },
        {
          name: 'North American Architecture',
          identifier: '',
          slug: 'north-american-architecture',
          parents: [],
          suffix: 'wall-art'
        },
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_all, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, 'skip-metafield-update', '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_all} (delete)`, () => {
    const data: ProductUpdateCategoriesData = {
      categories_all: [
        {
          name: 'North American Architecture',
          identifier: 'north-american-architecture',
          parents: [
            {
              name: 'Architecture',
              identifier: 'architecture',
              level: 0,
              suffix: 'wall-art'
            }
          ],
          suffix: 'wall-art'
        },
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_all, ProductUpdateType.categorization,
      data, UpdateAction.delete);

    const expected = prepareCategorizationMetafield(productId, 'skip-metafield-update', '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_all} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_all, ProductUpdateType.categorization, {});

    const expected = prepareCategorizationMetafield(productId, 'skip-metafield-update', '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_all} (partial data 1)`, () => {
    const data: ProductUpdateCategoriesData = {
      categories_all: []
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_all, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, 'skip-metafield-update', '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_all} (partial data 2)`, () => {
    const data: ProductUpdateCategoriesData = {
      categories_all: [
        {
          name: '',
          identifier: '',
          suffix: ''
        }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_all, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, 'skip-metafield-update', '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });


  // colors_main


  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_main}`, () => {
    const data: ProductUpdateColorsData = {
      main_color: {
        identifier: 'limegreen',
        name: 'Limegreen',
        parents: [{
          identifier: 'green',
          name: 'Green'
        }]
      }
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_main, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.colors_main, `limegreen-${suffix}`);
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_main} (no level)`, () => {
    const data: ProductUpdateColorsData = {
      main_color: {
        identifier: 'limegreen232',
        name: 'Limegreen',
        parents: [{
          identifier: 'green',
          name: 'Green',
          level: 0
        }]
      }
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_main, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.colors_main, `limegreen232-${suffix}`);
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_main} (no parent)`, () => {
    const data: ProductUpdateColorsData = {
      main_color: {
        identifier: 'LIMEGREEN',
        name: 'Limegreen'
      }
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_main, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.colors_main, `LIMEGREEN-${suffix}`);
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_main} (delete)`, () => {
    const data: ProductUpdateColorsData = {
      main_color: {
        identifier: 'limegreen',
        name: 'Limegreen'
      }
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_main, ProductUpdateType.categorization,
      data, UpdateAction.delete);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.colors_main, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_main} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_main, ProductUpdateType.categorization, {});

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.colors_main, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_main} (partial data)`, () => {
    const data: ProductUpdateColorsData = {
      main_color: {
        identifier: '',
        name: ''
      }
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_main, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.colors_main, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });


  // colors_secondary


  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_secondary}`, () => {
    const data: ProductUpdateColorsData = {
      secondary_colors: [
        {
          identifier: 'limegreen', name: 'Limegreen', parents: [{
            identifier: 'green',
            name: 'Green'
          }]
        },
        { identifier: 'olive', name: 'Olive' },
        { identifier: 'dove-gray', name: 'Dove-Gray' }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_secondary, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.colors_secondary,
      `limegreen-${suffix}${div}olive-${suffix}${div}dove-gray-${suffix}`);
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_secondary} (small tree)`, () => {
    const data: ProductUpdateColorsData = {
      secondary_colors: [
        { identifier: 'limegreen', name: 'Limegreen' },
        { identifier: 'olive', name: 'Olive' }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_secondary, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.colors_secondary,
      `limegreen-${suffix}${div}olive-${suffix}`);
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_secondary} (delete)`, () => {
    const data: ProductUpdateColorsData = {
      secondary_colors: [
        { identifier: 'limegreen', name: 'Limegreen' },
        { identifier: 'olive', name: 'Olive' }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_secondary, ProductUpdateType.categorization,
      data, UpdateAction.delete);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.colors_secondary, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_secondary} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_secondary, ProductUpdateType.categorization, {});

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.colors_secondary, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_secondary} (partial data 1)`, () => {
    const data: ProductUpdateColorsData = {
      secondary_colors: []
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_secondary, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.colors_secondary, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_secondary} (partial data 2)`, () => {
    const data: ProductUpdateColorsData = {
      secondary_colors: [
        { identifier: '', name: '' }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_secondary, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.colors_secondary, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });


  // mediums


  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.mediums}`, () => {
    const data: ProductUpdateMediumsData = {
      mediums: [
        { identifier: 'photography', name: 'Photography' },
        {
          identifier: 'hand-drawings-and-sketches',
          name: 'Hand Drawings and Sketches'
        }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.mediums, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.mediums,
      `photography-${suffix}${div}hand-drawings-and-sketches-${suffix}`);
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.mediums} (delete)`, () => {
    const data: ProductUpdateMediumsData = {
      mediums: [
        { identifier: 'photography', name: 'Photography' },
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.mediums, ProductUpdateType.categorization,
      data, UpdateAction.delete);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.mediums, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.mediums} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.mediums, ProductUpdateType.categorization, {});

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.mediums, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.mediums} (partial data 1)`, () => {
    const data: ProductUpdateMediumsData = {
      mediums: []
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.mediums, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.mediums, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.mediums} (partial data 2)`, () => {
    const data: ProductUpdateMediumsData = {
      mediums: [
        { identifier: '', name: '' }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.mediums, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.mediums, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });


  // styles


  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.styles}`, () => {
    const data: ProductUpdateStylesData = {
      styles: [
        { name: 'Photographic', identifier: 'photographic' },
        {
          name: 'Cityscapes',
          identifier: 'cityscapes',
          parents: [
            {
              name: 'Panoramic Photography',
              identifier: 'panoramic-photography',
              level: 0
            },
            {
              name: 'Photographic',
              identifier: 'photographic',
              level: 1
            }
          ]
        }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.styles, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.styles,
      `photographic-${suffix}${div}cityscapes-${suffix}`);
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.styles} (small tree)`, () => {
    const data: ProductUpdateStylesData = {
      styles: [
        { name: 'Photographic', identifier: 'photographic' },
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.styles, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.styles, `photographic-${suffix}`);
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.styles} (delete)`, () => {
    const data: ProductUpdateStylesData = {
      styles: [
        { name: 'Photographic', identifier: 'photographic' },
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.styles, ProductUpdateType.categorization,
      data, UpdateAction.delete);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.styles, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.styles} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.styles, ProductUpdateType.categorization, {});

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.styles, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.styles} (partial data 1)`, () => {
    const data: ProductUpdateStylesData = {
      styles: []
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.styles, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.styles, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.styles} (partial data 2)`, () => {
    const data: ProductUpdateStylesData = {
      styles: [
        { name: '', identifier: '' },
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.styles, ProductUpdateType.categorization, data);

    const expected = prepareCategorizationMetafield(productId, ShopifyCategorizationMetafield.styles, '');
    const result = (new ProductCategorizationShopifyBuilder()).buildUpdate(productId, update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

});
