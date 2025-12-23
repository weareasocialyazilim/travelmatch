/**
 * Unified Logging Service
 * Centralized logging with analytics and error tracking integration
 * @module services/loggingService
 *
 * @description
 * Provides a unified interface for:
 * - Screen navigation tracking
 * - User action tracking
 * - Error tracking with full context
 * - Performance metrics
 * - Integration with Sentry and Analytics
 *
 * @example
 * ```typescript
 * import { loggingService } from '@/services/loggingService';
 *
 * // Track screen view
 * loggingService.trackScreen('HomeScreen', { userId: '123' });
 *
 * // Track user action
 * loggingService.trackAction('button_press', { button: 'submit' });
 *
 * // Track error
 * loggingService.trackError(error, { screen: 'PaymentScreen' });
 *
 * // Track performance
 * loggingService.trackPerformance('api_call', 250, { endpoint: '/users' });
 * ```
 */

import {
  addBreadcrumb,
  captureException,
  captureMessage,
  setTag,
} from '../config/sentry';
import { logger, Logger } from '../utils/logger';

/**
 * Screen tracking options
 */
interface ScreenTrackingOptions {
  /** Screen name */
  screenName: string;
  /** Optional screen parameters */
  params?: Record<string, unknown>;
  /** Previous screen name */
  previousScreen?: string;
  /** Screen load time in ms */
  loadTime?: number;
}

/**
 * Action tracking options
 */
interface ActionTrackingOptions {
  /** Action category */
  category?: 'navigation' | 'interaction' | 'form' | 'gesture' | 'system';
  /** Additional context */
  context?: Record<string, unknown>;
  /** Duration of the action in ms */
  duration?: number;
}

/**
 * Error tracking options
 */
interface ErrorTrackingOptions {
  /** Error severity */
  severity?: 'fatal' | 'error' | 'warning' | 'info';
  /** Additional context */
  context?: Record<string, unknown>;
  /** Screen where error occurred */
  screen?: string;
  /** User action that caused error */
  userAction?: string;
  /** Whether to show user notification */
  showNotification?: boolean;
}

/**
 * Performance tracking options
 */
interface PerformanceTrackingOptions {
  /** Operation type */
  operation: 'api_call' | 'render' | 'navigation' | 'storage' | 'computation';
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Whether this is a slow operation */
  isSlow?: boolean;
  /** Threshold for slow operation warning (ms) */
  slowThreshold?: number;
}

// Create specialized loggers
const screenLogger = new Logger({ prefix: '[Screen]' });
const actionLogger = new Logger({ prefix: '[Action]' });
const errorLogger = new Logger({ prefix: '[Error]', enableInProduction: true });
const perfLogger = new Logger({ prefix: '[Perf]' });

/**
 * Unified Logging Service
 */
class LoggingService {
  private currentScreen = '';
  private screenHistory: string[] = [];
  private sessionId = '';

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track screen navigation
   */
  trackScreen(
    options: ScreenTrackingOptions | string,
    params?: Record<string, unknown>,
  ): void {
    const opts: ScreenTrackingOptions =
      typeof options === 'string' ? { screenName: options, params } : options;

    const { screenName, params: screenParams, loadTime } = opts;
    const previousScreen = this.currentScreen;

    // Update screen history
    if (this.currentScreen) {
      this.screenHistory.push(this.currentScreen);
      if (this.screenHistory.length > 10) {
        this.screenHistory.shift();
      }
    }
    this.currentScreen = screenName;

    // Log locally
    screenLogger.info(
      `Navigation: ${previousScreen || 'App'} → ${screenName}`,
      {
        params: screenParams,
        loadTime,
      },
    );

    // Add Sentry breadcrumb
    addBreadcrumb(`Screen: ${screenName}`, 'navigation', 'info', {
      previousScreen,
      params: screenParams,
      loadTime,
    });

    // Warn about slow screen loads
    if (loadTime && loadTime > 3000) {
      this.trackPerformance('screen_load', loadTime, {
        operation: 'render',
        metadata: { screenName },
        isSlow: true,
        slowThreshold: 3000,
      });
    }
  }

  /**
   * Track user action
   */
  trackAction(
    action: string,
    options?: ActionTrackingOptions | Record<string, unknown>,
  ): void {
    const opts: ActionTrackingOptions =
      options && 'category' in options
        ? options
        : { context: options as Record<string, unknown> };

    const { category = 'interaction', context, duration } = opts;

    // Log locally
    actionLogger.debug(`${category}: ${action}`, {
      screen: this.currentScreen,
      ...context,
      duration,
    });

    // Add Sentry breadcrumb
    addBreadcrumb(`Action: ${action}`, 'user', 'info', {
      category,
      screen: this.currentScreen,
      ...context,
    });
  }

