/**
 * usePayments Hook
 *
 * Manages wallet balance, transactions, bank accounts, and withdrawals.
 *
 * @module hooks/usePayments
 *
 * @example
 * ```tsx
 * const {
 *   balance,
 *   transactions,
 *   requestWithdrawal,
 * } = usePayments();
 *
 * // Request a withdrawal
 * const withdrawal = await requestWithdrawal(100, 'ba_123');
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { securePaymentService } from '../services/securePaymentService';
import { walletService } from '../services/walletService';
import {
  transactionService,
  type Transaction,
} from '../services/transactionService';
import { logger } from '../utils/logger';
import { ErrorHandler, retryWithErrorHandling } from '../utils/errorHandler';
import type {
  BankAccount,
  WalletBalance,
  TransactionType,
  PaymentStatus,
  WithdrawalLimits,
} from '../services/securePaymentService';

// Bank account data - defined below with JSDoc comments

/**
 * Return type for the usePayments hook
 */
interface UsePaymentsReturn {
  /** Current wallet balance information */
  balance: WalletBalance | null;
  /** Whether balance is currently loading */
  balanceLoading: boolean;
  /** Error message if balance loading failed */
  balanceError: string | null;
  /** Refresh the wallet balance */
  refreshBalance: () => Promise<void>;

  /** List of user's transactions */
  transactions: Transaction[];
  /** Whether transactions are loading */
  transactionsLoading: boolean;
  /** Error message if transaction loading failed */
  transactionsError: string | null;
  /** Load transactions with optional filters */
  loadTransactions: (filters?: TransactionFilters) => Promise<void>;
  /** Load next page of transactions */
  loadMoreTransactions: () => Promise<void>;
  /** Whether more transactions are available */
  hasMoreTransactions: boolean;

  /** List of saved bank accounts */
  bankAccounts: BankAccount[];
  /** Whether payment methods are loading */
  paymentMethodsLoading: boolean;
  /** Refresh all payment methods */
  refreshPaymentMethods: () => Promise<void>;
  /** Add a new bank account */
  addBankAccount: (data: BankAccountData) => Promise<BankAccount | null>;
  /** Remove a saved bank account */
  removeBankAccount: (accountId: string) => Promise<boolean>;

  /** Request a withdrawal to a bank account */
  requestWithdrawal: (
    amount: number,
    bankAccountId: string,
  ) => Promise<Transaction | null>;
  /** Current withdrawal limits */
  withdrawalLimits: WithdrawalLimits | null;
}

/**
 * Filters for transaction queries
 */
interface TransactionFilters {
  /** Filter by transaction type (gift_sent, gift_received, etc.) */
  type?: TransactionType;
  /** Filter by payment status */
  status?: PaymentStatus;
  /** Filter transactions after this date */
  startDate?: string;
  /** Filter transactions before this date */
  endDate?: string;
}

/**
 * Data required to add a bank account
 */
interface BankAccountData {
  /** Bank account number */
  accountNumber: string;
  /** Bank routing number */
  routingNumber: string;
  /** Name on the account */
  accountHolderName: string;
  /** Type of bank account */
  accountType: 'checking' | 'savings';
}

/** Number of transactions per page */
const PAGE_SIZE = 20;

/**
 * Hook for managing payments, wallet, and transactions
 *
 * @returns Payment operations and state
 */
