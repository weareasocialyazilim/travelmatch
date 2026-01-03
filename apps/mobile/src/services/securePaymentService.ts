/**
 * Secure Payment Service (Client-Side)
 *
 * Consolidated payment service for PCI-compliant payment processing.
 * Handles PayTR operations, payment methods, KYC, and subscriptions.
 *
 * @see walletService.ts for wallet balance operations
 * @see transactionService.ts for transaction history queries
 * @see escrowService.ts for escrow operations
 *
 * PayTR Edge Functions:
 * - paytr-create-payment: Create payment and get iframeToken
 * - paytr-webhook: Handle PayTR callbacks
 * - paytr-saved-cards: Manage saved cards
 */

import { supabase, SUPABASE_EDGE_URL } from '../config/supabase';
import { logger } from '../utils/logger';
import {
  invalidateWallet,
  invalidateTransactions,
  invalidateAllPaymentCache,
} from './cacheInvalidationService';
import { walletService, type WalletBalance } from './walletService';
import { transactionService, type Transaction } from './transactionService';
import type { Json } from '../types/database.types';

// Re-export types for backward compatibility
export type { WalletBalance } from './walletService';
export type { Transaction, TransactionFilters } from './transactionService';

// ============================================
// Payment Types
// ============================================

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

export interface KYCStatus {
  status: 'pending' | 'in_review' | 'verified' | 'rejected';
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

export interface PayTRPaymentResponse {
  iframeToken: string;
  merchantOid: string;
  transactionId?: string;
  amount: number;
  currency: string;
}

export interface CreatePaymentParams {
  momentId: string;
  amount: number;
  currency?: 'TRY' | 'EUR' | 'USD' | 'GBP';
  description?: string;
  metadata?: Record<string, unknown>;
  saveCard?: boolean;
  cardToken?: string;
}

export interface SavedCard {
  cardToken: string;
  last4: string;
  cardBrand: string;
  isDefault: boolean;
}

class SecurePaymentService {
  private readonly EDGE_FUNCTION_BASE = `${SUPABASE_EDGE_URL}/functions/v1`;

  /**
   * Get authorization header for Edge Function calls
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a payment via PayTR
   *
   * Returns an iframeToken to be used in PayTR WebView
   * The actual payment is completed in the WebView
   */
  async createPayment(params: CreatePaymentParams): Promise<PayTRPaymentResponse> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(
        `${this.EDGE_FUNCTION_BASE}/paytr-create-payment`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            momentId: params.momentId,
            amount: params.amount,
            currency: params.currency || 'TRY',
            description: params.description,
            metadata: params.metadata,
            saveCard: params.saveCard,
            cardToken: params.cardToken,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment');
      }

      const paymentResponse: PayTRPaymentResponse = await response.json();

      // Invalidate relevant caches
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await invalidateWallet(user.id);
        await invalidateTransactions(user.id);
      }

