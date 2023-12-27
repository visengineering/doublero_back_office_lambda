export type AlgoliaProductScoresType = {
  [key in `30_days` | `all_time` | string]: number | string | null;
}

export type AlgoliaProductPerformancePropsType = {
  [key in `wish_count` | `reviews_count` | `reviews_avg_rating` | string]: number | string | null;
}

export type AlgoliaProductPerformanceKeyType = {
  objectID: string;
};

export type AlgoliaProductPerformanceType = {
  score: AlgoliaProductScoresType;
} & AlgoliaProductPerformancePropsType & AlgoliaProductPerformanceKeyType;
