/**
 * Wallet Service
 *
 * Handles wallet balance operations and withdrawals.
 * Separated from payment service to avoid "Fat Service" anti-pattern.
 */

import { supabase, SUPABASE_EDGE_URL } from '../config/supabase';
import { logger } from '../utils/logger';
import {
  getCachedWallet,
  setCachedWallet,
  invalidateWallet,
  invalidateAllPaymentCache,
} from './cacheInvalidationService';

export interface WalletBalance {
  available: number;
  pending: number;
  currency: string;
}

class WalletService {
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
   * Get wallet balance with caching
   */
  async getBalance(): Promise<WalletBalance> {
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
   * Request withdrawal to bank account via PayTR transfer
   */
  async requestWithdrawal(params: {
    amount: number;
    bankAccountId: string;
  }): Promise<{ transactionId: string; status: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify sufficient balance
      const balance = await this.getBalance();
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

      logger.info('Withdrawal requested:', result.transactionId);
      return {
        transactionId: result.transactionId,
        status: 'pending',
      };
    } catch (error) {
      logger.error('Request withdrawal error:', error);
      throw error;
    }
  }

  /**
   * Invalidate wallet cache (useful after external updates)
   */
  async invalidateCache(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await invalidateWallet(user.id);
    }
  }
}

export const walletService = new WalletService();
