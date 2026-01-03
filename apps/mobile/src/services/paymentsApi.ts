/**
 * @deprecated This service is deprecated. Use paymentService instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { paymentsApi } from '@/services/paymentsApi';
 * const methods = await paymentsApi.getPaymentMethods();
 * ```
 *
 * AFTER:
 * ```tsx
 * import { paymentService } from '@/services/paymentService';
 * const { cards, bankAccounts } = await paymentService.getPaymentMethods();
 * ```
 *
 * This file now wraps paymentService for backward compatibility.
 * All new code should use paymentService directly.
 */

import { paymentService } from './paymentService';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════
// Types (preserved for backward compatibility)
// ═══════════════════════════════════════════════════════════════════

export interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  walletType?: 'apple_pay' | 'google_pay';
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  clientSecret: string;
}

export interface TransactionRecord {
  id: string;
  type: 'gift' | 'withdrawal' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

interface EdgeFunctionResponse<T> {
  data?: T;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════

async function callEdgeFunction<T>(
  functionName: string,
  payload?: Record<string, unknown>,
): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session?.access_token) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase.functions.invoke<
    EdgeFunctionResponse<T>
  >(functionName, {
    body: payload,
    headers: {
      Authorization: `Bearer ${sessionData.session.access_token}`,
    },
  });

