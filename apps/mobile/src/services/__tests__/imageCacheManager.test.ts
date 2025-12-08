/**
 * Image Cache Manager Tests
 * 
 * Tests for multi-tier caching (Memory → Disk → Cloudflare → Network)
 */

import { imageCacheManager, type CacheConfig } from '../imageCacheManager';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('expo-file-system');
jest.mock('expo-crypto');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../cloudflareImages', () => ({
  getImageUrl: jest.fn((id, variant) => `https://imagedelivery.net/account/${id}/${variant}`),
  getResponsiveUrls: jest.fn(() => ({
    thumbnail: 'https://imagedelivery.net/account/id/thumbnail',
    small: 'https://imagedelivery.net/account/id/small',
    medium: 'https://imagedelivery.net/account/id/medium',
    large: 'https://imagedelivery.net/account/id/large',
    original: 'https://imagedelivery.net/account/id/original',
  })),
  uploadToCloudflare: jest.fn(),
}));

const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const mockCrypto = Crypto as jest.Mocked<typeof Crypto>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('ImageCacheManager', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Reset FileSystem mocks
    mockFileSystem.cacheDirectory = 'file:///cache/';
    mockFileSystem.getInfoAsync = jest.fn().mockResolvedValue({ exists: false });
    mockFileSystem.makeDirectoryAsync = jest.fn().mockResolvedValue(undefined);
    mockFileSystem.readDirectoryAsync = jest.fn().mockResolvedValue([]);
    mockFileSystem.deleteAsync = jest.fn().mockResolvedValue(undefined);
    mockFileSystem.downloadAsync = jest.fn().mockResolvedValue({ uri: 'file:///cache/test.jpg', status: 200, headers: {}, md5: 'abc123' });
    
    // Reset AsyncStorage mocks
    mockAsyncStorage.getItem = jest.fn().mockResolvedValue(null);
    mockAsyncStorage.setItem = jest.fn().mockResolvedValue(undefined);
    mockAsyncStorage.removeItem = jest.fn().mockResolvedValue(undefined);
    
    // Reset Crypto mocks
    mockCrypto.digestStringAsync = jest.fn().mockResolvedValue('mocked_hash');
    
    // Initialize cache manager
    await imageCacheManager.initialize();
  });

  afterEach(async () => {
    await imageCacheManager.clear();
  });

  describe('Initialization', () => {
    it('should create cache directory on init', async () => {
      expect(mockFileSystem.getInfoAsync).toHaveBeenCalled();
      expect(mockFileSystem.makeDirectoryAsync).toHaveBeenCalled();
    });

    it('should load existing metadata from AsyncStorage', async () => {
      const metadata = JSON.stringify({
        'hash1': { uri: 'http://example.com/1.jpg', size: 1024, timestamp: Date.now(), accessCount: 1, lastAccessed: Date.now() }
      });
      mockAsyncStorage.getItem = jest.fn().mockResolvedValue(metadata);
      
      await imageCacheManager.initialize();
      
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@image_cache_metadata');
    });

    it('should initialize with custom config', async () => {
      const customConfig: CacheConfig = {
        maxMemoryCacheSizeMB: 100,
        maxDiskCacheSizeMB: 1000,
        diskCacheTTLDays: 60,
        enablePrefetch: false,
        enableOfflineCache: false,
        cloudflareFallback: false,
      };

      await imageCacheManager.initialize(customConfig);
      
      const stats = await imageCacheManager.getStats();
      expect(stats).toBeDefined();
    });
  });

  describe('Memory Cache', () => {
    it('should cache image in memory', async () => {
      const uri = 'http://example.com/image.jpg';
      
      await imageCacheManager.getCachedImage(uri);
      const cachedUri = await imageCacheManager.getCachedImage(uri);
      
      const stats = await imageCacheManager.getStats();
      expect(stats.memoryHits).toBeGreaterThan(0);
    });

    it('should evict LRU entries when memory limit exceeded', async () => {
      const images = Array.from({ length: 100 }, (_, i) => `http://example.com/image${i}.jpg`);
      
      for (const uri of images) {
        await imageCacheManager.getCachedImage(uri);
      }
      
      const stats = await imageCacheManager.getStats();
      expect(stats.memorySize).toBeLessThanOrEqual(50 * 1024 * 1024); // 50MB limit
    });

    it('should update access count and timestamp', async () => {
      const uri = 'http://example.com/image.jpg';
      
      await imageCacheManager.getCachedImage(uri);
      await imageCacheManager.getCachedImage(uri);
      await imageCacheManager.getCachedImage(uri);
      
      // Access count should be tracked internally
      const stats = await imageCacheManager.getStats();
      expect(stats.memoryHits).toBe(2); // First is miss, rest are hits
    });
  });

  describe('Disk Cache', () => {
    it('should save image to disk cache', async () => {
      const uri = 'http://example.com/image.jpg';
      
      await imageCacheManager.getCachedImage(uri);
      
      expect(mockFileSystem.downloadAsync).toHaveBeenCalled();
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@image_cache_metadata', expect.any(String));
    });

    it('should load image from disk cache', async () => {
      const uri = 'http://example.com/image.jpg';
      const hash = 'mocked_hash';
      
      // Simulate existing disk cache
      mockFileSystem.getInfoAsync = jest.fn().mockResolvedValue({ 
        exists: true, 
        size: 1024, 
        isDirectory: false,
        modificationTime: Date.now() / 1000,
        uri: `file:///cache/images/${hash}.jpg`
      });
      
      const cachedUri = await imageCacheManager.getCachedImage(uri);
      
      expect(cachedUri).toBe(`file:///cache/images/${hash}.jpg`);
    });

    it('should respect disk cache TTL', async () => {
      const uri = 'http://example.com/image.jpg';
      const oldTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000); // 31 days ago
      
      const metadata = JSON.stringify({
        'mocked_hash': {
          uri,
          localPath: 'file:///cache/test.jpg',
          size: 1024,
          timestamp: oldTimestamp,
          accessCount: 1,
          lastAccessed: oldTimestamp,
        }
      });
      
      mockAsyncStorage.getItem = jest.fn().mockResolvedValue(metadata);
      await imageCacheManager.initialize();
      
      // Should delete expired cache entry
      expect(mockFileSystem.deleteAsync).toHaveBeenCalled();
    });

    it('should clean up disk cache when size limit exceeded', async () => {
      // Mock large cache entries
      mockFileSystem.readDirectoryAsync = jest.fn().mockResolvedValue(['image1.jpg', 'image2.jpg']);
      mockFileSystem.getInfoAsync = jest.fn()
        .mockResolvedValueOnce({ exists: true, isDirectory: true })
        .mockResolvedValue({ exists: true, size: 300 * 1024 * 1024, isDirectory: false }); // 300MB each
      
      await imageCacheManager.cleanupDiskCache();
      
      expect(mockFileSystem.deleteAsync).toHaveBeenCalled();
    });
  });

  describe('Cloudflare Integration', () => {
    it('should use Cloudflare URL when cloudflareId provided', async () => {
      const uri = 'http://example.com/image.jpg';
      const cloudflareId = 'cf-image-123';
      
      const cachedUri = await imageCacheManager.getCachedImage(uri, cloudflareId, 'medium');
      
      // Should use Cloudflare URL
      expect(cachedUri).toContain('imagedelivery.net');
    });

    it('should handle responsive variants', async () => {
      const uri = 'http://example.com/image.jpg';
      const cloudflareId = 'cf-image-123';
      
      await imageCacheManager.prefetchResponsiveVariants(uri, cloudflareId);
      
      // Should prefetch multiple variants
      expect(mockFileSystem.downloadAsync).toHaveBeenCalledTimes(5); // 5 variants
    });

    it('should fallback to original URL when Cloudflare fails', async () => {
      const uri = 'http://example.com/image.jpg';
      const cloudflareId = 'cf-image-123';
      
      // Mock Cloudflare failure
      mockFileSystem.downloadAsync = jest.fn()
        .mockRejectedValueOnce(new Error('Cloudflare error'))
        .mockResolvedValueOnce({ uri: 'file:///cache/original.jpg', status: 200, headers: {}, md5: 'abc' });
      
      const cachedUri = await imageCacheManager.getCachedImage(uri, cloudflareId);
      
      expect(mockFileSystem.downloadAsync).toHaveBeenCalledTimes(2); // CF + fallback
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache hits and misses', async () => {
      const uri1 = 'http://example.com/image1.jpg';
      const uri2 = 'http://example.com/image2.jpg';
      
      await imageCacheManager.getCachedImage(uri1);
      await imageCacheManager.getCachedImage(uri1); // hit
      await imageCacheManager.getCachedImage(uri2);
      await imageCacheManager.getCachedImage(uri2); // hit
      
      const stats = await imageCacheManager.getStats();
      expect(stats.hitRate).toBeGreaterThan(0);
      expect(stats.missRate).toBeGreaterThan(0);
    });

    it('should calculate cache sizes correctly', async () => {
      const uri = 'http://example.com/image.jpg';
      
      mockFileSystem.getInfoAsync = jest.fn().mockResolvedValue({ 
        exists: true, 
        size: 5 * 1024 * 1024, // 5MB
        isDirectory: false 
      });
      
      await imageCacheManager.getCachedImage(uri);
      
      const stats = await imageCacheManager.getStats();
      expect(stats.diskSize).toBeGreaterThan(0);
    });

    it('should reset statistics', async () => {
      await imageCacheManager.getCachedImage('http://example.com/1.jpg');
      await imageCacheManager.getCachedImage('http://example.com/2.jpg');
      
      await imageCacheManager.resetStats();
      
      const stats = await imageCacheManager.getStats();
      expect(stats.memoryHits).toBe(0);
      expect(stats.diskHits).toBe(0);
      expect(stats.cloudflareHits).toBe(0);
    });
  });

  describe('Cache Management', () => {
    it('should clear all caches', async () => {
      await imageCacheManager.getCachedImage('http://example.com/1.jpg');
      await imageCacheManager.getCachedImage('http://example.com/2.jpg');
      
      await imageCacheManager.clear();
      
      expect(mockFileSystem.deleteAsync).toHaveBeenCalled();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
    });

    it('should remove specific image from cache', async () => {
      const uri = 'http://example.com/image.jpg';
      
      await imageCacheManager.getCachedImage(uri);
      await imageCacheManager.removeCachedImage(uri);
      
      expect(mockFileSystem.deleteAsync).toHaveBeenCalled();
    });

    it('should prune expired entries', async () => {
      const oldTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000);
      
      const metadata = JSON.stringify({
        'hash1': { uri: 'http://example.com/1.jpg', size: 1024, timestamp: oldTimestamp, accessCount: 1, lastAccessed: oldTimestamp },
        'hash2': { uri: 'http://example.com/2.jpg', size: 1024, timestamp: Date.now(), accessCount: 1, lastAccessed: Date.now() },
      });
      
      mockAsyncStorage.getItem = jest.fn().mockResolvedValue(metadata);
      await imageCacheManager.initialize();
      
      await imageCacheManager.pruneExpiredEntries();
      
      expect(mockFileSystem.deleteAsync).toHaveBeenCalled();
    });
  });

  describe('Offline Support', () => {
    it('should use cached images when offline', async () => {
      const uri = 'http://example.com/image.jpg';
      
      // First download
      await imageCacheManager.getCachedImage(uri);
      
      // Simulate offline
      mockFileSystem.downloadAsync = jest.fn().mockRejectedValue(new Error('Network error'));
      
      // Should still return cached image
      const cachedUri = await imageCacheManager.getCachedImage(uri);
      expect(cachedUri).toBeDefined();
    });

    it('should handle offline mode gracefully', async () => {
      const uri = 'http://example.com/new-image.jpg';
      
      // Simulate offline, no cache
      mockFileSystem.downloadAsync = jest.fn().mockRejectedValue(new Error('Network error'));
      mockFileSystem.getInfoAsync = jest.fn().mockResolvedValue({ exists: false });
      
      const cachedUri = await imageCacheManager.getCachedImage(uri);
      
      // Should return original URI as fallback
      expect(cachedUri).toBe(uri);
    });
  });

  describe('Prefetching', () => {
    it('should prefetch multiple images', async () => {
      const uris = [
        'http://example.com/1.jpg',
        'http://example.com/2.jpg',
        'http://example.com/3.jpg',
      ];
      
      await imageCacheManager.prefetchImages(uris);
      
      expect(mockFileSystem.downloadAsync).toHaveBeenCalledTimes(3);
    });

    it('should prefetch responsive variants', async () => {
      const uri = 'http://example.com/image.jpg';
      const cloudflareId = 'cf-123';
      
      await imageCacheManager.prefetchResponsiveVariants(uri, cloudflareId);
      
      // Should download 5 variants
      expect(mockFileSystem.downloadAsync).toHaveBeenCalledTimes(5);
    });

    it('should skip prefetch when disabled in config', async () => {
      await imageCacheManager.initialize({ enablePrefetch: false } as CacheConfig);
      
      const uris = ['http://example.com/1.jpg'];
      await imageCacheManager.prefetchImages(uris);
      
      // Should not download if prefetch disabled
      expect(mockFileSystem.downloadAsync).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle download errors gracefully', async () => {
      const uri = 'http://example.com/invalid.jpg';
      
      mockFileSystem.downloadAsync = jest.fn().mockRejectedValue(new Error('Download failed'));
      
      const cachedUri = await imageCacheManager.getCachedImage(uri);
      
      // Should return original URI as fallback
      expect(cachedUri).toBe(uri);
    });

    it('should handle corrupted metadata', async () => {
      mockAsyncStorage.getItem = jest.fn().mockResolvedValue('invalid json');
      
      // Should not throw
      await expect(imageCacheManager.initialize()).resolves.not.toThrow();
    });

    it('should handle file system errors', async () => {
      mockFileSystem.makeDirectoryAsync = jest.fn().mockRejectedValue(new Error('Permission denied'));
      
      // Should not throw
      await expect(imageCacheManager.initialize()).resolves.not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should complete cache lookup in < 100ms', async () => {
      const uri = 'http://example.com/image.jpg';
      
      // Pre-cache image
      await imageCacheManager.getCachedImage(uri);
      
      const start = Date.now();
      await imageCacheManager.getCachedImage(uri);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent requests efficiently', async () => {
      const uris = Array.from({ length: 50 }, (_, i) => `http://example.com/image${i}.jpg`);
      
      const start = Date.now();
      await Promise.all(uris.map(uri => imageCacheManager.getCachedImage(uri)));
      const duration = Date.now() - start;
      
      // Should complete in reasonable time
      expect(duration).toBeLessThan(5000);
    });
  });
});
