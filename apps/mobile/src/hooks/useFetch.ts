/**
 * Fetch Hook
 * Generic data fetching hook with loading, error handling, offline support, and refetch capability
 * @module hooks/useFetch
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppError, getErrorMessage } from '../utils/appErrors';
import { useNetworkStatus } from '../context/NetworkContext';

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
  /** Whether the device is offline */
  isOffline: boolean;
  /** Whether cached data is being shown while offline */
  isStale: boolean;
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
  /** Cache key for offline support (defaults to URL) */
  cacheKey?: string;
  /** Initial/cached data to use while loading or offline */
  initialData?: T;
  /** Whether to retry when coming back online (default: true) */
  retryOnReconnect?: boolean;
}

// Simple in-memory cache for offline support
const fetchCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook for fetching data from a URL with automatic loading, error handling, and offline support
 *
 * @template T - Type of the expected response data
 * @param {string} url - The URL to fetch data from
 * @param {UseFetchOptions<T>} options - Fetch options
 * @returns {UseFetchResult<T>} Fetch result with data, loading, error, offline status, and refetch
 *
 * @example
 * ```tsx
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data, loading, error, isOffline, isStale, refetch } = useFetch<User>(
 *     `/api/users/${userId}`,
 *     {
 *       onSuccess: (user) => logger.info('Loaded:', user.name),
 *       onError: (err) => logger.error('Failed:', err.message),
 *       retryOnReconnect: true,
 *     }
 *   );
 *
 *   if (loading && !isStale) return <Spinner />;
 *   if (isOffline && !data) return <OfflineView onRetry={refetch} />;
 *   if (error && !isStale) return <ErrorView message={error.message} onRetry={refetch} />;
 *   if (!data) return null;
 *
 *   return (
 *     <>
 *       {isStale && <StaleDataBanner />}
 *       <Text>{data.name}</Text>
 *     </>
 *   );
 * }
 * ```
 */
export function useFetch<T>(
  url: string,
  options: UseFetchOptions<T> = {},
): UseFetchResult<T> {
  const { isConnected } = useNetworkStatus();
  const cacheKey = options.cacheKey ?? url;
  const retryOnReconnect = options.retryOnReconnect ?? true;

  const [data, setData] = useState<T | null>(() => {
    // Initialize with cached data if available
    if (options.initialData) return options.initialData;
    const cached = fetchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  });
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<AppError | null>(null);
  const [isStale, setIsStale] = useState(false);

  const wasOfflineRef = useRef(!isConnected);
  const hasFetchedRef = useRef(false);

  const fetchData = useCallback(
    async (abortController?: AbortController) => {
      if (options.skip) return;

      // If offline, try to use cached data
      if (!isConnected) {
        const cached = fetchCache.get(cacheKey);
        if (cached) {
          setData(cached.data as T);
          setIsStale(true);
          setLoading(false);
          return;
        }
        // No cache and offline - show offline error
        setError(
          new AppError(
            'No internet connection. Please check your network and try again.',
          ),
        );
        setLoading(false);
        return;
      }

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

        // Cache the successful response
        fetchCache.set(cacheKey, { data: jsonData, timestamp: Date.now() });

        setData(jsonData);
        setIsStale(false);
        hasFetchedRef.current = true;
        options.onSuccess?.(jsonData);
      } catch (err) {
        // Ignore abort errors, which are expected when a component unmounts during a fetch.
        if ((err as Error).name !== 'AbortError') {
          const appError =
            err instanceof AppError ? err : new AppError(getErrorMessage(err));

          // If we have cached data, show it as stale instead of error
          const cached = fetchCache.get(cacheKey);
          if (cached) {
            setData(cached.data as T);
            setIsStale(true);
          } else {
            setError(appError);
          }
          options.onError?.(appError);
        }
      } finally {
        setLoading(false);
      }
    },
    [url, cacheKey, options, isConnected],
  );

  // Initial fetch
  useEffect(() => {
    const abortController = new AbortController();
    void fetchData(abortController);

    return () => {
      abortController.abort();
    };
  }, [url, fetchData]);

  // Retry on reconnect
  useEffect(() => {
    if (
      retryOnReconnect &&
      wasOfflineRef.current &&
      isConnected &&
      hasFetchedRef.current
    ) {
      // Just came back online, refetch
      void fetchData();
    }
    wasOfflineRef.current = !isConnected;
  }, [isConnected, retryOnReconnect, fetchData]);

  const refetch = useCallback(() => {
    void fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    isOffline: !isConnected,
    isStale,
    refetch,
  };
}
