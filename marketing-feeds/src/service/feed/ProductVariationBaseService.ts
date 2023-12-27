import { Product, ProductExtras } from 'common-db/model/Product';
import { ProductFeedBaseItem, ProductLayoutFeedItemCategory } from '../../model/Feed';
import { DataUtil } from 'common-util/DataUtil';
import { FeedService } from './FeedService';
import { ProductDBService } from 'common-db/service/ProductDBService';
import { ProductService } from '../product/ProductService';

export abstract class ProductVariationBaseService extends FeedService {
  public static shopDomain = 'https://www.elephantstock.com';
  public static MAIN_CATEGORY_TREE_DEPTH = 6;

  protected async prepareProductFeedBaseItem(product: Product, extras: ProductExtras = {}, sales = 0): Promise<ProductFeedBaseItem> {
    const shopifyId = product.shopify_id?.toString() || '';
    const colors = await ProductService.getProductColors(extras.cloudinaryColors || []);

    return {
      id: shopifyId,
      original_id: shopifyId,
      item_group_id: shopifyId,
      color: colors.map((color: string) => DataUtil.capitalizeFirstLetter(color)).join('/') || '',
      condition: 'new',
      brand: 'ElephantStock',
      link: `${ProductVariationBaseService.shopDomain}${product.url}`,
      sku: product.sku,
      mpn: product.sku,
      image_link: product.image,
      price: product.variants?.length ? (product.variants[0].compare_at_price || 0) + ' USD' : '',
      sale_price: product.variants?.length ? (product.variants[0].price || 0) + ' USD' : '',
      product_type: product.product_type,
      custom_label_0: 'Live',
      custom_label_1: product.product_type,
      custom_label_2: product.exclusive ? 'exclusive' : '',
      custom_label_3: this.getSalesCustomLabel(sales),
      custom_label_4: 'Parent',
      shipping_weight: '0 lb',
      availability: 'in stock',
      google_product_category: this.GOOGLE_PRODUCT_CATEGORY,
      artist: extras?.displayed_artist || ''
    };
  }

  protected static async getCategory(extras: ProductExtras | undefined): Promise<ProductLayoutFeedItemCategory> {
    const categoryData: { [key in string]: string } = {};
    const categoryNames: string[] = [];

    if (extras?.main_category?._id) {
      const categories = await ProductDBService.loadCategoryTree([extras.main_category._id]);

      if (categories.length) {
        if (categories[0].parents && categories[0].parents.length > 0) {
          const reversedParents = categories[0].parents.reverse();
          for (const parentCategory of reversedParents) {
            categoryNames.push(parentCategory.name);
          }
        }
        categoryNames.push(categories[0].name);
      }
    }

    for (let j = 0; j < ProductVariationBaseService.MAIN_CATEGORY_TREE_DEPTH; j++) {
      const fieldName =  `main_category_lv${j+1}`;
      categoryData[fieldName] = categoryNames[j] || '';
    }

    return categoryData;
  }
}
