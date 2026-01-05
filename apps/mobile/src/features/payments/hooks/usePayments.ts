/**
 * Payment Hooks
 *
 * React hooks for payment operations.
 * Wraps securePaymentService for component usage.
 */

import { useState, useCallback, useEffect } from 'react';
import { securePaymentService } from '@/services/securePaymentService';
import { walletService } from '@/services/walletService';
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
      setBalance(data.availableBalance);
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
// SAVED CARDS HOOKS
// ============================================

export interface UseSavedCardsReturn {
  cards: any[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  setDefaultCard: (cardId: string) => Promise<void>;
}

export function useSavedCards(): UseSavedCardsReturn {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await securePaymentService.getSavedCards();
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch cards'));
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCard = useCallback(
    async (cardId: string) => {
      await securePaymentService.deleteSavedCard(cardId);
      await refresh();
    },
    [refresh],
  );

  const setDefaultCard = useCallback(
    async (cardId: string) => {
      await securePaymentService.setDefaultCard(cardId);
      await refresh();
    },
    [refresh],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { cards, loading, error, refresh, deleteCard, setDefaultCard };
}

// ============================================
// PAYMENT INTENT HOOKS
// ============================================

export interface UseCreatePaymentIntentParams {
  amount: number;
  currency?: string;
  recipientId?: string;
  momentId?: string;
}

export interface UseCreatePaymentIntentReturn {
  createIntent: (
    params: UseCreatePaymentIntentParams,
  ) => Promise<{ iframeToken: string }>;
  loading: boolean;
  error: Error | null;
}

export function useCreatePaymentIntent(): UseCreatePaymentIntentReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createIntent = useCallback(
    async (params: UseCreatePaymentIntentParams) => {
      try {
        setLoading(true);
        setError(null);
        const result = await securePaymentService.createPayment({
          amount: params.amount,
          currency: params.currency || 'TRY',
          paymentMethod: 'card',
        });
        return { iframeToken: result.paymentToken || '' };
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Payment failed'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { createIntent, loading, error };
}

// ============================================
// WITHDRAW HOOKS
// ============================================

export interface UseWithdrawReturn {
  withdraw: (amount: number, iban: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export function useWithdraw(): UseWithdrawReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const withdraw = useCallback(async (amount: number, iban: string) => {
    try {
      setLoading(true);
      setError(null);
      await walletService.withdraw(amount, iban);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Withdrawal failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { withdraw, loading, error };
}

// ============================================
// KYC HOOKS
// ============================================

export interface UseKYCStatusReturn {
  status: 'pending' | 'verified' | 'rejected' | 'not_started';
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useKYCStatus(): UseKYCStatusReturn {
  const [status, setStatus] = useState<
    'pending' | 'verified' | 'rejected' | 'not_started'
  >('not_started');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      // KYC status would come from user profile
      setStatus('not_started');
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
      // Submit KYC documents
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
    subscription: null,
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
