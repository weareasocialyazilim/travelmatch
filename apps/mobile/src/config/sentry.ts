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
// SECURITY: DSN must be set via environment variable, no hardcoded fallback
const SENTRY_DSN =
  (Constants.expoConfig?.extra?.sentryDsn as string | undefined) ||
  process.env.EXPO_PUBLIC_SENTRY_DSN ||
  '';

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

  // Skip if DSN is not configured
  if (!SENTRY_DSN) {
    logger.warn(
      'Sentry',
      'Sentry DSN not configured. Set EXPO_PUBLIC_SENTRY_DSN environment variable.',
    );
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      debug: false,
      environment: isDev ? 'development' : 'production',

      // Adds more context data to events
      sendDefaultPii: false, // CHANGED: Never send PII automatically - we manually set safe user context

      // Enable Logs
      enableLogs: true,

      // Performance Monitoring
      // IMPORTANT: Set to 1.0 for critical screens (Wallet, Discover, Chat)
      // Lower to 0.1-0.2 for less critical flows
      tracesSampleRate: 1.0, // CHANGED: 100% sampling for production launch, reduce after baseline established

      // Configure Session Replay - only in production
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0, // Always capture replay when error occurs

      // Enable offline caching
      enableNativeCrashHandling: true,
      enableAutoSessionTracking: true,
      enableAutoPerformanceTracing: true, // ADDED: Auto-track navigation and screen load times

      // Integrations - add safely in production only
      integrations: [
        Sentry.mobileReplayIntegration(),
        Sentry.feedbackIntegration(),
        // ADDED: Track app start performance
        Sentry.reactNativeTracingIntegration({
          routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
          enableUserInteractionTracing: true, // Track button presses, gestures
          enableNativeFramesTracking: true, // Track slow/frozen frames
        }),
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
 * IMPORTANT: Call this on login/session restore
 */
export function setSentryUser(user: {
  id: string;
  username?: string;
  kycStatus?: string;
  accountType?: string;
}) {
  Sentry.setUser({
    id: user.id,
    username: user.username || `user_${user.id.substring(0, 8)}`,
    // IMPORTANT: DO NOT include email, phone, or other PII
  });

  // Add context for analytics
  Sentry.setTag('user_kyc_status', user.kycStatus || 'unknown');
  Sentry.setTag('account_type', user.accountType || 'standard');
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

// ============================================
// Payment Error Tracking (PayTR Integration)
// ============================================

export type PaymentErrorType =
  | 'PAYTR_TIMEOUT'
  | 'PAYTR_DECLINED'
  | 'PAYTR_NETWORK_ERROR'
  | 'PAYTR_INVALID_RESPONSE'
  | 'ESCROW_FAILURE'
  | 'GIFT_OFFER_FAILURE'
  | 'REFUND_FAILURE';

/**
 * Log payment error with detailed breadcrumb for PayTR tracking
 * Master tracking for all payment-related errors
 */
export function logPaymentError(
  errorType: PaymentErrorType,
  details: {
    transactionId?: string;
    amount?: number;
    currency?: string;
    errorMessage?: string;
    errorCode?: string;
    momentId?: string;
    giftId?: string;
  },
) {
  // Add payment-specific breadcrumb
  addBreadcrumb(`Payment Error: ${errorType}`, 'payment', 'error', {
    error_type: errorType,
    transaction_id: details.transactionId,
    amount: details.amount,
    currency: details.currency,
    error_message: details.errorMessage,
    error_code: details.errorCode,
    moment_id: details.momentId,
    gift_id: details.giftId,
    timestamp: new Date().toISOString(),
  });

  // Set payment context for this session
  Sentry.withScope((scope) => {
    scope.setTag('transaction_type', 'payment');
    scope.setTag('payment_error_type', errorType);
    scope.setTag('payment_provider', 'paytr');

    if (details.transactionId) {
      scope.setTag('transaction_id', details.transactionId);
    }
    if (details.momentId) {
      scope.setTag('moment_id', details.momentId);
    }
    if (details.giftId) {
      scope.setTag('gift_id', details.giftId);
    }

    scope.setLevel('error');

    Sentry.captureMessage(`PayTR Error: ${errorType}`, 'error');
  });
}

/**
 * Log successful payment for analytics
 */
export function logPaymentSuccess(details: {
  transactionId: string;
  amount: number;
  currency: string;
  momentId?: string;
  giftId?: string;
}) {
  addBreadcrumb('Payment Success', 'payment', 'info', {
    transaction_id: details.transactionId,
    amount: details.amount,
    currency: details.currency,
    moment_id: details.momentId,
    gift_id: details.giftId,
    timestamp: new Date().toISOString(),
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
 * Start performance transaction for critical screens
 * Usage:
 *   const transaction = startPerformanceTransaction('WalletScreen', 'screen.load');
 *   // ... screen load work ...
 *   transaction?.finish();
 */
export function startPerformanceTransaction(
  name: string,
  operation: string,
): ReturnType<typeof Sentry.startInactiveSpan> | undefined {
  if (!isInitialized) return undefined;

  return Sentry.startInactiveSpan({
    name,
    op: operation,
  });
}

/**
 * Measure screen load time
 * Usage:
 *   useEffect(() => {
 *     const end = measureScreenLoad('DiscoverScreen');
 *     return () => end();
 *   }, []);
 */
export function measureScreenLoad(screenName: string) {
  const startTime = Date.now();

  return () => {
    const loadTime = Date.now() - startTime;
    addBreadcrumb(`Screen loaded: ${screenName}`, 'navigation', 'info', {
      load_time_ms: loadTime,
    });

    // Send performance metric
    Sentry.metrics.distribution('screen.load.time', loadTime, {
      tags: { screen: screenName },
      unit: 'millisecond',
    });
  };
}

/**
 * Track critical user action (e.g., payment, booking, withdrawal)
 * Usage: trackCriticalAction('withdrawal_initiated', { amount: 100, currency: 'TRY' });
 */
export function trackCriticalAction(
  action: string,
  metadata?: Record<string, string | number | boolean>,
) {
  addBreadcrumb(`Critical action: ${action}`, 'user', 'info', metadata);

  // Set tag for filtering in Sentry UI
  Sentry.setTag('critical_action', action);
}

/**
 * Start span for performance monitoring
 * Note: Transaction API is deprecated in Sentry v8, using spans instead
 */
export function startTransaction(
  name: string,
  operation: string,
): ReturnType<typeof Sentry.startInactiveSpan> | undefined {
  return startPerformanceTransaction(name, operation);
}

// Export Sentry for advanced usage
export { Sentry };
