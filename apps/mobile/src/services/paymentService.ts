/**
 * Payment Service
 * Payment processing, transactions, and wallet operations
 */

import { supabase } from '../config/supabase';
import { callRpc } from './supabaseRpc';
import { logger } from '../utils/logger';
import { transactionsService as dbTransactionsService } from './supabaseDbService';
import type { Database } from '../types/database.types';
import {
  PaymentMetadataSchema,
  type PaymentMetadata as _PaymentMetadata,
} from '../schemas/payment.schema';
import { VALUES } from '../constants/values';

// Mock storage for payment methods (simulated for store readiness)
// WARNING: Only used in development. Production should use real payment gateway.
let MOCK_CARDS: PaymentCard[] = [];
let MOCK_BANKS: BankAccount[] = [];

if (!__DEV__) {
  logger.warn('Mock payment methods should not be used in production!');
}

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

export interface WalletBalance {
  available: number;
  pending: number;
  currency: string;
}

export interface PaymentIntent {
  id: string;
  paymentIntentId?: string;
  amount: number;
  currency: string;
  status:
    | PaymentStatus
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'succeeded'
    | 'cancelled';
  clientSecret?: string;
  momentId?: string;
}

// ============================================
// BLOCKER #3: Escrow System Types & Logic
// ============================================

export type EscrowMode = 'direct' | 'optional' | 'mandatory';

export interface EscrowDecision {
  mode: EscrowMode;
  useEscrow: boolean;
  reason: string;
}

export interface WithdrawalLimits {
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  remainingDaily: number;
  remainingWeekly: number;
  remainingMonthly: number;
}

export interface EscrowTransaction {
  id: string;
  sender_id: string;
  recipient_id: string;
  amount: number;
  status: 'pending' | 'released' | 'refunded';
  release_condition: string;
  created_at: string;
  expires_at: string;
  moment_id?: string;
}

/**
 * Titan Plan v2.0 Escrow Matrix:
 * - $0-$30: Direct payment (no escrow)
 * - $30-$100: Optional escrow (user chooses)
 * - $100+: Mandatory escrow (forced protection)
 */
export function determineEscrowMode(amount: number): EscrowMode {
  if (amount < VALUES.ESCROW_DIRECT_MAX) {
    return 'direct'; // < $30: Direct pay
  } else if (amount < VALUES.ESCROW_OPTIONAL_MAX) {
    return 'optional'; // $30-$100: User chooses
  } else {
    return 'mandatory'; // >= $100: Must escrow
  }
}

/**
 * Get user-friendly escrow explanation
 */
