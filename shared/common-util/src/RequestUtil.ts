import { ErrorUtil } from './ErrorUtil';
import { APIGatewayProxyEvent } from './aws/ApiGatewayClient';
import { ValidationUtil } from './ValidationUtil';
import { BadRequestError } from './error/BadRequestError';

export type SortDirection = 1 | -1;

export interface Sort {
  [field: string]: SortDirection;
}

export interface Page<T> {
  page: number;
  page_size: number;
  total_items: number;
  next_token?: string;
  sort?: Sort;
  content?: T[];
}

export class RequestUtil {

  public static getEnvParam(variable: string): string {
    if (!process.env[variable]) {
      throw ErrorUtil.configuration('Environment param is missing', [variable]);
    }

    return <string>process.env[variable];
  }

  public static getPathParam(event: APIGatewayProxyEvent, param: string): string {
    if (!event.pathParameters || !event.pathParameters[param]) {
      throw ErrorUtil.missingParams('Request parameter is missing', [param]);
    }

    return <string>event.pathParameters[param];
  }

  public static getHeader(event: APIGatewayProxyEvent, header: string, optional = false): string {
    if (!optional && (!event.headers || !event.headers[header])) {
      throw ErrorUtil.missingParams('Request header is missing', [header]);
    }

    return event.headers ? event.headers[header] || '' : '';
  }

  public static getQueryParam(event: APIGatewayProxyEvent, param: string, optional = false): string {
    if (!optional && (!event.queryStringParameters || !event.queryStringParameters[param])) {
      throw ErrorUtil.missingParams('Request query parameter is missing', [param]);
    }

    return event.queryStringParameters ? event.queryStringParameters[param] || '' : '';
  }

  public static getPageParam(event: APIGatewayProxyEvent): Page<never> {
    try {
      const page = ValidationUtil.validateNumber('page',
        this.getQueryParam(event, 'page', true),
        ValidationUtil.numberFormat(0, undefined, false, 0)
      );
      const page_size = ValidationUtil.validateNumber('page_size',
        this.getQueryParam(event, 'page_size', true),
        ValidationUtil.numberFormat(1, 200, false, 10)
      );

      // parseInt(this.getQueryParam(event, 'page_size', true) || '10');
      const token = this.getQueryParam(event, 'next_token', true);
      // const page = parseInt(this.getQueryParam(event, 'page', true) || '0');
      const sort = this.getQueryParam(event, 'sort', true) || '';
      const sortObject = sort ? this.getSortObject(sort) : {};

      return {
        page,
        page_size,
        total_items: 0,
        sort: sortObject,
        next_token: token,
      };
    } catch (err) {
      const error = err as Error;
      throw ErrorUtil.badRequest(`Provided paging params are incorrect: ${error.message}`, error,
        (error as BadRequestError).details || 'Read params: [page, page_size, next_token, asc]');
    }
  }

  private static getSortObject(sort = ''): Sort {
    return sort
      .split('|')
      .filter(sortField => sortField && sortField.includes(','))
      .map(sortField => {
        const data = sortField.split(',');

        return data.length == 2
          ? {[data[0]]: +data[1] as SortDirection}
          : {};
      })
      .filter(sortField => sortField && Object.keys(sortField).length == 1)
      .reduce((field1, field2) => ({
        ...field1,
        ...field2
      }), {});
  }

  public static getBody<T>(event: APIGatewayProxyEvent, optional = false): T {
    if (!optional && !event.body) {
      throw ErrorUtil.missingParams('Request body is missing', ['Request body']);
    }

    return event.body ? JSON.parse(event.body) as T : {} as T;
  }

}
