/**
 * Offline Sync Strategy - Comprehensive Tests
 *
 * Tests for sync strategy on reconnect:
 * - Auto-sync on network reconnect
 * - Manual sync trigger
 * - Sync result reporting
 * - Partial sync handling
 * - Sync conflict detection
 */

import NetInfo, {
  NetInfoState,
  NetInfoStateType,
} from '@react-native-community/netinfo';
import { offlineSyncQueue } from '../offlineSyncQueue';
import { logger } from '../../utils/logger';

// Mock dependencies
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
const mockLogger = logger as jest.Mocked<typeof logger>;

// Helper functions for creating proper NetInfoState mocks
const createOnlineState = (): NetInfoState =>
  ({
    type: 'wifi' as NetInfoStateType,
    isConnected: true,
    isInternetReachable: true,
    details: {
      isConnectionExpensive: false,
      ssid: null,
      bssid: null,
      strength: null,
      ipAddress: null,
      subnet: null,
      frequency: null,
      linkSpeed: null,
      rxLinkSpeed: null,
      txLinkSpeed: null,
    },
  }) as NetInfoState;

const createOfflineState = (): NetInfoState =>
  ({
    type: 'none' as NetInfoStateType,
    isConnected: false,
    isInternetReachable: false,
    details: null,
  }) as NetInfoState;

const createUnstableState = (): NetInfoState =>
  ({
    type: 'wifi' as NetInfoStateType,
    isConnected: true,
    isInternetReachable: false,
    details: {
      isConnectionExpensive: false,
      ssid: null,
      bssid: null,
      strength: null,
      ipAddress: null,
      subnet: null,
      frequency: null,
      linkSpeed: null,
      rxLinkSpeed: null,
      txLinkSpeed: null,
    },
  }) as NetInfoState;

