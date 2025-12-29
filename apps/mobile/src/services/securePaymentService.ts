/**
 * Secure Payment Service (Client-Side)
 *
 * Communicates with server-side Edge Functions for PCI-compliant payment processing
 * Uses PayTR for Turkish payment processing
 *
 * Features:
 * - Server-side PayTR API calls
 * - Automatic cache invalidation
 * - Error handling and retry logic
 * - Type-safe payment operations
 *
 * PayTR Edge Functions:
 * - paytr-create-payment: Create payment and get iframeToken
 * - paytr-webhook: Handle PayTR callbacks
 * - paytr-saved-cards: Manage saved cards
 * - paytr-transfer: Handle transfers
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
export interface PayTRPaymentResponse {
  iframeToken: string;
  merchantOid: string;
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
  metadata?: Record<string, unknown> | null;
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
  async getSavedCards(): Promise<
    Array<{
      cardToken: string;
      last4: string;
      cardBrand: string;
      isDefault: boolean;
    }>
  > {
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
          currency: cachedData.currency || 'TRY',
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
        currency: dbData.currency || 'TRY',
      };

      // Cache the result
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

      // Cache the result
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
   * Request withdrawal to bank account via PayTR transfer
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

      // Call PayTR transfer edge function
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.EDGE_FUNCTION_BASE}/paytr-transfer`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            amount: params.amount,
            bankAccountId: params.bankAccountId,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Withdrawal failed');
      }

      const result = await response.json();

      // Invalidate caches
      await invalidateAllPaymentCache(user.id);

      const transaction: Transaction = {
        id: result.transactionId,
        type: 'withdrawal',
        amount: -params.amount,
        currency: balance.currency,
        status: 'pending',
        description: 'Withdrawal to bank account',
        createdAt: new Date().toISOString(),
        metadata: { bank_account_id: params.bankAccountId },
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
}

export const securePaymentService = new SecurePaymentService();
