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
 * - Supports log level filtering with minLevel
 * - Supports remote logging integration
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
 * // Set minimum log level
 * logger.setMinLevel('warn'); // Only warn and error will be logged
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

/** Log level priority for filtering */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Logger configuration options
 */
interface LoggerConfig {
  /** Enable logging in production (default: false) */
  enableInProduction?: boolean;
  /** Prefix for all log messages (default: [TravelMatch]) */
  prefix?: string;
  /** Minimum log level to output (default: debug) */
  minLevel?: LogLevel;
  /** Enable remote logging (default: false) */
  enableRemoteLogging?: boolean;
  /** Format logs as JSON for production (default: false in dev, true in prod) */
  jsonFormat?: boolean;
}

/**
 * Structured log entry for remote logging
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  prefix: string;
  args?: unknown[];
  context?: Record<string, unknown>;
}

/**
 * Logger class for structured, environment-aware logging
 *
 * @example
 * ```typescript
 * // Create custom logger instance
 * const apiLogger = new Logger({ prefix: '[API]' });
 * apiLogger.info('Request sent');
 *
 * // Create production logger with JSON format
 * const prodLogger = new Logger({
 *   enableInProduction: true,
 *   jsonFormat: true,
 *   minLevel: 'warn'
 * });
 * ```
 */
