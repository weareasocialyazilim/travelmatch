/**
 * usePaymentRealtime Hook
 * Real-time payment status tracking via Supabase Realtime
 *
 * Replaces polling with WebSocket subscriptions for instant payment updates.
 * When PayTR webhook updates transaction status, UI reacts immediately.
 *
 * @example
 * ```tsx
 * const { status, isSuccess, isFailed } = usePaymentRealtime({
 *   transactionId: 'tx_123',
 *   onSuccess: () => showSuccessModal(),
 *   onFailed: () => showErrorState(),
 * });
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/config/supabase';
import { realtimeChannelManager } from '@/services/realtimeChannelManager';
import { logger } from '@/utils/logger';
import * as Haptics from 'expo-haptics';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'authorized'
  | 'captured'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export interface PaymentRealtimeOptions {
  /** Transaction ID to track */
  transactionId?: string;
  /** Gift ID to track (alternative to transactionId) */
  giftId?: string;
  /** Escrow ID to track (alternative to transactionId) */
  escrowId?: string;
  /** Callback when payment succeeds */
  onSuccess?: (data: PaymentUpdateData) => void;
  /** Callback when payment fails */
  onFailed?: (data: PaymentUpdateData) => void;
  /** Callback on any status change */
  onStatusChange?: (status: PaymentStatus, data: PaymentUpdateData) => void;
  /** Enable haptic feedback on status changes */
  enableHaptics?: boolean;
}

