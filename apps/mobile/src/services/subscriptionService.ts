/**
 * Real-time Subscriptions Infrastructure
 * Manages Supabase real-time subscriptions for live data updates
 *
 * Features:
 * - Automatic reconnection on connection loss
 * - Subscription lifecycle management
 * - Type-safe event handlers
 * - Error handling and logging
 * - Performance monitoring
 */

import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

/**
 * Subscription event types
 */
export type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

/**
 * Subscription status
 */
export type SubscriptionStatus =
  | 'IDLE' // Not subscribed
  | 'SUBSCRIBING' // Attempting to subscribe
  | 'SUBSCRIBED' // Active subscription
  | 'UNSUBSCRIBING' // Cleaning up
  | 'ERROR'; // Subscription failed

/**
 * Subscription configuration
 */
export interface SubscriptionConfig<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  table: string;
  event?: SubscriptionEvent;
  filter?: string; // e.g., "user_id=eq.123"
  schema?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: SubscriptionStatus) => void;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number; // milliseconds
}

/**
 * Subscription instance
 */
export interface Subscription {
  id: string;
  channel: RealtimeChannel | null;
  config: SubscriptionConfig<Record<string, unknown>>;
  status: SubscriptionStatus;
  reconnectAttempts: number;
  createdAt: Date;
  lastError?: Error;
}

/**
 * Subscription Manager
 * Central manager for all real-time subscriptions
 */
class SubscriptionManager {
  private subscriptions: Map<string, Subscription> = new Map();
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Create and start a new subscription
   */
  subscribe<T extends Record<string, unknown> = Record<string, unknown>>(
    id: string,
    config: SubscriptionConfig<T>,
  ): Subscription {
    // Unsubscribe existing subscription with same ID
    if (this.subscriptions.has(id)) {
      logger.warn(
        'SubscriptionManager',
        `Replacing existing subscription: ${id}`,
      );
      this.unsubscribe(id);
    }

    const subscription: Subscription = {
      id,
      channel: null,
      config: {
        schema: 'public',
        event: '*',
        autoReconnect: true,
        maxReconnectAttempts: 5,
        reconnectDelay: 3000,
        ...config,
      } as SubscriptionConfig<Record<string, unknown>>,
      status: 'IDLE',
      reconnectAttempts: 0,
      createdAt: new Date(),
    };

    this.subscriptions.set(id, subscription);
    this.startSubscription(subscription);

    return subscription;
  }

  /**
   * Start or restart a subscription
   */
  private async startSubscription(subscription: Subscription): Promise<void> {
    const { id, config } = subscription;

    try {
      this.updateStatus(id, 'SUBSCRIBING');

      // Create channel with unique name
      const channelName = `${config.table}:${id}:${Date.now()}`;
      const channel = supabase.channel(channelName);

      // Build filter string
      const filterStr = config.filter || '';

      // Subscribe to postgres changes
      const _postgresChanges = (
        channel as unknown as { on: (...args: unknown[]) => unknown }
      ).on(
        'postgres_changes',
        {
          event: config.event || '*',
          schema: config.schema || 'public',
          table: config.table,
          filter: filterStr,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          this.handleChange(id, payload);
        },
      );

      // Subscribe to channel
      await channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.info(
            'SubscriptionManager',
            `Subscribed to ${config.table} (${id})`,
          );
          subscription.channel = channel;
          subscription.reconnectAttempts = 0;
          this.updateStatus(id, 'SUBSCRIBED');
        } else if (status === 'CLOSED') {
          logger.warn('SubscriptionManager', `Subscription closed: ${id}`);
          this.handleDisconnect(id);
        } else if (status === 'CHANNEL_ERROR') {
          logger.error('SubscriptionManager', `Channel error: ${id}`);
          this.handleError(id, new Error('Channel error'));
        }
      });
    } catch (error) {
      logger.error('SubscriptionManager', `Failed to subscribe: ${id}`, error);
      this.handleError(id, error as Error);
    }
  }

  /**
   * Handle subscription change events
   */
  private handleChange(
    id: string,
    payload: RealtimePostgresChangesPayload<any>,
  ): void {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return;

    const { config } = subscription;

    try {
      // Call specific event handler
      switch (payload.eventType) {
        case 'INSERT':
          config.onInsert?.(payload);
          break;
        case 'UPDATE':
          config.onUpdate?.(payload);
          break;
        case 'DELETE':
          config.onDelete?.(payload);
          break;
      }

      // Call general change handler
      config.onChange?.(payload);
    } catch (error) {
      logger.error(
        'SubscriptionManager',
        `Error in change handler: ${id}`,
        error,
      );
      config.onError?.(error as Error);
    }
  }

  /**
   * Handle subscription errors
   */
  private handleError(id: string, error: Error): void {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return;

    subscription.lastError = error;
    this.updateStatus(id, 'ERROR');

    subscription.config.onError?.(error);

    // Attempt reconnection if enabled
    if (subscription.config.autoReconnect) {
      this.scheduleReconnect(id);
    }
  }

  /**
   * Handle subscription disconnect
   */
  private handleDisconnect(id: string): void {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return;

    logger.warn('SubscriptionManager', `Disconnected: ${id}`);

    // Attempt reconnection if enabled
    if (
      subscription.config.autoReconnect &&
      subscription.status === 'SUBSCRIBED'
    ) {
      this.scheduleReconnect(id);
    }
  }

  /**
   * Schedule automatic reconnection with exponential backoff and jitter
   * Jitter prevents thundering herd when multiple subscriptions reconnect simultaneously
   */
  private scheduleReconnect(id: string): void {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return;

    const { maxReconnectAttempts = 5, reconnectDelay = 3000 } =
      subscription.config;

    // Check reconnect attempts
    if (subscription.reconnectAttempts >= maxReconnectAttempts) {
      logger.error(
        'SubscriptionManager',
        `Max reconnect attempts reached for ${id}`,
      );
      this.updateStatus(id, 'ERROR');
      return;
    }

    // Clear existing timer
    const existingTimer = this.reconnectTimers.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Calculate backoff delay with exponential backoff and jitter
    // Formula: base * 2^attempts + random jitter (0-25% of delay)
    const maxDelay = 30000; // Cap at 30 seconds
    const exponentialDelay = Math.min(
      reconnectDelay * Math.pow(2, subscription.reconnectAttempts),
      maxDelay
    );
    // Add jitter to prevent thundering herd
    const jitter = exponentialDelay * Math.random() * 0.25;
    const delay = Math.floor(exponentialDelay + jitter);

    logger.info(
      'SubscriptionManager',
      `Reconnecting ${id} in ${delay}ms (attempt ${
        subscription.reconnectAttempts + 1
      }/${maxReconnectAttempts})`,
    );

    const timer = setTimeout(() => {
      subscription.reconnectAttempts++;
      this.startSubscription(subscription);
      this.reconnectTimers.delete(id);
    }, delay);

    this.reconnectTimers.set(id, timer);
  }

  /**
   * Update subscription status
   */
  private updateStatus(id: string, status: SubscriptionStatus): void {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return;

    subscription.status = status;
    subscription.config.onStatusChange?.(status);
  }

  /**
   * Unsubscribe from a subscription
   */
  async unsubscribe(id: string): Promise<void> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) {
      logger.warn('SubscriptionManager', `Subscription not found: ${id}`);
      return;
    }

    logger.info('SubscriptionManager', `Unsubscribing: ${id}`);

    // Clear reconnect timer
    const timer = this.reconnectTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(id);
    }

    // Unsubscribe from channel
    if (subscription.channel) {
      this.updateStatus(id, 'UNSUBSCRIBING');
      await supabase.removeChannel(subscription.channel);
      subscription.channel = null;
    }

    // Remove subscription
    this.subscriptions.delete(id);
    this.updateStatus(id, 'IDLE');
  }

  /**
   * Unsubscribe from all subscriptions
   */
  async unsubscribeAll(): Promise<void> {
    logger.info('SubscriptionManager', 'Unsubscribing from all subscriptions');

    const ids = Array.from(this.subscriptions.keys());
    await Promise.all(ids.map((id) => this.unsubscribe(id)));
  }

  /**
   * Get subscription by ID
   */
  getSubscription(id: string): Subscription | undefined {
    return this.subscriptions.get(id);
  }

  /**
   * Get all active subscriptions
   */
  getActiveSubscriptions(): Subscription[] {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => sub.status === 'SUBSCRIBED',
    );
  }

  /**
   * Get subscription status
   */
  getStatus(id: string): SubscriptionStatus {
    return this.subscriptions.get(id)?.status || 'IDLE';
  }

  /**
   * Check if subscription is active
   */
  isActive(id: string): boolean {
    return this.getStatus(id) === 'SUBSCRIBED';
  }
}

