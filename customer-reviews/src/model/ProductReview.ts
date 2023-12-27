export interface ProductReviewImage {
  date_created: string;
  id: number;
  image: string;
  product_review_id: number;
  status: string;
}

export interface ProductReviewId {
  _id: { SKU: string };
}

export interface Product {
  url: string;
  sku: string;
  created_at: Date;
  title: string;
}

export interface ProductReviewBase extends ProductReviewId{
  Images: ProductReviewImage[];
  Comments: string;
  Date: Date;
  Author: string;
  Rating: number;
  ProductName: string;
  SKU: string;
  OrderID: string;
  HumanDate: string;
  SourceProvider: string;
  ProductReviewId?: string;
  Product: Product | string;
}

export interface TimeStatsBase extends ProductReviewId{
  RatingAverage: number;
  ReviewsCount: number;
}

export interface ReviewStats {
  RatingAverage?: number;
  ReviewsCount?: number;
}

export interface ProductReviewWithStats extends ProductReviewBase {
  avgAllTime?: ReviewStats,
  avgLast7Days?: ReviewStats
}

export enum ProductReviewSource {
  REVIEWS_IO = 'reviews_io'
}

export enum ProductReviewProductType {
  ARTIST = 'artist',
  STOCK_PHOTO = 'stock_photo'
}

export enum ProductReviewFilters {
  REVIEWS_AGE = 'review_age',
  RATING = 'rating',
  NUMBER_OF_REVIEWS = 'reviews_count',
  PRODUCT_AGE = 'product_age'
}
