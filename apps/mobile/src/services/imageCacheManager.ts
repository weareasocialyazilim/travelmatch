/**
 * Image Cache Manager
 *
 * Advanced caching strategy combining Cloudflare CDN + local storage
 *
 * Features:
 * - Multi-tier caching (Memory → Disk → Cloudflare CDN → Network)
 * - Automatic WebP conversion via Cloudflare
 * - LRU eviction for disk cache
 * - Prefetching for responsive variants
 * - Offline support with fallback images
 * - Cache size management
 * - Performance monitoring
 *
 * Cache Strategy:
 * 1. Check memory cache (instant)
 * 2. Check disk cache (fast)
 * 3. Fetch from Cloudflare CDN (optimized)
 * 4. Fallback to original URL (slow)
 *
 * @see https://docs.expo.dev/versions/latest/sdk/filesystem/
 */

import React from 'react';
import * as FileSystem from 'expo-file-system';
import { cacheDirectory } from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { logger } from '../utils/logger';
import {
  getImageUrl,
  getResponsiveUrls,
  uploadToCloudflare,
  type ImageVariant,
} from './cloudflareImages';

// Re-export ImageVariant for external use
export type { ImageVariant };

// ============================================================================
// TYPES
// ============================================================================

export interface CacheConfig {
  maxMemoryCacheSizeMB: number;
  maxDiskCacheSizeMB: number;
  diskCacheTTLDays: number;
  enablePrefetch: boolean;
  enableOfflineCache: boolean;
  cloudflareFallback: boolean;
}

export interface CacheEntry {
  uri: string;
  localPath?: string;
  cloudflareId?: string;
  size: number;
  timestamp: number;
  variant?: ImageVariant;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  memorySize: number;
  diskSize: number;
  totalEntries: number;
  hitRate: number;
  missRate: number;
  cloudflareHits: number;
  diskHits: number;
  memoryHits: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: CacheConfig = {
  maxMemoryCacheSizeMB: 50, // 50MB in-memory cache
  maxDiskCacheSizeMB: 500, // 500MB disk cache
  diskCacheTTLDays: 30, // 30 days
  enablePrefetch: true,
  enableOfflineCache: true,
  cloudflareFallback: true,
};

const CACHE_DIR = `${cacheDirectory}images/`;
const METADATA_KEY = '@image_cache_metadata';
const STATS_KEY = '@image_cache_stats';

// ============================================================================
// MEMORY CACHE (LRU)
// ============================================================================

class MemoryCache {
  private cache = new Map<
    string,
    { data: string; size: number; timestamp: number }
  >();
  private maxSize: number;
  private currentSize = 0;

  constructor(maxSizeMB: number) {
    this.maxSize = maxSizeMB * 1024 * 1024;
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  set(key: string, data: string, size: number): void {
    // Evict if needed
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      const oldestKeyResult = this.cache.keys().next();
      if (oldestKeyResult.done || oldestKeyResult.value === undefined) break;
      const oldestKey = oldestKeyResult.value;
      const oldest = this.cache.get(oldestKey);
      if (oldest) {
        this.currentSize -= oldest.size;
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, { data, size, timestamp: Date.now() });
    this.currentSize += size;
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  getSize(): number {
    return this.currentSize;
  }

  getEntries(): number {
    return this.cache.size;
  }
}

// ============================================================================
// IMAGE CACHE MANAGER
// ============================================================================

class ImageCacheManager {
  private config: CacheConfig;
  private memoryCache: MemoryCache;
  private metadata = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    memorySize: 0,
    diskSize: 0,
    totalEntries: 0,
    hitRate: 0,
    missRate: 0,
    cloudflareHits: 0,
    diskHits: 0,
    memoryHits: 0,
  };
  private initialized = false;
  private totalRequests = 0;
  private totalHits = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.memoryCache = new MemoryCache(this.config.maxMemoryCacheSizeMB);
  }

