import { AlgoliaProductPerformanceType, AlgoliaProductPerformancePropsType, AlgoliaProductScoresType } from '../models/Algolia';
import { SkuPerformancePgRowType } from '../postgresql/models/SkuPerformance';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { AlgoliaProductService } from './AlgoliaProductsService';

const isNil = (value: unknown) => value === null || value === undefined;

export class PowerBiToAlgoliaService {
  private static readonly algoliaRootKeys = ['reviews_count', 'reviews_avg_rating', 'wish_count'];

  static async transformToAlgoliaUpdates(models: SkuPerformancePgRowType[]): Promise<AlgoliaProductPerformanceType[]> {
    return models.map(model => {
      const updateObj = <AlgoliaProductPerformanceType>{ objectID: model.sku, score: {} };
      const keysWithValues = Object.keys(model).filter(key => !isNil(model[key]));

      for (const key of keysWithValues) {
        if (this.algoliaRootKeys.includes(key)) {
          updateObj[key as keyof AlgoliaProductPerformancePropsType] = model[key];
        }

        if (key.startsWith('score_')) {
          const mappedKey = key.replace('score_', '');
          if (mappedKey?.length) {
            updateObj.score[mappedKey as keyof AlgoliaProductScoresType] = model[key];
          }
        }
      }

      return updateObj;
    });
  }

  static async updateAlgoliaProducts(deltaObjects: AlgoliaProductPerformanceType[]): Promise<void> {
    const validDeltaObjects = deltaObjects.filter(delta => delta.objectID?.length > 0);
    if (!validDeltaObjects?.length) return;

    try {
      await AlgoliaProductService.updateProductsPartial(validDeltaObjects);
    } catch (e) {
      const error = e as Error;
      throw ErrorUtil.communication(`Error while sending batch of patch requests to Algolia: ${error.message}`, error);
    }
  }
}