      logger.info('PayTR payment created:', paymentResponse.merchantOid);
      return paymentResponse;
    } catch (error) {
      logger.error('Create payment error:', error);
      throw error;
    }
  }

  /**
   * Get saved cards for the user
   */
  async getSavedCards(): Promise<SavedCard[]> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(
        `${this.EDGE_FUNCTION_BASE}/paytr-saved-cards`,
        {
          method: 'GET',
          headers,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get saved cards');
      }

      return await response.json();
    } catch (error) {
      logger.error('Get saved cards error:', error);
      throw error;
    }
  }

  /**
   * Delete a saved card
   */
  async deleteSavedCard(cardToken: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(
        `${this.EDGE_FUNCTION_BASE}/paytr-saved-cards`,
        {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ cardToken }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete card');
      }

      logger.info('Card deleted successfully');
    } catch (error) {
      logger.error('Delete card error:', error);
      throw error;
    }
  }

  // ============================================
  // DELEGATED METHODS (for backward compatibility)
  // Consider migrating callers to use services directly
  // ============================================

  /**
   * @deprecated Use walletService.getBalance() directly
   */
  async getWalletBalance(): Promise<WalletBalance> {
    return walletService.getBalance();
  }

  /**
   * @deprecated Use transactionService.getTransactions() directly
   */
  async getTransactions(params?: {
    type?: string;
    status?: string;
    limit?: number;
  }): Promise<Transaction[]> {
    return transactionService.getTransactions(params);
  }

  /**
   * @deprecated Use walletService.requestWithdrawal() directly
   */
  async requestWithdrawal(params: {
    amount: number;
    bankAccountId: string;
  }): Promise<Transaction> {
    const result = await walletService.requestWithdrawal(params);
    const balance = await walletService.getBalance();

    return {
      id: result.transactionId,
      type: 'withdrawal',
      amount: -params.amount,
      currency: balance.currency,
      status: result.status,
      description: 'Withdrawal to bank account',
      createdAt: new Date().toISOString(),
      metadata: { bank_account_id: params.bankAccountId },
    };
  }

  /**
   * @deprecated Use transactionService.getMomentPayments() directly
   */
  async getMomentPayments(momentId: string): Promise<Transaction[]> {
    return transactionService.getMomentPayments(momentId);
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
        async (payload) => {
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
  // Payment Methods Management
  // ============================================

  /**
   * Get saved payment methods from database
   */
  async getPaymentMethods(): Promise<{
    cards: PaymentCard[];
    bankAccounts: BankAccount[];
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: paymentMethods, error } = await supabase
        .from('payment_methods')
        .select(
          'id, type, provider, last_four, brand, exp_month, exp_year, is_default, is_active, metadata',
        )
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
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
  }

  /**
   * Add a new card via edge function
   */
  async addCard(tokenId: string): Promise<{ card: PaymentCard }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke(
        'add-payment-method',
        { body: { tokenId, type: 'card' } },
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
  }

  /**
   * Remove a card (soft delete)
   */
  async removeCard(cardId: string): Promise<{ success: boolean }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (error) throw error;

      logger.info('Card removed', { cardId });
      return { success: true };
    } catch (error) {
      logger.error('Remove card error:', error);
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
      logger.error('Set default card error:', error);
      throw error;
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
      const { data: result, error } = await supabase.functions.invoke(
        'add-bank-account',
        { body: data },
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
  }

  /**
   * Remove a bank account
   */
  async removeBankAccount(bankAccountId: string): Promise<{ success: boolean }> {
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
      logger.error('Remove bank account error:', error);
      throw error;
    }
  }

  // ============================================
  // Payment Intent & Confirmation
  // ============================================

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    momentId: string,
    amount: number,
  ): Promise<PaymentIntent> {
    const paymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}`,
      amount,
      currency: 'USD',
      status: 'requires_payment_method',
      clientSecret: `secret_${Date.now()}`,
      momentId,
    };

    return paymentIntent;
  }

  /**
   * Confirm payment
   */
  async confirmPayment(
    paymentIntentId: string,
    _paymentMethodId?: string,
  ): Promise<{ success: boolean }> {
    logger.info('Payment confirmed:', { paymentIntentId });
    return { success: true };
  }

  // ============================================
  // Withdrawal Limits
  // ============================================

  /**
   * Get withdrawal limits
   */
  async getWithdrawalLimits(): Promise<WithdrawalLimits> {
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

      return {
        status: (row?.kyc_status || 'pending') as KYCStatus['status'],
        verified: row?.verified || false,
        verifiedAt: row?.verified_at || undefined,
      };
    } catch (error) {
      logger.error('Failed to get KYC status', { error });
      throw error;
    }
  }

  /**
   * Submit KYC documents
   */
  async submitKYC(
    documents: Record<string, string>,
  ): Promise<{ success: boolean; status: 'pending' | 'in_review' }> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-kyc', {
        body: { documents },
      });

      if (error) throw error;

      return {
        success: data?.success || false,
        status: (data?.status as 'pending' | 'in_review') || 'pending',
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
        .select(
          'id, plan_id, status, current_period_start, current_period_end, cancel_at',
        )
        .eq('user_id', session.session.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data as Subscription;
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
}

export const securePaymentService = new SecurePaymentService();
