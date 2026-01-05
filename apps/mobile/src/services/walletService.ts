/**
 * Wallet Service
 *
 * LEGAL COMPLIANCE (PayTR Integration):
 * - We do NOT hold user funds - all funds are in PayTR pool
 * - "Balance" = PayTR API's "withdrawable balance" (proof-approved + valör-matured)
 * - "Pending" = Gifts sent but awaiting proof or PayTR approval
 * - "Withdrawal" = PayTR Settlement (Hakediş) request
 *
 * Balance Definitions:
 * - Available (Çekilebilir): Funds in PayTR pool with completed proof + valör period
 * - Pending (Beklemede): Gifts received but proof not uploaded or PayTR still processing
 *
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
  available: number; // PayTR withdrawable balance
  pending: number; // Awaiting proof or PayTR processing
  currency: string;
}

// PayTR Balance Response type
interface PayTRBalanceResponse {
  success: boolean;
  available_balance: number;
  pending_balance: number;
  currency: string;
  last_sync: string;
  error?: string;
}

// PayTR Settlement Response type
interface PayTRSettlementResponse {
  success: boolean;
  settlement_id: string;
  amount: number;
  status: 'pending_payout' | 'processing' | 'settled' | 'failed';
  estimated_arrival: string;
  error?: string;
}

class WalletService {
  private readonly EDGE_FUNCTION_BASE = `${SUPABASE_EDGE_URL}/functions/v1`;

  // Cache TTL for balance (5 minutes)
  private readonly BALANCE_CACHE_TTL = 5 * 60 * 1000;
  private lastBalanceFetch: number = 0;

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
   * Get wallet balance - Legacy method for backward compatibility
   * Uses database cache with periodic PayTR sync
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

      // Fetch from PayTR-synced source
      return await this.getPayTRBalance();
    } catch (error) {
      logger.error('Get wallet balance error:', error);
      throw error;
    }
  }

  /**
   * Get PayTR-synced balance
   * MASTER METHOD: Queries PayTR API for actual withdrawable balance
   * This is the source of truth for available funds
   */
  async getPayTRBalance(): Promise<WalletBalance> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if we should use cached data (within TTL)
      const now = Date.now();
      if (now - this.lastBalanceFetch < this.BALANCE_CACHE_TTL) {
        const cached = await getCachedWallet(user.id);
        if (cached) {
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
      }

      // Call PayTR balance edge function
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.EDGE_FUNCTION_BASE}/paytr-get-balance`,
        {
          method: 'GET',
          headers,
        },
      );

      if (!response.ok) {
        // Fallback to database if PayTR API fails
        logger.warn('PayTR balance API failed, falling back to database');
        return await this.getDatabaseBalance(user.id);
      }

      const result: PayTRBalanceResponse = await response.json();

      if (!result.success) {
        logger.warn('PayTR balance request failed:', result.error);
        return await this.getDatabaseBalance(user.id);
      }

      const balance: WalletBalance = {
        available: result.available_balance,
        pending: result.pending_balance,
        currency: result.currency || 'TRY',
      };

      // Update cache and database
      this.lastBalanceFetch = now;
      await setCachedWallet(user.id, {
        balance: balance.available,
        pendingBalance: balance.pending,
        currency: balance.currency,
      });

      // Sync to database for offline fallback
      await supabase
        .from('users')
        .update({
          balance: balance.available,
          pending_balance: balance.pending,
          balance_last_synced: new Date().toISOString(),
        })
        .eq('id', user.id);

      logger.info('PayTR balance fetched:', {
        available: balance.available,
        pending: balance.pending,
      });

      return balance;
    } catch (error) {
      logger.error('Get PayTR balance error:', error);
      throw error;
    }
  }

  /**
   * Fallback: Get balance from database (used when PayTR API unavailable)
   */
  private async getDatabaseBalance(userId: string): Promise<WalletBalance> {
    const { data, error } = await supabase
      .from('users')
      .select('balance, pending_balance, currency')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const dbData = data as unknown as {
      balance?: number;
      pending_balance?: number;
      currency?: string;
    };

    return {
      available: dbData.balance || 0,
      pending: dbData.pending_balance || 0,
      currency: dbData.currency || 'TRY',
    };
  }

  /**
   * Request PayTR Settlement (Hakediş)
   * MASTER METHOD: Triggers PayTR marketplace payout to user's bank
   *
   * Flow:
   * 1. Validate balance with PayTR
   * 2. Call PayTR settlement/payout API
   * 3. Log the request in our database (for audit trail)
   * 4. Return settlement reference
   */
  async requestPayTRSettlement(params: {
    amount: number;
    bankAccountId: string;
  }): Promise<{ settlementId: string; status: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Step 1: Verify sufficient balance with fresh PayTR data
      const balance = await this.getPayTRBalance();
      if (balance.available < params.amount) {
        throw new Error(
          `Yetersiz bakiye. Çekilebilir: ${balance.available.toFixed(2)} ₺`,
        );
      }

      // Step 2: Get bank account details
      const { data: bankAccount, error: bankError } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('id', params.bankAccountId)
        .eq('user_id', user.id)
        .single();

      if (bankError || !bankAccount) {
        throw new Error('Banka hesabı bulunamadı');
      }

      // Step 3: Call PayTR settlement edge function
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.EDGE_FUNCTION_BASE}/paytr-settlement`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            amount: params.amount,
            bank_account_id: params.bankAccountId,
            iban: bankAccount.iban,
            account_holder: bankAccount.account_holder_name,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Çekim talebi başarısız oldu');
      }

      const result: PayTRSettlementResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'PayTR hakediş talebi başarısız');
      }

      // Step 4: Log the withdrawal request in our database
      await supabase.from('withdrawal_requests').insert({
        user_id: user.id,
        amount: params.amount,
        currency: 'TRY',
        bank_account_id: params.bankAccountId,
        paytr_settlement_id: result.settlement_id,
        status: result.status,
        estimated_arrival: result.estimated_arrival,
        created_at: new Date().toISOString(),
      });

      // Invalidate caches
      await invalidateAllPaymentCache(user.id);

      logger.info('PayTR settlement requested:', {
        settlementId: result.settlement_id,
        amount: params.amount,
        status: result.status,
      });

      return {
        settlementId: result.settlement_id,
        status: result.status,
      };
    } catch (error) {
      logger.error('Request PayTR settlement error:', error);
      throw error;
    }
  }

  /**
   * Legacy method - kept for backward compatibility
   * @deprecated Use requestPayTRSettlement instead
   */
  async requestWithdrawal(params: {
    amount: number;
    bankAccountId: string;
  }): Promise<{ transactionId: string; status: string }> {
    const result = await this.requestPayTRSettlement(params);
    return {
      transactionId: result.settlementId,
      status: result.status,
    };
  }

  /**
   * Get bank accounts linked to the user
   * Returns list of verified bank accounts for withdrawal
   */
  async getBankAccounts(): Promise<
    Array<{
      id: string;
      bank_name: string;
      iban: string;
      account_holder: string;
      is_verified: boolean;
      is_default: boolean;
    }>
  > {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('bank_accounts')
        .select(
          'id, bank_name, iban, account_holder_name, is_verified, is_default',
        )
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;

      interface BankAccountRow {
        id: string;
        bank_name: string | null;
        iban: string;
        account_holder_name: string;
        is_verified: boolean | null;
        is_default: boolean | null;
      }

      return (data || []).map((item: BankAccountRow) => ({
        id: item.id,
        bank_name: item.bank_name || 'Banka',
        iban: item.iban,
        account_holder: item.account_holder_name,
        is_verified: item.is_verified ?? false,
        is_default: item.is_default ?? false,
      }));
    } catch (error) {
      logger.error('Get bank accounts error:', error);
      return [];
    }
  }

  /**
   * Get pending proofs that are blocking balance
   * Returns list of gifts awaiting proof upload
   */
  async getPendingProofItems(): Promise<
    Array<{
      id: string;
      amount: number;
      senderName: string;
      momentTitle: string;
      createdAt: string;
    }>
  > {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('gifts')
        .select(
          `
          id,
          amount,
          created_at,
          giver:users!gifts_giver_id_fkey(name),
          moment:moments(title)
        `,
        )
        .eq('receiver_id', user.id)
        .in('status', ['paytr_authorized', 'pending_proof'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      interface PendingProofRow {
        id: string;
        amount: number;
        created_at: string;
        giver: { name: string } | null;
        moment: { title: string } | null;
      }

      return (data || []).map((item: PendingProofRow) => ({
        id: item.id,
        amount: item.amount,
        senderName: item.giver?.name || 'Bilinmeyen',
        momentTitle: item.moment?.title || 'Hediye',
        createdAt: item.created_at,
      }));
    } catch (error) {
      logger.error('Get pending proof items error:', error);
      return [];
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
      this.lastBalanceFetch = 0;
    }
  }
}

export const walletService = new WalletService();
