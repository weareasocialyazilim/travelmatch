/**
 * Secure Payment Service (Client-Side)
 *
 * Master Payment Service for Lovendo - consolidates all payment operations.
 * Delegates to specialized services for single-responsibility:
 *
 * - PayTRProvider: REMOVED (Apple IAP compliance)
 * - walletService: Balance queries, withdrawals
 * - escrowService: Titan Protocol escrow logic
 * - transactionService: Transaction history
 *
 * @see walletService.ts for wallet balance operations
 * - PayTRProvider removed for payments (Apple IAP compliance)
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { callRpc } from './supabaseRpc';
import { transactionsService as dbTransactionsService } from './supabaseDbService';
import { invalidateAllPaymentCache } from './cacheInvalidationService';
import { walletService } from './walletService';
import { transactionService } from './transactionService';
import { ErrorHandler } from '../utils/errorHandler';
import type { Database, Json } from '../types/database.types';
import {
  PaymentMetadataSchema,
  type PaymentMetadata as _PaymentMetadata,
} from '../schemas/payment.schema';
import type {
  PaymentIntent,
  PaymentMethod,
  TransactionType,
} from '../schemas/payment.schema';
import { VALUES } from '../constants/values';

// Re-export types for backward compatibility
export type { WalletBalance } from './walletService';
export type { Transaction, TransactionFilters } from './transactionService';
export type { PaymentIntent, PaymentMethod, TransactionType };

// ============================================
// PAYMENT TYPES (Consolidated from paymentService.ts)
// ============================================

export type PaymentStatus = 'pending' | 'completed';

export interface Payment {
  amount: number;
  currency: string;
  status: PaymentStatus;
  date: string;
  description: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  last4: string;
  isDefault: boolean;
  isVerified: boolean;
}

export interface LegacyTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  date: string;
  description: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// ESCROW SYSTEM TYPES (Titan Protocol)
// ============================================

export type EscrowMode = 'direct' | 'optional' | 'mandatory';

export interface EscrowDecision {
  mode: EscrowMode;
  useEscrow: boolean;
  reason: string;
}

// 1 Coin = $0.10 (Example Value)
// Escrow Thresholds in COINS
// $30 -> 300 Coins
// $100 -> 1000 Coins

export interface WithdrawalLimits {
  minAmount: number; // in Coins
  maxAmount: number; // in Coins
  dailyLimit: number; // in Coins
  weeklyLimit: number; // in Coins
  monthlyLimit: number; // in Coins
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

// RPC Response Types
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

// ============================================
// ESCROW UTILITY FUNCTIONS
// ============================================

/**
 * Titan Protocol Escrow Matrix (COIN BASED):
 * - 0-300 Coins: Direct payment (no escrow)
 * - 300-1000 Coins: Optional escrow (user chooses)
 * - 1000+ Coins: Mandatory escrow (forced protection)
 */
export function determineEscrowMode(coinAmount: number): EscrowMode {
  // Thresholds from VALUES (LVND Coins)
  // 30 LVND = Direct Max
  // 100 LVND = Optional Max
  // 100+ = Mandatory

  if (coinAmount <= VALUES.ESCROW_THRESHOLDS.DIRECT_MAX) {
    return 'direct'; // <= 30 LVND
  } else if (coinAmount <= VALUES.ESCROW_THRESHOLDS.OPTIONAL_MAX) {
    return 'optional'; // 31-100 LVND
  } else {
    return 'mandatory'; // > 100 LVND
  }
}

/**
 * Get user-friendly escrow explanation
 */
export function getEscrowExplanation(
  mode: EscrowMode,
  coinAmount: number,
): string {
  const { DIRECT_MAX, OPTIONAL_MAX, CURRENCY } = VALUES.ESCROW_THRESHOLDS;

  switch (mode) {
    case 'direct':
      return `Transfer of ${coinAmount} ${CURRENCY} will be sent directly to the recipient.`;

    case 'optional':
      return `For amounts between ${DIRECT_MAX}-${OPTIONAL_MAX} ${CURRENCY}, you can choose escrow protection. Coins are held until proof is verified.`;

    case 'mandatory':
      return `Transfers over ${OPTIONAL_MAX} ${CURRENCY} must use escrow protection. Coins will be released when proof is verified.`;
  }
}

