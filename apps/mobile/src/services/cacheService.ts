import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';
import pako from 'pako';

// Cache configuration
const CACHE_PREFIX = '@lovendo_cache_';
const DEFAULT_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE_MB = 50; // Maximum cache size: 50MB
const MAX_CACHE_SIZE_BYTES = MAX_CACHE_SIZE_MB * 1024 * 1024;
const MAX_MEMORY_CACHE_ITEMS = 100; // Maximum items in memory cache (LRU)
const COMPRESSION_THRESHOLD_BYTES = 10 * 1024; // Compress items > 10KB
const CLEANUP_INTERVAL_MS = 60 * 1000; // Cleanup every minute

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
  compressed?: boolean;
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

// Legacy cache prefixes for migration
const LEGACY_CACHE_PREFIXES = ['@lovendo_cache/', '@lovendo/cache_'];

// Reserved for future cache migration - keeping for backward compatibility
const _getLegacyCacheKeys = (key: string): string[] =>
  LEGACY_CACHE_PREFIXES.map((prefix) => `${prefix}${key}`);

const _isCacheKey = (fullKey: string): boolean =>
  fullKey.startsWith(CACHE_PREFIX) ||
  LEGACY_CACHE_PREFIXES.some((prefix) => fullKey.startsWith(prefix));

const _stripCachePrefix = (fullKey: string): string => {
  if (fullKey.startsWith(CACHE_PREFIX))
    return fullKey.slice(CACHE_PREFIX.length);
  for (const prefix of LEGACY_CACHE_PREFIXES) {
    if (fullKey.startsWith(prefix)) return fullKey.slice(prefix.length);
  }
  return fullKey;
};

/**
 * Cache service for offline data storage with:
 * - LRU eviction (Least Recently Used)
 * - Compression for large items
 * - Memory leak prevention
 * - Automatic cleanup
 */
class CacheService {
  private memoryCache: Map<string, CacheItem<unknown>> = new Map();
  private accessOrder: string[] = []; // LRU tracking
  private currentSize = 0; // Total cache size in bytes
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  /**
   * Initialize cache service (call on app start)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Calculate current cache size
    await this.calculateCurrentSize();

    // Start automatic cleanup interval
    this.startCleanupInterval();

    this.isInitialized = true;
    logger.info('CacheService initialized', {
      currentSize: this.formatBytes(this.currentSize),
      maxSize: this.formatBytes(MAX_CACHE_SIZE_BYTES),
    });
  }

  /**
   * Cleanup resources (call on app shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.memoryCache.clear();
    this.accessOrder = [];
    this.isInitialized = false;
  }
  /**
   * Set data in cache with size limits and compression
   */
  async set<T>(key: string, data: T, config: CacheConfig = {}): Promise<void> {
    const { expiryMs = DEFAULT_EXPIRY_MS } = config;
    const now = Date.now();

    // Compress large data
    let finalData: any = data;
    let compressed = false;
    let size = calculateSize(data);

    if (size > COMPRESSION_THRESHOLD_BYTES) {
      try {
        const json = JSON.stringify(data);
        const compressedData = pako.deflate(json);
        const compressedSize = compressedData.byteLength;

        // Only use compression if it reduces size by at least 20%
        if (compressedSize < size * 0.8) {
          finalData = Buffer.from(compressedData).toString('base64');
          compressed = true;
          size = compressedSize;
          logger.debug('Compressed cache item', {
            key,
            originalSize: calculateSize(data),
            compressedSize: size,
            ratio: ((size / calculateSize(data)) * 100).toFixed(1) + '%',
          });
        }
      } catch (error) {
        logger.error('Compression error:', error);
      }
    }

    const cacheItem: CacheItem<T> = {
      data: finalData,
      timestamp: now,
      expiresAt: now + expiryMs,
      size,
      accessCount: 0,
      lastAccessed: now,
      compressed,
    };

    // Check if adding this item would exceed size limit
    if (this.currentSize + size > MAX_CACHE_SIZE_BYTES) {
      await this.evictToMakeSpace(size);
    }

    // Update memory cache with LRU eviction
    if (this.memoryCache.size >= MAX_MEMORY_CACHE_ITEMS) {
      this.evictLRUFromMemory();
    }

    this.memoryCache.set(key, cacheItem);
    this.updateAccessOrder(key);
    this.currentSize += size;

    // Store in AsyncStorage
    try {
      await AsyncStorage.setItem(getCacheKey(key), JSON.stringify(cacheItem));
    } catch (error) {
      logger.error('CacheService.set error:', error);
      // If storage is full, aggressively clear space
      await this.evictToMakeSpace(size * 2);
      // Retry once
      try {
        await AsyncStorage.setItem(getCacheKey(key), JSON.stringify(cacheItem));
      } catch (retryError) {
        logger.error('CacheService.set retry failed:', retryError);
        this.memoryCache.delete(key);
        this.currentSize -= size;
      }
    }
  }

