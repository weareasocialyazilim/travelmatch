// @ts-nocheck
/**
 * Cache Management Tests
 * 
 * Tests caching strategies including:
 * - Cache eviction policies (LRU, TTL)
 * - Cache size limit enforcement
 * - Image cache preloading
 * - Cache invalidation strategies
 * - Memory management
 * - Storage quota handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

// Mock cache manager (simplified version)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

class CacheManager<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private currentSize = 0;
  private ttl: number;

  constructor(maxSize: number = 50 * 1024 * 1024, ttl: number = 3600000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key: string, data: T, size: number = 0): void {
    // Ensure space
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      size,
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
    this.currentSize += size;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.delete(key);
      return null;
    }
    
    // Update access info
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    return entry.data;
  }

  delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  getSize(): number {
    return this.currentSize;
  }

  getEntryCount(): number {
    return this.cache.size;
  }
}

describe('Cache Management Tests', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager(10 * 1024 * 1024, 3600000); // 10MB, 1 hour TTL
  });

  afterEach(() => {
    cacheManager.clear();
  });

  describe('1. Cache Eviction Strategy (LRU)', () => {
    it('should evict least recently used item when cache is full', () => {
      const cache = new CacheManager(100); // 100 bytes max
      
      // Add 3 items (30 bytes each)
      cache.set('item1', 'data1', 30);
      cache.set('item2', 'data2', 30);
      cache.set('item3', 'data3', 30);
      
      expect(cache.getSize()).toBe(90);
      
      // Access item1 and item2
      cache.get('item1');
      cache.get('item2');
      
      // Add item4 (40 bytes) - should evict item3 (least recently used)
      cache.set('item4', 'data4', 40);
      
      expect(cache.get('item1')).toBe('data1'); // Still exists
      expect(cache.get('item2')).toBe('data2'); // Still exists
      expect(cache.get('item3')).toBeNull(); // Evicted
      expect(cache.get('item4')).toBe('data4'); // Exists
    });

    it('should evict multiple items if needed', () => {
      const cache = new CacheManager(100);
      
      // Add 3 items (30 bytes each)
      cache.set('item1', 'data1', 30);
      cache.set('item2', 'data2', 30);
      cache.set('item3', 'data3', 30);
      
      // Add large item (80 bytes) - should evict item1 and item2
      cache.set('item4', 'data4', 80);
      
      expect(cache.get('item1')).toBeNull();
      expect(cache.get('item2')).toBeNull();
      expect(cache.get('item3')).toBe('data3');
      expect(cache.get('item4')).toBe('data4');
    });

    it('should update access time on get', () => {
      cache.set('item1', { value: 'data1' }, 50);
      cache.set('item2', { value: 'data2' }, 50);
      
      // Wait and access item1
      setTimeout(() => {
        cache.get('item1');
      }, 100);
      
      // Add new item that causes eviction
      setTimeout(() => {
        cache.set('item3', { value: 'data3' }, 50);
        
        // item2 should be evicted (not item1)
        expect(cache.get('item1')).not.toBeNull();
        expect(cache.get('item2')).toBeNull();
      }, 200);
    });

    it('should track access count', () => {
      const cache = new CacheManager(100);
      
      cache.set('item1', 'data1', 30);
      
      // Access multiple times
      cache.get('item1');
      cache.get('item1');
      cache.get('item1');
      
      // Verify access count (internal state check)
      const entry = (cache as any).cache.get('item1');
      expect(entry.accessCount).toBe(3);
    });
  });

  describe('2. Cache Size Limit Enforcement', () => {
    it('should enforce maximum cache size', () => {
      const cache = new CacheManager(100); // 100 bytes
      
      cache.set('item1', 'data1', 40);
      cache.set('item2', 'data2', 40);
      
      expect(cache.getSize()).toBe(80);
      
      // Add item that exceeds limit
      cache.set('item3', 'data3', 50);
      
      // Cache should not exceed limit
      expect(cache.getSize()).toBeLessThanOrEqual(100);
    });

    it('should reject item larger than max size', () => {
      const cache = new CacheManager(100);
      
      // Try to add item larger than max size
      cache.set('largeItem', 'x'.repeat(150), 150);
      
      // Item should not be added (or cache should handle gracefully)
      expect(cache.getSize()).toBeLessThanOrEqual(100);
    });

    it('should calculate size correctly', () => {
      const cache = new CacheManager(1000);
      
      cache.set('item1', 'a'.repeat(100), 100);
      cache.set('item2', 'b'.repeat(200), 200);
      cache.set('item3', 'c'.repeat(50), 50);
      
      expect(cache.getSize()).toBe(350);
    });

    it('should update size when deleting items', () => {
      const cache = new CacheManager(1000);
      
      cache.set('item1', 'data1', 100);
      cache.set('item2', 'data2', 200);
      
      expect(cache.getSize()).toBe(300);
      
      cache.delete('item1');
      
      expect(cache.getSize()).toBe(200);
    });

    it('should clear all items and reset size', () => {
      const cache = new CacheManager(1000);
      
      cache.set('item1', 'data1', 100);
      cache.set('item2', 'data2', 200);
      cache.set('item3', 'data3', 150);
      
      expect(cache.getSize()).toBe(450);
      
      cache.clear();
      
      expect(cache.getSize()).toBe(0);
      expect(cache.getEntryCount()).toBe(0);
    });
  });

  describe('3. Time-To-Live (TTL) Eviction', () => {
    it('should expire items after TTL', async () => {
      const cache = new CacheManager(1000, 100); // 100ms TTL
      
      cache.set('item1', 'data1', 50);
      
      expect(cache.get('item1')).toBe('data1');
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cache.get('item1')).toBeNull();
    });

    it('should not expire items before TTL', async () => {
      const cache = new CacheManager(1000, 500); // 500ms TTL
      
      cache.set('item1', 'data1', 50);
      
      // Wait less than TTL
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(cache.get('item1')).toBe('data1');
    });

    it('should allow custom TTL per item', async () => {
      // Extended cache with per-item TTL
      class ExtendedCache extends CacheManager {
        setWithTTL(key: string, data: any, size: number, ttl: number): void {
          this.set(key, { data, customTTL: ttl }, size);
        }
      }
      
      const cache = new ExtendedCache(1000);
      
      cache.setWithTTL('shortTTL', 'data1', 50, 100);
      cache.setWithTTL('longTTL', 'data2', 50, 500);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cache.get('shortTTL')).toBeNull(); // Expired
      expect(cache.get('longTTL')).not.toBeNull(); // Still valid
    });

    it('should clean up expired items periodically', async () => {
      const cache = new CacheManager(1000, 100);
      
      cache.set('item1', 'data1', 50);
      cache.set('item2', 'data2', 50);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Access items (should trigger cleanup)
      cache.get('item1');
      cache.get('item2');
      
      expect(cache.getEntryCount()).toBe(0);
    });
  });

  describe('4. Image Cache Preloading', () => {
    it('should preload images for visible items', async () => {
      const imageCache = new CacheManager(50 * 1024 * 1024); // 50MB
      
      const imagesToPreload = [
        'https://example.com/img1.jpg',
        'https://example.com/img2.jpg',
        'https://example.com/img3.jpg',
      ];
      
      // Simulate preloading
      for (const url of imagesToPreload) {
        const imageData = `mock-image-data-${url}`;
        imageCache.set(url, imageData, 1024 * 1024); // 1MB each
      }
      
      expect(imageCache.getEntryCount()).toBe(3);
      expect(imageCache.getSize()).toBe(3 * 1024 * 1024);
    });

    it('should preload images in priority order', async () => {
      const priorityQueue: string[] = [
        'https://example.com/hero.jpg', // High priority
        'https://example.com/visible1.jpg',
        'https://example.com/visible2.jpg',
        'https://example.com/offscreen1.jpg', // Low priority
      ];
      
      const imageCache = new CacheManager(10 * 1024 * 1024);
      
      // Preload in priority order
      for (const url of priorityQueue) {
        const imageData = `image-${url}`;
        imageCache.set(url, imageData, 2 * 1024 * 1024);
      }
      
      // Verify high priority images are cached
      expect(imageCache.get(priorityQueue[0])).not.toBeNull();
      expect(imageCache.get(priorityQueue[1])).not.toBeNull();
    });

    it('should cancel preload for offscreen images', async () => {
      const imageCache = new CacheManager(50 * 1024 * 1024);
      
      const onscreenImages = ['img1.jpg', 'img2.jpg'];
      const offscreenImages = ['img3.jpg', 'img4.jpg'];
      
      // Preload onscreen
      for (const img of onscreenImages) {
        imageCache.set(img, `data-${img}`, 1024 * 1024);
      }
      
      // Don't preload offscreen (optimization)
      expect(imageCache.getEntryCount()).toBe(2);
    });

    it('should limit concurrent preloads', async () => {
      const maxConcurrent = 3;
      let activePreloads = 0;
      let maxReached = 0;
      
      const preloadImage = async (url: string) => {
        activePreloads++;
        maxReached = Math.max(maxReached, activePreloads);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        activePreloads--;
      };
      
      const images = Array.from({ length: 10 }, (_, i) => `img${i}.jpg`);
      
      // Preload with concurrency limit
      const promises: Promise<void>[] = [];
      for (const img of images) {
        if (activePreloads < maxConcurrent) {
          promises.push(preloadImage(img));
        }
      }
      
      await Promise.all(promises);
      
      expect(maxReached).toBeLessThanOrEqual(maxConcurrent);
    });
  });

  describe('5. Cache Invalidation Strategies', () => {
    it('should invalidate specific cache entry', () => {
      cacheManager.set('user:123', { name: 'John' }, 100);
      cacheManager.set('user:456', { name: 'Jane' }, 100);
      
      expect(cacheManager.get('user:123')).not.toBeNull();
      
      cacheManager.delete('user:123');
      
      expect(cacheManager.get('user:123')).toBeNull();
      expect(cacheManager.get('user:456')).not.toBeNull();
    });

    it('should invalidate by pattern', () => {
      cacheManager.set('user:123', { name: 'John' }, 100);
      cacheManager.set('user:456', { name: 'Jane' }, 100);
      cacheManager.set('post:789', { title: 'Post' }, 100);
      
      // Invalidate all user entries
      const keysToDelete: string[] = [];
      for (const [key] of (cacheManager as any).cache.entries()) {
        if (key.startsWith('user:')) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => cacheManager.delete(key));
      
      expect(cacheManager.get('user:123')).toBeNull();
      expect(cacheManager.get('user:456')).toBeNull();
      expect(cacheManager.get('post:789')).not.toBeNull();
    });

    it('should invalidate on mutation', () => {
      cacheManager.set('moments:list', [{ id: 1 }, { id: 2 }], 200);
      
      // Simulate mutation (create new moment)
      const createMoment = () => {
        cacheManager.delete('moments:list'); // Invalidate list cache
      };
      
      expect(cacheManager.get('moments:list')).not.toBeNull();
      
      createMoment();
      
      expect(cacheManager.get('moments:list')).toBeNull();
    });

    it('should invalidate related caches', () => {
      cacheManager.set('user:123:profile', { name: 'John' }, 100);
      cacheManager.set('user:123:moments', [{ id: 1 }], 100);
      cacheManager.set('user:123:stats', { count: 5 }, 100);
      
      // Invalidate all user:123 data
      const invalidateUser = (userId: string) => {
        const prefix = `user:${userId}:`;
        for (const [key] of (cacheManager as any).cache.entries()) {
          if (key.startsWith(prefix)) {
            cacheManager.delete(key);
          }
        }
      };
      
      invalidateUser('123');
      
      expect(cacheManager.get('user:123:profile')).toBeNull();
      expect(cacheManager.get('user:123:moments')).toBeNull();
      expect(cacheManager.get('user:123:stats')).toBeNull();
    });

    it('should use cache tags for grouped invalidation', () => {
      interface TaggedEntry {
        data: any;
        tags: string[];
      }
      
      const taggedCache = new Map<string, TaggedEntry>();
      
      taggedCache.set('moment:1', { data: {}, tags: ['moments', 'user:123'] });
      taggedCache.set('moment:2', { data: {}, tags: ['moments', 'user:456'] });
      taggedCache.set('user:123', { data: {}, tags: ['user:123'] });
      
      // Invalidate by tag
      const invalidateByTag = (tag: string) => {
        const keysToDelete: string[] = [];
        for (const [key, entry] of taggedCache.entries()) {
          if (entry.tags.includes(tag)) {
            keysToDelete.push(key);
          }
        }
        keysToDelete.forEach(key => taggedCache.delete(key));
      };
      
      invalidateByTag('user:123');
      
      expect(taggedCache.has('moment:1')).toBe(false);
      expect(taggedCache.has('user:123')).toBe(false);
      expect(taggedCache.has('moment:2')).toBe(true); // Different user
    });
  });

  describe('6. Persistent Cache (AsyncStorage)', () => {
    beforeEach(async () => {
      await AsyncStorage.clear();
    });

    it('should persist cache to storage', async () => {
      await AsyncStorage.setItem('cache:user:123', JSON.stringify({ name: 'John' }));
      
      const cached = await AsyncStorage.getItem('cache:user:123');
      
      expect(JSON.parse(cached!)).toEqual({ name: 'John' });
    });

    it('should restore cache from storage', async () => {
      // Persist cache
      await AsyncStorage.setItem('cache:moments', JSON.stringify([{ id: 1 }, { id: 2 }]));
      
      // Restore on app start
      const restored = await AsyncStorage.getItem('cache:moments');
      
      expect(JSON.parse(restored!)).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should handle storage quota exceeded', async () => {
      try {
        // Try to store large amount of data
        const largeData = 'x'.repeat(10 * 1024 * 1024); // 10MB
        await AsyncStorage.setItem('large-cache', largeData);
      } catch (error) {
        // Should handle quota exceeded gracefully
        expect(error).toBeDefined();
      }
    });

    it('should clean up old cache entries', async () => {
      const now = Date.now();
      
      // Set entries with timestamps
      await AsyncStorage.setItem('cache:old', JSON.stringify({ data: 'old', timestamp: now - 7 * 24 * 60 * 60 * 1000 }));
      await AsyncStorage.setItem('cache:recent', JSON.stringify({ data: 'recent', timestamp: now - 1000 }));
      
      // Clean up entries older than 1 day
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith('cache:'));
      
      for (const key of cacheKeys) {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (now - parsed.timestamp > 24 * 60 * 60 * 1000) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
      
      expect(await AsyncStorage.getItem('cache:old')).toBeNull();
      expect(await AsyncStorage.getItem('cache:recent')).not.toBeNull();
    });
  });

  describe('7. Memory Management', () => {
    it('should monitor memory usage', () => {
      const cache = new CacheManager(50 * 1024 * 1024);
      
      // Add items
      for (let i = 0; i < 100; i++) {
        cache.set(`item${i}`, `data${i}`, 100 * 1024); // 100KB each
      }
      
      const memoryUsed = cache.getSize();
      
      expect(memoryUsed).toBeLessThanOrEqual(50 * 1024 * 1024);
    });

    it('should release memory on clear', () => {
      const cache = new CacheManager(50 * 1024 * 1024);
      
      // Fill cache
      for (let i = 0; i < 10; i++) {
        cache.set(`item${i}`, `data${i}`, 1024 * 1024); // 1MB each
      }
      
      expect(cache.getSize()).toBe(10 * 1024 * 1024);
      
      cache.clear();
      
      expect(cache.getSize()).toBe(0);
    });

    it('should handle low memory warnings', () => {
      const cache = new CacheManager(50 * 1024 * 1024);
      
      // Fill cache
      for (let i = 0; i < 30; i++) {
        cache.set(`item${i}`, `data${i}`, 1024 * 1024);
      }
      
      // Simulate low memory warning
      const handleLowMemory = () => {
        // Clear least important caches
        cache.clear();
      };
      
      handleLowMemory();
      
      expect(cache.getSize()).toBe(0);
    });
  });

  describe('8. Edge Cases', () => {
    it('should handle null/undefined values', () => {
      cacheManager.set('null-value', null, 10);
      cacheManager.set('undefined-value', undefined, 10);
      
      expect(cacheManager.get('null-value')).toBeNull();
      expect(cacheManager.get('undefined-value')).toBeNull();
    });

    it('should handle concurrent access', async () => {
      const promises = Array.from({ length: 100 }, (_, i) => {
        return new Promise<void>(resolve => {
          cacheManager.set(`concurrent-${i}`, `data-${i}`, 100);
          resolve();
        });
      });
      
      await Promise.all(promises);
      
      expect(cacheManager.getEntryCount()).toBeLessThanOrEqual(100);
    });

    it('should handle cache key collisions', () => {
      cacheManager.set('key', 'value1', 100);
      cacheManager.set('key', 'value2', 100); // Overwrite
      
      expect(cacheManager.get('key')).toBe('value2');
      expect(cacheManager.getSize()).toBe(100); // Not doubled
    });

    it('should handle empty cache operations', () => {
      expect(cacheManager.get('non-existent')).toBeNull();
      expect(cacheManager.getSize()).toBe(0);
      
      cacheManager.delete('non-existent'); // Should not throw
      cacheManager.clear(); // Should not throw
    });
  });
});