  if (error) {
    logger.error(`Edge function ${functionName} error`, { error });
    throw new Error(error.message || `Failed to call ${functionName}`);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.data as T;
}

// ═══════════════════════════════════════════════════════════════════
// PaymentsApiService Class
// ═══════════════════════════════════════════════════════════════════

/**
 * @deprecated Use paymentService instead
 */
class PaymentsApiService {
  /** @deprecated Use paymentService.getPaymentMethods() */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const { cards } = await paymentService.getPaymentMethods();
      return cards.map((card) => ({
        id: card.id,
        type: 'card' as const,
        last4: card.last4,
        brand: card.brand,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        isDefault: card.isDefault,
      }));
    } catch (error) {
      logger.error('Failed to get payment methods', { error });
      throw error;
    }
  }

  /** @deprecated Use paymentService.addCard() */
  async addPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const { card } = await paymentService.addCard(paymentMethodId);
      return {
        id: card.id,
        type: 'card',
        last4: card.last4,
        brand: card.brand,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        isDefault: card.isDefault,
      };
    } catch (error) {
      logger.error('Failed to add payment method', { error });
      throw error;
    }
  }

  /** @deprecated Use paymentService.removeCard() */
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    await paymentService.removeCard(paymentMethodId);
  }

  /** @deprecated Use paymentService.setDefaultCard() */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    await paymentService.setDefaultCard(paymentMethodId);
  }

  /** @deprecated Use paymentService.getTransactions() */
  async getTransactionHistory(limit = 20, offset = 0): Promise<TransactionRecord[]> {
    try {
      const { transactions } = await paymentService.getTransactions({
        pageSize: limit,
        page: Math.floor(offset / limit) + 1,
      });

      return transactions.map((tx) => ({
        id: tx.id,
        type: tx.type as TransactionRecord['type'],
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status as TransactionRecord['status'],
        createdAt: tx.date,
        description: tx.description,
        metadata: tx.metadata,
      }));
    } catch (error) {
      logger.error('Failed to get transaction history', { error });
      throw error;
    }
  }

  /** @deprecated Use paymentService.createPaymentIntent() */
  async createPaymentIntent(
    amount: number,
    currency: string,
    momentId?: string,
  ): Promise<PaymentIntent> {
    try {
      const intent = await paymentService.createPaymentIntent(momentId || '', amount);
      return {
        id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status as PaymentIntent['status'],
        clientSecret: intent.clientSecret || '',
      };
    } catch (error) {
      logger.error('Failed to create payment intent', { error });
      throw error;
    }
  }

  /** @deprecated Use paymentService.getBalance() */
  async getWallet() {
    try {
      const balance = await paymentService.getBalance();
      return {
        balance: balance.available,
        currency: balance.currency,
        pendingBalance: balance.pending,
      };
    } catch (error) {
      logger.error('Failed to get wallet', { error });
      throw error;
    }
  }

  /** @deprecated Use paymentService.getTransactions() */
  async getTransactions(limit = 20, offset = 0) {
    return this.getTransactionHistory(limit, offset);
  }

  /** @deprecated Use paymentService.getTransaction() */
  async getTransactionById(transactionId: string): Promise<TransactionRecord | null> {
    try {
      const { transaction } = await paymentService.getTransaction(transactionId);
      return {
        id: transaction.id,
        type: transaction.type as TransactionRecord['type'],
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status as TransactionRecord['status'],
        createdAt: transaction.date,
        description: transaction.description,
        metadata: transaction.metadata,
      };
    } catch {
      return null;
    }
  }

  /** @deprecated Use paymentService.withdrawFunds() */
  async withdraw(amount: number, paymentMethodId: string) {
    try {
      const { transaction } = await paymentService.withdrawFunds({
        amount,
        currency: 'USD',
        bankAccountId: paymentMethodId,
      });
      return { success: true, transactionId: transaction.id };
    } catch (error) {
      logger.error('Failed to withdraw', { error, amount, paymentMethodId });
      throw error;
    }
  }

  /** Get KYC status (unique to this API) */
  async getKYCStatus() {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('users')
        .select('kyc_status, verified, verified_at')
        .eq('id', session.session.user.id)
        .single();

      if (error) throw error;

      const row = data as { kyc_status?: string | null; verified?: boolean | null; verified_at?: string | null } | null;
      return {
        status: (row?.kyc_status || 'pending') as 'pending' | 'in_review' | 'verified' | 'rejected',
        verified: row?.verified || false,
        verifiedAt: row?.verified_at,
      };
    } catch (error) {
      logger.error('Failed to get KYC status', { error });
      throw error;
    }
  }

  /** Submit KYC documents */
  async submitKYC(documents: Record<string, string>) {
    try {
      const result = await callEdgeFunction<{ success: boolean; status: string }>('verify-kyc', { documents });
      return { success: result.success, status: result.status as 'pending' | 'in_review' };
    } catch (error) {
      logger.error('Failed to submit KYC', { error });
      throw error;
    }
  }

  /** Get subscription */
  async getSubscription() {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('id, plan_id, status, current_period_start, current_period_end, cancel_at')
        .eq('user_id', session.session.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error) {
      logger.error('Failed to get subscription', { error });
      throw error;
    }
  }

  /** Create subscription */
  async createSubscription(planId: string, paymentMethodId: string) {
    try {
      const result = await callEdgeFunction<{ id: string; planId: string; status: string }>('create-subscription', { planId, paymentMethodId });
      return { id: result.id, planId: result.planId, status: result.status as 'active' };
    } catch (error) {
      logger.error('Failed to create subscription', { error });
      throw error;
    }
  }

  /** Cancel subscription */
  async cancelSubscription() {
    try {
      return await callEdgeFunction<{ success: boolean }>('cancel-subscription');
    } catch (error) {
      logger.error('Failed to cancel subscription', { error });
      throw error;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// Singleton Export (Backward Compatible)
// ═══════════════════════════════════════════════════════════════════

const instance = new PaymentsApiService();

/** @deprecated Use paymentService instead */
export const paymentsApi = {
  getPaymentMethods: instance.getPaymentMethods.bind(instance),
  addPaymentMethod: instance.addPaymentMethod.bind(instance),
  removePaymentMethod: instance.removePaymentMethod.bind(instance),
  setDefaultPaymentMethod: instance.setDefaultPaymentMethod.bind(instance),
  getTransactionHistory: instance.getTransactionHistory.bind(instance),
  createPaymentIntent: instance.createPaymentIntent.bind(instance),
  getWallet: instance.getWallet.bind(instance),
  getTransactions: instance.getTransactions.bind(instance),
  getTransactionById: instance.getTransactionById.bind(instance),
  withdraw: instance.withdraw.bind(instance),
  getKYCStatus: instance.getKYCStatus.bind(instance),
  submitKYC: instance.submitKYC.bind(instance),
  getSubscription: instance.getSubscription.bind(instance),
  createSubscription: instance.createSubscription.bind(instance),
  cancelSubscription: instance.cancelSubscription.bind(instance),
};

export interface CreatePaymentIntentDto {
  amount: number;
  currency: string;
  momentId?: string;
  paymentMethodId?: string;
  description?: string;
}

export default paymentsApi;