export function getEscrowExplanation(mode: EscrowMode, amount: number): string {
  switch (mode) {
    case 'direct':
      return `Payment of $${amount} will be sent directly to the recipient immediately.`;

    case 'optional':
      return `For payments between $${VALUES.ESCROW_DIRECT_MAX}-$${VALUES.ESCROW_OPTIONAL_MAX}, you can choose escrow protection. Funds are held until proof is verified.`;

    case 'mandatory':
      return `Payments over $${VALUES.ESCROW_OPTIONAL_MAX} must use escrow protection for your safety. Funds will be released when proof is verified.`;
  }
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

      const transactions: Transaction[] = data.map((row) => ({
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

      // Validate and parse metadata
      const validatedMetadata = data.metadata
        ? PaymentMetadataSchema.parse(data.metadata)
        : undefined;

      const transaction: Transaction = {
        id: data.id,
        type: (data.type as TransactionType) || 'payment',
        amount: data.amount,
        currency: data.currency,
        status: (data.status as PaymentStatus) || 'completed',
        date: data.created_at,
        description: data.description || '',
        referenceId: data.moment_id,
        metadata: validatedMetadata,
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
  getPaymentMethods: (): {
    cards: PaymentCard[];
    bankAccounts: BankAccount[];
  } => {
    // Simulated for store readiness (would be Stripe/Supabase in production)
    if (!__DEV__) {
      logger.warn('Using mock payment methods in production!');
      return { cards: [], bankAccounts: [] };
    }
    return { cards: MOCK_CARDS, bankAccounts: MOCK_BANKS };
  },

  /**
   * Add a new card
   */
  addCard: (_tokenId: string): { card: PaymentCard } => {
    if (!__DEV__) {
      logger.error('addCard called in production with mock implementation!');
      throw new Error('Payment methods not configured for production');
    }
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
  removeCard: (cardId: string): { success: boolean } => {
    if (!__DEV__) {
      logger.error('removeCard called in production with mock implementation!');
      throw new Error('Payment methods not configured for production');
    }
    MOCK_CARDS = MOCK_CARDS.filter((c) => c.id !== cardId);
    return { success: true };
  },

  /**
   * Add a bank account
   */
  addBankAccount: (
    _data: Record<string, unknown>,
  ): { bankAccount: BankAccount } => {
    if (!__DEV__) {
      logger.error(
        'addBankAccount called in production with mock implementation!',
      );
      throw new Error('Payment methods not configured for production');
    }
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
  removeBankAccount: (bankAccountId: string): { success: boolean } => {
    if (!__DEV__) {
      logger.error(
        'removeBankAccount called in production with mock implementation!',
      );
      throw new Error('Payment methods not configured for production');
    }
    MOCK_BANKS = MOCK_BANKS.filter((b) => b.id !== bankAccountId);
    return { success: true };
  },

  /**
   * Alias for getBalance (for compatibility)
   */
  getWalletBalance: async (): Promise<{
    available: number;
    pending: number;
    currency: string;
  }> => {
    return paymentService.getBalance();
  },

  /**
   * Set default card
   */
  setDefaultCard: async (cardId: string): Promise<{ success: boolean }> => {
    if (!__DEV__) {
      logger.error(
        'setDefaultCard called in production with mock implementation!',
      );
      throw new Error('Payment methods not configured for production');
    }
    MOCK_CARDS = MOCK_CARDS.map((c) => ({ ...c, isDefault: c.id === cardId }));
    return { success: true };
  },

  /**
   * Request withdrawal
   */
  requestWithdrawal: async (
    amount: number,
    bankAccountId: string,
  ): Promise<{ transaction: Transaction }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // In production, this would call a payment gateway
      const transaction: Transaction = {
        id: `txn_${Date.now()}`,
        type: 'withdrawal',
        amount: -amount,
        status: 'pending',
        description: `Withdrawal to bank account ${bankAccountId.slice(-4)}`,
        date: new Date().toISOString(),
        currency: 'USD',
      };

      logger.info('Withdrawal requested:', { amount, bankAccountId });
      return { transaction };
    } catch (error) {
      logger.error('Request withdrawal error:', error);
      throw error;
    }
  },

  /**
   * Create payment intent
   */
  createPaymentIntent: async (
    momentId: string,
    amount: number,
  ): Promise<PaymentIntent> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // In production, this would create a Stripe PaymentIntent
      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        amount,
        currency: 'USD',
        status: 'requires_payment_method',
        clientSecret: `secret_${Date.now()}`,
        momentId,
      };

      return paymentIntent;
    } catch (error) {
      logger.error('Create payment intent error:', error);
      throw error;
    }
  },

  /**
   * Confirm payment
   */
  confirmPayment: async (
    paymentIntentId: string,
    _paymentMethodId?: string,
  ): Promise<{ success: boolean }> => {
    try {
      logger.info('Payment confirmed:', { paymentIntentId });
      return { success: true };
    } catch (error) {
      logger.error('Confirm payment error:', error);
      throw error;
    }
  },

  /**
   * Get withdrawal limits
   */
  getWithdrawalLimits: async (): Promise<WithdrawalLimits> => {
    try {
      // In production, this would fetch from backend based on user verification level
      return {
        minAmount: 10,
        maxAmount: 10000,
        dailyLimit: 5000,
        weeklyLimit: 20000,
        monthlyLimit: 50000,
        remainingDaily: 5000,
        remainingWeekly: 20000,
        remainingMonthly: 50000,
      };
    } catch (error) {
      logger.error('Get withdrawal limits error:', error);
      throw error;
    }
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
    metadata?: Record<string, unknown>;
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

      const validatedMetadata = transaction.metadata
        ? PaymentMetadataSchema.parse(transaction.metadata)
        : undefined;

      return {
        transaction: {
          id: transaction.id,
          type: 'payment' as TransactionType,
          amount: transaction.amount,
          currency: transaction.currency,
          status: 'completed',
          date: transaction.created_at,
          description: transaction.description || '',
          metadata: validatedMetadata,
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
          id: transaction.id,
          type: 'withdrawal' as TransactionType,
          amount: transaction.amount,
          currency: transaction.currency,
          status: 'pending',
          date: transaction.created_at,
          description: transaction.description || '',
        },
      };
    } catch (error) {
      logger.error('Withdraw funds error:', error);
      throw error;
    }
  },

  // ============================================
  // BLOCKER #3: Escrow System Methods
  // ============================================

  /**
   * Transfer funds with Titan Plan escrow rules
   * - < $30: Direct atomic transfer
   * - $30-$100: Optional escrow (user choice via callback)
   * - >= $100: Mandatory escrow
   */
  transferFunds: async (params: {
    amount: number;
    recipientId: string;
    momentId?: string;
    message?: string;
    escrowChoiceCallback?: (amount: number) => Promise<boolean>;
  }): Promise<{
    success: boolean;
    transactionId: string;
    escrowId?: string;
  }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { amount, recipientId, momentId, message, escrowChoiceCallback } =
        params;

      // Determine escrow mode based on amount
      const escrowMode = determineEscrowMode(amount);

      switch (escrowMode) {
        case 'direct':
          // < $30: Direct atomic transfer (no escrow)
          logger.info(`[Payment] Direct transfer: $${amount}`);
          const { data: directData, error: directError } = await callRpc<any>(
            'atomic_transfer',
            {
              p_sender_id: user.id,
              p_recipient_id: recipientId,
              p_amount: amount,
              p_moment_id: momentId,
              p_message: message,
            },
          );

          if (directError) throw directError;

          return {
            success: true,
            transactionId: directData?.senderTxnId,
          };

        case 'optional':
          // $30-$100: Ask user preference
          logger.info(`[Payment] Optional escrow range: $${amount}`);
          const useEscrow = escrowChoiceCallback
            ? await escrowChoiceCallback(amount)
            : true; // Default to safer option if no callback

          if (useEscrow) {
            // User chose escrow protection
            const { data: escrowData, error: escrowError } = await callRpc<any>(
              'create_escrow_transaction',
              {
                p_sender_id: user.id,
                p_recipient_id: recipientId,
                p_amount: amount,
                p_moment_id: momentId,
                p_release_condition: 'proof_verified',
              },
            );

            if (escrowError) throw escrowError;

            return {
              success: true,
              transactionId: escrowData?.transaction_id,
              escrowId: escrowData?.escrow_id,
            };
          } else {
            // User chose direct payment
            const { data: directData2, error: directError2 } =
              await callRpc<any>('atomic_transfer', {
                p_sender_id: user.id,
                p_recipient_id: recipientId,
                p_amount: amount,
                p_moment_id: momentId,
                p_message: message,
              });

            if (directError2) throw directError2;

            return {
              success: true,
              transactionId: directData2?.senderTxnId,
            };
          }

        case 'mandatory':
          // >= $100: Force escrow (no choice)
          logger.info(`[Payment] Mandatory escrow: $${amount}`);
          const { data: mandatoryData, error: mandatoryError } =
            await callRpc<any>('create_escrow_transaction', {
              p_sender_id: user.id,
              p_recipient_id: recipientId,
              p_amount: amount,
              p_moment_id: momentId,
              p_release_condition: 'proof_verified',
            });

          if (mandatoryError) throw mandatoryError;

          return {
            success: true,
            transactionId: mandatoryData?.transaction_id,
            escrowId: mandatoryData?.escrow_id,
          };

        default:
          throw new Error(`Unknown escrow mode: ${escrowMode}`);
      }
    } catch (error) {
      logger.error('Transfer funds error:', error);
      throw error;
    }
  },

  /**
   * Release escrow after proof verification
   * Called by moment owner after submitting proof
   */
  releaseEscrow: async (escrowId: string): Promise<{ success: boolean }> => {
    try {
      const { data, error } = await callRpc<any>('release_escrow', {
        p_escrow_id: escrowId,
      });

      if (error) throw error;

      return { success: data?.success };
    } catch (error) {
      logger.error('Release escrow error:', error);
      throw error;
    }
  },

  /**
   * Request refund for pending escrow
   * Can be called by sender if proof not submitted within time limit
   */
  refundEscrow: async (
    escrowId: string,
    reason: string,
  ): Promise<{ success: boolean }> => {
    try {
      const { data, error } = await callRpc<any>('refund_escrow', {
        p_escrow_id: escrowId,
        p_reason: reason,
      });

      if (error) throw error;

      return { success: data?.success };
    } catch (error) {
      logger.error('Refund escrow error:', error);
      throw error;
    }
  },

  /**
   * Get user's pending escrow transactions
   */
  getUserEscrowTransactions: async (): Promise<EscrowTransaction[]> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('escrow_transactions')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = data as unknown as
        | Database['public']['Tables']['escrow_transactions']['Row'][]
        | null;

      return (rows || []).map((r) => ({
        id: r.id,
        sender_id: r.sender_id,
        recipient_id: r.recipient_id,
        amount: r.amount,
        status: r.status as EscrowTransaction['status'],
        release_condition: r.release_condition,
        created_at: r.created_at,
        expires_at: r.expires_at,
        moment_id: r.moment_id || undefined,
      }));
    } catch (error) {
      logger.error('Get escrow transactions error:', error);
      return [];
    }
  },
};

export default paymentService;
