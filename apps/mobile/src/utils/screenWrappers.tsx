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
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return withErrorBoundary(Component, {
    fallback: (error, retry) => (
      <GenericErrorScreen
        error={error}
        onRetry={retry}
        title="Bir hata oluştu"
        message="Giriş ekranında bir sorun oluştu. Lütfen tekrar deneyin."
      />
    ),
    level: 'screen',
  });
}

/**
 * Wrap a component with error boundary for payment screens
 */
export function withPaymentErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return withErrorBoundary(Component, {
    fallback: (error, retry) => (
      <GenericErrorScreen
        error={error}
        onRetry={retry}
        title="Ödeme Hatası"
        message="Ödeme işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin."
      />
    ),
    level: 'screen',
  });
}

/**
 * Wrap a component with error boundary for messages screens
 */
export function withMessagesErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return withErrorBoundary(Component, {
    fallback: (error, retry) => (
      <GenericErrorScreen
        error={error}
        onRetry={retry}
        title="Mesajlaşma Hatası"
        message="Mesajlaşma sırasında bir sorun oluştu. Lütfen tekrar deneyin."
      />
    ),
    level: 'screen',
  });
}

/**
 * Wrap a component with error boundary for discover screens
 */
export function withDiscoverErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return withErrorBoundary(Component, {
    fallback: (error, retry) => (
      <GenericErrorScreen
        error={error}
        onRetry={retry}
        title="Keşif Hatası"
        message="Keşif sayfasında bir sorun oluştu. Lütfen tekrar deneyin."
      />
    ),
    level: 'screen',
  });
}

// Export list of wrapped screens for easy auditing
export const WRAPPED_SCREENS = {
  auth: 'withAuthErrorBoundary',
  payments: 'withPaymentErrorBoundary',
  messages: 'withMessagesErrorBoundary',
  discover: 'withDiscoverErrorBoundary',
};
