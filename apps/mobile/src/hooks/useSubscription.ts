/**
 * React Hooks for Real-time Subscriptions
 * Easy-to-use hooks for managing Supabase real-time subscriptions in components
 * 
 * Type-safe implementation using database.types.ts
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import {
  subscriptionManager,
  SubscriptionConfig,
  SubscriptionStatus,
  Subscriptions,
} from '../services/subscriptionService';
import { logger } from '../utils/logger';
import { Database } from '../types/database.types';

// Type-safe table row types from database schema
type Tables = Database['public']['Tables'];
type MomentRow = Tables['moments']['Row'];
type MessageRow = Tables['messages']['Row'];
type NotificationRow = Tables['notifications']['Row'];
type RequestRow = Tables['requests']['Row'];

/**
 * Hook options
 */
interface UseSubscriptionOptions<T extends Record<string, unknown>> extends Omit<SubscriptionConfig<T>, 'table'> {
  enabled?: boolean; // Whether subscription is active
  table: string;
}

/**
 * Hook return value
 */
interface UseSubscriptionResult {
  status: SubscriptionStatus;
  isSubscribed: boolean;
  error: Error | null;
  reconnect: () => void;
  unsubscribe: () => void;
}

/**
 * Generic subscription hook
 * Automatically manages subscription lifecycle
 * 
 * @example
 * const { isSubscribed, status } = useSubscription({
 *   table: 'moments',
 *   filter: `user_id=eq.${userId}`,
 *   onInsert: (payload) => console.log('New moment:', payload.new),
 *   enabled: !!userId,
 * });
 */