  /**
   * Track error with full context
   */
  trackError(
    error: Error | unknown,
    options?: ErrorTrackingOptions | Record<string, unknown>,
  ): void {
    const opts: ErrorTrackingOptions =
      options && 'severity' in options
        ? options
        : { context: options as Record<string, unknown> };

    const {
      severity = 'error',
      context,
      screen = this.currentScreen,
      userAction,
    } = opts;

    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorContext = {
      screen,
      userAction,
      sessionId: this.sessionId,
      screenHistory: this.screenHistory.slice(-5),
      ...context,
    };

    // Log locally (always log errors)
    errorLogger.error(errorObj.message, errorObj, errorContext);

    // Capture in Sentry
    captureException(errorObj, errorContext);

    // Set error tag for filtering
    setTag('last_error_screen', screen);
    setTag('error_severity', severity);
  }

  /**
   * Track warning (non-fatal issue)
   */
  trackWarning(message: string, context?: Record<string, unknown>): void {
    logger.warn(message, context);

    addBreadcrumb(message, 'warning', 'warning', {
      screen: this.currentScreen,
      ...context,
    });

    captureMessage(message, 'warning', {
      screen: this.currentScreen,
      ...context,
    });
  }

  /**
   * Track performance metric
   */
  trackPerformance(
    name: string,
    durationMs: number,
    options?:
      | PerformanceTrackingOptions
      | { operation: string; metadata?: Record<string, unknown> },
  ): void {
    const opts: PerformanceTrackingOptions = {
      operation: 'computation',
      slowThreshold: 1000,
      ...options,
    } as PerformanceTrackingOptions;

    const { operation, metadata, slowThreshold } = opts;
    const isSlow = durationMs > (slowThreshold || 1000);

    // Log locally
    const logMessage = `${name}: ${durationMs}ms${isSlow ? ' (SLOW)' : ''}`;
    if (isSlow) {
      perfLogger.warn(logMessage, { operation, ...metadata });
    } else {
      perfLogger.debug(logMessage, { operation, ...metadata });
    }

    // Add breadcrumb for significant operations
    if (durationMs > 100) {
      addBreadcrumb(
        `Perf: ${name}`,
        'performance',
        isSlow ? 'warning' : 'info',
        {
          durationMs,
          operation,
          isSlow,
          ...metadata,
        },
      );
    }

    // Report very slow operations to Sentry
    if (durationMs > 5000) {
      captureMessage(
        `Very slow ${operation}: ${name} took ${durationMs}ms`,
        'warning',
        {
          durationMs,
          screen: this.currentScreen,
          ...metadata,
        },
      );
    }
  }

  /**
   * Track API call
   */
  trackApiCall(
    endpoint: string,
    method: string,
    durationMs: number,
    status: number,
    error?: Error,
  ): void {
    const isSuccess = status >= 200 && status < 300;
    const isSlow = durationMs > 2000;

    if (!isSuccess || error) {
      this.trackError(error || new Error(`API Error: ${status}`), {
        context: {
          endpoint,
          method,
          status,
          durationMs,
        },
        severity: status >= 500 ? 'error' : 'warning',
        userAction: `API ${method} ${endpoint}`,
      });
    }

    this.trackPerformance(`API ${method} ${endpoint}`, durationMs, {
      operation: 'api_call',
      metadata: {
        endpoint,
        method,
        status,
        success: isSuccess,
      },
      isSlow,
      slowThreshold: 2000,
    });
  }

  /**
   * Track feature usage
   */
  trackFeature(featureName: string, context?: Record<string, unknown>): void {
    this.trackAction(`feature_${featureName}`, {
      category: 'interaction',
      context: {
        feature: featureName,
        ...context,
      },
    });
  }

  /**
   * Track conversion event
   */
  trackConversion(
    conversionType: string,
    value?: number,
    context?: Record<string, unknown>,
  ): void {
    logger.info(`Conversion: ${conversionType}`, { value, ...context });

    setTag('last_conversion', conversionType);
  }

  /**
   * Get current screen
   */
  getCurrentScreen(): string {
    return this.currentScreen;
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Start new session (call on app foreground)
   */
  startNewSession(): void {
    this.sessionId = this.generateSessionId();
    this.screenHistory = [];
    logger.info('New session started', { sessionId: this.sessionId });
  }

  /**
   * Create contextual logger for a specific component/feature
   */
  createContextLogger(componentName: string) {
    const contextLogger = new Logger({ prefix: `[${componentName}]` });
    return {
      debug: (message: string, data?: Record<string, unknown>) =>
        contextLogger.debug(message, { component: componentName, ...data }),
      info: (message: string, data?: Record<string, unknown>) =>
        contextLogger.info(message, { component: componentName, ...data }),
      warn: (message: string, data?: Record<string, unknown>) =>
        this.trackWarning(`[${componentName}] ${message}`, data),
      error: (error: Error | unknown, context?: Record<string, unknown>) =>
        this.trackError(error, {
          context: { component: componentName, ...context },
        }),
    };
  }
}

// Export singleton instance
export const loggingService = new LoggingService();

// Export class for testing
export { LoggingService };

// Export types
export type {
  ScreenTrackingOptions,
  ActionTrackingOptions,
  ErrorTrackingOptions,
  PerformanceTrackingOptions,
};
