import {
  ProductUpdateCategorizationSubType,
  ProductUpdateGeneralSubType,
  ProductUpdateNameSubType,
  ProductUpdatePreviewsSubType,
  ProductUpdateSubType,
  ProductUpdateType,
  Update,
  UpdateAction
} from '../../model/ProductUpdate';
import { ErrorUtil } from 'common-util/ErrorUtil';

export class ProductUpdateHelper {

  static validateProductUpdateItem(item: Update): void {
    let error: string | undefined;

    if (!item.type) {
      error = 'Update type is required in order to proceed';
    } else if (!item.sub_type) {
      error = 'Update sub type is required in order to proceed';
    } else if (!item.action) {
      error = 'Update action is required in order to proceed';
    } else if (item.action == UpdateAction.update && !item.data) {
      error = 'Update data is required in order to proceed';
    }

    if (error) throw ErrorUtil.badRequest(error, undefined, JSON.stringify(item));
  }

  public static getUpdateSubTypes<T extends ProductUpdateSubType>(type: ProductUpdateType, requested: ProductUpdateSubType[] = []): T[] {
    let defaultSubTypes: ProductUpdateSubType[] = [];
    switch (type) {
      case ProductUpdateType.name:
        defaultSubTypes = Object.values(ProductUpdateNameSubType);
        break;
      case ProductUpdateType.categorization:
        defaultSubTypes = Object.values(ProductUpdateCategorizationSubType);
        break;
      case ProductUpdateType.previews:
        defaultSubTypes = Object.values(ProductUpdatePreviewsSubType);
        break;
      case ProductUpdateType.general:
        defaultSubTypes = Object.values(ProductUpdateGeneralSubType);
        break;
      default:
        throw ErrorUtil.notAllowed(`Product update with type=${type} is not supported`);
    }

    const incorrectSubtypes = requested.filter(type => !defaultSubTypes.includes(type));
    if (incorrectSubtypes.length) {
      throw ErrorUtil.badRequest(`Some of the requested subtypes are incorrect`, undefined, JSON.stringify(incorrectSubtypes));
    }

    return requested.length ? requested as T[] : defaultSubTypes as T[];
  }
}
