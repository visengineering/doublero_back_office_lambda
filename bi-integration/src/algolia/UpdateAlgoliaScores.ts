import { ErrorUtil } from 'common-util/ErrorUtil';
import { SkuPerformanceDBService } from '../postgresql/SkuPerformanceDBService';
import { PowerBiToAlgoliaService } from '../services/PowerBiToAlgoliaService';

export const handler = async (): Promise<void> => {
  let totalExtracted = 0;
  let pageToExtract = 1;

  const totalToExtract = await SkuPerformanceDBService.getTotalSkuPerformanceRecords();

  while (totalExtracted < totalToExtract) {
    const extracted = await SkuPerformanceDBService.getPaginatedSkuPerformance(pageToExtract);

    if (!extracted?.length) throw ErrorUtil.general(`Received empty page, possible infinite loop.`);

    totalExtracted += extracted.length;
    pageToExtract++;

    const transformed = await PowerBiToAlgoliaService.transformToAlgoliaUpdates(extracted);
    await PowerBiToAlgoliaService.updateAlgoliaProducts(transformed);
  }
};
