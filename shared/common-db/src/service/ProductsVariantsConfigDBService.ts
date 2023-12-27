import { DBService } from './DBService';
import { DBCollection } from '../DBCollection';
import { ProductsVariantsConfig } from '../model/ProductsVariantsConfig';

export class ProductsVariantsConfigDBService {

    public static async getProductsVariantsConfig(): Promise<ProductsVariantsConfig[]> {
        const productsMastersCollection = await DBService.getCollection(DBCollection.PRODUCT_VARIANT_CONFIGS);
        return await (productsMastersCollection.find<ProductsVariantsConfig>({}).toArray());
    }
}
