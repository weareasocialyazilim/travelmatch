/**
 * Sentry Configuration - Lazy Loaded
 * Error tracking and performance monitoring
 *
 * OPTIMIZATION: This module is lazy loaded to reduce initial bundle size by ~68MB.
 * Sentry is initialized after first render via dynamic import in App.tsx.
 */

import { Platform as _Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';
import { logger } from '../utils/logger';

// Handle __DEV__ being undefined in test environments
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

// Sentry DSN from environment variables (configured in EAS)
const SENTRY_DSN =
  (Constants.expoConfig?.extra?.sentryDsn as string | undefined) ||
  process.env.EXPO_PUBLIC_SENTRY_DSN ||
  'https://4e851e74a8a6ecab750e2f4a8933e6c8@o4510544957800448.ingest.de.sentry.io/4510550169354320';

// Track if Sentry has been initialized
let isInitialized = false;

/**
 * Initialize Sentry - Call this after JSI runtime is ready (inside useEffect)
 */
export function initSentry() {
  if (isInitialized) {
    logger.debug('Sentry already initialized');
    return;
  }

  // Skip initialization in development to avoid JSI issues
  if (isDev) {
    logger.debug('Sentry disabled in development');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      debug: false,
      environment: 'production',

      // Adds more context data to events
      sendDefaultPii: true,

      // Enable Logs
      enableLogs: true,

      // Performance Monitoring
      tracesSampleRate: 0.2,

      // Configure Session Replay - only in production
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1,

      // Enable offline caching
      enableNativeCrashHandling: true,
      enableAutoSessionTracking: true,

      // Integrations - add safely in production only
      integrations: [
        Sentry.mobileReplayIntegration(),
        Sentry.feedbackIntegration(),
      ],

      // Filter sensitive data - PRIVACY PROTECTION
      beforeSend(event) {
        // Remove PII from user context
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
          // Keep only non-sensitive identifiers
          event.user.username = String(
            event.user.username || event.user.id || 'anonymous',
          );
        }

        // Remove sensitive request data
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }

        // Remove sensitive data from extra context
        if (event.extra) {
          delete event.extra.phone;
          delete event.extra.password;
          delete event.extra.token;
          delete event.extra.creditCard;
          delete event.extra.apiKey;
        }

        // Filter breadcrumbs for sensitive data
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
            if (breadcrumb.data) {
              delete breadcrumb.data.password;
              delete breadcrumb.data.token;
              delete breadcrumb.data.email;
              delete breadcrumb.data.phone;
              delete breadcrumb.data.creditCard;
            }
            return breadcrumb;
          });
        }

        return event;
      },

      // Ignore specific errors
      ignoreErrors: ['Network request failed', 'NetworkError', 'AbortError'],
    });

    isInitialized = true;
    logger.info('Sentry', 'Sentry initialized successfully');
  } catch (error) {
    logger.error('Sentry', 'Failed to initialize Sentry', error);
  }
}

/**
 * Set user context (NO PII - only non-sensitive identifiers)
 */
export function setSentryUser(user: { id: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    username: user.username || `user_${user.id}`,
    // IMPORTANT: DO NOT include email, phone, or other PII
  });
}

/**
 * Clear user context (on logout)
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging (filters sensitive data)
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, unknown>,
) {
  // Filter sensitive data from breadcrumb
  const filteredData = data ? { ...data } : undefined;
  if (filteredData) {
    delete filteredData.password;
    delete filteredData.token;
    delete filteredData.email;
    delete filteredData.phone;
    delete filteredData.creditCard;
  }

  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data: filteredData,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Capture exception (filters sensitive context)
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>,
) {
  if (context) {
    // Filter sensitive data from context
    const filteredContext = { ...context };
    delete filteredContext.password;
    delete filteredContext.token;
    delete filteredContext.email;
    delete filteredContext.phone;
    delete filteredContext.creditCard;

    Sentry.setContext('additional_info', filteredContext);
  }
  Sentry.captureException(error);
}

/**
 * Capture message (filters sensitive context)
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>,
) {
  if (context) {
    // Filter sensitive data from context
    const filteredContext = { ...context };
    delete filteredContext.password;
    delete filteredContext.token;
    delete filteredContext.email;
    delete filteredContext.phone;
    delete filteredContext.creditCard;

    Sentry.setContext('additional_info', filteredContext);
  }
  Sentry.captureMessage(message, level);
}

/**
 * Set tag for filtering
 */
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * Set tags
 */
export function setTags(tags: Record<string, string>) {
  Sentry.setTags(tags);
}

/**
 * Start span for performance monitoring
 * Note: Transaction API is deprecated in Sentry v8, using spans instead
 */
export function startTransaction(
  name: string,
  operation: string,
): ReturnType<typeof Sentry.startInactiveSpan> | undefined {
  return Sentry.startInactiveSpan({
    name,
    op: operation,
  });
}

// Export Sentry for advanced usage
export { Sentry };
