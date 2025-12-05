import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

// Cache configuration
const CACHE_PREFIX = '@travelmatch_cache_';
const DEFAULT_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const _MAX_CACHE_SIZE_MB = 50; // Maximum cache size in MB

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  size: number;
}

interface CacheConfig {
  expiryMs?: number;
  forceRefresh?: boolean;
}

// Cache keys
export const CACHE_KEYS = {
  MOMENTS: 'moments',
  MY_MOMENTS: 'my_moments',
  SAVED_MOMENTS: 'saved_moments',
  CONVERSATIONS: 'conversations',
  REQUESTS: 'requests',
  WALLET: 'wallet',
  PROFILE: 'profile',
  USER_PROFILE: (userId: string) => `user_profile_${userId}`,
  MOMENT_DETAIL: (momentId: string) => `moment_${momentId}`,
  CONVERSATION: (conversationId: string) => `conversation_${conversationId}`,
} as const;

/**
 * Calculate approximate size of data in bytes
 */
const calculateSize = (data: unknown): number => {
  const str = JSON.stringify(data);
  return new Blob([str]).size;
};

/**
 * Get cache key with prefix
 */
const getCacheKey = (key: string): string => `${CACHE_PREFIX}${key}`;

/**
 * Cache service for offline data storage
 */
class CacheService {
  private memoryCache: Map<string, CacheItem<unknown>> = new Map();

  /**
   * Set data in cache
   */
  async set<T>(key: string, data: T, config: CacheConfig = {}): Promise<void> {
    const { expiryMs = DEFAULT_EXPIRY_MS } = config;
    const now = Date.now();
    const size = calculateSize(data);

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + expiryMs,
      size,
    };

    // Store in memory cache
    this.memoryCache.set(key, cacheItem);

    // Store in AsyncStorage
    try {
      await AsyncStorage.setItem(getCacheKey(key), JSON.stringify(cacheItem));
    } catch (error) {
      logger.error('CacheService.set error:', error);
      // If storage is full, try to clear old cache
      await this.clearExpired();
    }
  }

  /**
   * Get data from cache
   */
  async get<T>(key: string, config: CacheConfig = {}): Promise<T | null> {
    const { forceRefresh = false } = config;

    if (forceRefresh) {
      return null;
    }

    // Try memory cache first
    const memoryItem = this.memoryCache.get(key) as CacheItem<T> | undefined;
    if (memoryItem && Date.now() < memoryItem.expiresAt) {
      return memoryItem.data;
    }

    // Try AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(getCacheKey(key));
      if (!stored) return null;

      const cacheItem: CacheItem<T> = JSON.parse(stored);

      // Check expiry
      if (Date.now() >= cacheItem.expiresAt) {
        await this.remove(key);
        return null;
      }

      // Update memory cache
      this.memoryCache.set(key, cacheItem);

      return cacheItem.data;
    } catch (error) {
      logger.error('CacheService.get error:', error);
      return null;
    }
  }

  /**
   * Get data with fallback to stale cache if expired
   */
  async getWithStale<T>(
    key: string,
  ): Promise<{ data: T | null; isStale: boolean }> {
    // Try memory cache first
    const memoryItem = this.memoryCache.get(key) as CacheItem<T> | undefined;
    if (memoryItem) {
      const isStale = Date.now() >= memoryItem.expiresAt;
      return { data: memoryItem.data, isStale };
    }

    // Try AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(getCacheKey(key));
      if (!stored) return { data: null, isStale: false };

      const cacheItem: CacheItem<T> = JSON.parse(stored);
      const isStale = Date.now() >= cacheItem.expiresAt;

      // Update memory cache
      this.memoryCache.set(key, cacheItem);

      return { data: cacheItem.data, isStale };
    } catch (error) {
      logger.error('CacheService.getWithStale error:', error);
      return { data: null, isStale: false };
    }
  }

  /**
   * Remove item from cache
   */
  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(getCacheKey(key));
    } catch (error) {
      logger.error('CacheService.remove error:', error);
    }
  }

  /**
   * Clear all expired cache items
   */
  async clearExpired(): Promise<void> {
    const now = Date.now();

    // Clear memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (now >= item.expiresAt) {
        this.memoryCache.delete(key);
      }
    }

    // Clear AsyncStorage
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));

      for (const fullKey of cacheKeys) {
        const stored = await AsyncStorage.getItem(fullKey);
        if (stored) {
          const item = JSON.parse(stored) as CacheItem<unknown>;
          if (now >= item.expiresAt) {
            await AsyncStorage.removeItem(fullKey);
          }
        }
      }
    } catch (error) {
      logger.error('CacheService.clearExpired error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear();

    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      logger.error('CacheService.clearAll error:', error);
    }
  }

  /**
   * Clear memory cache only (useful for testing)
   */
  clearMemoryCache(): void {
    this.memoryCache.clear();
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    itemCount: number;
    totalSize: number;
    oldestItem: Date | null;
    newestItem: Date | null;
  }> {
    let itemCount = 0;
    let totalSize = 0;
    let oldestTimestamp = Infinity;
    let newestTimestamp = 0;

    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));

      for (const fullKey of cacheKeys) {
        const stored = await AsyncStorage.getItem(fullKey);
        if (stored) {
          const item = JSON.parse(stored) as CacheItem<unknown>;
          itemCount++;
          totalSize += item.size;

          if (item.timestamp < oldestTimestamp) {
            oldestTimestamp = item.timestamp;
          }
          if (item.timestamp > newestTimestamp) {
            newestTimestamp = item.timestamp;
          }
        }
      }
    } catch (error) {
      logger.error('CacheService.getStats error:', error);
    }

    return {
      itemCount,
      totalSize,
      oldestItem:
        oldestTimestamp !== Infinity ? new Date(oldestTimestamp) : null,
      newestItem: newestTimestamp !== 0 ? new Date(newestTimestamp) : null,
    };
  }

  /**
   * Check if cache exists and is valid
   */
  async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    // Clear memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear AsyncStorage
    try {
      const keys = await AsyncStorage.getAllKeys();
      const matchingKeys = keys.filter(
        (k) => k.startsWith(CACHE_PREFIX) && k.includes(pattern),
      );
      await AsyncStorage.multiRemove(matchingKeys);
    } catch (error) {
      logger.error('CacheService.invalidateByPattern error:', error);
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Export cache utilities
export const cache = {
  set: cacheService.set.bind(cacheService),
  get: cacheService.get.bind(cacheService),
  getWithStale: cacheService.getWithStale.bind(cacheService),
  remove: cacheService.remove.bind(cacheService),
  clearExpired: cacheService.clearExpired.bind(cacheService),
  clearAll: cacheService.clearAll.bind(cacheService),
  getStats: cacheService.getStats.bind(cacheService),
  has: cacheService.has.bind(cacheService),
  invalidateByPattern: cacheService.invalidateByPattern.bind(cacheService),
};

export default cacheService;
