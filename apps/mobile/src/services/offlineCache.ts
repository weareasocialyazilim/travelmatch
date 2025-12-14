// @ts-nocheck - TODO: Fix type errors
/**
 * Offline-First Caching with React Query + MMKV
 * 
 * Features:
 * - Fast in-memory cache (React Query)
 * - Persistent storage (MMKV - faster than AsyncStorage)
 * - Offline support (serve stale data when offline)
 * - Background sync (update when connection restored)
 * - Cache invalidation strategies
 */

import { MMKV } from 'react-native-mmkv';
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import NetInfo from '@react-native-community/netinfo';

// Initialize MMKV storage
export const mmkvStorage = new MMKV({
  id: 'travelmatch-cache',
  encryptionKey: 'your-encryption-key-here', // TODO: Use secure key from env
});

// MMKV wrapper for React Query persister
const mmkvPersister = {
  async getItem(key: string): Promise<string | null> {
    const value = mmkvStorage.getString(key);
    return value ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    mmkvStorage.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    mmkvStorage.delete(key);
  },
};

// Create persister
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: mmkvPersister,
  throttleTime: 1000, // Throttle writes to 1 per second
});

// Cache configuration by data type
const CACHE_CONFIG = {
  // User profile (cache for 5 minutes, keep stale for 1 hour)
  profile: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  },
  
  // Moments feed (cache for 1 minute, keep stale for 10 minutes)
  moments: {
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 10 * 60 * 1000, // 10 minutes
  },
  
  // Matches (cache for 2 minutes, keep stale for 30 minutes)
  matches: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
  
  // Messages (cache for 30 seconds, keep stale for 5 minutes)
  messages: {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
  },
  
  // Static data (cache for 1 hour, keep stale for 24 hours)
  static: {
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
  },
};

// Query client with offline support
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Use stale data when offline
      networkMode: 'offlineFirst',
      
      // Retry with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for network errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Default cache times
      staleTime: CACHE_CONFIG.moments.staleTime,
      cacheTime: CACHE_CONFIG.moments.cacheTime,
      
      // Refetch on window focus (when app comes to foreground)
      refetchOnWindowFocus: true,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Queue mutations when offline
      networkMode: 'offlineFirst',
      
      // Retry failed mutations
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
  
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error('[Cache] Query error:', query.queryKey, error);
    },
    onSuccess: (data, query) => {
      console.log('[Cache] Query success:', query.queryKey);
    },
  }),
  
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      console.error('[Cache] Mutation error:', mutation.options.mutationKey, error);
    },
    onSuccess: (data, variables, context, mutation) => {
      console.log('[Cache] Mutation success:', mutation.options.mutationKey);
    },
  }),
});

// Network status tracking
let isOnline = true;

NetInfo.addEventListener((state) => {
  const wasOnline = isOnline;
  isOnline = state.isConnected ?? false;
  
  console.log('[Network] Status changed:', isOnline ? 'Online' : 'Offline');
  
  // When coming back online, refetch all active queries
  if (!wasOnline && isOnline) {
    console.log('[Network] Reconnected - refetching queries');
    queryClient.refetchQueries({ type: 'active' });
  }
});

