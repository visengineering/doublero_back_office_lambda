import { ProductLayoutPieces, ProductLayoutShape, ProductLayoutSize } from 'common-db/model/Product';
import { ProductLabel } from './Product';

export type AlgoliaProductStylesType = {
  [key in `extra_styles_lv${number}`]: string[];
};

export type AlgoliaProductMainCategoryType = {
  [key in `extra_main_category_lv${number}`]: string;
};

export type AlgoliaProductGuestCategoryType = {
  [key in `extra_guest_categories_lv${number}`]: string[];
};

export type AlgoliaProductAllCategoryType = {
  [key in `extra_all_categories_lv${number}`]: string[];
};

export type AlgoliaProductAtmosphereType = {
  extra_atmospheres: string[];
};

export type AlgoliaProductMediumsType = {
  extra_mediums: string[];
};

export type AlgoliaProductBusinessesType = {
  [key in `extra_businesses_lv${number}`]: string[];
};

export type AlgoliaProductPersonasType = {
  [key in `extra_personas_lv${number}`]: string[];
};

export type AlgoliaProductOccasionsType = {
  [key in `extra_occasions_lv${number}`]: string[];
};

export type AlgoliaProductColorsMainType = {
  [key in `extra_colors_main_lv${number}`]: string;
};

export type AlgoliaProductColorsSecondaryType = {
  [key in `extra_colors_secondary_lv${number}`]: string[];
}

export type AlgoliaProductNameSubType = {
  title: string;
  description?: string;
};

export type AlgoliaProductUrlSubType = {
  url: string;
};

export type AlgoliaProductNameType = AlgoliaProductNameSubType | AlgoliaProductUrlSubType;

export type AlgoliaProductArtistType = {
  artist_name: string;
};

export type AlgoliaProductBaseSubType = {
  sku: string;
}

export type AlgoliaProductGeneralSubType = {
  sku: string;
  shopify_id: number;
  created_at: number | null;
  last_updated_at: number | null;
  published_at: number | null;
  product_type: string;
}

export type AlgoliaProductLabelsSubType = {
  labels: ProductLabel[];
  design_project?: string;
}

export type AlgoliaProductTagsSubType = {
  tags: string[];
  tags_auto: string[];
}

export type AlgoliaProductMainImageType = {
  square_image: string;
  main_image: string;
}

export type AlgoliaProductGeneralType = AlgoliaProductGeneralSubType
  | AlgoliaProductGeneralSubType
  | AlgoliaProductLabelsSubType
  | AlgoliaProductTagsSubType
  | AlgoliaProductMainImageType;

export type AlgoliaProductCategoriesType = AlgoliaProductStylesType
  | AlgoliaProductMainCategoryType
  | AlgoliaProductGuestCategoryType
  | AlgoliaProductAtmosphereType
  | AlgoliaProductMediumsType
  | AlgoliaProductBusinessesType
  | AlgoliaProductColorsMainType
  | AlgoliaProductColorsSecondaryType
  | AlgoliaProductArtistType;

export type AlgoliaLayoutRoomPreview = {
  url: string;
  room_id?: string;
  room_type?: string;
  colors: string[];
  styles: string[];
  unique: string[];
};

export type AlgoliaProductLayoutType = 'Canvas' | 'Foam Tile' | 'Framed Canvas' | 'Framed Print' | 'Multiple' | 'Poster Print';

export type AlgoliaProductLayout = {
  name: string;
  type: AlgoliaProductLayoutType;
  pieces: ProductLayoutPieces;
  shape: ProductLayoutShape;
  url: string;
  preview_3d?: string;
  preview_main?: string;
  sizes: {
    size: ProductLayoutSize;
  }[];
  room_previews: AlgoliaLayoutRoomPreview[];
};

export type AlgoliaProductLayoutsType = {
  layouts: AlgoliaProductLayout[];
}

export type AlgoliaUpdateProductType = AlgoliaProductNameType
  | AlgoliaProductCategoriesType
  | AlgoliaProductLayoutsType
  | AlgoliaProductGeneralType;

export type AlgoliaUpdateProduct = {
  objectID: string;
} & AlgoliaUpdateProductType;