  /**
   * Initialize cache system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create cache directory
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      }

      // Load metadata
      await this.loadMetadata();

      // Load stats
      await this.loadStats();

      // Clean expired entries
      await this.cleanExpired();

      this.initialized = true;
      logger.info('[ImageCache] Initialized', {
        entries: this.metadata.size,
        diskSize: this.stats.diskSize,
      });
    } catch (error) {
      logger.error('[ImageCache] Initialization failed:', error);
    }
  }

  /**
   * Get image with multi-tier caching
   */
  async getImage(
    uri: string,
    options?: {
      variant?: ImageVariant;
      cloudflareId?: string;
      prefetch?: boolean;
    },
  ): Promise<string> {
    await this.ensureInitialized();

    const cacheKey = await this.getCacheKey(uri, options?.variant);
    this.totalRequests++;

    // 1. Check memory cache
    const memoryHit = this.memoryCache.get(cacheKey);
    if (memoryHit) {
      this.recordHit('memory');
      await this.updateAccess(cacheKey);
      return memoryHit;
    }

    // 2. Check disk cache
    const diskHit = await this.getDiskCache(cacheKey);
    if (diskHit) {
      this.recordHit('disk');
      this.memoryCache.set(cacheKey, diskHit, diskHit.length);
      await this.updateAccess(cacheKey);
      return diskHit;
    }

    // 3. Try Cloudflare CDN (if enabled and cloudflareId provided)
    if (this.config.cloudflareFallback && options?.cloudflareId) {
      try {
        const cloudflareUrl = getImageUrl(
          options.cloudflareId,
          options.variant || 'medium',
        );
        const cloudflareImage = await this.fetchAndCache(
          cloudflareUrl,
          cacheKey,
        );
        this.recordHit('cloudflare');

        // Prefetch other variants
        if (this.config.enablePrefetch && options?.prefetch) {
          this.prefetchVariants(options.cloudflareId, options.variant);
        }

        return cloudflareImage;
      } catch (error) {
        logger.warn(
          '[ImageCache] Cloudflare fetch failed, falling back:',
          error,
        );
      }
    }

    // 4. Fetch from original URL
    const image = await this.fetchAndCache(uri, cacheKey);
    this.recordMiss();
    return image;
  }

  /**
   * Prefetch image and variants
   */
  async prefetch(
    uri: string,
    cloudflareId?: string,
    variants: ImageVariant[] = ['small', 'medium'],
  ): Promise<void> {
    if (!this.config.enablePrefetch) return;

    try {
      if (cloudflareId) {
        // Prefetch Cloudflare variants
        await Promise.all(
          variants.map((variant) =>
            this.getImage(uri, { cloudflareId, variant, prefetch: false }),
          ),
        );
      } else {
        // Prefetch original
        await this.getImage(uri);
      }

      logger.info('[ImageCache] Prefetched:', { uri, variants });
    } catch (error) {
      logger.warn('[ImageCache] Prefetch failed:', error);
    }
  }

