import { deepStrictEqual } from 'assert';
import {
  ProductCategorizationAlgoliaBuilder
} from '../../../../src/service/product/builder/categorization/ProductCategorizationAlgoliaBuilder';
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
  AlgoliaProductAllCategoryType,
  AlgoliaProductArtistType,
  AlgoliaProductAtmosphereType,
  AlgoliaProductBusinessesType,
  AlgoliaProductColorsMainType,
  AlgoliaProductColorsSecondaryType,
  AlgoliaProductGuestCategoryType,
  AlgoliaProductMainCategoryType,
  AlgoliaProductMediumsType,
  AlgoliaProductStylesType
} from '../../../../src/model/Algolia';
import { NotAllowedError } from 'common-util/error/NotAllowedError';

describe('service/product/builder/categorization/ProductCategorizationAlgoliaBuilder.ts', () => {

  // incorrect data

  it(`buildUpdate for type: unsupported type`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.artist, ProductUpdateType.general, {});
    const expression = () => {
      (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);
    };

    expect(expression).toThrow(NotAllowedError);
    expect(expression).toThrow(`Product update with type=${ProductUpdateType.general} is not supported`);
  });

  it(`buildUpdate for type: unsupported sub-type`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateNameSubType.name, ProductUpdateType.categorization, {});
    const expression = () => {
      (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);
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

    const expected: AlgoliaProductArtistType = {
      artist_name: 'James Bond'
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.artist} (delete)`, () => {
    const data: ProductUpdateArtistData = {
      name: 'James Bond',
      identifier: 'james-bond'
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.artist, ProductUpdateType.categorization,
      data, UpdateAction.delete);

    const expected: AlgoliaProductArtistType = {
      artist_name: ''
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.artist} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.artist, ProductUpdateType.categorization, {});

    const expected: AlgoliaProductArtistType = {
      artist_name: ''
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.artist} (partial data)`, () => {
    const data: ProductUpdateArtistData = {
      name: '',
      identifier: ''
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.artist, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductArtistType = {
      artist_name: ''
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductAtmosphereType = {
      extra_atmospheres: ['Festive']
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductAtmosphereType = {
      extra_atmospheres: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.atmospheres} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.atmospheres, ProductUpdateType.categorization, {});

    const expected: AlgoliaProductAtmosphereType = {
      extra_atmospheres: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.atmospheres} (partial data 1)`, () => {
    const data: ProductUpdateAtmospheresData = {
      atmospheres: []
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.atmospheres, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductAtmosphereType = {
      extra_atmospheres: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductAtmosphereType = {
      extra_atmospheres: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductBusinessesType = {
      extra_businesses_lv1: ['By Office', 'By Vibe'],
      extra_businesses_lv2: ['By Office > By Style'],
      extra_businesses_lv3: ['By Office > By Style > Corporate']
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.businesses} (small tree)`, () => {
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
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.businesses, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductBusinessesType = {
      extra_businesses_lv1: ['By Office', 'By Style'],
      extra_businesses_lv2: ['By Style > Corporate'],
      extra_businesses_lv3: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductBusinessesType = {
      extra_businesses_lv1: [],
      extra_businesses_lv2: [],
      extra_businesses_lv3: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.businesses} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.businesses, ProductUpdateType.categorization, {});

    const expected: AlgoliaProductBusinessesType = {
      extra_businesses_lv1: [],
      extra_businesses_lv2: [],
      extra_businesses_lv3: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.businesses} (partial data 1)`, () => {
    const data: ProductUpdateBusinessesData = {
      businesses: []
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.businesses, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductBusinessesType = {
      extra_businesses_lv1: [],
      extra_businesses_lv2: [],
      extra_businesses_lv3: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.businesses} (partial data 2)`, () => {
    const data: ProductUpdateBusinessesData = {
      businesses: [
        { name: '', identifier: '' },
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.businesses, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductBusinessesType = {
      extra_businesses_lv1: [],
      extra_businesses_lv2: [],
      extra_businesses_lv3: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });


  // categories_guest


  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_guest}`, () => {
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
        },
        {
          name: 'North American Architecture',
          identifier: 'north-american-architecture',
          parents: [
            {
              name: 'Architecture',
              identifier: 'architecture',
              level: 1,
              suffix: 'wall-art'
            },
            {
              name: 'World Architecture',
              identifier: 'world-architecture',
              level: 0,
              suffix: 'wall-art'
            }
          ],
          suffix: 'wall-art'
        },
        {
          name: 'Sky & Sea',
          identifier: 'sky-and-sea',
          parents: [
            {
              name: 'Sky',
              identifier: 'sky',
              level: 0,
              suffix: 'wall-art'
            },
            {
              name: 'Nature',
              identifier: 'nature',
              level: 1,
              suffix: 'wall-art'
            }
          ],
          suffix: 'wall-art'
        },
        {
          name: 'Mist',
          identifier: 'mist',
          parents: [
            {
              name: 'Nature',
              identifier: 'nature',
              level: 1,
              suffix: 'wall-art'
            },
            {
              name: 'Natural Wonders',
              identifier: 'natural-wonders',
              level: 0,
              suffix: 'wall-art'
            }
          ],
          suffix: 'wall-art'
        },
        {
          name: 'Suspension Bridge',
          identifier: 'suspension-bridge',
          parents: [
            {
              name: 'Architecture',
              identifier: 'architecture',
              level: 2,
              suffix: 'wall-art'
            },
            {
              name: 'City Bridge',
              identifier: 'city-bridge',
              level: 0,
              suffix: 'wall-art'
            },
            {
              name: 'Bridges',
              identifier: 'bridges',
              level: 1,
              suffix: 'wall-art'
            }
          ],
          suffix: 'wall-art'
        },
        {
          name: 'Golden Gate Bridge',
          identifier: 'golden-gate-bridge-famous-bridges',
          parents: [
            {
              name: 'Architecture',
              identifier: 'architecture',
              level: 2,
              suffix: 'wall-art'
            },
            {
              name: 'Bridges',
              identifier: 'bridges',
              level: 1,
              suffix: 'wall-art'
            },
            {
              name: 'Famous Bridges',
              identifier: 'famous-bridges',
              level: 0,
              suffix: 'wall-art'
            }
          ],
          suffix: 'wall-art'
        },
        {
          name: 'San Francisco',
          identifier: 'san-francisco-urban-usa-cities',
          parents: [
            {
              name: 'Cities',
              identifier: 'cities',
              level: 1,
              suffix: 'wall-art'
            },
            {
              name: 'Urban USA Cities',
              identifier: 'urban-usa-cities',
              level: 0,
              suffix: 'wall-art'
            }
          ],
          suffix: 'wall-art'
        }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_guest, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductGuestCategoryType = {
      extra_guest_categories_lv1: [],
      extra_guest_categories_lv2: [],
      extra_guest_categories_lv3: [],
      extra_guest_categories_lv4: [],
      extra_guest_categories_lv5: [],
      extra_guest_categories_lv6: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_guest} (small tree)`, () => {
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
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_guest, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductGuestCategoryType = {
      extra_guest_categories_lv1: [],
      extra_guest_categories_lv2: [],
      extra_guest_categories_lv3: [],
      extra_guest_categories_lv4: [],
      extra_guest_categories_lv5: [],
      extra_guest_categories_lv6: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductGuestCategoryType = {
      extra_guest_categories_lv1: [],
      extra_guest_categories_lv2: [],
      extra_guest_categories_lv3: [],
      extra_guest_categories_lv4: [],
      extra_guest_categories_lv5: [],
      extra_guest_categories_lv6: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_guest} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_guest, ProductUpdateType.categorization, {});

    const expected: AlgoliaProductGuestCategoryType = {
      extra_guest_categories_lv1: [],
      extra_guest_categories_lv2: [],
      extra_guest_categories_lv3: [],
      extra_guest_categories_lv4: [],
      extra_guest_categories_lv5: [],
      extra_guest_categories_lv6: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_guest} (partial data 1)`, () => {
    const data: ProductUpdateCategoriesData = {
      guest_categories: []
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_guest, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductGuestCategoryType = {
      extra_guest_categories_lv1: [],
      extra_guest_categories_lv2: [],
      extra_guest_categories_lv3: [],
      extra_guest_categories_lv4: [],
      extra_guest_categories_lv5: [],
      extra_guest_categories_lv6: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductGuestCategoryType = {
      extra_guest_categories_lv1: [],
      extra_guest_categories_lv2: [],
      extra_guest_categories_lv3: [],
      extra_guest_categories_lv4: [],
      extra_guest_categories_lv5: [],
      extra_guest_categories_lv6: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });


  // categories_main

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_main}`, () => {
    const data: ProductUpdateCategoriesData = {
      main_category: {
        name: 'Cape Town',
        identifier: 'cape-town',
        parents: [
          {
            name: 'Places',
            identifier: 'places',
            level: 3,
            suffix: 'wall-art'
          },
          {
            name: 'Africa',
            identifier: 'africa',
            level: 1,
            suffix: 'wall-art'
          },
          {
            name: 'Around The Globe',
            identifier: 'around-the-globe',
            level: 2,
            suffix: 'wall-art'
          },
          {
            name: 'South Africa',
            identifier: 'south-africa',
            level: 0,
            suffix: 'wall-art'
          }
        ],
        suffix: 'wall-art'
      }
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_main, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductMainCategoryType = {
      extra_main_category_lv1: '',
      extra_main_category_lv2: '',
      extra_main_category_lv3: '',
      extra_main_category_lv4: '',
      extra_main_category_lv5: '',
      extra_main_category_lv6: ''
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_main} (small tree)`, () => {
    const data: ProductUpdateCategoriesData = {
      main_category: {
        name: 'Cape Town',
        identifier: 'cape-town',
        parents: [
          {
            name: 'South Africa',
            identifier: 'south-africa',
            level: 0,
            suffix: 'wall-art'
          },
          {
            name: 'Around The Globe',
            identifier: 'around-the-globe',
            level: 1,
            suffix: 'wall-art'
          }
        ],
        suffix: 'wall-art'
      }
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_main, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductMainCategoryType = {
      extra_main_category_lv1: '',
      extra_main_category_lv2: '',
      extra_main_category_lv3: '',
      extra_main_category_lv4: '',
      extra_main_category_lv5: '',
      extra_main_category_lv6: ''
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_main} (delete)`, () => {
    const data: ProductUpdateCategoriesData = {
      main_category: {
        name: 'Cape Town',
        identifier: 'cape-town',
        parents: [
          {
            name: 'South Africa',
            identifier: 'south-africa',
            level: 0,
            suffix: 'wall-art'
          },
          {
            name: 'Around The Globe',
            identifier: 'around-the-globe',
            level: 1,
            suffix: 'wall-art'
          }
        ],
        suffix: 'wall-art'
      }
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_main, ProductUpdateType.categorization,
      data, UpdateAction.delete);

    const expected: AlgoliaProductMainCategoryType = {
      extra_main_category_lv1: '',
      extra_main_category_lv2: '',
      extra_main_category_lv3: '',
      extra_main_category_lv4: '',
      extra_main_category_lv5: '',
      extra_main_category_lv6: ''
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_main} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_main, ProductUpdateType.categorization, {});

    const expected: AlgoliaProductMainCategoryType = {
      extra_main_category_lv1: '',
      extra_main_category_lv2: '',
      extra_main_category_lv3: '',
      extra_main_category_lv4: '',
      extra_main_category_lv5: '',
      extra_main_category_lv6: ''
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductMainCategoryType = {
      extra_main_category_lv1: '',
      extra_main_category_lv2: '',
      extra_main_category_lv3: '',
      extra_main_category_lv4: '',
      extra_main_category_lv5: '',
      extra_main_category_lv6: ''
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });


  // categories_all


  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_all}`, () => {
    const data: ProductUpdateCategoriesData = {
      categories_all: [
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
        },
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
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_all, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductAllCategoryType = {
      extra_all_categories_lv1: [
        'Coastal & Nautical',
        'Architecture',
      ],
      extra_all_categories_lv2: [
        'Coastal & Nautical > Beach',
        'Architecture > North American Architecture',
      ],
      extra_all_categories_lv3: [
        'Coastal & Nautical > Beach > Seascapes & Ocean',
      ],
      extra_all_categories_lv4: [],
      extra_all_categories_lv5: [],
      extra_all_categories_lv6: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_all} (small tree)`, () => {
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
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_all, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductAllCategoryType = {
      extra_all_categories_lv1: [
        'Architecture',
      ],
      extra_all_categories_lv2: [
        'Architecture > North American Architecture',
      ],
      extra_all_categories_lv3: [],
      extra_all_categories_lv4: [],
      extra_all_categories_lv5: [],
      extra_all_categories_lv6: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductAllCategoryType = {
      extra_all_categories_lv1: [],
      extra_all_categories_lv2: [],
      extra_all_categories_lv3: [],
      extra_all_categories_lv4: [],
      extra_all_categories_lv5: [],
      extra_all_categories_lv6: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_all} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_all, ProductUpdateType.categorization, {});

    const expected: AlgoliaProductAllCategoryType = {
      extra_all_categories_lv1: [],
      extra_all_categories_lv2: [],
      extra_all_categories_lv3: [],
      extra_all_categories_lv4: [],
      extra_all_categories_lv5: [],
      extra_all_categories_lv6: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.categories_all} (partial data 1)`, () => {
    const data: ProductUpdateCategoriesData = {
      categories_all: []
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.categories_all, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductAllCategoryType = {
      extra_all_categories_lv1: [],
      extra_all_categories_lv2: [],
      extra_all_categories_lv3: [],
      extra_all_categories_lv4: [],
      extra_all_categories_lv5: [],
      extra_all_categories_lv6: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductAllCategoryType = {
      extra_all_categories_lv1: [],
      extra_all_categories_lv2: [],
      extra_all_categories_lv3: [],
      extra_all_categories_lv4: [],
      extra_all_categories_lv5: [],
      extra_all_categories_lv6: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductColorsMainType = {
      extra_colors_main_lv1: 'Green',
      extra_colors_main_lv2: 'Green > Limegreen'
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_main} (no level)`, () => {
    const data: ProductUpdateColorsData = {
      main_color: {
        identifier: 'limegreen',
        name: 'Limegreen',
        parents: [{
          identifier: 'green',
          name: 'Green',
          level: 0
        }]
      }
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_main, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductColorsMainType = {
      extra_colors_main_lv1: 'Green',
      extra_colors_main_lv2: 'Green > Limegreen'
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_main} (no parent)`, () => {
    const data: ProductUpdateColorsData = {
      main_color: {
        identifier: 'limegreen',
        name: 'Limegreen'
      }
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_main, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductColorsMainType = {
      extra_colors_main_lv1: 'Limegreen',
      extra_colors_main_lv2: ''
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductColorsMainType = {
      extra_colors_main_lv1: '',
      extra_colors_main_lv2: ''
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_main} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_main, ProductUpdateType.categorization, {});

    const expected: AlgoliaProductColorsMainType = {
      extra_colors_main_lv1: '',
      extra_colors_main_lv2: ''
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductColorsMainType = {
      extra_colors_main_lv1: '',
      extra_colors_main_lv2: ''
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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
        { identifier: 'dovegrey', name: 'Dovegrey' }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_secondary, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductColorsSecondaryType = {
      extra_colors_secondary_lv1: ['Green', 'Olive', 'Dovegrey'],
      extra_colors_secondary_lv2: ['Green > Limegreen']
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductColorsSecondaryType = {
      extra_colors_secondary_lv1: ['Limegreen', 'Olive'],
      extra_colors_secondary_lv2: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductColorsSecondaryType = {
      extra_colors_secondary_lv1: [],
      extra_colors_secondary_lv2: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_secondary} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_secondary, ProductUpdateType.categorization, {});

    const expected: AlgoliaProductColorsSecondaryType = {
      extra_colors_secondary_lv1: [],
      extra_colors_secondary_lv2: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_secondary} (partial data 1)`, () => {
    const data: ProductUpdateColorsData = {
      secondary_colors: []
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_secondary, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductColorsSecondaryType = {
      extra_colors_secondary_lv1: [],
      extra_colors_secondary_lv2: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.colors_secondary} (partial data 2)`, () => {
    const data: ProductUpdateColorsData = {
      secondary_colors: [
        { identifier: '', name: '' }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.colors_secondary, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductColorsSecondaryType = {
      extra_colors_secondary_lv1: [],
      extra_colors_secondary_lv2: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductMediumsType = {
      extra_mediums: ['Photography', 'Hand Drawings and Sketches']
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductMediumsType = {
      extra_mediums: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.mediums} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.mediums, ProductUpdateType.categorization, {});

    const expected: AlgoliaProductMediumsType = {
      extra_mediums: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.mediums} (partial data 1)`, () => {
    const data: ProductUpdateMediumsData = {
      mediums: []
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.mediums, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductMediumsType = {
      extra_mediums: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.mediums} (partial data 2)`, () => {
    const data: ProductUpdateMediumsData = {
      mediums: [
        { identifier: '', name: '' }
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.mediums, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductMediumsType = {
      extra_mediums: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductStylesType = {
      extra_styles_lv1: ['Photographic'],
      extra_styles_lv2: ['Photographic > Panoramic Photography'],
      extra_styles_lv3: ['Photographic > Panoramic Photography > Cityscapes']
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.styles} (small tree)`, () => {
    const data: ProductUpdateStylesData = {
      styles: [
        { name: 'Photographic', identifier: 'photographic' },
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.styles, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductStylesType = {
      extra_styles_lv1: ['Photographic'],
      extra_styles_lv2: [],
      extra_styles_lv3: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

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

    const expected: AlgoliaProductStylesType = {
      extra_styles_lv1: [],
      extra_styles_lv2: [],
      extra_styles_lv3: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.styles} (no data)`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.styles, ProductUpdateType.categorization, {});

    const expected: AlgoliaProductStylesType = {
      extra_styles_lv1: [],
      extra_styles_lv2: [],
      extra_styles_lv3: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.styles} (partial data 1)`, () => {
    const data: ProductUpdateStylesData = {
      styles: []
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.styles, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductStylesType = {
      extra_styles_lv1: [],
      extra_styles_lv2: [],
      extra_styles_lv3: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdateCategorizationSubType.styles} (partial data 2)`, () => {
    const data: ProductUpdateStylesData = {
      styles: [
        { name: '', identifier: '' },
      ]
    };
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.styles, ProductUpdateType.categorization, data);

    const expected: AlgoliaProductStylesType = {
      extra_styles_lv1: [],
      extra_styles_lv2: [],
      extra_styles_lv3: []
    };
    const result = (new ProductCategorizationAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

});
