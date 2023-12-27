import { Row } from '@fast-csv/format';
import { DBService } from 'common-db/service/DBService';
import { DBCollection } from 'common-db/DBCollection';
import { Product, ProductImage } from 'common-db/model/Product';
import { ProductFeedConfig, ProductFeedItem } from '../../model/Feed';
import { DataUtil } from 'common-util/DataUtil';
import { Readable } from 'stream';
import { ProductService } from '../product/ProductService';
import { FeedService } from './FeedService';
import { ProductSales } from '../../model/Product';
import { ProductDBService } from 'common-db/service/ProductDBService';
import { ErrorUtil } from 'common-util/ErrorUtil';

export class ProductFeedService extends FeedService {
  private static readonly FILTER = {};

  protected getFeedName(): string {
    return 'product';
  }

  protected getFeedBucketKey(): string {
    return 'product-feed/feed.csv';
  }

  protected getFeedSecretEnvKey(): string {
    return 'PRODUCT_FEED_SECRET';
  }

  public async deleteProductFromProductFeed(sku: string): Promise<void> {
    try {
      const ProductFeed = await DBService.getCollection(DBCollection.PRODUCT_FEEDS);
      await ProductFeed.deleteMany({ sku });
    } catch (err) {
      throw ErrorUtil.general(`Error while deleting product feed!`);
    }
  }

  protected getFeedItemsCount(): Promise<number> {
    return DBService.getCollection(DBCollection.PRODUCTS)
      .then(collection => collection.countDocuments(ProductFeedService.FILTER));
  }

  protected getFeedExportHeader(): string[] {
    return [
      'id',
      'item_group_id',
      'sku',
      'title',
      'link',
      'image_link',
      'price',
      'sale_price',
      'description',
      'brand',
      'product_type',
      'color',
      'condition',
      'additional_image_link',
      'additional_image_link_main_layout',
      'mpn',
      'upc',
      'shipping_weight',
      'availability',
      'google_product_category',
      'custom_label_2',
      'custom_label_3',
      'custom_label_4',
    ];
  }

  protected getFeedContent(): Promise<Readable> {
    return DBService.getCollection(DBCollection.PRODUCT_FEEDS)
      .then(collection => collection.find(ProductFeedService.FILTER)
        .project({
          _id: 0,
          id: 1,
          title: 1,
          link: 1,
          sale_price: 1,
          description: 1,
          price: 1,
          brand: 1,
          condition: 1,
          image_link: 1,
          additional_image_link: 1,
          additional_image_link_main_layout: 1,
          mpn: 1,
          item_group_id: 1,
          upc: 1,
          shipping_weight: 1,
          availability: 1,
          product_type: 1,
          google_product_category: 1,
          color: 1,
          custom_label_2: 1,
          custom_label_3: 1,
          custom_label_4: 1,
          sku: 1,
        })
        .stream());
  }

  protected transformItem(productFeeds: Row): ProductFeedItem {
    return productFeeds as ProductFeedItem;
  }

  private static async getProductFeedConfig(shopifyId?: number): Promise<ProductFeedConfig[]> {
    const feedConfigCollection = await DBService.getCollection(DBCollection.PRODUCTS_FEED_CONFIG);

    const documents = await feedConfigCollection
      .find({
        ...(shopifyId && { shopify_id: String(shopifyId) })
      })
      .project({
        _id: 0,
        shopify_id: 1,
        custom_label_2: 1
      })
      .toArray();

    return documents.map(({shopify_id, custom_label_2}) => ({shopify_id, custom_label_2}));
  }

  private async getProductFeedItem(product: Product, sales: ProductSales[], feedConfig: ProductFeedConfig[]): Promise<ProductFeedItem> {
    const shopifyId = product.shopify_id?.toString() || '';
    const productSales = sales.find(sale => sale.sku == product.sku)?.sales || 0;
    const productConfig = feedConfig.find(field => field.shopify_id == shopifyId);

    const extras = product?.extra_data?.length ? product.extra_data[0] : undefined;
    const colors = await ProductService.getProductColors(extras?.cloudinaryColors);

    return {
      id: shopifyId,
      title: product.title,
      link: `https://www.elephantstock.com${product.url}`,
      sale_price: (product.variants[0]?.price || 0) + ' USD',
      description: this.getProductDescription(product.title, product.description?.trim()),
      price: (product.variants[0]?.compare_at_price || 0) + ' USD',
      brand: 'ElephantStock',
      condition: 'new',
      image_link: product.image,
      additional_image_link: ProductFeedService.extractAdditionalImagesOneEachLayout(product.additional_images),
      additional_image_link_main_layout: ProductFeedService.extractAdditionalImagesAllMainLayout(product.additional_images),
      mpn: product.sku,
      item_group_id: shopifyId,
      upc: '',
      shipping_weight: '0 lb',
      availability: 'in stock',
      product_type: product.product_type,
      google_product_category: this.GOOGLE_PRODUCT_CATEGORY,
      color: colors.map(color => DataUtil.capitalizeFirstLetter(color)).join('/') || '',
      custom_label_2: productConfig?.custom_label_2 ? 'excluded' : '',
      custom_label_3: this.getSalesCustomLabel(productSales),
      custom_label_4: 'Parent',
      sku: product.sku,
    };
  }

  private static extractAdditionalImagesAllMainLayout(additionalImages: ProductImage[] = []): string {
    const images = additionalImages
      .filter(image => image.belongs_to_main_layout)
      .map(image => image.src);
    if (images.length >= 5) {
      images.shift(); // possibly the additional images include the main image as well, so we need to discard it
    }

    return (images.length > 4 ? images.slice(0, 4) : images).join(','); // only 4 additional images
  }

  private static extractAdditionalImagesOneEachLayout(additionalImages: ProductImage[] = []): string {
    const mainLayoutImagesCount = additionalImages.filter(image => image.belongs_to_main_layout).length;

    const images: string[] = [];
    const layouts = new Set<string>();
    let lastLayout = '';

    additionalImages.forEach((image, index) => {
      if (image.belongs_to_main_layout) {
        if ((!lastLayout || image.shopify_layout !== lastLayout) && !layouts.has(image.shopify_layout)) {
          if (mainLayoutImagesCount >= 5) {
            if (!additionalImages[index + 1]) {
              return;
            }
            images.push(additionalImages[index + 1].src); // push the second item
            layouts.add(additionalImages[index + 1].shopify_layout);
          } else {
            images.push(additionalImages[index].src); // push the first item
            layouts.add(additionalImages[index + 1].shopify_layout);
          }
        }
      } else {
        if ((!lastLayout || image.shopify_layout !== lastLayout) && !layouts.has(image.shopify_layout)) {
          images.push(image.src);
          layouts.add(image.shopify_layout);
        }
      }
      lastLayout = image.shopify_layout;
    });

    return images.join(',');
  }

  public async populateItem(sku: string): Promise<void> {
    const product = await ProductDBService.getProduct(sku, { _id: 0 });

    const sales = await ProductService.getProductSales(sku);
    const feedConfig = await ProductFeedService.getProductFeedConfig(product.shopify_id);

    const productFeedCollection = await DBService.getCollection(DBCollection.PRODUCT_FEEDS);

    const productFeedItem = await this.getProductFeedItem(product, sales, feedConfig);
    await productFeedCollection.findOneAndReplace({ sku }, productFeedItem, { upsert: true });
  }
}
