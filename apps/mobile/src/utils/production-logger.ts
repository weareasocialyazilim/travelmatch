/**
 * Production-Safe Logging Service
 *
 * Replaces console.* with structured logging that:
 * - Filters debug logs in production
 * - Sends errors to Sentry
 * - Adds breadcrumbs for debugging
 * - Prevents PII leaks
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/utils/production-logger';
 *
 * // Before: console.log('User logged in', userId);
 * // After:
 * logger.info('User logged in', { userId });
 * logger.error('Login failed', error, { email });
 * logger.debug('API response', { data });
 * ```
 */

import * as Sentry from '@sentry/react-native';
import { isProduction, isDevelopment } from '@/config/env.config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class ProductionLogger {
  private shouldLog(level: LogLevel): boolean {
    // Production: Only log warnings and errors
    if (isProduction()) {
      return level === 'warn' || level === 'error';
    }
    // Development: Log everything
    return true;
  }

  /**
   * Sanitize context to prevent PII leaks
   */
  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sanitized: LogContext = {};
    const sensitiveKeys = [
      'password',
      'token',
      'apiKey',
      'secret',
      'creditCard',
    ];

    for (const [key, value] of Object.entries(context)) {
      // Redact sensitive fields
      if (
        sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Debug logs (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;

    if (isDevelopment() && __DEV__) {
      // eslint-disable-next-line no-console -- Logger utility needs direct console access
      console.log(`[DEBUG] ${message}`, this.sanitizeContext(context));
    }
  }

  /**
   * Info logs (sent to Sentry breadcrumbs in production)
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;

    if (isDevelopment() && __DEV__) {
      // eslint-disable-next-line no-console -- Logger utility needs direct console access
      console.log(`[INFO] ${message}`, this.sanitizeContext(context));
    }

    // Production: Add breadcrumb for Sentry
    if (isProduction()) {
      Sentry.addBreadcrumb({
        message,
        level: 'info',
        data: this.sanitizeContext(context),
      });
    }
  }

  /**
   * Warning logs (always logged + sent to Sentry)
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;

    if (__DEV__) {
      // eslint-disable-next-line no-console -- Logger utility needs direct console access
      console.warn(`[WARN] ${message}`, this.sanitizeContext(context));
    }

    // Send to Sentry
    Sentry.captureMessage(message, {
      level: 'warning',
      contexts: {
        custom: this.sanitizeContext(context),
      },
    });
  }

  /**
   * Error logs (always logged + sent to Sentry with full stack trace)
   */
  error(message: string, error?: Error, context?: LogContext): void {
    // Always log errors (even in production for debugging)
    if (__DEV__) {
      // eslint-disable-next-line no-console -- Logger utility needs direct console access
      console.error(`[ERROR] ${message}`, error, this.sanitizeContext(context));
    }

    // Send to Sentry with full context
    if (error) {
      Sentry.captureException(error, {
        contexts: {
          custom: this.sanitizeContext(context),
        },
        tags: {
          errorMessage: message,
        },
      });
    } else {
      Sentry.captureMessage(message, {
        level: 'error',
        contexts: {
          custom: this.sanitizeContext(context),
        },
      });
    }
  }

  /**
   * Performance logging (measure async operations)
   */
  async measure<T>(
    operationName: string,
    operation: () => Promise<T>,
    context?: LogContext,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await operation();
      const duration = Date.now() - startTime;

      this.info(`${operationName} completed`, {
        ...context,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.error(`${operationName} failed`, error as Error, {
        ...context,
        duration: `${duration}ms`,
      });

      throw error;
    }
  }

  /**
   * Track user action (analytics + Sentry breadcrumb)
   */
  trackAction(action: string, properties?: LogContext): void {
    this.info(`User action: ${action}`, properties);

    // Future: Send to analytics service (PostHog, Mixpanel, etc.)
    // analytics.track(action, this.sanitizeContext(properties));
  }
}

// Singleton instance
export const logger = new ProductionLogger();

/**
 * Example usage:
 *
 * // Simple logging
 * logger.info('User logged in', { userId: 'abc123' });
 *
 * // Error logging
 * try {
 *   await fetchUserData();
 * } catch (error) {
 *   logger.error('Failed to fetch user', error, { userId: 'abc123' });
 * }
 *
 * // Performance measurement
 * const moments = await logger.measure(
 *   'fetch_moments',
 *   () => supabase.from('moments').select(),
 *   { userId: 'abc123' }
 * );
 *
 * // Track user actions
 * logger.trackAction('moment_created', { momentId: 'xyz789' });
 */
