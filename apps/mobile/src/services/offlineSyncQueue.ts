import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { logger } from '../utils/logger';
import {
  getItemWithLegacyFallback,
  setItemAndCleanupLegacy,
} from '../utils/storageKeyMigration';

// Queue storage key
const QUEUE_KEY = '@lovendo/offline_queue';
const LEGACY_QUEUE_KEYS = ['@lovendo_offline_queue'];

// Action types
export type OfflineActionType =
  | 'CREATE_MOMENT'
  | 'UPDATE_MOMENT'
  | 'DELETE_MOMENT'
  | 'LIKE_MOMENT'
  | 'SAVE_MOMENT'
  | 'SEND_MESSAGE'
  | 'SEND_REQUEST'
  | 'CANCEL_REQUEST'
  | 'ACCEPT_REQUEST'
  | 'DECLINE_REQUEST';

export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
}

interface SyncResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: string[];
}

type ActionHandler = (payload: Record<string, unknown>) => Promise<boolean>;

/**
 * Offline Sync Queue Service
 * Queues actions when offline and syncs when back online
 */
class OfflineSyncQueue {
  private queue: OfflineAction[] = [];
  private isProcessing = false;
  private handlers: Map<OfflineActionType, ActionHandler> = new Map();
  private listeners: Set<(queue: OfflineAction[]) => void> = new Set();

  constructor() {
    void this.loadQueue();
    this.setupNetworkListener();
  }

  /**
   * Load queue from storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const stored = await getItemWithLegacyFallback(
        QUEUE_KEY,
        LEGACY_QUEUE_KEYS,
      );
      if (stored) {
        this.queue = JSON.parse(stored) as OfflineAction[];
        // Reset any actions that were processing when app closed
        this.queue = this.queue.map((action) =>
          action.status === 'processing'
            ? { ...action, status: 'pending' as const }
            : action,
        );
        await this.saveQueue();
      }
    } catch (error) {
      logger.error('OfflineSyncQueue.loadQueue error:', error);
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await setItemAndCleanupLegacy(
        QUEUE_KEY,
        JSON.stringify(this.queue),
        LEGACY_QUEUE_KEYS,
      );
      this.notifyListeners();
    } catch (error) {
      logger.error('OfflineSyncQueue.saveQueue error:', error);
    }
  }

  /**
   * Setup network change listener
   */
  private setupNetworkListener(): void {
    // Support both default and named import shapes from the NetInfo mock/runtime
    const addListener: any =
      (NetInfo as any).addEventListener ||
      (NetInfo as any).default?.addEventListener;

    if (addListener) {
      logger.info(
        'OfflineSyncQueue.setupNetworkListener hasAddListener',
        !!addListener,
      );
      addListener(
        (state: { isConnected?: boolean; isInternetReachable?: boolean }) => {
          if (state.isConnected && state.isInternetReachable) {
            void this.processQueue();
          }
        },
      );
    }
  }

  /**
   * Notify listeners of queue changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.queue]));
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(listener: (queue: OfflineAction[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Register a handler for an action type
   */
  registerHandler(type: OfflineActionType, handler: ActionHandler): void {
    this.handlers.set(type, handler);
  }

  /**
   * Execute a registered handler immediately (used when online and a
   * handler was registered via `registerHandler`). Returns the handler
   * result or throws if no handler found.
   */
  async executeHandler(
    type: OfflineActionType,
    payload: Record<string, unknown>,
  ): Promise<boolean> {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new Error(`No handler registered for action type: ${type}`);
    }

    return handler(payload);
  }

  /**
   * Add action to queue
   */
  async add(
    type: OfflineActionType,
    payload: Record<string, unknown>,
    maxRetries = 3,
  ): Promise<string> {
    const action: OfflineAction = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries,
      status: 'pending',
    };

    this.queue.push(action);
    await this.saveQueue();

    // Note: do not auto-trigger processing here to avoid races where
    // handlers may be registered after calling `add`. Network listener
    // or explicit `processQueue()` should be used to start syncing.

    return action.id;
  }

  /**
   * Remove action from queue
   */
  async remove(actionId: string): Promise<void> {
    this.queue = this.queue.filter((a) => a.id !== actionId);
    await this.saveQueue();
  }

  /**
   * Get all pending actions
   */
  getPendingActions(): OfflineAction[] {
    return this.queue.filter((a) => a.status === 'pending');
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    total: number;
    pending: number;
    processing: number;
    failed: number;
  } {
    return {
      total: this.queue.length,
      pending: this.queue.filter((a) => a.status === 'pending').length,
      processing: this.queue.filter((a) => a.status === 'processing').length,
      failed: this.queue.filter((a) => a.status === 'failed').length,
    };
  }

  /**
   * Process the queue
   */
  async processQueue(): Promise<SyncResult> {
    if (this.isProcessing) {
      return { success: true, processedCount: 0, failedCount: 0, errors: [] };
    }

    const netState = await NetInfo.fetch();
    if (!netState.isConnected || !netState.isInternetReachable) {
      return {
        success: false,
        processedCount: 0,
        failedCount: 0,
        errors: ['No network connection'],
      };
    }

    this.isProcessing = true;
    const result: SyncResult = {
      success: true,
      processedCount: 0,
      failedCount: 0,
      errors: [],
    };

    // Ensure isProcessing is always cleared even on unexpected errors
    try {
      const pendingActions = this.queue.filter((a) => a.status === 'pending');

      // pending actions and handlers are processed below

      for (const action of pendingActions) {
        // processing action
        try {
          action.status = 'processing';
          await this.saveQueue();

          const handler = this.handlers.get(action.type);
          if (!handler) {
            throw new Error(
              `No handler registered for action type: ${action.type}`,
            );
          }

          const success = await handler(action.payload);

          if (success) {
            action.status = 'completed';
            result.processedCount++;
            // Remove completed action
            this.queue = this.queue.filter((a) => a.id !== action.id);
            // action removed from queue
          } else {
            throw new Error('Handler returned false');
          }
        } catch (error) {
          action.retryCount++;

          // Only mark as failed when retryCount exceeds allowed maxRetries.
          // This preserves actions for the intended number of retries.
          if (action.retryCount > action.maxRetries) {
            action.status = 'failed';
            action.error =
              error instanceof Error ? error.message : 'Unknown error';
            result.failedCount++;
            result.errors.push(`${action.type}: ${action.error}`);
          } else {
            action.status = 'pending';
          }
        }

        await this.saveQueue();
      }
    } finally {
      this.isProcessing = false;
      result.success = result.failedCount === 0;
    }

    return result;
  }

  /**
   * Retry failed actions
   */
  async retryFailed(): Promise<SyncResult> {
    // Reset failed actions to pending
    this.queue = this.queue.map((action) =>
      action.status === 'failed'
        ? {
            ...action,
            status: 'pending' as const,
            retryCount: 0,
            error: undefined,
          }
        : action,
    );
    await this.saveQueue();

    return this.processQueue();
  }

  /**
   * Clear failed actions
   */
  async clearFailed(): Promise<void> {
    this.queue = this.queue.filter((a) => a.status !== 'failed');
    await this.saveQueue();
  }

  /**
   * Clear all actions
   */
  async clearAll(): Promise<void> {
    this.queue = [];
    this.isProcessing = false;
    await this.saveQueue();
  }
}

// Export singleton instance
export const offlineSyncQueue = new OfflineSyncQueue();

export default offlineSyncQueue;