// Cache utilities
export const cacheUtils = {
  /**
   * Prefetch data for offline use
   */
  async prefetchForOffline(userId: string) {
    console.log('[Cache] Prefetching data for offline use...');
    
    // Prefetch user profile
    await queryClient.prefetchQuery({
      queryKey: ['profile', userId],
      // Query function will be provided by hooks
    });
    
    // Prefetch moments feed (first page)
    await queryClient.prefetchQuery({
      queryKey: ['moments', 'feed'],
    });
    
    // Prefetch matches
    await queryClient.prefetchQuery({
      queryKey: ['matches'],
    });
    
    console.log('[Cache] Prefetch complete');
  },
  
  /**
   * Clear all cache
   */
  clearAll() {
    console.log('[Cache] Clearing all cache...');
    queryClient.clear();
    mmkvStorage.clearAll();
  },
  
  /**
   * Clear specific cache by key pattern
   */
  clearByPattern(pattern: string[]) {
    console.log('[Cache] Clearing cache:', pattern);
    queryClient.removeQueries({ queryKey: pattern });
  },
  
  /**
   * Get cache size
   */
  getCacheSize(): { entries: number; sizeBytes: number } {
    const allKeys = mmkvStorage.getAllKeys();
    let totalSize = 0;
    
    allKeys.forEach((key) => {
      const value = mmkvStorage.getString(key);
      if (value) {
        totalSize += new Blob([value]).size;
      }
    });
    
    return {
      entries: allKeys.length,
      sizeBytes: totalSize,
    };
  },
  
  /**
   * Invalidate cache (force refetch on next access)
   */
  invalidate(queryKey: string[]) {
    console.log('[Cache] Invalidating:', queryKey);
    queryClient.invalidateQueries({ queryKey });
  },
  
  /**
   * Set custom data in cache
   */
  setQueryData<T>(queryKey: string[], data: T) {
    queryClient.setQueryData(queryKey, data);
  },
  
  /**
   * Get data from cache
   */
  getQueryData<T>(queryKey: string[]): T | undefined {
    return queryClient.getQueryData(queryKey);
  },
  
  /**
   * Check if query is cached
   */
  isCached(queryKey: string[]): boolean {
    return queryClient.getQueryState(queryKey) !== undefined;
  },
  
  /**
   * Get network status
   */
  isOnline(): boolean {
    return isOnline;
  },
};

// Export cache config for use in hooks
export { CACHE_CONFIG };

// Optimistic update helper
export function optimisticUpdate<T>(
  queryKey: string[],
  updater: (old: T | undefined) => T,
  options?: {
    onError?: (error: any, previousData: T | undefined) => void;
  }
) {
  // Save previous data for rollback
  const previousData = queryClient.getQueryData<T>(queryKey);
  
  // Optimistically update cache
  queryClient.setQueryData<T>(queryKey, updater);
  
  return {
    // Rollback on error
    rollback: () => {
      queryClient.setQueryData(queryKey, previousData);
      options?.onError?.(new Error('Rolled back'), previousData);
    },
    previousData,
  };
}

// Cache key builders (consistent keys across app)
export const cacheKeys = {
  profile: (userId?: string) => ['profile', userId ?? 'me'] as const,
  moments: {
    list: () => ['moments'] as const,
    feed: (cursor?: string) => ['moments', 'feed', cursor] as const,
    detail: (id: string) => ['moments', id] as const,
    user: (userId: string) => ['moments', 'user', userId] as const,
  },
  matches: {
    list: () => ['matches'] as const,
    detail: (id: string) => ['matches', id] as const,
  },
  messages: {
    list: (matchId: string) => ['messages', matchId] as const,
    unread: () => ['messages', 'unread'] as const,
  },
  notifications: {
    list: () => ['notifications'] as const,
    unread: () => ['notifications', 'unread'] as const,
  },
};

// Mutation queue for offline support
const mutationQueue: Array<{
  id: string;
  mutation: () => Promise<any>;
  retryCount: number;
}> = [];

export const offlineMutations = {
  /**
   * Add mutation to queue (will be executed when online)
   */
  queue(id: string, mutation: () => Promise<any>) {
    mutationQueue.push({ id, mutation, retryCount: 0 });
    console.log('[Offline] Queued mutation:', id);
    
    // Try to process immediately if online
    if (isOnline) {
      this.processQueue();
    }
  },
  
  /**
   * Process queued mutations
   */
  async processQueue() {
    if (!isOnline || mutationQueue.length === 0) return;
    
    console.log('[Offline] Processing mutation queue:', mutationQueue.length, 'items');
    
    const toProcess = [...mutationQueue];
    mutationQueue.length = 0;
    
    for (const item of toProcess) {
      try {
        await item.mutation();
        console.log('[Offline] Processed:', item.id);
      } catch (error) {
        console.error('[Offline] Failed:', item.id, error);
        
        // Retry up to 3 times
        if (item.retryCount < 3) {
          mutationQueue.push({ ...item, retryCount: item.retryCount + 1 });
        }
      }
    }
  },
  
  /**
   * Clear queue
   */
  clear() {
    mutationQueue.length = 0;
  },
};

// Listen for online status to process queue
NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    offlineMutations.processQueue();
  }
});
