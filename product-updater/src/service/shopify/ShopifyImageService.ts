import { ErrorUtil } from 'common-util/ErrorUtil';

import { ShopifyService } from './ShopifyService';
import { ContentType } from 'common-util/AssetUtil';

export enum ShopifyResourceType {
  PRODUCT_IMAGE = 'PRODUCT_IMAGE',
}

export type ImageUploadUrl = string;
export type ProductImageUrl = string;
export type ProductImageData = {
  url: string;
  id?: string;
}

export interface ImageUploadRequest {
  fileName: string;
  contentType: ContentType;
  resourceType: ShopifyResourceType;
}

interface RegisterUploadResult {
  stagedUploadTargetsGenerate?: {
    urls: { url: string }[]
  };
}

interface ProductAppendImagesResult {
  productAppendImages?: {
    newImages?: {
      url: string;
      id: string;
    }[],
    userErrors?: Error[]
  };
}

interface ProductImageUpdateResult {
  productImageUpdate: {
    image: {
      id: string;
      url: string;
    },
    userErrors: Error[]
  };
}

export class ShopifyImageService extends ShopifyService {

  public static async registerImagesUpload(requests: ImageUploadRequest[]): Promise<ImageUploadUrl[]> {
    const client = await this.getClient();

    let result: RegisterUploadResult;

    try {
      const query = `mutation stagedUploadTargetsGenerate($input: [StageImageInput!]!) {
      stagedUploadTargetsGenerate(input: $input) {
        urls {
          url
        }
        userErrors {
          field
          message
        }
      }
    }`;

      const input = {
        input: requests.map(request => ({
          filename: request.fileName,
          mimeType: request.contentType,
          resource: request.resourceType
        }))
      };
      result = <RegisterUploadResult>await client.graphql(query, input);
    } catch (e) {
      const error = e as Error;
      throw ErrorUtil.communication(`Error while registering image upload: ${error.message}`, error);
    }

    if (!result.stagedUploadTargetsGenerate?.urls.length || result.stagedUploadTargetsGenerate.urls.length != requests.length) {
      throw ErrorUtil.communication(`Image upload registration was not successful, registered count ${result.stagedUploadTargetsGenerate?.urls.length}`);
    }

    console.log(`Registered Shopify image uploads for ${requests.length} images`);

    return result.stagedUploadTargetsGenerate.urls.map(data => data.url);
  }

  public static async productImageUpdate(productId: number, url: string, imageId?: string): Promise<ProductImageData> {

    if(!imageId) {
      return this.productAppendImage(productId, url);
    }

    const client = await this.getClient();

    let result: ProductImageUpdateResult;

    try {
      const query = `mutation productImageUpdate($image: ImageInput!, $productId: ID!) {
        productImageUpdate(image: $image, productId: $productId) {
          image {
            url
            id
          }
          userErrors {
            field
            message
          }
        }
      }`;

      const input = {
        productId: this.getProductGId(productId),
        image: {
          altText: 'no image',
          src: url,
          id: imageId
        }
      };

      result = <ProductImageUpdateResult>await client.graphql(query, input);
    } catch (e) {
      throw ErrorUtil.communication(`Error while updating product image: ${(<Error>e).message}`, <Error>e);
    }

    this.handleUserErrors(result.productImageUpdate?.userErrors);

    console.log(`Updated product (${productId}) image result for ${url}: ${JSON.stringify(result)}`);

    const image = result.productImageUpdate?.image;
    
    return {
      id: image?.id,
      url: image?.url || ''
    };
  }

  public static async productAppendImage(productId: number, url: string): Promise<ProductImageData> {
    const client = await this.getClient();

    let result: ProductAppendImagesResult;

    try {
      const query = `mutation productAppendImages($input: ProductAppendImagesInput!) {
        productAppendImages(input: $input) {
          newImages {
            url
            id
          }
          userErrors {
            field
            message
          }
        }
      }`;

      const input = {
        input: {
          id: this.getProductGId(productId),
          images: [
            {
              altText: 'no image',
              src: url
            }
          ]
        }
      };

      result = <ProductAppendImagesResult>await client.graphql(query, input);
    } catch (e) {
      throw ErrorUtil.communication(`Error while appending product image: ${(<Error>e).message}`, <Error>e);
    }

    this.handleUserErrors(result.productAppendImages?.userErrors);

    console.log(`Appended product (${productId}) image result for ${url}: ${JSON.stringify(result)}`);

    const image = result.productAppendImages?.newImages?.find(image => image);

    return {
      id: image?.id,
      url: image?.url || ''
    };
  }

}
