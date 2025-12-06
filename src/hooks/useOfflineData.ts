import { useState, useEffect, useCallback } from 'react';
import {
  cacheService,
  CACHE_KEYS as _CACHE_KEYS,
} from '../services/cacheService';
import { offlineSyncQueue } from '../services/offlineSyncQueue';
import { logger } from '../utils/logger';
import { useNetwork } from './useNetwork';
import type { OfflineActionType } from '../services/offlineSyncQueue';

interface UseOfflineDataOptions<T> {
  cacheKey: string;
  fetchFn: () => Promise<T>;
  expiryMs?: number;
  onError?: (error: Error) => void;
}

interface UseOfflineDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isStale: boolean;
  isOffline: boolean;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * Hook for fetching data with offline support
 * Uses cache when offline and syncs when back online
 */
export function useOfflineData<T>({
  cacheKey,
  fetchFn,
  expiryMs = 5 * 60 * 1000, // 5 minutes default
  onError,
}: UseOfflineDataOptions<T>): UseOfflineDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { isOnline, isOffline } = useNetwork();

  // Load cached data on mount
  useEffect(() => {
    void loadCachedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  // Fetch fresh data when online
  useEffect(() => {
    if (isOnline && !loading) {
      void fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const loadCachedData = useCallback(async () => {
    try {
      const result = await cacheService.getWithStale<T>(cacheKey);
      if (result.data) {
        setData(result.data);
        setIsStale(result.isStale);

        // Try to get timestamp from cache
        const stored = await cacheService.get<{ timestamp: number }>(cacheKey);
        if (stored) {
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      logger.error('useOfflineData.loadCachedData error:', err);
    } finally {
      setLoading(false);
    }
  }, [cacheKey]);

  const fetchData = useCallback(async () => {
    if (!isOnline) {
      // If offline, just load from cache
      await loadCachedData();
      return;
    }

    try {
      setError(null);
      const freshData = await fetchFn();

      // Update cache
      await cacheService.set(cacheKey, freshData, { expiryMs });

      setData(freshData);
      setIsStale(false);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);

      // Try to use cached data as fallback
      const cached = await cacheService.getWithStale<T>(cacheKey);
      if (cached.data) {
        setData(cached.data);
        setIsStale(true);
      }

      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [cacheKey, fetchFn, expiryMs, isOnline, onError, loadCachedData]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    isStale,
    isOffline,
    refresh,
    lastUpdated,
  };
}

interface UseOfflineMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  offlineActionType?: OfflineActionType;
}

interface UseOfflineMutationReturn<TParams, TResult> {
  mutate: (params: TParams) => Promise<TResult | null>;
  loading: boolean;
  error: string | null;
  isQueued: boolean;
}

/**
 * Hook for mutations with offline support
 * Queues actions when offline and syncs when back online
 */
export function useOfflineMutation<
  TParams extends Record<string, unknown>,
  TResult,
>(
  mutationFn: (params: TParams) => Promise<TResult>,
  options: UseOfflineMutationOptions = {},
): UseOfflineMutationReturn<TParams, TResult> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isQueued, setIsQueued] = useState(false);

  const { isOnline } = useNetwork();
  const { onSuccess, onError, offlineActionType } = options;

  const mutate = useCallback(
    async (params: TParams): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      setIsQueued(false);

      try {
        if (isOnline) {
          // Execute immediately if online
          const result = await mutationFn(params);
          onSuccess?.();
          return result;
        } else if (offlineActionType) {
          // Queue for later if offline and action type is specified
          await offlineSyncQueue.add(offlineActionType, params);
          setIsQueued(true);
          onSuccess?.();
          return null;
        } else {
          // No offline support, throw error
          throw new Error('No network connection');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Mutation failed';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isOnline, mutationFn, offlineActionType, onSuccess, onError],
  );

  return {
    mutate,
    loading,
    error,
    isQueued,
  };
}

/**
 * Hook for monitoring offline queue status
 */
export function useOfflineQueue() {
  const [queueStatus, setQueueStatus] = useState(
    offlineSyncQueue.getQueueStatus(),
  );
  const [pendingActions, setPendingActions] = useState(
    offlineSyncQueue.getPendingActions(),
  );
  const { isOnline } = useNetwork();

  useEffect(() => {
    const unsubscribe = offlineSyncQueue.subscribe((queue) => {
      setQueueStatus(offlineSyncQueue.getQueueStatus());
      setPendingActions(queue.filter((a) => a.status === 'pending'));
    });

    return unsubscribe;
  }, []);

  const processQueue = useCallback(async () => {
    if (!isOnline) return;
    return offlineSyncQueue.processQueue();
  }, [isOnline]);

  const retryFailed = useCallback(async () => {
    if (!isOnline) return;
    return offlineSyncQueue.retryFailed();
  }, [isOnline]);

  const clearFailed = useCallback(async () => {
    return offlineSyncQueue.clearFailed();
  }, []);

  return {
    queueStatus,
    pendingActions,
    hasPendingActions: queueStatus.pending > 0,
    hasFailedActions: queueStatus.failed > 0,
    processQueue,
    retryFailed,
    clearFailed,
    isOnline,
  };
}

export default useOfflineData;
