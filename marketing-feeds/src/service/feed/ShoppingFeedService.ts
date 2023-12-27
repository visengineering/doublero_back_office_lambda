import { DBService } from 'common-db/service/DBService';
import { DBCollection } from 'common-db/DBCollection';
import { Readable } from 'stream';
import { Row } from '@fast-csv/format';
import { ProductLayoutFeedItemCategory, ShoppingFeedInternal, ShoppingFeedItem } from '../../model/Feed';
import { Product, ProductExtras, ProductLayout, ProductVariant, } from 'common-db/model/Product';
import { ProductService } from '../product/ProductService';
import { ProductVariationBaseService } from './ProductVariationBaseService';
import { DataUtil } from 'common-util/DataUtil';
import { Page } from 'common-util/RequestUtil';
import { ProductSales } from '../../model/Product';
import { ProductDBService } from 'common-db/service/ProductDBService';
import { ProductLayoutsDBService } from 'common-db/service/ProductLayoutsDBService';
import { ErrorUtil } from 'common-util/ErrorUtil';

export class ShoppingFeedService extends ProductVariationBaseService {

  private static readonly MAX_TITLE_LENGTH = 150;

  private static readonly FILTER = {};

  protected getFeedName(): string {
    return 'shopping';
  }

  protected getFeedBucketKey(): string {
    return 'shopping-feed/feed.csv';
  }

  protected getFeedSecretEnvKey(): string {
    return 'SHOPPING_FEED_SECRET';
  }

  protected getFeedItemsCount(): Promise<number> {
    return DBService.getCollection(DBCollection.SHOPPING_FEEDS)
      .then(collection => collection.countDocuments(ShoppingFeedService.FILTER));
  }

  protected getFeedExportHeader(): string[] {
    return [
      'id',
      'original_id',
      'item_group_id',
      'sku',
      'title',
      'display_ads_title',
      'link',
      'image_link',
      'color',
      'condition',
      'product_type',
      'brand',
      'size',
      'mpn',
      'price',
      'sale_price',
      'description',
      'custom_label_0',
      'custom_label_1',
      'custom_label_2',
      'custom_label_3',
      'custom_label_4',
      'shipping_weight',
      'availability',
      'google_product_category',
      'main_category_lv1',
      'main_category_lv2',
      'main_category_lv3',
      'main_category_lv4',
      'main_category_lv5',
      'main_category_lv6',
      'medium',
      'preview_room_type',
      'preview_room_style',
      'rooms',
      'shape',
      'artist',
      'pieces',
      'published_at',
    ];
  }

  public async deleteProductFromShopingFeed(sku: string): Promise<void> {
    try {
      const ShoppingFeed = await DBService.getCollection(DBCollection.SHOPPING_FEEDS);
      await ShoppingFeed.deleteMany({ sku });
    } catch (err) {
      throw ErrorUtil.general(`Error while deleting shopping feed!`);
    }
  }

  protected getFeedContent(): Promise<Readable> {
    return DBService.getCollection(DBCollection.SHOPPING_FEEDS)
      .then(collection => collection.find(ShoppingFeedService.FILTER)
        .project({
          _id: 0,
          original_id: 1,
          id: 1,
          item_group_id: 1,
          color: 1,
          condition: 1,
          brand: 1,
          link: 1,
          title: 1,
          main_category_lv1: 1,
          main_category_lv2: 1,
          main_category_lv3: 1,
          main_category_lv4: 1,
          main_category_lv5: 1,
          main_category_lv6: 1,
          medium: 1,
          preview_room_type: 1,
          preview_room_style: 1,
          display_ads_title: 1,
          size: 1,
          sku: 1,
          mpn: 1,
          image_link: 1,
          price: 1,
          sale_price: 1,
          description: 1,
          product_type: 1,
          custom_label_0: 1,
          custom_label_1: 1,
          custom_label_2: 1,
          custom_label_3: 1,
          custom_label_4: 1,
          shipping_weight: 1,
          availability: 1,
          google_product_category: 1,
          artist: 1,
          pieces: 1,
          rooms: 1,
          shape: 1,
          published_at: 1,
        })
        .stream());
  }

