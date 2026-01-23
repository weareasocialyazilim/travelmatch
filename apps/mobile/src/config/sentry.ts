/**
 * Sentry Configuration
 *
 * Minimal production crash reporting wrapper around @sentry/react-native.
 * - Uses bootOnce initialization when DSN is present
 * - Guards all calls when Sentry is disabled
 */

import * as Sentry from '@sentry/react-native';
import { logger } from '@/utils/logger';

// ============================================
// STUB TYPES - Match original API signatures
// ============================================

export type SeverityLevel =
  | 'fatal'
  | 'error'
  | 'warning'
  | 'log'
  | 'info'
  | 'debug';

export type PaymentErrorType =
  | 'PAYTR_TIMEOUT'
  | 'PAYTR_DECLINED'
  | 'PAYTR_NETWORK_ERROR'
  | 'PAYTR_INVALID_RESPONSE'
  | 'ESCROW_FAILURE'
  | 'GIFT_OFFER_FAILURE'
  | 'REFUND_FAILURE';

// Stub span type for performance functions
interface StubSpan {
  finish: () => void;
}

// ============================================
// HELPERS
// ============================================

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

const isSentryEnabled = () => Boolean(SENTRY_DSN) && !__DEV__;

const hasClient = () => {
  try {
    return Boolean(Sentry.getClient());
  } catch {
    return false;
  }
};

/**
 * Initialize Sentry (idempotent)
 */
export function initSentry(): void {
  if (!isSentryEnabled()) {
    return;
  }

  if (hasClient()) {
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      enabled: true,
      sendDefaultPii: true,
      enableLogs: true,
    });
    logger.info('Sentry initialized');
  } catch (error) {
    logger.warn('Sentry init failed', error);
  }
}

/**
 * Set user context
 */
export function setSentryUser(_user: {
  id: string;
  username?: string;
  kycStatus?: string;
  accountType?: string;
}): void {
  if (!isSentryEnabled() || !hasClient()) return;

  Sentry.setUser({
    id: _user.id,
    username: _user.username,
    segment: _user.accountType,
    data: {
      kycStatus: _user.kycStatus,
    },
  });
}

/**
 * Clear user context
 */
export function clearSentryUser(): void {
  if (!isSentryEnabled() || !hasClient()) return;
  Sentry.setUser(null);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(
  _message: string,
  _category: string,
  _level: SeverityLevel = 'info',
  _data?: Record<string, unknown>,
): void {
  if (!isSentryEnabled() || !hasClient()) return;
  Sentry.addBreadcrumb({
    message: _message,
    category: _category,
    level: _level,
    data: _data,
  });
}

/**
 * Log payment error
 */
export function logPaymentError(
  _errorType: PaymentErrorType,
  _details: {
    transactionId?: string;
    amount?: number;
    currency?: string;
    errorMessage?: string;
    errorCode?: string;
    momentId?: string;
    giftId?: string;
  },
): void {
  if (!isSentryEnabled() || !hasClient()) return;
  Sentry.withScope((scope) => {
    scope.setTag('payment_error_type', _errorType);
    scope.setContext('payment', _details);
    Sentry.captureMessage('Payment error', 'error');
  });
}

/**
 * Log successful payment
 */
export function logPaymentSuccess(_details: {
  transactionId: string;
  amount: number;
  currency: string;
  momentId?: string;
  giftId?: string;
}): void {
  if (!isSentryEnabled() || !hasClient()) return;
  Sentry.withScope((scope) => {
    scope.setContext('payment', _details);
    Sentry.captureMessage('Payment success', 'info');
  });
}

/**
 * Capture exception
 */
export function captureException(
  _error: Error,
  _context?: Record<string, unknown>,
): void {
  if (isSentryEnabled() && hasClient()) {
    Sentry.withScope((scope) => {
      if (_context) {
        scope.setContext('context', _context);
      }
      Sentry.captureException(_error);
    });
    return;
  }

  if (__DEV__) {
    logger.error('[Sentry] Exception:', _error);
  }
}

/**
 * Capture message
 */
export function captureMessage(
  _message: string,
  _level: SeverityLevel = 'info',
  _context?: Record<string, unknown>,
): void {
  if (!isSentryEnabled() || !hasClient()) return;
  Sentry.withScope((scope) => {
    if (_context) {
      scope.setContext('context', _context);
    }
    Sentry.captureMessage(_message, _level);
  });
}

/**
 * Set tag
 */
export function setTag(_key: string, _value: string): void {
  if (!isSentryEnabled() || !hasClient()) return;
  Sentry.setTag(_key, _value);
}

/**
 * Set tags
 */
export function setTags(_tags: Record<string, string>): void {
  if (!isSentryEnabled() || !hasClient()) return;
  Sentry.setTags(_tags);
}

/**
 * Start performance transaction
 */
export function startPerformanceTransaction(
  _name: string,
  _operation: string,
): StubSpan | undefined {
  if (!isSentryEnabled() || !hasClient()) {
    return { finish: () => {} };
  }

  return Sentry.startSpan(
    {
      name: _name,
      op: _operation,
    },
    (span) => ({
      finish: () => {
        span?.end();
      },
    }),
  );
}

/**
 * Measure screen load time
 */
export function measureScreenLoad(_screenName: string): () => void {
  if (!isSentryEnabled() || !hasClient()) {
    return () => {};
  }

  const span = startPerformanceTransaction(
    `screen_load:${_screenName}`,
    'screen.load',
  );

  return () => span?.finish();
}

/**
 * Track critical user action
 */
export function trackCriticalAction(
  _action: string,
  _metadata?: Record<string, string | number | boolean>,
): void {
  if (!isSentryEnabled() || !hasClient()) return;
  Sentry.addBreadcrumb({
    message: _action,
    category: 'user-action',
    level: 'info',
    data: _metadata,
  });
}

/**
 * Start span for performance monitoring
 */
export function startTransaction(
  _name: string,
  _operation: string,
): StubSpan | undefined {
  return startPerformanceTransaction(_name, _operation);
}

// ============================================
// EXPORTS
// ============================================

export { Sentry };
