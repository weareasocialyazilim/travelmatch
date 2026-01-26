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
import { paymentCache, CACHE_KEYS, CACHE_TTL } from './cacheService';

export interface WalletBalance {
  available: number; // PayTR withdrawable balance
  coins: number; // Lovendo Coins (Virtual Currency)
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
      const cached = await paymentCache.getWallet(user.id);
      if (cached) {
        logger.info('Wallet balance from cache');
        const cachedData = cached as unknown as {
          balance?: number;
          coins?: number;
          pendingBalance?: number;
          currency?: string;
        };
        return {
          available: cachedData.balance || 0,
          coins: cachedData.coins || 0,
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
        const cached = await paymentCache.getWallet(user.id);
        if (cached) {
          const cachedData = cached as unknown as {
            balance?: number;
            coins?: number;
            pendingBalance?: number;
            currency?: string;
          };
          return {
            available: cachedData.balance || 0,
            coins: cachedData.coins || 0,
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

      // Fetch updated coins_balance from database since Auth user doesn't have it
      const { data: dbUser } = await supabase
        .from('users')
        .select('coins_balance')
        .eq('id', user.id)
        .single();

      const balance: WalletBalance = {
        available: result.available_balance,
        coins: (dbUser as any)?.coins_balance || 0,
        pending: result.pending_balance,
        currency: result.currency || 'TRY',
      };

      // Update cache and database
      this.lastBalanceFetch = now;
      await paymentCache.setWallet(user.id, {
        balance: balance.available,
        coins: balance.coins,
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
      .select('balance, coins_balance, pending_balance, currency')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const dbData = data as unknown as {
      balance?: number;
      coins_balance?: number;
      pending_balance?: number;
      currency?: string;
    };

    return {
      available: dbData.balance || 0,
      coins: dbData.coins_balance || 0,
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
        .select('id, iban, account_holder_name')
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
            iban: (bankAccount as { iban: string }).iban,
            account_holder: (bankAccount as { account_holder_name: string })
              .account_holder_name,
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
      await paymentCache.invalidateAll(user.id);

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
   * Request Coin Withdrawal (Coin -> Fiat)
   */
  async requestCoinWithdrawal(params: {
    coinAmount: number;
    bankAccountId: string;
  }): Promise<{ settlementId: string; status: string; fiatAmount: number }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.EDGE_FUNCTION_BASE}/paytr-withdraw`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            amount: params.coinAmount,
            bankAccountId: params.bankAccountId,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Çekim talebi başarısız oldu');
      }

      const result = await response.json();

      // Invalidate caches
      await paymentCache.invalidateAll(user.id);

      return {
        settlementId: result.settlementId,
        status: 'pending',
        fiatAmount: result.fiat_amount,
      };
    } catch (error) {
      logger.error('Coin withdrawal error:', error);
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

      return (data || []).map((item) => {
        const acc = item as {
          id: string;
          bank_name: string | null;
          iban: string;
          account_holder_name: string;
          is_verified: boolean | null;
          is_default: boolean | null;
        };
        return {
          id: acc.id,
          bank_name: acc.bank_name || 'Banka',
          iban: acc.iban,
          account_holder: acc.account_holder_name,
          is_verified: acc.is_verified ?? false,
          is_default: acc.is_default ?? false,
        };
      });
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

      return (data || []).map((item) => {
        const gift = item as {
          id: string;
          amount: number;
          created_at: string;
          giver: { name?: string } | null;
          moment: { title?: string } | null;
        };
        return {
          id: gift.id,
          amount: gift.amount,
          senderName: gift.giver?.name || 'Bilinmeyen',
          momentTitle: gift.moment?.title || 'Hediye',
          createdAt: gift.created_at,
        };
      });
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
      await paymentCache.invalidateWallet(user.id);
      this.lastBalanceFetch = 0;
    }
  }
}

export const walletService = new WalletService();
