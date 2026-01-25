/**
 * Auxiliary Database Queries
 * Reviews, Notifications, Moderation, Transactions, Subscriptions
 */

import {
  supabase,
  isSupabaseConfigured,
  type Database,
} from '../../config/supabase';
import { logger } from '../../utils/logger';
import type {
  Tables,
  DbResult,
  ListResult,
  ReportRecord,
  BlockRecord,
  TransactionInput,
} from './types';
import { okSingle, okList } from './types';

/**
 * Reviews Service
 */
export const reviewsService = {
  async listByUser(
    userId: string,
  ): Promise<ListResult<Tables['reviews']['Row']>> {
    if (!isSupabaseConfigured()) {
      return {
        data: [],
        count: 0,
        error: new Error('Supabase not configured'),
      };
    }

    try {
      const { data, count, error } = await supabase
        .from('reviews')
        .select('*, reviewer:users(*), moment:moments(*)', { count: 'exact' })
        .eq('reviewed_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return okList<Tables['reviews']['Row']>(data || [], count);
    } catch (error) {
      logger.error('[DB] List reviews error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async create(
    review: Tables['reviews']['Insert'],
  ): Promise<DbResult<Tables['reviews']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single();

      if (error) throw error;
      logger.info('[DB] Review created:', data?.id);
      return okSingle<Tables['reviews']['Row']>(data);
    } catch (error) {
      logger.error('[DB] Create review error:', error);
      return { data: null, error: error as Error };
    }
  },
};

/**
 * Notifications Service
 */
export const notificationsService = {
  async list(
    userId: string,
    options?: { limit?: number; unreadOnly?: boolean },
  ): Promise<ListResult<Tables['notifications']['Row']>> {
    if (!isSupabaseConfigured()) {
      return {
        data: [],
        count: 0,
        error: new Error('Supabase not configured'),
      };
    }

    try {
      let query = supabase
        .from('notifications')
        .select(
          `
          *,
          sender:users!notifications_sender_id_fkey(id, full_name, avatar_url),
          moment:moments!notifications_moment_id_fkey(id, image_url, title)
        `,
          { count: 'exact' },
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(options?.limit || 50);

      if (options?.unreadOnly) {
        query = query.eq('read', false);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      // Map the joined data to include related entity fields
      const enrichedData = (data || []).map((notification: any) => ({
        ...notification,
        userName: notification.sender?.full_name,
        userAvatar: notification.sender?.avatar_url,
        momentImage: notification.moment?.image_url,
        momentTitle: notification.moment?.title,
      }));

      return okList<Tables['notifications']['Row']>(enrichedData, count);
    } catch (error) {
      logger.error('[DB] List notifications error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async markAsRead(
    notificationIds: string[],
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Mark notifications read error:', error);
      return { error: error as Error };
    }
  },

  async markAllAsRead(userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Mark all notifications read error:', error);
      return { error: error as Error };
    }
  },

  /**
   * Subscribe to new notifications
   */
  subscribe(
    userId: string,
    callback: (notification: Tables['notifications']['Row']) => void,
  ) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Tables['notifications']['Row']);
        },
      )
      .subscribe();
  },
};

/**
 * Moderation Service (Reports & Blocks)
 */
