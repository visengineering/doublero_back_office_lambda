import { PgQueryResultRow } from '../PgClientService';

export type SkuPerformanceScoresType = {
    [key in `score_${number | string | '30_days' | 'all_time'}`]?: number;
}

export type SkuPerformanceBaseType = {
    sku: string;
    last_updated_at?: string;
    reviews_count?: number;
    reviews_avg_rating?: number;
    wish_count?: number;
};

export type SkuPerformanceType = SkuPerformanceBaseType & SkuPerformanceScoresType;
export type SkuPerformancePgRowType = SkuPerformanceType & PgQueryResultRow;