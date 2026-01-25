/**
 * Sentry Configuration - TEMPORARILY DISABLED (STUB)
 *
 * REASON: Sentry v7 is incompatible with React 19.
 * Sentry's monkey-patching of React.Component.prototype fails because
 * React 19 changed internal structures.
 *
 * This file provides no-op stub functions to maintain API compatibility
 * while Sentry is disabled. Re-enable when Sentry v8 supports React 19.
 *
 * TODO: Monitor https://github.com/getsentry/sentry-javascript/issues for React 19 support
 */

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
// NO-OP STUB FUNCTIONS
// ============================================

/**
 * Initialize Sentry - NO-OP STUB
 */
export function initSentry(): void {
  // Sentry disabled - React 19 incompatibility
  console.log('[Sentry] Disabled - React 19 incompatibility');
}

/**
 * Set user context - NO-OP STUB
 */
export function setSentryUser(_user: {
  id: string;
  username?: string;
  kycStatus?: string;
  accountType?: string;
}): void {
  // No-op
}

/**
 * Clear user context - NO-OP STUB
 */
export function clearSentryUser(): void {
  // No-op
}

/**
 * Add breadcrumb - NO-OP STUB
 */
export function addBreadcrumb(
  _message: string,
  _category: string,
  _level: SeverityLevel = 'info',
  _data?: Record<string, unknown>,
): void {
  // No-op
}

/**
 * Log payment error - NO-OP STUB
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
  // No-op
}

/**
 * Log successful payment - NO-OP STUB
 */
export function logPaymentSuccess(_details: {
  transactionId: string;
  amount: number;
  currency: string;
  momentId?: string;
  giftId?: string;
}): void {
  // No-op
}

/**
 * Capture exception - NO-OP STUB
 */
export function captureException(
  _error: Error,
  _context?: Record<string, unknown>,
): void {
  // No-op - but log to console in dev
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.error('[Sentry Stub] Exception:', _error);
  }
}

/**
 * Capture message - NO-OP STUB
 */
export function captureMessage(
  _message: string,
  _level: SeverityLevel = 'info',
  _context?: Record<string, unknown>,
): void {
  // No-op
}

/**
 * Set tag - NO-OP STUB
 */
export function setTag(_key: string, _value: string): void {
  // No-op
}

/**
 * Set tags - NO-OP STUB
 */
export function setTags(_tags: Record<string, string>): void {
  // No-op
}

/**
 * Start performance transaction - NO-OP STUB
 */
export function startPerformanceTransaction(
  _name: string,
  _operation: string,
): StubSpan | undefined {
  return { finish: () => {} };
}

/**
 * Measure screen load time - NO-OP STUB
 */
export function measureScreenLoad(_screenName: string): () => void {
  return () => {};
}

/**
 * Track critical user action - NO-OP STUB
 */
export function trackCriticalAction(
  _action: string,
  _metadata?: Record<string, string | number | boolean>,
): void {
  // No-op
}

/**
 * Start span for performance monitoring - NO-OP STUB
 */
export function startTransaction(
  _name: string,
  _operation: string,
): StubSpan | undefined {
  return { finish: () => {} };
}

// ============================================
// STUB SENTRY OBJECT - For `import * as Sentry`
// ============================================

export const Sentry = {
  init: (_options?: unknown) => {},
  setUser: (_user: unknown) => {},
  setTag: (_key?: string, _value?: string) => {},
  setTags: (_tags?: Record<string, string>) => {},
  setContext: (_name?: string, _context?: unknown) => {},
  addBreadcrumb: (_breadcrumb?: unknown) => {},
  captureException: (_error?: unknown, _context?: unknown) => {},
  captureMessage: (_message?: string, _context?: unknown) => {},
  withScope: (_callback: (scope: unknown) => void) => {},
  startInactiveSpan: (_options?: unknown) => ({ finish: () => {} }),
  metrics: {
    distribution: (_name?: string, _value?: number, _options?: unknown) => {},
  },
  wrap: <T>(component: T): T => component,
};
