/**
 * Offline Support Utilities
 * Network detection ve offline caching
 */

import NetInfo from '@react-native-community/netinfo';
import { logger } from './logger';
import { useState, useEffect } from 'react';

/**
 * Network Status Hook
 */
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  return {
    isConnected,
    isInternetReachable,
    isOnline: isConnected === true && isInternetReachable !== false,
    isOffline: isConnected === false,
  };
};

/**
 * Check if network is available
 */
export const checkNetworkAvailability = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable !== false;
};

/**
 * Simple Cache Manager
 */
class CacheManager {
  private cache: Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  > = new Map();

  /**
   * Set cache with TTL (time to live in ms)
   */
  set(key: string, data: unknown, ttl = 3600000): void {
    // Default TTL: 1 hour
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get from cache
   */
  get<T = unknown>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Check if cache exists and valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove from cache
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

export const cache = new CacheManager();

/**
 * Retry with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  if (lastError) {
    throw lastError;
  }
  throw new Error('Retry failed with unknown error');
};

/**
 * Offline Queue for mutations
 */
interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  data?: unknown;
  timestamp: number;
}

class OfflineQueue {
  private queue: QueuedRequest[] = [];

  /**
   * Add request to queue
   */
  add(url: string, method: string, data?: unknown): string {
    const id = `${Date.now()}-${Math.random()}`;
    this.queue.push({
      id,
      url,
      method,
      data,
      timestamp: Date.now(),
    });
    return id;
  }

  /**
   * Get all queued requests
   */
  getAll(): QueuedRequest[] {
    return [...this.queue];
  }

  /**
   * Remove request from queue
   */
  remove(id: string): void {
    this.queue = this.queue.filter((req) => req.id !== id);
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Process queue when online
   */
  async processQueue(
    executeRequest: (req: QueuedRequest) => Promise<void>,
  ): Promise<void> {
    const requests = [...this.queue];

    for (const request of requests) {
      try {
        await executeRequest(request);
        this.remove(request.id);
      } catch (error) {
        logger.error(`Failed to process queued request: ${request.id}`, error);
        // Keep in queue to retry later
      }
    }
  }
}

export const offlineQueue = new OfflineQueue();
