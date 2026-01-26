/**
 * Higher-Order Component for wrapping screens with ErrorBoundary
 *
 * Usage:
 * export default withErrorBoundary(MyScreen, { fallbackType: 'network' });
 *
 * With custom fallback:
 * export default withErrorBoundary(MyScreen, {
 *   fallback: (error, retry) => <MyCustomFallback error={error} onRetry={retry} />
 * });
 */

import React, { ReactNode } from 'react';
import type { NavigationProp } from '@react-navigation/native';
import {
  ScreenErrorBoundary,
  ErrorBoundary,
  type ErrorFallbackType,
} from './ErrorBoundary';

interface WithErrorBoundaryOptions {
  fallbackType?: ErrorFallbackType;
  displayName?: string;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

/** Props that may include navigation */
interface MaybeNavigationProps {
  navigation?: NavigationProp<ReactNavigation.RootParamList>;
}

/**
 * HOC to wrap a component with ScreenErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {},
): React.FC<P> {
  const { fallbackType, displayName, fallback } = options;

  const WrappedComponent: React.FC<P> = (props: P) => {
    // Extract navigation from props if available
    const navigation = (props as P & MaybeNavigationProps).navigation;

    if (fallback) {
      return (
        <ErrorBoundary
          level="screen"
          fallback={(error, resetError) => fallback(error, resetError)}
          navigation={navigation}
        >
          <Component {...props} />
        </ErrorBoundary>
      );
    }

    return (
      <ScreenErrorBoundary fallbackType={fallbackType} navigation={navigation}>
        <Component {...props} />
      </ScreenErrorBoundary>
    );
  };

  // Set display name for debugging
  const componentName =
    displayName || Component.displayName || Component.name || 'Component';
  WrappedComponent.displayName = `withErrorBoundary(${componentName})`;

  return WrappedComponent;
}

/**
 * Convenience functions for specific error types
 */
export const withNetworkErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
) => withErrorBoundary(Component, { fallbackType: 'network' });

export const withGenericErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
) => withErrorBoundary(Component, { fallbackType: 'generic' });

export const withCriticalErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
) => withErrorBoundary(Component, { fallbackType: 'critical' });
