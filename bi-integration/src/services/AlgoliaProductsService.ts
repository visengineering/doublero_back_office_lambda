import { AlgoliaServiceAbstract, INDEX_ENV } from 'common-services/service/algolia/AlgoliaServiceAbstract';
import { ChunkedBatchResponse } from '@algolia/client-search';
import { AlgoliaProductPerformanceType } from '../models/Algolia';

export class AlgoliaProductService extends AlgoliaServiceAbstract {
    public static async updateProductsPartial(objects: AlgoliaProductPerformanceType[]): Promise<ChunkedBatchResponse> {
        return this.batchUpdatePartial(objects, INDEX_ENV.PRODUCT_CATALOG);
    }
}