export const usePayments = (): UsePaymentsReturn => {
  // Wallet state
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null,
  );
  const [transactionPage, setTransactionPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<TransactionFilters>({});

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);

  // Withdrawal limits
  const [withdrawalLimits, setWithdrawalLimits] =
    useState<WithdrawalLimits | null>(null);

  /**
   * Fetch wallet balance
   */
  const refreshBalance = useCallback(async () => {
    try {
      setBalanceLoading(true);
      setBalanceError(null);
      const response = await retryWithErrorHandling(
        () => walletService.getBalance(),
        { context: 'refreshBalance', maxRetries: 2 },
      );
      setBalance({
        available: response.available,
        coins: response.coins,
        pending: response.pending,
        currency: response.currency,
      });
    } catch (error) {
      const standardizedError = ErrorHandler.handle(error, 'refreshBalance');
      logger.error('Failed to fetch balance:', standardizedError);
      setBalanceError('Bakiye yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  /**
   * Fetch transactions
   */
  const loadTransactions = useCallback(async (filters?: TransactionFilters) => {
    try {
      setTransactionsLoading(true);
      setTransactionsError(null);
      setCurrentFilters(filters || {});
      setTransactionPage(1);

      const transactions = await retryWithErrorHandling(
        () =>
          transactionService.getTransactions({
            type: filters?.type,
            status: filters?.status,
            limit: PAGE_SIZE,
          }),
        { context: 'loadTransactions', maxRetries: 2 },
      );

      setTransactions(transactions as Transaction[]);
      setHasMoreTransactions(transactions.length === PAGE_SIZE);
    } catch (error) {
      const standardizedError = ErrorHandler.handle(error, 'loadTransactions');
      setTransactionsError(standardizedError.userMessage);
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  /**
   * Load more transactions
   */
  const loadMoreTransactions = useCallback(async () => {
    if (!hasMoreTransactions || transactionsLoading) return;

    try {
      const nextPage = transactionPage + 1;
      const newTransactions = await transactionService.getTransactions({
        type: currentFilters?.type,
        status: currentFilters?.status,
        limit: PAGE_SIZE,
      });

      setTransactions((prev) => [
        ...prev,
        ...(newTransactions as Transaction[]),
      ]);
      setTransactionPage(nextPage);
      setHasMoreTransactions(newTransactions.length === PAGE_SIZE);
    } catch (error) {
      logger.error('Failed to load more transactions:', error);
    }
  }, [
    transactionPage,
    hasMoreTransactions,
    transactionsLoading,
    currentFilters,
  ]);

  /**
   * Fetch bank accounts
   */
  const refreshPaymentMethods = useCallback(async (): Promise<void> => {
    try {
      setPaymentMethodsLoading(true);
      const response = await securePaymentService.getPaymentMethods();
      setBankAccounts(response.bankAccounts);
    } catch (error) {
      logger.error('Failed to fetch payment methods:', error);
    } finally {
      setPaymentMethodsLoading(false);
    }
  }, []);

  /**
   * Add bank account
   */
  const addBankAccount = useCallback(
    async (data: BankAccountData): Promise<BankAccount | null> => {
      try {
        const response = await securePaymentService.addBankAccount({
          routingNumber: data.routingNumber,
          accountNumber: data.accountNumber,
          accountType: data.accountType,
        });
        setBankAccounts((prev) => [...prev, response.bankAccount]);
        return response.bankAccount;
      } catch (error) {
        logger.error('Failed to add bank account:', error);
        return null;
      }
    },
    [],
  );

  /**
   * Remove bank account
   */
  const removeBankAccount = useCallback(
    async (accountId: string): Promise<boolean> => {
      try {
        await securePaymentService.removeBankAccount(accountId);
        setBankAccounts((prev) => prev.filter((a) => a.id !== accountId));
        return true;
      } catch (error) {
        logger.error('Failed to remove bank account:', error);
        return false;
      }
    },
    [],
  );

  /**
   * Request withdrawal
   */
  const requestWithdrawal = useCallback(
    async (
      amount: number,
      bankAccountId: string,
    ): Promise<Transaction | null> => {
      try {
        const result = await walletService.requestWithdrawal({
          amount,
          bankAccountId,
        });

        // Update balance (fire and forget with error logging)
        refreshBalance().catch((err) => {
          logger.warn('Failed to refresh balance after withdrawal', {
            error: err,
          });
        });

        // Create transaction record for UI
        const balance = await walletService.getBalance();
        const transaction: Transaction = {
          id: result.transactionId,
          type: 'withdrawal',
          amount: -amount,
          currency: balance.currency,
          status: result.status,
          description: 'Withdrawal to bank account',
          createdAt: new Date().toISOString(),
        };

        setTransactions((prev) => [transaction, ...prev]);
        return transaction;
      } catch (error) {
        logger.error('Failed to request withdrawal:', error);
        return null;
      }
    },
    [refreshBalance],
  );

  /**
   * Fetch withdrawal limits
   */
  const fetchWithdrawalLimits = useCallback(async () => {
    try {
      const response = await securePaymentService.getWithdrawalLimits();
      setWithdrawalLimits(response);
    } catch (error) {
      logger.error('Failed to fetch withdrawal limits:', error);
    }
  }, []);

  // Initial load
  // Note: Using stable callback references in the dependency array
  // These callbacks are memoized with useCallback and have stable identities
  useEffect(() => {
    refreshBalance();
    refreshPaymentMethods();
    loadTransactions();
    fetchWithdrawalLimits();
  }, [
    refreshBalance,
    refreshPaymentMethods,
    loadTransactions,
    fetchWithdrawalLimits,
  ]);

  return {
    // Wallet
    balance,
    balanceLoading,
    balanceError,
    refreshBalance,

    // Transactions
    transactions,
    transactionsLoading,
    transactionsError,
    loadTransactions,
    loadMoreTransactions,
    hasMoreTransactions,

    // Bank accounts
    bankAccounts,
    paymentMethodsLoading,
    refreshPaymentMethods,
    addBankAccount,
    removeBankAccount,

    // Withdrawals
    requestWithdrawal,
    withdrawalLimits,
  };
};

export default usePayments;
