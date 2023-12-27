import { HierarchicalEntity, MetadataEntity } from 'common-db/model/Product';

export type Style = HierarchicalEntity;
export type Atmosphere = MetadataEntity;
export type Business = HierarchicalEntity;
export type Color = HierarchicalEntity;
export type Medium = MetadataEntity;

export interface ProductChangeLog {
  date: Date;
  sku: string;
  action: string;
  details?: string;
  user_name: string;
  execution_id?: string;
}

export enum ProductChangeActions {
  product_updater_update_started = 'product_updater -> update_started',
  product_updater_shopify_updated = 'product_updater -> shopify_updated',
  product_updater_algolia_updated = 'product_updater -> algolia_updated',
  product_updater_update_finished = 'product_updater -> update_finished',
}

export enum ProductDeleteActions {
  product_updater_delete_started = 'product_updater -> delete_started',
  product_updater_shopify_deleted = 'product_updater -> shopify_deleted',
  product_updater_algolia_deleted = 'product_updater -> algolia_deleted',
  product_updater_delete_finished = 'product_updater -> delete_finished',
}

export enum ProductLabel {
  personalized = 'personalized',
  exclusive = 'exclusive',
  licensed = 'officially licensed',
  hot_deal = 'hot deal',
  push_pin = 'push pin'
}
