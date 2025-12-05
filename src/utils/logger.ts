/**
 * Logger Utility
 * Environment-aware logging system with structured output and performance tracking
 * @module utils/logger
 *
 * @description
 * Replaces console.log with a production-safe logger that:
 * - Only logs in development by default
 * - Provides structured log levels (debug, info, warn, error)
 * - Includes timestamps and prefixes
 * - Supports performance timing and grouped logs
 *
 * @example
 * ```typescript
 * import { logger } from '@/utils/logger';
 *
 * // Basic logging
 * logger.debug('Debug message');
 * logger.info('User logged in', { userId: '123' });
 * logger.warn('Rate limit approaching');
 * logger.error('Failed to fetch data', error);
 *
 * // Performance timing
 * logger.time('API Call');
 * await fetchData();
 * logger.timeEnd('API Call'); // Logs duration
 *
 * // Grouped logs
 * logger.group('Form Validation', () => {
 *   logger.info('Validating email...');
 *   logger.info('Validating password...');
 * });
 * ```
 */

/** Log level types */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger configuration options
 */
interface LoggerConfig {
  /** Enable logging in production (default: false) */
  enableInProduction?: boolean;
  /** Prefix for all log messages (default: [TravelMatch]) */
  prefix?: string;
}

/**
 * Logger class for structured, environment-aware logging
 *
 * @example
 * ```typescript
 * // Create custom logger instance
 * const apiLogger = new Logger({ prefix: '[API]' });
 * apiLogger.info('Request sent');
 * ```
 */
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
