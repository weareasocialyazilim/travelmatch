/**
 * Logger Utility
 * Structured logging for edge functions
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogContext {
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

export const logger = {
  debug: (message: string, context?: LogContext) => {
    console.log(
      JSON.stringify({
        level: LogLevel.DEBUG,
        message,
        timestamp: new Date().toISOString(),
        ...context,
      })
    );
  },

  info: (message: string, context?: LogContext) => {
    console.info(
      JSON.stringify({
        level: LogLevel.INFO,
        message,
        timestamp: new Date().toISOString(),
        ...context,
      })
    );
  },

  warn: (message: string, context?: LogContext) => {
    console.warn(
      JSON.stringify({
        level: LogLevel.WARN,
        message,
        timestamp: new Date().toISOString(),
        ...context,
      })
    );
  },

  error: (message: string, error?: Error, context?: LogContext) => {
    console.error(
      JSON.stringify({
        level: LogLevel.ERROR,
        message,
        error: error?.message,
        stack: error?.stack,
        timestamp: new Date().toISOString(),
        ...context,
      })
    );
  },
};
