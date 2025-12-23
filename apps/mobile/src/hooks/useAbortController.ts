/**
 * AbortController Hook
 * Provides cancellation support for async operations
 *
 * DEFCON 2.7 FIX: Implements request cancellation to prevent:
 * - Memory leaks from abandoned requests
 * - UI updates after component unmount
 * - Stale data from outdated requests
 */

import { useRef, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';

/**
 * Hook for managing AbortController lifecycle
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { signal, abort, reset, isAborted } = useAbortController();
 *
 *   const fetchData = async () => {
 *     try {
 *       const response = await fetch('/api/data', { signal });
 *       // handle response
 *     } catch (error) {
 *       if (error.name === 'AbortError') {
 *         console.log('Request was cancelled');
 *       }
 *     }
 *   };
 *
 *   // Automatically aborts on unmount
 *   return <Button onPress={fetchData}>Fetch</Button>;
 * }
 * ```
 */
export const useAbortController = () => {
  const controllerRef = useRef<AbortController>(new AbortController());

  // Reset controller (for new requests)
  const reset = useCallback(() => {
    // Abort any pending request first
    if (!controllerRef.current.signal.aborted) {
      controllerRef.current.abort();
    }
    // Create new controller
    controllerRef.current = new AbortController();
    return controllerRef.current;
  }, []);

  // Abort current request
  const abort = useCallback((reason?: string) => {
    if (!controllerRef.current.signal.aborted) {
      logger.debug('[AbortController] Aborting request', { reason });
      controllerRef.current.abort(reason);
    }
  }, []);

  // Check if aborted
  const isAborted = useCallback(() => {
    return controllerRef.current.signal.aborted;
  }, []);

  // Get current signal
  const getSignal = useCallback(() => {
    return controllerRef.current.signal;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!controllerRef.current.signal.aborted) {
        logger.debug('[AbortController] Cleanup - aborting on unmount');
        controllerRef.current.abort('Component unmounted');
      }
    };
  }, []);

  return {
    signal: controllerRef.current.signal,
    controller: controllerRef.current,
    abort,
    reset,
    isAborted,
    getSignal,
  };
};

/**
 * Hook for creating a fetch wrapper with automatic abort support
 *
 * @example
 * ```tsx
 * const { fetchWithAbort, abort, isLoading } = useAbortableFetch();
 *
 * const loadData = async () => {
 *   const data = await fetchWithAbort('/api/data');
 *   // handle data
 * };
 * ```
 */
export const useAbortableFetch = <T>() => {
  const { signal: _signal, abort, reset, isAborted } = useAbortController();
  const loadingRef = useRef(false);

  const fetchWithAbort = useCallback(
    async (url: string, options?: RequestInit): Promise<T | null> => {
      // Reset controller for new request
      const _newController = reset();
      loadingRef.current = true;

      try {
        const response = await fetch(url, {
          ...options,
          signal: _newController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data as T;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          logger.debug('[useAbortableFetch] Request aborted');
          return null;
        }
        throw error;
      } finally {
        loadingRef.current = false;
      }
    },
    [reset],
  );

  return {
    fetchWithAbort,
    abort,
    isAborted,
    isLoading: loadingRef.current,
  };
};

/**
 * Creates a timeout-wrapped promise that can be cancelled
 *
 * @example
 * ```tsx
 * const { withTimeout } = useTimeoutPromise(5000);
 *
 * try {
 *   const result = await withTimeout(someAsyncOperation());
 * } catch (error) {
 *   if (error.message === 'Operation timed out') {
 *     // Handle timeout
 *   }
 * }
 * ```
 */
export const useTimeoutPromise = (defaultTimeout: number = 10000) => {
  const { signal, abort, reset } = useAbortController();

  const withTimeout = useCallback(
    async <T>(
      promise: Promise<T>,
      timeout: number = defaultTimeout,
    ): Promise<T> => {
      const newController = reset();

      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          newController.abort('Timeout');
          reject(new Error('Operation timed out'));
        }, timeout);

        // Clear timeout if signal is aborted
        newController.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
        });
      });

      return Promise.race([promise, timeoutPromise]);
    },
    [reset, defaultTimeout],
  );

  return {
    withTimeout,
    abort,
    signal,
  };
};

export default useAbortController;
