/**
 * Logger Utility
 * Replaces console.log with environment-aware logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enableInProduction?: boolean;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      enableInProduction: false,
      prefix: '[TravelMatch]',
      ...config,
    };
  }

  private shouldLog(): boolean {
    return __DEV__ || (this.config.enableInProduction ?? false);
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    ..._args: unknown[]
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix;
    return `${prefix} [${level.toUpperCase()}] ${timestamp}: ${message}`;
  }

  debug(message: string, ..._args: unknown[]): void {
    if (this.shouldLog()) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('debug', message), ..._args);
    }
  }

  info(message: string, ..._args: unknown[]): void {
    if (this.shouldLog()) {
      // eslint-disable-next-line no-console
      console.info(this.formatMessage('info', message), ..._args);
    }
  }

  warn(message: string, ..._args: unknown[]): void {
    // Warnings are always logged
    console.warn(this.formatMessage('warn', message), ..._args);
  }

  error(message: string, error?: Error | unknown, ..._args: unknown[]): void {
    // Errors are always logged
    console.error(this.formatMessage('error', message), error, ..._args);
  }

  /**
   * Group related logs together
   */
  group(label: string, callback: () => void): void {
    if (this.shouldLog()) {
      // eslint-disable-next-line no-console
      console.group(this.formatMessage('debug', label));
      callback();
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  }

  /**
   * Log object/data in a readable format
   */
  data<T>(label: string, data: T): void {
    if (this.shouldLog()) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('debug', label));
      // eslint-disable-next-line no-console
      console.table(data);
    }
  }

  /**
   * Performance timing
   */
  time(label: string): void {
    if (this.shouldLog()) {
      // eslint-disable-next-line no-console
      console.time(this.formatMessage('debug', label));
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog()) {
      // eslint-disable-next-line no-console
      console.timeEnd(this.formatMessage('debug', label));
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for custom instances
export { Logger };

// Export types
export type { LogLevel, LoggerConfig };
