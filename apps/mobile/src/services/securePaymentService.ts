/**
 * Secure Payment Service (Client-Side)
 *
 * Handles PayTR payment operations for PCI-compliant payment processing.
 * Delegates wallet and transaction queries to specialized services.
 *
 * @see walletService.ts for wallet balance operations
 * @see transactionService.ts for transaction history queries
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

// Re-export types for backward compatibility
export type { WalletBalance } from './walletService';
export type { Transaction, TransactionFilters } from './transactionService';

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
}

export const securePaymentService = new SecurePaymentService();
