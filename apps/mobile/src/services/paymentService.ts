/**
 * Payment Service
 * Payment processing, transactions, and wallet operations
 */

import { supabase } from '../config/supabase';
import { callRpc } from './supabaseRpc';
import { logger } from '../utils/logger';
import { transactionsService as dbTransactionsService } from './supabaseDbService';
import type { Database, Json } from '../types/database.types';
import {
  PaymentMetadataSchema,
  type PaymentMetadata as _PaymentMetadata,
} from '../schemas/payment.schema';
import { VALUES } from '../constants/values';

// Database-backed payment methods (stored in Supabase)

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

// RPC Response Types - for type-safe Supabase RPC calls
interface AtomicTransferResponse {
  senderTxnId: string;
  recipientTxnId: string;
}

interface CreateEscrowResponse {
  escrowId: string;
  transactionId?: string;
}

interface EscrowOperationResponse {
  success: boolean;
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

      // Fetch wallet balance from wallets table (not users table)
      const { data, error } = await supabase
        .from('wallets')
        .select('balance, currency, status')
        .eq('user_id', user.id)
        .single();

      if (error) {
        logger.error('Get balance error:', { error, userId: user.id });
        // If wallets table doesn't exist, return defaults instead of throwing
        if (error.code === 'PGRST205') {
          return { available: 0, pending: 0, currency: 'USD' };
        }
        throw new Error('Failed to fetch wallet balance');
      }

      // Calculate pending from escrow transactions
      const { data: pendingEscrow } = await supabase
        .from('escrow_transactions')
        .select('amount')
        .eq('recipient_id', user.id)
        .eq('status', 'pending');

      const pendingAmount =
        pendingEscrow?.reduce((sum, e) => sum + e.amount, 0) || 0;

