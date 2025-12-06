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
  }): Promise<ListResult<Tables['moments']['Row']>> {
    if (!isSupabaseConfigured()) {
      return {
        data: [],
        count: 0,
        error: new Error('Supabase not configured'),
      };
    }

    try {
      let query = supabase.from('moments').select('*', { count: 'exact' });

      if (options?.category) {
        query = query.eq('category', options.category);
      }
      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(
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

export default {
  users: usersService,
  moments: momentsService,
  requests: requestsService,
  messages: messagesService,
  conversations: conversationsService,
  reviews: reviewsService,
  notifications: notificationsService,
};
