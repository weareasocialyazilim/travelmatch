import { supabase } from '@/config/supabase';
import type { Database } from '../../../types/database.types';

/**
 * Messages API Service
 *
 * Mesajlaşma yönetimi için API çağrıları
 */
export const messagesApi = {
  /**
   * Tüm konuşmaları getir
   */
  getConversations: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('conversations')
      .select(`*, last_message:messages(content, created_at)`)
      .contains('participant_ids', [user.id])
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Konuşma detayı
   */
  getConversation: async (conversationId: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) throw error;
    return data;
  },
  /**
   * Konuşmadaki mesajları getir
   */
  getMessages: async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Mesaj gönder
   */
  sendMessage: async (conversationId: string, content: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  },

  /**
   * Yeni konuşma başlat
   */
  createConversation: async (recipientId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if conversation already exists
    // SECURITY: Explicit column selection - never use select('*')
    const { data: existing } = await supabase
      .from('conversations')
      .select(`id, participant_ids, created_at, updated_at, last_message_at`)
      .contains('participant_ids', [user.id, recipientId])
      .single();

    if (existing) return existing;

    // Create new conversation
    const insertPayload = {
      participant_ids: [user.id, recipientId],
    } as unknown as Database['public']['Tables']['conversations']['Insert'];

    const { data, error } = await supabase
      .from('conversations')
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Konuşmayı arşivle
   */
  archiveConversation: async (conversationId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Use archived_at column in conversations table
    const { error } = await supabase
      .from('conversations')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', conversationId)
      .contains('participant_ids', [user.id]);

    if (error) throw error;
  },

  /**
   * Konuşmayı sil (soft delete)
   */
  deleteConversation: async (conversationId: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
  },

  /**
   * Mesajları okundu işaretle
   */
  markAsRead: async (conversationId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .is('read_at', null);

    if (error) throw error;
  },

  /**
   * Mesajı sil
   */
  deleteMessage: async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  },

  /**
   * Arşivlenmiş konuşmaları getir
   */
  getArchivedConversations: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('conversations')
      .select(`*, conversation_settings!inner(*)`)
      .eq('conversation_settings.user_id', user.id)
      .eq('conversation_settings.is_archived', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
