/**
 * useThrottle Hook
 * Throttles a value or callback to limit execution frequency
 * @module hooks/useThrottle
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Throttle a value
 *
 * @example
 * ```tsx
 * const [scrollY, setScrollY] = useState(0);
 * const throttledScrollY = useThrottle(scrollY, 100);
 *
 * useEffect(() => {
 *   updateParallax(throttledScrollY);
 * }, [throttledScrollY]);
 * ```
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecuted.current;

    if (timeSinceLastExecution >= interval) {
      lastExecuted.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval - timeSinceLastExecution);

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Throttle a callback function
 *
 * @example
 * ```tsx
 * const handleScroll = useThrottledCallback(
 *   (event) => {
 *     trackScrollPosition(event.nativeEvent.contentOffset.y);
 *   },
 *   100
 * );
 *
 * <ScrollView onScroll={handleScroll} />
 * ```
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  interval: number,
): (...args: Parameters<T>) => void {
  const lastExecuted = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const lastArgsRef = useRef<Parameters<T> | null>(null);

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
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastExecution = now - lastExecuted.current;

      lastArgsRef.current = args;

      if (timeSinceLastExecution >= interval) {
        lastExecuted.current = now;
        callbackRef.current(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastExecuted.current = Date.now();
          if (lastArgsRef.current) {
            callbackRef.current(...lastArgsRef.current);
          }
          timeoutRef.current = null;
        }, interval - timeSinceLastExecution);
      }
    },
    [interval],
  );
}

/**
 * Throttle with leading and trailing options
 */
interface ThrottleOptions {
  interval: number;
  leading?: boolean;
  trailing?: boolean;
}

interface ThrottleState<T> {
  throttledValue: T;
  isPending: boolean;
}

export function useThrottleState<T>(
  value: T,
  options: ThrottleOptions,
): ThrottleState<T> {
  const { interval, leading = true, trailing = true } = options;

  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [isPending, setIsPending] = useState(false);
  const lastExecuted = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastValueRef = useRef(value);

  lastValueRef.current = value;

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecuted.current;

    // Leading edge
    if (leading && timeSinceLastExecution >= interval) {
      lastExecuted.current = now;
      setThrottledValue(value);
      setIsPending(false);
      return;
    }

    setIsPending(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Trailing edge
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(lastValueRef.current);
        setIsPending(false);
        timeoutRef.current = null;
      }, interval - timeSinceLastExecution);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, interval, leading, trailing]);

  return {
    throttledValue,
    isPending,
  };
}

export default useThrottle;
