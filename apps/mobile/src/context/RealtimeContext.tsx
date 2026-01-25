import type { ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { useAuth } from './AuthContext';
import {
  realtimeChannelManager,
  ConnectionHealth,
} from '../services/realtimeChannelManager';

// Event types
export type RealtimeEventType =
  | 'message:new'
  | 'message:read'
  | 'message:typing'
  | 'notification:new'
  | 'request:new'
  | 'request:updated'
  | 'request:accepted'
  | 'request:declined'
  | 'request:cancelled'
  | 'review:new'
  | 'moment:like'
  | 'moment:comment'
  | 'user:banned'
  | 'user:suspended'
  | 'user:reinstated'
  | 'user:status_changed'
  | 'payment:completed'
  | 'payment:failed';

// Event payload types
export interface MessageEvent {
  conversationId: string;
  messageId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface NotificationEvent {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface RequestEvent {
  requestId: string;
  status: string;
  senderId?: string;
  receiverId?: string;
}

export interface UserAccountStatusEvent {
  userId: string;
  status: 'active' | 'suspended' | 'banned' | 'pending' | 'deleted';
  isBanned: boolean;
  isSuspended: boolean;
  banReason?: string;
  suspensionReason?: string;
  suspensionEndsAt?: string;
}

export interface PaymentEvent {
  paymentId: string;
  status: 'completed' | 'failed';
  amount: number;
  error?: string;
}

// Generic event handler
type EventHandler<T = unknown> = (data: T) => void;
type EventHandlers = Map<RealtimeEventType, Set<EventHandler>>;

// Connection states
type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

interface RealtimeContextType {
  // Connection state
  connectionState: ConnectionState;
  isConnected: boolean;
  connectionHealth: ConnectionHealth | null;

  // Event subscription
  subscribe: <T>(
    event: RealtimeEventType,
    handler: EventHandler<T>,
  ) => () => void;

  // Typing indicators
  sendTypingStart: (conversationId: string) => void;
  sendTypingStop: (conversationId: string) => void;

  // Notification subscription
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;

  // Manual controls
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;

  // Performance metrics
  getConnectionHealth: () => ConnectionHealth;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(
  undefined,
);

export const RealtimeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();

  // State
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected');
  const [connectionHealth, setConnectionHealth] =
    useState<ConnectionHealth | null>(null);

  // Refs for Supabase channels and handlers
  const notificationChannelRef = useRef<RealtimeChannel | null>(null);
  const userStatusChannelRef = useRef<RealtimeChannel | null>(null);
  const handlersRef = useRef<EventHandlers>(new Map());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const typingDebounceRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Exponential backoff state for reconnection
  const reconnectAttemptRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_RECONNECT_ATTEMPTS = 10;
  const BASE_DELAY_MS = 1000;
  const MAX_DELAY_MS = 30000;

  // Derived state
  const isConnected = connectionState === 'connected';

  /**
   * Get current connection health from channel manager
   */
  const getConnectionHealth = useCallback((): ConnectionHealth => {
    return realtimeChannelManager.getConnectionHealth();
  }, []);

  /**
   * Emit event to all subscribed handlers
   */
  const emit = useCallback((event: RealtimeEventType, data: unknown) => {
    const handlers = handlersRef.current.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          logger.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }, []);

  /**
   * Subscribe to user notifications
   */
  const subscribeToNotifications = useCallback(() => {
    if (!user || notificationChannelRef.current) return;

    logger.info('RealtimeContext', 'Subscribing to notifications');

    const channel = supabase.channel(`notifications:${user.id}`);

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          logger.info('RealtimeContext', 'New notification:', payload.new);

          const notification = payload.new as NotificationEvent;
          emit('notification:new', notification);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          logger.debug('RealtimeContext', 'Notification updated:', payload.new);
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.info('RealtimeContext', 'Subscribed to notifications');
        }
      });

    notificationChannelRef.current = channel;
  }, [user, emit]);

  /**
   * Unsubscribe from notifications
   */
  const unsubscribeFromNotifications = useCallback(() => {
    if (notificationChannelRef.current) {
      logger.info('RealtimeContext', 'Unsubscribing from notifications');
      supabase.removeChannel(notificationChannelRef.current);
      notificationChannelRef.current = null;
    }
  }, []);

  /**
   * Subscribe to user account status changes (ban/suspend)
   * This is critical for immediately showing banned/suspended state
   */
  const subscribeToUserStatus = useCallback(() => {
    if (!user || userStatusChannelRef.current) return;

    logger.info('RealtimeContext', 'Subscribing to user status changes');

    const channel = supabase.channel(`user-status:${user.id}`);

    channel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newData = payload.new as {
            id: string;
            status?: string;
            is_banned?: boolean;
            is_suspended?: boolean;
            ban_reason?: string;
            suspension_reason?: string;
            suspension_ends_at?: string;
          };
          const oldData = payload.old as {
            is_banned?: boolean;
            is_suspended?: boolean;
          };

          logger.info('RealtimeContext', 'User status changed:', newData);

          // Emit specific events based on what changed
          if (newData.is_banned && !oldData.is_banned) {
            logger.warn('RealtimeContext', 'User has been BANNED');
            emit('user:banned', {
              userId: newData.id,
              status: 'banned',
              isBanned: true,
              isSuspended: false,
              banReason: newData.ban_reason,
            } as UserAccountStatusEvent);
          } else if (!newData.is_banned && oldData.is_banned) {
            logger.info('RealtimeContext', 'User has been REINSTATED from ban');
            emit('user:reinstated', {
              userId: newData.id,
              status: 'active',
              isBanned: false,
              isSuspended: false,
            } as UserAccountStatusEvent);
          }

          if (newData.is_suspended && !oldData.is_suspended) {
            logger.warn('RealtimeContext', 'User has been SUSPENDED');
            emit('user:suspended', {
              userId: newData.id,
              status: 'suspended',
              isBanned: false,
              isSuspended: true,
              suspensionReason: newData.suspension_reason,
              suspensionEndsAt: newData.suspension_ends_at,
            } as UserAccountStatusEvent);
          } else if (!newData.is_suspended && oldData.is_suspended) {
            logger.info(
              'RealtimeContext',
              'User has been REINSTATED from suspension',
            );
            emit('user:reinstated', {
              userId: newData.id,
              status: 'active',
              isBanned: false,
              isSuspended: false,
            } as UserAccountStatusEvent);
          }

          // Always emit generic status change event
          emit('user:status_changed', {
            userId: newData.id,
            status: newData.status || 'active',
            isBanned: newData.is_banned || false,
            isSuspended: newData.is_suspended || false,
            banReason: newData.ban_reason,
            suspensionReason: newData.suspension_reason,
            suspensionEndsAt: newData.suspension_ends_at,
          } as UserAccountStatusEvent);
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.info('RealtimeContext', 'Subscribed to user status changes');
        }
      });

    userStatusChannelRef.current = channel;
  }, [user, emit]);

  /**
   * Connect to Supabase Realtime
   */
  const connect = useCallback(async () => {
    if (!isAuthenticated || !user) {
      logger.warn('RealtimeContext', 'Cannot connect - not authenticated');
      return;
    }

    try {
      setConnectionState('connecting');
      logger.info('RealtimeContext', 'Connecting to Supabase Realtime');

      // Auto-subscribe to notifications
      subscribeToNotifications();

      // Subscribe to user status changes (ban/suspend detection)
      subscribeToUserStatus();

      setConnectionState('connected');
      // Reset reconnect counter on successful connection
      reconnectAttemptRef.current = 0;
      logger.info('RealtimeContext', 'Connected to Supabase Realtime');
    } catch (error) {
      logger.error('RealtimeContext', 'Failed to connect:', error);
      setConnectionState('disconnected');
    }
  }, [isAuthenticated, user, subscribeToNotifications, subscribeToUserStatus]);

  /**
   * Disconnect from Supabase Realtime
   */
  const disconnect = useCallback(() => {
    logger.info('RealtimeContext', 'Disconnecting from Supabase Realtime');

    if (notificationChannelRef.current) {
      supabase.removeChannel(notificationChannelRef.current);
      notificationChannelRef.current = null;
    }

    if (userStatusChannelRef.current) {
      supabase.removeChannel(userStatusChannelRef.current);
      userStatusChannelRef.current = null;
    }

    setConnectionState('disconnected');
  }, []);

  /**
   * Calculate delay with exponential backoff and jitter
   * Prevents reconnect storm when multiple clients reconnect simultaneously
   */
  const calculateReconnectDelay = useCallback((attempt: number): number => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (capped)
    const exponentialDelay = Math.min(
      BASE_DELAY_MS * Math.pow(2, attempt),
      MAX_DELAY_MS
    );
    // Add jitter: +/- 25% randomization to prevent thundering herd
    const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
    return Math.round(exponentialDelay + jitter);
  }, []);

  /**
   * Force reconnect with exponential backoff and jitter
   * Prevents reconnect storm when network issues occur
   */
  const reconnect = useCallback(() => {
    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Check if we've exceeded max attempts
    if (reconnectAttemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
      logger.error(
        'RealtimeContext',
        `Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) exceeded`
      );
      setConnectionState('disconnected');
      return;
    }

    disconnect();
    setConnectionState('reconnecting');

    const delay = calculateReconnectDelay(reconnectAttemptRef.current);
    reconnectAttemptRef.current += 1;

    logger.info(
      'RealtimeContext',
      `Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current}/${MAX_RECONNECT_ATTEMPTS})`
    );

    reconnectTimeoutRef.current = setTimeout(() => {
      void connect().then(() => {
        // Reset attempt counter on successful connection
        if (connectionState === 'connected') {
          reconnectAttemptRef.current = 0;
        }
      });
    }, delay);
  }, [disconnect, connect, connectionState, calculateReconnectDelay]);

  /**
   * Reset reconnect state (call after successful connection)
   */
  const resetReconnectState = useCallback(() => {
    reconnectAttemptRef.current = 0;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  /**
   * Subscribe to an event
   */
  const subscribe = useCallback(
    <T,>(event: RealtimeEventType, handler: EventHandler<T>) => {
      if (!handlersRef.current.has(event)) {
        handlersRef.current.set(event, new Set());
      }

      const handlers = handlersRef.current.get(event);

      if (!handlers) return () => {};
      handlers.add(handler as EventHandler);

      // Return unsubscribe function
      return () => {
        handlers.delete(handler as EventHandler);
        if (handlers.size === 0) {
          handlersRef.current.delete(event);
        }
      };
    },
    [],
  );

  /**
   * Send typing start indicator via broadcast
   * Uses debouncing to prevent flooding
   */
  const sendTypingStart = useCallback(
    (conversationId: string) => {
      if (!user?.id) return;

      // Clear existing debounce timer for this conversation
      const existingTimer = typingDebounceRef.current.get(conversationId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Broadcast to other users in the conversation
      realtimeChannelManager.broadcast(
        `conversation:${conversationId}`,
        'typing',
        {
          userId: user.id,
          conversationId,
          isTyping: true,
          timestamp: Date.now(),
        },
      );

      // Emit local event
      emit('message:typing', {
        conversationId,
        userId: user.id,
        isTyping: true,
      });

      // Auto-stop typing after 5 seconds of inactivity
      const timer = setTimeout(() => {
        sendTypingStop(conversationId);
        typingDebounceRef.current.delete(conversationId);
      }, 5000);

      typingDebounceRef.current.set(conversationId, timer);
    },

    [user, emit],
  );

  /**
   * Send typing stop indicator via broadcast
   */
  const sendTypingStop = useCallback(
    (conversationId: string) => {
      if (!user?.id) return;

      // Clear debounce timer
      const existingTimer = typingDebounceRef.current.get(conversationId);
      if (existingTimer) {
        clearTimeout(existingTimer);
        typingDebounceRef.current.delete(conversationId);
      }

      // Broadcast to other users
      realtimeChannelManager.broadcast(
        `conversation:${conversationId}`,
        'typing',
        {
          userId: user.id,
          conversationId,
          isTyping: false,
          timestamp: Date.now(),
        },
      );

      // Emit local event
      emit('message:typing', {
        conversationId,
        userId: user.id,
        isTyping: false,
      });
    },
    [user, emit],
  );

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      void connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
        if (isAuthenticated && connectionState === 'disconnected') {
          void connect();
        }
      } else if (
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App went to background - disconnect to save battery
        disconnect();
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, connectionState, connect, disconnect]);

  // Subscribe to health updates from channel manager
  useEffect(() => {
    const unsubscribe = realtimeChannelManager.onHealthChange((health) => {
      setConnectionHealth(health);
    });

    // Get initial health
    setConnectionHealth(realtimeChannelManager.getConnectionHealth());

    return unsubscribe;
  }, []);

  // Cleanup typing debounce timers on unmount
  useEffect(() => {
    const currentTimers = typingDebounceRef.current;
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer));
      currentTimers.clear();
    };
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      // Connection state
      connectionState,
      isConnected,
      connectionHealth,

      // Event subscription
      subscribe,

      // Typing indicators
      sendTypingStart,
      sendTypingStop,

      // Notification subscription
      subscribeToNotifications,
      unsubscribeFromNotifications,

      // Manual controls
      connect,
      disconnect,
      reconnect,

      // Performance metrics
      getConnectionHealth,
    }),
    [
      connectionState,
      isConnected,
      connectionHealth,
      subscribe,
      sendTypingStart,
      sendTypingStop,
      subscribeToNotifications,
      unsubscribeFromNotifications,
      connect,
      disconnect,
      reconnect,
      getConnectionHealth,
    ],
  );

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = (): RealtimeContextType => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

