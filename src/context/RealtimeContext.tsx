import type { ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuth } from './AuthContext';
import { logger } from '../utils/logger';

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

  // Online users
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

  // Manual controls
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(
  undefined,
);

// WebSocket configuration
const WS_CONFIG = {
  url: process.env.EXPO_PUBLIC_WS_URL || 'wss://api.travelmatch.com/ws',
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  reconnectMultiplier: 1.5,
  pingInterval: 30000,
  pongTimeout: 10000,
};

export const RealtimeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, getAccessToken } = useAuth();

  // State
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Refs for WebSocket and handlers
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<EventHandlers>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pongTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef(WS_CONFIG.reconnectDelay);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Derived state
  const isConnected = connectionState === 'connected';

  /**
   * Clear all timeouts and intervals
   */
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (pongTimeoutRef.current) {
      clearTimeout(pongTimeoutRef.current);
      pongTimeoutRef.current = null;
    }
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
   * Send message through WebSocket
   */
  const send = useCallback((type: string, payload: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  /**
   * Start ping/pong heartbeat
   */
  const startHeartbeat = useCallback(() => {
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        send('ping', { timestamp: Date.now() });

        // Set pong timeout
        pongTimeoutRef.current = setTimeout(() => {
          logger.warn('Pong timeout, reconnecting...');
          wsRef.current?.close();
        }, WS_CONFIG.pongTimeout);
      }
    }, WS_CONFIG.pingInterval);
  }, [send]);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (!isAuthenticated) return;

    try {
      setConnectionState('connecting');

      const token = await getAccessToken();
      if (!token) {
        setConnectionState('disconnected');
        return;
      }

      const ws = new WebSocket(`${WS_CONFIG.url}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        logger.debug('WebSocket connected');
        setConnectionState('connected');
        reconnectDelayRef.current = WS_CONFIG.reconnectDelay;
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as {
            type: string;
            payload: unknown;
          };

          // Handle pong
          if (message.type === 'pong') {
            if (pongTimeoutRef.current) {
              clearTimeout(pongTimeoutRef.current);
              pongTimeoutRef.current = null;
            }
            return;
          }

          // Handle online users list
          if (message.type === 'online_users') {
            const users = message.payload as string[];
            setOnlineUsers(new Set(users));
            return;
          }

          // Handle user status changes
          if (message.type === 'user:online') {
            const { userId } = message.payload as UserStatusEvent;
            setOnlineUsers((prev) => new Set([...prev, userId]));
            emit('user:online', message.payload);
            return;
          }

          if (message.type === 'user:offline') {
            const { userId } = message.payload as UserStatusEvent;
            setOnlineUsers((prev) => {
              const next = new Set(prev);
              next.delete(userId);
              return next;
            });
            emit('user:offline', message.payload);
            return;
          }

          // Emit other events
          emit(message.type as RealtimeEventType, message.payload);
        } catch (error) {
          logger.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        logger.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        logger.debug('WebSocket closed');
        clearTimers();

        // Reconnect if authenticated and app is active
        if (isAuthenticated && appStateRef.current === 'active') {
          setConnectionState('reconnecting');

          reconnectTimeoutRef.current = setTimeout(() => {
            // Exponential backoff
            reconnectDelayRef.current = Math.min(
              reconnectDelayRef.current * WS_CONFIG.reconnectMultiplier,
              WS_CONFIG.maxReconnectDelay,
            );
            connect();
          }, reconnectDelayRef.current);
        } else {
          setConnectionState('disconnected');
        }
      };
    } catch (error) {
      logger.error('Failed to connect WebSocket:', error);
      setConnectionState('disconnected');
    }
  }, [isAuthenticated, getAccessToken, emit, startHeartbeat, clearTimers]);

  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionState('disconnected');
  }, [clearTimers]);

  /**
   * Force reconnect
   */
  const reconnect = useCallback(() => {
    disconnect();
    reconnectDelayRef.current = WS_CONFIG.reconnectDelay;
    connect();
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
      // eslint-disable-next-line @typescript-eslint/no-empty-function
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
   * Send typing start indicator
   */
  const sendTypingStart = useCallback(
    (conversationId: string) => {
      send('typing:start', { conversationId });
    },
    [send],
  );

  /**
   * Send typing stop indicator
   */
  const sendTypingStop = useCallback(
    (conversationId: string) => {
      send('typing:stop', { conversationId });
    },
    [send],
  );

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          connect();
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

  return (
    <RealtimeContext.Provider
      value={{
        // Connection state
        connectionState,
        isConnected,

        // Online users
        onlineUsers,
        isUserOnline,

        // Event subscription
        subscribe,

        // Typing indicators
        sendTypingStart,
        sendTypingStop,

        // Manual controls
        connect,
        disconnect,
        reconnect,
      }}
    >
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
