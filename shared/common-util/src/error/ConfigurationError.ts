import { StatusProvider } from './StatusProvider';

export class ConfigurationError extends Error implements StatusProvider {

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

    this.name = 'Configuration';
  }

  getStatusCode(): number {
    return 412;
  }
}
