/**
 * Logging Utilities for Edge Functions
 * 
 * Structured logging with context, request tracking, and error reporting.
 */

// =============================================================================
// LOG LEVELS
// =============================================================================

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.FATAL]: 4,
};

// =============================================================================
// LOGGER CONFIGURATION
// =============================================================================

interface LoggerConfig {
  minLevel: LogLevel;
  serviceName: string;
  environment: string;
  enableConsole: boolean;
  enableSentry: boolean;
}

const defaultConfig: LoggerConfig = {
  minLevel: Deno.env.get('DENO_ENV') === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  serviceName: 'edge-function',
  environment: Deno.env.get('DENO_ENV') || 'development',
  enableConsole: true,
  enableSentry: Deno.env.get('SENTRY_DSN') !== undefined,
};

// =============================================================================
// LOG CONTEXT
// =============================================================================

interface LogContext {
  requestId?: string;
  userId?: string;
  functionName?: string;
  correlationId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  environment: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  duration?: number;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// LOGGER CLASS
// =============================================================================

export class Logger {
  private config: LoggerConfig;
  private context: LogContext;
  private startTime: number;

  constructor(functionName?: string, config?: Partial<LoggerConfig>) {
    this.config = { ...defaultConfig, ...config };
    this.context = {
      functionName: functionName || 'unknown',
    };
    this.startTime = Date.now();
  }

  /**
   * Set additional context
   */
  setContext(ctx: Partial<LogContext>): this {
    this.context = { ...this.context, ...ctx };
    return this;
  }

  /**
   * Set request context from a Request object
   */
  setRequestContext(request: Request): this {
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
    const userId = request.headers.get('x-user-id') || undefined;
    const correlationId = request.headers.get('x-correlation-id') || requestId;

    return this.setContext({
      requestId,
      userId,
      correlationId,
      method: request.method,
      url: new URL(request.url).pathname,
      userAgent: request.headers.get('User-Agent') || undefined,
    });
  }

  /**
   * Check if level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel];
  }

  /**
   * Format and output log entry
   */
  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.config.serviceName,
      environment: this.config.environment,
      context: this.context,
      duration: Date.now() - this.startTime,
      metadata,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (this.config.enableConsole) {
      const consoleMethod = level === LogLevel.ERROR || level === LogLevel.FATAL ? 'error' :
                           level === LogLevel.WARN ? 'warn' :
                           level === LogLevel.DEBUG ? 'debug' : 'log';
      
      if (this.config.environment === 'development') {
        // Pretty print in development
        console[consoleMethod](`[${entry.level}] ${entry.message}`, {
          context: entry.context,
          metadata: entry.metadata,
          error: entry.error,
        });
      } else {
        // JSON in production for log aggregation
        console[consoleMethod](JSON.stringify(entry));
      }
    }

    // Send to Sentry if enabled and error level
    if (this.config.enableSentry && (level === LogLevel.ERROR || level === LogLevel.FATAL) && error) {
      this.sendToSentry(entry, error);
    }
  }

  /**
   * Send error to Sentry (placeholder - integrate with actual Sentry SDK)
   */
  private sendToSentry(_entry: LogEntry, _error: Error): void {
    // Sentry integration would go here
    // For now, errors are logged to console and can be captured by Supabase logs
  }

  // =============================================================================
  // LOG METHODS
  // =============================================================================

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, metadata, error);
  }

  fatal(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, message, metadata, error);
  }

  // =============================================================================
  // CONVENIENCE METHODS
  // =============================================================================

  /**
   * Log request start
   */
  requestStart(): void {
    this.startTime = Date.now();
    this.info('Request started', {
      method: this.context.method,
      url: this.context.url,
    });
  }

  /**
   * Log request end
   */
  requestEnd(status: number): void {
    const duration = Date.now() - this.startTime;
    this.info('Request completed', {
      status,
      durationMs: duration,
    });
  }

  /**
   * Log database query
   */
  dbQuery(query: string, durationMs: number): void {
    this.debug('Database query executed', {
      query: query.slice(0, 200), // Truncate for safety
      durationMs,
    });
  }

  /**
   * Log external API call
   */
  externalCall(service: string, endpoint: string, status: number, durationMs: number): void {
    this.info('External API call', {
      service,
      endpoint,
      status,
      durationMs,
    });
  }

  /**
   * Log security event
   */
  securityEvent(event: string, details?: Record<string, unknown>): void {
    this.warn(`Security event: ${event}`, {
      securityEvent: true,
      ...details,
    });
  }

  /**
   * Get request duration
   */
  getDuration(): number {
    return Date.now() - this.startTime;
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a logger for an Edge Function
 */
export function createLogger(functionName: string, request?: Request): Logger {
  const logger = new Logger(functionName, {
    serviceName: `edge-${functionName}`,
  });

  if (request) {
    logger.setRequestContext(request);
  }

  return logger;
}

/**
 * Quick log functions for simple cases
 */
export const log = {
  debug: (message: string, metadata?: Record<string, unknown>) => 
    new Logger().debug(message, metadata),
  info: (message: string, metadata?: Record<string, unknown>) => 
    new Logger().info(message, metadata),
  warn: (message: string, metadata?: Record<string, unknown>) => 
    new Logger().warn(message, metadata),
  error: (message: string, error?: Error, metadata?: Record<string, unknown>) => 
    new Logger().error(message, error, metadata),
};
