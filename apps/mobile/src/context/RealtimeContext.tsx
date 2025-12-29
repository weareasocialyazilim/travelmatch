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
  | 'user:online'
  | 'user:offline'
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

export interface UserStatusEvent {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
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

  // Online users (Supabase Presence)
  onlineUsers: Set<string>;
  isUserOnline: (userId: string) => boolean;

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
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [connectionHealth, setConnectionHealth] =
    useState<ConnectionHealth | null>(null);

  // Refs for Supabase channels and handlers
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  const notificationChannelRef = useRef<RealtimeChannel | null>(null);
  const handlersRef = useRef<EventHandlers>(new Map());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const typingDebounceRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

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
   * Setup Supabase Presence for online users
   */
  const setupPresence = useCallback(() => {
    if (!user || presenceChannelRef.current) return;

    logger.info('RealtimeContext', 'Setting up presence tracking');

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online = new Set(Object.keys(state));

        logger.debug('RealtimeContext', `Online users: ${online.size}`);
        setOnlineUsers(online);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        logger.debug('RealtimeContext', `User joined: ${key}`);
        setOnlineUsers((prev) => new Set([...prev, key]));

        emit('user:online', { userId: key, isOnline: true });
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        logger.debug('RealtimeContext', `User left: ${key}`);
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });

        emit('user:offline', {
          userId: key,
          isOnline: false,
          lastSeen: new Date().toISOString(),
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track own presence
          await channel.track({
            online_at: new Date().toISOString(),
          });
          logger.info('RealtimeContext', 'Presence tracking active');
        }
      });

    presenceChannelRef.current = channel;
  }, [user, emit]);

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

      // Setup presence
      setupPresence();

      // Auto-subscribe to notifications
      subscribeToNotifications();

      setConnectionState('connected');
      logger.info('RealtimeContext', 'Connected to Supabase Realtime');
    } catch (error) {
      logger.error('RealtimeContext', 'Failed to connect:', error);
      setConnectionState('disconnected');
    }
  }, [isAuthenticated, user, setupPresence, subscribeToNotifications]);

  /**
   * Disconnect from Supabase Realtime
   */
  const disconnect = useCallback(() => {
    logger.info('RealtimeContext', 'Disconnecting from Supabase Realtime');

    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
      presenceChannelRef.current = null;
    }

    if (notificationChannelRef.current) {
      supabase.removeChannel(notificationChannelRef.current);
      notificationChannelRef.current = null;
    }

    setConnectionState('disconnected');
    setOnlineUsers(new Set());
  }, []);

  /**
   * Force reconnect
   */
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      void connect();
    }, 1000);
  }, [disconnect, connect]);

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
   * Check if user is online
   */
  const isUserOnline = useCallback(
    (userId: string): boolean => {
      return onlineUsers.has(userId);
    },
    [onlineUsers],
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

      // Online users
      onlineUsers,
      isUserOnline,

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
      onlineUsers,
      isUserOnline,
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
