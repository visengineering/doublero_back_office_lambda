import { DBCollection } from 'common-db/DBCollection';
import { DBService } from 'common-db/service/DBService';
import {
  ImageUpload,
  ProductUpdate3dPreviewData,
  ProductUpdateGeneralSubType,
  ProductUpdatePreviewsSubType,
  ProductUpdateSquareImageData,
  ProductUpdateType,
  Update,
} from '../../../../model/ProductUpdate';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { ProductDBService } from 'common-db/service/ProductDBService';
import { ProductPreviewsDBService } from 'common-db/service/ProductPreviewsDBService';
import { ProductPreviewLayout } from 'common-db/model/Product';
import http from 'http';
import https from 'https';
import { S3Client } from 'common-util/aws/S3Client';

export class ProductImagesService {

  private static getTransport(url: string) {
    return url.startsWith('https:') ? https : http;
  }

  public static async uploadToS3(upload: ImageUpload): Promise<string> {
    return new Promise((resolve, reject) => {

      const transport = this.getTransport(upload.source_url);

      transport.get(upload.source_url, stream => {
        const contentLength = parseInt(<string>stream.headers['content-length'] || '0');
        if (contentLength == 0) {
          return reject('Source image download failed, content length is zero');
        }

        const bucket = <string>upload.destination_bucket;
        const key = <string>upload.destination_key;
        const contentType = upload.content_type || <string>stream.headers['content-type'];
        const tags = new Map<string, string>([['source', 'product-updater'], ['type', 'source']]);
        S3Client
          .uploadS3FileAsStream(bucket, key, contentType, tags)
          .then(s3Upload => {
            stream.pipe(s3Upload.stream);
            s3Upload.promise.then(() => {
              console.log(`Image was successfully uploaded to S3 (bucket=${upload.destination_bucket}, key=${upload.destination_key}`);

              resolve(upload.destination_url);
            }, reject);
          }, reject);
      });
    });
  }

  public static async uploadToDestination(upload: ImageUpload): Promise<string> {
    return new Promise((resolve, reject) => {
      const sourceTransport = this.getTransport(upload.source_url);
      const destinationTransport = this.getTransport(upload.destination_url);

      sourceTransport.get(upload.source_url, stream => {
        const contentLength = parseInt(<string>stream.headers['content-length'] || '0');
        if (contentLength == 0) {
          return reject('Source image download failed, content length is zero');
        }

        stream.pipe(destinationTransport.request(upload.destination_url, {
          method: 'PUT',
          headers: {
            'content-type': upload.content_type || stream.headers['content-type'],
            'content-length': stream.headers['content-length'],
          },
        }, response => {
          const responseCode = (response?.statusCode || 500);
          if (responseCode >= 200 && responseCode <= 299) {
            return resolve(<string>upload.destination_url);
          } else {
            response.on('data', data => console.error(Buffer.from(data).toString()));
          }

          return reject(`Image upload failed with code: ${response.statusCode}`);
        }));
      });
    });
  }

  public static async saveProductImagesUpdate(sku: string, updates: Update[], batchId?: string): Promise<void> {

    const updates3d = updates
      .filter(update => update.type == ProductUpdateType.previews && update.sub_type == ProductUpdatePreviewsSubType.previews_3d)
      .map(update => <ProductUpdate3dPreviewData>update.data);

    if (updates3d.length) {
      const productPreviews = await ProductPreviewsDBService.getProductPreview(sku, true);
      const previews = productPreviews?.layouts;
      if (!previews?.length) throw ErrorUtil.notFound(`Product previews not found on updating previews task on ${sku}`);

      let updateNeeded = false;

      previews.forEach(preview => {
        const preview3d = updates3d.find(update => update.layout == preview.layout_name);
        if (preview3d && preview.preview_3d && (preview.preview_3d.cdn_upload_hash != preview3d.cdn_upload_hash
          || preview.preview_3d.shopify_cdn_url != preview3d.preview_3d || preview.preview_3d.shopify_cdn_id != preview3d.shopify_cdn_id)) {
          preview.preview_3d.cdn_url = preview3d.s3_cdn_url || '';

          preview.preview_3d.cdn_upload_hash = preview3d.cdn_upload_hash;
          
          preview.preview_3d.shopify_cdn_url = preview3d.preview_3d;
          preview.preview_3d.shopify_cdn_id = preview3d.shopify_cdn_id;
          preview.last_updated = new Date();
          updateNeeded = true;
        }
      });

      if (updateNeeded) {
        await this.saveProduct3dPreviews(sku, previews);
      }
    }

    const imageUpdate = updates
      .find(update => update.type == ProductUpdateType.general && update.sub_type == ProductUpdateGeneralSubType.square_image);

    if (imageUpdate) {
      const product = await ProductDBService.getProduct(sku, {
        main_product_image: 1,
        main_product_image_upload_hash: 1,
        shopify_main_product_image: 1,
      });

      const data = <ProductUpdateSquareImageData>imageUpdate.data;
      if (data.square_image_src_upload_hash != product.main_product_image_upload_hash || !product.shopify_main_product_image) {
        await this.saveProductSquareImage(sku, data);
      }
    }

    if (batchId) {
      await this.saveProcessSkus(batchId, sku);
    }
  }

  private static async saveProduct3dPreviews(sku: string, previews: ProductPreviewLayout[]): Promise<void> {
    try {
      const productPreviewsCollection = await DBService.getCollection(DBCollection.PRODUCT_PREVIEWS);
      await productPreviewsCollection.updateOne({ sku }, {
        $set: {
          layouts: previews
        }
      });

      console.log(`Updated 3d previews for ${sku}`);
    } catch (err) {
      const error = err as Error;
      throw ErrorUtil.communication(`Product previews update failed: ${error.message}`, error);
    }
  }

  private static async saveProductSquareImage(sku: string, data: ProductUpdateSquareImageData) {
    try {
      const productsCollection = await DBService.getCollection(DBCollection.PRODUCTS);
      await productsCollection.updateOne(
        {
          sku
        },
        {
          $set: {
            main_product_image: data.square_image_src,
            main_product_image_upload_hash: data.square_image_src_upload_hash,
            shopify_main_product_image: data.square_image_cdn
          }
        });

      console.log(`Updated square image for ${sku}: image=${data.square_image_cdn}, upload_hash=${data.square_image_src_upload_hash}`);
    } catch (err) {
      const error = err as Error;
      throw ErrorUtil.communication(`Product square image update failed: ${error.message}`, error);
    }
  }

  private static async saveProcessSkus(batchId: string, sku: string) {
    const automationReportLogs = await DBService.getCollection(DBCollection.AUTOMATION_REPORT_LOGS);
    await automationReportLogs.updateOne(
      {
        _id: DBService.newId(batchId)
      },
      {
        $addToSet: {
          processed: sku
        }
      }
    );
  }

}
