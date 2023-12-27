import { AlgoliaServiceAbstract, INDEX_ENV } from 'common-services/service/algolia/AlgoliaServiceAbstract';
import { AlgoliaUpdateProduct } from '../../model/Algolia';
import { PartialUpdateObjectResponse, DeleteResponse } from '@algolia/client-search';

export class AlgoliaProductService extends AlgoliaServiceAbstract {
  public static async updateProductPartial(object: AlgoliaUpdateProduct): Promise<PartialUpdateObjectResponse|DeleteResponse> {
    return this.updatePartial(object, INDEX_ENV.PRODUCT_CATALOG);
  }

  public static async deleteProductFromAlgolia(objectID: string):  Promise<DeleteResponse>{
    return this.deleteProductFromIndex(objectID, INDEX_ENV.PRODUCT_CATALOG);
  } 
}