  /**
   * Upload to Cloudflare and cache locally
   */
  async uploadAndCache(
    imageData: Blob | File,
    metadata?: Record<string, string>,
  ): Promise<{ cloudflareId: string; localUri: string }> {
    try {
      // Upload to Cloudflare
      const result = await uploadToCloudflare(imageData, { metadata });

      // Get medium variant URL
      const mediumUrl = getImageUrl(result.id, 'medium');

      // Cache locally
      const cacheKey = await this.getCacheKey(mediumUrl, 'medium');
      const localUri = await this.fetchAndCache(mediumUrl, cacheKey);

      // Prefetch other variants
      if (this.config.enablePrefetch) {
        this.prefetchVariants(result.id, 'medium');
      }

      logger.info('[ImageCache] Uploaded and cached:', result.id);

      return {
        cloudflareId: result.id,
        localUri,
      };
    } catch (error) {
      logger.error('[ImageCache] Upload and cache failed:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  async clearCache(options?: {
    memory?: boolean;
    disk?: boolean;
  }): Promise<void> {
    const clearMemory = options?.memory ?? true;
    const clearDisk = options?.disk ?? true;

    if (clearMemory) {
      this.memoryCache.clear();
    }

    if (clearDisk) {
      try {
        await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
        this.metadata.clear();
        await this.saveMetadata();
      } catch (error) {
        logger.error('[ImageCache] Clear disk cache failed:', error);
      }
    }

    logger.info('[ImageCache] Cache cleared', {
      memory: clearMemory,
      disk: clearDisk,
    });
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    await this.ensureInitialized();

    return {
      ...this.stats,
      memorySize: this.memoryCache.getSize(),
      totalEntries: this.metadata.size,
      hitRate: this.totalRequests > 0 ? this.totalHits / this.totalRequests : 0,
      missRate:
        this.totalRequests > 0 ? 1 - this.totalHits / this.totalRequests : 0,
    };
  }

  /**
   * Evict least recently used entries to free space
   */
  async evictLRU(targetSizeMB: number): Promise<void> {
    const targetSize = targetSizeMB * 1024 * 1024;
    const entries = Array.from(this.metadata.entries());

    // Sort by last accessed (oldest first)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    let freedSpace = 0;

    for (const [key, entry] of entries) {
      if (this.stats.diskSize - freedSpace <= targetSize) break;

      if (entry.localPath) {
        try {
          await FileSystem.deleteAsync(entry.localPath, { idempotent: true });
          freedSpace += entry.size;
          this.metadata.delete(key);
        } catch (error) {
          logger.warn('[ImageCache] Failed to delete:', entry.localPath);
        }
      }
    }

    await this.saveMetadata();
    this.stats.diskSize -= freedSpace;

    logger.info('[ImageCache] Evicted LRU:', {
      freedMB: freedSpace / 1024 / 1024,
    });
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private async getCacheKey(
    uri: string,
    variant?: ImageVariant,
  ): Promise<string> {
    const key = variant ? `${uri}:${variant}` : uri;
    // Simple hash function (djb2)
    let hash = 5381;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) + hash + key.charCodeAt(i);
    }
    return Math.abs(hash).toString(16);
  }

  private async fetchAndCache(url: string, cacheKey: string): Promise<string> {
    try {
      const localPath = `${CACHE_DIR}${cacheKey}`;

      // Download
      const { uri: downloadedUri } = await FileSystem.downloadAsync(
        url,
        localPath,
      );

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(downloadedUri);
      const size = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

      // Save metadata
      const entry: CacheEntry = {
        uri: url,
        localPath: downloadedUri,
        size,
        timestamp: Date.now(),
        accessCount: 1,
        lastAccessed: Date.now(),
      };

      this.metadata.set(cacheKey, entry);
      this.stats.diskSize += size;
      await this.saveMetadata();

      // Check if we need to evict
      if (this.stats.diskSize > this.config.maxDiskCacheSizeMB * 1024 * 1024) {
        await this.evictLRU(this.config.maxDiskCacheSizeMB * 0.8); // Evict to 80%
      }

      // Add to memory cache
      this.memoryCache.set(cacheKey, downloadedUri, size);

      return downloadedUri;
    } catch (error) {
      logger.error('[ImageCache] Fetch and cache failed:', error);
      throw error;
    }
  }

  private async getDiskCache(cacheKey: string): Promise<string | null> {
    const entry = this.metadata.get(cacheKey);
    if (!entry?.localPath) return null;

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
    if (!fileInfo.exists) {
      this.metadata.delete(cacheKey);
      await this.saveMetadata();
      return null;
    }

    return entry.localPath;
  }

  private async updateAccess(cacheKey: string): Promise<void> {
    const entry = this.metadata.get(cacheKey);
    if (entry) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      this.metadata.set(cacheKey, entry);
      // Batch save (don't save on every access)
      if (entry.accessCount % 10 === 0) {
        await this.saveMetadata();
      }
    }
  }

  private async prefetchVariants(
    cloudflareId: string,
    currentVariant?: ImageVariant,
  ): Promise<void> {
    const variants: ImageVariant[] = ['thumbnail', 'small', 'medium', 'large'];
    const toPrefetch = variants.filter((v) => v !== currentVariant);

    // Prefetch in background (don't await)
    Promise.all(
      toPrefetch.map(async (variant) => {
        const url = getImageUrl(cloudflareId, variant);
        const cacheKey = await this.getCacheKey(url, variant);
        try {
          await this.fetchAndCache(url, cacheKey);
        } catch (error) {
          // Ignore prefetch errors
        }
      }),
    ).catch(() => {
      // Ignore
    });
  }

