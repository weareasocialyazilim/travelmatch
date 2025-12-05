/**
 * useAsync Hook
 * Handles async operations with loading, error, and data states
 * @module hooks/useAsync
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { logger } from '../utils/logger';

/**
 * Async operation state
 */
interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Async hook return type
 */
interface UseAsyncReturn<T, Args extends unknown[]> extends AsyncState<T> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

/**
 * Async hook options
 */
interface UseAsyncOptions<T> {
  /** Initial data value */
  initialData?: T | null;
  /** Execute immediately on mount */
  immediate?: boolean;
  /** Callback on success */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Keep previous data while loading */
  keepPreviousData?: boolean;
}

/**
 * Handle async operations with state management
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, execute } = useAsync(
 *   async (userId: string) => {
 *     const response = await api.getUser(userId);
 *     return response.data;
 *   },
 *   { immediate: false }
 * );
 *
 * useEffect(() => {
 *   execute('user-123');
 * }, [execute]);
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 * return <UserProfile user={data} />;
 * ```
 */
export function useAsync<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {},
): UseAsyncReturn<T, Args> {
  const {
    initialData = null,
    immediate = false,
    onSuccess,
    onError,
    keepPreviousData = false,
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    error: null,
    isLoading: immediate,
    isSuccess: false,
    isError: false,
  });

  const mountedRef = useRef(true);
  const asyncFunctionRef = useRef(asyncFunction);

  // Keep async function ref up to date
  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
  }, [asyncFunction]);

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState((prev) => ({
        ...prev,
        data: keepPreviousData ? prev.data : null,
        error: null,
        isLoading: true,
        isSuccess: false,
        isError: false,
      }));

      try {
        const result = await asyncFunctionRef.current(...args);

        if (mountedRef.current) {
          setState({
            data: result,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          });
          onSuccess?.(result);
        }

        return result;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));

        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            data: keepPreviousData ? prev.data : null,
            error: errorObj,
            isLoading: false,
            isSuccess: false,
            isError: true,
          }));
          onError?.(errorObj);
          logger.error('useAsync error:', errorObj);
        }

        return null;
      }
    },
    [keepPreviousData, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, [initialData]);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({
      ...prev,
      data,
    }));
  }, []);

  // Execute immediately if specified
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

/**
 * useAsyncCallback - Simpler version for callbacks
 *
 * @example
 * ```tsx
 * const [submitForm, { isLoading, error }] = useAsyncCallback(
 *   async (data: FormData) => {
 *     await api.submitForm(data);
 *   }
 * );
 *
 * <Button onPress={() => submitForm(formData)} loading={isLoading} />
 * ```
 */
export function useAsyncCallback<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  deps: unknown[] = [],
): [
  (...args: Args) => Promise<T | null>,
  { isLoading: boolean; error: Error | null; data: T | null },
] {
  const [state, setState] = useState<{
    isLoading: boolean;
    error: Error | null;
    data: T | null;
  }>({
    isLoading: false,
    error: null,
    data: null,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState({ isLoading: true, error: null, data: null });

      try {
        const result = await asyncFunction(...args);

        if (mountedRef.current) {
          setState({ isLoading: false, error: null, data: result });
        }

        return result;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));

        if (mountedRef.current) {
          setState({ isLoading: false, error: errorObj, data: null });
        }

        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );

  return [execute, state];
}

export default useAsync;
