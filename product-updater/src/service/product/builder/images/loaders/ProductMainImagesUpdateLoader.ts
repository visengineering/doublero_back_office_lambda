import { DBCollection } from 'common-db/DBCollection';
import { DBService } from 'common-db/service/DBService';
import {
  ImageUploadType,
  ProductImagesUpdate,
  ProductUpdateGeneralSubType,
  ProductUpdateSquareImageData,
  ProductUpdateType,
  UpdateAction,
} from '../../../../../model/ProductUpdate';
import { DataUtil } from 'common-util/DataUtil';
import { Product } from 'common-db/model/Product';
import { ProductPrint } from '../../../../../model/ProductPrint';
import { ShopifyImageService, ShopifyResourceType } from '../../../../shopify/ShopifyImageService';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { ContentType } from 'common-util/AssetUtil';

export class ProductMainImagesUpdateLoader {

  private static readonly MAIN_IMAGE_CONTENT_TYPE = ContentType.jpeg;

  public static async loadMainImageUpdate(product: Product, context?: {[key: string]: boolean}): Promise<ProductImagesUpdate> {
    const result: ProductImagesUpdate = {
      updates: [],
      images: [],
    };

    const skipShopifyUpdate = context?.skipShopifyUpdate || false;

    let squareImageUrl = product.main_product_image || '';
    if (!squareImageUrl && !skipShopifyUpdate) {
      squareImageUrl = await this.prepareSquareImageUrl(product.sku);
    }

    const uploadHash = squareImageUrl ? DataUtil.getHash(squareImageUrl) : '';

    const data: ProductUpdateSquareImageData = {
      square_image_src: squareImageUrl,
      square_image_src_upload_hash: uploadHash,
      square_image_cdn: product.shopify_main_product_image,
    };

    let imageShouldBeUpdated = !!data.square_image_cdn;

    if (squareImageUrl && !skipShopifyUpdate &&
      (!product.main_product_image || product.main_product_image_upload_hash != uploadHash || !product.shopify_main_product_image)) {
      const fileName = 'main_' + DataUtil.getUrlHandle(product.title);

      const [imageDestinationUrl] = await ShopifyImageService.registerImagesUpload([{
        fileName,
        contentType: this.MAIN_IMAGE_CONTENT_TYPE,
        resourceType: ShopifyResourceType.PRODUCT_IMAGE,
      }]);

      result.images.push({
        type: ImageUploadType.square_image,
        source_url: squareImageUrl,
        content_type: this.MAIN_IMAGE_CONTENT_TYPE,
        destination_url: imageDestinationUrl,
      });

      data.square_image_cdn = undefined;
      data.square_image_src_upload_url = imageDestinationUrl;

      imageShouldBeUpdated = true;
    }

    if (imageShouldBeUpdated) {
      result.updates.push({
        type: ProductUpdateType.general,
        sub_type: ProductUpdateGeneralSubType.square_image,
        action: UpdateAction.update,
        data: data,
      });
    }

    return result;
  }

  private static async prepareSquareImageUrl(sku: string): Promise<string> {
    const productPrintCollection = await DBService.getCollection(DBCollection.PRODUCT_PRINTS);
    const productPrints = await productPrintCollection.find({ sku })
      .project<ProductPrint>({
        prints: {
          layout_name: 1,
          raw_image_data: {
            height: 1,
            width: 1,
            x: 1,
            y: 1,
          }
        }
      })
      .toArray();
    if (!productPrints.length) throw ErrorUtil.notFound(`No prints found for product with sku ${sku}`);

    const productPrint = productPrints
      .find(print => print)?.prints
      ?.find(print => print.layout_name.indexOf(' 1 ') >= 0 || print.layout_name.indexOf(' Core ') >= 0);

    if (productPrint) {
      const s_width =
        productPrint.raw_image_data.width > productPrint.raw_image_data.height
          ? productPrint.raw_image_data.height
          : productPrint.raw_image_data.width;
      return `https://res.cloudinary.com/doublero/image/upload/c_crop,h_${productPrint.raw_image_data.height},w_${productPrint.raw_image_data.width},x_${productPrint.raw_image_data.x},y_${productPrint.raw_image_data.y}/w_${s_width},h_${s_width},q_60,c_crop,g_center/w_1200/v1/products/${sku}.jpg`;
    } else {
      console.log(`No suitable layouts found to prepare square image URL for the product ${sku}`);

      return '';
    }
  }
}
