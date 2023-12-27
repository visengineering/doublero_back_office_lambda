import { ShoppingFeedService } from '../../service/feed/ShoppingFeedService';

export const handler = async (): Promise<void> => {
  await new ShoppingFeedService().generateFeed();
};
