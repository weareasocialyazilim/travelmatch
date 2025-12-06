/**
 * Supabase Database Service
 * CRUD operations for TravelMatch entities
 */

import {
  supabase,
  isSupabaseConfigured,
  type Database,
} from '../config/supabase';
import { logger } from '../utils/logger';

type Tables = Database['public']['Tables'];

// Generic response type
interface DbResult<T> {
  data: T | null;
  error: Error | null;
}

interface ListResult<T> {
  data: T[];
  count: number;
  error: Error | null;
}

/**
 * Users Service
 */
export const usersService = {
  async getById(id: string): Promise<DbResult<Tables['users']['Row']>> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('[DB] Get user error:', error);
      return { data: null, error: error as Error };
    }
  },

  async update(
    id: string,
    updates: Tables['users']['Update'],
  ): Promise<DbResult<Tables['users']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('[DB] Update user error:', error);
      return { data: null, error: error as Error };
    }
  },

  async follow(followerId: string, followingId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Follow user error:', error);
      return { error: error as Error };
    }
  },

  async unfollow(followerId: string, followingId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Unfollow user error:', error);
      return { error: error as Error };
    }
  },

  async getFollowers(userId: string): Promise<ListResult<any>> {
    try {
      const { data, count, error } = await supabase
        .from('follows')
        .select('follower:users(*)', { count: 'exact' })
        .eq('following_id', userId);

      if (error) throw error;
      
      const followers = data?.map((item: any) => item.follower) || [];
      return { data: followers, count: count || 0, error: null };
    } catch (error) {
      logger.error('[DB] Get followers error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async getFollowing(userId: string): Promise<ListResult<any>> {
    try {
      const { data, count, error } = await supabase
        .from('follows')
        .select('following:users(*)', { count: 'exact' })
        .eq('follower_id', userId);

      if (error) throw error;

      const following = data?.map((item: any) => item.following) || [];
      return { data: following, count: count || 0, error: null };
    } catch (error) {
      logger.error('[DB] Get following error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async checkFollowStatus(followerId: string, followingId: string): Promise<{ isFollowing: boolean; error: Error | null }> {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) throw error;
      return { isFollowing: (count || 0) > 0, error: null };
    } catch (error) {
      logger.error('[DB] Check follow status error:', error);
      return { isFollowing: false, error: error as Error };
    }
  },

  async search(query: string, limit: number = 10): Promise<ListResult<Tables['users']['Row']>> {
    try {
      const { data, count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return { data: data || [], count: count || 0, error: null };
    } catch (error) {
      logger.error('[DB] Search users error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async getSuggested(userId: string, limit: number = 5): Promise<ListResult<Tables['users']['Row']>> {
    try {
      const { data, count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .neq('id', userId)
        .limit(limit);
        
      if (error) throw error;
      return { data: data || [], count: count || 0, error: null };
    } catch (error) {
      logger.error('[DB] Get suggested users error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },
};

/**
 * Moments Service
 */
export const momentsService = {
  async list(options?: {
    limit?: number;
    offset?: number;
    category?: string;
    userId?: string;
    status?: string;
    city?: string;
    country?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'newest' | 'price_low' | 'price_high' | 'rating' | 'popular';
    search?: string;
  }): Promise<ListResult<Tables['moments']['Row']>> {
    if (!isSupabaseConfigured()) {
      return {
        data: [],
        count: 0,
        error: new Error('Supabase not configured'),
      };
    }

    try {
      let query = supabase.from('moments').select('*, users(*)', { count: 'exact' });

      if (options?.category) {
        query = query.eq('category', options.category);
      }
      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }

      // New filters
      if (options?.city) {
        query = query.ilike('location', `%${options.city}%`);
      }
      if (options?.country) {
        query = query.ilike('location', `%${options.country}%`);
      }
      if (options?.minPrice) {
        query = query.gte('price', options.minPrice);
      }
      if (options?.maxPrice) {
        query = query.lte('price', options.maxPrice);
      }
      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      // Sorting
      if (options?.sortBy) {
        switch (options.sortBy) {
          case 'price_low':
            query = query.order('price', { ascending: true });
            break;
          case 'price_high':
            query = query.order('price', { ascending: false });
            break;
          case 'newest':
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }

      query = query.range(
          options?.offset || 0,
          (options?.offset || 0) + (options?.limit || 20) - 1,
        );

      const { data, count, error } = await query;

      if (error) throw error;
      return { data: data || [], count: count || 0, error: null };
    } catch (error) {
      logger.error('[DB] List moments error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async getById(id: string): Promise<DbResult<Tables['moments']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('moments')
        .select('*, users(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('[DB] Get moment error:', error);
      return { data: null, error: error as Error };
    }
  },

  async create(
    moment: Tables['moments']['Insert'],
  ): Promise<DbResult<Tables['moments']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('moments')
        .insert(moment)
        .select()
        .single();

      if (error) throw error;
      logger.info('[DB] Moment created:', data?.id);
      return { data, error: null };
    } catch (error) {
      logger.error('[DB] Create moment error:', error);
      return { data: null, error: error as Error };
    }
  },

  async getSaved(userId: string): Promise<ListResult<Tables['moments']['Row']>> {
    if (!isSupabaseConfigured()) {
      return {
        data: [],
        count: 0,
        error: new Error('Supabase not configured'),
      };
    }

    try {
      const { data, count, error } = await supabase
        .from('favorites')
        .select('moments(*)', { count: 'exact' })
        .eq('user_id', userId);

      if (error) throw error;

      // Extract moments from the join result
      const moments = data?.map((item: any) => item.moments) || [];
      
      return { data: moments, count: count || 0, error: null };
    } catch (error) {
      logger.error('[DB] Get saved moments error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async save(userId: string, momentId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, moment_id: momentId });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Save moment error:', error);
      return { error: error as Error };
    }
  },

  async unsave(userId: string, momentId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('moment_id', momentId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Unsave moment error:', error);
      return { error: error as Error };
    }
  },

  async update(
    id: string,
    updates: Tables['moments']['Update'],
  ): Promise<DbResult<Tables['moments']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('moments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('[DB] Update moment error:', error);
      return { data: null, error: error as Error };
    }
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.from('moments').delete().eq('id', id);

      if (error) throw error;
      logger.info('[DB] Moment deleted:', id);
      return { error: null };
    } catch (error) {
      logger.error('[DB] Delete moment error:', error);
      return { error: error as Error };
    }
  },

  async pause(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('moments')
        .update({ status: 'paused' })
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Pause moment error:', error);
      return { error: error as Error };
    }
  },

  async activate(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('moments')
        .update({ status: 'active' })
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Activate moment error:', error);
      return { error: error as Error };
    }
  },

  async search(
    query: string,
    options?: { limit?: number },
  ): Promise<ListResult<Tables['moments']['Row']>> {
    try {
      const { data, count, error } = await supabase
        .from('moments')
        .select('*', { count: 'exact' })
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`,
        )
        .eq('status', 'active')
        .limit(options?.limit || 20);

      if (error) throw error;
      return { data: data || [], count: count || 0, error: null };
    } catch (error) {
      logger.error('[DB] Search moments error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },
};

/**
 * Requests Service
 */
export const requestsService = {
  async list(options?: {
    momentId?: string;
    userId?: string;
    status?: string;
  }): Promise<ListResult<Tables['requests']['Row']>> {
    if (!isSupabaseConfigured()) {
      return {
        data: [],
        count: 0,
        error: new Error('Supabase not configured'),
      };
    }

    try {
      let query = supabase
        .from('requests')
        .select('*, users(*), moments(*)', { count: 'exact' });

      if (options?.momentId) {
        query = query.eq('moment_id', options.momentId);
      }
      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }

      const { data, count, error } = await query.order('created_at', {
        ascending: false,
      });

      if (error) throw error;
      return { data: data || [], count: count || 0, error: null };
    } catch (error) {
      logger.error('[DB] List requests error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async create(
    request: Tables['requests']['Insert'],
  ): Promise<DbResult<Tables['requests']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      logger.info('[DB] Request created:', data?.id);
      return { data, error: null };
    } catch (error) {
      logger.error('[DB] Create request error:', error);
      return { data: null, error: error as Error };
    }
  },

  async updateStatus(
    id: string,
    status: 'accepted' | 'rejected' | 'cancelled',
  ): Promise<DbResult<Tables['requests']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      logger.info('[DB] Request status updated:', id, status);
      return { data, error: null };
    } catch (error) {
      logger.error('[DB] Update request error:', error);
      return { data: null, error: error as Error };
    }
  },
};

/**
 * Messages Service
 */
export const messagesService = {
  async listByConversation(
    conversationId: string,
    options?: { limit?: number; before?: string },
  ): Promise<ListResult<Tables['messages']['Row']>> {
    if (!isSupabaseConfigured()) {
      return {
        data: [],
        count: 0,
        error: new Error('Supabase not configured'),
      };
    }

    try {
      let query = supabase
        .from('messages')
        .select('*, sender:users(*)', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(options?.limit || 50);

      if (options?.before) {
        query = query.lt('created_at', options.before);
      }

      const { data, count, error } = await query;

      if (error) throw error;
      return { data: data || [], count: count || 0, error: null };
    } catch (error) {
      logger.error('[DB] List messages error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async send(
    message: Tables['messages']['Insert'],
  ): Promise<DbResult<Tables['messages']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last_message_id
      await supabase
        .from('conversations')
        .update({ last_message_id: data.id })
        .eq('id', message.conversation_id);

      return { data, error: null };
    } catch (error) {
      logger.error('[DB] Send message error:', error);
      return { data: null, error: error as Error };
    }
  },

  async markAsRead(messageIds: string[]): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('[DB] Mark as read error:', error);
      return { error: error as Error };
    }
  },

  /**
   * Subscribe to new messages in a conversation
   */
  subscribeToConversation(
    conversationId: string,
    callback: (message: Tables['messages']['Row']) => void,
  ) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as Tables['messages']['Row']);
        },
      )
      .subscribe();
  },
};

/**
 * Conversations Service
 */
export const conversationsService = {
  async list(
    userId: string,
  ): Promise<ListResult<Tables['conversations']['Row']>> {
    if (!isSupabaseConfigured()) {
      return {
        data: [],
        count: 0,
        error: new Error('Supabase not configured'),
      };
    }

    try {
      const { data, count, error } = await supabase
        .from('conversations')
        .select('*, last_message:messages(*)', { count: 'exact' })
        .contains('participant_ids', [userId])
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], count: count || 0, error: null };
    } catch (error) {
      logger.error('[DB] List conversations error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async getOrCreate(
    participantIds: string[],
  ): Promise<DbResult<Tables['conversations']['Row']>> {
    try {
      // First, try to find existing conversation
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', participantIds)
        .single();

      if (existing) {
        return { data: existing, error: null };
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({ participant_ids: participantIds })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('[DB] Get/Create conversation error:', error);
      return { data: null, error: error as Error };
    }
  },
};

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
      return { data: data || [], count: count || 0, error: null };
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
      return { data, error: null };
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
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(options?.limit || 50);

      if (options?.unreadOnly) {
        query = query.eq('read', false);
      }

      const { data, count, error } = await query;

      if (error) throw error;
      return { data: data || [], count: count || 0, error: null };
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
    report: Tables['reports']['Insert'],
  ): Promise<DbResult<Tables['reports']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('[DB] Create report error:', error);
      return { data: null, error: error as Error };
    }
  },

  async listReports(
    userId: string,
  ): Promise<ListResult<Tables['reports']['Row']>> {
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
    block: Tables['blocks']['Insert'],
  ): Promise<DbResult<Tables['blocks']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('blocks')
        .insert(block)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
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

  async listBlockedUsers(
    userId: string,
  ): Promise<ListResult<Tables['blocks']['Row']>> {
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
  ): Promise<ListResult<Tables['transactions']['Row']>> {
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

  async get(id: string): Promise<DbResult<Tables['transactions']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('[DB] Get transaction error:', error);
      return { data: null, error: error as Error };
    }
  },

  async create(
    transaction: Tables['transactions']['Insert'],
  ): Promise<DbResult<Tables['transactions']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;
      logger.info('[DB] Transaction created:', data?.id);
      return { data, error: null };
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
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (error) throw error;
      return { data: data || [], count: data?.length || 0, error: null };
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
      return { data, error: null };
    } catch (error) {
      logger.error('[DB] Get user subscription error:', error);
      return { data: null, error: error as Error };
    }
  },
};

export default {
  users: usersService,
  moments: momentsService,
  requests: requestsService,
  messages: messagesService,
  conversations: conversationsService,
  reviews: reviewsService,
  notifications: notificationsService,
  transactions: transactionsService,
  moderation: moderationService,
  subscriptions: subscriptionsService,
};
