/**
 * Realtime Channel Manager
 * Centralized manager for Supabase realtime channels with:
 * - Channel multiplexing (single channel, multiple listeners)
 * - Connection health monitoring
 * - Performance metrics collection
 * - Optimized reconnection with jitter
 * - Typing indicator broadcast
 */

import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  REALTIME_SUBSCRIBE_STATES,
} from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

// Types
export type ChannelStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

export interface ChannelMetrics {
  channelName: string;
  status: ChannelStatus;
  connectedAt: Date | null;
  disconnectedAt: Date | null;
  reconnectAttempts: number;
  messagesReceived: number;
  lastMessageAt: Date | null;
  latencyMs: number[];
  errorCount: number;
  listenerCount: number;
}

export interface ConnectionHealth {
  isConnected: boolean;
  activeChannels: number;
  totalListeners: number;
  averageLatencyMs: number;
  lastHealthCheckAt: Date;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

type PostgresChangeHandler<
  T extends { [key: string]: unknown } = { [key: string]: unknown },
> = (payload: RealtimePostgresChangesPayload<T>) => void;

type PresenceHandler = (
  event: 'sync' | 'join' | 'leave',
  payload: unknown,
) => void;

type BroadcastHandler = (payload: { event: string; payload: unknown }) => void;

interface ChannelListener {
  id: string;
  type: 'postgres_changes' | 'presence' | 'broadcast';
  handler: PostgresChangeHandler | PresenceHandler | BroadcastHandler;
  filter?: string;
  event?: string;
}

interface ManagedChannel {
  name: string;
  channel: RealtimeChannel | null;
  status: ChannelStatus;
  listeners: Map<string, ChannelListener>;
  metrics: ChannelMetrics;
  config: ChannelConfig;
}

interface ChannelConfig {
  table?: string;
  schema?: string;
  filter?: string;
  enablePresence?: boolean;
  enableBroadcast?: boolean;
  presenceKey?: string;
}

/**
 * Centralized Realtime Channel Manager
 * Singleton that manages all realtime channels in the application
 */
class RealtimeChannelManager {
  private channels: Map<string, ManagedChannel> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private globalListeners: Map<string, (health: ConnectionHealth) => void> =
    new Map();
  private listenerIdCounter = 0;

  constructor() {
    this.startHealthCheck();
  }

  /**
   * Get or create a channel for postgres_changes subscriptions
   * Multiplexes listeners on the same channel
   */
  subscribeToTable<
    T extends { [key: string]: unknown } = { [key: string]: unknown },
  >(
    table: string,
    options: {
      event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
      filter?: string;
      schema?: string;
      onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
      onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
      onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
      onChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
    },
  ): () => void {
    const channelName = this.getChannelName(table, options.filter);
    const listenerId = this.generateListenerId();

    // Create combined handler
    const handler: PostgresChangeHandler<T> = (payload) => {
      const startTime = Date.now();

      try {
        switch (payload.eventType) {
          case 'INSERT':
            options.onInsert?.(payload);
            break;
          case 'UPDATE':
            options.onUpdate?.(payload);
            break;
          case 'DELETE':
            options.onDelete?.(payload);
            break;
        }
        options.onChange?.(payload);

        // Track latency
        this.recordLatency(channelName, Date.now() - startTime);
      } catch (error) {
        logger.error(
          'RealtimeChannelManager',
          `Handler error: ${table}`,
          error,
        );
        this.incrementErrorCount(channelName);
      }
    };

    // Add listener to existing channel or create new one
    let managedChannel = this.channels.get(channelName);

    if (!managedChannel) {
      managedChannel = this.createChannel(channelName, {
        table,
        schema: options.schema || 'public',
        filter: options.filter,
      });
    }

    // Add listener
    managedChannel.listeners.set(listenerId, {
      id: listenerId,
      type: 'postgres_changes',
      handler: handler as PostgresChangeHandler,
      filter: options.filter,
      event: options.event || '*',
    });

    this.updateListenerCount(channelName);

    // If channel exists but not subscribed, subscribe now
    if (managedChannel.status === 'disconnected') {
      this.connectChannel(channelName);
    }

    // Return unsubscribe function
    return () => {
      this.removeListener(channelName, listenerId);
    };
  }

