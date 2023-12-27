import { AlgoliaServiceAbstract, INDEX_ENV } from 'common-services/service/algolia/AlgoliaServiceAbstract';
import { ChunkedBatchResponse } from '@algolia/client-search';

export type AlgoliaArtistType = {
  objectID: string;
  name: string;
  publishedAt: number | undefined;
  numberOfProducts: number;
  styles: string[];
  sales: number;
  image?: string;
}

export class AlgoliaArtistService extends AlgoliaServiceAbstract {
  public static async replaceAllArtists(artists: AlgoliaArtistType[]): Promise<ChunkedBatchResponse> {
    return this.replaceAll(artists, INDEX_ENV.ARTIST);
  }
}
