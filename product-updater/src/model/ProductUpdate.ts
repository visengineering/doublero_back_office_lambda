import { ProductLayout } from 'common-db/model/Product';
import { ContentType } from 'common-util/AssetUtil';
import { ProductLabel } from './Product';

export type ProductUpdateEventTypes = {
  [key in ProductUpdateType]?: ProductUpdateSubType[]
};

export interface BaseProductUpdateData {
  sku: string;
  shopify_id: number;
  updates: Update[];
}

export interface ProductUpdate extends BaseProductUpdateData {
  images: ImageUpload[];
}

export interface Update {
  type: ProductUpdateType;
  sub_type: ProductUpdateSubType;
  action: UpdateAction;
  data: UpdateDataType;
}

export enum UpdateAction {
  update = 'update',
  delete = 'delete',
}

export enum ImageUploadDestination {
  shopify = 'shopify',
  s3 = 's3'
}

export interface ImageUpload {
  type: ImageUploadType;
  destination?: ImageUploadDestination,
  source_url: string;
  content_type?: ContentType;
  destination_url: string;
  destination_bucket?: string;
  destination_key?: string;
}

export interface ProductImagesUpdate {
  updates: Update[];
  images: ImageUpload[];
}

export enum ImageUploadType {
  square_image = 'square_image',
  preview_room = 'preview_room',
  preview_3d = 'preview_3d',
}

export interface QueueUpdate extends BaseProductUpdateData {
  task_token: string;
  action: UpdateAction;
  execution_id?: string;
  skip_update?: boolean;
}

export enum ProductUpdateType {
  categorization = 'categorization',
  general = 'general',
  name = 'name',
  previews = 'previews',
}

export enum ProductUpdateCategorizationSubType {
  artist = 'artist',
  atmospheres = 'atmospheres',
  businesses = 'businesses',
  personas = 'personas',
  occasions = 'occasions',
  categories_guest = 'categories_guest',
  categories_main = 'categories_main',
  categories_all = 'categories_all',
  colors_main = 'colors_main',
  colors_secondary = 'colors_secondary',
  mediums = 'mediums',
  styles = 'styles',
}

export enum ProductUpdateNameSubType {
  name = 'name',
  url = 'url',
}

export enum ProductUpdatePreviewsSubType {
  layouts = 'layouts',
  previews_room = 'previews_room',
  previews_3d = 'previews_3d',
}

export enum ProductUpdateGeneralSubType {
  general = 'general',
  labels = 'labels',
  tags = 'tags',
  square_image = 'square_image',
  project_source = 'project_source',
  sku = 'sku'
}

export type ProductUpdateSubType = ProductUpdateCategorizationSubType
  | ProductUpdateNameSubType
  | ProductUpdatePreviewsSubType
  | ProductUpdateGeneralSubType;

export interface CategorizationUpdateData {
  name: string;
  identifier: string;
}

export interface TreeUpdateData extends CategorizationUpdateData {
  suffix?: string;
  slug?: string;
  level?: number;
  parents?: TreeUpdateData[];
}

export type ProductUpdateArtistData = CategorizationUpdateData;

export interface ProductUpdateAtmospheresData {
  atmospheres: CategorizationUpdateData[];
}

export interface ProductUpdateBusinessesData {
  businesses: TreeUpdateData[];
}

export interface ProductUpdatePersonasData {
  personas: TreeUpdateData[];
}

export interface ProductUpdateOccasionsData {
  occasions: TreeUpdateData[];
}

export interface ProductUpdateCategoriesData {
  main_category?: TreeUpdateData;
  guest_categories?: TreeUpdateData[];
  categories_all?: TreeUpdateData[];
}

export interface ProductUpdateColorsData {
  main_color?: TreeUpdateData;
  secondary_colors?: TreeUpdateData[];
}

export interface ProductUpdateMediumsData {
  mediums: CategorizationUpdateData[];
}

export interface ProductUpdateStylesData {
  styles: TreeUpdateData[];
}

export type ProductUpdateLayoutData = ProductLayout;
export type ProductUpdateLayoutSimpleData = {
  name: string;
}

export interface ProductUpdate3dPreviewData {
  layout: string;
  short_layout: string;
  preview_3d?: string;
  s3_cdn_url?: string;
  cdn_upload_hash: string;
  shopify_cdn_upload_url?: string;
  shopify_cdn_id?: string;
}

export interface ProductUpdateRoomPreviewData {
  layout: string;
  rooms: {
    room_id: string;
    image_link: string;
  }[];
}

export interface ProductUpdateNameData {
  title: string;
  description?: string;
}

export interface ProductUpdateUrlData {
  url: string;
}

export interface ProductUpdateTagsData {
  tags: string[];
}

export interface ProductUpdateLabelsData {
  labels: ProductLabel[];
  design_project?: string;
}

export interface ProductUpdateGeneralDataOption {
  name: string;
  position: number;
}

export interface ProductUpdateBaseData {
  sku: string;
}

export interface ProductUpdateGeneralData {
  sku: string;
  product_type: string;
  created_at: Date | null;
  last_updated_at: Date | null;
  published_at: Date | null;
  shopify_id: number;
  vendor: string;
  options: ProductUpdateGeneralDataOption[],
  published: boolean;
}

export interface ProductUpdateSquareImageData {
  square_image_src: string;
  square_image_src_upload_hash: string;
  square_image_src_upload_url?: string;
  square_image_cdn?: string;
}

export interface ProductUpdateProjectSourceData {
  story: string;
}

export type UpdateDataType = ProductUpdateArtistData
  | ProductUpdate3dPreviewData
  | ProductUpdateAtmospheresData
  | ProductUpdateBusinessesData
  | ProductUpdatePersonasData
  | ProductUpdateOccasionsData
  | ProductUpdateCategoriesData
  | ProductUpdateColorsData
  | ProductUpdateBaseData
  | ProductUpdateGeneralData
  | ProductUpdateLayoutData[]
  | ProductUpdateLayoutSimpleData[]
  | ProductUpdateMediumsData
  | ProductUpdateNameData
  | ProductUpdateRoomPreviewData
  | ProductUpdateSquareImageData
  | ProductUpdateStylesData
  | ProductUpdateTagsData
  | ProductUpdateLabelsData
  | ProductUpdateProjectSourceData
  | ProductUpdateUrlData;

export interface ProductDelete extends Omit<ProductUpdate,'shopify_id'> {
  action: UpdateAction;
  shopify_id?: number;
}