  /**
   * Get data from cache with decompression
   */
  async get<T>(key: string, config: CacheConfig = {}): Promise<T | null> {
    const { forceRefresh = false } = config;

    if (forceRefresh) {
      return null;
    }

    const now = Date.now();

    // Try memory cache first
    const memoryItem = this.memoryCache.get(key) as CacheItem<T> | undefined;
    if (memoryItem) {
      if (now >= memoryItem.expiresAt) {
        await this.remove(key);
        return null;
      }

      // Update access tracking
      memoryItem.accessCount++;
      memoryItem.lastAccessed = now;
      this.updateAccessOrder(key);

      return this.decompressIfNeeded(memoryItem);
    }

    // Try AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(getCacheKey(key));
      if (!stored) return null;

      const cacheItem = JSON.parse(stored) as CacheItem<T>;

      // Check expiry
      if (now >= cacheItem.expiresAt) {
        await this.remove(key);
        return null;
      }

      // Update access tracking
      cacheItem.accessCount++;
      cacheItem.lastAccessed = now;

      // Update memory cache (with LRU eviction if needed)
      if (this.memoryCache.size >= MAX_MEMORY_CACHE_ITEMS) {
        this.evictLRUFromMemory();
      }
      this.memoryCache.set(key, cacheItem);
      this.updateAccessOrder(key);

      return this.decompressIfNeeded(cacheItem);
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

      const cacheItem = JSON.parse(stored) as CacheItem<T>;
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
    this.accessOrder = [];
  }

  /**
   * Decompress data if it was compressed
   */
  private decompressIfNeeded<T>(cacheItem: CacheItem<T>): T {
    if (!cacheItem.compressed) {
      return cacheItem.data;
    }

    try {
      const base64Data = cacheItem.data as unknown as string;
      const compressedData = Buffer.from(base64Data, 'base64');
      const decompressed = pako.inflate(compressedData, { to: 'string' });
      return JSON.parse(decompressed) as T;
    } catch (error) {
      logger.error('Decompression error:', error);
      return cacheItem.data; // Return as-is if decompression fails
    }
  }

