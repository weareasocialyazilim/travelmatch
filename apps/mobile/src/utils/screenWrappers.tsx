/**
 * Screen Wrapper Helpers
 *
 * Wraps critical screens with error boundaries for crash prevention.
 * Generated from production readiness audit - P1 fix.
 */

import React from 'react';
import { withErrorBoundary } from '../components/withErrorBoundary';
import { GenericErrorScreen } from '../components/ErrorBoundary';

/**
 * Wrap a component with error boundary for auth screens
 */
export function withAuthErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> {
  return withErrorBoundary(Component, {
    fallback: (error, resetError) => (
      <GenericErrorScreen
        error={error}
        onRetry={resetError}
        title="Bir hata oluştu"
        message="Giriş ekranında bir sorun oluştu. Lütfen tekrar deneyin."
      />
    ),
  });
}

/**
 * Wrap a component with error boundary for payment screens
 */
export function withPaymentErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> {
  return withErrorBoundary(Component, {
    fallback: (error, resetError) => (
      <GenericErrorScreen
        error={error}
        onRetry={resetError}
        title="Ödeme Hatası"
        message="Ödeme işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin."
      />
    ),
  });
}

/**
 * Wrap a component with error boundary for messages screens
 */
export function withMessagesErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> {
  return withErrorBoundary(Component, {
    fallback: (error, resetError) => (
      <GenericErrorScreen
        error={error}
        onRetry={resetError}
        title="Mesajlaşma Hatası"
        message="Mesajlaşma sırasında bir sorun oluştu. Lütfen tekrar deneyin."
      />
    ),
  });
}

/**
 * Wrap a component with error boundary for discover screens
 */
export function withDiscoverErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> {
  return withErrorBoundary(Component, {
    fallback: (error, resetError) => (
      <GenericErrorScreen
        error={error}
        onRetry={resetError}
        title="Keşif Hatası"
        message="Keşif sayfasında bir sorun oluştu. Lütfen tekrar deneyin."
      />
    ),
  });
}

// Export list of wrapped screens for easy auditing
export const WRAPPED_SCREENS = {
  auth: 'withAuthErrorBoundary',
  payments: 'withPaymentErrorBoundary',
  messages: 'withMessagesErrorBoundary',
  discover: 'withDiscoverErrorBoundary',
};