describe('Offline Sync Strategy', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockNetInfo.fetch.mockResolvedValue(createOnlineState());
    await offlineSyncQueue.clearAll();
  });

  describe('Auto-Sync on Reconnect', () => {
    it('should automatically sync when network reconnects', async () => {
      // Start offline, queue actions
      mockNetInfo.fetch.mockResolvedValue(createOfflineState());

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test 1' });
      await offlineSyncQueue.add('LIKE_MOMENT', { momentId: '123' });
      await offlineSyncQueue.add('SEND_MESSAGE', { content: 'Hi' });

      expect(offlineSyncQueue.getQueueStatus().pending).toBe(3);

      // Register handlers
      const createHandler = jest.fn().mockResolvedValue(true);
      const likeHandler = jest.fn().mockResolvedValue(true);
      const messageHandler = jest.fn().mockResolvedValue(true);

      offlineSyncQueue.registerHandler('CREATE_MOMENT', createHandler);
      offlineSyncQueue.registerHandler('LIKE_MOMENT', likeHandler);
      offlineSyncQueue.registerHandler('SEND_MESSAGE', messageHandler);

      // Simulate network reconnect
      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      // Process queue
      const result = await offlineSyncQueue.processQueue();

      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(3);
      expect(result.failedCount).toBe(0);

      expect(createHandler).toHaveBeenCalledTimes(1);
      expect(likeHandler).toHaveBeenCalledTimes(1);
      expect(messageHandler).toHaveBeenCalledTimes(1);

      expect(offlineSyncQueue.getQueueStatus().total).toBe(0);
    });

    it('should sync actions in order', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOfflineState());

      await offlineSyncQueue.add('CREATE_MOMENT', { order: 1 });
      await offlineSyncQueue.add('LIKE_MOMENT', { order: 2 });
      await offlineSyncQueue.add('SEND_MESSAGE', { order: 3 });

      const callOrder: number[] = [];
      const createHandler = jest.fn(
        async (payload: Record<string, unknown>) => {
          callOrder.push((payload as { order: number }).order);
          return true;
        },
      );
      const likeHandler = jest.fn(async (payload: Record<string, unknown>) => {
        callOrder.push((payload as { order: number }).order);
        return true;
      });
      const messageHandler = jest.fn(
        async (payload: Record<string, unknown>) => {
          callOrder.push((payload as { order: number }).order);
          return true;
        },
      );

      offlineSyncQueue.registerHandler('CREATE_MOMENT', createHandler);
      offlineSyncQueue.registerHandler('LIKE_MOMENT', likeHandler);
      offlineSyncQueue.registerHandler('SEND_MESSAGE', messageHandler);

      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      await offlineSyncQueue.processQueue();

      expect(callOrder).toEqual([1, 2, 3]);
    });

    it('should not auto-sync when network is unstable', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOfflineState());

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' });

      // Network connected but no internet
      mockNetInfo.fetch.mockResolvedValue(createUnstableState());

      const result = await offlineSyncQueue.processQueue();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No network connection');
      expect(offlineSyncQueue.getQueueStatus().pending).toBe(1);
    });

    it('should handle rapid network changes', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOfflineState());

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' });

      const handler = jest.fn().mockResolvedValue(true);
      offlineSyncQueue.registerHandler('CREATE_MOMENT', handler);

      // Multiple rapid reconnects
      for (let i = 0; i < 5; i++) {
        mockNetInfo.fetch.mockResolvedValue(
          i % 2 === 0 ? createOnlineState() : createOfflineState(),
        );
        await offlineSyncQueue.processQueue();
      }

      // Should only process once when online (handler invoked on first online pass)
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Manual Sync Trigger', () => {
    it('should allow manual sync trigger', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOfflineState());

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' });

      const handler = jest.fn().mockResolvedValue(true);
      offlineSyncQueue.registerHandler('CREATE_MOMENT', handler);

      // Manual trigger (user presses sync button)
      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      const result = await offlineSyncQueue.processQueue();

      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(1);
      expect(handler).toHaveBeenCalled();
    });

    it('should return sync status immediately if already syncing', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' });

      const handler = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return true;
      });

      offlineSyncQueue.registerHandler('CREATE_MOMENT', handler);

      // Start first sync
      const sync1 = offlineSyncQueue.processQueue();

      // Try to start second sync while first is running
      const sync2 = offlineSyncQueue.processQueue();

      const [result1, result2] = await Promise.all([sync1, sync2]);

      expect(result1.processedCount).toBe(1);
      expect(result2.processedCount).toBe(0); // Second sync skipped
    });

    it('should allow retry of failed sync', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' }, 0);

      const handler = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue(true);

      offlineSyncQueue.registerHandler('CREATE_MOMENT', handler);

      // First sync fails
      await offlineSyncQueue.processQueue();
      expect(offlineSyncQueue.getQueueStatus().failed).toBe(1);

      // Manual retry
      const result = await offlineSyncQueue.retryFailed();

      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(1);
      expect(offlineSyncQueue.getQueueStatus().total).toBe(0);
    });
  });

  describe('Sync Result Reporting', () => {
    it('should report sync success', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test 1' });
      await offlineSyncQueue.add('LIKE_MOMENT', { momentId: '123' });

      const handler = jest.fn().mockResolvedValue(true);
      offlineSyncQueue.registerHandler('CREATE_MOMENT', handler);
      offlineSyncQueue.registerHandler('LIKE_MOMENT', handler);

      const result = await offlineSyncQueue.processQueue();

      expect(result).toEqual({
        success: true,
        processedCount: 2,
        failedCount: 0,
        errors: [],
      });
    });

    it('should report partial sync', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Success' });
      await offlineSyncQueue.add('LIKE_MOMENT', { momentId: '123' }, 0);

      const createHandler = jest.fn().mockResolvedValue(true);
      const likeHandler = jest.fn().mockRejectedValue(new Error('Fail'));

      offlineSyncQueue.registerHandler('CREATE_MOMENT', createHandler);
      offlineSyncQueue.registerHandler('LIKE_MOMENT', likeHandler);

      const result = await offlineSyncQueue.processQueue();

      expect(result.success).toBe(false);
      expect(result.processedCount).toBe(1);
      expect(result.failedCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('LIKE_MOMENT');
    });

    it('should report sync failure details', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Fail 1' }, 0);
      await offlineSyncQueue.add('LIKE_MOMENT', { momentId: '123' }, 0);

      const createHandler = jest
        .fn()
        .mockRejectedValue(new Error('Create failed'));
      const likeHandler = jest.fn().mockRejectedValue(new Error('Like failed'));

      offlineSyncQueue.registerHandler('CREATE_MOMENT', createHandler);
      offlineSyncQueue.registerHandler('LIKE_MOMENT', likeHandler);

      const result = await offlineSyncQueue.processQueue();

      expect(result.success).toBe(false);
      expect(result.processedCount).toBe(0);
      expect(result.failedCount).toBe(2);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain('CREATE_MOMENT');
      expect(result.errors[1]).toContain('LIKE_MOMENT');
    });
  });

  describe('Partial Sync Handling', () => {
    it('should continue syncing after non-critical failure', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Success 1' });
      await offlineSyncQueue.add('LIKE_MOMENT', { momentId: '123' }, 0);
      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Success 2' });

      const createHandler = jest.fn().mockResolvedValue(true);
      const likeHandler = jest.fn().mockRejectedValue(new Error('Fail'));

      offlineSyncQueue.registerHandler('CREATE_MOMENT', createHandler);
      offlineSyncQueue.registerHandler('LIKE_MOMENT', likeHandler);

      const result = await offlineSyncQueue.processQueue();

      expect(result.processedCount).toBe(2); // Both CREATE_MOMENT succeeded
      expect(result.failedCount).toBe(1); // LIKE_MOMENT failed
      expect(createHandler).toHaveBeenCalledTimes(2);
    });

    it('should keep failed actions in queue for retry', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Success' });
      await offlineSyncQueue.add('LIKE_MOMENT', { momentId: '123' }, 1);

      const createHandler = jest.fn().mockResolvedValue(true);
      const likeHandler = jest.fn().mockRejectedValue(new Error('Fail'));

      offlineSyncQueue.registerHandler('CREATE_MOMENT', createHandler);
      offlineSyncQueue.registerHandler('LIKE_MOMENT', likeHandler);

      await offlineSyncQueue.processQueue();

      // CREATE_MOMENT removed, LIKE_MOMENT still in queue
      expect(offlineSyncQueue.getQueueStatus().total).toBe(1);
      expect(offlineSyncQueue.getQueueStatus().pending).toBe(1);

      // Retry
      likeHandler.mockResolvedValue(true);
      await offlineSyncQueue.processQueue();

      expect(offlineSyncQueue.getQueueStatus().total).toBe(0);
    });
  });

  describe('Sync Conflict Detection', () => {
    it('should detect timestamp conflicts', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      const now = Date.now();
      const old = now - 60000; // 1 minute ago

      await offlineSyncQueue.add('UPDATE_MOMENT', {
        momentId: '123',
        title: 'Old Update',
        timestamp: old,
      });

      const handler = jest.fn(async (payload: Record<string, unknown>) => {
        // Simulate server has newer version
        const serverTimestamp = now;

        if ((payload as { timestamp: number }).timestamp < serverTimestamp) {
          logger.warn('Conflict: Server has newer version');
          throw new Error('Conflict detected');
        }

        return true;
      });

      offlineSyncQueue.registerHandler('UPDATE_MOMENT', handler);

      await offlineSyncQueue.processQueue();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Conflict'),
      );
    });

    it('should apply last-write-wins strategy', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      await offlineSyncQueue.add('UPDATE_MOMENT', {
        momentId: '123',
        title: 'Latest Update',
        timestamp: Date.now(),
      });

      const handler = jest.fn(async () => {
        // Always apply latest (last write wins)
        return true;
      });

      offlineSyncQueue.registerHandler('UPDATE_MOMENT', handler);

      const result = await offlineSyncQueue.processQueue();

      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          momentId: '123',
          title: 'Latest Update',
        }),
      );
    });

    it('should handle duplicate action conflicts', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOfflineState());

      // User likes same moment twice while offline
      await offlineSyncQueue.add('LIKE_MOMENT', { momentId: '123' });
      await offlineSyncQueue.add('LIKE_MOMENT', { momentId: '123' });

      const handler = jest.fn(async () => {
        // Idempotent operation - liking twice is same as liking once
        return true;
      });

      offlineSyncQueue.registerHandler('LIKE_MOMENT', handler);

      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      const result = await offlineSyncQueue.processQueue();

      // Both actions processed, but result is idempotent
      expect(result.processedCount).toBe(2);
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should handle conflicting actions (like then unlike)', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOfflineState());

      await offlineSyncQueue.add('LIKE_MOMENT', { momentId: '123' });
      await offlineSyncQueue.add('LIKE_MOMENT', {
        momentId: '123',
        unlike: true,
      });

      const likeHandler = jest.fn().mockResolvedValue(true);

      offlineSyncQueue.registerHandler('LIKE_MOMENT', likeHandler);

      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      await offlineSyncQueue.processQueue();

      // Both actions processed in order
      expect(likeHandler).toHaveBeenCalled();
    });
  });

  describe('Network State Transitions', () => {
    it('should handle offline → online transition', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOfflineState());

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' });

      expect(offlineSyncQueue.getQueueStatus().pending).toBe(1);

      const handler = jest.fn().mockResolvedValue(true);
      offlineSyncQueue.registerHandler('CREATE_MOMENT', handler);

      // Go online
      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      await offlineSyncQueue.processQueue();

      expect(handler).toHaveBeenCalled();
      expect(offlineSyncQueue.getQueueStatus().total).toBe(0);
    });

    it('should handle online → offline → online transition', async () => {
      // Start online
      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      // Go offline
      mockNetInfo.fetch.mockResolvedValue(createOfflineState());

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' });

      // Back online
      mockNetInfo.fetch.mockResolvedValue(createOnlineState());

      const handler = jest.fn().mockResolvedValue(true);
      offlineSyncQueue.registerHandler('CREATE_MOMENT', handler);

      await offlineSyncQueue.processQueue();

      expect(handler).toHaveBeenCalled();
    });

    it('should handle flaky network (intermittent connectivity)', async () => {
      mockNetInfo.fetch.mockResolvedValue(createOfflineState());

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' });

      const handler = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network unstable'))
        .mockRejectedValueOnce(new Error('Network unstable'))
        .mockResolvedValue(true);

      offlineSyncQueue.registerHandler('CREATE_MOMENT', handler);

      // Simulate flaky network
      for (let i = 0; i < 3; i++) {
        mockNetInfo.fetch.mockResolvedValue(
          i === 2 ? createOnlineState() : createUnstableState(),
        );
        await offlineSyncQueue.processQueue();
      }

      // Handler will only be invoked when the network is considered reachable
      expect(handler).toHaveBeenCalledTimes(1);
      // If network was unstable during early attempts, the action may remain for retry
      expect(offlineSyncQueue.getQueueStatus().total).toBe(1);
    });
  });
});
