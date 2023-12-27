import { AlgoliaArtistType } from '../service/algolia/AlgoliaArtistService';

export type Artist = {
  _id: string;
  name: string;
  case_sensitive_name: string;
  last_update_hash: string,
  shopify_collection_description: string,
  shopify_collection_id: string,
}

export type ArtistExternalData = {
  _id: string,
  algoliaData: AlgoliaArtistType,
  shopifyData: Partial<Artist>,
}