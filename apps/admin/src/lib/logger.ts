/**
 * Production-Safe Logger for Admin Panel
 *
 * Replaces console.* calls with structured logging that:
 * - Filters debug logs in production
 * - Sanitizes sensitive data
 * - Provides consistent log format
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const SENSITIVE_KEYS = [
  'password',
  'token',
  'apikey',
  'secret',
  'authorization',
  'bearer',
  'session',
  'cookie',
  'credit_card',
  'cvv',
  'private_key',
  'access_token',
  'refresh_token',
  'client_secret',
  'tc_kimlik',
  'tckn',
];

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class AdminLogger {
  private prefix: string;
  private minLevel: LogLevel;

  constructor(prefix = '[Admin]') {
    this.prefix = prefix;
    this.minLevel = 'debug';
  }

  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private shouldLog(level: LogLevel): boolean {
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.minLevel]) {
      return false;
    }
    // In production, only log warnings and errors
    if (this.isProduction()) {
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;
    const sanitized: LogContext = {};

    for (const [key, value] of Object.entries(context)) {
      if (
        SENSITIVE_KEYS.some((sk) =>
          key.toLowerCase().includes(sk.toLowerCase()),
        )
      ) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
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

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    // eslint-disable-next-line no-console
    console.debug(
      this.formatMessage('debug', message),
      this.sanitizeContext(context) || '',
    );
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    // eslint-disable-next-line no-console
    console.info(
      this.formatMessage('info', message),
      this.sanitizeContext(context) || '',
    );
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    // eslint-disable-next-line no-console
    console.warn(
      this.formatMessage('warn', message),
      this.sanitizeContext(context) || '',
    );
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    const errorInfo =
      error instanceof Error
        ? { name: error.name, message: error.message }
        : error;
    // eslint-disable-next-line no-console
    console.error(
      this.formatMessage('error', message),
      errorInfo,
      this.sanitizeContext(context) || '',
    );
  }

  child(name: string): AdminLogger {
    return new AdminLogger(`${this.prefix}[${name}]`);
  }
}

export const logger = new AdminLogger();
export { AdminLogger };
