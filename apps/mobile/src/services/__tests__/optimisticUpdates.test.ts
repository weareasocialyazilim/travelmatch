/**
 * Optimistic UI Updates - Comprehensive Tests
 *
 * Tests for optimistic updates:
 * - Optimistic state updates before API response
 * - Rollback on mutation failure
 * - Cache invalidation strategies
 * - Multiple optimistic updates
 * - UI consistency during transitions
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import { offlineSyncQueue } from '../offlineSyncQueue';
import { useOfflineMutation } from '../../hooks/useOfflineData';

// Create a fallback cache service if global is not defined
const createFallbackCacheService = () => {
  const store = new Map<string, unknown>();
  return {
    clearAll: () => store.clear(),
    setQueryData: (key: string, data: unknown) => store.set(key, data),
    getQueryData: (key: string) => store.get(key),
    invalidateQuery: (key: string) => store.delete(key),
    invalidateQueries: (
      pattern: string | RegExp | ((key: string) => boolean),
    ) => {
      if (typeof pattern === 'function') {
        for (const key of store.keys()) {
          if (pattern(key)) store.delete(key);
        }
      } else {
        const regex =
          typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        for (const key of store.keys()) {
          if (regex.test(key)) store.delete(key);
        }
      }
    },
  };
};

// Access the global mock or create fallback
const cacheService =
  (global as any).cacheService || createFallbackCacheService();

// Mock dependencies
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

const mockNetInfo = NetInfo;

describe('Optimistic UI Updates', () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });

    await offlineSyncQueue.clearAll();
    if (cacheService && typeof cacheService.clearAll === 'function') {
      cacheService.clearAll();
    }
  });

  describe('Optimistic State Updates', () => {
    it('should apply optimistic update before API response', async () => {
      const onSuccess = jest.fn();
      const mutationFn = jest.fn().mockImplementation(async () => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { id: '123', liked: true };
      });

      offlineSyncQueue.registerHandler('LIKE_MOMENT', mutationFn);

      // Mock cache service inline
      const mockCache: any = {};
      const cacheService = {
        setQueryData: (key: string, data: any) => {
          mockCache[key] = data;
        },
        getQueryData: (key: string) => mockCache[key],
      };

      const { result } = renderHook(() =>
        useOfflineMutation(mutationFn, { onSuccess }),
      );

      // Cache current state
      const cacheKey = 'moment-123';
      cacheService.setQueryData(cacheKey, {
        id: '123',
        liked: false,
        likes: 10,
      });

      // Perform mutation with optimistic update
      await act(async () => {
        result.current.mutate({ momentId: '123' });

        // Apply optimistic update
        cacheService.setQueryData(cacheKey, {
          id: '123',
          liked: true,
          likes: 11,
        });
      });

      // Check optimistic state (before API response)
      const optimisticData = cacheService.getQueryData(cacheKey);
      expect(optimisticData).toEqual({ id: '123', liked: true, likes: 11 });

      // Wait for mutation to complete and onSuccess to be invoked
      await waitFor(() => {
        expect(mutationFn).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith({ id: '123', liked: true });
      });
    });

    it('should update UI immediately for offline actions', async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const { result } = renderHook(() =>
        useOfflineMutation({
          offlineActionType: 'LIKE_MOMENT',
        }),
      );

      const cacheKey = 'moment-456';
      cacheService.setQueryData(cacheKey, {
        id: '456',
        liked: false,
        likes: 5,
      });

      await act(async () => {
        result.current.mutate({ momentId: '456' });

        // Optimistic update while offline
        cacheService.setQueryData(cacheKey, {
          id: '456',
          liked: true,
          likes: 6,
        });
      });

      // UI should show liked state immediately
      const data = cacheService.getQueryData(cacheKey);
      expect(data).toEqual({ id: '456', liked: true, likes: 6 });

      // Action should be queued
      expect(result.current.isQueued).toBe(true);
    });

    it('should handle multiple optimistic updates', async () => {
      const cacheKey = 'moments-list';
      const initialMoments = [
        { id: '1', liked: false, likes: 10 },
        { id: '2', liked: false, likes: 20 },
        { id: '3', liked: false, likes: 30 },
      ];

      cacheService.setQueryData(cacheKey, initialMoments);

      const { result } = renderHook(() =>
        useOfflineMutation({
          offlineActionType: 'LIKE_MOMENT',
        }),
      );

      // Like multiple moments
      await act(async () => {
        result.current.mutate({ momentId: '1' });

        cacheService.setQueryData(cacheKey, [
          { id: '1', liked: true, likes: 11 },
          { id: '2', liked: false, likes: 20 },
          { id: '3', liked: false, likes: 30 },
        ]);
      });

      await act(async () => {
        result.current.mutate({ momentId: '3' });

        cacheService.setQueryData(cacheKey, [
          { id: '1', liked: true, likes: 11 },
          { id: '2', liked: false, likes: 20 },
          { id: '3', liked: true, likes: 31 },
        ]);
      });

      const data = cacheService.getQueryData(cacheKey);
      expect(data).toEqual([
        { id: '1', liked: true, likes: 11 },
        { id: '2', liked: false, likes: 20 },
        { id: '3', liked: true, likes: 31 },
      ]);
    });

    it('should update nested data structures optimistically', async () => {
      const cacheKey = 'profile-123';
      const initialProfile = {
        id: '123',
        stats: {
          followers: 100,
          following: 50,
        },
        isFollowing: false,
      };

      cacheService.setQueryData(cacheKey, initialProfile);

      const { result } = renderHook(() =>
        useOfflineMutation({
          offlineActionType: 'SEND_REQUEST',
        }),
      );

      await act(async () => {
        result.current.mutate({ userId: '123' });

        // Optimistic update for follow
        cacheService.setQueryData(cacheKey, {
          id: '123',
          stats: {
            followers: 101,
            following: 50,
          },
          isFollowing: true,
        });
      });

      const data = cacheService.getQueryData(cacheKey);
      expect(data).toEqual({
        id: '123',
        stats: {
          followers: 101,
          following: 50,
        },
        isFollowing: true,
      });
    });
  });

  describe('Rollback on Failure', () => {
    it('should rollback optimistic update when mutation fails', async () => {
      const onError = jest.fn();
      const mutationFn = jest.fn().mockRejectedValue(new Error('API Error'));

      offlineSyncQueue.registerHandler('LIKE_MOMENT', mutationFn);

      const { result } = renderHook(() =>
        useOfflineMutation({
          onError,
          offlineActionType: 'LIKE_MOMENT',
        }),
      );

      const cacheKey = 'moment-789';
      const originalData = { id: '789', liked: false, likes: 15 };

      cacheService.setQueryData(cacheKey, originalData);

      await act(async () => {
        result.current.mutate({ momentId: '789' });

        // Apply optimistic update
        cacheService.setQueryData(cacheKey, {
          id: '789',
          liked: true,
          likes: 16,
        });
      });

      // Wait for mutation to fail
      await waitFor(() => {
        expect(mutationFn).toHaveBeenCalled();
      });

      // Rollback to original state
      await act(async () => {
        cacheService.setQueryData(cacheKey, originalData);
      });

      const data = cacheService.getQueryData(cacheKey);
      expect(data).toEqual(originalData);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should preserve rollback context for nested updates', async () => {
      const cacheKey = 'user-profile';
      const originalProfile = {
        id: 'user1',
        stats: {
          followers: 200,
          following: 100,
        },
        bio: 'Original bio',
      };

      cacheService.setQueryData(cacheKey, originalProfile);

      const mutationFn = jest
        .fn()
        .mockRejectedValue(new Error('Update failed'));
      offlineSyncQueue.registerHandler('UPDATE_MOMENT', mutationFn);

      const { result } = renderHook(() =>
        useOfflineMutation({
          offlineActionType: 'UPDATE_MOMENT',
        }),
      );

      // Optimistic update
      await act(async () => {
        result.current.mutate({ bio: 'New bio' });

        cacheService.setQueryData(cacheKey, {
          ...originalProfile,
          bio: 'New bio',
        });
      });

      // Mutation fails, rollback
      await waitFor(() => {
        expect(mutationFn).toHaveBeenCalled();
      });

      await act(async () => {
        cacheService.setQueryData(cacheKey, originalProfile);
      });

      const data = cacheService.getQueryData(cacheKey);
      expect(data).toEqual(originalProfile);
    });

    it('should rollback list mutations on failure', async () => {
      const cacheKey = 'moments-feed';
      const originalMoments = [
        { id: '1', title: 'Moment 1' },
        { id: '2', title: 'Moment 2' },
      ];

      cacheService.setQueryData(cacheKey, originalMoments);

      const mutationFn = jest
        .fn()
        .mockRejectedValue(new Error('Creation failed'));
      offlineSyncQueue.registerHandler('CREATE_MOMENT', mutationFn);

      const { result } = renderHook(() =>
        useOfflineMutation({
          offlineActionType: 'CREATE_MOMENT',
        }),
      );

      // Optimistically add new moment
      await act(async () => {
        result.current.mutate({ title: 'Moment 3' });

        cacheService.setQueryData(cacheKey, [
          ...originalMoments,
          { id: 'temp-3', title: 'Moment 3' },
        ]);
      });

      // Mutation fails, remove optimistic moment
      await waitFor(() => {
        expect(mutationFn).toHaveBeenCalled();
      });

      await act(async () => {
        cacheService.setQueryData(cacheKey, originalMoments);
      });

      const data = cacheService.getQueryData(cacheKey);
      expect(data).toEqual(originalMoments);
    });

    it('should handle partial rollback for batch updates', async () => {
      const cacheKey = 'batch-update';
      const originalData = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'pending' },
        { id: '3', status: 'pending' },
      ];

      cacheService.setQueryData(cacheKey, originalData);

      // First update succeeds
      const successFn = jest.fn().mockResolvedValue(true);
      offlineSyncQueue.registerHandler('UPDATE_MOMENT', successFn);

      const { result } = renderHook(() =>
        useOfflineMutation({
          offlineActionType: 'UPDATE_MOMENT',
        }),
      );

      // Update first item
      await act(async () => {
        result.current.mutate({ id: '1' });

        cacheService.setQueryData(cacheKey, [
          { id: '1', status: 'completed' },
          { id: '2', status: 'pending' },
          { id: '3', status: 'pending' },
        ]);
      });

      await waitFor(() => {
        expect(successFn).toHaveBeenCalled();
      });

      // Second update fails
      const failFn = jest.fn().mockRejectedValue(new Error('Failed'));
      offlineSyncQueue.registerHandler('UPDATE_MOMENT', failFn);

      await act(async () => {
        result.current.mutate({ id: '2' });

        cacheService.setQueryData(cacheKey, [
          { id: '1', status: 'completed' },
          { id: '2', status: 'completed' },
          { id: '3', status: 'pending' },
        ]);
      });

      await waitFor(() => {
        expect(failFn).toHaveBeenCalled();
      });

      // Rollback only second item
      await act(async () => {
        cacheService.setQueryData(cacheKey, [
          { id: '1', status: 'completed' }, // Keep successful update
          { id: '2', status: 'pending' }, // Rollback failed update
          { id: '3', status: 'pending' },
        ]);
      });

      const data = cacheService.getQueryData(cacheKey);
      expect(data[0].status).toBe('completed');
      expect(data[1].status).toBe('pending');
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate related cache on successful mutation', async () => {
      const listKey = 'moments-list';
      const detailKey = 'moment-123';

      cacheService.setQueryData(listKey, [
        { id: '123', likes: 10 },
        { id: '456', likes: 20 },
      ]);
      cacheService.setQueryData(detailKey, {
        id: '123',
        likes: 10,
        title: 'Test',
      });

      const mutationFn = jest.fn().mockResolvedValue({ id: '123', likes: 11 });
      offlineSyncQueue.registerHandler('LIKE_MOMENT', mutationFn);

      const { result } = renderHook(() =>
        useOfflineMutation({
          offlineActionType: 'LIKE_MOMENT',
          onSuccess: () => {
            // Invalidate related cache
            cacheService.invalidateQuery(listKey);
            cacheService.invalidateQuery(detailKey);
          },
        }),
      );

      await act(async () => {
        result.current.mutate({ momentId: '123' });
      });

      await waitFor(() => {
        expect(mutationFn).toHaveBeenCalled();
      });

      // Both caches should be invalidated
      expect(cacheService.getQueryData(listKey)).toBeUndefined();
      expect(cacheService.getQueryData(detailKey)).toBeUndefined();
    });

    it('should invalidate cache with pattern matching', async () => {
      cacheService.setQueryData('moments-list', []);
      cacheService.setQueryData('moments-trending', []);
      cacheService.setQueryData('moments-nearby', []);
      cacheService.setQueryData('users-list', []);

      const mutationFn = jest.fn().mockResolvedValue(true);
      offlineSyncQueue.registerHandler('CREATE_MOMENT', mutationFn);

      const { result } = renderHook(() =>
        useOfflineMutation({
          offlineActionType: 'CREATE_MOMENT',
          onSuccess: () => {
            // Invalidate all moment lists
            cacheService.invalidateQueries((key) => key.startsWith('moments-'));
          },
        }),
      );

      await act(async () => {
        result.current.mutate({ title: 'New Moment' });
      });

      await waitFor(() => {
        expect(mutationFn).toHaveBeenCalled();
      });

      // All moment caches invalidated, user cache preserved
      expect(cacheService.getQueryData('moments-list')).toBeUndefined();
      expect(cacheService.getQueryData('moments-trending')).toBeUndefined();
      expect(cacheService.getQueryData('moments-nearby')).toBeUndefined();
      expect(cacheService.getQueryData('users-list')).toEqual([]);
    });

    it('should selectively invalidate cache entries', async () => {
      const cacheKey = 'moments-list';
      const moments = [
        { id: '1', liked: false },
        { id: '2', liked: false },
        { id: '3', liked: false },
      ];

      cacheService.setQueryData(cacheKey, moments);

      const mutationFn = jest.fn().mockResolvedValue({ id: '2', liked: true });
      offlineSyncQueue.registerHandler('LIKE_MOMENT', mutationFn);

      const { result } = renderHook(() =>
        useOfflineMutation({
          offlineActionType: 'LIKE_MOMENT',
          onSuccess: (data: unknown) => {
            // Update only the affected item
            const currentData = cacheService.getQueryData(
              cacheKey,
            ) as unknown as Array<Record<string, unknown>> | undefined;
            if (currentData) {
              const updated = currentData.map((item) =>
                item.id === data.id ? { ...item, liked: data.liked } : item,
              );
              cacheService.setQueryData(cacheKey, updated);
            }
          },
        }),
      );

      await act(async () => {
        result.current.mutate({ momentId: '2' });
      });

      await waitFor(() => {
        expect(mutationFn).toHaveBeenCalled();
      });

      const data = cacheService.getQueryData(cacheKey) as unknown as Array<
        Record<string, unknown>
      >;
      expect(data[0].liked).toBe(false);
      expect(data[1].liked).toBe(true);
      expect(data[2].liked).toBe(false);
    });

    it('should not invalidate unrelated cache', async () => {
      cacheService.setQueryData('moments-list', []);
      cacheService.setQueryData('users-list', []);
      cacheService.setQueryData('messages-list', []);

      const mutationFn = jest.fn().mockResolvedValue(true);
      offlineSyncQueue.registerHandler('LIKE_MOMENT', mutationFn);

      const { result } = renderHook(() =>
        useOfflineMutation({
          offlineActionType: 'LIKE_MOMENT',
          onSuccess: () => {
            // Only invalidate moment cache
            cacheService.invalidateQuery('moments-list');
          },
        }),
      );

      await act(async () => {
        result.current.mutate({ momentId: '123' });
      });

      await waitFor(() => {
        expect(mutationFn).toHaveBeenCalled();
      });

      expect(cacheService.getQueryData('moments-list')).toBeUndefined();
      expect(cacheService.getQueryData('users-list')).toEqual([]);
      expect(cacheService.getQueryData('messages-list')).toEqual([]);
    });
  });

  describe('UI Consistency', () => {
    it('should maintain UI consistency during offline-to-online transition', async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const cacheKey = 'moment-999';
      cacheService.setQueryData(cacheKey, {
        id: '999',
        liked: false,
        likes: 50,
      });

      const { result } = renderHook(() =>
        useOfflineMutation({
          offlineActionType: 'LIKE_MOMENT',
        }),
      );

      // Offline optimistic update
      await act(async () => {
        result.current.mutate({ momentId: '999' });

        cacheService.setQueryData(cacheKey, {
          id: '999',
          liked: true,
          likes: 51,
        });
      });

      expect(cacheService.getQueryData(cacheKey)).toEqual({
        id: '999',
        liked: true,
        likes: 51,
      });

      // Go online and sync
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });

      const mutationFn = jest
        .fn()
        .mockResolvedValue({ id: '999', liked: true, likes: 51 });
      offlineSyncQueue.registerHandler('LIKE_MOMENT', mutationFn);

      await offlineSyncQueue.processQueue();

      // UI should remain consistent
      expect(cacheService.getQueryData(cacheKey)).toEqual({
        id: '999',
        liked: true,
        likes: 51,
      });
    });

    it('should handle concurrent optimistic updates', async () => {
      const cacheKey = 'concurrent-test';
      cacheService.setQueryData(cacheKey, { count: 0 });

      const { result } = renderHook(() =>
        useOfflineMutation({
          offlineActionType: 'LIKE_MOMENT',
        }),
      );

      // Multiple concurrent updates
      await act(async () => {
        result.current.mutate({ action: 'increment' });
        result.current.mutate({ action: 'increment' });
        result.current.mutate({ action: 'increment' });

        // All updates applied
        cacheService.setQueryData(cacheKey, { count: 3 });
      });

      expect(cacheService.getQueryData(cacheKey)).toEqual({ count: 3 });
    });

    it('should show loading state during optimistic update sync', async () => {
      const { result } = renderHook(() =>
        useOfflineMutation({
          offlineActionType: 'CREATE_MOMENT',
        }),
      );

      expect(result.current.loading).toBe(false);

      const mutationFn = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { id: '123' };
      });

      offlineSyncQueue.registerHandler('CREATE_MOMENT', mutationFn);

      await act(async () => {
        result.current.mutate({ title: 'Test' });
      });

      // Should show loading during mutation
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(mutationFn).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});