  protected transformItem(product: Row): ShoppingFeedItem {
    return product as ShoppingFeedItem;
  }

  protected async populateItem(sku: string): Promise<void> {
    const product = await this.getProductDetails(sku);
    const extras = product?.extra_data?.find(data => data);

    const sales = await ProductService.getProductSales(sku);
    const layouts = await ProductLayoutsDBService.prepareLayouts(product);

    const category = await ProductVariationBaseService.getCategory(extras);
    const parent = {
      ...(await this.prepareParentFeedItem(product, extras, sales)),
      ...category,
      shape: [...new Set(layouts.map(layout => layout.shape))].join(' / ') || ProductLayoutsDBService.parseLayoutShape(),
      rooms: this.prepareRooms(layouts)
    };

    const variants = this.prepareVariantFeedItems(parent, product.variants, layouts, category);

    delete parent.styles;

    const ShoppingFeed = await DBService.getCollection(DBCollection.SHOPPING_FEEDS);
    await ShoppingFeed.deleteMany({ sku });
    await ShoppingFeed.insertMany([
      parent,
      ...variants
    ]);
  }

  async getProductDetails(sku: string): Promise<Product> {
    return await ProductDBService.getProduct(sku, {
      _id: 0,
      sku: 1,
      title: 1,
      description: 1,
      url: 1,
      image: 1,
      product_type: 1,
      shopify_id: 1,
      published_at: 1,
      last_updated: 1,
      layouts: 1,
      exclusive: 1,
      extra_data: {
        colors: 1,
        artist: 1,
        displayed_artist: 1,
        styles: 1,
        main_category: {
          _id: 1
        },
        mediums: 1,
        cloudinaryColors: 1,
      },
      variants: {
        id: 1,
        price: 1,
        compare_at_price: 1,
        image: 1,
        option1: 1,
        option2: 1,
        option3: 1,
      },
    });
  }

  private async prepareParentFeedItem(product: Product, extras: ProductExtras = {}, sales: ProductSales[]): Promise<ShoppingFeedInternal> {
    const productSales = sales.find(sale => sale.sku == product.sku)?.sales || 0;

    const base = await this.prepareProductFeedBaseItem(product, extras, productSales);

    let color = '';
    if (extras?.colors?.length) {
      color = extras?.colors?.map((color: string) => DataUtil.capitalizeFirstLetter(color)).join('/') || '';
    } else {
      color = base.color;
    }

    const styles = extras?.styles?.find(style => style) || '';

    return {
      ...base,

      // shopping feed fields
      display_ads_title: product.title,
      title: ShoppingFeedService.prepareTitle(product.title, '', color, styles,extras?.artist || ''),
      description: `${(DataUtil.htmlDecode(product.description))} `,
      size: '',
      pieces: '',

      styles,
      medium: extras?.mediums?.length ? extras?.mediums[0]?.name : '',
      published_at: product.published_at?.getTime() || 0,
      last_updated: product.last_updated,
    };
  }

  private static prepareTitle(name: string, pieces: string, colors: string, style: string, artist: string) {
    let title = `${name}${pieces ? ` - ${pieces}` : ''}${colors ? ` - ${colors}` : ''}${style ? ` - ${style}` : ''}`;

    const artistPrefix = ' - by ';
    if (artist && (title.length + artistPrefix.length + artist.length) <= ShoppingFeedService.MAX_TITLE_LENGTH) {
      title += `${artistPrefix}${artist}`;
    }

    const brandPrefix = ' - by ElephantStock';
    if ((title.length + brandPrefix.length) <= ShoppingFeedService.MAX_TITLE_LENGTH) {
      title += brandPrefix;
    }

    return title;
  }

