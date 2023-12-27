import { DBService } from 'common-db/service/DBService';
import { DBCollection } from 'common-db/DBCollection';
import { DataUtil } from 'common-util/DataUtil';
import { Readable } from 'stream';
import { Row } from '@fast-csv/format';
import { Product, ProductExtras, } from 'common-db/model/Product';
import { ProductService } from '../product/ProductService';
import {
  ProductLayoutFeedItem,
  ProductLayoutFeedItemBase,
  ProductLayoutFeedItemInternal
} from '../../model/Feed';
import { ProductVariationBaseService } from './ProductVariationBaseService';
import { ProductLayoutsDBService } from 'common-db/service/ProductLayoutsDBService';
import { ProductDBService } from 'common-db/service/ProductDBService';
import { ErrorUtil } from 'common-util/ErrorUtil';

export class ProductLayoutsFeedService extends ProductVariationBaseService {
  private static readonly FILTER = {};

  protected getFeedName(): string {
    return 'product-layouts';
  }

  protected getFeedBucketKey(): string {
    return 'product-layouts-feed/feed.csv';
  }

  protected getFeedSecretEnvKey(): string {
    return 'PRODUCT_LAYOUT_FEED_SECRET';
  }

  protected getFeedItemsCount(): Promise<number> {
    return DBService.getCollection(DBCollection.PRODUCT_LAYOUTS_FEEDS)
      .then(collection => collection.countDocuments(ProductLayoutsFeedService.FILTER));
  }

  protected getFeedExportHeader(): string[] {
    return [
      'id',
      'original_id',
      'item_group_id',
      'sku',
      'layout',
      'product_name',
      'product_name_length',
      'link',
      'image_link',
      'square_image',
      'preview_image_3d',
      'preview_room_type',
      'preview_room_style',
      'pieces',
      'shape',
      'material',
      'main_category_lv1',
      'main_category_lv2',
      'main_category_lv3',
      'main_category_lv4',
      'main_category_lv5',
      'main_category_lv6',
      'size_name',
      'medium',
      'atmosphere',
      'product_type',
      'color',
      'main_color',
      'main_color_parent',
      'additional_colors',
      'additional_images',
      'brand_name',
      'style',
      'business',
      'condition',
      'brand',
      'artist',
      'mpn',
      'price',
      'sale_price',
      'custom_label_0',
      'custom_label_1',
      'custom_label_2',
      'custom_label_3',
      'custom_label_4',
      'shipping_weight',
      'availability',
      'google_product_category',
      'tags',
      'exclusive',
      'personalized',
      'published_at',
    ];
  }

  protected getFeedContent(): Promise<Readable> {
    return DBService.getCollection(DBCollection.PRODUCT_LAYOUTS_FEEDS)
      .then(collection => collection.find(ProductLayoutsFeedService.FILTER)
        .project({
          _id: 0,
          id: 1,
          original_id: 1,
          item_group_id: 1,
          sku: 1,
          layout: 1,
          product_name: 1,
          product_name_length: 1,
          link: 1,
          square_image: 1,
          preview_image_3d: 1,
          image_link: 1,
          additional_images: 1,
          preview_room_type: 1,
          preview_room_style: 1,
          pieces: 1,
          material: 1,
          size_name: 1,
          shape: 1,
          color: 1,
          main_color: 1,
          main_color_parent: 1,
          additional_colors: 1,
          main_category_lv1: 1,
          main_category_lv2: 1,
          main_category_lv3: 1,
          main_category_lv4: 1,
          main_category_lv5: 1,
          main_category_lv6: 1,
          medium: 1,
          atmosphere: 1,
          business: 1,
          style: 1,
          artist: 1,
          product_type: 1,
          brand: 1,
          brand_name: 1,
          price: 1,
          sale_price: 1,
          display_ads_title: 1,
          mpn: 1,
          custom_label_0: 1,
          custom_label_1: 1,
          custom_label_2: 1,
          custom_label_3: 1,
          custom_label_4: 1,
          condition: 1,
          availability: 1,
          shipping_weight: 1,
          google_product_category: 1,
          tags: 1,
          exclusive: 1,
          personalized: 1,
          published_at: 1,
        })
        .stream());
  }

  protected transformItem(productLayoutsFeeds: Row): ProductLayoutFeedItem {
    return productLayoutsFeeds as ProductLayoutFeedItem;
  }

  protected async populateItem(sku: string): Promise<void> {
    const product = await ProductLayoutsFeedService.getProductDetails(sku);

    const baseItem = await this.prepareBaseFeedItemInfo(product);
    const items = await ProductLayoutsFeedService.prepareLayoutItems(product, baseItem);
    const ProductLayoutsFeeds = await DBService.getCollection(DBCollection.PRODUCT_LAYOUTS_FEEDS);
    await ProductLayoutsFeeds.deleteMany({ sku });
    if (items.length) await ProductLayoutsFeeds.insertMany(items);
  }

  private static async getProductDetails(sku: string): Promise<Product> {
    return await ProductDBService.getProduct(sku, {
      _id: 0,
      sku: 1,
      exclusive: 1,
      personalized: 1,
      title: 1,
      shopify_main_product_image: 1,
      main_product_image: 1,
      description: 1,
      url: 1,
      image: 1,
      product_type: 1,
      shopify_id: 1,
      extra_data: {
        collection_main_color: 1,
        cloudinaryColors: 1,
        main_category: {
          _id: 1
        },
        mediums: 1,
        atmospheres: 1,
        brand: 1,
        artist: 1,
        displayed_artist: 1,
        collection_styles: 1,
        'businesses.name': 1,
        product_tags: 1,
      },
      layouts: 1,
      variants: {
        id: 1,
        option1: 1,
        option2: 1,
      },
      published_at: 1,
      last_updated: 1,
    });
  }

