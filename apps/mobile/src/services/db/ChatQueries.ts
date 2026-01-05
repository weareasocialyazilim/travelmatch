/**
 * Chat Database Queries
 * CRUD operations for messages and conversations
 */

import { supabase, isSupabaseConfigured } from '../../config/supabase';
import { logger } from '../../utils/logger';
import type { Tables, DbResult, ListResult } from './types';
import { okSingle, okList } from './types';

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
      return okList<Tables['messages']['Row']>(data || [], count);
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

      return okSingle<Tables['messages']['Row']>(data);
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
        .select(
          `
          id,
          participant_ids,
          updated_at,
          created_at,
          last_message_id,
          moment_id
        `,
          { count: 'exact' },
        )
        .contains('participant_ids', [userId])
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return okList<any>(data || [], count);
    } catch (error) {
      logger.error('[DB] List conversations error:', error);
      return { data: [], count: 0, error: error as Error };
    }
  },

  async getOrCreate(
    participantIds: string[],
  ): Promise<DbResult<Tables['conversations']['Row']>> {
    try {
      const { data: existing } = await supabase
        .from('conversations')
        .select(
          `
          id,
          participant_ids,
          last_message_id,
          created_at,
          updated_at,
          last_message_at,
          last_message_preview
        `,
        )
        .contains('participant_ids', participantIds)
        .single();

      if (existing) {
        return okSingle<Tables['conversations']['Row']>(existing);
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({ participant_ids: participantIds })
        .select()
        .single();

      if (error) throw error;
      return okSingle<Tables['conversations']['Row']>(data);
    } catch (error) {
      logger.error('[DB] Get/Create conversation error:', error);
      return { data: null, error: error as Error };
    }
  },

  async getById(
    conversationId: string,
  ): Promise<DbResult<Tables['conversations']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(
          `
          id,
          participant_ids,
          last_message_id,
          created_at,
          updated_at,
          last_message_at,
          last_message_preview
        `,
        )
        .eq('id', conversationId)
        .single();

      if (error) throw error;
      return okSingle<Tables['conversations']['Row']>(data);
    } catch (error) {
      logger.error('[DB] Get conversation by ID error:', error);
      return { data: null, error: error as Error };
    }
  },
};
