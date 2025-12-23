'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';
import { getClient } from '@/lib/supabase';
import { toast } from 'sonner';

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface RealtimeConfig<T> {
  table: string;
  schema?: string;
  event?: PostgresChangeEvent | '*';
  filter?: string;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: { old: T; new: T }) => void;
  onDelete?: (payload: T) => void;
  showToast?: boolean;
}

/**
 * Hook for subscribing to real-time Postgres changes
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRealtimeSubscription<T = any>(config: RealtimeConfig<T>) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = getClient();
    const {
      table,
      schema = 'public',
      event = '*',
      filter,
      onInsert,
      onUpdate,
      onDelete,
      showToast,
    } = config;

    const channelName = `realtime:${schema}:${table}:${filter || 'all'}`;

    const newChannel = supabase
      .channel(channelName)
      // @ts-expect-error Supabase realtime API type issue
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          filter,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          switch (payload.eventType) {
            case 'INSERT':
              if (onInsert) {
                onInsert(payload.new as T);
              }
              if (showToast) {
                toast.info(`Yeni ${table} eklendi`);
              }
              break;
            case 'UPDATE':
              if (onUpdate) {
                onUpdate({
                  old: payload.old as T,
                  new: payload.new as T,
                });
              }
              break;
            case 'DELETE':
              if (onDelete) {
                onDelete(payload.old as T);
              }
              break;
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setError(new Error('Channel subscription failed'));
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false);
          setError(new Error('Channel subscription timed out'));
        }
      });

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
      setIsConnected(false);
    };
  }, [config.table, config.filter]);

  const unsubscribe = useCallback(() => {
    if (channel) {
      const supabase = getClient();
      supabase.removeChannel(channel);
      setChannel(null);
      setIsConnected(false);
    }
  }, [channel]);

  return { channel, isConnected, error, unsubscribe };
}

/**
 * Hook for real-time task queue updates
 */
export function useRealtimeTaskQueue(
  onNewTask?: (task: TaskQueueItem) => void,
  onTaskUpdate?: (task: TaskQueueItem) => void,
) {
  return useRealtimeSubscription<TaskQueueItem>({
    table: 'admin_task_queue',
    event: '*',
    onInsert: onNewTask,
    onUpdate: ({ new: newTask }) => onTaskUpdate?.(newTask),
    showToast: true,
  });
}

interface TaskQueueItem {
  id: string;
  type: string;
  priority: string;
  status: string;
  title: string;
  description: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Hook for real-time notifications
 */
export function useRealtimeNotifications(
  adminId: string,
  onNewNotification?: (notification: AdminNotification) => void,
) {
  return useRealtimeSubscription<AdminNotification>({
    table: 'admin_notifications',
    filter: `admin_id=eq.${adminId}`,
    event: 'INSERT',
    onInsert: (notification) => {
      onNewNotification?.(notification);
      if (!notification.read) {
        toast.info(notification.title, {
          description: notification.message,
        });
      }
    },
  });
}

interface AdminNotification {
  id: string;
  admin_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

/**
 * Hook for real-time dispute updates
 */
export function useRealtimeDisputes(
  onNewDispute?: (dispute: Dispute) => void,
  onDisputeUpdate?: (dispute: Dispute) => void,
) {
  return useRealtimeSubscription<Dispute>({
    table: 'disputes',
    event: '*',
    onInsert: (dispute) => {
      onNewDispute?.(dispute);
      toast.warning('Yeni şikayet alındı', {
        description: `Şikayet #${dispute.id.slice(0, 8)}`,
      });
    },
    onUpdate: ({ new: dispute }) => onDisputeUpdate?.(dispute),
  });
}

interface Dispute {
  id: string;
  status: string;
  priority: string;
  type: string;
  description: string;
  reporter_id: string;
  reported_id: string;
  created_at: string;
}

/**
 * Hook for real-time payout updates
 */
export function useRealtimePayouts(
  onNewPayout?: (payout: Payout) => void,
  onPayoutUpdate?: (payout: Payout) => void,
) {
  return useRealtimeSubscription<Payout>({
    table: 'payouts',
    event: '*',
    onInsert: onNewPayout,
    onUpdate: ({ new: payout }) => onPayoutUpdate?.(payout),
  });
}

interface Payout {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

/**
 * Hook for real-time user status updates
 */
export function useRealtimeUserStatus(
  userId: string,
  onStatusChange?: (isOnline: boolean) => void,
) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const supabase = getClient();

    const channel = supabase
      .channel(`presence:user:${userId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online = Object.keys(state).length > 0;
        setIsOnline(online);
        onStatusChange?.(online);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onStatusChange]);

  return { isOnline };
}

/**
 * Hook for broadcasting admin presence
 */
export function useAdminPresence(adminId: string) {
  const [onlineAdmins, setOnlineAdmins] = useState<string[]>([]);

  useEffect(() => {
    const supabase = getClient();

    const channel = supabase
      .channel('admin_presence')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const admins = Object.values(state)
          .flat()
          .map((p: Record<string, unknown>) => p.admin_id as string);
        setOnlineAdmins(admins);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            admin_id: adminId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminId]);

  return { onlineAdmins };
}

/**
 * Hook for real-time dashboard stats
 */
export function useRealtimeStats() {
  const [stats, setStats] = useState({
    activeUsers: 0,
    pendingDisputes: 0,
    pendingPayouts: 0,
    newUsersToday: 0,
  });

  useEffect(() => {
    const supabase = getClient();

    // Subscribe to multiple tables for stats updates
    const disputesChannel = supabase
      .channel('stats:disputes')
      .on<{ status: string }>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'disputes' },
        () => {
          // Refetch stats when disputes change
          fetchStats();
        },
      )
      .subscribe();

    const payoutsChannel = supabase
      .channel('stats:payouts')
      .on<{ status: string }>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payouts' },
        () => {
          fetchStats();
        },
      )
      .subscribe();

    async function fetchStats() {
      // In production, these would be actual queries
      // For now, return mock data
      setStats({
        activeUsers: Math.floor(Math.random() * 1000) + 500,
        pendingDisputes: Math.floor(Math.random() * 50),
        pendingPayouts: Math.floor(Math.random() * 30),
        newUsersToday: Math.floor(Math.random() * 100),
      });
    }

    fetchStats();

    return () => {
      supabase.removeChannel(disputesChannel);
      supabase.removeChannel(payoutsChannel);
    };
  }, []);

  return stats;
}

/**
 * Hook for real-time audit log streaming
 */
export function useRealtimeAuditLog(
  onNewEntry?: (entry: AuditLogEntry) => void,
) {
  const [recentEntries, setRecentEntries] = useState<AuditLogEntry[]>([]);

  useRealtimeSubscription<AuditLogEntry>({
    table: 'audit_logs',
    event: 'INSERT',
    onInsert: (entry) => {
      setRecentEntries((prev) => [entry, ...prev].slice(0, 50));
      onNewEntry?.(entry);
    },
  });

  return { recentEntries };
}

interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  created_at: string;
}