export interface PaymentUpdateData {
  id: string;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  paytrStatus?: string;
  paytrMessage?: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface UsePaymentRealtimeReturn {
  /** Current payment status */
  status: PaymentStatus | null;
  /** Whether payment is successful */
  isSuccess: boolean;
  /** Whether payment failed */
  isFailed: boolean;
  /** Whether payment is still processing */
  isProcessing: boolean;
  /** Last update data */
  lastUpdate: PaymentUpdateData | null;
  /** Error if any */
  error: string | null;
  /** Manually refresh status */
  refresh: () => Promise<void>;
}

/**
 * Hook for real-time payment status tracking
 */
export const usePaymentRealtime = (
  options: PaymentRealtimeOptions,
): UsePaymentRealtimeReturn => {
  const {
    transactionId,
    giftId,
    escrowId,
    onSuccess,
    onFailed,
    onStatusChange,
    enableHaptics = true,
  } = options;

  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [lastUpdate, setLastUpdate] = useState<PaymentUpdateData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const callbacksRef = useRef({ onSuccess, onFailed, onStatusChange });

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = { onSuccess, onFailed, onStatusChange };
  }, [onSuccess, onFailed, onStatusChange]);

  // Determine which table and filter to use
  const getSubscriptionConfig = useCallback(() => {
    if (transactionId) {
      return { table: 'transactions', filter: `id=eq.${transactionId}` };
    }
    if (giftId) {
      return { table: 'gifts', filter: `id=eq.${giftId}` };
    }
    if (escrowId) {
      return { table: 'escrow_transactions', filter: `id=eq.${escrowId}` };
    }
    return null;
  }, [transactionId, giftId, escrowId]);

  // Handle payment update
  const handleUpdate = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      const record = payload.new as Record<string, unknown>;
      if (!record) return;

      const newStatus =
        (record.status as PaymentStatus) ||
        (record.payment_status as PaymentStatus);
      const updateData: PaymentUpdateData = {
        id: record.id as string,
        status: newStatus,
        amount: record.amount as number,
        currency: record.currency as string,
        paytrStatus: record.paytr_status as string,
        paytrMessage: record.paytr_message as string,
        updatedAt: (record.updated_at as string) || new Date().toISOString(),
        metadata: record.metadata as Record<string, unknown>,
      };

      logger.info('usePaymentRealtime', 'Payment update received', {
        id: updateData.id,
        status: newStatus,
      });

      setStatus(newStatus);
      setLastUpdate(updateData);

      // Trigger callbacks
      callbacksRef.current.onStatusChange?.(newStatus, updateData);

      // Handle success states
      const successStates: PaymentStatus[] = [
        'completed',
        'captured',
        'authorized',
      ];
      if (successStates.includes(newStatus)) {
        if (enableHaptics) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        callbacksRef.current.onSuccess?.(updateData);
      }

      // Handle failure states
      const failureStates: PaymentStatus[] = [
        'failed',
        'cancelled',
        'refunded',
      ];
      if (failureStates.includes(newStatus)) {
        if (enableHaptics) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        callbacksRef.current.onFailed?.(updateData);
      }
    },
    [enableHaptics],
  );

  // Manual refresh
  const refresh = useCallback(async () => {
    const config = getSubscriptionConfig();
    if (!config) return;

    try {
      const { table, filter } = config;
      const [column, value] = filter.split('=eq.');

      const { data, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq(column, value)
        .single();

      if (fetchError) throw fetchError;
      if (data) {
        handleUpdate({
          eventType: 'UPDATE',
          new: data as Record<string, unknown>,
          old: {},
          schema: 'public',
          table,
          commit_timestamp: new Date().toISOString(),
          errors: [],
        });
      }
    } catch (err) {
      logger.error('usePaymentRealtime', 'Refresh failed', err);
      setError('Ödeme durumu alınamadı');
    }
  }, [getSubscriptionConfig, handleUpdate]);

  // Subscribe to realtime updates
  useEffect(() => {
    const config = getSubscriptionConfig();
    if (!config) return;

    const { table, filter } = config;

    logger.debug('usePaymentRealtime', 'Subscribing to payment updates', {
      table,
      filter,
    });

    // Initial fetch
    refresh();

    // Subscribe to changes
    unsubscribeRef.current = realtimeChannelManager.subscribeToTable(table, {
      filter,
      event: 'UPDATE',
      onUpdate: handleUpdate,
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [getSubscriptionConfig, handleUpdate, refresh]);

  // Derived states
  const isSuccess =
    status === 'completed' || status === 'captured' || status === 'authorized';
  const isFailed = status === 'failed' || status === 'cancelled';
  const isProcessing = status === 'pending' || status === 'processing';

  return {
    status,
    isSuccess,
    isFailed,
    isProcessing,
    lastUpdate,
    error,
    refresh,
  };
};

/**
 * Hook for tracking multiple payments (e.g., bulk gifts)
 */
export const useMultiPaymentRealtime = (
  transactionIds: string[],
  callbacks?: Pick<PaymentRealtimeOptions, 'onSuccess' | 'onFailed'>,
) => {
  const [statuses, setStatuses] = useState<Map<string, PaymentStatus>>(
    new Map(),
  );
  const unsubscribesRef = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    // Cleanup old subscriptions
    unsubscribesRef.current.forEach((unsub) => unsub());
    unsubscribesRef.current.clear();

    // Subscribe to each transaction
    transactionIds.forEach((txId) => {
      const unsub = realtimeChannelManager.subscribeToTable('transactions', {
        filter: `id=eq.${txId}`,
        event: 'UPDATE',
        onUpdate: (payload) => {
          const newStatus = (payload.new as Record<string, unknown>)
            .status as PaymentStatus;
          setStatuses((prev) => new Map(prev).set(txId, newStatus));

          if (newStatus === 'completed')
            callbacks?.onSuccess?.({
              id: txId,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            });
          if (newStatus === 'failed')
            callbacks?.onFailed?.({
              id: txId,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            });
        },
      });
      unsubscribesRef.current.set(txId, unsub);
    });

    return () => {
      unsubscribesRef.current.forEach((unsub) => unsub());
      unsubscribesRef.current.clear();
    };
  }, [transactionIds, callbacks]);

  const allCompleted = transactionIds.every(
    (id) => statuses.get(id) === 'completed',
  );
  const anyFailed = transactionIds.some((id) => statuses.get(id) === 'failed');

  return { statuses, allCompleted, anyFailed };
};

export default usePaymentRealtime;
