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
export function useRealtimeSubscription<T extends Record<string, unknown>>(
  config: RealtimeConfig<T>,
) {
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
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          filter,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
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
      .subscribe((status: string) => {
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
  [key: string]: unknown;
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
  [key: string]: unknown;
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
  [key: string]: unknown;
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
  [key: string]: unknown;
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
          .map((p) => (p as Record<string, unknown>).admin_id as string);
        setOnlineAdmins(admins);
      })
      .subscribe(async (status: string) => {
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
  [key: string]: unknown;
}

// ============================================
// NEW: Extended Real-time Subscriptions
// ============================================

/**
 * Hook for real-time new user registrations
 */
export function useRealtimeUsers(
  onNewUser?: (user: RealtimeUser) => void,
  onUserUpdate?: (user: RealtimeUser) => void,
) {
  return useRealtimeSubscription<RealtimeUser>({
    table: 'users',
    event: '*',
    onInsert: (user) => {
      onNewUser?.(user);
      toast.success('Yeni kullanıcı kaydı', {
        description: `${user.full_name || user.email}`,
      });
    },
    onUpdate: ({ new: user }) => onUserUpdate?.(user),
  });
}

interface RealtimeUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  kyc_status: string;
  created_at: string;
  [key: string]: unknown;
}

/**
 * Hook for real-time moment submissions (moderation queue)
 */
export function useRealtimeMoments(
  onNewMoment?: (moment: RealtimeMoment) => void,
  onMomentUpdate?: (moment: RealtimeMoment) => void,
) {
  return useRealtimeSubscription<RealtimeMoment>({
    table: 'moments',
    event: '*',
    onInsert: (moment) => {
      onNewMoment?.(moment);
      if (moment.status === 'active') {
        toast.info('Yeni moment yayınlandı', {
          description: moment.title,
        });
      }
    },
    onUpdate: ({ new: moment }) => onMomentUpdate?.(moment),
  });
}

interface RealtimeMoment {
  id: string;
  user_id: string;
  title: string;
  status: string;
  category: string | null;
  created_at: string;
  [key: string]: unknown;
}

/**
 * Hook for real-time proof submissions (verification queue)
 */
export function useRealtimeProofs(
  onNewProof?: (proof: RealtimeProof) => void,
  onProofUpdate?: (proof: RealtimeProof) => void,
) {
  return useRealtimeSubscription<RealtimeProof>({
    table: 'proofs',
    event: '*',
    onInsert: (proof) => {
      onNewProof?.(proof);
      toast.info('Yeni proof doğrulama bekliyor', {
        description: `Proof #${proof.id.slice(0, 8)}`,
      });
    },
    onUpdate: ({ new: proof }) => {
      onProofUpdate?.(proof);
      if (proof.status === 'verified') {
        toast.success('Proof doğrulandı', {
          description: `Proof #${proof.id.slice(0, 8)}`,
        });
      } else if (proof.status === 'rejected') {
        toast.error('Proof reddedildi', {
          description: `Proof #${proof.id.slice(0, 8)}`,
        });
      }
    },
  });
}

interface RealtimeProof {
  id: string;
  moment_id: string;
  user_id: string;
  type: string;
  status: string;
  ai_score: number | null;
  created_at: string;
  [key: string]: unknown;
}

/**
 * Hook for real-time KYC submissions
 */
export function useRealtimeKYC(
  onNewKYC?: (kyc: RealtimeKYC) => void,
  onKYCUpdate?: (kyc: RealtimeKYC) => void,
) {
  // KYC status changes are tracked in users table
  return useRealtimeSubscription<RealtimeKYC>({
    table: 'users',
    event: 'UPDATE',
    filter: 'kyc_status=neq.not_started',
    onUpdate: ({ old: oldUser, new: newUser }) => {
      // Only trigger when kyc_status changes
      if (oldUser.kyc_status !== newUser.kyc_status) {
        if (newUser.kyc_status === 'pending') {
          onNewKYC?.(newUser);
          toast.info('Yeni KYC başvurusu', {
            description: newUser.full_name || newUser.email,
          });
        } else {
          onKYCUpdate?.(newUser);
        }
      }
    },
  });
}

interface RealtimeKYC {
  id: string;
  email: string;
  full_name: string | null;
  kyc_status: string;
  [key: string]: unknown;
}

/**
 * Hook for real-time transaction alerts (high-value)
 */
export function useRealtimeTransactions(options?: {
  minAmount?: number;
  onNewTransaction?: (tx: RealtimeTransaction) => void;
  onTransactionUpdate?: (tx: RealtimeTransaction) => void;
}) {
  const minAmount = options?.minAmount ?? 1000; // Default 1000 TRY threshold

  return useRealtimeSubscription<RealtimeTransaction>({
    table: 'transactions',
    event: '*',
    onInsert: (tx) => {
      if (tx.amount >= minAmount) {
        options?.onNewTransaction?.(tx);
        toast.warning('Yüksek tutarlı işlem', {
          description: `${tx.amount} ${tx.currency} - ${tx.type}`,
        });
      }
    },
    onUpdate: ({ new: tx }) => {
      if (tx.status === 'failed' || tx.status === 'refunded') {
        options?.onTransactionUpdate?.(tx);
        toast.error(
          `İşlem ${tx.status === 'failed' ? 'başarısız' : 'iade edildi'}`,
          {
            description: `${tx.amount} ${tx.currency}`,
          },
        );
      }
    },
  });
}

interface RealtimeTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

/**
 * Hook for real-time reports/flags
 */
export function useRealtimeReports(
  onNewReport?: (report: RealtimeReport) => void,
) {
  return useRealtimeSubscription<RealtimeReport>({
    table: 'reports',
    event: 'INSERT',
    onInsert: (report) => {
      onNewReport?.(report);
      toast.warning('Yeni rapor/şikayet', {
        description: `Sebep: ${report.reason}`,
      });
    },
  });
}

interface RealtimeReport {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_moment_id: string | null;
  reason: string;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

/**
 * Combined hook for Command Center real-time updates
 */
export function useCommandCenterRealtime() {
  const [counters, setCounters] = useState({
    newUsers: 0,
    newMoments: 0,
    pendingProofs: 0,
    pendingKYC: 0,
    activeDisputes: 0,
    highValueTx: 0,
  });

  // Users
  useRealtimeUsers(() =>
    setCounters((prev) => ({ ...prev, newUsers: prev.newUsers + 1 })),
  );

  // Moments
  useRealtimeMoments(() =>
    setCounters((prev) => ({ ...prev, newMoments: prev.newMoments + 1 })),
  );

  // Proofs
  useRealtimeProofs(
    () =>
      setCounters((prev) => ({
        ...prev,
        pendingProofs: prev.pendingProofs + 1,
      })),
    (proof) => {
      if (proof.status !== 'pending') {
        setCounters((prev) => ({
          ...prev,
          pendingProofs: Math.max(0, prev.pendingProofs - 1),
        }));
      }
    },
  );

  // Disputes
  useRealtimeDisputes(
    () =>
      setCounters((prev) => ({
        ...prev,
        activeDisputes: prev.activeDisputes + 1,
      })),
    (dispute) => {
      if (dispute.status === 'resolved' || dispute.status === 'dismissed') {
        setCounters((prev) => ({
          ...prev,
          activeDisputes: Math.max(0, prev.activeDisputes - 1),
        }));
      }
    },
  );

  // High value transactions
  useRealtimeTransactions({
    minAmount: 5000,
    onNewTransaction: () =>
      setCounters((prev) => ({ ...prev, highValueTx: prev.highValueTx + 1 })),
  });

  const resetCounters = useCallback(() => {
    setCounters({
      newUsers: 0,
      newMoments: 0,
      pendingProofs: 0,
      pendingKYC: 0,
      activeDisputes: 0,
      highValueTx: 0,
    });
  }, []);

  return { counters, resetCounters };
}
