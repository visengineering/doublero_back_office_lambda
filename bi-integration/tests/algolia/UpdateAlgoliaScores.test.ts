import { AlgoliaProductService } from '../../src/services/AlgoliaProductsService';
import { SkuPerformanceDBService } from '../../src/postgresql/SkuPerformanceDBService';
import { handler as updateAlgoliaScoresHandler } from '../../src/algolia/UpdateAlgoliaScores';
import { SkuPerformanceType } from '../../src/postgresql/models/SkuPerformance';
import { ApiGeneralError } from 'common-util/error/ApiGeneralError';

jest.mock('../../src/services/AlgoliaProductsService');
jest.mock('../../src/postgresql/SkuPerformanceDBService');

describe('algolia/UpdateAlgoliaScores', () => {

  it(`handler (evaluate all pages)`, async () => {
    const totalRecords = 1500;
    const recordsPerPage = 500;
    const totalPages = totalRecords / recordsPerPage;

    const mockGetTotalSkuPerformanceRecords = jest.fn(() => Promise.resolve(totalRecords));
    const mockUpdateProductsPartial = jest.fn();
    const fakePaginatedResponse: SkuPerformanceType[] = [];
    for (let i = 0; i < recordsPerPage; i++) fakePaginatedResponse.push({ sku: `${i}` });

    const mockGetPaginatedSkuPerformance = jest.fn(() => Promise.resolve(fakePaginatedResponse));

    SkuPerformanceDBService.getTotalSkuPerformanceRecords = mockGetTotalSkuPerformanceRecords;
    SkuPerformanceDBService.getPaginatedSkuPerformance = mockGetPaginatedSkuPerformance;
    AlgoliaProductService.updateProductsPartial = mockUpdateProductsPartial;

    await updateAlgoliaScoresHandler();

    expect(mockGetPaginatedSkuPerformance).toBeCalledTimes(totalPages);
    expect(mockUpdateProductsPartial).toBeCalledTimes(totalPages);
  });

  it(`handler (do nothing when records count is 0)`, async () => {
    const mockGetTotalSkuPerformanceRecords = jest.fn(() => Promise.resolve(0));
    const mockUpdateProductsPartial = jest.fn();
    const mockGetPaginatedSkuPerformance = jest.fn();

    SkuPerformanceDBService.getTotalSkuPerformanceRecords = mockGetTotalSkuPerformanceRecords;
    SkuPerformanceDBService.getPaginatedSkuPerformance = mockGetPaginatedSkuPerformance;
    AlgoliaProductService.updateProductsPartial = mockUpdateProductsPartial;

    await updateAlgoliaScoresHandler();

    expect(mockGetPaginatedSkuPerformance).not.toBeCalled();
    expect(mockUpdateProductsPartial).not.toBeCalled();
  });

  it(`handler (prevents infinite loop when getting empty pages from db)`, async () => {
    const totalRecords = 1500;

    const mockGetTotalSkuPerformanceRecords = jest.fn(() => Promise.resolve(totalRecords));
    const emptyPageResponse: SkuPerformanceType[] = [];
    const mockGetPaginatedSkuPerformance = jest.fn(() => Promise.resolve(emptyPageResponse));

    SkuPerformanceDBService.getTotalSkuPerformanceRecords = mockGetTotalSkuPerformanceRecords;
    SkuPerformanceDBService.getPaginatedSkuPerformance = mockGetPaginatedSkuPerformance;

    const expression = async () => await updateAlgoliaScoresHandler();

    await expect(expression).rejects.toThrowError(ApiGeneralError);
    await expect(expression).rejects.toThrowError('Received empty page, possible infinite loop.');
  });

  it(`handler (fully process valid sku performance record)`, async () => {
    const fakePaginatedResponse: SkuPerformanceType[] = [<SkuPerformanceType><unknown>{
      sku: 'TEST_SKU',
      reviews_avg_rating: 10,
      reviews_count: 20,
      score_90_days: 90,
      score_all_time: 50
    }];

    const mockGetTotalSkuPerformanceRecords = jest.fn(() => Promise.resolve(fakePaginatedResponse.length));
    const mockUpdateProductsPartial = jest.fn();
    const mockGetPaginatedSkuPerformance = jest.fn(() => Promise.resolve(fakePaginatedResponse));

    SkuPerformanceDBService.getTotalSkuPerformanceRecords = mockGetTotalSkuPerformanceRecords;
    SkuPerformanceDBService.getPaginatedSkuPerformance = mockGetPaginatedSkuPerformance;
    AlgoliaProductService.updateProductsPartial = mockUpdateProductsPartial;

    await updateAlgoliaScoresHandler();

    expect(mockUpdateProductsPartial).toBeCalledWith([{
      objectID: 'TEST_SKU',
      reviews_count: 20,
      reviews_avg_rating: 10,
      score: {
        '90_days': 90,
        all_time: 50
      }
    }]);
  });
});
