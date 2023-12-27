import {
  ImageUpload,
  ImageUploadDestination,
  ImageUploadType,
  ProductImagesUpdate,
  ProductUpdatePreviewsSubType,
  ProductUpdateType,
  UpdateAction,
} from '../../../../../model/ProductUpdate';
import { DataUtil } from 'common-util/DataUtil';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { ProductLayoutsDBService } from 'common-db/service/ProductLayoutsDBService';
import { ProductDBService } from 'common-db/service/ProductDBService';
import { ProductPreviewsDBService } from 'common-db/service/ProductPreviewsDBService';
import { Product, ProductLayout } from 'common-db/model/Product';
import path from 'path';
import { RequestUtil } from 'common-util/RequestUtil';
import { AssetUtil, ContentType } from 'common-util/AssetUtil';
import { ShopifyImageService, ShopifyResourceType } from '../../../../shopify/ShopifyImageService';

export class ProductPreviews3dUpdateLoader {

  public static async load3dPreviews(product: Product, productLayouts: ProductLayout[]): Promise<ProductImagesUpdate> {
    const result: ProductImagesUpdate = {
      updates: [],
      images: [],
    };

    const layouts: string[] = product.layouts || [];

    const productPreviews = await ProductPreviewsDBService.getProductPreview(product.sku);
    const previews = productPreviews?.layouts;
    if (!previews?.length) throw ErrorUtil.notFound(`Product previews not found on updating previews task on ${product.sku}`);

    const uploadId = DataUtil.generateId();

    for (const layout of layouts) {
      const preview = previews.find(p => p.layout_name == layout);
      const layoutData = productLayouts.find(item => item.layout == layout);

      if (!preview || !layoutData || !preview.preview_3d) continue;

      if (!preview.preview_3d.src) {
        result.updates.push({
          type: ProductUpdateType.previews,
          sub_type: ProductUpdatePreviewsSubType.previews_3d,
          action: UpdateAction.delete,
          data: {
            layout: layout,
            short_layout: layoutData.short_layout,
            preview_3d: '',
            cdn_upload_hash: '',
          },
        });

        continue;
      }

      const uploadHash = DataUtil.getHash(preview.preview_3d.src);

      if (preview.preview_3d.shopify_cdn_url && preview.preview_3d?.cdn_upload_hash == uploadHash) {
        result.updates.push({
          type: ProductUpdateType.previews,
          sub_type: ProductUpdatePreviewsSubType.previews_3d,
          action: UpdateAction.update,
          data: {
            layout: layout,
            short_layout: layoutData.short_layout,
            preview_3d: preview.preview_3d.shopify_cdn_url,
            cdn_upload_hash: uploadHash,
            shopify_cdn_id: preview.preview_3d.shopify_cdn_id
          },
        });

        continue;
      }

      let s3_cdn_url = preview.preview_3d.cdn_url;

      if (preview.preview_3d?.cdn_upload_hash != uploadHash) {
        const image3dToS3Upload = this.prepare3dPreviewUploadToS3(product.sku, product.title, layout,
          preview.preview_3d.src, uploadId, layoutData.short_layout);
        s3_cdn_url = image3dToS3Upload.destination_url;
        result.images.push(image3dToS3Upload);
      }

      const image3dToShopifyUpload = await this.prepare3dPreviewUploadToShopify(product.sku, product.title,
        layout, preview.preview_3d.src, layoutData.short_layout);

      result.updates.push({
        type: ProductUpdateType.previews,
        sub_type: ProductUpdatePreviewsSubType.previews_3d,
        action: UpdateAction.update,
        data: {
          layout: layout,
          short_layout: layoutData.short_layout,
          shopify_cdn_upload_url: image3dToShopifyUpload.destination_url,
          shopify_cdn_id: preview.preview_3d.shopify_cdn_id,
          s3_cdn_url: s3_cdn_url,
          cdn_upload_hash: uploadHash,
        },
      });
      result.images.push(image3dToShopifyUpload);
    }

    return result;
  }

  private static prepare3dPreviewUploadToS3(sku: string, title: string, layout: string,
    sourceUrl: string, uploadId: string, layoutShortName?: string): ImageUpload {
    const extname = path.extname(sourceUrl);
    const extension = extname.includes('.') ? extname.substring(extname.indexOf('.') + 1) : extname;
    const previewName = DataUtil.getUrlHandle(this.preview3dName(title, layout, layoutShortName)) + extname;

    const bucket = RequestUtil.getEnvParam('CDN_BUCKET');
    const cdnUrl = RequestUtil.getEnvParam('CDN_URL');

    const key = `products/${sku.toLowerCase()}/previews/3d/${uploadId}/${previewName}`;

    return {
      type: ImageUploadType.preview_3d,
      destination: ImageUploadDestination.s3,
      source_url: sourceUrl,
      content_type: extension ? AssetUtil.getContentType(extension) : undefined,
      destination_bucket: bucket,
      destination_key: key,
      destination_url: `https://${cdnUrl}/${key}`
    };
  }

  private static async prepare3dPreviewUploadToShopify(sku: string, title: string, layout: string,
    sourceUrl: string, layoutShortName?: string): Promise<ImageUpload> {
    const extname = path.extname(sourceUrl);
    const extension = extname.includes('.') ? extname.substring(extname.indexOf('.') + 1) : extname;
    const previewName = DataUtil.getUrlHandle(this.preview3dName(title, layout, layoutShortName)) + extname;
    const layoutName = DataUtil.getUrlHandle(layout);

    const fileName = `${sku.toLowerCase()}_${layoutName}_${previewName}`;

    const [imageDestinationUrl] = await ShopifyImageService.registerImagesUpload([{
      fileName,
      contentType: extension ? AssetUtil.getContentType(extension) : ContentType.webp,
      resourceType: ShopifyResourceType.PRODUCT_IMAGE,
    }]);

    return {
      type: ImageUploadType.preview_3d,
      destination: ImageUploadDestination.shopify,
      source_url: sourceUrl,
      content_type: extension ? AssetUtil.getContentType(extension) : undefined,
      destination_url: imageDestinationUrl
    };
  }

  private static preview3dName(title: string, layout: string, layoutShortName?: string): string {
    return this.adjustTitleWithLayoutSuffix(ProductDBService.cleanProductTitle(title), layout, layoutShortName);
  }

  private static adjustTitleWithLayoutSuffix(title: string, layout: string, layoutShortName?: string): string {
    const suffixMap = new Map([
      ['Framed Canvas', 'framed wall art'],
      ['Framed Print', 'framed wall art print'],
      ['Poster Print', 'framed wall art print'],
      ['Framed Poster Print', 'framed poster']
    ]);

    let suffix = '';
    if (layoutShortName) {
      if (suffixMap.has(layoutShortName)) {
        suffix = <string>suffixMap.get(layoutShortName);
      } else {
        const pieces = ProductLayoutsDBService.getPiecesCount(layout);

        if (pieces == 1) {
          suffix = 'wall art';
        } else {
          suffix = `${pieces} piece wall art`;
        }
      }
    }

    if (!suffix) {
      suffix = layout.replace('Layout', '');
    }

    return `${title} ${suffix}`;
  }
}
