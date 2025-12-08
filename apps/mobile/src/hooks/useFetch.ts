/**
 * Fetch Hook
 * Generic data fetching hook with loading, error handling, and refetch capability
 * @module hooks/useFetch
 */

import { useState, useEffect, useCallback } from 'react';
import { AppError, getErrorMessage } from '../utils/appErrors';

/**
 * Result returned by useFetch hook
 * @template T - Type of the fetched data
 */
interface UseFetchResult<T> {
  /** Fetched data or null if not yet loaded */
  data: T | null;
  /** Whether a fetch is in progress */
  loading: boolean;
  /** Error that occurred during fetch, or null */
  error: AppError | null;
  /** Function to manually trigger a refetch */
  refetch: () => void;
}

/**
 * Options for useFetch hook
 * @template T - Type of the fetched data
 */
interface UseFetchOptions<T = unknown> {
  /** Skip the initial fetch (useful for conditional fetching) */
  skip?: boolean;
  /** Callback when fetch succeeds */
  onSuccess?: (data: T) => void;
  /** Callback when fetch fails */
  onError?: (error: AppError) => void;
}

/**
 * Hook for fetching data from a URL with automatic loading and error handling
 *
 * @template T - Type of the expected response data
 * @param {string} url - The URL to fetch data from
 * @param {UseFetchOptions<T>} options - Fetch options
 * @returns {UseFetchResult<T>} Fetch result with data, loading, error, and refetch
 *
 * @example
 * ```tsx
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data, loading, error, refetch } = useFetch<User>(
 *     `/api/users/${userId}`,
 *     {
 *       onSuccess: (user) => console.log('Loaded:', user.name),
 *       onError: (err) => console.error('Failed:', err.message),
 *     }
 *   );
 *
 *   if (loading) return <Spinner />;
 *   if (error) return <ErrorView message={error.message} onRetry={refetch} />;
 *   if (!data) return null;
 *
 *   return <Text>{data.name}</Text>;
 * }
 * ```
 */
export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {},
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<AppError | null>(null);

  const fetchData = useCallback(
    async (abortController?: AbortController) => {
      if (options.skip) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          signal: abortController?.signal,
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => ({}))) as {
            message?: string;
          };
          const errorMessage =
            errorData.message ?? `HTTP error! status: ${response.status}`;

          const apiError = new AppError(errorMessage);
          throw apiError;
        }

        const jsonData = (await response.json()) as T;
        setData(jsonData);
        options.onSuccess?.(jsonData);
      } catch (err) {
        // Ignore abort errors, which are expected when a component unmounts during a fetch.
        if ((err as Error).name !== 'AbortError') {
          const appError =
            err instanceof AppError ? err : new AppError(getErrorMessage(err));

          setError(appError);
          options.onError?.(appError);
        }
      } finally {
        setLoading(false);
      }
    },
    [url, options],
  );

  useEffect(() => {
    const abortController = new AbortController();
    void fetchData(abortController);

    return () => {
      abortController.abort();
    };
  }, [url, fetchData]);

  const refetch = () => {
    void fetchData();
  };

  return { data, loading, error, refetch };
}
