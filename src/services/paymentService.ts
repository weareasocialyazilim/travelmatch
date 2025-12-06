/**
 * Payment Service
 * Payment processing, transactions, and wallet operations
 */

import { supabase } from '../config/supabase';
import { transactionsService as dbTransactionsService } from './supabaseDbService';
import { logger } from '../utils/logger';

// Mock storage for payment methods (simulated for store readiness)
let MOCK_CARDS: PaymentCard[] = [];
let MOCK_BANKS: BankAccount[] = [];

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
  date: string;
  description: string;
  referenceId?: string; // e.g., momentId or requestId
  metadata?: Record<string, any>;
}

// Payment Service
export const paymentService = {
  /**
   * Get wallet balance
   */
  getBalance: async (): Promise<{
    available: number;
    pending: number;
    currency: string;
  }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch user balance from users table
      const { data, error } = await supabase
        .from('users')
        .select('balance, currency')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return {
        available: data.balance || 0,
        pending: 0, // Logic for pending balance would go here
        currency: data.currency || 'USD',
      };
    } catch (error) {
      logger.error('Get balance error:', error);
      return { available: 0, pending: 0, currency: 'USD' };
    }
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
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Map UI types to DB types if necessary
      // DB types: 'deposit', 'withdrawal', 'payment', 'refund', 'gift'
      // UI types: 'gift_sent', 'gift_received', 'withdrawal', 'deposit', 'refund', 'fee'
      
      let dbType = undefined;
      if (params?.type === 'withdrawal') dbType = 'withdrawal';
      if (params?.type === 'deposit') dbType = 'deposit';
      if (params?.type === 'refund') dbType = 'refund';
      // 'gift_sent' and 'gift_received' map to 'gift' or 'payment' depending on direction
      // For simplicity, we'll just query by what we have or ignore type mapping for now if complex

      const { data, count, error } = await dbTransactionsService.list(user.id, {
        type: dbType,
        status: params?.status,
        limit: params?.pageSize,
        startDate: params?.startDate,
        endDate: params?.endDate,
      });

      if (error) throw error;

      const transactions: Transaction[] = data.map((row: any) => ({
        id: row.id,
        type: (row.type as TransactionType) || 'payment', // Simple cast
        amount: row.amount,
        currency: row.currency,
        status: (row.status as PaymentStatus) || 'completed',
        date: row.created_at,
        description: row.description || '',
        referenceId: row.moment_id,
        metadata: row.metadata,
      }));

      return { transactions, total: count };
    } catch (error) {
      logger.error('Get transactions error:', error);
      return { transactions: [], total: 0 };
    }
  },

  /**
   * Get single transaction
   */
  getTransaction: async (
    transactionId: string,
  ): Promise<{ transaction: Transaction }> => {
    try {
      const { data, error } = await dbTransactionsService.get(transactionId);
      if (error) throw error;

      const transaction: Transaction = {
        id: data!.id,
        type: (data!.type as TransactionType) || 'payment',
        amount: data!.amount,
        currency: data!.currency,
        status: (data!.status as PaymentStatus) || 'completed',
        date: data!.created_at,
        description: data!.description || '',
        referenceId: data!.moment_id,
        metadata: data!.metadata as any,
      };

      return { transaction };
    } catch (error) {
      logger.error('Get transaction error:', error);
      throw error;
    }
  },

  // --- Payment Methods ---

  /**
   * Get saved payment methods
   */
  getPaymentMethods: async (): Promise<{
    cards: PaymentCard[];
    bankAccounts: BankAccount[];
  }> => {
    // Simulated for store readiness (would be Stripe/Supabase in production)
    return { cards: MOCK_CARDS, bankAccounts: MOCK_BANKS };
  },

  /**
   * Add a new card
   */
  addCard: async (tokenId: string): Promise<{ card: PaymentCard }> => {
    // Simulated Stripe token exchange
    const newCard: PaymentCard = {
      id: `card_${Date.now()}`,
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2030,
      isDefault: MOCK_CARDS.length === 0,
    };
    MOCK_CARDS.push(newCard);
    return { card: newCard };
  },

  /**
   * Remove a card
   */
  removeCard: async (cardId: string): Promise<{ success: boolean }> => {
    MOCK_CARDS = MOCK_CARDS.filter(c => c.id !== cardId);
    return { success: true };
  },

  /**
   * Add a bank account
   */
  addBankAccount: async (data: any): Promise<{ bankAccount: BankAccount }> => {
    const newBank: BankAccount = {
      id: `bank_${Date.now()}`,
      bankName: 'Mock Bank',
      accountType: 'checking',
      last4: '1234',
      isDefault: MOCK_BANKS.length === 0,
      isVerified: true,
    };
    MOCK_BANKS.push(newBank);
    return { bankAccount: newBank };
  },

  /**
   * Remove a bank account
   */
  removeBankAccount: async (bankAccountId: string): Promise<{ success: boolean }> => {
    MOCK_BANKS = MOCK_BANKS.filter(b => b.id !== bankAccountId);
    return { success: true };
  },

  // --- Actions ---

  /**
   * Process a payment (e.g. for a gift)
   * Note: Currently records the transaction in the database.
   * Real payment gateway integration (Stripe/IAP) will be added in future updates.
   */
  processPayment: async (data: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    description?: string;
    metadata?: any;
  }): Promise<{ transaction: Transaction }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: transaction, error } = await dbTransactionsService.create({
        user_id: user.id,
        amount: data.amount,
        currency: data.currency,
        type: 'payment',
        status: 'completed',
        description: data.description,
        metadata: data.metadata,
      });

      if (error) throw error;

      return {
        transaction: {
          id: transaction!.id,
          type: 'payment' as TransactionType,
          amount: transaction!.amount,
          currency: transaction!.currency,
          status: 'completed',
          date: transaction!.created_at,
          description: transaction!.description || '',
          metadata: transaction!.metadata as any,
        },
      };
    } catch (error) {
      logger.error('Process payment error:', error);
      throw error;
    }
  },

  /**
   * Withdraw funds
   * Note: Currently records the withdrawal request in the database.
   */
  withdrawFunds: async (data: {
    amount: number;
    currency: string;
    bankAccountId: string;
  }): Promise<{ transaction: Transaction }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: transaction, error } = await dbTransactionsService.create({
        user_id: user.id,
        amount: -data.amount, // Negative for withdrawal? Or just track as withdrawal type
        currency: data.currency,
        type: 'withdrawal',
        status: 'pending',
        description: 'Withdrawal to bank account',
      });

      if (error) throw error;

      return {
        transaction: {
          id: transaction!.id,
          type: 'withdrawal' as TransactionType,
          amount: transaction!.amount,
          currency: transaction!.currency,
          status: 'pending',
          date: transaction!.created_at,
          description: transaction!.description || '',
        },
      };
    } catch (error) {
      logger.error('Withdraw funds error:', error);
      throw error;
    }
  },
};

export default paymentService;
