import {
  Product,
  ProductLayout,
  ProductLayoutPieces,
  ProductLayoutRoom,
  ProductLayoutShape,
  ProductLayoutShortName,
  ProductLayoutType,
  ProductPreviewLayout,
  ProductVariant,
  ProductVariantConfig,
  RoomPreview
} from '../model/Product';
import { DataUtil } from 'common-util/DataUtil';
import { DBService } from './DBService';
import { DBCollection } from '../DBCollection';
import { TagsMapping } from '../model/TagsMapping';
import { ProductPreviewsDBService } from './ProductPreviewsDBService';
import { HEXAGON_LAYOUTS, HORIZONTAL_LAYOUTS, MIX_LAYOUTS, PANORAMIC_LAYOUTS, SQUARE_LAYOUTS, VERTICAL_LAYOUTS } from '../model/Layout';
import { ProductsVariantsConfigDBService } from './ProductsVariantsConfigDBService';

export class ProductLayoutsDBService {

  public static async prepareLayouts(product: Product): Promise<ProductLayout[]> {
    const items: ProductLayout[] = [];
    const layouts = product.layouts || [];

    if (!layouts.length) return items;

    const variantConfigs = await ProductLayoutsDBService.loadVariantConfigs(layouts, true);
    const layoutConfigNameSet: Set<string> = new Set<string>();
    layouts.forEach(layout => layoutConfigNameSet.add(layout.replace('Layout ', '')));
    const productPreviews = await ProductPreviewsDBService.getProductPreview(product.sku);

    const productsVariantConfigs = await ProductsVariantsConfigDBService.getProductsVariantsConfig();

    for (const layout of layouts) {
      const variantConfig = variantConfigs.find(variant => variant.key == layout);
      const productPreviewsLayout = productPreviews?.layouts?.find(l => l.layout_name === layout);
      const productVariantConfig = productsVariantConfigs.find(x => x.key === layout);

      const availableVariantSizes = variantConfig?.value?.filter(size => {
        return !!product.variants?.find(variant => variant?.option1 === size?.option1 && variant?.option2 === size?.option2);
      });

      const smallestVariantConfig = availableVariantSizes?.find(size => size);

      const smallestVariant = product.variants?.find(variant => {
        return variant?.option1 == smallestVariantConfig?.option1 && variant?.option2 === smallestVariantConfig?.option2;
      });

      if (!smallestVariantConfig || !smallestVariant || !smallestVariant.id) continue;

      const pieces = ProductLayoutsDBService.getPiecesCount(smallestVariantConfig?.option1 || '');

      const rooms = pieces === 7
        ? await ProductLayoutsDBService.prepareHexagonRoomDetails(smallestVariant)
        : await this.prepareLayoutRoomDetails(productPreviewsLayout);

      items.push({
        short_layout: smallestVariantConfig.option1,
        master_handle: productVariantConfig?.handle || '',
        layout,
        url: `${product.url}?variant=${smallestVariant.id}`,
        pieces: ProductLayoutsDBService.getPiecesCount(smallestVariantConfig?.option1 || ''),
        shape: ProductLayoutsDBService.parseLayoutShape(layout),
        type: ProductLayoutsDBService.getLayoutType(smallestVariantConfig?.option1),
        sizes: availableVariantSizes?.map(sizeConfig => sizeConfig.option2) || [],
        preview_3d: productPreviewsLayout?.preview_3d?.shopify_cdn_url || productPreviewsLayout?.preview_3d?.cdn_url,
        rooms,
        compare_at_price: smallestVariantConfig?.compare_at_price ? parseFloat(smallestVariantConfig.compare_at_price) : 0 || 0,
        price: smallestVariantConfig?.price ? parseFloat(smallestVariantConfig.price) : 0 || 0,
      });
    }

    return items;
  }

  public static async loadVariantConfigs(layouts: string[], fetchPrice = true): Promise<ProductVariantConfig[]> {
    const configCollection = await DBService.getCollection(DBCollection.PRODUCT_VARIANT_CONFIGS);
    const variantConfigs = await configCollection.find<ProductVariantConfig>(
      {
        key: { $in: layouts },
      },
      {
        projection: {
          _id: 0,
          key: 1,
          value: {
            option1: 1,
            option2: 1,
            position: 1,
            ...(fetchPrice && {
              price: 1,
              compare_at_price: 1
            }),
          }
        }
      }
    ).toArray();

    variantConfigs.forEach(config => {
      config.value.sort((v1, v2) => (v1.position || 0) - (v2.position || 0));
    });

    return variantConfigs;
  }

  public static getPiecesCount(layout = ''): ProductLayoutPieces {
    const info = layout.toLowerCase().replace('layout', '').trim();

    return (/^\d/.test(info) ? parseInt(info[0]) : 1) as ProductLayoutPieces;
  }

