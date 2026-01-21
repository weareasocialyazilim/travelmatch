/**
 * useWalletRealtime - Live LVND Balance Updates
 * Supabase Realtime subscription for instant wallet sync
 */
import { useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

interface UseWalletRealtimeOptions {
  onBalanceUpdate?: (newBalance: number) => void;
  enabled?: boolean;
}

export const useWalletRealtime = (
  userId: string | undefined,
  options: UseWalletRealtimeOptions = {},
) => {
  const { onBalanceUpdate, enabled = true } = options;

  const setupRealtimeSubscription = useCallback(() => {
    if (!userId || !enabled) return null;

    const channel = supabase
      .channel(`wallet-realtime:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.info('[Realtime] Wallet update received:', {
            eventType: payload.eventType,
            newBalance: (payload.new as { balance?: number })?.balance,
          });

          const newBalance = (payload.new as { coins_balance?: number })?.coins_balance;
          if (newBalance !== undefined && onBalanceUpdate) {
            onBalanceUpdate(newBalance);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gifts',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          logger.info('[Realtime] New gift received:', {
            amount: (payload.new as { amount?: number })?.amount,
            senderId: (payload.new as { sender_id?: string })?.sender_id,
          });
          // This will trigger a balance refresh via the wallet update
        },
      )
      .subscribe((status) => {
        logger.info('[Realtime] Subscription status:', status);
      });

    return channel;
  }, [userId, enabled, onBalanceUpdate]);

  useEffect(() => {
    const channel = setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [setupRealtimeSubscription]);
};

export default useWalletRealtime;