export interface KYCStatus {
  status: 'not_started' | 'pending' | 'in_review' | 'verified' | 'rejected';
  verified: boolean;
  verifiedAt?: string;
}

export interface Subscription {
  id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  cancel_at?: string;
}

// ============================================
// SECURE PAYMENT SERVICE CLASS
// ============================================

class SecurePaymentService {
  async transferLVND(params: {
    amount: number;
    recipientId: string;
    momentId?: string;
    useEscrow?: boolean;
  }) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Oturum açılmamış');

      // 1. Sanal bakiye kontrolü
      const { available } = await this.getBalance();
      if (available < params.amount) {
        throw new Error(
          'Yetersiz LVND bakiyesi. Lütfen mağazadan coin yükleyin.',
        );
      }

      // 2. Titan Protocol modunu belirle
      const { DIRECT_MAX, OPTIONAL_MAX } = VALUES.ESCROW_THRESHOLDS;

      let mode: 'direct' | 'escrow' = 'direct';
      if (params.amount >= OPTIONAL_MAX)
        mode = 'escrow'; // 100+ LVND Zorunlu
      else if (params.amount >= DIRECT_MAX && params.useEscrow) mode = 'escrow'; // 30-100 Opsiyonel

      // 3. Backend RPC çağrısı (LVND bazlı yeni fonksiyonlar)
      const rpcName =
        mode === 'escrow' ? 'create_lvnd_escrow' : 'direct_lvnd_transfer';

      const { data, error } = await callRpc<{ id: string }>(rpcName, {
        p_sender_id: user.id,
        p_recipient_id: params.recipientId,
        p_amount: params.amount,
        p_moment_id: params.momentId,
      });

