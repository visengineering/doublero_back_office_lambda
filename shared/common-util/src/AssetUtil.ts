import { URL } from 'url';

export enum ContentType {
  jpeg = 'image/jpeg',
  png = 'image/png',
  gif = 'image/gif',
  webp = 'image/webp',

  otf = 'font/otf',
  ttf = 'font/ttf',

  json = 'application/json',

  binary = 'binary/octet-stream'
}

export interface S3Object {
  bucket: string;
  key: string;
}

export class AssetUtil {

  public static getContentType(extension = ''): ContentType {
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return ContentType.jpeg;
      case 'png':
        return ContentType.png;
      case 'gif':
        return ContentType.gif;
      case 'webp':
        return ContentType.webp;
      case 'json':
        return ContentType.json;
      case 'otf':
        return ContentType.otf;
      case 'ttf':
        return ContentType.ttf;
      default:
        return ContentType.binary;
    }
  }

  public static stripSignature(url?: string): string {
    return url && url.includes('?')
      ? url.substring(0, url.indexOf('?'))
      : url || '';
  }

  public static parseAssetUrl(src?: string): S3Object | undefined {
    let result: S3Object | undefined = undefined;
    if (!src) return result;

    try {
      const url = new URL(src);

      // https://s3<region>.amazonaws.com/<bucket>/<key>
      if (url.host.startsWith('s3') && url.host.includes('.amazonaws.com')) {
        result = {
          bucket: url.pathname.substring(1, url.pathname.indexOf('/', 1)),
          key: url.pathname.substring(url.pathname.indexOf('/', 1) + 1),
        };
      }
      // https://<bucket>/<key>
      else if (!url.host.includes('.amazonaws.com')) {
        result = {
          bucket: url.host,
          key: url.pathname.substring(1),
        };
      }
      // https://<bucket>.s3.<region>.amazonaws.com/<key>
      else if (!url.host.startsWith('s3.') && url.host.includes('.amazonaws.com')) {
        result = {
          bucket: url.host.substring(0, url.host.indexOf('.s3.')),
          key: url.pathname.substring(1),
        };
      }
    } catch (_) {
      return result;
    }

    return result;
  }
}
