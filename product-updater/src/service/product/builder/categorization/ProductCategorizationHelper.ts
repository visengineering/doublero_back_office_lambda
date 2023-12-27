import { TreeUpdateData } from '../../../../model/ProductUpdate';
import { AlgoliaProductCategoriesType } from '../../../../model/Algolia';

type LabelType = 'name' | 'identifier';

export class ProductCategorizationHelper {
  static readonly LEVEL_SEPARATOR = ' > ';

  static readonly SHOP_CATEGORIZATION_HANDLE_SUFFIX = 'wall-art';
  static readonly SHOP_CATEGORIZATION_HANDLE_SEPARATOR = '|';

  public static transformTreeToArray(data: TreeUpdateData[] = [], prop: LabelType = 'name'): string[] {
    return data
      .map(dataItem => dataItem[prop].trim())
      .filter(item => !!item);
  }

  /**
   * Transform data tree to an object with levels as a string.
   */
  public static transformTreeToFlatObject(data: TreeUpdateData | undefined, categoryName: string,
    maxLevels: number, prop: LabelType = 'name'): AlgoliaProductCategoriesType {

    const levels = data ? this.treeToLevels(data, prop) : [];
    const result = <Record<string, string>>this.buildLevelsTemplate(categoryName, maxLevels, '');

    let buffer = '';
    levels.reverse().forEach((reversed: string, index: number) => {
      buffer += index ? this.LEVEL_SEPARATOR + reversed : reversed;
      const propName = categoryName + (index + 1);
      result[propName] = buffer;
    });

    return result;
  }

  /**
   * Transform data tree to an object with array of levels.
   */
  static transformTreeToNestedObject(data: TreeUpdateData[], categoryName: string,
    maxLevels: number, prop: LabelType = 'name'): AlgoliaProductCategoriesType {

    const levels = data.map(dataItem => this.treeToLevels(dataItem, prop));
    const result = <Record<string, string[]>>this.buildLevelsTemplate(categoryName, maxLevels, []);

    levels.forEach(level => {
      let buffer = '';
      level.reverse().forEach((reversed: string, index: number) => {
        buffer += index ? this.LEVEL_SEPARATOR + reversed : reversed;

        const propName = categoryName + (index + 1);
        if (!result[propName]?.length) {
          result[propName] = [];
        }

        if (!result[propName].includes(buffer)) {
          result[propName].push(buffer);
        }
      });
    });

    return result;
  }

  private static buildLevelsTemplate(categoryName: string, maxLevels: number, preset: [] | ''): Record<string, string[] | string> {
    const result: Record<string, string[] | string> = {};

    for (let i = 1; i <= maxLevels; i++) {
      result[categoryName + i] = preset;
    }

    return result;
  }

  private static treeToLevels(data: TreeUpdateData, prop: LabelType = 'name'): string[] {
    const levels: string[] = [];

    if (data[prop]) {
      levels.push(data[prop]);
    }

    if (data?.parents?.length) {
      data.parents.forEach((parent: TreeUpdateData) => {
        const index = (<number>parent.level || 0) + 1;
        levels[index] = parent[prop];
      });
    }

    return levels;
  }

  public static prepareCategorizationHandle(identifier: string | undefined, suffix = this.SHOP_CATEGORIZATION_HANDLE_SUFFIX): string {
    return identifier ? `${identifier}-${suffix}` : '';
  }

  public static prepareCategorizationValueForList(values: string[] | undefined): string {
    return values
      ? values.map(value => this.prepareCategorizationHandle(value))
        .join(this.SHOP_CATEGORIZATION_HANDLE_SEPARATOR)
      : '';
  }

  public static prepareCategorizationValueForTree(values: TreeUpdateData[] = []): string {
    return values
      .map(value => this.prepareCategorizationHandle(value.slug || value.identifier, value.suffix))
      .join(this.SHOP_CATEGORIZATION_HANDLE_SEPARATOR);
  }
}
