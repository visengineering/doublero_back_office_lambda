import { StatusProvider } from './error/StatusProvider';
import { RequestUtil } from './RequestUtil';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from './aws/ApiGatewayClient';

interface Response {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export class ApiResponse {

  private static getDefaultResponse(statusCode: number, event: APIGatewayProxyEvent, headers: Record<string, string>): Response {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const envCorsConfig = process.env.CORS_ORIGIN;
    if (envCorsConfig) {
      const origin = RequestUtil.getHeader(event, 'origin', true) || '';
      const allowedOrigins = (envCorsConfig || '').split(',');

      if (allowedOrigins.includes(origin)) {
        defaultHeaders['Access-Control-Allow-Origin'] = origin;
      }
    }


    return {
      statusCode,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      body: JSON.stringify({}),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static success(data: any = {},
                        event: APIGatewayProxyEvent,
                        headers: Record<string, string> = {}): APIGatewayProxyResult {
    return ApiResponse.successResponse(200, event, headers, data);
  }

  public static redirect(url: string, event: APIGatewayProxyEvent, statusCode = 301): APIGatewayProxyResult {
    return ApiResponse.getDefaultResponse(statusCode, event, {
      Location: url
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static created(data: any = {},
                        event: APIGatewayProxyEvent,
                        headers: Record<string, string> = {}): APIGatewayProxyResult {
    return ApiResponse.successResponse(201, event, headers, data);
  }

  public static noContent(event: APIGatewayProxyEvent, headers: Record<string, string> = {}): APIGatewayProxyResult {
    return ApiResponse.successResponse(204, event, headers);
  }


  private static successResponse(statusCode: number,
                                 event: APIGatewayProxyEvent,
                                 headers: Record<string, string> = {},
                                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                 data: any = {}): APIGatewayProxyResult {
    const response: Response = ApiResponse.getDefaultResponse(statusCode, event, headers);

    /** Add body if status is not 204 and there is data to add.  */
    if (statusCode !== 204) {
      response.body = JSON.stringify(data);
    }

    return response;
  }

  private static isInternalError(error: StatusProvider | Error): error is StatusProvider {
    return (<StatusProvider>error).getStatusCode !== undefined;
  }

  public static error(err: Error, event: APIGatewayProxyEvent, headers: Record<string, string> = {}): APIGatewayProxyResult {
    const statusCode = err && ApiResponse.isInternalError(err)
      ? err.getStatusCode()
      : 500;

    return ApiResponse.errorResponse(statusCode, err, event, headers);
  }

  private static errorResponse(statusCode = 500, err: Error, event: APIGatewayProxyEvent,
                               headers: Record<string, string> = {}): APIGatewayProxyResult {
    console.error(err);
    if (event) {
      console.info(`Last error was for: ${JSON.stringify(event)}`);
    }

    const code = err ? err.name : 'ServerError';
    const message = statusCode !== 500 && err && err.message
      ? err.message
      : 'There was an internal server error. Please try again later. If the problem persists, please contact technical support.';
    const details = 'details' in err ? ((err as object) as { [key: string]: string })['details'] as string : undefined;

    const response: Response = ApiResponse.getDefaultResponse(statusCode, event, headers);
    response.body = JSON.stringify({
      code,
      message,
      details,
    });

    return response;
  }
}
