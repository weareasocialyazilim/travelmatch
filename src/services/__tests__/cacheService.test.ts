/**
 * CacheService Tests
 * Tests for offline caching functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheService, CACHE_KEYS } from '../cacheService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('CacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear all cache before each test
    cacheService.clearMemoryCache();
  });

  describe('set', () => {
    it('should store data in AsyncStorage', async () => {
      const mockData = { id: '1', name: 'Test Moment' };

      await cacheService.set('test_key', mockData);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const [[key, value]] = (AsyncStorage.setItem as jest.Mock).mock.calls;
      expect(key).toBe('@travelmatch_cache_test_key');

      const storedData = JSON.parse(value);
      expect(storedData.data).toEqual(mockData);
      expect(storedData.timestamp).toBeDefined();
      expect(storedData.expiresAt).toBeDefined();
    });

    it('should use custom expiry time', async () => {
      const mockData = { id: '1' };
      const customExpiry = 10000; // 10 seconds

      await cacheService.set('test_key', mockData, { expiryMs: customExpiry });

      const [[, value]] = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const storedData = JSON.parse(value);

      expect(storedData.expiresAt - storedData.timestamp).toBe(customExpiry);
    });
  });

  describe('get', () => {
    it('should return null for non-existent keys', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await cacheService.get('non_existent');

      expect(result).toBeNull();
    });

    it('should return cached data if not expired', async () => {
      const mockData = { id: '1', name: 'Test' };
      const cacheItem = {
        data: mockData,
        timestamp: Date.now(),
        expiresAt: Date.now() + 60000, // 1 minute in future
        size: 100,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cacheItem),
      );

      const result = await cacheService.get('test_key');

      expect(result).toEqual(mockData);
    });

    it('should return null and remove expired data', async () => {
      const mockData = { id: '1', name: 'Test' };
      const cacheItem = {
        data: mockData,
        timestamp: Date.now() - 120000, // 2 minutes ago
        expiresAt: Date.now() - 60000, // Expired 1 minute ago
        size: 100,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cacheItem),
      );

      const result = await cacheService.get('test_key');

      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        '@travelmatch_cache_test_key',
      );
    });

    it('should return null when forceRefresh is true', async () => {
      const mockData = { id: '1' };
      const cacheItem = {
        data: mockData,
        timestamp: Date.now(),
        expiresAt: Date.now() + 60000,
        size: 100,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cacheItem),
      );

      const result = await cacheService.get('test_key', { forceRefresh: true });

      expect(result).toBeNull();
    });
  });

  describe('getWithStale', () => {
    it('should return data with isStale=false when not expired', async () => {
      const mockData = { id: '1' };
      const cacheItem = {
        data: mockData,
        timestamp: Date.now(),
        expiresAt: Date.now() + 60000,
        size: 100,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cacheItem),
      );

      const result = await cacheService.getWithStale('test_key');

      expect(result.data).toEqual(mockData);
      expect(result.isStale).toBe(false);
    });

    it('should return data with isStale=true when expired', async () => {
      const mockData = { id: '1' };
      const cacheItem = {
        data: mockData,
        timestamp: Date.now() - 120000,
        expiresAt: Date.now() - 60000, // Expired
        size: 100,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cacheItem),
      );

      const result = await cacheService.getWithStale('test_key');

      expect(result.data).toEqual(mockData);
      expect(result.isStale).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove item from AsyncStorage', async () => {
      await cacheService.remove('test_key');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        '@travelmatch_cache_test_key',
      );
    });
  });

  describe('clearExpired', () => {
    it('should remove only expired items', async () => {
      const expiredItem = {
        data: { id: '1' },
        timestamp: Date.now() - 120000,
        expiresAt: Date.now() - 60000,
        size: 100,
      };

      const validItem = {
        data: { id: '2' },
        timestamp: Date.now(),
        expiresAt: Date.now() + 60000,
        size: 100,
      };

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        '@travelmatch_cache_expired',
        '@travelmatch_cache_valid',
        'other_key', // Not a cache key
      ]);

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(expiredItem))
        .mockResolvedValueOnce(JSON.stringify(validItem));

      await cacheService.clearExpired();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        '@travelmatch_cache_expired',
      );
      expect(AsyncStorage.removeItem).not.toHaveBeenCalledWith(
        '@travelmatch_cache_valid',
      );
    });
  });

  describe('CACHE_KEYS', () => {
    it('should have correct static keys', () => {
      expect(CACHE_KEYS.MOMENTS).toBe('moments');
      expect(CACHE_KEYS.MY_MOMENTS).toBe('my_moments');
      expect(CACHE_KEYS.SAVED_MOMENTS).toBe('saved_moments');
      expect(CACHE_KEYS.CONVERSATIONS).toBe('conversations');
      expect(CACHE_KEYS.REQUESTS).toBe('requests');
      expect(CACHE_KEYS.WALLET).toBe('wallet');
      expect(CACHE_KEYS.PROFILE).toBe('profile');
    });

    it('should generate correct dynamic keys', () => {
      expect(CACHE_KEYS.USER_PROFILE('user-123')).toBe('user_profile_user-123');
      expect(CACHE_KEYS.MOMENT_DETAIL('moment-456')).toBe('moment_moment-456');
      expect(CACHE_KEYS.CONVERSATION('conv-789')).toBe('conversation_conv-789');
    });
  });
});