  private recordHit(type: 'memory' | 'disk' | 'cloudflare'): void {
    this.totalHits++;
    if (type === 'memory') this.stats.memoryHits++;
    if (type === 'disk') this.stats.diskHits++;
    if (type === 'cloudflare') this.stats.cloudflareHits++;
  }

  private recordMiss(): void {
    // Miss is implicit (totalRequests - totalHits)
  }

  private async cleanExpired(): Promise<void> {
    const ttlMs = this.config.diskCacheTTLDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.metadata.entries()) {
      if (now - entry.timestamp > ttlMs) {
        if (entry.localPath) {
          try {
            await FileSystem.deleteAsync(entry.localPath, { idempotent: true });
            this.stats.diskSize -= entry.size;
            cleaned++;
          } catch (error) {
            // Ignore
          }
        }
        this.metadata.delete(key);
      }
    }

    if (cleaned > 0) {
      await this.saveMetadata();
      logger.info('[ImageCache] Cleaned expired entries:', cleaned);
    }
  }

  private async loadMetadata(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(METADATA_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.metadata = new Map(Object.entries(parsed));
      }
    } catch (error) {
      logger.warn('[ImageCache] Failed to load metadata:', error);
    }
  }

  private async saveMetadata(): Promise<void> {
    try {
      const data = Object.fromEntries(this.metadata);
      await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(data));
    } catch (error) {
      logger.warn('[ImageCache] Failed to save metadata:', error);
    }
  }

  private async loadStats(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STATS_KEY);
      if (data) {
        this.stats = { ...this.stats, ...JSON.parse(data) };
      }
    } catch (error) {
      logger.warn('[ImageCache] Failed to load stats:', error);
    }
  }

  async saveStats(): Promise<void> {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(this.stats));
    } catch (error) {
      logger.warn('[ImageCache] Failed to save stats:', error);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const imageCacheManager = new ImageCacheManager();
// Auto-initialize when not running under Jest so tests can control init.
try {
  const isJest =
    typeof (globalThis as any).jest !== 'undefined' ||
    (typeof process !== 'undefined' &&
      Boolean((process.env as any).JEST_WORKER_ID));
  if (!isJest) {
    void imageCacheManager.initialize().catch((error) => {
      logger.error('[ImageCache] Auto-init failed:', error);
    });
  }
} catch {
  // ignore
}

// Provide legacy-compatible public helpers used by tests and older code
// These delegate to the internal implementations.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(imageCacheManager as any).clear = async function (options?: {
  memory?: boolean;
  disk?: boolean;
}) {
  return await imageCacheManager.clearCache(options);
};

// pruneExpiredEntries -> cleanExpired
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(imageCacheManager as any).pruneExpiredEntries = async function () {
  return (
    (await (imageCacheManager as any).cleanExpired?.()) || Promise.resolve()
  );
};

// cleanupDiskCache helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(imageCacheManager as any).cleanupDiskCache = async function () {
  // Prefer evictLRU to reclaim space; fall back to cleaning expired entries
  try {
    return await (imageCacheManager as any).evictLRU?.(
      Math.max(1, (imageCacheManager as any).config?.maxDiskCacheSizeMB * 0.8),
    );
  } catch {
    return await (imageCacheManager as any).cleanExpired?.();
  }
};

// prefetchImages and prefetchResponsiveVariants
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(imageCacheManager as any).prefetchImages = async function (uris: string[]) {
  return Promise.all((uris || []).map((u) => imageCacheManager.getImage(u)));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(imageCacheManager as any).prefetchResponsiveVariants = async function (
  uri: string,
  cloudflareId?: string,
) {
  if (!cloudflareId) return;
  return await (imageCacheManager as any).prefetchVariants?.(
    cloudflareId,
    undefined,
  );
};

// ============================================================================
// REACT HOOKS
// ============================================================================

export function useImageCache() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const getImage = async (
    uri: string,
    options?: {
      variant?: ImageVariant;
      cloudflareId?: string;
      prefetch?: boolean;
    },
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await imageCacheManager.getImage(uri, options);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async (options?: { memory?: boolean; disk?: boolean }) => {
    setLoading(true);
    setError(null);

    try {
      await imageCacheManager.clearCache(options);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    return await imageCacheManager.getStats();
  };

  return {
    getImage,
    clearCache,
    getStats,
    loading,
    error,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default imageCacheManager;
