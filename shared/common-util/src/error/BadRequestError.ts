import { StatusProvider } from './StatusProvider';

export class BadRequestError extends Error implements StatusProvider {

  readonly details?: string;

  constructor(message: string, err?: Error, details?: string) {
    super(message);

    if (err?.stack) {
      this.stack = err.stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
      if (!this.stack) this.stack = '';
    }
    this.details = details || err?.message;

    this.name = 'BadRequest';
  }

  getStatusCode(): number {
    return 400;
  }
}
