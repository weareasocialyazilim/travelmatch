/**
 * Offline Utilities Tests
 * Tests for network detection, caching, and offline queue
 */

import NetInfo from '@react-native-community/netinfo';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import {
  useNetworkStatus,
  checkNetworkAvailability,
  cache,
  retryWithBackoff,
  offlineQueue,
} from '../offline';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(),
}));

describe('Offline Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cache.clear();
    offlineQueue.clear();
  });

  // ==================== NETWORK STATUS HOOK ====================
  describe('useNetworkStatus', () => {
    it('should subscribe to network state changes', () => {
      const mockUnsubscribe = jest.fn();
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() => useNetworkStatus());

      expect(NetInfo.addEventListener).toHaveBeenCalled();
      
      unmount();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should update state when network changes', async () => {
      let networkCallback: (state: any) => void;
      (NetInfo.addEventListener as jest.Mock).mockImplementation((callback) => {
        networkCallback = callback;
        return jest.fn();
      });

      const { result } = renderHook(() => useNetworkStatus());

      // Simulate network connected
      act(() => {
        networkCallback({ isConnected: true, isInternetReachable: true });
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });

    it('should detect offline state', async () => {
      let networkCallback: (state: any) => void;
      (NetInfo.addEventListener as jest.Mock).mockImplementation((callback) => {
        networkCallback = callback;
        return jest.fn();
      });

      const { result } = renderHook(() => useNetworkStatus());

      // Simulate network disconnected
      act(() => {
        networkCallback({ isConnected: false, isInternetReachable: false });
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isOffline).toBe(true);
      expect(result.current.isOnline).toBe(false);
    });
  });

  // ==================== CHECK NETWORK AVAILABILITY ====================
  describe('checkNetworkAvailability', () => {
    it('should return true when connected', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });

      const result = await checkNetworkAvailability();
      expect(result).toBe(true);
    });

    it('should return false when disconnected', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const result = await checkNetworkAvailability();
      expect(result).toBe(false);
    });

    it('should return true when internet reachability is unknown', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: null,
      });

      const result = await checkNetworkAvailability();
      expect(result).toBe(true);
    });
  });

  // ==================== CACHE MANAGER ====================
  describe('CacheManager', () => {
    it('should store and retrieve data', () => {
      const testData = { key: 'value' };
      cache.set('test-key', testData);

      const retrieved = cache.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const result = cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should check if key exists', () => {
      cache.set('exists', 'data');

      expect(cache.has('exists')).toBe(true);
      expect(cache.has('not-exists')).toBe(false);
    });

    it('should remove data', () => {
      cache.set('to-remove', 'data');
      expect(cache.has('to-remove')).toBe(true);

      cache.remove('to-remove');
      expect(cache.has('to-remove')).toBe(false);
    });

    it('should clear all data', () => {
      cache.set('key1', 'data1');
      cache.set('key2', 'data2');

      cache.clear();

      expect(cache.size()).toBe(0);
    });

    it('should return correct size', () => {
      expect(cache.size()).toBe(0);

      cache.set('key1', 'data1');
      expect(cache.size()).toBe(1);

      cache.set('key2', 'data2');
      expect(cache.size()).toBe(2);
    });

    it('should expire data after TTL', () => {
      jest.useFakeTimers();

      cache.set('expiring', 'data', 1000); // 1 second TTL
      expect(cache.get('expiring')).toBe('data');

      // Advance time past TTL
      jest.advanceTimersByTime(1001);

      expect(cache.get('expiring')).toBeNull();

      jest.useRealTimers();
    });
  });

  // ==================== RETRY WITH BACKOFF ====================
  describe('retryWithBackoff', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return result on first success', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const resultPromise = retryWithBackoff(mockFn, 3, 100);
      jest.runAllTimers();
      
      const result = await resultPromise;
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValue('success');

      const resultPromise = retryWithBackoff(mockFn, 3, 100);
      
      // Run through the retry delays
      await Promise.resolve(); // First attempt fails
      jest.advanceTimersByTime(100);
      
      const result = await resultPromise;
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));

      const resultPromise = retryWithBackoff(mockFn, 3, 100);
      
      // Advance through all retries
      for (let i = 0; i < 3; i++) {
        await Promise.resolve();
        jest.advanceTimersByTime(100 * Math.pow(2, i));
      }

      await expect(resultPromise).rejects.toThrow('Always fails');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  // ==================== OFFLINE QUEUE ====================
  describe('OfflineQueue', () => {
    it('should add requests to queue', () => {
      const id = offlineQueue.add('/api/data', 'POST', { key: 'value' });

      expect(id).toBeDefined();
      expect(offlineQueue.getAll()).toHaveLength(1);
    });

    it('should get all queued requests', () => {
      offlineQueue.add('/api/data1', 'POST', { data: 1 });
      offlineQueue.add('/api/data2', 'PUT', { data: 2 });

      const requests = offlineQueue.getAll();
      expect(requests).toHaveLength(2);
      expect(requests[0].url).toBe('/api/data1');
      expect(requests[1].url).toBe('/api/data2');
    });

    it('should remove request by id', () => {
      const id = offlineQueue.add('/api/data', 'POST');
      expect(offlineQueue.getAll()).toHaveLength(1);

      offlineQueue.remove(id);
      expect(offlineQueue.getAll()).toHaveLength(0);
    });

    it('should clear all requests', () => {
      offlineQueue.add('/api/data1', 'POST');
      offlineQueue.add('/api/data2', 'POST');

      offlineQueue.clear();
      expect(offlineQueue.getAll()).toHaveLength(0);
    });

    it('should process queue and remove successful requests', async () => {
      offlineQueue.add('/api/data1', 'POST', { data: 1 });
      offlineQueue.add('/api/data2', 'POST', { data: 2 });

      const executeMock = jest.fn().mockResolvedValue(undefined);

      await offlineQueue.processQueue(executeMock);

      expect(executeMock).toHaveBeenCalledTimes(2);
      expect(offlineQueue.getAll()).toHaveLength(0);
    });

    it('should keep failed requests in queue', async () => {
      offlineQueue.add('/api/data1', 'POST', { data: 1 });
      offlineQueue.add('/api/data2', 'POST', { data: 2 });

      const executeMock = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValue(undefined);

      await offlineQueue.processQueue(executeMock);

      expect(executeMock).toHaveBeenCalledTimes(2);
      // First request failed, should still be in queue
      expect(offlineQueue.getAll()).toHaveLength(1);
    });
  });
});
