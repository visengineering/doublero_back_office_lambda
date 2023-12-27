import { DBService } from 'common-db/service/DBService';
import { DBCollection } from 'common-db/DBCollection';

import { AlgoliaArtistService } from '../algolia/AlgoliaArtistService';
import { DataUtil } from 'common-util/DataUtil';
import { SystemConfigDBService } from 'common-db/service/SystemConfigService';

import { ShopifyCollectionService, ARTISTS_COLLECTION_TEMPLATE_SUFFIX } from '../shopify/ShopifyCollectionService';
import md5 from 'md5';
import { ShopifyPublicationService } from '../shopify/ShopifyPublicationService';
import { CollectionInput } from '../../model/Shopify';
import { ArtistExternalData } from '../../model/Artist';

export class ArtistUpdateService {
  private static ARTIST_PRODUCT_QUANTITY_FILTER = '1';

  public static async handleArtistUpdate(): Promise<void> {
    const artistConfiguration = await SystemConfigDBService.getArtistConfiguration();

    // Get all artists which needs to be published
    const publishedArtists = await this.loadArtistsToPublish(artistConfiguration?.value || this.ARTIST_PRODUCT_QUANTITY_FILTER);

    console.info(`Found ${publishedArtists.length} artists ready to be published.`);

    // Create or update shopify collections
    const failedUpdates = await this.updateShopify(publishedArtists);

    console.info(`Total of ${failedUpdates.length} artists failed to be updated/created on Shopify.`);

    // Update all artists index data on Algolia
    const algoliaData = publishedArtists.filter(artists => !failedUpdates.includes(artists._id)).map(artist => artist.algoliaData);
    await AlgoliaArtistService.replaceAllArtists(algoliaData);
  }

  public static async updateShopify(data: ArtistExternalData[]): Promise<string[]> {
    const productArtistCollection = (await DBService.getCollection(DBCollection.PRODUCT_ARTISTS));

    const failedUpdates = [];

    for (const artistData of data) {
      try {
        const description = artistData.shopifyData.shopify_collection_description;
        const htmlDescription = description ? `<p>${description}</p>` : '';
        const image = artistData.algoliaData.image ? { src: artistData.algoliaData.image } : undefined;

        const request: CollectionInput = {
          descriptionHtml: htmlDescription,
          handle: `${artistData.algoliaData.objectID}-wall-art`,
          templateSuffix: ARTISTS_COLLECTION_TEMPLATE_SUFFIX,
          title: artistData.algoliaData.name,
          image: image
        };

        const requestHash = md5(JSON.stringify(request));

        if (!artistData.shopifyData?.shopify_collection_id) {
          const { collection } = await ShopifyCollectionService.createShopifyCollection(request);
          await ShopifyPublicationService.publishToAllPublications(collection?.id);

          await productArtistCollection.updateOne({ _id: DBService.newId(artistData?._id) }, {
            $set: {
              shopify_collection_id: collection?.id,
              last_update_hash: requestHash,
              shopify_collection_created_at: new Date()
            }
          });

        } else if (artistData.shopifyData?.last_update_hash !== requestHash) {
          request.id = artistData.shopifyData?.shopify_collection_id;

          // Avoid overriding manual uploaded images on Shopify during update
          request.image = undefined;
          delete request.image;

          await ShopifyCollectionService.updateShopifyCollection(request);

          await productArtistCollection.updateOne(
            { _id: DBService.newId(artistData?._id) },
            { $set: { last_update_hash: requestHash, shopify_collection_updated_at: new Date() } });
        }
      } catch (e) {
        // If create failed don't publish it on Algolia
        if (!artistData.shopifyData?.shopify_collection_id) failedUpdates.push(artistData._id);
        const error = e as Error;
        console.error(`Error while trying to create/update Shopify collection for ${artistData.algoliaData.name}: ${error.message}`, error, `=data${JSON.stringify(artistData)}`);
      }
    }

    return failedUpdates;
  }

  public static async loadArtistsToPublish(artistProductQuantityFilter: string): Promise<ArtistExternalData[]> {
    const collection = (await DBService.getCollection(DBCollection.PRODUCT_ARTISTS));

    const cursor = collection.aggregate([
      {
        $project: {
          _id: 1,
          case_sensitive_name: 1,
          name: 1,
          last_update_hash: 1,
          shopify_collection_description: 1,
          shopify_collection_id: 1,
        }
      },
      {
        $lookup: {
          from: DBCollection.PRODUCT_EXTRAS,
          let: { artist_name: '$case_sensitive_name' },
          pipeline: [
            { $match: { $expr: { $eq: ['$displayed_artist', '$$artist_name'] } } },
            { $project: { collection_styles: 1 } },
            {
              $lookup: {
                from: 'products',
                let: { extraId: '$_id' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$extras', '$$extraId'] }, status: 'live', isHidden: { $ne: true } } },
                  {
                    $project: {
                      published_at: 1,
                      shopify_main_product_image: 1,
                      sku: 1,
                      _id: 1,
                    }
                  }
                ],
                as: 'product'
              }
            },
            { $unwind: '$product' },
            {
              $project: {
                product: 1,
                styles: '$collection_styles',
              }
            },

          ],
          as: 'extras'
        }
      },
      { $match: { [`extras.${parseInt(artistProductQuantityFilter) - 1}`]: { $exists: true } } },
      {
        $lookup: {
          from: DBCollection.ORDER_ITEMS,
          let: { artist_name: '$case_sensitive_name' },
          pipeline: [
            { $match: { $expr: { $eq: ['$artist', '$$artist_name'] } } },
            { $group: { _id: '$artist', quantity: { $sum: '$Quantity' } } },
            { $project: { _id: 0, sales: '$quantity' } },
          ],
          as: 'sales'
        }
      },
      { $unwind: { path: '$sales', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          extras: 1,
          name: 1,
          case_sensitive_name: 1,
          sales: '$sales.sales',
          last_update_hash: 1,
          shopify_collection_description: 1,
          shopify_collection_id: 1,
        }
      }
    ]);

    const results = [];

    const now = new Date();
    for await (const artist of cursor) {
      const stylesSet = new Set();

      for (const extra of artist.extras) {
        for (const style of (extra.styles || [])) if (style?.name) stylesSet.add(style?.name);
      }

      const sorted = artist.extras.sort((extraA: any, extraB: any) => {
        const getPublishDate = (extra: any) => (extra.product?.published_at?.getTime() || now.getTime());
        return getPublishDate(extraA) - getPublishDate(extraB);
      });

      const sortedWithImage = sorted.filter((extra: any) => !!extra.product.shopify_main_product_image);

      const oldestPublishDate = sorted[0]?.product?.published_at || now;
      const oldestImage = sortedWithImage[0]?.product?.shopify_main_product_image || '';

      const readyArtist = {
        objectID: DataUtil.getUrlHandle(artist.name),
        name: artist.case_sensitive_name,
        publishedAt: oldestPublishDate.getTime(),
        numberOfProducts: artist.extras.length,
        styles: <string[]>[...stylesSet],
        sales: artist?.sales || 0,
        image: oldestImage || '',
      };

      if (readyArtist.image) { // Only show artists with images
        results.push({
          _id: artist._id,
          algoliaData: readyArtist,
          shopifyData: {
            last_update_hash: artist.last_update_hash,
            shopify_collection_description: artist.shopify_collection_description,
            shopify_collection_id: artist.shopify_collection_id,
          }
        });
      } else {
        console.info(`Artist ${artist.name} does not have any product with shopify_main_product_image. Skiping publish!`, JSON.stringify(artist));
      }
    }

    return results || [];
  }
}
