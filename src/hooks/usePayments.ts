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
import { paymentService } from '../services/paymentService';
import { logger } from '../utils/logger';
import type {
  PaymentCard,
  BankAccount,
  Transaction,
  WalletBalance,
  TransactionType,
  PaymentStatus,
} from '../services/paymentService';

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

/**
 * Withdrawal limits information
 */
interface WithdrawalLimits {
  /** Minimum withdrawal amount */
  minAmount: number;
  /** Maximum withdrawal amount */
  maxAmount: number;
  /** Daily withdrawal limit */
  dailyLimit: number;
  /** Remaining daily limit */
  remainingDaily: number;
}

/**
 * Payment intent for Stripe payments
 */
interface PaymentIntent {
  /** Stripe payment intent ID */
  id: string;
  /** Client secret for confirming the payment */
  clientSecret: string;
  /** Payment amount in cents */
  amount: number;
  /** Three-letter currency code */
  currency: string;
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
      const response = await paymentService.getWalletBalance();
      setBalance(response.balance);
    } catch (error) {
      logger.error('Failed to fetch balance:', error);
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

      const response = await paymentService.getTransactions({
        ...filters,
        page: 1,
        pageSize: PAGE_SIZE,
      });

      setTransactions(response.transactions);
      setHasMoreTransactions(response.transactions.length === PAGE_SIZE);
    } catch (error) {
      setTransactionsError(
        error instanceof Error ? error.message : 'Failed to load transactions',
      );
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
      const response = await paymentService.getTransactions({
        ...currentFilters,
        page: nextPage,
        pageSize: PAGE_SIZE,
      });

      setTransactions((prev) => [...prev, ...response.transactions]);
      setTransactionPage(nextPage);
      setHasMoreTransactions(response.transactions.length === PAGE_SIZE);
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
  const refreshPaymentMethods = useCallback(async () => {
    try {
      setPaymentMethodsLoading(true);
      const response = await paymentService.getPaymentMethods();
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
        const response = await paymentService.addCard(tokenId);
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
      await paymentService.removeCard(cardId);
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
        await paymentService.setDefaultCard(cardId);
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
        const response = await paymentService.addBankAccount(data);
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
        await paymentService.removeBankAccount(accountId);
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
        const response = await paymentService.requestWithdrawal({
          amount,
          bankAccountId,
        });

        // Update balance
        refreshBalance();

        // Add to transactions
        setTransactions((prev) => [response.transaction, ...prev]);

        return response.transaction;
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
        const response = await paymentService.createPaymentIntent({
          momentId,
          amount,
        });
        return response.paymentIntent;
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
        const response = await paymentService.confirmPayment(
          paymentIntentId,
          paymentMethodId,
        );

        if (response.success) {
          // Refresh balance and add transaction
          refreshBalance();
          setTransactions((prev) => [response.transaction, ...prev]);
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
      const response = await paymentService.getWithdrawalLimits();
      setWithdrawalLimits(response);
    } catch (error) {
      logger.error('Failed to fetch withdrawal limits:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshBalance();
    refreshPaymentMethods();
    loadTransactions();
    fetchWithdrawalLimits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