export const moderationService = {
  // Reports
  async createReport(
    report: Omit<ReportRecord, 'id' | 'created_at'>,
  ): Promise<DbResult<ReportRecord>> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      return okSingle<ReportRecord>(data);
    } catch (error) {
      logger.error('[DB] Create report error:', error);
      return { data: null, error: error as Error };
    }
  },

  async listReports(userId: string): Promise<ListResult<any>> {
    try {
      const { data, count, error } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], count: count || 0, error: null };
    } catch (error) {
      logger.error('[DB] List reports error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  // Blocks
  async blockUser(
    block: Omit<BlockRecord, 'id' | 'created_at'>,
  ): Promise<DbResult<BlockRecord>> {
    try {
      const { data, error } = await supabase
        .from('blocks')
        .insert(block)
        .select()
        .single();

      if (error) throw error;
      return { data: data as BlockRecord, error: null };
    } catch (error) {
      logger.error('[DB] Block user error:', error);
      return { data: null, error: error as Error };
    }
  },

  async unblockUser(
    blockerId: string,
    blockedId: string,
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Unblock user error:', error);
      return { error: error as Error };
    }
  },

  async listBlockedUsers(userId: string): Promise<ListResult<any>> {
    try {
      const { data, count, error } = await supabase
        .from('blocks')
        .select('*, blocked:users!blocked_id(*)', { count: 'exact' })
        .eq('blocker_id', userId);

      if (error) throw error;
      return { data: data || [], count: count || 0, error: null };
    } catch (error) {
      logger.error('[DB] List blocked users error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },
};

/**
 * Transactions Service
 */
export const transactionsService = {
  async list(
    userId: string,
    options?: {
      type?: string;
      status?: string;
      limit?: number;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<ListResult<any>> {
    if (!isSupabaseConfigured()) {
      return {
        data: [],
        count: 0,
        error: new Error('Supabase not configured'),
      };
    }

    try {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.type) {
        query = query.eq('type', options.type);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.startDate) {
        query = query.gte('created_at', options.startDate);
      }
      if (options?.endDate) {
        query = query.lte('created_at', options.endDate);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, count, error } = await query;

      if (error) throw error;
      return { data: data || [], count: count || 0, error: null };
    } catch (error) {
      logger.error('[DB] List transactions error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async update(updates: {
    id: string;
    status?: string;
    metadata?: any;
  }): Promise<DbResult<Tables['transactions']['Row']>> {
    try {
      const { id, ...updateData } = updates;
      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('[DB] Update transaction error:', error);
      return { data: null, error: error as Error };
    }
  },

  async get(id: string): Promise<DbResult<Tables['transactions']['Row']>> {
    try {
      let user: { id: string } | null = null;
      try {
        if (supabase.auth && typeof supabase.auth.getUser === 'function') {
          const authRes = await supabase.auth.getUser();
          user = authRes?.data?.user ?? null;
        }
      } catch (authError) {
        logger.warn('[DB] Auth lookup failed for transaction get', {
          authError,
        });
        user = null;
      }

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
          user_id
        `,
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      const txRow = data as unknown as
        | Database['public']['Tables']['transactions']['Row']
        | null;
      if (user && txRow && txRow.user_id !== user.id) {
        logger.warn('[SECURITY] IDOR attempt detected', {
          userId: user.id,
          transactionId: id,
          ownerId: txRow.user_id,
        });
        throw new Error(
          'Forbidden: You do not have access to this transaction',
        );
      }

      return okSingle<Database['public']['Tables']['transactions']['Row']>(
        data,
      );
    } catch (error) {
      logger.error('[DB] Get transaction error:', error);
      return { data: null, error: error as Error };
    }
  },

  async create(
    transaction: TransactionInput,
  ): Promise<DbResult<Tables['transactions']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;
      logger.info('[DB] Transaction created:', data?.id);
      return okSingle<Tables['transactions']['Row']>(data);
    } catch (error) {
      logger.error('[DB] Create transaction error:', error);
      return { data: null, error: error as Error };
    }
  },
};

/**
 * Subscriptions Service
 */
export const subscriptionsService = {
  async getPlans(): Promise<ListResult<any>> {
    if (!isSupabaseConfigured()) {
      return {
        data: [],
        count: 0,
        error: new Error('Supabase not configured'),
      };
    }

    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select(
          `
          id,
          name,
          price,
          interval,
          features,
          is_popular,
          color,
          icon,
          is_active,
          created_at
        `,
        )
        .eq('is_active', true)
        .order('price');

      if (error) throw error;
      return okList<any>(data || [], data?.length);
    } catch (error) {
      logger.error('[DB] Get plans error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async getUserSubscription(userId: string): Promise<DbResult<any>> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return okSingle<any>(data);
    } catch (error) {
      logger.error('[DB] Get user subscription error:', error);
      return { data: null, error: error as Error };
    }
  },
};
