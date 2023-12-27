import { ArtistUpdateService } from '../../src/service/artist/ArtistUpdateService';
import { AlgoliaArtistService } from '../../src/service/algolia/AlgoliaArtistService';

const artistsResponse = {
  async*[Symbol.asyncIterator]() {
    yield {
      name: 'artist one',
      case_sensitive_name: 'Artist One',
      sales: 1,
      extras: [
        {
          product: {
            published_at: new Date('2020-07-13T12:36:07.000Z'),
            shopify_main_product_image: 'shopify_main_product_image_url_1',
          },
          styles: [{
            name: 'Style1'
          }]
        },
        {
          product: {
            published_at: new Date('2020-07-14T12:36:07.000Z'),
            shopify_main_product_image: 'shopify_main_product_image_url_2',
          },
          styles: [{
            name: 'Style2'
          }]
        }
      ],
      quantities: 2,
    };
    yield {
      name: 'artist two',
      case_sensitive_name: 'Artist Two',
      sales: 2,
      extras: [
        {
          product: {
            published_at: new Date('2020-07-13T12:36:07.000Z'),
            shopify_main_product_image: 'shopify_main_product_image_url_3',
          },
          styles: [{
            name: 'Style3'
          }]
        },
        {
          product: {
            published_at: new Date('2020-07-14T12:36:07.000Z'),
            shopify_main_product_image: 'shopify_main_product_image_url_4',
          },
          styles: [{
            name: 'Style4'
          }]
        }
      ],
      quantities: 2,
    };
  }
};

const artistConfigurationResponse = {
  _id: '62dad6a8086bcc36cdc3627b',
  last_updated: '2022-07-22T15:03:13.000Z',
  type: 'artist',
  key: 'min_live_products_count',
  value: '4',
  format: 'number'
};

jest.mock('common-db/service/DBService', () => ({
  DBService: {
    PRODUCT_EXTRAS_COLLECTION: 'whatever',
    PRODUCT_ARTISTS_COLLECTION: 'whatever',
    // ts-ignore
    getCollection: jest.fn().mockReturnValue({
      aggregate: jest.fn().mockImplementationOnce(() => artistsResponse)
    })
  }
}));

jest.mock('common-db/service/SystemConfigService', () => ({
  SystemConfigDBService: {
    SYSTEM_CONFIGS: 'whatever',
    // ts-ignore
    getArtistConfiguration: jest.fn().mockReturnValue({
      aggregate: jest.fn().mockImplementationOnce(() => artistConfigurationResponse)
    })
  }
}));

jest.mock('../../src/service/algolia/AlgoliaArtistService', () => ({
  AlgoliaArtistService: {
    replaceAllArtists: jest.fn()
  }
}));

jest.mock('../../src/service/artist/ArtistUpdateService', () => {
  const original = jest.requireActual('../../src/service/artist/ArtistUpdateService');
  original.ArtistUpdateService.updateShopify = jest.fn((input) => { return []; });
  return original;
});

describe('service/algolia/artist/ArtistUpdateService', () => {
  it('handleArtistUpdate', async () => {
    await ArtistUpdateService.handleArtistUpdate();

    const replaceAllArtistsMock = (AlgoliaArtistService.replaceAllArtists as jest.Mock).mock.calls[0][0];
    // // The mock function is called once
    expect(AlgoliaArtistService.replaceAllArtists).toHaveBeenCalledTimes(1);
    expect(replaceAllArtistsMock).toStrictEqual([
      {
        objectID: 'artist-one',
        name: 'Artist One',
        publishedAt: 1594643767000,
        numberOfProducts: 2,
        styles: ['Style1', 'Style2'],
        sales: 1,
        image: 'shopify_main_product_image_url_1'
      },
      {
        objectID: 'artist-two',
        name: 'Artist Two',
        publishedAt: 1594643767000,
        numberOfProducts: 2,
        styles: ['Style3', 'Style4'],
        sales: 2,
        image: 'shopify_main_product_image_url_3'
      }
    ]);
  });
});
