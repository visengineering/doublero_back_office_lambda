import { BadRequestError } from './error/BadRequestError';
import { UnauthorizedError } from './error/UnauthorizedError';
import { ApiGeneralError } from './error/ApiGeneralError';
import { ConflictError } from './error/ConflictError';
import { NotAllowedError } from './error/NotAllowedError';
import { NotFoundError } from './error/NotFoundError';
import { CommunicationError } from './error/CommunicationError';
import { ConfigurationError } from './error/ConfigurationError';
import { Role } from './AuthUtil';

export interface ApiError {
  response: {
    data: string;
    status: number;
  };
  request: Record<string, unknown>;
}

export class ErrorUtil {

  public static general(message: string, err?: Error, details?: string): ApiGeneralError {
    return new ApiGeneralError(message, err, details);
  }

  public static badRequest(message: string, err?: Error, details?: string): BadRequestError {
    return new BadRequestError(message, err, details);
  }

  public static missingParams(message: string, params: string[]): BadRequestError {
    return new BadRequestError(message, undefined, `Missing fields: [${params.join(',')}]`);
  }

  public static conflict(message: string, err?: Error, details?: string): ConflictError {
    return new ConflictError(message, err, details);
  }

  public static communication(message: string, err?: Error, details?: string): CommunicationError {
    return new CommunicationError(message, err, details);
  }

  public static configuration(message: string, configs: string[]): ConfigurationError {
    return new ConfigurationError(message, undefined, `Missing or incorrectly configured: [${configs.join(',')}]`);
  }

  public static notFound(message: string, err?: Error, details?: string): NotFoundError {
    return new NotFoundError(message, err, details);
  }

  public static notAllowed(message: string, err?: Error, details?: string): NotAllowedError {
    return new NotAllowedError(message, err, details);
  }

  public static unauthorized(role: Role[], err?: Error, details?: string): UnauthorizedError {
    return new UnauthorizedError(`Any of [${role.join(',')}] roles is required to proceed`, err, details);
  }

  public static forbidden(message: string, err?: Error, details?: string): UnauthorizedError {
    return new UnauthorizedError(message, err, details);
  }

  public static apiCallError(message: string, apiError?: ApiError, err?: Error): Error {
    const statusCode = apiError && apiError.response && apiError.response.status ? apiError.response.status : -1;
    const details = apiError && apiError.response && apiError.response.data ? apiError.response.data : '';

    let error: Error;

    if (statusCode === 400) {
      error = new BadRequestError(message, err, details || 'API request was malformed');
    } else if (statusCode && statusCode >= 401 && statusCode <= 403) {
      error = new UnauthorizedError(message, err, details || 'API request authentication failed');
    } else if (statusCode === 404) {
      error = new NotFoundError(message, err, details || 'API request resource was not found');
    } else if (statusCode === 405 || statusCode === 406 || statusCode === 417) {
      error = new NotAllowedError(message, err, details || 'API call was not allowed');
    } else if (statusCode === 409) {
      error = new ConflictError(message, err, details || 'API request resulted in conflict');
    } else if (statusCode && statusCode >= 500) {
      error = new ApiGeneralError(message, err, details || 'API request resulted in server error');
    } else if (apiError && apiError.request) {
      error = new CommunicationError(message, err, 'The request was made but no response was received');
    } else {
      error = new CommunicationError(message, err, details ||
        `API request was not successful, server responded with ${statusCode}`);
    }

    return error;
  }

}