export const useSubscription = <T extends Record<string, unknown> = Record<string, unknown>>(
  id: string,
  options: UseSubscriptionOptions<T>
): UseSubscriptionResult => {
  const { enabled = true, ...config } = options;
  const [status, setStatus] = useState<SubscriptionStatus>('IDLE');
  const [error, setError] = useState<Error | null>(null);
  const subscriptionIdRef = useRef<string>(id);

  // Update subscription ID if it changes
  useEffect(() => {
    subscriptionIdRef.current = id;
  }, [id]);

  // Subscribe/unsubscribe based on enabled flag
  useEffect(() => {
    if (!enabled) {
      return;
    }

    logger.info('useSubscription', `Subscribing to ${config.table} (${id})`);

    const unsubscribe = subscriptionManager.subscribe(id, {
      ...config,
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
        config.onStatusChange?.(newStatus);
      },
      onError: (err) => {
        setError(err);
        config.onError?.(err);
      },
    });

    // Cleanup on unmount or when dependencies change
    return () => {
      logger.info('useSubscription', `Unsubscribing from ${config.table} (${id})`);
      subscriptionManager.unsubscribe(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, id, config.table, config.filter]);

  const reconnect = useCallback(() => {
    subscriptionManager.unsubscribe(subscriptionIdRef.current);
    subscriptionManager.subscribe(subscriptionIdRef.current, config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _unsubscribe = useCallback(() => {
    subscriptionManager.unsubscribe(subscriptionIdRef.current);
  }, []);

  return {
    status,
    isSubscribed: status === 'SUBSCRIBED',
    error,
    reconnect,
    unsubscribe,
  };
};

/**
 * Hook for subscribing to user's moments
 * 
 * @example
 * const { moments } = useUserMomentsSubscription(userId, {
 *   onInsert: (moment) => console.log('New moment:', moment),
 * });
 */
export const useUserMomentsSubscription = (
  userId: string | null,
  handlers: {
    onInsert?: (moment: MomentRow) => void;
    onUpdate?: (moment: MomentRow) => void;
    onDelete?: (momentId: string) => void;
  } = {}
) => {
  return useSubscription(`user-moments-${userId}`, {
    table: 'moments',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId,
    onInsert: (payload) => {
      handlers.onInsert?.(payload.new as MomentRow);
    },
    onUpdate: (payload) => {
      handlers.onUpdate?.(payload.new as MomentRow);
    },
    onDelete: (payload) => {
      handlers.onDelete?.((payload.old as Partial<MomentRow>)?.id ?? '');
    },
  });
};

/**
 * Hook for subscribing to chat messages
 * 
 * @example
 * const { isSubscribed } = useChatMessagesSubscription(chatId, {
 *   onNewMessage: (message) => {
 *     setMessages(prev => [...prev, message]);
 *   },
 * });
 */
export const useChatMessagesSubscription = (
  chatId: string | null,
  handlers: {
    onNewMessage?: (message: MessageRow) => void;
    onMessageUpdate?: (message: MessageRow) => void;
  } = {}
) => {
  return useSubscription(`chat-messages-${chatId}`, {
    table: 'messages',
    filter: chatId ? `chat_id=eq.${chatId}` : undefined,
    enabled: !!chatId,
    onInsert: (payload) => {
      handlers.onNewMessage?.(payload.new as MessageRow);
    },
    onUpdate: (payload) => {
      handlers.onMessageUpdate?.(payload.new as MessageRow);
    },
  });
};

/**
 * Hook for subscribing to user notifications
 * 
 * @example
 * const { unreadCount } = useNotificationsSubscription(userId, {
 *   onNewNotification: (notification) => {
 *     showToast(notification.message);
 *   },
 * });
 */
export const useNotificationsSubscription = (
  userId: string | null,
  handlers: {
    onNewNotification?: (notification: NotificationRow) => void;
    onNotificationRead?: (notificationId: string) => void;
  } = {}
) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const result = useSubscription(`user-notifications-${userId}`, {
    table: 'notifications',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId,
    onInsert: (payload) => {
      setUnreadCount((prev) => prev + 1);
      handlers.onNewNotification?.(payload.new as NotificationRow);
    },
    onUpdate: (payload) => {
      const newRecord = payload.new as Partial<NotificationRow>;
      const oldRecord = payload.old as Partial<NotificationRow>;
      if (newRecord?.read && !oldRecord?.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
        handlers.onNotificationRead?.(newRecord?.id ?? '');
      }
    },
  });

  return {
    ...result,
    unreadCount,
  };
};

/**
 * Hook for subscribing to booking requests
 * 
 * @example
 * const { pendingRequests } = useBookingRequestsSubscription(userId, {
 *   onNewRequest: (request) => {
 *     showNotification('New booking request!');
 *   },
 * });
 */
export const useBookingRequestsSubscription = (
  userId: string | null,
  handlers: {
    onNewRequest?: (request: RequestRow) => void;
    onRequestUpdate?: (request: RequestRow) => void;
  } = {}
) => {
  const [pendingRequests, setPendingRequests] = useState<RequestRow[]>([]);

  const result = useSubscription(`booking-requests-${userId}`, {
    table: 'exchanges',
    filter: userId ? `host_id=eq.${userId}` : undefined,
    enabled: !!userId,
    onInsert: (payload) => {
      const newRecord = payload.new as Partial<RequestRow>;
      if (newRecord?.status === 'pending') {
        setPendingRequests((prev) => [...prev, payload.new as RequestRow]);
        handlers.onNewRequest?.(payload.new as RequestRow);
      }
    },
    onUpdate: (payload) => {
      const newRecord = payload.new as Partial<RequestRow>;
      setPendingRequests((prev) =>
        prev.filter((req) => req.id !== newRecord?.id)
      );
      handlers.onRequestUpdate?.(payload.new as RequestRow);
    },
  });

  return {
    ...result,
    pendingRequests,
  };
};

// User presence type (not in generated types as it may be a custom table)
interface UserPresenceRecord {
  user_id: string;
  is_online: boolean;
  last_seen: string;
}

/**
 * Hook for tracking user presence
 * 
 * @example
 * const { isOnline } = useUserPresence(otherUserId);
 */
export const useUserPresence = (userId: string | null) => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);

  const result = useSubscription(`user-presence-${userId}`, {
    table: 'user_presence',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId,
    onChange: (payload) => {
      const newRecord = payload.new as Partial<UserPresenceRecord>;
      setIsOnline(newRecord?.is_online ?? false);
      setLastSeen(newRecord?.last_seen ? new Date(newRecord.last_seen) : null);
    },
  });

  return {
    ...result,
    isOnline,
    lastSeen,
  };
};

/**
 * Hook for multiple subscriptions
 * Manages multiple subscriptions with a single hook
 * 
 * @example
 * useMultipleSubscriptions([
 *   { id: 'moments', table: 'moments', onInsert: handleNewMoment },
 *   { id: 'messages', table: 'messages', onInsert: handleNewMessage },
 * ]);
 */
export const useMultipleSubscriptions = <T extends Record<string, unknown> = Record<string, unknown>>(
  subscriptions: Array<{ id: string } & UseSubscriptionOptions<T>>
) => {
  // Note: This hook has a limitation - it cannot dynamically change subscriptions
  // The subscriptions array length must remain constant across renders
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const results = subscriptions.map((sub) => {
    const { id, ...config } = sub;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSubscription(id, config);
  });

  const allSubscribed = results.every((result) => result.isSubscribed);
  const hasError = results.some((result) => result.error !== null);

  return {
    results,
    allSubscribed,
    hasError,
    unsubscribeAll: () => {
      results.forEach((result) => result.unsubscribe());
    },
  };
};

/**
 * Hook for data synchronization
 * Keeps local state in sync with real-time updates
 * 
 * @example
 * const { data, setData, isSubscribed } = useRealtimeData({
 *   table: 'moments',
 *   initialData: [],
 *   filter: `user_id=eq.${userId}`,
 * });
 */
export const useRealtimeData = <T extends Record<string, unknown> = Record<string, unknown>>({
  table,
  filter,
  initialData,
  enabled = true,
}: {
  table: string;
  filter?: string;
  initialData: T[];
  enabled?: boolean;
}) => {
  const [data, setData] = useState<T[]>(initialData);
  const subscriptionId = `realtime-data-${table}-${filter}`;

  const result = useSubscription<T>(subscriptionId, {
    table,
    filter,
    enabled,
    onInsert: (payload) => {
      setData((prev) => [...prev, payload.new as T]);
    },
    onUpdate: (payload) => {
      setData((prev) =>
        prev.map((item) => {
          const itemWithId = item as T & { id?: string };
          const newData = payload.new as T & { id?: string };
          return itemWithId.id === newData.id ? (payload.new as T) : item;
        })
      );
    },
    onDelete: (payload) => {
      setData((prev) =>
        prev.filter((item) => {
          const itemWithId = item as T & { id?: string };
          const oldData = payload.old as Partial<T> & { id?: string };
          return itemWithId.id !== oldData.id;
        })
      );
    },
  });

  return {
    ...result,
    data,
    setData,
  };
};
