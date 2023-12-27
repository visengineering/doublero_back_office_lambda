import { DBService } from './DBService';
import { DBCollection } from '../DBCollection';
import { SystemConfigEntity } from '../model/SystemConfig';

export class SystemConfigDBService {
  private static ARTIST_PRODUCT_QUANTITY_FILTER_KEY = 'min_live_products_count';

  public static async getArtistConfiguration(): Promise<SystemConfigEntity | null> {
    
    const configCollection = await DBService.getCollection(DBCollection.SYSTEM_CONFIGS);

    return await configCollection.findOne<SystemConfigEntity>(
      { key: this.ARTIST_PRODUCT_QUANTITY_FILTER_KEY },
    );
  }

}
