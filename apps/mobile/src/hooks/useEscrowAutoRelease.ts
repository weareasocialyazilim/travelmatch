/**
 * useEscrowAutoRelease - 48 Saat Auto-Release Hook
 *
 * Dating & Gifting Platform için escrow otomatik serbest bırakma mantığı.
 * Eğer gönderici 48 saat içinde kanıtı onaylamazsa veya itiraz etmezse,
 * sistem otomatik olarak ödemeyi alıcıya serbest bırakır.
 *
 * @module useEscrowAutoRelease
 * @version 1.0.0 - Master 2026
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

// ============================================
// TYPES
// ============================================
export interface EscrowStatus {
  id: string;
  status:
    | 'pending_proof'
    | 'in_escrow'
    | 'pending_verification'
    | 'released'
    | 'refunded'
    | 'disputed';
  proofSubmittedAt: string | null;
  autoReleaseAt: string | null;
  hoursRemaining: number | null;
  canDispute: boolean;
  canApprove: boolean;
  isAutoReleaseImminent: boolean; // Son 6 saat
}

export interface UseEscrowAutoReleaseOptions {
  /** Escrow transaction ID */
  escrowId: string;
  /** Enable real-time updates */
  realtime?: boolean;
  /** Callback when auto-release timer hits 0 */
  onAutoRelease?: () => void;
  /** Callback when approaching deadline (6 hours) */
  onDeadlineApproaching?: () => void;
}

export interface UseEscrowAutoReleaseReturn {
  /** Current escrow status */
  status: EscrowStatus | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Approve proof and release payment */
  approveProof: () => Promise<boolean>;
  /** Dispute proof within 48 hours */
  disputeProof: (reason: string) => Promise<boolean>;
  /** Request additional proof */
  requestAdditionalProof: (message: string) => Promise<boolean>;
  /** Formatted countdown string (e.g., "23:45:12") */
  countdown: string | null;
  /** Refresh status */
  refresh: () => Promise<void>;
}

// ============================================
// CONSTANTS
// ============================================
/** Auto-release timer duration in hours - 48h standard */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AUTO_RELEASE_HOURS = 48;
const IMMINENT_THRESHOLD_HOURS = 6;

