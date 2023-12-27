import { ProductLayoutShortName } from 'common-db/model/Product';

export type GraphqlQueryResponse<T> = {
  [key: string]: EdgeData<T>
}

export type GraphqlMutationBaseResponse = {
  userErrors?: Error[]
}

export type EdgeData<T> = {
  edges: NodeData<T>[]
}

export type NodeData<T> = {
  node: T
}

export type Publication = {
  id: string,
  name: string
}

export type CollectionImage = {
  id?: string,
  src: string
}

export type Collection = {
  id?: string,
  title: string,
  descriptionHtml: string,
  handle: string,
  templateSuffix: string,
  image?: CollectionImage
}

export type CollectionInput = Collection;

export type GraphqlCollectionCreate = GraphqlMutationBaseResponse & {
  collection: Collection;
}

export type GraphqlCollectionCreateResponse = {
  collectionCreate: GraphqlCollectionCreate;
}

export type GraphqlPublishablePublish = GraphqlMutationBaseResponse & {

}

export type GraphqlPublishablePublishResponse = {
  publishablePublish: GraphqlPublishablePublish
}

export type GraphqlCollectionUpdate = GraphqlMutationBaseResponse & {
  collection: Collection
}

export type GraphqlCollectionUpdateResponse = {
  collectionUpdate: GraphqlCollectionUpdate
}

export enum ShopifyMetafieldNamespace {
  categorization = 'categorization',
  previews = 'previews',
  images = 'images',
  product = 'product',
  story = 'story',
}

export enum ShopifyMetafieldType {
  string = 'single_line_text_field',
  json = 'json',
  boolean = 'boolean',
  // integer = 'number_integer'
}

export enum ShopifyCategorizationMetafield {
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

export enum ShopifyGeneralMetafield {
  square_image = 'main_image_center',
  tags = 'tags',
  labels = 'labels',
  design_project = 'design_project',
  project_source = 'json',
  sku = 'sku'
}

export enum ShopifyPreviewsMetafield {
  previews_3d = 'previews_3d',
  previews_room = 'previews_room',
  layouts = 'layouts',
}

export type ShopifySkipMetafield = 'skip-metafield-update';

export type ShopifyMetafieldName = ShopifyCategorizationMetafield
  | ShopifyPreviewsMetafield
  | ShopifyGeneralMetafield
  | ShopifySkipMetafield;

export type ProductMetafieldUpdateData<T = string> = {
  productId: number;
  key: ShopifyMetafieldName;
  namespace: ShopifyMetafieldNamespace;
  type: ShopifyMetafieldType;
  value: T;
}

export type ProductNameUpdateData = {
  title: string;
  descriptionHtml: string;
}

export type ProductUrlUpdateData = {
  handle: string;
  redirectNewHandle: boolean;
}

export type ProductLayoutImageUpdateData = {
  [layout: string]: string;
}

export type ProductLayoutSimpleData = {
  master_name: string;
  master_handle?: string;
  shape: string;
  previews: ProductLayoutSimplePreviews;
}

export type ProductLayoutShortNameType = ProductLayoutShortName;

export type ProductLayoutSimple3DType = {
  auto?: string;
}

export type ProductLayoutSimpleRoomsType = {
  url?: string;
  room?: string
}

export type ProductLayoutSimplePreviews = {
  '3d': ProductLayoutSimple3DType,
  rooms: ProductLayoutSimpleRoomsType[]
}

export type ProductLayoutMapUpdateData = {
  [key in ProductLayoutShortNameType]?: ProductLayoutSimpleData;
}

export type ProductNameTypeUpdateData = ProductNameUpdateData | ProductUrlUpdateData;

export type ProductGeneralSubTypeUpdateInputOption = {
  name: string;
  position: number;
}

export type ProductGeneralUpdateData = {
  productType: string;
  vendor?: string;
  options?: ProductGeneralSubTypeUpdateInputOption[],
}

export type ProductMainImageUpdateData = {
  main_image: string;
}

export interface ProductTagsUpdateData {
  tags: string[];
}

export type ProductGeneralTypeUpdateData = ProductGeneralUpdateData | ProductMainImageUpdateData | ProductTagsUpdateData;

type ProductUpdateBody = ProductNameTypeUpdateData
  | ProductGeneralTypeUpdateData
  | ProductLayoutImageUpdateData
  | ProductLayoutMapUpdateData;

export type ShopifyProductUpdateDto = {
  update: ProductUpdateBody,
  metafields: ProductMetafieldUpdateData[]
}

export type ShopifyProductUpdate = ProductMetafieldUpdateData | ProductMetafieldUpdateData[] | ProductUpdateBody
  | ShopifyProductUpdateDto;
