import { ImageUpload, ImageUploadDestination, ImageUploadType } from '../../model/ProductUpdate';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { ProductImagesService } from '../../service/product/builder/images/ProductImagesService';

interface Event {
  images: ImageUpload[];
}

function verifyImageUploads(images: ImageUpload[]): void {
  images.forEach(image => {
    if (!image.source_url) throw ErrorUtil.badRequest(`Source URL is required in order to proceed (${JSON.stringify(image)})`);

    switch (image.type) {
      case ImageUploadType.preview_3d:
        if (image.destination === ImageUploadDestination.s3 && (!image.destination_bucket || !image.destination_key)) {
          throw ErrorUtil.badRequest(`Destination bucket and key are required for upload`, undefined, JSON.stringify(image));
        }
        if (image.destination === ImageUploadDestination.s3 && !image.destination_url) {
          throw ErrorUtil.badRequest(`Destination URL is required for upload`, undefined, JSON.stringify(image));
        }
        break;
      case ImageUploadType.square_image:
        if (!image.destination_url) {
          throw ErrorUtil.badRequest(`Destination URL is required for upload`, undefined, JSON.stringify(image));
        }
        break;
      default:
        throw ErrorUtil.badRequest(`Upload type ${image.type} is not supported`);
    }
  });
}

export const handler = async (event: Event): Promise<void> => {
  if (!event.images?.length) {
    console.log('Skipped product images uploading as no images provided');
    return;
  }

  console.log(`Got product images upload request: ${JSON.stringify(event)}`);

  verifyImageUploads(event.images);

  const promises: Promise<string>[] = [];

  for (const image of event.images) {
    switch (image.type) {
      case ImageUploadType.preview_3d:
        if (image.destination === ImageUploadDestination.s3) promises.push(ProductImagesService.uploadToS3(image));
        if (image.destination === ImageUploadDestination.shopify) promises.push(ProductImagesService.uploadToDestination(image));
        break;
      case ImageUploadType.square_image:
        promises.push(ProductImagesService.uploadToDestination(image));
        break;
      default:
        throw ErrorUtil.badRequest(`Upload type ${image.type} is not supported`);
    }
  }

  try {
    await Promise.all(promises);
  } catch (err) {
    const error = err as Error;
    throw ErrorUtil.communication(`Images upload failed: ${error?.message || err}`, error, JSON.stringify(event));
  }
};
