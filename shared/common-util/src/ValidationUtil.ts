import Joi, { NumberSchema, Schema, StringSchema } from 'joi';
import { ErrorUtil } from './ErrorUtil';

export type NumberFormat = NumberSchema;
export type StringFormat = StringSchema;

export class ValidationUtil {

  public static validate<T>(field: string, value: unknown, format: Schema<T>): T {

    const result = format.validate(value);

    if (result.error) {
      throw ErrorUtil.badRequest(`'${field}' value is incorrect`, result.error, result.error.message);
    }

    return result.value;
  }

  public static validateNumber(field: string, value: number | string | undefined, format: Schema<number>): number {
    return this.validate<number>(field, value ? value : undefined, format);
  }

  public static numberFormat(min?: number, max?: number, required = true, def?: number): NumberFormat {
    let format = Joi.number();

    if (required) {
      format = format.required();
    } else {
      format = format.optional();
    }
    if (min != undefined) format = format.min(min);
    if (max != undefined) format = format.max(max);
    if (def != undefined) format = format.default(def);

    return format;
  }

  public static stringFormat(min?: number, max?: number, required = true, def?: string): StringFormat {
    let format = Joi.string();

    if (required) {
      format = format.required();
    } else {
      format = format.optional();
    }
    if (min != undefined) format = format.min(min);
    if (max != undefined) format = format.max(max);
    if (def != undefined) format = format.default(def);

    return format;
  }

  public static validateString(field: string, value: string | undefined, format: Schema<number>): string {
    return this.validate<string>(field, value ? value : undefined, format);
  }

  public static enumFormat(values: string[] = [], required = true): StringFormat {
    let format = Joi.string().valid(...values);

    if (required) {
      format = format.required();
    } else {
      format = format.optional();
    }

    return format;
  }

}
