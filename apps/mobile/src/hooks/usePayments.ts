/**
 * usePayments Hook
 *
 * Manages all payment-related operations including wallet balance,
 * transactions, payment methods (cards and bank accounts), and withdrawals.
 *
 * @module hooks/usePayments
 *
 * @example
 * ```tsx
 * const {
 *   balance,
 *   transactions,
 *   cards,
 *   addCard,
 *   requestWithdrawal,
 * } = usePayments();
 *
 * // Add a new card
 * const newCard = await addCard('tok_visa');
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
  PaymentCard,
  BankAccount,
  WalletBalance,
  TransactionType,
  PaymentStatus,
  PaymentIntent,
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

  /** List of saved payment cards */
  cards: PaymentCard[];
  /** List of saved bank accounts */
  bankAccounts: BankAccount[];
  /** Whether payment methods are loading */
  paymentMethodsLoading: boolean;
  /** Refresh all payment methods */
  refreshPaymentMethods: () => Promise<void>;
  /** Add a new card using Stripe token */
  addCard: (tokenId: string) => Promise<PaymentCard | null>;
  /** Remove a saved card */
  removeCard: (cardId: string) => Promise<boolean>;
  /** Set a card as the default payment method */
  setDefaultCard: (cardId: string) => Promise<boolean>;
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

  /** Create a payment intent for gifting a moment */
  createPaymentIntent: (
    momentId: string,
    amount: number,
  ) => Promise<PaymentIntent | null>;
  /** Confirm a payment using the intent */
  confirmPayment: (
    paymentIntentId: string,
    paymentMethodId?: string,
  ) => Promise<boolean>;
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

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null,
  );
  const [transactionPage, setTransactionPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<TransactionFilters>({});

  // Payment methods state
  const [cards, setCards] = useState<PaymentCard[]>([]);
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
      const response = await retryWithErrorHandling(
        () => walletService.getBalance(),
        { context: 'refreshBalance', maxRetries: 2 },
      );
      setBalance({
        available: response.available,
        pending: response.pending,
        currency: response.currency,
      });
    } catch (error) {
      const standardizedError = ErrorHandler.handle(error, 'refreshBalance');
      logger.error('Failed to fetch balance:', standardizedError);
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
   * Fetch payment methods
   */
  const refreshPaymentMethods = useCallback(async (): Promise<void> => {
    try {
      setPaymentMethodsLoading(true);
      const response = await securePaymentService.getPaymentMethods();
      setCards(response.cards);
      setBankAccounts(response.bankAccounts);
    } catch (error) {
      logger.error('Failed to fetch payment methods:', error);
    } finally {
      setPaymentMethodsLoading(false);
    }
  }, []);

  /**
   * Add a card
   */
  const addCard = useCallback(
    async (tokenId: string): Promise<PaymentCard | null> => {
      try {
        const response = await securePaymentService.addCard(tokenId);
        setCards((prev) => [...prev, response.card]);
        return response.card;
      } catch (error) {
        logger.error('Failed to add card:', error);
        return null;
      }
    },
    [],
  );

  /**
   * Remove a card
   */
  const removeCard = useCallback(async (cardId: string): Promise<boolean> => {
    try {
      await securePaymentService.removeCard(cardId);
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      return true;
    } catch (error) {
      logger.error('Failed to remove card:', error);
      return false;
    }
  }, []);

  /**
   * Set default card
   */
  const setDefaultCard = useCallback(
    async (cardId: string): Promise<boolean> => {
      try {
        await securePaymentService.setDefaultCard(cardId);
        setCards((prev) =>
          prev.map((c) => ({ ...c, isDefault: c.id === cardId })),
        );
        return true;
      } catch (error) {
        logger.error('Failed to set default card:', error);
        return false;
      }
    },
    [],
  );

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
   * Create payment intent
   */
  const createPaymentIntent = useCallback(
    async (momentId: string, amount: number): Promise<PaymentIntent | null> => {
      try {
        const paymentIntent = await securePaymentService.createPaymentIntent(
          momentId,
          amount,
        );
        return paymentIntent;
      } catch (error) {
        logger.error('Failed to create payment intent:', error);
        return null;
      }
    },
    [],
  );

  /**
   * Confirm payment
   */
  const confirmPayment = useCallback(
    async (
      paymentIntentId: string,
      paymentMethodId?: string,
    ): Promise<boolean> => {
      try {
        const response = await securePaymentService.confirmPayment(
          paymentIntentId,
          paymentMethodId,
        );

        if (response.success) {
          // Refresh balance after successful payment (fire and forget with error logging)
          refreshBalance().catch((err) => {
            logger.warn('Failed to refresh balance after payment', {
              error: err,
            });
          });
        }

        return response.success;
      } catch (error) {
        logger.error('Failed to confirm payment:', error);
        return false;
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
    refreshBalance,

    // Transactions
    transactions,
    transactionsLoading,
    transactionsError,
    loadTransactions,
    loadMoreTransactions,
    hasMoreTransactions,

    // Payment methods
    cards,
    bankAccounts,
    paymentMethodsLoading,
    refreshPaymentMethods,
    addCard,
    removeCard,
    setDefaultCard,
    addBankAccount,
    removeBankAccount,

    // Withdrawals
    requestWithdrawal,
    withdrawalLimits,

    // Payment intent
    createPaymentIntent,
    confirmPayment,
  };
};

export default usePayments;
