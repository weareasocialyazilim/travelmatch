/**
 * useWallet Hook
 *
 * Manages wallet state and transactions
 */

import { useState, useCallback } from 'react';

interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'gift' | 'withdrawal';
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

interface WalletState {
  balance: number;
  currency: string;
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    balance: 0,
    currency: 'TRY',
    transactions: [],
    isLoading: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      // TODO: Implement actual API call to fetch wallet data
      // For now, return mock data
      setState((prev) => ({
        ...prev,
        balance: 1250.0,
        transactions: [],
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch wallet'),
      }));
    }
  }, []);

  return {
    balance: state.balance,
    currency: state.currency,
    transactions: state.transactions,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
  };
}

export default useWallet;
