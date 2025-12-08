/**
 * useDebounce Hook
 * Debounces a value with configurable delay
 * @module hooks/useDebounce
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounce a value
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     performSearch(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
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
 * Debounce a callback function
 *
 * @example
 * ```tsx
 * const handleSearch = useDebouncedCallback(
 *   (query: string) => {
 *     api.search(query);
 *   },
 *   300
 * );
 *
 * <TextInput onChangeText={handleSearch} />
 * ```
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );
}

/**
 * Debounce with immediate execution option
 *
 * @example
 * ```tsx
 * const { debouncedValue, isPending, cancel } = useDebounceState(searchTerm, {
 *   delay: 300,
 *   leading: true, // Execute immediately on first call
 * });
 * ```
 */
interface DebounceOptions {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
}

interface DebounceState<T> {
  debouncedValue: T;
  isPending: boolean;
  cancel: () => void;
  flush: () => void;
}

export function useDebounceState<T>(
  value: T,
  options: DebounceOptions,
): DebounceState<T> {
  const { delay, leading = false, trailing = true } = options;

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRef = useRef(true);
  const latestValueRef = useRef(value);

  // Update latest value ref
  latestValueRef.current = value;

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPending(false);
  }, []);

  const flush = useCallback(() => {
    cancel();
    setDebouncedValue(latestValueRef.current);
  }, [cancel]);

  useEffect(() => {
    // Handle leading edge
    if (leading && isFirstRef.current) {
      isFirstRef.current = false;
      setDebouncedValue(value);
      return;
    }

    isFirstRef.current = false;
    setIsPending(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for trailing edge
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        setIsPending(false);
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing]);

  return {
    debouncedValue,
    isPending,
    cancel,
    flush,
  };
}

export default useDebounce;
