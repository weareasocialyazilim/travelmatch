/**
 * Performance Optimization Utilities
 *
 * Collection of hooks and utilities for optimizing React Native performance.
 * These utilities help prevent unnecessary re-renders and improve app responsiveness.
 *
 * @module utils/performanceOptimization
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import type { DependencyList } from 'react';

/**
 * Creates a stable callback reference that always calls the latest version
 * Useful when you need a stable reference for event handlers but also need access to current state/props
 *
 * @param callback The callback function to stabilize
 * @returns A stable callback reference
 *
 * @example
 * const handleSubmit = useStableCallback(() => {
 *   // Always has access to latest formData
 *   submitForm(formData);
 * });
 */
export function useStableCallback<T extends (...args: never[]) => unknown>(
  callback: T,
): T {
  const callbackRef = useRef<T>(callback);

  // Update the ref on each render to always have the latest callback
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Return a stable callback that calls the current ref
  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    [],
  );
}

/**
 * Returns the previous value of a variable
 * Useful for comparing previous and current values to determine if a re-render is necessary
 *
 * @param value The value to track
 * @returns The previous value
 *
 * @example
 * const prevCount = usePrevious(count);
 * if (prevCount !== count) {
 *   // count changed
 * }
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/**
 * Debounces a value, only updating after the specified delay
 * Useful for search inputs and other high-frequency updates
 *
 * @param value The value to debounce
 * @param delay The debounce delay in milliseconds
 * @returns The debounced value
 *
 * @example
 * const debouncedSearch = useDebounceValue(searchTerm, 300);
 * useEffect(() => {
 *   performSearch(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Creates a debounced callback function
 * Useful for handlers that shouldn't fire too frequently
 *
 * @param callback The callback to debounce
 * @param delay The debounce delay in milliseconds
 * @returns The debounced callback
 *
 * @example
 * const debouncedSearch = useDebounceCallback((term: string) => {
 *   performSearch(term);
 * }, 300);
 */
export function useDebounceCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef<T>(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay],
  );
}

/**
 * Throttles a callback to fire at most once per delay period
 * Useful for scroll handlers and other continuous events
 *
 * @param callback The callback to throttle
 * @param delay The throttle delay in milliseconds
 * @returns The throttled callback
 *
 * @example
 * const throttledScroll = useThrottleCallback((event) => {
 *   handleScroll(event);
 * }, 100);
 */
export function useThrottleCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
): T {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef<T>(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= delay) {
        lastRunRef.current = now;
        callbackRef.current(...args);
      } else {
        // Schedule for when delay expires
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          callbackRef.current(...args);
        }, delay - timeSinceLastRun);
      }
    }) as T,
    [delay],
  );
}

/**
 * Creates a memoized callback that only changes when dependencies change
 * Wrapper around useCallback with better TypeScript support
 *
 * @param callback The callback function
 * @param deps Dependencies array
 * @returns Memoized callback
 */
export function useMemoizedCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  deps: DependencyList,
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps);
}

/**
 * Creates a memoized value with shallow comparison of dependencies
 * Useful when dependencies are objects that may have the same content but different references
 *
 * @param factory Factory function that creates the value
 * @param deps Dependencies to compare
 * @returns Memoized value
 */
export function useShallowMemo<T>(factory: () => T, deps: DependencyList): T {
  const prevDepsRef = useRef<DependencyList | undefined>(undefined);
  const valueRef = useRef<T | undefined>(undefined);

  const depsChanged =
    !prevDepsRef.current || !shallowEqual(prevDepsRef.current, deps);

  if (depsChanged) {
    valueRef.current = factory();
    prevDepsRef.current = deps;
  }

  return valueRef.current as T;
}

/**
 * Shallow comparison of two values
 * Useful for comparing objects and arrays
 */
function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => val === b[i]);
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => aObj[key] === bObj[key]);
  }

  return false;
}