// Export singleton instance
export const subscriptionManager = new SubscriptionManager();

/**
 * React Hook-friendly subscription helper
 * Use this in components with useEffect
 */
export const createSubscription = <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  id: string,
  config: SubscriptionConfig<T>,
): (() => void) => {
  subscriptionManager.subscribe(id, config);

  // Return cleanup function
  return () => {
    subscriptionManager.unsubscribe(id);
  };
};

/**
 * Predefined subscription builders for common use cases
 */
export const Subscriptions = {
  /**
   * Subscribe to user's moments
   */
  userMoments: (
    userId: string,
    handlers: Pick<
      SubscriptionConfig,
      'onInsert' | 'onUpdate' | 'onDelete' | 'onChange'
    >,
  ) => {
    return createSubscription(`user-moments-${userId}`, {
      table: 'moments',
      filter: `user_id=eq.${userId}`,
      ...handlers,
    });
  },

  /**
   * Subscribe to chat messages
   */
  chatMessages: (
    chatId: string,
    handlers: Pick<SubscriptionConfig, 'onInsert' | 'onUpdate' | 'onDelete'>,
  ) => {
    return createSubscription(`chat-messages-${chatId}`, {
      table: 'messages',
      filter: `chat_id=eq.${chatId}`,
      ...handlers,
    });
  },

  /**
   * Subscribe to user notifications
   */
  userNotifications: (
    userId: string,
    handlers: Pick<SubscriptionConfig, 'onInsert' | 'onUpdate'>,
  ) => {
    return createSubscription(`user-notifications-${userId}`, {
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
      event: 'INSERT',
      ...handlers,
    });
  },

  /**
   * Subscribe to booking requests
   */
  bookingRequests: (
    userId: string,
    handlers: Pick<SubscriptionConfig, 'onInsert' | 'onUpdate'>,
  ) => {
    return createSubscription(`booking-requests-${userId}`, {
      table: 'exchanges',
      filter: `host_id=eq.${userId}`,
      ...handlers,
    });
  },

  /**
   * Subscribe to user presence
   */
  userPresence: (
    userId: string,
    handlers: Pick<SubscriptionConfig, 'onChange'>,
  ) => {
    return createSubscription(`user-presence-${userId}`, {
      table: 'user_presence',
      filter: `user_id=eq.${userId}`,
      ...handlers,
    });
  },
};

/**
 * Export types
 */
export type { RealtimePostgresChangesPayload, RealtimeChannel };