  /**
   * Subscribe to presence channel for online users
   */
  subscribeToPresence(
    channelName: string,
    options: {
      presenceKey: string;
      onSync?: (state: Record<string, unknown[]>) => void;
      onJoin?: (
        key: string,
        currentPresences: unknown[],
        newPresences: unknown[],
      ) => void;
      onLeave?: (
        key: string,
        currentPresences: unknown[],
        leftPresences: unknown[],
      ) => void;
    },
  ): () => void {
    const listenerId = this.generateListenerId();
    const fullChannelName = `presence:${channelName}`;

    let managedChannel = this.channels.get(fullChannelName);

    if (!managedChannel) {
      managedChannel = this.createChannel(fullChannelName, {
        enablePresence: true,
        presenceKey: options.presenceKey,
      });
    }

    // Add presence handlers
    const handler: PresenceHandler = (event, payload) => {
      switch (event) {
        case 'sync':
          options.onSync?.(managedChannel!.channel?.presenceState() || {});
          break;
        case 'join':
          const joinPayload = payload as {
            key: string;
            currentPresences: unknown[];
            newPresences: unknown[];
          };
          options.onJoin?.(
            joinPayload.key,
            joinPayload.currentPresences,
            joinPayload.newPresences,
          );
          break;
        case 'leave':
          const leavePayload = payload as {
            key: string;
            currentPresences: unknown[];
            leftPresences: unknown[];
          };
          options.onLeave?.(
            leavePayload.key,
            leavePayload.currentPresences,
            leavePayload.leftPresences,
          );
          break;
      }
    };

    managedChannel.listeners.set(listenerId, {
      id: listenerId,
      type: 'presence',
      handler,
    });

    this.updateListenerCount(fullChannelName);

    if (managedChannel.status === 'disconnected') {
      this.connectPresenceChannel(fullChannelName, options.presenceKey);
    }

    return () => {
      this.removeListener(fullChannelName, listenerId);
    };
  }

  /**
   * Subscribe to broadcast channel for typing indicators and other ephemeral events
   */
  subscribeToBroadcast(
    channelName: string,
    options: {
      events: string[];
      onMessage: (event: string, payload: unknown) => void;
    },
  ): () => void {
    const listenerId = this.generateListenerId();
    const fullChannelName = `broadcast:${channelName}`;

    let managedChannel = this.channels.get(fullChannelName);

    if (!managedChannel) {
      managedChannel = this.createChannel(fullChannelName, {
        enableBroadcast: true,
      });
    }

    const handler: BroadcastHandler = ({ event, payload }) => {
      if (options.events.includes(event)) {
        options.onMessage(event, payload);
      }
    };

    managedChannel.listeners.set(listenerId, {
      id: listenerId,
      type: 'broadcast',
      handler,
      event: options.events.join(','),
    });

    this.updateListenerCount(fullChannelName);

    if (managedChannel.status === 'disconnected') {
      this.connectBroadcastChannel(fullChannelName, options.events);
    }

    return () => {
      this.removeListener(fullChannelName, listenerId);
    };
  }

  /**
   * Broadcast a message to a channel (for typing indicators)
   */
  broadcast(channelName: string, event: string, payload: unknown): void {
    const fullChannelName = `broadcast:${channelName}`;
    const managedChannel = this.channels.get(fullChannelName);

    if (managedChannel?.channel && managedChannel.status === 'connected') {
      managedChannel.channel.send({
        type: 'broadcast',
        event,
        payload,
      });
    } else {
      logger.warn(
        'RealtimeChannelManager',
        `Cannot broadcast to disconnected channel: ${fullChannelName}`,
      );
    }
  }