/**
 * Hook to subscribe to realtime events with automatic cleanup
 */
export const useRealtimeEvent = <T,>(
  event: RealtimeEventType,
  handler: EventHandler<T>,
  deps: React.DependencyList = [],
): void => {
  const { subscribe } = useRealtime();

  useEffect(() => {
    const unsubscribe = subscribe<T>(event, handler);
    return unsubscribe;
  }, [event, subscribe, ...deps]);
};

/**
 * Hook to track typing status for a conversation
 */
export const useTypingIndicator = (conversationId: string) => {
  const { subscribe, sendTypingStart, sendTypingStop } = useRealtime();
  const [typingUsers, setTypingUsers] = useState<Map<string, number>>(
    new Map(),
  );
  const timeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Subscribe to typing events
  useEffect(() => {
    const unsubscribe = subscribe<TypingEvent>('message:typing', (data) => {
      if (data.conversationId !== conversationId) return;

      if (data.isTyping) {
        // Clear existing timeout for this user
        const existingTimeout = timeoutRef.current.get(data.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Add user to typing list
        setTypingUsers((prev) => new Map(prev).set(data.userId, Date.now()));

        // Set timeout to auto-remove after 5 seconds
        const timeout = setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Map(prev);
            next.delete(data.userId);
            return next;
          });
          timeoutRef.current.delete(data.userId);
        }, 5000);

        timeoutRef.current.set(data.userId, timeout);
      } else {
        // Remove user from typing list
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(data.userId);
          return next;
        });

        const existingTimeout = timeoutRef.current.get(data.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          timeoutRef.current.delete(data.userId);
        }
      }
    });

    const currentTimeoutRef = timeoutRef.current;
    return () => {
      unsubscribe();
      // Clear all timeouts
      currentTimeoutRef.forEach((timeout) => clearTimeout(timeout));
      currentTimeoutRef.clear();
    };
  }, [conversationId, subscribe]);

  // Start typing
  const startTyping = useCallback(() => {
    sendTypingStart(conversationId);
  }, [conversationId, sendTypingStart]);

  // Stop typing
  const stopTyping = useCallback(() => {
    sendTypingStop(conversationId);
  }, [conversationId, sendTypingStop]);

  return {
    typingUserIds: Array.from(typingUsers.keys()),
    isAnyoneTyping: typingUsers.size > 0,
    startTyping,
    stopTyping,
  };
};