      if (error) throw error;
      return { success: true, transactionId: data?.id || '' };
    } catch (error) {
      logger.error('[Titan Protocol] Transfer hatası:', error);
      throw error;
    }
  }

  /**
   * Titan Protocol: İhtilaf ve İade Yönetimi (Dispute/Refund)
   * User-facing refund request with reason tracking
   */
  async processRefundRequest(escrowId: string, reason: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Oturum açılmamış');

      const { data, error } = await callRpc('refund_escrow', {
        p_escrow_id: escrowId,
        p_reason: reason,
        p_unit: 'LVND', // Xcode 26 sanal ekonomi beyanıyla uyumlu
      });

      if (error) throw error;

      // Gönderene LVND Coin iadesi yapıldığında bildirim tetikle
      logger.info(`[Refund] Escrow ${escrowId} iade edildi. Sebep: ${reason}`);
      return {
        success: true,
        refundedAmount: (data as { amount?: number })?.amount,
      };
    } catch (error) {
      const standardized = ErrorHandler.handle(error, 'processRefundRequest');
      logger.error('[Titan Protocol] Refund request error:', standardized);
      throw standardized;
    }
  }

  /**
   * Refresh all payment-related data
   * Useful after webhook events or manual refresh
   */
  async refreshPaymentData(): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Invalidate all caches
      await invalidateAllPaymentCache(user.id);

      // Fetch fresh data using delegated services
      await Promise.all([
        walletService.getBalance(),
        transactionService.getTransactions({ limit: 20 }),
      ]);

      logger.info('Payment data refreshed');
    } catch (error) {
      logger.error('Refresh payment data error:', error);
      throw error;
    }
  }

  // ============================================
  // CONSOLIDATED PAYMENT METHODS (from paymentService.ts)
  // ============================================

  async getBalance(): Promise<{
    available: number;
    pending: number;
    currency: string;
    coins: number;
  }> {
    try {
      return await walletService.getBalance();
    } catch (error) {
      const standardized = ErrorHandler.handle(error, 'getBalance');
      logger.error('Get balance error:', standardized);
      return { available: 0, pending: 0, currency: 'LVND', coins: 0 };
    }
  }

  /**
   * Get transaction history (Legacy format)
   */
  async getLegacyTransactions(params?: {
    type?: TransactionType;
    status?: PaymentStatus;
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ transactions: LegacyTransaction[]; total: number }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { transactions: [], total: 0 };

      let dbType = undefined;
      if (params?.type === 'withdrawal') dbType = 'withdrawal';
      if (params?.type === 'deposit') dbType = 'deposit';
      if (params?.type === 'refund') dbType = 'refund';

      const { data, count, error } = await dbTransactionsService.list(user.id, {
        type: dbType,
        status: params?.status,
        limit: params?.pageSize,
        startDate: params?.startDate,
        endDate: params?.endDate,
      });

      if (error) throw error;

      const transactions: LegacyTransaction[] = data.map((row) => ({
        id: row.id,
        type: (row.type as TransactionType) || 'payment',
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
      const standardized = ErrorHandler.handle(error, 'getLegacyTransactions');
      logger.error('Get transactions error:', standardized);
      return { transactions: [], total: 0 };
    }
  }

  /**
   * Get single transaction (Legacy format)
   */
  async getLegacyTransaction(
    transactionId: string,
  ): Promise<{ transaction: LegacyTransaction }> {
    try {
      const { data, error } = await dbTransactionsService.get(transactionId);
      if (error) throw error;
      if (!data) throw new Error('Transaction not found');

      const validatedMetadata = data.metadata
        ? PaymentMetadataSchema.parse(data.metadata)
        : undefined;

      const transaction: LegacyTransaction = {
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
      const standardized = ErrorHandler.handle(error, 'getLegacyTransaction');
      logger.error('Get transaction error:', standardized);
      throw error;
    }
  }

  /**
   * Get bank accounts from database
   */
  async getPaymentMethods(): Promise<{
    bankAccounts: BankAccount[];
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { bankAccounts: [] };

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

      return { bankAccounts };
    } catch (error) {
      const standardized = ErrorHandler.handle(error, 'getPaymentMethods');
      logger.error('Get payment methods error:', standardized);
      return { bankAccounts: [] };
    }
  }

  /**
   * Add a bank account
   */
  async addBankAccount(data: {
    routingNumber: string;
    accountNumber: string;
    accountType: 'checking' | 'savings';
  }): Promise<{ bankAccount: BankAccount }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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
      const standardized = ErrorHandler.handle(error, 'addBankAccount');
      logger.error('Add bank account error:', standardized);
      throw error;
    }
  }

  /**
   * Remove a bank account
   */
  async removeBankAccount(
    bankAccountId: string,
  ): Promise<{ success: boolean }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('bank_accounts')
        .update({ is_active: false })
        .eq('id', bankAccountId)
        .eq('user_id', user.id);

      if (error) throw error;

      logger.info('Bank account removed', { bankAccountId });
      return { success: true };
    } catch (error) {
      const standardized = ErrorHandler.handle(error, 'removeBankAccount');
      logger.error('Remove bank account error:', standardized);
      throw error;
    }
  }

  /**
   * Set default card
   */
  async setDefaultCard(cardId: string): Promise<{ success: boolean }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('type', 'card');

      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (error) throw error;

      logger.info('Default card set', { cardId });
      return { success: true };
    } catch (error) {
      const standardized = ErrorHandler.handle(error, 'setDefaultCard');
      logger.error('Set default card error:', standardized);
      throw error;
    }
  }

  /**
   * Get withdrawal limits
   */
  async getWithdrawalLimits(): Promise<WithdrawalLimits> {
    try {
      return {
        minAmount: 50, // 50 Coins
        maxAmount: 50000, // 50k Coins
        dailyLimit: 10000,
        weeklyLimit: 50000,
        monthlyLimit: 200000,
      };
    } catch (error) {
      const standardized = ErrorHandler.handle(error, 'getWithdrawalLimits');
      logger.error('Get withdrawal limits error:', standardized);
      throw error;
    }
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    momentId: string,
    amount: number,
  ): Promise<PaymentIntent> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        amount,
        currency: 'LVND',
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      return paymentIntent;
    } catch (error) {
      const standardized = ErrorHandler.handle(error, 'createPaymentIntent');
      logger.error('Create payment intent error:', standardized);
      throw error;
    }
  }

  /**
   * Process a payment (e.g. for a gift)
   */
  async processPayment(data: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ transaction: LegacyTransaction }> {
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
      const standardized = ErrorHandler.handle(error, 'processPayment');
      logger.error('Process payment error:', standardized);
      throw error;
    }
  }

  // ============================================
  // WITHDRAWAL (Coins -> Fiat)
  // ============================================

  /**
   * Withdraw Coins (Convert to Fiat and Payout)
   *
   * Master Rule: Host MUST upload thank_you video before withdrawal
   */
  async withdrawFunds(data: {
    coinAmount: number;
    bankAccountId: string;
  }): Promise<{ settlementId: string; fiatAmount: number }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (data.coinAmount <= 0) {
        throw new Error('Withdrawal amount must be greater than zero');
      }

      // MASTER RULE: Check for pending thank you videos
      const { data: pendingThankYou, error: thankYouError } = await supabase
        .from('gifts')
        .select('id')
        .eq('recipient_id', user.id)
        .eq('thank_you_pending', true)
        .eq('status', 'completed')
        .limit(1);

      if (!thankYouError && pendingThankYou && pendingThankYou.length > 0) {
        throw new Error(
          'Para çekebilmeniz için önce bekleyen şükran videolarınızı yüklemeniz gerekiyor. Hediye gönderenlere teşekkür edin.',
        );
      }

      // Check Coin Balance locally first
      const { coins } = await walletService.getBalance(); // Assumes getBalance updated to return coins
      if ((coins || 0) < data.coinAmount) {
        throw new Error(`Yetersiz bakiye. Mevcut: ${coins} Coin`);
      }

      // Execute Coin Withdrawal via WalletService (which calls Edge Function)
      const result = await walletService.requestCoinWithdrawal({
        coinAmount: data.coinAmount,
        bankAccountId: data.bankAccountId,
      });

      return {
        settlementId: result.settlementId,
        fiatAmount: result.fiatAmount,
      };
    } catch (error) {
      const standardized = ErrorHandler.handle(error, 'withdrawFunds');
      logger.error('Withdraw funds error:', standardized);
      throw error;
    }
  }

  // ============================================
  // ESCROW SYSTEM METHODS (Titan Protocol)
  // ============================================

  /**
   * Transfer funds with Titan Protocol escrow rules
   * - < $30: Direct atomic transfer
   * - $30-$100: Optional escrow (user choice via callback)
   * - >= $100: Mandatory escrow
   */
  async transferFunds(params: {
    amount: number;
    recipientId: string;
    momentId?: string;
    message?: string;
    escrowChoiceCallback?: (amount: number) => Promise<boolean>;
  }): Promise<{
    success: boolean;
    transactionId: string;
    escrowId?: string;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { amount, recipientId, momentId, message, escrowChoiceCallback } =
        params;

      const escrowMode = determineEscrowMode(amount);

      switch (escrowMode) {
        case 'direct': {
          logger.info(`[Payment] Direct transfer: $${amount}`);
          const { data: directData, error: directError } =
            await callRpc<AtomicTransferResponse>('atomic_transfer', {
              p_sender_id: user.id,
              p_recipient_id: recipientId,
              p_amount: amount,
              p_moment_id: momentId,
              p_message: message,
            });

          if (directError || !directData?.senderTxnId) {
            throw new Error('Transfer failed. Please try again.');
          }

          return {
            success: true,
            transactionId: directData.senderTxnId,
          };
        }

        case 'optional': {
          logger.info(`[Payment] Optional escrow range: $${amount}`);
          const useEscrow = escrowChoiceCallback
            ? await escrowChoiceCallback(amount)
            : true;

          if (useEscrow) {
            const { data: escrowData, error: escrowError } =
              await callRpc<CreateEscrowResponse>('create_escrow_transaction', {
                p_sender_id: user.id,
                p_recipient_id: recipientId,
                p_amount: amount,
                p_moment_id: momentId,
                p_release_condition: 'proof_verified',
              });

            if (escrowError || !escrowData?.escrowId) {
              throw new Error('Failed to create escrow. Please try again.');
            }

            return {
              success: true,
              transactionId: escrowData.transactionId || escrowData.escrowId,
              escrowId: escrowData.escrowId,
            };
          } else {
            const { data: directData2, error: directError2 } =
              await callRpc<AtomicTransferResponse>('atomic_transfer', {
                p_sender_id: user.id,
                p_recipient_id: recipientId,
                p_amount: amount,
                p_moment_id: momentId,
                p_message: message,
              });

            if (directError2 || !directData2?.senderTxnId) {
              throw new Error('Transfer failed. Please try again.');
            }

            return {
              success: true,
              transactionId: directData2.senderTxnId,
            };
          }
        }

        case 'mandatory': {
          logger.info(`[Payment] Mandatory escrow: $${amount}`);
          const { data: mandatoryData, error: mandatoryError } =
            await callRpc<CreateEscrowResponse>('create_escrow_transaction', {
              p_sender_id: user.id,
              p_recipient_id: recipientId,
              p_amount: amount,
              p_moment_id: momentId,
              p_release_condition: 'proof_verified',
            });

          if (mandatoryError || !mandatoryData?.escrowId) {
            throw new Error('Failed to create escrow. Please try again.');
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
      const standardized = ErrorHandler.handle(error, 'transferFunds');
      logger.error('Transfer funds error:', standardized);
      if (error instanceof Error && error.message.includes('Please')) {
        throw error;
      }
      throw new Error('Transfer failed. Please try again later.');
    }
  }

  /**
   * Release escrow after proof verification
   */
  async releaseEscrow(escrowId: string): Promise<{ success: boolean }> {
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
      const standardized = ErrorHandler.handle(error, 'releaseEscrow');
      logger.error('Release escrow error:', standardized);
      throw error;
    }
  }

  /**
   * Request refund for pending escrow
   */
  async refundEscrow(
    escrowId: string,
    reason: string,
  ): Promise<{ success: boolean }> {
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
      const standardized = ErrorHandler.handle(error, 'refundEscrow');
      logger.error('Refund escrow error:', standardized);
      throw error;
    }
  }

  /**
   * Get user's pending escrow transactions
   */
  async getUserEscrowTransactions(): Promise<EscrowTransaction[]> {
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
      const standardized = ErrorHandler.handle(
        error,
        'getUserEscrowTransactions',
      );
      logger.error('Get escrow transactions error:', standardized);
      return [];
    }
  }

  /**
   * Subscribe to real-time payment updates
   */
  subscribeToPaymentUpdates(callback: (payload: unknown) => void): () => void {
    const channel = supabase
      .channel('payment-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
        },
        async (payload: any) => {
          logger.info('Payment update received:', payload);

          // Invalidate caches
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            await invalidateAllPaymentCache(user.id);
          }

          callback(payload);
        },
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }

  // ============================================
  // KYC Management
  // ============================================

  /**
   * Get KYC status
   */
  async getKYCStatus(): Promise<KYCStatus> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('users')
        .select('kyc_status, verified, verified_at')
        .eq('id', session.session.user.id)
        .single();

      if (error) throw error;

      const row = data as {
        kyc_status?: string | null;
        verified?: boolean | null;
        verified_at?: string | null;
      } | null;

      const rawStatus = (row?.kyc_status || 'not_started') as string;
      const statusMap: Record<string, KYCStatus['status']> = {
        not_started: 'not_started',
        unverified: 'not_started',
        none: 'not_started',
        pending: 'pending',
        reviewing: 'in_review',
        in_review: 'in_review',
        verified: 'verified',
        Verified: 'verified',
        rejected: 'rejected',
        denied: 'rejected',
        suspected: 'rejected',
      };
      const status = statusMap[rawStatus] || 'not_started';

      return {
        status,
        verified: status === 'verified' || row?.verified || false,
        verifiedAt: row?.verified_at || undefined,
      };
    } catch (error) {
      logger.error('Failed to get KYC status', { error });
      throw error;
    }
  }

  /**
   * Start KYC verification (iDenfy session)
   */
  async startKYCVerification(): Promise<{
    status: KYCStatus['status'];
    verificationUrl?: string;
    authToken?: string;
  }> {
    try {
      const { data, error } =
        await supabase.functions.invoke('get-idenfy-token');

      if (error) throw error;

      return {
        status: 'pending',
        verificationUrl: data?.verificationUrl,
        authToken: data?.authToken,
      };
    } catch (error) {
      logger.error('Failed to start KYC verification', { error });
      throw error;
    }
  }

  /**
   * Submit KYC documents (deprecated - handled by iDenfy SDK)
   */
  async submitKYC(
    documents: Record<string, string>,
  ): Promise<{ success: boolean; status: 'pending' | 'in_review' }> {
    try {
      logger.warn('submitKYC is deprecated and handled by iDenfy', {
        documents: Object.keys(documents || {}),
      });

      await this.startKYCVerification();

      return {
        success: true,
        status: 'pending',
      };
    } catch (error) {
      logger.error('Failed to submit KYC', { error });
      throw error;
    }
  }

  // ============================================
  // Subscription Management
  // ============================================

  /**
   * Get active subscription
   */
  async getSubscription(): Promise<Subscription | null> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('id, plan_id, status, current_period_start, current_period_end')
        .eq('user_id', session.session.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return {
        id: data.id,
        plan_id: data.plan_id,
        status: data.status,
        current_period_start: data.current_period_start,
        current_period_end: data.current_period_end,
      } as Subscription;
    } catch (error) {
      logger.error('Failed to get subscription', { error });
      throw error;
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(
    planId: string,
    paymentMethodId: string,
  ): Promise<{ id: string; planId: string; status: 'active' }> {
    try {
      const { data, error } = await supabase.functions.invoke(
        'create-subscription',
        { body: { planId, paymentMethodId } },
      );

      if (error) throw error;

      return {
        id: data.id,
        planId: data.planId,
        status: 'active',
      };
    } catch (error) {
      logger.error('Failed to create subscription', { error });
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<{ success: boolean }> {
    try {
      const { data, error } = await supabase.functions.invoke(
        'cancel-subscription',
      );

      if (error) throw error;

      return { success: data?.success || false };
    } catch (error) {
      logger.error('Failed to cancel subscription', { error });
      throw error;
    }
  }

  // ============================================
  // LEGACY ALIASES (for test backward compatibility)
  // ============================================

  /**
   * getWalletBalance - ALIAS FOR getBalance
   * Tests expect this name
   */
  async getWalletBalance() {
    return this.getBalance();
  }

  /**
   * getTransactions - Map LegacyTransactions to new name
   * Tests expect this name
   */
  async getTransactions(params?: {
    type?: TransactionType;
    status?: PaymentStatus;
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
  }) {
    return this.getLegacyTransactions(params);
  }

  /**
   * getTransaction - Map LegacyTransaction to new name
   */
  async getTransaction(transactionId: string) {
    return this.getLegacyTransaction(transactionId);
  }

  /**
   * requestWithdrawal - Map withdrawFunds to legacy test interface
   * Tests call this with (amount, bankAccountId)
   */
  async requestWithdrawal(amount: number, bankAccountId: string) {
    return this.withdrawFunds({
      coinAmount: amount, // Assumes input is now Coins
      bankAccountId,
    });
  }
}

export const securePaymentService = new SecurePaymentService();