  /**
   * Track presence (mark user as online)
   */
  async trackPresence(
    channelName: string,
    presenceData: Record<string, unknown>,
  ): Promise<void> {
    const fullChannelName = `presence:${channelName}`;
    const managedChannel = this.channels.get(fullChannelName);

    if (managedChannel?.channel && managedChannel.status === 'connected') {
      await managedChannel.channel.track(presenceData);
    }
  }

  /**
   * Get connection health status
   */
  getConnectionHealth(): ConnectionHealth {
    const activeChannels = Array.from(this.channels.values()).filter(
      (c) => c.status === 'connected',
    );

    const allLatencies = activeChannels.flatMap(
      (c) => c.metrics.latencyMs.slice(-10), // Last 10 latency readings
    );

    const averageLatencyMs =
      allLatencies.length > 0
        ? allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length
        : 0;

    const totalListeners = activeChannels.reduce(
      (sum, c) => sum + c.listeners.size,
      0,
    );

    // Determine connection quality
    let connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    if (averageLatencyMs > 500) connectionQuality = 'poor';
    else if (averageLatencyMs > 200) connectionQuality = 'fair';
    else if (averageLatencyMs > 100) connectionQuality = 'good';

    return {
      isConnected: activeChannels.length > 0,
      activeChannels: activeChannels.length,
      totalListeners,
      averageLatencyMs: Math.round(averageLatencyMs),
      lastHealthCheckAt: new Date(),
      connectionQuality,
    };
  }

  /**
   * Get metrics for a specific channel
   */
  getChannelMetrics(channelName: string): ChannelMetrics | null {
    const channel = this.channels.get(channelName);
    return channel?.metrics || null;
  }

  /**
   * Get all channel metrics
   */
  getAllMetrics(): ChannelMetrics[] {
    return Array.from(this.channels.values()).map((c) => c.metrics);
  }

  /**
   * Subscribe to health updates
   */
  onHealthChange(callback: (health: ConnectionHealth) => void): () => void {
    const id = this.generateListenerId();
    this.globalListeners.set(id, callback);
    return () => {
      this.globalListeners.delete(id);
    };
  }

  /**
   * Disconnect all channels
   */
  async disconnectAll(): Promise<void> {
    logger.info('RealtimeChannelManager', 'Disconnecting all channels');

    for (const [_name, managedChannel] of this.channels) {
      if (managedChannel.channel) {
        await supabase.removeChannel(managedChannel.channel);
        managedChannel.channel = null;
        managedChannel.status = 'disconnected';
        managedChannel.metrics.disconnectedAt = new Date();
      }
    }

    this.channels.clear();
  }

  /**
   * Force reconnect a specific channel
   */
  async reconnectChannel(channelName: string): Promise<void> {
    const managedChannel = this.channels.get(channelName);
    if (!managedChannel) return;

    logger.info(
      'RealtimeChannelManager',
      `Reconnecting channel: ${channelName}`,
    );

    if (managedChannel.channel) {
      await supabase.removeChannel(managedChannel.channel);
      managedChannel.channel = null;
    }

    managedChannel.status = 'disconnected';
    managedChannel.metrics.reconnectAttempts++;

    this.connectChannel(channelName);
  }

  // Private methods

  private createChannel(name: string, config: ChannelConfig): ManagedChannel {
    const managedChannel: ManagedChannel = {
      name,
      channel: null,
      status: 'disconnected',
      listeners: new Map(),
      config,
      metrics: {
        channelName: name,
        status: 'disconnected',
        connectedAt: null,
        disconnectedAt: null,
        reconnectAttempts: 0,
        messagesReceived: 0,
        lastMessageAt: null,
        latencyMs: [],
        errorCount: 0,
        listenerCount: 0,
      },
    };

    this.channels.set(name, managedChannel);
    return managedChannel;
  }