  private async prepareBaseFeedItemInfo(product: Product): Promise<ProductLayoutFeedItemBase> {
    const sales = await ProductService.getProductSales(product.sku);
    const productSales = sales.find(sale => sale.sku == product.sku)?.sales || 0;

    const extras = product?.extra_data?.find(data => data) || {};
    const { mainColor, mainColorParent } = await ProductLayoutsFeedService.getColors(extras);
    const additionalColors = await ProductLayoutsFeedService.getAdditionalColors(extras);

    const baseFeedItem = await this.prepareProductFeedBaseItem(product, extras, productSales);
    const category = await ProductVariationBaseService.getCategory(extras);
    const tags = ProductDBService.filterProductTags(extras?.product_tags || [])
      .join(',');

    return {
      exclusive: product.exclusive,
      personalized: product.personalized,
      product_name: ProductDBService.cleanProductTitle(product.title),
      product_name_length: product.title.split(/\s/).filter(word => !!word).length,
      ...category,
      square_image: product?.shopify_main_product_image || product?.main_product_image || '',
      medium: extras.mediums?.length ? extras.mediums[0]?.name : '',
      atmosphere: extras.atmospheres?.length ? extras.atmospheres[0].name : '',
      brand_name: extras.brand?.propertyName || '',
      style: extras.collection_styles?.length ? extras.collection_styles[0].name : '',
      business: extras.businesses?.length ? extras.businesses[0].name : '',
      main_color: mainColor,
      main_color_parent: mainColorParent,
      additional_colors: additionalColors,
      tags,
      ...baseFeedItem,
      published_at: product.published_at?.getTime() || 0,
    };
  }

  private static async getColors(extras: ProductExtras = {}) {
    const colorsCollection = await DBService.getCollection(DBCollection.COLORS);
    let mainColor = '';
    let mainColorParent = '';
    if (extras?.collection_main_color) {
      const colorData = await colorsCollection.aggregate([
        {
          $match: { _id: DBService.newId(extras.collection_main_color) }
        },
        {
          $lookup: {
            from: DBCollection.COLORS,
            let: { multiLevelColorParent: '$multiLevelColorParent' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$multiLevelColorParent' }] } } },
              { $project: { _id: 0, colorName: 1 } }
            ],
            as: 'parent'
          }
        },
        {
          $project: {
            colorName: 1,
            parent: 1,
          }
        }
      ]).toArray();
      if (colorData.length) {
        mainColor = DataUtil.capitalizeFirstLettersForSentence(colorData[0]?.colorName);
        mainColorParent = DataUtil.capitalizeFirstLettersForSentence(colorData[0]?.parent[0]?.colorName);
      }
    }

    return { mainColor, mainColorParent };
  }

  private static async getAdditionalColors(extras: ProductExtras = {}): Promise<string> {
    const colorsCollection = await DBService.getCollection(DBCollection.COLORS);
    if (extras.cloudinaryColors?.length) {
      const colorsIds = extras.cloudinaryColors.map(id => DBService.newId(id));
      const colorsData = await colorsCollection
        .find({ _id: { $in: colorsIds } })
        .project({ _id: 0, colorName: 1 })
        .toArray();

      return colorsData.map(color => {
        return DataUtil.capitalizeFirstLettersForSentence(color.colorName);
      }).sort((a, b) => a.localeCompare(b)).join(',');
    }
    return '';
  }

  private static async prepareLayoutItems(product: Product, baseItem: ProductLayoutFeedItemBase): Promise<ProductLayoutFeedItemInternal[]> {
    const items: ProductLayoutFeedItemInternal[] = [];

    const layouts = await ProductLayoutsDBService.prepareLayouts(product);

    for (const layout of layouts) {
      const preview = layout.rooms.find(room => room);
      const previewRoomStyle = preview?.styles?.find(style => style);
      const additionalImages = layout.rooms.length > 1
        ? layout.rooms.slice(1)
          .map(imageInfo => imageInfo.image_link)
          .filter(item => !!item)
          .join(',')
        : '';
      items.push({
        layout: layout.short_layout,
        additional_images: additionalImages || '',
        preview_room_type: DataUtil.capitalizeFirstLettersForSentence(preview?.room_type) || '',
        preview_room_style: DataUtil.capitalizeFirstLettersForSentence(previewRoomStyle) || '',
        pieces: layout.pieces,
        shape: DataUtil.capitalizeFirstLettersForSentence(layout.shape),
        material: layout.type,
        updated_at: product.last_updated,
        ...baseItem,
        link: `${ProductVariationBaseService.shopDomain}${layout.url}`,
        image_link: preview?.image_link || baseItem.image_link,
        price: `${layout.compare_at_price || 0} USD`,
        sale_price: `${layout.price || 0} USD`,
        preview_image_3d: layout.preview_3d || '',
      });
    }
    return items;
  }

  public async deleteProductFromProductLayoutFeed(sku: string): Promise<void> {
    try {
      const ProductLayoutsFeeds = await DBService.getCollection(DBCollection.PRODUCT_LAYOUTS_FEEDS);
      await ProductLayoutsFeeds.deleteMany({ sku });
    } catch (err) {
      throw ErrorUtil.general(`Error while deleting product layout feed!`);
    }
  }
}
