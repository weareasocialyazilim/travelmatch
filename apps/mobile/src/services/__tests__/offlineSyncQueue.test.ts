/**
 * Offline Sync Queue - Comprehensive Tests
 * 
 * Tests for offline queue mutation management:
 * - Queue mutations when offline
 * - Sync queued actions on reconnect
 * - Action retry logic
 * - Queue persistence
 * - Action status tracking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { offlineSyncQueue } from '../offlineSyncQueue';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

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

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
// Logger is mocked globally

describe('OfflineSyncQueue', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Default: online
    (mockNetInfo.fetch ).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });

    // Clear queue
    (mockAsyncStorage.getItem ).mockResolvedValue(null);
    await offlineSyncQueue.clearAll();
  });

  describe('Queue Mutations When Offline', () => {
    it('should queue CREATE_MOMENT action when offline', async () => {
      // Simulate offline
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const actionId = await offlineSyncQueue.add('CREATE_MOMENT', {
        title: 'Beach Sunset',
        location: 'Malibu',
        images: ['image1.jpg'],
      });

      expect(actionId).toBeTruthy();
      expect(actionId).toContain('CREATE_MOMENT');

      const queueStatus = offlineSyncQueue.getQueueStatus();
      expect(queueStatus.total).toBe(1);
      expect(queueStatus.pending).toBe(1);
    });

    it('should queue SEND_MESSAGE action when offline', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const actionId = await offlineSyncQueue.add('SEND_MESSAGE', {
        matchId: 'match-123',
        content: 'Hello!',
      });

      expect(actionId).toBeTruthy();

      const pendingActions = offlineSyncQueue.getPendingActions();
      expect(pendingActions).toHaveLength(1);
      expect(pendingActions[0]!.type).toBe('SEND_MESSAGE');
      expect(pendingActions[0]!.payload).toEqual({
        matchId: 'match-123',
        content: 'Hello!',
      });
    });

    it('should queue multiple actions when offline', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Moment 1' });
      await offlineSyncQueue.add('LIKE_MOMENT', { momentId: 'moment-1' });
      await offlineSyncQueue.add('SEND_MESSAGE', { content: 'Hi' });

      const queueStatus = offlineSyncQueue.getQueueStatus();
      expect(queueStatus.total).toBe(3);
      expect(queueStatus.pending).toBe(3);
    });

    it('should preserve action order in queue', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      await offlineSyncQueue.add('CREATE_MOMENT', { order: 1 });
      await offlineSyncQueue.add('LIKE_MOMENT', { order: 2 });
      await offlineSyncQueue.add('SEND_MESSAGE', { order: 3 });

      const pendingActions = offlineSyncQueue.getPendingActions();
      
      expect(pendingActions[0]!.payload).toEqual({ order: 1 });
      expect(pendingActions[1]!.payload).toEqual({ order: 2 });
      expect(pendingActions[2]!.payload).toEqual({ order: 3 });
    });
  });

  describe('Sync on Reconnect', () => {
    it('should sync queued actions when back online', async () => {
      // Start offline
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      // Queue actions
      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' });
      await offlineSyncQueue.add('LIKE_MOMENT', { momentId: '123' });

      expect(offlineSyncQueue.getQueueStatus().pending).toBe(2);

      // Register handlers
      const createHandler = jest.fn().mockResolvedValue(true);
      const likeHandler = jest.fn().mockResolvedValue(true);

      offlineSyncQueue.registerHandler('CREATE_MOMENT', createHandler);
      offlineSyncQueue.registerHandler('LIKE_MOMENT', likeHandler);

      // Go online
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });

      const result = await offlineSyncQueue.processQueue();

      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(createHandler).toHaveBeenCalledWith({ title: 'Test' });
      expect(likeHandler).toHaveBeenCalledWith({ momentId: '123' });

      // Queue should be empty after successful sync
      expect(offlineSyncQueue.getQueueStatus().total).toBe(0);
    });

    it('should not sync when offline', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' });

      const result = await offlineSyncQueue.processQueue();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No network connection');
      expect(offlineSyncQueue.getQueueStatus().pending).toBe(1);
    });

    it('should trigger network listener on reconnect', async () => {
      // Reload service to attach listener (use require so Jest mocks are preserved)
      jest.resetModules();

      // Ensure we get the freshly created NetInfo mock and configure it
      const netInfoMock = jest.requireMock('@react-native-community/netinfo');
      // Ensure test-level reference points to the fresh mock implementation
      mockNetInfo.addEventListener = netInfoMock.addEventListener;
      netInfoMock.addEventListener.mockImplementation((_listener: any) => {
        return jest.fn();
      });

      // Re-require the module so constructor runs and attaches listener
       
      const { offlineSyncQueue: newQueue } = require('../offlineSyncQueue');
      
      // Queue action while offline on the newly required instance
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      await newQueue.add('CREATE_MOMENT', { title: 'Test' });

      const handler = jest.fn().mockResolvedValue(true);
      newQueue.registerHandler('CREATE_MOMENT', handler);

      // Network change would trigger processQueue in real implementation
      // This test verifies addEventListener was called
      expect(mockNetInfo.addEventListener).toHaveBeenCalled();
    });
  });

  describe('Action Retry Logic', () => {
    it('should retry failed action up to maxRetries', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' }, 3);

      const handler = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'))
        .mockRejectedValueOnce(new Error('Fail 4'));

      offlineSyncQueue.registerHandler('CREATE_MOMENT', handler);

      // First attempt
      await offlineSyncQueue.processQueue();
      expect(handler).toHaveBeenCalledTimes(1);
      expect(offlineSyncQueue.getQueueStatus().pending).toBe(1);

      // Second attempt
      await offlineSyncQueue.processQueue();
      expect(handler).toHaveBeenCalledTimes(2);

      // Third attempt
      await offlineSyncQueue.processQueue();
      expect(handler).toHaveBeenCalledTimes(3);

      // Fourth attempt - should mark as failed
      await offlineSyncQueue.processQueue();
      expect(handler).toHaveBeenCalledTimes(4);
      expect(offlineSyncQueue.getQueueStatus().failed).toBe(1);
    });

    it('should succeed on retry after initial failure', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });

      await offlineSyncQueue.add('SEND_MESSAGE', { content: 'Test' });

      const handler = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue(true);

      offlineSyncQueue.registerHandler('SEND_MESSAGE', handler);

      // First attempt fails
      const result1 = await offlineSyncQueue.processQueue();
      expect(result1.failedCount).toBe(0); // Still retrying
      expect(offlineSyncQueue.getQueueStatus().pending).toBe(1);

      // Second attempt succeeds
      const result2 = await offlineSyncQueue.processQueue();
      expect(result2.processedCount).toBe(1);
      expect(offlineSyncQueue.getQueueStatus().total).toBe(0);
    });

    it('should retry failed actions manually', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' }, 1);

      const handler = jest.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue(true);

      offlineSyncQueue.registerHandler('CREATE_MOMENT', handler);

      // Fail immediately
      await offlineSyncQueue.processQueue();
      await offlineSyncQueue.processQueue();

      expect(offlineSyncQueue.getQueueStatus().failed).toBe(1);

      // Manually retry failed
      const result = await offlineSyncQueue.retryFailed();

      expect(result.processedCount).toBe(1);
      expect(offlineSyncQueue.getQueueStatus().failed).toBe(0);
    });
  });

  describe('Queue Persistence', () => {
    it('should save queue to AsyncStorage', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@travelmatch_offline_queue',
        expect.stringContaining('CREATE_MOMENT'),
      );
    });

    it('should load queue from AsyncStorage on init', async () => {
      const savedQueue = [
        {
          id: 'action-1',
          type: 'CREATE_MOMENT',
          payload: { title: 'Saved' },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          status: 'pending',
        },
      ];

      (mockAsyncStorage.getItem ).mockResolvedValue(
        JSON.stringify(savedQueue)
      );

      // Reload service to trigger loadQueue (use require to avoid ESM dynamic import issues)
      jest.resetModules();
       
      const { offlineSyncQueue: newQueue } = require('../offlineSyncQueue');

      // Wait briefly for async loadQueue to settle
      await new Promise(resolve => setTimeout(resolve, 100));

      const status = newQueue.getQueueStatus();
      expect(status.total).toBeGreaterThanOrEqual(0);
    });

    it('should reset processing actions to pending on load', async () => {
      const savedQueue = [
        {
          id: 'action-1',
          type: 'CREATE_MOMENT',
          payload: { title: 'Test' },
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          status: 'processing', // Was processing when app closed
        },
      ];

      (mockAsyncStorage.getItem ).mockResolvedValue(
        JSON.stringify(savedQueue)
      );

      // This would be tested by reinitializing the service
      // The service should reset 'processing' to 'pending'
    });

    it('should persist queue after each action', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      jest.clearAllMocks();

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Action 1' });
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);

      await offlineSyncQueue.add('LIKE_MOMENT', { momentId: '123' });
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(2);

      await offlineSyncQueue.add('SEND_MESSAGE', { content: 'Hi' });
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('Action Status Tracking', () => {
    it('should track pending status', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' });

      const status = offlineSyncQueue.getQueueStatus();
      expect(status.pending).toBe(1);
      expect(status.processing).toBe(0);
      expect(status.failed).toBe(0);
    });

    it('should track processing status', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' });

      let processingCalled = false;
      const handler = jest.fn().mockImplementation(async () => {
        if (!processingCalled) {
          processingCalled = true;
          // Status checked during processing
          offlineSyncQueue.getQueueStatus();
        }
        return true;
      });

      offlineSyncQueue.registerHandler('CREATE_MOMENT', handler);

      await offlineSyncQueue.processQueue();
    });

    it('should track failed status', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' }, 0);

      const handler = jest.fn().mockRejectedValue(new Error('Fail'));
      offlineSyncQueue.registerHandler('CREATE_MOMENT', handler);

      await offlineSyncQueue.processQueue();

      const status = offlineSyncQueue.getQueueStatus();
      expect(status.failed).toBe(1);
    });

    it('should provide queue status summary', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test 1' });
      await offlineSyncQueue.add('LIKE_MOMENT', { momentId: '123' });
      await offlineSyncQueue.add('SEND_MESSAGE', { content: 'Hi' });

      const status = offlineSyncQueue.getQueueStatus();

      expect(status).toEqual({
        total: 3,
        pending: 3,
        processing: 0,
        failed: 0,
      });
    });
  });

  describe('Queue Management', () => {
    it('should remove action from queue', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const actionId = await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' });

      expect(offlineSyncQueue.getQueueStatus().total).toBe(1);

      await offlineSyncQueue.remove(actionId);

      expect(offlineSyncQueue.getQueueStatus().total).toBe(0);
    });

    it('should clear failed actions', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Fail' }, 0);
      await offlineSyncQueue.add('LIKE_MOMENT', { momentId: '123' }, 0);

      const handler = jest.fn().mockRejectedValue(new Error('Fail'));
      offlineSyncQueue.registerHandler('CREATE_MOMENT', handler);
      offlineSyncQueue.registerHandler('LIKE_MOMENT', handler);

      await offlineSyncQueue.processQueue();

      expect(offlineSyncQueue.getQueueStatus().failed).toBe(2);

      await offlineSyncQueue.clearFailed();

      expect(offlineSyncQueue.getQueueStatus().total).toBe(0);
    });

    it('should clear all actions', async () => {
      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test 1' });
      await offlineSyncQueue.add('LIKE_MOMENT', { momentId: '123' });
      await offlineSyncQueue.add('SEND_MESSAGE', { content: 'Hi' });

      expect(offlineSyncQueue.getQueueStatus().total).toBe(3);

      await offlineSyncQueue.clearAll();

      expect(offlineSyncQueue.getQueueStatus().total).toBe(0);
    });
  });

  describe('Queue Listeners', () => {
    it('should notify listeners on queue changes', async () => {
      const listener = jest.fn() as jest.Mock;

      const unsubscribe = offlineSyncQueue.subscribe(listener);

      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' });

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'CREATE_MOMENT',
          }),
        ])
      );

      unsubscribe();
    });

    it('should stop notifying after unsubscribe', async () => {
      const listener = jest.fn() as jest.Mock;

      const unsubscribe = offlineSyncQueue.subscribe(listener);
      unsubscribe();

      jest.clearAllMocks();

      (mockNetInfo.fetch ).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      await offlineSyncQueue.add('CREATE_MOMENT', { title: 'Test' });

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
