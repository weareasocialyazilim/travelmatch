/**
 * Payment Hooks - Cleaned Up
 *
 * All user payments go through IAP (Apple/Google Play).
 * PayTR is only used for backend payouts (withdrawals).
 */

import { useState, useCallback, useEffect } from 'react';
import { walletService } from '@/services/walletService';
import { logger } from '@/utils/logger';

// ============================================
// WALLET BALANCE HOOK
// ============================================

export interface UseWalletBalanceReturn {
  balance: number;
  coins: number;
  currency: string;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useWalletBalance(): UseWalletBalanceReturn {
  const [balance, setBalance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [currency, setCurrency] = useState('TRY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await walletService.getBalance();
      setBalance(data.available);
      setCoins(data.coins);
      setCurrency(data.currency);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch balance'),
      );
      logger.error('useWalletBalance', 'refresh error', { err });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { balance, coins, currency, loading, error, refresh };
}

// ============================================
// WITHDRAW HOOK (PayTR Payout)
// ============================================

export interface UseWithdrawReturn {
  withdraw: (
    coinAmount: number,
    bankAccountId: string,
  ) => Promise<{
    settlementId: string;
    fiatAmount: number;
  }>;
  loading: boolean;
  error: Error | null;
}

export function useWithdraw(): UseWithdrawReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const withdraw = useCallback(
    async (coinAmount: number, bankAccountId: string) => {
      try {
        setLoading(true);
        setError(null);
        const result = await walletService.requestCoinWithdrawal({
          coinAmount,
          bankAccountId,
        });
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Withdrawal failed');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { withdraw, loading, error };
}

// ============================================
// SUBSCRIPTION HOOKS (IAP-based)
// ============================================

export interface Subscription {
  id: string;
  tier: string;
  status: 'active' | 'cancelled' | 'expired';
  expiresAt: string | null;
}

export function useSubscription() {
  return {
    subscription: null as Subscription | null,
    loading: false,
    error: null,
  };
}

export function useCreateSubscription() {
  return {
    create: async () => {},
    loading: false,
    error: null,
  };
}

export function useCancelSubscription() {
  return {
    cancel: async () => {},
    loading: false,
    error: null,
  };
}

// ============================================
// LEGACY ALIASES
// ============================================

// Kept for backward compatibility
export const useWallet = useWalletBalance;
export const usePaymentMethods = () => ({
  cards: [] as any[],
  loading: false,
  error: null,
  refresh: async () => {},
  deleteCard: async () => {},
  setDefaultCard: async () => {},
});
