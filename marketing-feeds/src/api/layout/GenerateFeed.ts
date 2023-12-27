import { ProductLayoutsFeedService } from '../../service/feed/ProductLayoutsFeedService';

export const handler = async (): Promise<void> => {
  await new ProductLayoutsFeedService().generateFeed();
};