  private static getLayoutType(layout?: ProductLayoutShortName): ProductLayoutType {
    if (!layout) return 'Unknown';

    switch (layout) {
      case '1 Piece':
      case '2 Piece':
      case '3 Piece':
      case '4 Piece':
      case '5 Piece':
      case '6 Piece':
      case '7 Piece':
        return 'Canvas';
      case 'Framed Canvas':
        return 'Framed Canvas';
      case 'Framed Print':
        return 'Framed Print';
      case 'Poster Print':
        return 'Poster Print';
    }
  }

  private static async prepareHexagonRoomDetails(variant?: ProductVariant): Promise<ProductLayoutRoom[]> {
    return [
      {
        room_id: DataUtil.generateId(),
        image_link: variant?.image,
        styles: [],
        colors: [],
        unique: [],
      },
    ];
  }

  public static async prepareLayoutRoomDetails(previewLayout?: ProductPreviewLayout, allRooms = true): Promise<ProductLayoutRoom[]> {
    const chosenRoomIds = previewLayout?.chosen_room_ids?.map(id => DBService.newId(id)) || [];
    if (!previewLayout) {
      return [];
    }

    const ImagePreviewCollection = await DBService.getCollection(DBCollection.IMAGE_PREVIEWS);
    const roomData = chosenRoomIds.length ? (await ImagePreviewCollection.find<RoomPreview>(
      {
        _id: { $in: chosenRoomIds },
      }, {
        projection: {
          _id: 0,
          url: 1,
          tags: 1,
        }
      }
    ).toArray()) || [] : [];

    const rooms: Map<string, RoomPreview> = new Map<string, RoomPreview>();

    roomData.forEach(room => {
      const roomId = ProductLayoutsDBService.parseRoomId(room.url);
      if (roomId) rooms.set(roomId, room);
    });

    const previews: ProductLayoutRoom[] = [];

    const images = allRooms
      ? previewLayout.images || []
      : previewLayout.images?.length ? [previewLayout.images[0]] : [];
    for (const imagePreview of images) {
      const image = imagePreview.image;
      const roomId = ProductLayoutsDBService.parseRoomId(image.src);

      let room: RoomPreview | null = null;
      if (roomId) {
        room = rooms.get(roomId) || (await ProductLayoutsDBService.getRoomData(roomId));
      }

      previews.push({
        room_id: roomId || DataUtil.generateId(),
        image_link: image?.shopify_src || image?.src,
        room_type: ProductLayoutsDBService.mapRoomProperty(TagsMapping.rooms, room?.tags || []),
        styles: ProductLayoutsDBService.mapRoomProperties(TagsMapping.styles, room?.tags || [], []),
        colors: ProductLayoutsDBService.mapRoomProperties(TagsMapping.colors, room?.tags || [], []),
        unique: ProductLayoutsDBService.mapRoomProperties(TagsMapping.unique, room?.tags || [], []),
      });
    }

    return previews;
  }

  private static mapRoomProperty(values: string[], tags: string[], defValue?: string): string | undefined {
    return tags ? values.find((tag: string) => tags.includes(tag)) : defValue;
  }

  private static mapRoomProperties(values: string[], tags: string[], defValue: string[] = []): string[] {
    return tags ? values.filter((tag: string) => tags.includes(tag)) : defValue;
  }

  private static parseRoomId(url = ''): string | null {
    const [, short, long] = /v1\/rooms\/(.*)|Rooms\/([^.]+)/.exec(url) || [];

    return long || short || null;
  }

  public static parseLayoutShape(layoutName = ''): ProductLayoutShape {
    const shapeKey = layoutName
      .toLowerCase()
      .replace('layout', '')
      .replace(/\W/g, '');

    if (HORIZONTAL_LAYOUTS.includes(shapeKey)) {
      return 'horizontal';
    } else if (VERTICAL_LAYOUTS.includes(shapeKey)) {
      return 'vertical';
    } else if (SQUARE_LAYOUTS.includes(shapeKey)) {
      return 'square';
    } else if (PANORAMIC_LAYOUTS.includes(shapeKey)) {
      return 'panoramic';
    } else if (HEXAGON_LAYOUTS.includes(shapeKey)) {
      return 'hexagon';
    } else if (MIX_LAYOUTS.includes(shapeKey)) {
      return 'mix';
    } else {
      return 'unknown';
    }
  }

  private static async getRoomData(roomId: string): Promise<RoomPreview | null> {
    const previewsCollection = await DBService.getCollection(DBCollection.IMAGE_PREVIEWS);

    return await previewsCollection.findOne<RoomPreview>(
      {
        url: { $regex: `.*\/${roomId}(\..*)?$` }, // eslint-disable-line no-useless-escape
      },
      {
        projection: {
          _id: 0,
          url: 1,
          tags: 1,
        }
      }
    );
  }
}