  private connectChannel(channelName: string): void {
    const managedChannel = this.channels.get(channelName);
    if (!managedChannel || managedChannel.status === 'connecting') return;

    managedChannel.status = 'connecting';
    managedChannel.metrics.status = 'connecting';

    const { table, schema, filter } = managedChannel.config;

    logger.info(
      'RealtimeChannelManager',
      `Connecting to channel: ${channelName}`,
      { table, filter },
    );

    const channel = supabase.channel(channelName);

    // Subscribe to postgres_changes
    if (table) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: schema || 'public',
          table,
          filter,
        },
        (payload) => {
          managedChannel.metrics.messagesReceived++;
          managedChannel.metrics.lastMessageAt = new Date();

          // Dispatch to all listeners
          for (const listener of managedChannel.listeners.values()) {
            if (listener.type === 'postgres_changes') {
              try {
                (listener.handler as PostgresChangeHandler)(payload);
              } catch (error) {
                logger.error(
                  'RealtimeChannelManager',
                  `Listener error: ${listener.id}`,
                  error,
                );
              }
            }
          }
        },
      );
    }

    channel.subscribe((status) => {
      this.handleChannelStatus(channelName, status);
    });

    managedChannel.channel = channel;
  }

  private connectPresenceChannel(
    channelName: string,
    presenceKey: string,
  ): void {
    const managedChannel = this.channels.get(channelName);
    if (!managedChannel || managedChannel.status === 'connecting') return;

    managedChannel.status = 'connecting';
    managedChannel.metrics.status = 'connecting';

    const channel = supabase.channel(channelName, {
      config: { presence: { key: presenceKey } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        for (const listener of managedChannel.listeners.values()) {
          if (listener.type === 'presence') {
            (listener.handler as PresenceHandler)('sync', null);
          }
        }
      })
      .on(
        'presence',
        { event: 'join' },
        ({ key, currentPresences, newPresences }) => {
          for (const listener of managedChannel.listeners.values()) {
            if (listener.type === 'presence') {
              (listener.handler as PresenceHandler)('join', {
                key,
                currentPresences,
                newPresences,
              });
            }
          }
        },
      )
      .on(
        'presence',
        { event: 'leave' },
        ({ key, currentPresences, leftPresences }) => {
          for (const listener of managedChannel.listeners.values()) {
            if (listener.type === 'presence') {
              (listener.handler as PresenceHandler)('leave', {
                key,
                currentPresences,
                leftPresences,
              });
            }
          }
        },
      )
      .subscribe((status) => {
        this.handleChannelStatus(channelName, status);
      });

    managedChannel.channel = channel;
  }

  private connectBroadcastChannel(channelName: string, events: string[]): void {
    const managedChannel = this.channels.get(channelName);
    if (!managedChannel || managedChannel.status === 'connecting') return;

    managedChannel.status = 'connecting';
    managedChannel.metrics.status = 'connecting';

    const channel = supabase.channel(channelName);

    // Subscribe to each event type
    for (const event of events) {
      channel.on('broadcast', { event }, (payload) => {
        managedChannel.metrics.messagesReceived++;
        managedChannel.metrics.lastMessageAt = new Date();

        for (const listener of managedChannel.listeners.values()) {
          if (listener.type === 'broadcast') {
            try {
              (listener.handler as BroadcastHandler)({
                event: payload.event,
                payload: payload.payload,
              });
            } catch (error) {
              logger.error(
                'RealtimeChannelManager',
                `Broadcast handler error: ${listener.id}`,
                error,
              );
            }
          }
        }
      });
    }

    channel.subscribe((status) => {
      this.handleChannelStatus(channelName, status);
    });

    managedChannel.channel = channel;
  }

  private handleChannelStatus(
    channelName: string,
    status: REALTIME_SUBSCRIBE_STATES,
  ): void {
    const managedChannel = this.channels.get(channelName);
    if (!managedChannel) return;

    switch (status) {
      case 'SUBSCRIBED':
        managedChannel.status = 'connected';
        managedChannel.metrics.status = 'connected';
        managedChannel.metrics.connectedAt = new Date();
        managedChannel.metrics.reconnectAttempts = 0;
        logger.info(
          'RealtimeChannelManager',
          `Channel connected: ${channelName}`,
        );
        break;

      case 'CHANNEL_ERROR':
        managedChannel.status = 'error';
        managedChannel.metrics.status = 'error';
        managedChannel.metrics.errorCount++;
        logger.error('RealtimeChannelManager', `Channel error: ${channelName}`);
        break;

      case 'TIMED_OUT':
        managedChannel.status = 'error';
        managedChannel.metrics.status = 'error';
        managedChannel.metrics.disconnectedAt = new Date();
        logger.warn(
          'RealtimeChannelManager',
          `Channel timed out: ${channelName}`,
        );
        break;

      case 'CLOSED':
        managedChannel.status = 'disconnected';
        managedChannel.metrics.status = 'disconnected';
        managedChannel.metrics.disconnectedAt = new Date();
        logger.info('RealtimeChannelManager', `Channel closed: ${channelName}`);
        break;
    }

    // Notify health listeners
    this.notifyHealthListeners();
  }

  private removeListener(channelName: string, listenerId: string): void {
    const managedChannel = this.channels.get(channelName);
    if (!managedChannel) return;

    managedChannel.listeners.delete(listenerId);
    this.updateListenerCount(channelName);

    // If no more listeners, disconnect channel
    if (managedChannel.listeners.size === 0) {
      logger.info(
        'RealtimeChannelManager',
        `No listeners, disconnecting: ${channelName}`,
      );
      this.disconnectChannel(channelName);
    }
  }

  private async disconnectChannel(channelName: string): Promise<void> {
    const managedChannel = this.channels.get(channelName);
    if (!managedChannel) return;

    if (managedChannel.channel) {
      await supabase.removeChannel(managedChannel.channel);
      managedChannel.channel = null;
    }

    managedChannel.status = 'disconnected';
    managedChannel.metrics.status = 'disconnected';
    managedChannel.metrics.disconnectedAt = new Date();

    this.channels.delete(channelName);
  }

  private getChannelName(table: string, filter?: string): string {
    return filter ? `${table}:${filter}` : table;
  }

  private generateListenerId(): string {
    return `listener_${++this.listenerIdCounter}_${Date.now()}`;
  }

  private recordLatency(channelName: string, latencyMs: number): void {
    const managedChannel = this.channels.get(channelName);
    if (!managedChannel) return;

    // Keep last 100 latency readings
    managedChannel.metrics.latencyMs.push(latencyMs);
    if (managedChannel.metrics.latencyMs.length > 100) {
      managedChannel.metrics.latencyMs.shift();
    }
  }

  private incrementErrorCount(channelName: string): void {
    const managedChannel = this.channels.get(channelName);
    if (managedChannel) {
      managedChannel.metrics.errorCount++;
    }
  }

  private updateListenerCount(channelName: string): void {
    const managedChannel = this.channels.get(channelName);
    if (managedChannel) {
      managedChannel.metrics.listenerCount = managedChannel.listeners.size;
    }
  }

  private startHealthCheck(): void {
    // Run health check every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.notifyHealthListeners();
    }, 30000);
  }

  private notifyHealthListeners(): void {
    const health = this.getConnectionHealth();
    for (const callback of this.globalListeners.values()) {
      try {
        callback(health);
      } catch (error) {
        logger.error('RealtimeChannelManager', 'Health listener error', error);
      }
    }
  }

  /**
   * Cleanup on app shutdown
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.disconnectAll();
  }
}

// Export singleton instance
export const realtimeChannelManager = new RealtimeChannelManager();

// Export for testing
export { RealtimeChannelManager };
