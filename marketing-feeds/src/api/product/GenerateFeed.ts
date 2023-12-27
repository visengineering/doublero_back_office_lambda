import { ProductFeedService } from '../../service/feed/ProductFeedService';

export const handler = async (): Promise<void> => {
  await new ProductFeedService().generateFeed();
};