/**
 * Runs an effect only after the component has mounted
 * Skips the first render, useful for effects that should only run on updates
 *
 * @param effect The effect function
 * @param deps Dependencies array
 *
 * @example
 * useUpdateEffect(() => {
 *   // This only runs when count changes, not on mount
 *   console.log('count updated:', count);
 * }, [count]);
 */
export function useUpdateEffect(
  effect: () => void | (() => void),
  deps: DependencyList,
): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Creates a ref that is always up-to-date with the latest value
 * Useful for accessing current values in callbacks without adding dependencies
 *
 * @param value The value to track
 * @returns A ref that always contains the latest value
 *
 * @example
 * const latestValue = useLatest(someValue);
 * const handleClick = useCallback(() => {
 *   console.log(latestValue.current); // Always current, no stale closure
 * }, []); // No need to add someValue to deps
 */
export function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/**
 * Calculates estimated item size for FlashList based on screen dimensions
 * Provides consistent sizing across different device sizes
 *
 * @param variant The type of item (card, grid, list)
 * @param baseHeight The base height for the item
 * @returns Calculated estimated item size
 */
export function calculateEstimatedItemSize(
  variant: 'card' | 'grid' | 'list',
  baseHeight: number,
): number {
  switch (variant) {
    case 'card':
      return baseHeight; // Full width cards
    case 'grid':
      return baseHeight * 0.6; // Grid items are typically shorter
    case 'list':
      return baseHeight * 0.4; // List items are compact
    default:
      return baseHeight;
  }
}

/**
 * FlatList/FlashList performance configuration for different scenarios
 */
export const LIST_PERFORMANCE_CONFIG = {
  // For lists with many items (100+)
  largeList: {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    windowSize: 5,
    initialNumToRender: 10,
    updateCellsBatchingPeriod: 50,
  },
  // For lists with moderate items (20-100)
  mediumList: {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 15,
    windowSize: 7,
    initialNumToRender: 15,
    updateCellsBatchingPeriod: 30,
  },
  // For small lists (<20)
  smallList: {
    removeClippedSubviews: false,
    maxToRenderPerBatch: 20,
    windowSize: 21,
    initialNumToRender: 20,
    updateCellsBatchingPeriod: 10,
  },
} as const;

/**
 * Creates an optimized keyExtractor for FlatList/FlashList
 * Handles common patterns for generating stable keys
 *
 * @param idField The field to use as the key (default: 'id')
 * @returns A keyExtractor function
 */
export function createKeyExtractor<T extends Record<string, unknown>>(
  idField: keyof T = 'id' as keyof T,
): (item: T, index: number) => string {
  return (item: T, index: number): string => {
    const id = item[idField];
    if (id !== undefined && id !== null) {
      return String(id);
    }
    return String(index);
  };
}

/**
 * Hook for tracking component render count (development only)
 * Useful for identifying unnecessary re-renders
 *
 * @param componentName Name of the component for logging
 */
export function useRenderCount(componentName: string): void {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    if (__DEV__) {
      console.log(`[Render] ${componentName}: ${renderCount.current}`);
    }
  });
}

/**
 * Hook for tracking why a component re-rendered (development only)
 * Logs which props/state changed between renders
 *
 * @param componentName Name of the component
 * @param props Props object to track
 */
export function useWhyDidUpdate(
  componentName: string,
  props: Record<string, unknown>,
): void {
  const prevProps = useRef<Record<string, unknown> | undefined>(undefined);

  useEffect(() => {
    if (!__DEV__) return;

    if (prevProps.current) {
      const allKeys = Object.keys({ ...prevProps.current, ...props });
      const changedProps: Record<string, { from: unknown; to: unknown }> = {};

      allKeys.forEach((key) => {
        if (prevProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: prevProps.current![key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log(`[Why Update] ${componentName}:`, changedProps);
      }
    }

    prevProps.current = props;
  });
}
