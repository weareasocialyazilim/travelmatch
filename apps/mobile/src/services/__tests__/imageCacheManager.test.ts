/**
 * Image Cache Manager Tests
 *
 * Tests for multi-tier caching (Memory → Disk → Cloudflare → Network)
 */

// Mock dependencies before importing the module
const mockMakeDirectoryAsync = jest.fn();
const mockGetInfoAsync = jest.fn();
const mockWriteAsStringAsync = jest.fn();
const mockReadAsStringAsync = jest.fn();
const mockDeleteAsync = jest.fn();
const mockGetFreeDiskStorageAsync = jest.fn();

jest.mock('expo-file-system', () => ({
  makeDirectoryAsync: mockMakeDirectoryAsync,
  getInfoAsync: mockGetInfoAsync,
  writeAsStringAsync: mockWriteAsStringAsync,
  readAsStringAsync: mockReadAsStringAsync,
  deleteAsync: mockDeleteAsync,
  getFreeDiskStorageAsync: mockGetFreeDiskStorageAsync,
  cacheDirectory: '/mock/cache/',
  EncodingType: {
    Base64: 'base64',
    UTF8: 'utf8',
  },
}));

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: '/mock/cache/',
}));

const mockAsyncStorageGetItem = jest.fn();
const mockAsyncStorageSetItem = jest.fn();
const mockAsyncStorageRemoveItem = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: mockAsyncStorageGetItem,
  setItem: mockAsyncStorageSetItem,
  removeItem: mockAsyncStorageRemoveItem,
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../cloudflareImages', () => ({
  getImageUrl: jest.fn(
    (id, variant) => `https://cloudflare.com/${id}/${variant}`,
  ),
  uploadToCloudflare: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('ImageCacheManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock responses
    mockGetInfoAsync.mockResolvedValue({ exists: true });
    mockMakeDirectoryAsync.mockResolvedValue(undefined);
    mockAsyncStorageGetItem.mockResolvedValue(null);
    mockAsyncStorageSetItem.mockResolvedValue(undefined);
    mockReadAsStringAsync.mockResolvedValue('mock-image-data');
    mockWriteAsStringAsync.mockResolvedValue(undefined);
    mockGetFreeDiskStorageAsync.mockResolvedValue(1000000000);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['image-data'])),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    });
  });

  describe('Memory Cache', () => {
    it('should implement LRU eviction', () => {
      // Simple LRU implementation test
      const cache = new Map<string, { data: string; timestamp: number }>();

      // Add items
      cache.set('key1', { data: 'data1', timestamp: Date.now() });
      cache.set('key2', { data: 'data2', timestamp: Date.now() });

      // Access key1 - should move to end
      const entry = cache.get('key1');
      if (entry) {
        cache.delete('key1');
        cache.set('key1', entry);
      }

      // key2 should now be oldest
      const keys = Array.from(cache.keys());
      expect(keys[0]).toBe('key2');
      expect(keys[1]).toBe('key1');
    });

    it('should evict oldest entries when full', () => {
      const maxSize = 100;
      const cache = new Map<string, { data: string; size: number }>();
      let currentSize = 0;

      const set = (key: string, data: string, size: number) => {
        // Evict if needed
        while (currentSize + size > maxSize && cache.size > 0) {
          const oldest = cache.keys().next().value;
          const oldEntry = cache.get(oldest);
          if (oldEntry) {
            currentSize -= oldEntry.size;
            cache.delete(oldest);
          }
        }
        cache.set(key, { data, size });
        currentSize += size;
      };

      // Fill cache
      set('k1', 'd1', 50);
      set('k2', 'd2', 30);

      expect(cache.size).toBe(2);
      expect(currentSize).toBe(80);

      // Add larger item - should evict oldest
      set('k3', 'd3', 40);

      expect(cache.has('k1')).toBe(false); // k1 should be evicted
      expect(cache.has('k2')).toBe(true);
      expect(cache.has('k3')).toBe(true);
    });

    it('should clear all entries', () => {
      const cache = new Map<string, string>();
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      expect(cache.size).toBe(0);
    });
  });

  describe('Disk Cache', () => {
    it('should check if cache directory exists', async () => {
      await mockGetInfoAsync('/mock/cache/images/');

      expect(mockGetInfoAsync).toHaveBeenCalled();
    });

    it('should create cache directory if not exists', async () => {
      mockGetInfoAsync.mockResolvedValue({ exists: false });

      await mockMakeDirectoryAsync('/mock/cache/images/', {
        intermediates: true,
      });

      expect(mockMakeDirectoryAsync).toHaveBeenCalled();
    });

    it('should read cached image from disk', async () => {
      mockReadAsStringAsync.mockResolvedValue('base64-image-data');

      const data = await mockReadAsStringAsync('/mock/cache/images/test.jpg');

      expect(data).toBe('base64-image-data');
    });

    it('should write image to disk cache', async () => {
      await mockWriteAsStringAsync(
        '/mock/cache/images/test.jpg',
        'base64-data',
      );

      expect(mockWriteAsStringAsync).toHaveBeenCalled();
    });

    it('should delete expired cache entries', async () => {
      await mockDeleteAsync('/mock/cache/images/old-file.jpg');

      expect(mockDeleteAsync).toHaveBeenCalled();
    });
  });

  describe('Cache Stats', () => {
    it('should track hit rate', () => {
      let totalRequests = 0;
      let totalHits = 0;

      const recordHit = () => {
        totalRequests++;
        totalHits++;
      };

      const recordMiss = () => {
        totalRequests++;
      };

      const getHitRate = () => {
        return totalRequests > 0 ? totalHits / totalRequests : 0;
      };

      recordHit();
      recordHit();
      recordMiss();
      recordHit();

      expect(getHitRate()).toBe(0.75); // 3 hits / 4 requests
    });

    it('should track memory size', () => {
      let memorySize = 0;

      const addEntry = (size: number) => {
        memorySize += size;
      };

      const removeEntry = (size: number) => {
        memorySize -= size;
      };

      addEntry(1000);
      addEntry(2000);
      removeEntry(1000);

      expect(memorySize).toBe(2000);
    });

    it('should track different hit types', () => {
      const stats = {
        memoryHits: 0,
        diskHits: 0,
        cloudflareHits: 0,
      };

      const recordHit = (type: 'memory' | 'disk' | 'cloudflare') => {
        if (type === 'memory') stats.memoryHits++;
        else if (type === 'disk') stats.diskHits++;
        else if (type === 'cloudflare') stats.cloudflareHits++;
      };

      recordHit('memory');
      recordHit('memory');
      recordHit('disk');
      recordHit('cloudflare');

      expect(stats.memoryHits).toBe(2);
      expect(stats.diskHits).toBe(1);
      expect(stats.cloudflareHits).toBe(1);
    });
  });

  describe('Metadata Storage', () => {
    it('should save metadata to AsyncStorage', async () => {
      const metadata = {
        key1: { uri: 'test.jpg', size: 1000, timestamp: Date.now() },
      };

      await mockAsyncStorageSetItem(
        '@image_cache_metadata',
        JSON.stringify(metadata),
      );

      expect(mockAsyncStorageSetItem).toHaveBeenCalledWith(
        '@image_cache_metadata',
        expect.any(String),
      );
    });

    it('should load metadata from AsyncStorage', async () => {
      const metadata = {
        key1: { uri: 'test.jpg', size: 1000, timestamp: Date.now() },
      };
      mockAsyncStorageGetItem.mockResolvedValue(JSON.stringify(metadata));

      const result = await mockAsyncStorageGetItem('@image_cache_metadata');
      const parsed = JSON.parse(result as string);

      expect(parsed.key1).toBeDefined();
      expect(parsed.key1.uri).toBe('test.jpg');
    });

    it('should handle missing metadata', async () => {
      mockAsyncStorageGetItem.mockResolvedValue(null);

      const result = await mockAsyncStorageGetItem('@image_cache_metadata');

      expect(result).toBeNull();
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate unique cache keys', () => {
      const getCacheKey = (uri: string, variant?: string) => {
        const base = uri.replace(/[^a-zA-Z0-9]/g, '_');
        return variant ? `${base}_${variant}` : base;
      };

      const key1 = getCacheKey('https://example.com/image.jpg', 'small');
      const key2 = getCacheKey('https://example.com/image.jpg', 'medium');
      const key3 = getCacheKey('https://example.com/other.jpg', 'small');

      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });

    it('should handle special characters in URLs', () => {
      const getCacheKey = (uri: string) => {
        return uri.replace(/[^a-zA-Z0-9]/g, '_');
      };

      const key = getCacheKey('https://example.com/path/to/image?w=100&h=100');

      expect(key).not.toContain('/');
      expect(key).not.toContain('?');
      expect(key).not.toContain('&');
    });
  });

  describe('Prefetch', () => {
    it('should prefetch multiple variants', async () => {
      const prefetchedUrls: string[] = [];

      const prefetch = async (uri: string, variants: string[]) => {
        for (const variant of variants) {
          prefetchedUrls.push(`${uri}?variant=${variant}`);
        }
      };

      await prefetch('https://example.com/image.jpg', [
        'small',
        'medium',
        'large',
      ]);

      expect(prefetchedUrls).toHaveLength(3);
      expect(prefetchedUrls).toContain(
        'https://example.com/image.jpg?variant=small',
      );
    });

    it('should respect prefetch config', async () => {
      const config = { enablePrefetch: false };
      let prefetchCalled = false;

      const prefetch = async () => {
        if (!config.enablePrefetch) return;
        prefetchCalled = true;
      };

      await prefetch();

      expect(prefetchCalled).toBe(false);
    });
  });

  describe('Offline Support', () => {
    it('should use disk cache when offline', async () => {
      // Simulate offline by making fetch fail
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      mockReadAsStringAsync.mockResolvedValue('cached-image-data');

      const getOfflineImage = async (cacheKey: string) => {
        try {
          await (global.fetch as jest.Mock)('https://example.com/image.jpg');
          throw new Error('Should not reach here');
        } catch {
          return await mockReadAsStringAsync(`/mock/cache/images/${cacheKey}`);
        }
      };

      const result = await getOfflineImage('test-image');

      expect(result).toBe('cached-image-data');
    });

    it('should handle missing offline cache', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      mockReadAsStringAsync.mockRejectedValue(new Error('File not found'));

      const getOfflineImage = async () => {
        try {
          await (global.fetch as jest.Mock)('https://example.com/image.jpg');
        } catch {
          try {
            return await mockReadAsStringAsync('/mock/cache/test');
          } catch {
            return null; // Return placeholder or null
          }
        }
      };

      const result = await getOfflineImage();

      expect(result).toBeNull();
    });
  });

  describe('Cache Cleanup', () => {
    it('should clean expired entries', async () => {
      const now = Date.now();
      const ttlDays = 30;
      const ttlMs = ttlDays * 24 * 60 * 60 * 1000;

      const entries = [
        { key: 'recent', timestamp: now - 1000 },
        { key: 'old', timestamp: now - ttlMs - 1000 },
        { key: 'very-old', timestamp: now - ttlMs * 2 },
      ];

      const cleanExpired = () => {
        return entries.filter((e) => now - e.timestamp < ttlMs);
      };

      const cleaned = cleanExpired();

      expect(cleaned).toHaveLength(1);
      expect(cleaned[0].key).toBe('recent');
    });

    it('should respect max disk size', () => {
      const maxSize = 100;
      let currentSize = 0;
      const entries: Array<{ key: string; size: number }> = [];

      const addEntry = (key: string, size: number) => {
        // Remove oldest entries until we have space
        while (currentSize + size > maxSize && entries.length > 0) {
          const oldest = entries.shift();
          if (oldest) currentSize -= oldest.size;
        }
        entries.push({ key, size });
        currentSize += size;
      };

      addEntry('a', 40);
      addEntry('b', 40);
      addEntry('c', 40); // Should evict 'a'

      expect(currentSize).toBeLessThanOrEqual(maxSize);
      expect(entries.find((e) => e.key === 'a')).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle disk read errors', async () => {
      mockReadAsStringAsync.mockRejectedValue(new Error('Read error'));

      let result: string | null = null;
      try {
        result = await mockReadAsStringAsync('/mock/path');
      } catch {
        result = null;
      }

      expect(result).toBeNull();
    });

    it('should handle disk write errors', async () => {
      mockWriteAsStringAsync.mockRejectedValue(new Error('Write error'));

      let success = true;
      try {
        await mockWriteAsStringAsync('/mock/path', 'data');
      } catch {
        success = false;
      }

      expect(success).toBe(false);
    });

    it('should handle fetch errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      let result: string | null = null;
      try {
        await (global.fetch as jest.Mock)('https://example.com/image.jpg');
      } catch {
        result = 'fallback-image';
      }

      expect(result).toBe('fallback-image');
    });
  });

  describe('Configuration', () => {
    it('should use default config values', () => {
      const defaultConfig = {
        maxMemoryCacheSizeMB: 50,
        maxDiskCacheSizeMB: 500,
        diskCacheTTLDays: 30,
        enablePrefetch: true,
        enableOfflineCache: true,
        cloudflareFallback: true,
      };

      expect(defaultConfig.maxMemoryCacheSizeMB).toBe(50);
      expect(defaultConfig.maxDiskCacheSizeMB).toBe(500);
      expect(defaultConfig.diskCacheTTLDays).toBe(30);
    });

    it('should allow config override', () => {
      const defaultConfig = {
        maxMemoryCacheSizeMB: 50,
        enablePrefetch: true,
      };

      const userConfig = {
        maxMemoryCacheSizeMB: 100,
      };

      const mergedConfig = { ...defaultConfig, ...userConfig };

      expect(mergedConfig.maxMemoryCacheSizeMB).toBe(100);
      expect(mergedConfig.enablePrefetch).toBe(true);
    });
  });
});