  private prepareVariantFeedItems(parent: ShoppingFeedInternal,
                                  variants: ProductVariant[] = [],
                                  layouts: ProductLayout[], category: ProductLayoutFeedItemCategory): ShoppingFeedInternal[] {
    let variantPieces = variants.map(variant => variant.option1 || '').filter(Boolean);

    variantPieces = [...new Set(variantPieces)].sort();

    return variants.map(variant => {
      const layout = variant.option2
        ? layouts.find(l => l.short_layout == variant.option1 && l.sizes.includes(<string>variant.option2))
        : undefined;
      const firstRoom = layout?.rooms.find(room => room);

      const pieces = variant.option1?.includes('Framed')
        ? '1 piece'
        : variant.option1?.toLowerCase();

      return {
        original_id: variant.id?.toString(),
        id: variant.id?.toString(),
        item_group_id: parent.item_group_id,
        published_at: parent.published_at,
        last_updated: parent.last_updated,
        color: parent.color,
        condition: parent.condition,
        brand: parent.brand,
        link: `${parent.link}?variant=${variant.id}`,
        title: ShoppingFeedService.prepareTitle(parent.display_ads_title, pieces || '', parent.color, parent?.styles || '',parent.artist || ''),
        display_ads_title: parent.display_ads_title,
        size: variant.option3 === '0.75"' || variant.option3 === '1.5"'
          ? variant.option2 + ' / ' + variant.option3
          : variant.option2 || '',
        sku: parent.sku,
        mpn: parent.mpn,
        image_link: variant.image,
        price: `${variant.compare_at_price || 0} USD`,
        sale_price: `${variant.price || 0} USD`,
        description: parent.description,
        product_type: parent.product_type,
        custom_label_0: parent.custom_label_0,
        custom_label_1: parent.custom_label_1,
        custom_label_2: parent.custom_label_2,
        custom_label_3: parent.custom_label_3,
        custom_label_4: 'Variant',
        shipping_weight: parent.shipping_weight,
        availability: parent.availability,
        google_product_category: parent.google_product_category,
        artist: parent.artist,
        pieces: variantPieces.join(' / '),
        shape: layout?.shape || '',
        rooms: this.prepareRooms(layout ? [layout] : []),
        medium: parent.medium,
        preview_room_style: DataUtil.capitalizeFirstLettersForSentence(firstRoom?.styles?.find(style => style)),
        preview_room_type: DataUtil.capitalizeFirstLettersForSentence(firstRoom?.room_type),
        ...category,
      };
    });
  }

  public static async getFeed(page: Page<never>,
                              salesLabel?: string, productType?: string, query?: string): Promise<Page<ShoppingFeedInternal>> {
    const skip = page.page * page.page_size;
    const shoppingFeedCollection = await DBService.getCollection(DBCollection.SHOPPING_FEEDS);
    const andOptions: object[] = [];

    if (query) {
      const regex = new RegExp(`^${query}`);

      andOptions.push({
        $or: [
          {
            title: { $regex: regex },
          },
          {
            original_id: { $regex: regex },
          },
          {
            id: { $regex: regex },
          },
          {
            sku: { $regex: regex },
          },
        ],
      });
    }

    if (salesLabel) {
      andOptions.push({ custom_label_3: salesLabel });
    }

    if (productType) {
      andOptions.push({ product_type: productType });
    }

    const dbFindQuery = andOptions.length ? { $and: andOptions } : {};

    const feeds = await shoppingFeedCollection.find<ShoppingFeedInternal>(dbFindQuery)
      .skip(skip)
      .limit(page.page_size)
      .toArray();

    const feedsCount = await shoppingFeedCollection.find<ShoppingFeedInternal>(dbFindQuery).count();

    return {
      total_items: feedsCount,
      page_size: page.page_size,
      page: page.page,
      content: feeds,
    };
  }

  private prepareRooms(layouts: ProductLayout[]): string {
    const roomTypes = new Set<string>();

    layouts.forEach(layout => {
      layout.rooms
        .map(room => room.room_type)
        .filter(type => !!type)
        .forEach(type => roomTypes.add(<string>type));
    });

    return [...roomTypes].join(' / ');
  }
}
