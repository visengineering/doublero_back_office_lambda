import {
  ProductUpdate3dPreviewData,
  ProductUpdateLayoutData,
  ProductUpdatePreviewsSubType,
  ProductUpdateRoomPreviewData,
  ProductUpdateType,
  Update,
  UpdateAction,
  UpdateDataType
} from '../../../../model/ProductUpdate';
import { AlgoliaProductLayoutsType, AlgoliaProductLayoutType, AlgoliaUpdateProductType } from '../../../../model/Algolia';
import { AlgoliaTransformers, AlgoliaUpdateBuilder } from '../../algolia/AlgoliaUpdateBuilder';
import { ProductLayoutPieces, ProductLayoutType } from 'common-db/model/Product';
import { ErrorUtil } from 'common-util/ErrorUtil';

export class ProductPreviewsAlgoliaBuilder extends AlgoliaUpdateBuilder {
  protected updateType(): ProductUpdateType {
    return ProductUpdateType.previews;
  }

  protected transformers(): AlgoliaTransformers {
    return {
      [ProductUpdatePreviewsSubType.layouts]: (data: UpdateDataType, action = UpdateAction.update) => {
        if (action == UpdateAction.delete) {
          throw ErrorUtil.notAllowed(`Action ${UpdateAction.delete} is not supported for type '${this.updateType()}' and subtype '${ProductUpdatePreviewsSubType.layouts}'`);
        }

        return ProductPreviewsAlgoliaBuilder.prepareLayoutUpdate(<ProductUpdateLayoutData[]>data);
      },
      [ProductUpdatePreviewsSubType.previews_3d]: (data: UpdateDataType, action = UpdateAction.update, context?: unknown) => {
        return ProductPreviewsAlgoliaBuilder.prepare3dPreviewUpdate(<ProductUpdate3dPreviewData>data, <AlgoliaProductLayoutsType>context);
      },
      [ProductUpdatePreviewsSubType.previews_room]: (data: UpdateDataType, action = UpdateAction.update, context?: unknown) => {
        return ProductPreviewsAlgoliaBuilder
          .prepareRoomPreviewUpdate(<ProductUpdateRoomPreviewData>data, <AlgoliaProductLayoutsType>context);
      },
    };
  }

  public buildRelatedUpdates(updates: Update[]): AlgoliaUpdateProductType {
    const transformers = this.transformers();

    const layoutsUpdate = updates.find(update => update.sub_type == ProductUpdatePreviewsSubType.layouts);
    if (!layoutsUpdate) return {};

    const layoutData: ProductUpdateLayoutData[] = (<ProductUpdateLayoutData[]>layoutsUpdate.data || []).filter(layout => !!layout.url);

    const layoutTransformer = this.getTransformer(transformers, ProductUpdatePreviewsSubType.layouts);
    const result = <AlgoliaProductLayoutsType>layoutTransformer(layoutData, UpdateAction.update);

    updates
      .filter(update => update.sub_type != ProductUpdatePreviewsSubType.layouts)
      .forEach(update => {
        this.verifyUpdate(update, transformers);

        switch (update.sub_type) {
          case ProductUpdatePreviewsSubType.previews_3d:
            result.layouts = (<AlgoliaProductLayoutsType>this
              .getTransformer(transformers, update.sub_type)(update.data, update.action, result)).layouts;
            break;
          case ProductUpdatePreviewsSubType.previews_room:
            result.layouts = (<AlgoliaProductLayoutsType>this
              .getTransformer(transformers, update.sub_type)(update.data, update.action, result)).layouts;
            break;
        }
      });

    result.layouts.forEach(layout => {
      layout.room_previews = layout.room_previews.filter(preview => !!preview.url);

      layout.room_previews.forEach(room => {
        delete room.room_id;
      });
    });

    result.layouts = result.layouts.filter(layout => !!layout.url);

    return result;
  }

  private static prepareLayoutUpdate(data: ProductUpdateLayoutData[] = []): AlgoliaProductLayoutsType {
    return {
      layouts: data.map(item => ({
        name: item.layout.replace('Layout ', ''),
        pieces: item.pieces,
        type: this.getLayoutType(item.type, item.pieces),
        shape: item.shape,
        url: item.url,
        sizes: item.sizes.map(size => ({ size })),
        preview_3d: item.preview_3d,
        preview_main: item.rooms.find(room => room)?.image_link || '',
        room_previews: item.rooms
          .map(room => ({
            room_id: room.room_id,
            url: room.image_link || '',
            room_type: room.room_type,
            colors: room.colors,
            styles: room.styles,
            unique: room.unique,
          })),
      }))
    };
  }

  private static getLayoutType(material: ProductLayoutType = 'Unknown', pieces: ProductLayoutPieces = 1): AlgoliaProductLayoutType {
    switch (material) {
      case 'Canvas':
      case 'Unknown':
        return pieces == 1 ? 'Canvas' : 'Multiple';
      case 'Framed Canvas':
        return 'Framed Canvas';
      case 'Framed Print':
        return 'Framed Print';
      case 'Poster Print':
        return 'Poster Print';
    }
  }

  private static prepare3dPreviewUpdate(data: ProductUpdate3dPreviewData,
    context: AlgoliaProductLayoutsType): AlgoliaProductLayoutsType {
    const layoutName = data.layout.replace('Layout ', '');
    const layout = context.layouts?.find(l => l.name == layoutName);

    if (layout) layout.preview_3d = data.preview_3d || '';

    return context;
  }

  private static prepareRoomPreviewUpdate(data: ProductUpdateRoomPreviewData,
    context: AlgoliaProductLayoutsType): AlgoliaProductLayoutsType {
    const layoutName = data.layout.replace('Layout ', '');
    const layout = context.layouts?.find(l => l.name == layoutName);

    if (layout && data.rooms?.length) {
      layout.room_previews.forEach(room => {
        const roomUpdate = data.rooms.find(r => r.room_id == room.room_id);
        if (roomUpdate) room.url = roomUpdate.image_link;
      });
      layout.room_previews = layout.room_previews.filter(room => !!room.url);
    }

    return context;
  }

}