class Logger {
  private config: Required<LoggerConfig>;
  private timers: Map<string, number> = new Map();
  private remoteLogQueue: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      enableInProduction: false,
      prefix: '[TravelMatch]',
      minLevel: 'debug',
      enableRemoteLogging: false,
      jsonFormat: !__DEV__,
      ...config,
    };

    // Start remote log flush interval if enabled
    if (this.config.enableRemoteLogging && !__DEV__) {
      this.startRemoteFlush();
    }
  }

  /**
   * Set minimum log level
   * @param level - Minimum level to log
   */
  setMinLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  /**
   * Get current minimum log level
   */
  getMinLevel(): LogLevel {
    return this.config.minLevel;
  }

  /**
   * Enable or disable remote logging
   */
  setRemoteLogging(enabled: boolean): void {
    this.config.enableRemoteLogging = enabled;
    if (enabled && !this.flushInterval) {
      this.startRemoteFlush();
    } else if (!enabled && this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const isEnabled = __DEV__ || this.config.enableInProduction;
    const meetsMinLevel =
      LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel];
    return isEnabled && meetsMinLevel;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix;
    return `${prefix} [${level.toUpperCase()}] ${timestamp}: ${message}`;
  }

  private formatJSON(
    level: LogLevel,
    message: string,
    args: unknown[],
  ): string {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      prefix: this.config.prefix,
      args: args.length > 0 ? args : undefined,
    };
    return JSON.stringify(entry);
  }

  private queueRemoteLog(entry: LogEntry): void {
    if (!this.config.enableRemoteLogging) return;
    this.remoteLogQueue.push(entry);
    // Flush immediately if queue is large
    if (this.remoteLogQueue.length >= 50) {
      this.flushRemoteLogs();
    }
  }

  private startRemoteFlush(): void {
    // Flush every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushRemoteLogs();
    }, 30000);
  }

  /**
   * Flush queued logs to remote service
   */
  async flushRemoteLogs(): Promise<void> {
    if (this.remoteLogQueue.length === 0) return;

    const logs = [...this.remoteLogQueue];
    this.remoteLogQueue = [];

    // Send to Sentry as breadcrumbs (lazy import to avoid circular deps)
    try {
      const { addBreadcrumb } = await import('../config/sentry');
      logs.forEach((log) => {
        addBreadcrumb(log.message, 'logger', log.level as never, {
          args: log.args,
          timestamp: log.timestamp,
        });
      });
    } catch {
      // Sentry not available, logs are discarded
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      if (this.config.jsonFormat && !__DEV__) {
        // eslint-disable-next-line no-console
        console.log(this.formatJSON('debug', message, args));
      } else {
        // eslint-disable-next-line no-console
        console.log(this.formatMessage('debug', message), ...args);
      }
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      if (this.config.jsonFormat && !__DEV__) {
        // eslint-disable-next-line no-console
        console.info(this.formatJSON('info', message, args));
      } else {
        // eslint-disable-next-line no-console
        console.info(this.formatMessage('info', message), ...args);
      }
      this.queueRemoteLog({
        level: 'info',
        message,
        timestamp: new Date().toISOString(),
        prefix: this.config.prefix,
        args,
      });
    }
  }

  warn(message: string, ...args: unknown[]): void {
    // Warnings are always logged regardless of minLevel
    if (this.config.jsonFormat && !__DEV__) {
      console.warn(this.formatJSON('warn', message, args));
    } else {
      console.warn(this.formatMessage('warn', message), ...args);
    }
    this.queueRemoteLog({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      prefix: this.config.prefix,
      args,
    });
  }

  error(message: string, error?: Error | unknown, ...args: unknown[]): void {
    // Errors are always logged regardless of minLevel
    if (this.config.jsonFormat && !__DEV__) {
      console.error(
        this.formatJSON('error', message, [
          error,
          ...args,
          error instanceof Error ? { stack: error.stack } : undefined,
        ]),
      );
    } else {
      console.error(this.formatMessage('error', message), error, ...args);
    }
    this.queueRemoteLog({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      prefix: this.config.prefix,
      args: [error, ...args],
    });
  }

  /**
   * Group related logs together
   */
  group(label: string, callback: () => void): void {
    if (this.shouldLog('debug')) {
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
    if (this.shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('debug', label));
      // eslint-disable-next-line no-console
      console.table(data);
    }
  }

  /**
   * Performance timing - start
   */
  time(label: string): void {
    if (this.shouldLog('debug')) {
      this.timers.set(label, performance.now());
      // eslint-disable-next-line no-console
      console.time(this.formatMessage('debug', `⏱️ ${label}`));
    }
  }

  /**
   * Performance timing - end
   * @returns Duration in milliseconds
   */
  timeEnd(label: string): number | undefined {
    if (this.shouldLog('debug')) {
      const startTime = this.timers.get(label);
      if (startTime) {
        const duration = performance.now() - startTime;
        this.timers.delete(label);
        // eslint-disable-next-line no-console
        console.timeEnd(this.formatMessage('debug', `⏱️ ${label}`));
        return duration;
      }
      // eslint-disable-next-line no-console
      console.timeEnd(this.formatMessage('debug', `⏱️ ${label}`));
    }
    return undefined;
  }

  /**
   * Log with custom context
   */
  withContext(context: Record<string, unknown>) {
    return {
      debug: (message: string, ...args: unknown[]) => {
        const firstArg =
          typeof args[0] === 'object' && args[0] !== null ? args[0] : {};
        this.debug(
          message,
          { ...context, ...(firstArg as Record<string, unknown>) },
          ...args.slice(1),
        );
      },
      info: (message: string, ...args: unknown[]) => {
        const firstArg =
          typeof args[0] === 'object' && args[0] !== null ? args[0] : {};
        this.info(
          message,
          { ...context, ...(firstArg as Record<string, unknown>) },
          ...args.slice(1),
        );
      },
      warn: (message: string, ...args: unknown[]) => {
        const firstArg =
          typeof args[0] === 'object' && args[0] !== null ? args[0] : {};
        this.warn(
          message,
          { ...context, ...(firstArg as Record<string, unknown>) },
          ...args.slice(1),
        );
      },
      error: (message: string, error?: Error | unknown, ...args: unknown[]) => {
        this.error(message, error, { ...context }, ...args);
      },
    };
  }

  /**
   * Create a child logger with a new prefix
   */
  child(prefix: string): Logger {
    return new Logger({
      ...this.config,
      prefix: `${this.config.prefix}${prefix}`,
    });
  }

  /**
   * Cleanup (call on app unmount)
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flushRemoteLogs();
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for custom instances
export { Logger };

// Export types
export type { LogLevel, LoggerConfig, LogEntry };
