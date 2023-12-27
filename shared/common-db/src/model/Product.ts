import { DBObjectId } from '../service/DBService';

export enum ProductStatus {
  live = 'live'
}

export interface Product {
  sku: string;
  exclusive: boolean;
  personalized: boolean;
  hot_deal: boolean;
  push_pin?: boolean;
  title: string;
  description?: string;
  url: string;
  image: string;
  product_type: string;
  shopify_id: number;
  last_updated?: Date;
  created_at?: Date;
  published_at?: Date;
  extra_data?: ProductExtras[];
  variants: ProductVariant[];
  additional_images?: ProductImage[];
  main_product_image?: string;
  main_product_image_upload_hash?: string;
  shopify_main_product_image?: string;
  layouts: string[];
  edit_status?: string;
  isHidden?: boolean;
}

export interface ProductCategory {
  _id: DBObjectId;
}

export interface ProductMedium {
  _id: DBObjectId;
  name?: string;
}

export interface ProductAtmosphere {
  _id: DBObjectId;
  name?: string;
}

export interface ProductStyle {
  _id: DBObjectId;
  name?: string;
}

export interface ProductBusiness {
  _id: DBObjectId;
  name?: string;
}

export interface ProductPersona {
  _id: DBObjectId;
  name?: string;
}

export interface ProductOccasion {
  _id: DBObjectId;
  name?: string;
}

export interface ProductTag {
  name: string;
  export?: boolean;
  pending?: boolean;
}

export interface ProductExtras {
  main_color?: string;
  artist?: string;
  displayed_artist?: string;
  colors?: string[];
  styles?: string[];
  collection_main_color?: string;
  cloudinaryColors?: string[];
  main_category?: ProductCategory;
  guest_categories?: ProductCategory[];
  mediums?: ProductMedium[];
  atmospheres?: ProductAtmosphere[];
  brand?: {
    name?: string;
    propertyName?: string;
  };
  collection_styles?: ProductStyle[];
  businesses?: ProductBusiness[];
  personas?: ProductPersona[];
  occasions?: ProductOccasion[];
  product_tags?: ProductTag[];
  designProject?: string;
  story?: string;
}

export interface ProductVariant {
  id: number;
  image: string;
  price: number;
  compare_at_price: number;
  option1: ProductLayoutShortName;
  option2?: ProductLayoutSize;
  option3?: string;
  title?: string;
  position?: number;
  taxable?: boolean;
  barcode?: string;
  grams?: number;
  weight?: number;
  weight_unit?: string;
  requires_shipping?: boolean;
}

export interface ProductImage {
  src: string;
  belongs_to_main_layout: boolean;
  shopify_layout: string, // 1 piece, 5 piece, framed print, floating frame, etc...
}

export interface ProductPreview {
  layouts: ProductPreviewLayout[];
}

export interface Product3DPreview {
  src: string;
  cdn_url: string;
  cdn_upload_hash: string;
  shopify_cdn_url?: string;
  shopify_cdn_id?: string;
}

export interface ProductRoomPreview {
  image: {
    src: string;
    shopify_src?: string;
  };
}

export interface ProductPreviewLayout {
  layout_name: string;
  images: ProductRoomPreview[];
  chosen_room_ids?: string[];
  preview_3d?: Product3DPreview;
  last_updated?: Date;
}

export interface RoomPreview {
  url: string;
  tags?: string[];
}

export interface ProductVariantConfig {
  key: string;
  value: ProductVariantConfigValue[];
}

export type ProductLayoutShortName =
  '1 Piece'
  | '2 Piece'
  | '3 Piece'
  | '4 Piece'
  | '5 Piece'
  | '6 Piece'
  | '7 Piece'
  | 'Framed Canvas'
  | 'Framed Print'
  | 'Poster Print';

export interface ProductVariantConfigValue {
  option1: ProductLayoutShortName;
  option2: ProductLayoutSize;
  position?: number;
  price?: string;
  compare_at_price?: string;
}

export interface ProductLayoutRoom {
  room_id: string;
  image_link?: string;
  room_type?: string;
  styles: string[];
  colors: string[];
  unique: string[];
}

export type ProductLayoutPieces = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ProductLayoutType = 'Canvas' | 'Framed Canvas' | 'Framed Print' | 'Poster Print' | 'Unknown';
export type ProductLayoutShape = 'hexagon' | 'horizontal' | 'mix' | 'panoramic' | 'square' | 'vertical' | 'unknown';
export type ProductLayoutSize = string;

export type ProductLayout = {
  layout: string;
  short_layout: ProductLayoutShortName;
  master_handle?: string;
  pieces: ProductLayoutPieces;
  shape: ProductLayoutShape;
  type: ProductLayoutType;
  url: string;
  sizes: ProductLayoutSize[];
  preview_3d?: string;
  rooms: ProductLayoutRoom[];
  compare_at_price: number;
  price: number;
}

export interface MetadataEntity {
  _id: DBObjectId;
  identifier: string;
  name: string;
}

export interface HierarchicalEntity extends MetadataEntity {
  level?: number;
  parents?: HierarchicalEntity[];
}

export interface Category extends HierarchicalEntity {
  slug: string;
  suffix: string;
  status?: string;
  parents?: Category[];
}
