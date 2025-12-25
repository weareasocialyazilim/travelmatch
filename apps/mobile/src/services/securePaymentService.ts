/**
 * Secure Payment Service (Client-Side)
 *
 * Communicates with server-side Edge Functions for PCI-compliant payment processing
 * Never exposes Stripe secret keys on the client
 *
 * Features:
 * - Server-side Stripe API calls
 * - Automatic cache invalidation
 * - Error handling and retry logic
 * - Type-safe payment operations
 */

import { supabase, SUPABASE_EDGE_URL } from '../config/supabase';
import { logger } from '../utils/logger';
import {
  getCachedWallet,
  setCachedWallet,
  invalidateWallet,
  getCachedTransactions,
  setCachedTransactions,
  invalidateTransactions,
  invalidateAllPaymentCache,
} from './cacheInvalidationService';
import { toRecord } from '../utils/jsonHelper';
import type { Database } from '../types/database.types';

// Types
export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  transactionId?: string;
  amount: number;
  currency: string;
}

export interface WalletBalance {
  available: number;
  pending: number;
  currency: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency?: string | null;
  status: string | null;
  description: string | null;
  createdAt: string | null;
  metadata?: Record<string, any> | null;
}

export interface CreatePaymentIntentParams {
  momentId: string;
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ConfirmPaymentParams {
  paymentIntentId: string;
  paymentMethodId?: string;
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
   * Create a payment intent (server-side)
   *
   * This calls the Edge Function which securely communicates with Stripe
   * The Stripe secret key never leaves the server
   */
  async createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<PaymentIntent> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(
        `${this.EDGE_FUNCTION_BASE}/payment/create-payment-intent`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            momentId: params.momentId,
            amount: params.amount,
            currency: params.currency || 'USD',
            description: params.description,
            metadata: params.metadata,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment intent');
      }

      const paymentIntent: PaymentIntent = await response.json();

      // Invalidate relevant caches
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await invalidateWallet(user.id);
        await invalidateTransactions(user.id);
      }

      logger.info('Payment intent created:', paymentIntent.paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error('Create payment intent error:', error);
      throw error;
    }
  }

  /**
   * Confirm a payment intent (server-side)
   *
   * Securely confirms the payment with Stripe on the server
   */
  async confirmPayment(params: ConfirmPaymentParams): Promise<{
    success: boolean;
    status: string;
    paymentIntentId: string;
    requiresAction: boolean;
    clientSecret?: string;
  }> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(
        `${this.EDGE_FUNCTION_BASE}/payment/confirm-payment`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            paymentIntentId: params.paymentIntentId,
            paymentMethodId: params.paymentMethodId,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to confirm payment');
      }

      const result = await response.json();

      // Invalidate all payment caches after successful payment
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && result.success) {
        await invalidateAllPaymentCache(user.id);
      }

      logger.info('Payment confirmed:', result.paymentIntentId);
      return result;
    } catch (error) {
      logger.error('Confirm payment error:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance with caching
   */
  async getWalletBalance(): Promise<WalletBalance> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Try cache first
      const cached = await getCachedWallet(user.id);
      if (cached) {
        logger.info('Wallet balance from cache');
        const cachedData = cached as unknown as {
          balance?: number;
          pendingBalance?: number;
          currency?: string;
        };
        return {
          available: cachedData.balance || 0,
          pending: cachedData.pendingBalance || 0,
          currency: cachedData.currency || 'USD',
        };
      }

      // Fetch from database
      const { data, error } = await supabase
        .from('users')
        .select('balance, currency')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const dbData = data as unknown as { balance?: number; currency?: string };
      const balance: WalletBalance = {
        available: dbData.balance || 0,
        pending: 0,
        currency: dbData.currency || 'USD',
      };

      // Cache the result - convert to WalletData format
      await setCachedWallet(user.id, {
        balance: balance.available,
        currency: balance.currency,
        pendingBalance: balance.pending,
      });

      return balance;
    } catch (error) {
      logger.error('Get wallet balance error:', error);
      throw error;
    }
  }

  /**
   * Get transaction history with caching
   */
  async getTransactions(params?: {
    type?: string;
    status?: string;
    limit?: number;
  }): Promise<Transaction[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Build cache key with params
      const cacheKey = `${user.id}:${JSON.stringify(params || {})}`;

      // Try cache first
      const cached = await getCachedTransactions(cacheKey);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        logger.info('Transactions from cache');
        return cached as Transaction[];
      }

      // Build query with JOIN to fetch related data (prevents N+1)
      let query = supabase
        .from('transactions')
        .select(
          `
          *,
          request:requests!request_id(
            id,
            status,
            moment:moments!moment_id(
              id,
              title,
              price
            )
          )
        `,
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (params?.type) {
        query = query.eq('type', params.type);
      }

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transactions: Transaction[] = (data || []).map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        description: tx.description || '',
        createdAt: tx.created_at ?? null,
        metadata: toRecord(tx.metadata),
      }));

      // Cache the result (coerce types for storage)
      await setCachedTransactions(
        cacheKey,
        transactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          type: t.type,
          status: t.status ?? 'unknown',
          createdAt: t.createdAt ?? '',
        })),
      );

      return transactions;
    } catch (error) {
      logger.error('Get transactions error:', error);
      throw error;
    }
  }

  /**
   * Request withdrawal to bank account
   */
  async requestWithdrawal(params: {
    amount: number;
    bankAccountId: string;
  }): Promise<Transaction> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify sufficient balance
      const balance = await this.getWalletBalance();
      if (balance.available < params.amount) {
        throw new Error('Insufficient balance');
      }

      // Create withdrawal transaction
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'withdrawal',
          amount: -params.amount,
          currency: balance.currency,
          status: 'pending',
          description: 'Withdrawal to bank account',
          metadata: {
            bank_account_id: params.bankAccountId,
          },
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidate caches
      await invalidateAllPaymentCache(user.id);

      const transaction: Transaction = {
        id: data.id,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        description: data.description,
        createdAt: data.created_at ?? null,
        metadata: toRecord(data.metadata),
      };

      logger.info('Withdrawal requested:', transaction.id);
      return transaction;
    } catch (error) {
      logger.error('Request withdrawal error:', error);
      throw error;
    }
  }

  /**
   * Get payment history for a specific moment
   */
  async getMomentPayments(momentId: string): Promise<Transaction[]> {
    try {
      // SECURITY: Only select required transaction fields - never use select('*')
      const { data, error } = await supabase
        .from('transactions')
        .select(
          `
          id,
          type,
          amount,
          currency,
          status,
          description,
          created_at,
          metadata,
          moment_id,
          sender_id,
          receiver_id
        `,
        )
        .eq('moment_id', momentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const txList = (data ||
        []) as unknown as Database['public']['Tables']['transactions']['Row'][];
      return txList.map((row) => ({
        id: row.id,
        type: row.type,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        description: row.description || '',
        createdAt: row.created_at ?? null,
        metadata: toRecord(row.metadata),
      }));
    } catch (error) {
      logger.error('Get moment payments error:', error);
      throw error;
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

      // Fetch fresh data
      await Promise.all([
        this.getWalletBalance(),
        this.getTransactions({ limit: 20 }),
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
  subscribeToPaymentUpdates(callback: (payload: any) => void): () => void {
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
}

export const securePaymentService = new SecurePaymentService();