  /**
   * Update LRU access order
   */
  private updateAccessOrder(key: string): void {
    // Remove from current position
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  /**
   * Evict least recently used item from memory cache
   */
  private evictLRUFromMemory(): void {
    if (this.accessOrder.length === 0) return;

    // Remove least recently used (first in array)
    const lruKey = this.accessOrder.shift();
    if (lruKey) {
      this.memoryCache.delete(lruKey);
      logger.debug('Evicted LRU from memory cache:', lruKey);
    }
  }

  /**
   * Evict items to make space for new data
   */
  private async evictToMakeSpace(requiredSpace: number): Promise<void> {
    logger.warn('Cache size limit approaching, evicting old items', {
      currentSize: this.formatBytes(this.currentSize),
      requiredSpace: this.formatBytes(requiredSpace),
      maxSize: this.formatBytes(MAX_CACHE_SIZE_BYTES),
    });

    // First, clear expired items
    await this.clearExpired();

    // If still not enough space, evict oldest items
    if (this.currentSize + requiredSpace > MAX_CACHE_SIZE_BYTES) {
      await this.evictOldestItems(requiredSpace);
    }
  }

  /**
   * Evict oldest items until we have enough space
   */
  private async evictOldestItems(requiredSpace: number): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));

      // Load all items and sort by timestamp (oldest first)
      const items: Array<{ key: string; item: CacheItem<unknown> }> = [];

      for (const fullKey of cacheKeys) {
        const stored = await AsyncStorage.getItem(fullKey);
        if (stored) {
          const item = JSON.parse(stored) as CacheItem<unknown>;
          items.push({ key: fullKey.replace(CACHE_PREFIX, ''), item });
        }
      }

      items.sort((a, b) => a.item.timestamp - b.item.timestamp);

      // Evict oldest items until we have enough space
      let freedSpace = 0;
      for (const { key, item } of items) {
        if (
          this.currentSize - freedSpace + requiredSpace <=
          MAX_CACHE_SIZE_BYTES * 0.8
        ) {
          break; // Leave 20% buffer
        }

        await this.remove(key);
        freedSpace += item.size;
        logger.debug('Evicted old cache item:', key);
      }

      logger.info('Cache eviction completed', {
        freedSpace: this.formatBytes(freedSpace),
        newSize: this.formatBytes(this.currentSize - freedSpace),
      });
    } catch (error) {
      logger.error('Cache eviction error:', error);
    }
  }

  /**
   * Calculate total current cache size
   */
  private async calculateCurrentSize(): Promise<void> {
    let totalSize = 0;

    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));

      for (const fullKey of cacheKeys) {
        const stored = await AsyncStorage.getItem(fullKey);
        if (stored) {
          const item = JSON.parse(stored) as CacheItem<unknown>;
          totalSize += item.size;
        }
      }
    } catch (error) {
      logger.error('Calculate cache size error:', error);
    }

    this.currentSize = totalSize;
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      this.clearExpired().catch((error) => {
        logger.error('Automatic cleanup error:', error);
      });
    }, CLEANUP_INTERVAL_MS);
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Get comprehensive cache statistics
   */
  async getStats(): Promise<{
    itemCount: number;
    totalSize: number;
    totalSizeFormatted: string;
    maxSize: number;
    maxSizeFormatted: string;
    usagePercentage: number;
    memoryItemCount: number;
    oldestItem: Date | null;
    newestItem: Date | null;
    mostAccessed: Array<{ key: string; count: number }>;
    compressedItems: number;
    averageItemSize: number;
  }> {
    let itemCount = 0;
    let totalSize = 0;
    let oldestTimestamp = Infinity;
    let newestTimestamp = 0;
    let compressedItems = 0;
    const accessCounts: Array<{ key: string; count: number }> = [];

    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));

      for (const fullKey of cacheKeys) {
        const stored = await AsyncStorage.getItem(fullKey);
        if (stored) {
          const item = JSON.parse(stored) as CacheItem<unknown>;
          itemCount++;
          totalSize += item.size;

          if (item.compressed) {
            compressedItems++;
          }

          if (item.timestamp < oldestTimestamp) {
            oldestTimestamp = item.timestamp;
          }
          if (item.timestamp > newestTimestamp) {
            newestTimestamp = item.timestamp;
          }

          accessCounts.push({
            key: fullKey.replace(CACHE_PREFIX, ''),
            count: item.accessCount || 0,
          });
        }
      }
    } catch (error) {
      logger.error('CacheService.getStats error:', error);
    }

    // Sort by access count and get top 10
    const mostAccessed = accessCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      itemCount,
      totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      maxSize: MAX_CACHE_SIZE_BYTES,
      maxSizeFormatted: this.formatBytes(MAX_CACHE_SIZE_BYTES),
      usagePercentage: (totalSize / MAX_CACHE_SIZE_BYTES) * 100,
      memoryItemCount: this.memoryCache.size,
      oldestItem:
        oldestTimestamp !== Infinity ? new Date(oldestTimestamp) : null,
      newestItem: newestTimestamp !== 0 ? new Date(newestTimestamp) : null,
      mostAccessed,
      compressedItems,
      averageItemSize: itemCount > 0 ? totalSize / itemCount : 0,
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
