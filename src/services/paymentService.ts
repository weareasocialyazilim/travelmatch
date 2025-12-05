/**
 * Payment Service
 * Payment processing, transactions, and wallet operations
 */

import { api } from '../utils/api';

// Types
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type PaymentMethod =
  | 'card'
  | 'bank_account'
  | 'apple_pay'
  | 'google_pay'
  | 'wallet';

export type TransactionType =
  | 'gift_sent'
  | 'gift_received'
  | 'withdrawal'
  | 'deposit'
  | 'refund'
  | 'fee';

export interface PaymentCard {
  id: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'discover';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  last4: string;
  isDefault: boolean;
  isVerified: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description: string;
  createdAt: string;
  completedAt?: string;

  // Related entities
  momentId?: string;
  momentTitle?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;

  // Payment details
  paymentMethod?: PaymentMethod;
  fee?: number;
  netAmount?: number;
}

export interface WalletBalance {
  available: number;
  pending: number;
  currency: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

// Payment Service
export const paymentService = {
  /**
   * Get wallet balance
   */
  getWalletBalance: async (): Promise<{ balance: WalletBalance }> => {
    return api.get('/wallet/balance');
  },

  /**
   * Get transaction history
   */
  getTransactions: async (params?: {
    type?: TransactionType;
    status?: PaymentStatus;
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ transactions: Transaction[]; total: number }> => {
    return api.get('/wallet/transactions', { params });
  },

  /**
   * Get single transaction
   */
  getTransaction: async (
    transactionId: string,
  ): Promise<{ transaction: Transaction }> => {
    return api.get(`/wallet/transactions/${transactionId}`);
  },

  // --- Payment Methods ---

  /**
   * Get saved payment methods
   */
  getPaymentMethods: async (): Promise<{
    cards: PaymentCard[];
    bankAccounts: BankAccount[];
  }> => {
    return api.get('/payment-methods');
  },

  /**
   * Add a new card
   */
  addCard: async (tokenId: string): Promise<{ card: PaymentCard }> => {
    return api.post('/payment-methods/cards', { tokenId });
  },

  /**
   * Remove a card
   */
  removeCard: async (cardId: string): Promise<{ success: boolean }> => {
    return api.delete(`/payment-methods/cards/${cardId}`);
  },

  /**
   * Set default card
   */
  setDefaultCard: async (cardId: string): Promise<{ success: boolean }> => {
    return api.post(`/payment-methods/cards/${cardId}/default`);
  },

  /**
   * Add bank account
   */
  addBankAccount: async (data: {
    accountNumber: string;
    routingNumber: string;
    accountHolderName: string;
    accountType: 'checking' | 'savings';
  }): Promise<{ bankAccount: BankAccount }> => {
    return api.post('/payment-methods/bank-accounts', data);
  },

  /**
   * Remove bank account
   */
  removeBankAccount: async (
    accountId: string,
  ): Promise<{ success: boolean }> => {
    return api.delete(`/payment-methods/bank-accounts/${accountId}`);
  },

  /**
   * Verify bank account with micro-deposits
   */
  verifyBankAccount: async (
    accountId: string,
    amounts: [number, number],
  ): Promise<{ success: boolean }> => {
    return api.post(`/payment-methods/bank-accounts/${accountId}/verify`, {
      amounts,
    });
  },

  // --- Payments ---

  /**
   * Create a payment intent for gifting
   */
  createPaymentIntent: async (data: {
    momentId: string;
    amount: number;
    currency?: string;
    paymentMethodId?: string;
  }): Promise<{ paymentIntent: PaymentIntent }> => {
    return api.post('/payments/create-intent', data);
  },

  /**
   * Confirm a payment
   */
  confirmPayment: async (
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<{ success: boolean; transaction: Transaction }> => {
    return api.post('/payments/confirm', { paymentIntentId, paymentMethodId });
  },

  /**
   * Cancel a payment
   */
  cancelPayment: async (
    paymentIntentId: string,
  ): Promise<{ success: boolean }> => {
    return api.post('/payments/cancel', { paymentIntentId });
  },

  // --- Withdrawals ---

  /**
   * Request withdrawal to bank account
   */
  requestWithdrawal: async (data: {
    amount: number;
    bankAccountId: string;
  }): Promise<{ transaction: Transaction }> => {
    return api.post('/wallet/withdraw', data);
  },

  /**
   * Get withdrawal limits
   */
  getWithdrawalLimits: async (): Promise<{
    minAmount: number;
    maxAmount: number;
    dailyLimit: number;
    remainingDaily: number;
  }> => {
    return api.get('/wallet/withdrawal-limits');
  },

  // --- Escrow ---

  /**
   * Get escrow status for a request
   */
  getEscrowStatus: async (
    requestId: string,
  ): Promise<{
    status: 'held' | 'released' | 'refunded';
    amount: number;
    heldAt: string;
    releasedAt?: string;
  }> => {
    return api.get(`/escrow/${requestId}`);
  },

  /**
   * Release escrow (admin/system only)
   */
  releaseEscrow: async (
    requestId: string,
  ): Promise<{ success: boolean; transaction: Transaction }> => {
    return api.post(`/escrow/${requestId}/release`);
  },

  /**
   * Request escrow refund
   */
  requestRefund: async (
    requestId: string,
    reason: string,
  ): Promise<{ success: boolean }> => {
    return api.post(`/escrow/${requestId}/refund-request`, { reason });
  },
};

// Helper functions
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const getTransactionTypeLabel = (type: TransactionType): string => {
  const labels: Record<TransactionType, string> = {
    gift_sent: 'Gift Sent',
    gift_received: 'Gift Received',
    withdrawal: 'Withdrawal',
    deposit: 'Deposit',
    refund: 'Refund',
    fee: 'Fee',
  };
  return labels[type];
};

export const getTransactionIcon = (type: TransactionType): string => {
  const icons: Record<TransactionType, string> = {
    gift_sent: 'gift-outline',
    gift_received: 'gift',
    withdrawal: 'arrow-up-circle-outline',
    deposit: 'arrow-down-circle-outline',
    refund: 'refresh-outline',
    fee: 'receipt-outline',
  };
  return icons[type];
};

export const isPositiveTransaction = (type: TransactionType): boolean => {
  return ['gift_received', 'deposit', 'refund'].includes(type);
};

export default paymentService;
