/**
 * Payment Hooks
 *
 * React hooks for payment operations.
 * Wraps securePaymentService for component usage.
 */

import { useState, useCallback, useEffect } from 'react';
import { walletService, securePaymentService } from '@/services';
import { logger } from '@/utils/logger';

// ============================================
// WALLET HOOKS
// ============================================

export interface UseWalletBalanceReturn {
  balance: number;
  currency: string;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useWalletBalance(): UseWalletBalanceReturn {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('TRY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await walletService.getBalance();
      setBalance(data.available);
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

  return { balance, currency, loading, error, refresh };
}

// ============================================
// WITHDRAW HOOKS
// ============================================

export interface UseWithdrawReturn {
  withdraw: (amount: number, bankAccountId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export function useWithdraw(): UseWithdrawReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const withdraw = useCallback(
    async (amount: number, bankAccountId: string) => {
      try {
        setLoading(true);
        setError(null);
        await walletService.requestWithdrawal({ amount, bankAccountId });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Withdraw failed'));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { withdraw, loading, error };
}

// ============================================
// KYC HOOKS
// ============================================

export interface UseKYCStatusReturn {
  status: 'pending' | 'verified' | 'rejected' | 'not_started' | 'in_review';
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useKYCStatus(): UseKYCStatusReturn {
  const [status, setStatus] = useState<
    'pending' | 'verified' | 'rejected' | 'not_started' | 'in_review'
  >('not_started');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const result = await securePaymentService.getKYCStatus();
      setStatus(result.status);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch KYC status'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, loading, error, refresh };
}

export function useSubmitKYC() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = useCallback(async (_data: any) => {
    try {
      setLoading(true);
      await securePaymentService.startKYCVerification();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('KYC submission failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, loading, error };
}

// ============================================
// SUBSCRIPTION HOOKS (Placeholder)
// ============================================

export function useSubscription() {
  return {
    subscription: null as { tier: string; status: string } | null,
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
