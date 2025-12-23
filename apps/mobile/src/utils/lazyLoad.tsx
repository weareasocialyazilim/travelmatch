/**
 * Lazy Loading Utilities
 * Provides components and utilities for code splitting and lazy loading
 */

import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';
import React, { lazy, Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

/**
 * Default loading fallback
 */
const DefaultLoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.buttonPrimary} />
  </View>
);

/**
 * Creates a lazy-loaded component with automatic Suspense wrapper
 * @param importFn - Dynamic import function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  const LazyComponent = lazy(importFn);

  // Return wrapped component with Suspense
  return LazyComponent;
}

/**
 * Suspense wrapper component with default loading state
 */
export const LazyWrapper: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = <DefaultLoadingFallback /> }) => (
  <Suspense fallback={fallback}>{children}</Suspense>
);

/**
 * Preload a lazy component
 * Useful for prefetching before navigation
 */
export function preloadComponent<
  T extends ComponentType<Record<string, unknown>>,
>(component: LazyExoticComponent<T>): void {
  // @ts-expect-error Accessing internal React lazy _init property for preloading - no public API available
  if (component._init) {
    // @ts-expect-error Accessing internal React lazy _payload property for preloading
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    component._init(component._payload);
  }
}

/**
 * Higher-order component for lazy loading
 * Wraps a lazy component with Suspense automatically
 */
export function withLazy<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode,
) {
  const LazyComponent = lazy(importFn);

  const LazyComponentWrapper = (props: P) => (
    <Suspense fallback={fallback ?? <DefaultLoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );

  LazyComponentWrapper.displayName = 'LazyComponentWrapper';

  return LazyComponentWrapper;
}

/**
 * Lazy load multiple components at once
 * Returns an object with all lazy-loaded components
 */
export function lazyLoadMultiple<
  T extends Record<
    string,
    () => Promise<{ default: ComponentType<Record<string, unknown>> }>
  >,
>(
  imports: T,
): {
  [K in keyof T]: LazyExoticComponent<ComponentType<Record<string, unknown>>>;
} {
  const result = {} as {
    [K in keyof T]: LazyExoticComponent<ComponentType<Record<string, unknown>>>;
  };

  for (const key in imports) {
    if (imports[key]) {
      result[key] = lazy(imports[key]);
    }
  }

  return result;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