// ============================================
// HOOK
// ============================================
export function useEscrowAutoRelease(
  options: UseEscrowAutoReleaseOptions,
): UseEscrowAutoReleaseReturn {
  const {
    escrowId,
    realtime = true,
    onAutoRelease,
    onDeadlineApproaching,
  } = options;

  const [status, setStatus] = useState<EscrowStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);

  // Fetch escrow status
  const fetchStatus = useCallback(async () => {
    if (!escrowId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('escrow_transactions')
        .select(
          `
          id,
          status,
          created_at,
          amount,
          sender_id,
          recipient_id,
          expires_at
        `,
        )
        .eq('id', escrowId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Escrow not found');

      // Type assertion for database response
      const escrowData = data as {
        id: string;
        status: string;
        created_at: string;
        amount: number;
        sender_id: string;
        recipient_id: string;
        expires_at: string | null;
      };

      // Calculate hours remaining
      let hoursRemaining: number | null = null;
      let autoReleaseAt: string | null = null;

      if (escrowData.expires_at && escrowData.status === 'pending') {
        autoReleaseAt = escrowData.expires_at;
        const now = new Date();
        const releaseTime = new Date(autoReleaseAt);
        hoursRemaining = Math.max(
          0,
          (releaseTime.getTime() - now.getTime()) / (1000 * 60 * 60),
        );
      }

      const escrowStatus: EscrowStatus = {
        id: escrowData.id,
        status: escrowData.status as EscrowStatus['status'],
        proofSubmittedAt: null, // Not in current schema
        autoReleaseAt,
        hoursRemaining,
        canDispute:
          escrowData.status === 'pending' &&
          hoursRemaining !== null &&
          hoursRemaining > 0,
        canApprove: escrowData.status === 'pending',
        isAutoReleaseImminent:
          hoursRemaining !== null && hoursRemaining <= IMMINENT_THRESHOLD_HOURS,
      };

      setStatus(escrowStatus);

      // Trigger callback if deadline approaching
      if (escrowStatus.isAutoReleaseImminent && onDeadlineApproaching) {
        onDeadlineApproaching();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch escrow status';
      setError(message);
      logger.error('[useEscrowAutoRelease] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [escrowId, onDeadlineApproaching]);

  // Approve proof and release payment
  const approveProof = useCallback(async (): Promise<boolean> => {
    if (!escrowId || !status?.canApprove) return false;

    try {
      // Use type assertion for custom RPC function not in generated types
      const { error: rpcError } = await (supabase.rpc as any)(
        'approve_escrow_release',
        {
          p_escrow_id: escrowId,
        },
      );

      if (rpcError) throw rpcError;

      // Refresh status
      await fetchStatus();
      return true;
    } catch (err) {
      logger.error('[useEscrowAutoRelease] Approve error:', err);
      return false;
    }
  }, [escrowId, status?.canApprove, fetchStatus]);

  // Dispute proof
  const disputeProof = useCallback(
    async (reason: string): Promise<boolean> => {
      if (!escrowId || !status?.canDispute) return false;

      try {
        // Use type assertion for custom RPC function
        const { error: rpcError } = await (supabase.rpc as any)(
          'dispute_escrow',
          {
            p_escrow_id: escrowId,
            p_reason: reason,
          },
        );

        if (rpcError) throw rpcError;

        await fetchStatus();
        return true;
      } catch (err) {
        logger.error('[useEscrowAutoRelease] Dispute error:', err);
        return false;
      }
    },
    [escrowId, status?.canDispute, fetchStatus],
  );

  // Request additional proof
  const requestAdditionalProof = useCallback(
    async (message: string): Promise<boolean> => {
      if (!escrowId) return false;

      try {
        // Use type assertion for custom RPC function
        const { error: rpcError } = await (supabase.rpc as any)(
          'request_additional_proof',
          {
            p_escrow_id: escrowId,
            p_message: message,
          },
        );

        if (rpcError) throw rpcError;

        await fetchStatus();
        return true;
      } catch (err) {
        logger.error(
          '[useEscrowAutoRelease] Request additional proof error:',
          err,
        );
        return false;
      }
    },
    [escrowId, fetchStatus],
  );

  // Countdown timer effect
  useEffect(() => {
    if (!status?.autoReleaseAt) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const releaseTime = new Date(status.autoReleaseAt!);
      const diff = releaseTime.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('00:00:00');
        onAutoRelease?.();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [status?.autoReleaseAt, onAutoRelease]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Real-time subscription
  useEffect(() => {
    if (!realtime || !escrowId) return;

    const channel = supabase
      .channel(`escrow-${escrowId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'escrow_transactions',
          filter: `id=eq.${escrowId}`,
        },
        () => {
          fetchStatus();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [realtime, escrowId, fetchStatus]);

  return {
    status,
    loading,
    error,
    approveProof,
    disputeProof,
    requestAdditionalProof,
    countdown,
    refresh: fetchStatus,
  };
}

// ============================================
// UTILITY HOOK - Format countdown for display
// ============================================
export function useFormattedCountdown(countdown: string | null): {
  display: string;
  isUrgent: boolean;
  description: string;
} {
  return useMemo(() => {
    if (!countdown) {
      return {
        display: '--:--:--',
        isUrgent: false,
        description: 'Süre bilgisi yok',
      };
    }

    const [hours, minutes] = countdown.split(':').map(Number);
    const totalHours = hours + minutes / 60;

    return {
      display: countdown,
      isUrgent: totalHours <= IMMINENT_THRESHOLD_HOURS,
      description:
        totalHours <= IMMINENT_THRESHOLD_HOURS
          ? '⚠️ Otomatik serbest bırakma yaklaşıyor!'
          : `${Math.ceil(totalHours)} saat içinde otomatik serbest bırakılacak`,
    };
  }, [countdown]);
}

export default useEscrowAutoRelease;
