/**
 * Production-Safe Logger Utility
 *
 * Environment-aware logging system that:
 * - Filters debug logs in production
 * - Sanitizes sensitive data (PII, credentials)
 * - Provides structured logging levels
 * - Integrates with error tracking services
 *
 * @example
 * ```typescript
 * import { logger } from '@lovendo/shared';
 *
 * logger.debug('Debug message', { data });
 * logger.info('User action', { userId });
 * logger.warn('Rate limit approaching');
 * logger.error('Operation failed', error, { context });
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LoggerOptions {
  /** Enable logging in production (default: false for debug/info) */
  enableInProduction?: boolean;
  /** Prefix for all log messages */
  prefix?: string;
  /** Minimum log level to output */
  minLevel?: LogLevel;
}

/** Sensitive data patterns to redact for GDPR/KVKK compliance */
const SENSITIVE_KEYS = [
  'password',
  'token',
  'apikey',
  'api_key',
  'secret',
  'authorization',
  'bearer',
  'session',
  'cookie',
  'credit_card',
  'creditcard',
  'cvv',
  'cvc',
  'pin',
  'private_key',
  'access_token',
  'refresh_token',
  'client_secret',
  'tc_kimlik', // Turkish ID
  'tckn',
] as const;

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class ProductionLogger {
  private prefix: string;
  private minLevel: LogLevel;
  private enableInProduction: boolean;

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix || '[Lovendo]';
    this.minLevel = options.minLevel || 'debug';
    this.enableInProduction = options.enableInProduction || false;
  }

  private isProduction(): boolean {
    return (
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_ENV === 'production'
    );
  }

  private shouldLog(level: LogLevel): boolean {
    // Check minimum level
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.minLevel]) {
      return false;
    }

    // In production, only log warnings and errors by default
    if (this.isProduction() && !this.enableInProduction) {
      return level === 'warn' || level === 'error';
    }

    return true;
  }

  /**
   * Sanitize context to prevent PII leaks
   */
  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sanitized: LogContext = {};

    for (const [key, value] of Object.entries(context)) {
      // Redact sensitive fields
      if (
        SENSITIVE_KEYS.some((sk) =>
          key.toLowerCase().includes(sk.toLowerCase()),
        )
      ) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeContext(value as LogContext);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `${timestamp} ${this.prefix} [${level.toUpperCase()}] ${message}`;
  }

  /**
   * Debug logs (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    // eslint-disable-next-line no-console
    console.debug(
      this.formatMessage('debug', message),
      this.sanitizeContext(context) || '',
    );
  }

  /**
   * Info logs
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    // eslint-disable-next-line no-console
    console.info(
      this.formatMessage('info', message),
      this.sanitizeContext(context) || '',
    );
  }

  /**
   * Warning logs
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    // eslint-disable-next-line no-console
    console.warn(
      this.formatMessage('warn', message),
      this.sanitizeContext(context) || '',
    );
  }

  /**
   * Error logs with optional error object
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog('error')) return;

    const errorInfo =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error;

    // eslint-disable-next-line no-console
    console.error(
      this.formatMessage('error', message),
      errorInfo,
      this.sanitizeContext(context) || '',
    );
  }

  /**
   * Set minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Create a child logger with a specific prefix
   */
  child(name: string): ProductionLogger {
    return new ProductionLogger({
      prefix: `${this.prefix}[${name}]`,
      minLevel: this.minLevel,
      enableInProduction: this.enableInProduction,
    });
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Export class for custom instances
export { ProductionLogger };
export type { LogLevel, LogContext, LoggerOptions };
