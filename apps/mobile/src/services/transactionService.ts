/**
 * Transaction Service
 *
 * Handles transaction history and queries.
 * Separated from payment service to avoid "Fat Service" anti-pattern.
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import {
  getCachedTransactions,
  setCachedTransactions,
  invalidateTransactions,
} from './cacheInvalidationService';
import { toRecord } from '../utils/jsonHelper';
import type { Database } from '../types/database.types';

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

export interface TransactionFilters {
  type?: string;
  status?: string;
  limit?: number;
}

class TransactionService {
  /**
   * Get transaction history with caching
   */
  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      // Build cache key with params
      const cacheKey = `${user.id}:${JSON.stringify(filters || {})}`;

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

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
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
   * Invalidate transaction cache (useful after external updates)
   */
  async invalidateCache(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await invalidateTransactions(user.id);
    }
  }
}

export const transactionService = new TransactionService();
