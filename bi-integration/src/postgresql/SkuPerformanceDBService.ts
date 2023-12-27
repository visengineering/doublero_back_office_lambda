import { RequestUtil } from 'common-util/RequestUtil';
import { SkuPerformancePgRowType } from './models/SkuPerformance';
import { PgQueryResultRow } from './PgClientService';
import { PgDatabaseBaseService } from './PgDatabaseBaseService';

export enum PgDBObjectsEnv {
    SKU_PERFORMANCE_DB_VIEW = 'SKU_PERFORMANCE_DB_VIEW'
}

export class SkuPerformanceDBService extends PgDatabaseBaseService {
  public static async getPaginatedSkuPerformance(page: number, pageSize = 500): Promise<SkuPerformancePgRowType[]> {
        const skuPerformanceView = RequestUtil.getEnvParam(PgDBObjectsEnv.SKU_PERFORMANCE_DB_VIEW);
        const query = `SELECT *
                        FROM ${skuPerformanceView}
                        ORDER BY sku
                        ${this.getPaginationQueryPart(page, pageSize)}`;

        return await this.query<SkuPerformancePgRowType>(query);
    }

    public static async getTotalSkuPerformanceRecords(): Promise<number> {
        const skuPerformanceView = RequestUtil.getEnvParam(PgDBObjectsEnv.SKU_PERFORMANCE_DB_VIEW);
        const query = `SELECT COUNT(1) AS count
                        FROM ${skuPerformanceView}`;

        const [{ count }] = await this.query<PgQueryResultRow>(query);
        return Number(count);
    }
}
