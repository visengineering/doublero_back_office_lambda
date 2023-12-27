import { deepEqual } from 'assert';
import { AlgoliaProductPerformanceType, AlgoliaProductScoresType } from '../../src/models/Algolia';
import { SkuPerformancePgRowType } from '../../src/postgresql/models/SkuPerformance';
import { AlgoliaProductService } from '../../src/services/AlgoliaProductsService';
import { PowerBiToAlgoliaService } from '../../src/services/PowerBiToAlgoliaService';

jest.mock('../../src/services/AlgoliaProductsService');

describe('services/PowerBiToAlgoliaService', () => {

  it(`transformToAlgoliaUpdates (sets sku to objectID)`, async () => {
    const validPgRecord = <SkuPerformancePgRowType>{ sku: 'TEST_SKU' };
    const [{ objectID }] = await PowerBiToAlgoliaService.transformToAlgoliaUpdates([validPgRecord]);
    expect(objectID).toBe(validPgRecord.sku);
  });

  it(`transformToAlgoliaUpdates (sets generic score_* to score child object)`, async () => {
    const receivedAs = 'score_xy';
    const storedAs = 'xy';
    const validPgRecord = <SkuPerformancePgRowType>{ sku: 'TEST_SKU', [receivedAs]: 30 };
    const [{ score }] = await PowerBiToAlgoliaService.transformToAlgoliaUpdates([validPgRecord]);
    expect(score[receivedAs]).toBe(validPgRecord[storedAs]);
  });

  it(`transformToAlgoliaUpdates (score_30_days and score_all_time are translated in score object as 30_days and all_time)`, async () => {
    const validPgRecord = <SkuPerformancePgRowType>{ sku: 'TEST_SKU', score_30_days: 10, score_all_time: 10 };
    const [update] = await PowerBiToAlgoliaService.transformToAlgoliaUpdates([validPgRecord]);
    deepEqual(update, {
      objectID: 'TEST_SKU',
      score: {
        '30_days': 10,
        'all_time': 10
      }
    });
  });

  it(`transformToAlgoliaUpdates (null and undefined values are ignored)`, async () => {
    const validPgRecord = <SkuPerformancePgRowType><unknown>{ sku: 'TEST_SKU', score_30_days: null, score_all_time: undefined };
    const [update] = await PowerBiToAlgoliaService.transformToAlgoliaUpdates([validPgRecord]);
    deepEqual(update, {
      objectID: 'TEST_SKU',
      score: {}
    });
  });

  it(`transformToAlgoliaUpdates (values with 0 are not ignored)`, async () => {
    const validPgRecord = <SkuPerformancePgRowType><unknown>{ sku: 'TEST_SKU', score_30_days: 0 };
    const [update] = await PowerBiToAlgoliaService.transformToAlgoliaUpdates([validPgRecord]);
    deepEqual(update, {
      objectID: 'TEST_SKU',
      score: {
        '30_days': 0
      }
    });
  });

  it(`updateAlgoliaProducts (ignores updates without objectID)`, async () => {
    const mockUpdateProductsPartial = jest.fn();
    AlgoliaProductService.updateProductsPartial = mockUpdateProductsPartial;

    PowerBiToAlgoliaService.updateAlgoliaProducts([<AlgoliaProductPerformanceType>{
      score: {
        '30_days': 0
      } as AlgoliaProductScoresType
    }]);

    expect(mockUpdateProductsPartial).not.toHaveBeenCalled();
  });

  it(`updateAlgoliaProducts (processes valid updates)`, async () => {
    const mockUpdateProductsPartial = jest.fn();
    const validUpdate = <AlgoliaProductPerformanceType>{
      objectID: 'TEST_SKU',
      score: {
        '30_days': 0
      } as AlgoliaProductScoresType
    };

    AlgoliaProductService.updateProductsPartial = mockUpdateProductsPartial;
    PowerBiToAlgoliaService.updateAlgoliaProducts([validUpdate]);

    expect(mockUpdateProductsPartial).toBeCalledWith([validUpdate]);
  });
});
