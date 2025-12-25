/**
 * Payments API Service
 * Handles payment-related API calls via Supabase Edge Functions
 *
 * SECURITY: All payment operations are handled server-side via Edge Functions
 * Client never has access to Stripe secret keys or service_role credentials
 */

import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import { toRecord } from '../utils/jsonHelper';

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

/**
 * Helper function to call Edge Functions with authentication
 */
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

export const paymentsApi = {
  /**
   * Get user's payment methods from Stripe via Edge Function
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const methods = await callEdgeFunction<PaymentMethod[]>(
        'get-payment-methods',
      );
      return methods || [];
    } catch (error) {
      logger.error('Failed to get payment methods', { error });
      throw error;
    }
  },

  /**
   * Add a new payment method via Edge Function
   */
  async addPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const method = await callEdgeFunction<PaymentMethod>(
        'add-payment-method',
        {
          paymentMethodId,
        },
      );
      logger.info('Added payment method', { paymentMethodId });
      return method;
    } catch (error) {
      logger.error('Failed to add payment method', { error });
      throw error;
    }
  },

  /**
   * Remove a payment method via Edge Function
   */
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await callEdgeFunction<void>('remove-payment-method', {
        paymentMethodId,
      });
      logger.info('Removed payment method', { paymentMethodId });
    } catch (error) {
      logger.error('Failed to remove payment method', { error });
      throw error;
    }
  },

  /**
   * Set default payment method via Edge Function
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await callEdgeFunction<void>('set-default-payment-method', {
        paymentMethodId,
      });
      logger.info('Set default payment method', { paymentMethodId });
    } catch (error) {
      logger.error('Failed to set default payment method', { error });
      throw error;
    }
  },

  /**
   * Get transaction history from database
   * Uses explicit column selection - never select('*')
   */
  async getTransactionHistory(
    limit = 20,
    offset = 0,
  ): Promise<TransactionRecord[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('User not authenticated');
      }

      // SECURITY: Explicit column selection - never use select('*')
      const { data, error } = await supabase
        .from('transactions')
        .select(
          'id, type, amount, currency, status, created_at, description, metadata',
        )
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return (data || []).map((tx: any) => ({
        id: tx.id,
        type: tx.type as TransactionRecord['type'],
        amount: tx.amount,
        currency: tx.currency ?? '',
        status: tx.status as TransactionRecord['status'],
        createdAt: tx.created_at ?? '',
        description: tx.description ?? undefined,
        metadata: toRecord(tx.metadata),
      }));
    } catch (error) {
      logger.error('Failed to get transaction history', { error });
      throw error;
    }
  },

  /**
   * Create a payment intent via Edge Function
   * SECURITY: Stripe operations handled server-side
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    momentId?: string,
  ): Promise<PaymentIntent> {
    try {
      const intent = await callEdgeFunction<PaymentIntent>(
        'create-payment-intent',
        {
          amount,
          currency,
          momentId,
        },
      );
      logger.info('Created payment intent', {
        intentId: intent.id,
        amount,
        currency,
      });
      return intent;
    } catch (error) {
      logger.error('Failed to create payment intent', { error });
      throw error;
    }
  },

  /**
   * Get wallet balance from database
   */
  async getWallet() {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('User not authenticated');
      }

      // SECURITY: Explicit column selection - never use select('*')
      const { data, error } = await supabase
        .from('users')
        .select('balance, currency')
        .eq('id', session.session.user.id)
        .single();

      if (error) throw error;

      // Calculate pending balance from pending transactions
      const { data: pendingTx } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', session.session.user.id)
        .eq('status', 'pending');

      const pendingBalance = (pendingTx || []).reduce(
        (sum, tx) => sum + tx.amount,
        0,
      );

      return {
        balance: data?.balance || 0,
        currency: data?.currency || 'USD',
        pendingBalance,
      };
    } catch (error) {
      logger.error('Failed to get wallet', { error });
      throw error;
    }
  },

  /**
   * Get transactions (alias for getTransactionHistory)
   */
  async getTransactions(limit = 20, offset = 0) {
    return this.getTransactionHistory(limit, offset);
  },

  /**
   * Get transaction by ID
   */
  async getTransactionById(
    transactionId: string,
  ): Promise<TransactionRecord | null> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('User not authenticated');
      }

      // SECURITY: Explicit column selection - never use select('*')
      const { data, error } = await supabase
        .from('transactions')
        .select(
          'id, type, amount, currency, status, created_at, description, metadata',
        )
        .eq('id', transactionId)
        .eq('user_id', session.session.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return {
        id: data.id,
        type: data.type as TransactionRecord['type'],
        amount: data.amount,
        currency: data.currency ?? '',
        status: data.status as TransactionRecord['status'],
        createdAt: data.created_at ?? '',
        description: data.description ?? undefined,
        metadata: toRecord(data.metadata),
      };
    } catch (error) {
      logger.error('Failed to get transaction', { error, transactionId });
      throw error;
    }
  },

  /**
   * Withdraw funds via Edge Function
   * SECURITY: Withdrawal logic handled server-side with fraud checks
   */
  async withdraw(amount: number, paymentMethodId: string) {
    try {
      const result = await callEdgeFunction<{
        success: boolean;
        transactionId: string;
      }>('transfer-funds', {
        type: 'withdrawal',
        amount,
        paymentMethodId,
      });
      logger.info('Withdrawal initiated', {
        amount,
        transactionId: result.transactionId,
      });
      return result;
    } catch (error) {
      logger.error('Failed to withdraw', { error, amount, paymentMethodId });
      throw error;
    }
  },

  /**
   * Get KYC status from database
   */
  async getKYCStatus() {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('User not authenticated');
      }

      // SECURITY: Explicit column selection - never use select('*')
      const { data, error } = await supabase
        .from('users')
        .select('kyc_status, verified, verified_at')
        .eq('id', session.session.user.id)
        .single();

      if (error) throw error;

      const row: any = data;
      return {
        status: (row?.kyc_status || 'pending') as
          | 'pending'
          | 'in_review'
          | 'verified'
          | 'rejected',
        verified: row?.verified || false,
        verifiedAt: row?.verified_at,
      };
    } catch (error) {
      logger.error('Failed to get KYC status', { error });
      throw error;
    }
  },

  /**
   * Submit KYC documents via Edge Function
   * SECURITY: Documents processed server-side with third-party KYC provider
   */
  async submitKYC(documents: Record<string, string>) {
    try {
      const result = await callEdgeFunction<{
        success: boolean;
        status: string;
      }>('verify-kyc', { documents });
      logger.info('KYC submission initiated', { status: result.status });
      return {
        success: result.success,
        status: result.status as 'pending' | 'in_review',
      };
    } catch (error) {
      logger.error('Failed to submit KYC', { error });
      throw error;
    }
  },

  /**
   * Get subscription from database
   */
  async getSubscription() {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('User not authenticated');
      }

      // SECURITY: Explicit column selection - never use select('*')
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
        if (error.code === 'PGRST116') return null; // No active subscription
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to get subscription', { error });
      throw error;
    }
  },

  /**
   * Create subscription via Edge Function
   * SECURITY: Stripe subscription created server-side
   */
  async createSubscription(planId: string, paymentMethodId: string) {
    try {
      const result = await callEdgeFunction<{
        id: string;
        planId: string;
        status: string;
      }>('create-subscription', {
        planId,
        paymentMethodId,
      });
      logger.info('Subscription created', {
        subscriptionId: result.id,
        planId,
      });
      return {
        id: result.id,
        planId: result.planId,
        status: result.status as 'active',
      };
    } catch (error) {
      logger.error('Failed to create subscription', {
        error,
        planId,
        paymentMethodId,
      });
      throw error;
    }
  },

  /**
   * Cancel subscription via Edge Function
   */
  async cancelSubscription() {
    try {
      const result = await callEdgeFunction<{ success: boolean }>(
        'cancel-subscription',
      );
      logger.info('Subscription cancelled');
      return result;
    } catch (error) {
      logger.error('Failed to cancel subscription', { error });
      throw error;
    }
  },
};

// Export types
export interface CreatePaymentIntentDto {
  amount: number;
  currency: string;
  momentId?: string;
  paymentMethodId?: string;
  description?: string;
}

export default paymentsApi;