      const walletData = data as { balance?: number; currency?: string } | null;
      return {
        available: walletData?.balance || 0,
        pending: pendingAmount,
        currency: walletData?.currency || 'USD',
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
      if (!data) throw new Error('Transaction not found');

      // Validate and parse metadata
      const validatedMetadata = data.metadata
        ? PaymentMetadataSchema.parse(data.metadata)
        : undefined;

      const transaction: Transaction = {
        id: data.id,
        type: (data.type as TransactionType) || 'payment',
        amount: data.amount,
        currency: data.currency ?? 'USD',
        status: (data.status as PaymentStatus) || 'completed',
        date: data.created_at ?? new Date().toISOString(),
        description: data.description ?? '',
        referenceId: data.moment_id ?? undefined,
        metadata: validatedMetadata,
      };

      return { transaction };
    } catch (error) {
      logger.error('Get transaction error:', error);
      throw error;
    }
  },

  // --- Payment Methods (Database-backed) ---

  /**
   * Get saved payment methods from database
   */
  getPaymentMethods: async (): Promise<{
    cards: PaymentCard[];
    bankAccounts: BankAccount[];
  }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch cards from payment_methods table
      const { data: paymentMethods, error } = await supabase
        .from('payment_methods')
        .select(
          'id, type, provider, last_four, brand, exp_month, exp_year, is_default, is_active, metadata',
        )
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        logger.error('Get payment methods error:', error);
        // If table doesn't exist, return empty array
        if (error.code === 'PGRST205') {
          return { cards: [], bankAccounts: [] };
        }
        throw error;
      }

      type PaymentMethodRow = {
        id: string;
        type: string;
        provider: string;
        last_four: string;
        brand: string;
        exp_month: number;
        exp_year: number;
        is_default: boolean;
        is_active: boolean;
        metadata: unknown;
      };

      const cards: PaymentCard[] = (
        (paymentMethods || []) as PaymentMethodRow[]
      )
        .filter((pm) => pm.type === 'card')
        .map((pm) => ({
          id: pm.id,
          brand: (pm.brand as PaymentCard['brand']) || 'visa',
          last4: pm.last_four || '****',
          expiryMonth: pm.exp_month || 12,
          expiryYear: pm.exp_year || 2030,
          isDefault: pm.is_default || false,
        }));

      // Fetch bank accounts
      const { data: bankData, error: bankError } = await supabase
        .from('bank_accounts')
        .select(
          'id, bank_name, account_type, last_four, is_default, is_verified',
        )
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (bankError) {
        logger.warn('Bank accounts table may not exist:', bankError);
      }

      type BankAccountRow = {
        id: string;
        bank_name: string;
        account_type: string;
        last_four: string;
        is_default: boolean;
        is_verified: boolean;
      };

      const bankAccounts: BankAccount[] = (
        (bankData || []) as BankAccountRow[]
      ).map((ba) => ({
        id: ba.id,
        bankName: ba.bank_name || 'Unknown Bank',
        accountType:
          (ba.account_type as BankAccount['accountType']) || 'checking',
        last4: ba.last_four || '****',
        isDefault: ba.is_default || false,
        isVerified: ba.is_verified || false,
      }));

      return { cards, bankAccounts };
    } catch (error) {
      logger.error('Get payment methods error:', error);
      return { cards: [], bankAccounts: [] };
    }
  },

  /**
   * Add a new card via Stripe token
   * Calls Supabase Edge Function for secure token handling
   */
  addCard: async (tokenId: string): Promise<{ card: PaymentCard }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call edge function to securely add card via Stripe
      const { data, error } = await supabase.functions.invoke(
        'add-payment-method',
        {
          body: { tokenId, type: 'card' },
        },
      );

      if (error) throw error;

      const card: PaymentCard = {
        id: data.id,
        brand: data.brand || 'visa',
        last4: data.last4 || '****',
        expiryMonth: data.exp_month || 12,
        expiryYear: data.exp_year || 2030,
        isDefault: data.is_default || false,
      };

      logger.info('Card added successfully', { cardId: card.id });
      return { card };
    } catch (error) {
      logger.error('Add card error:', error);
      throw error;
    }
  },

  /**
   * Remove a card
   */
  removeCard: async (cardId: string): Promise<{ success: boolean }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Soft delete - mark as inactive
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('id', cardId)
        .eq('user_id', user.id); // Ensure user owns this card

      if (error) throw error;

      logger.info('Card removed', { cardId });
      return { success: true };
    } catch (error) {
      logger.error('Remove card error:', error);
      throw error;
    }
  },

  /**
   * Add a bank account
   * Calls Supabase Edge Function for secure verification
   */
  addBankAccount: async (data: {
    routingNumber: string;
    accountNumber: string;
    accountType: 'checking' | 'savings';
  }): Promise<{ bankAccount: BankAccount }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call edge function to add bank account securely
      const { data: result, error } = await supabase.functions.invoke(
        'add-bank-account',
        {
          body: data,
        },
      );

      if (error) throw error;

      const bankAccount: BankAccount = {
        id: result.id,
        bankName: result.bank_name || 'Bank',
        accountType: result.account_type || 'checking',
        last4: result.last_four || '****',
        isDefault: result.is_default || false,
        isVerified: result.is_verified || false,
      };

      logger.info('Bank account added', { bankAccountId: bankAccount.id });
      return { bankAccount };
    } catch (error) {
      logger.error('Add bank account error:', error);
      throw error;
    }
  },

  /**
   * Remove a bank account
   */
  removeBankAccount: async (
    bankAccountId: string,
  ): Promise<{ success: boolean }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Soft delete
      const { error } = await supabase
        .from('bank_accounts')
        .update({ is_active: false })
        .eq('id', bankAccountId)
        .eq('user_id', user.id);

      if (error) throw error;

      logger.info('Bank account removed', { bankAccountId });
      return { success: true };
    } catch (error) {
      logger.error('Remove bank account error:', error);
      throw error;
    }
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
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, unset all cards as default
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('type', 'card');

      // Then set the selected card as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (error) throw error;

      logger.info('Default card set', { cardId });
      return { success: true };
    } catch (error) {
      logger.error('Set default card error:', error);
      throw error;
    }
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
        metadata: data.metadata as Json,
      });

      if (error) throw error;
      if (!transaction) throw new Error('Failed to create transaction');

      const validatedMetadata = transaction.metadata
        ? PaymentMetadataSchema.parse(transaction.metadata)
        : undefined;

      return {
        transaction: {
          id: transaction.id,
          type: 'payment' as TransactionType,
          amount: transaction.amount,
          currency: transaction.currency ?? 'USD',
          status: 'completed',
          date: transaction.created_at ?? new Date().toISOString(),
          description: transaction.description ?? '',
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

      // Validate amount
      if (data.amount <= 0) {
        throw new Error('Withdrawal amount must be greater than zero');
      }

      // Check balance before withdrawal
      const { available } = await paymentService.getBalance();
      if (available < data.amount) {
        logger.warn('[Payment] Insufficient funds for withdrawal', {
          userId: user.id,
          requested: data.amount,
          available,
        });
        throw new Error(
          `Insufficient balance. Available: ${available} ${data.currency}`,
        );
      }

      // Verify bank account belongs to user
      const { data: bankAccount, error: bankError } = await supabase
        .from('bank_accounts')
        .select('id, is_verified')
        .eq('id', data.bankAccountId)
        .eq('user_id', user.id)
        .single();

      if (bankError || !bankAccount) {
        throw new Error('Bank account not found or does not belong to you');
      }

      if (!(bankAccount as { is_verified?: boolean }).is_verified) {
        throw new Error('Bank account must be verified before withdrawal');
      }

      // Amount is stored as positive, type indicates direction
      const { data: transaction, error } = await dbTransactionsService.create({
        user_id: user.id,
        amount: data.amount, // Keep positive, type indicates withdrawal
        currency: data.currency,
        type: 'withdrawal',
        status: 'pending',
        description: 'Withdrawal to bank account',
      });

      if (error) throw error;
      if (!transaction)
        throw new Error('Failed to create withdrawal transaction');

      return {
        transaction: {
          id: transaction.id,
          type: 'withdrawal' as TransactionType,
          amount: transaction.amount,
          currency: transaction.currency ?? 'USD',
          status: 'pending',
          date: transaction.created_at ?? new Date().toISOString(),
          description: transaction.description ?? '',
        },
      };
    } catch (error) {
      logger.error('Withdraw funds error:', error);
      // Re-throw with user-friendly message if not already
      if (
        error instanceof Error &&
        (error.message.includes('Insufficient') ||
          error.message.includes('not found') ||
          error.message.includes('must be'))
      ) {
        throw error;
      }
      throw new Error('Withdrawal failed. Please try again.');
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
        case 'direct': {
          // < $30: Direct atomic transfer (no escrow)
          logger.info(`[Payment] Direct transfer: $${amount}`);
          const { data: directData, error: directError } =
            await callRpc<AtomicTransferResponse>('atomic_transfer', {
              p_sender_id: user.id,
              p_recipient_id: recipientId,
              p_amount: amount,
              p_moment_id: momentId,
              p_message: message,
            });

          if (directError) {
            logger.error('[Payment] Direct transfer failed', {
              directError,
              amount,
              recipientId,
            });
            throw new Error('Transfer failed. Please try again.');
          }

          if (!directData?.senderTxnId) {
            logger.error(
              '[Payment] Transfer completed but transaction ID missing',
              { amount, recipientId },
            );
            throw new Error(
              'Transfer completed but transaction ID missing. Please contact support.',
            );
          }

          return {
            success: true,
            transactionId: directData.senderTxnId,
          };
        }

        case 'optional': {
          // $30-$100: Ask user preference
          logger.info(`[Payment] Optional escrow range: $${amount}`);
          const useEscrow = escrowChoiceCallback
            ? await escrowChoiceCallback(amount)
            : true; // Default to safer option if no callback

          if (useEscrow) {
            // User chose escrow protection
            const { data: escrowData, error: escrowError } =
              await callRpc<CreateEscrowResponse>('create_escrow_transaction', {
                p_sender_id: user.id,
                p_recipient_id: recipientId,
                p_amount: amount,
                p_moment_id: momentId,
                p_release_condition: 'proof_verified',
              });

            if (escrowError) {
              logger.error('[Payment] Escrow creation failed', {
                escrowError,
                amount,
                recipientId,
              });
              throw new Error('Failed to create escrow. Please try again.');
            }

            if (!escrowData?.escrowId) {
              logger.error('[Payment] Escrow created but ID missing', {
                amount,
                recipientId,
              });
              throw new Error(
                'Escrow created but ID missing. Please contact support.',
              );
            }

            return {
              success: true,
              transactionId: escrowData.transactionId || escrowData.escrowId,
              escrowId: escrowData.escrowId,
            };
          } else {
            // User chose direct payment
            const { data: directData2, error: directError2 } =
              await callRpc<AtomicTransferResponse>('atomic_transfer', {
                p_sender_id: user.id,
                p_recipient_id: recipientId,
                p_amount: amount,
                p_moment_id: momentId,
                p_message: message,
              });

            if (directError2) {
              logger.error('[Payment] Direct transfer failed', {
                directError2,
                amount,
                recipientId,
              });
              throw new Error('Transfer failed. Please try again.');
            }

            if (!directData2?.senderTxnId) {
              logger.error(
                '[Payment] Transfer completed but transaction ID missing',
                { amount, recipientId },
              );
              throw new Error(
                'Transfer completed but transaction ID missing. Please contact support.',
              );
            }

            return {
              success: true,
              transactionId: directData2.senderTxnId,
            };
          }
        }

        case 'mandatory': {
          // >= $100: Force escrow (no choice)
          logger.info(`[Payment] Mandatory escrow: $${amount}`);
          const { data: mandatoryData, error: mandatoryError } =
            await callRpc<CreateEscrowResponse>('create_escrow_transaction', {
              p_sender_id: user.id,
              p_recipient_id: recipientId,
              p_amount: amount,
              p_moment_id: momentId,
              p_release_condition: 'proof_verified',
            });

          if (mandatoryError) {
            logger.error('[Payment] Mandatory escrow creation failed', {
              mandatoryError,
              amount,
              recipientId,
            });
            throw new Error('Failed to create escrow. Please try again.');
          }

          if (!mandatoryData?.escrowId) {
            logger.error('[Payment] Mandatory escrow created but ID missing', {
              amount,
              recipientId,
            });
            throw new Error(
              'Escrow created but ID missing. Please contact support.',
            );
          }

          return {
            success: true,
            transactionId:
              mandatoryData.transactionId || mandatoryData.escrowId,
            escrowId: mandatoryData.escrowId,
          };
        }

        default:
          throw new Error(`Unknown escrow mode: ${escrowMode}`);
      }
    } catch (error) {
      logger.error('Transfer funds error:', error);
      // Re-throw with user-friendly message if it's not already a user-friendly error
      if (error instanceof Error && error.message.includes('Please')) {
        throw error;
      }
      throw new Error('Transfer failed. Please try again later.');
    }
  },

  /**
   * Release escrow after proof verification
   * Called by moment owner after submitting proof
   */
  releaseEscrow: async (escrowId: string): Promise<{ success: boolean }> => {
    try {
      const { data, error } = await callRpc<EscrowOperationResponse>(
        'release_escrow',
        {
          p_escrow_id: escrowId,
        },
      );

      if (error) throw error;

      return { success: data?.success ?? false };
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
      const { data, error } = await callRpc<EscrowOperationResponse>(
        'refund_escrow',
        {
          p_escrow_id: escrowId,
          p_reason: reason,
        },
      );

      if (error) throw error;

      return { success: data?.success ?? false };
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
