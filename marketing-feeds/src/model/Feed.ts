import { ProductLayoutPieces, ProductLayoutType } from 'common-db/model/Product';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FeedItem {
}

export interface ProductFeedBaseItem extends FeedItem {
  id: string;
  original_id?: string;
  item_group_id: string;
  color: string;
  condition: string;
  brand: string;
  link: string;
  sku: string;
  mpn: string;
  image_link: string;
  price: string;
  sale_price: string;
  product_type: string;
  custom_label_0?: string;
  custom_label_1?: string;
  custom_label_2: string;
  custom_label_3: number;
  custom_label_4: string;
  shipping_weight: string;
  availability: string;
  google_product_category: string;
  artist?: string;
}

export interface ProductFeedItem extends ProductFeedBaseItem {
  title: string;
  description: string;
  additional_image_link?: string;
  additional_image_link_main_layout?: string;
  upc: string;
}

export interface ShoppingFeedItem extends ProductFeedBaseItem {
  display_ads_title: string;
  rooms?: string;
  shape?: string;
  title: string;
  description: string;
  size: string;
  pieces: string;
  main_category_lv1?: string;
  main_category_lv2?: string;
  main_category_lv3?: string;
  main_category_lv4?: string;
  main_category_lv5?: string;
  main_category_lv6?: string;
  medium?: string;
  preview_room_style?: string;
  preview_room_type?: string;
  published_at: number;
}

export interface ShoppingFeedInternal extends ShoppingFeedItem {
  styles?: string;
  last_updated?: Date;
}

export interface ProductVariationFeedItemBase extends ProductFeedBaseItem {
  product_name: string;
  product_name_length: number;
  square_image: string;
  medium?: string;
  atmosphere?: string;
  brand_name?: string;
  style?: string;
  business?: string;
  main_color?: string;
  main_color_parent?: string;
  additional_colors?: string;
}

export interface ProductLayoutFeedItemCategory {
  main_category_lv1?: string;
  main_category_lv2?: string;
  main_category_lv3?: string;
  main_category_lv4?: string;
  main_category_lv5?: string;
  main_category_lv6?: string;
}

export interface ProductLayoutFeedItemBase extends ProductVariationFeedItemBase, ProductLayoutFeedItemCategory {
  tags: string;
  exclusive: boolean;
  personalized: boolean;
  published_at: number;
}

export interface ProductLayoutFeedItem extends ProductLayoutFeedItemBase {
  layout: string;
  additional_images: string;
  preview_room_type: string;
  preview_room_style: string;
  pieces: ProductLayoutPieces;
  shape: string;
  material: ProductLayoutType;
  preview_image_3d: string;
}

export interface ProductLayoutFeedItemInternal extends ProductLayoutFeedItem {
  updated_at?: Date;
}

export interface ProductFeedConfig {
  shopify_id: string;
  custom_label_2: boolean;
}

export enum FeedUpdateAction {
  delete = 'delete',
}
