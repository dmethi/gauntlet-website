import { Logger } from './types';

export class ConsoleLogger implements Logger {
  private prefix: string;

  constructor(prefix = 'DataIngestion') {
    this.prefix = prefix;
  }

  private formatMessage(message: string): string {
    return `[${this.prefix}] ${message}`;
  }

  private formatDate(): string {
    return new Date().toISOString();
  }

  info(message: string, ...args: unknown[]): void {
    console.info(`${this.formatDate()} ${this.formatMessage(message)}`, ...args);
  }

  error(message: string, error?: Error, ...args: unknown[]): void {
    console.error(
      `${this.formatDate()} ${this.formatMessage(message)}`,
      error?.stack || error,
      ...args
    );
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`${this.formatDate()} ${this.formatMessage(message)}`, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    console.debug(`${this.formatDate()} ${this.formatMessage(message)}`, ...args);
  }
}

export const createLogger = (prefix?: string): Logger => {
  return new ConsoleLogger(prefix);
};
