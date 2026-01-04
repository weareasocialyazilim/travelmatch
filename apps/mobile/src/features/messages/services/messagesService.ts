import { supabase } from '@/config/supabase';
import type { Database } from '../../../types/database.types';
import { ESCROW_THRESHOLDS } from '@/constants/values';

/**
 * Messages API Service
 *
 * Mesajlaşma yönetimi için API çağrıları
 *
 * CHAT LOCK MEKANIZMASI (MASTER Revizyonu):
 *
 * Tier 1 (0-30$): Chat yok, sadece Bulk Thank You
 * Tier 2 (30-100$): Chat aday, host "Sohbeti Başlat" onayı gerekli
 * Tier 3 (100$+): Premium teklif, gümüş renk vurgulu, yine onay gerekli
 *
 * Host tacizini engellemek için ÇIFT TARAFLI OPT-IN sistemi:
 * - Gönderici hediye verir
 * - Alıcı (Host) "Sohbeti Başlat" butonuyla onay verir
 * - Ancak o zaman chat açılır
 *
 * REFACTOR: is_liked → is_chat_approved_by_host
 * REFACTOR: handleLikeUser → handleUnlockConversation
 */

// Chat eligibility tiers
export type ChatTier = 'none' | 'candidate' | 'premium';

export interface ChatEligibility {
  tier: ChatTier;
  canChat: boolean;
  requiresApproval: boolean;
  message: string;
  messageTR: string;
}

/**
 * Determine chat eligibility based on gift amount
 */
export const determineChatTier = (giftAmountUSD: number): ChatEligibility => {
  const DIRECT_MAX = ESCROW_THRESHOLDS.DIRECT_MAX; // $30
  const OPTIONAL_MAX = ESCROW_THRESHOLDS.OPTIONAL_MAX; // $100

  if (giftAmountUSD < DIRECT_MAX) {
    // Tier 1: 0-30$ - No chat, bulk thank you only
    return {
      tier: 'none',
      canChat: false,
      requiresApproval: false,
      message: 'Gifts under $30 receive bulk thank you messages only',
      messageTR: '30$ altı hediyeler sadece toplu teşekkür mesajı alır',
    };
  }

  if (giftAmountUSD < OPTIONAL_MAX) {
    // Tier 2: 30-100$ - Chat candidate, requires host approval
    return {
      tier: 'candidate',
      canChat: true,
      requiresApproval: true,
      message: 'Chat available if host approves (Sohbeti Başlat)',
      messageTR: 'Host "Sohbeti Başlat" derse chat açılabilir',
    };
  }

  // Tier 3: 100$+ - Premium offer, highlighted, still requires approval
  return {
    tier: 'premium',
    canChat: true,
    requiresApproval: true,
    message: 'Premium offer - Chat available with host approval',
    messageTR: 'Premium teklif - Host onayı ile chat açılabilir',
  };
};

export const messagesApi = {
  /**
   * Host Unlock Conversation - Sohbet kilidini aç
   * REFACTOR: handleLikeUser → handleUnlockConversation
   *
   * Alıcı (Host) bu fonksiyonu çağırarak göndericiye sohbet izni verir.
   * is_chat_approved_by_host flag'i true olur.
   *
   * Notification: "Seni beğendi" → "[Kullanıcı] seninle bir sohbet başlattı!"
   */
  unlockConversation: async (giftId: string, senderId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Update gift to mark chat as approved by host
    const { error: giftError } = await supabase
      .from('gifts')
      .update({
        host_approved: true,
        // REFACTOR: is_liked → is_chat_approved_by_host (in database migration)
        updated_at: new Date().toISOString(),
      })
      .eq('id', giftId)
      .eq('receiver_id', user.id); // Security: Only receiver can approve

    if (giftError) throw giftError;

    // Create notification for sender
    // "[Kullanıcı] seninle bir sohbet başlattı!"
    const { error: notifError } = await supabase.from('notifications').insert({
      user_id: senderId,
      type: 'chat_unlocked',
      title: 'Sohbet Başladı! 💬',
      body: 'Hediyeni kabul etti ve seninle sohbet başlattı!',
      data: { gift_id: giftId, host_id: user.id },
    });

    if (notifError) {
      // Log but don't throw - notification failure shouldn't block unlock
      console.error('Failed to create notification:', notifError);
    }

    return { success: true };
  },

  /**
   * Send Gratitude Note - Teşekkür notu gönder (sohbet açmaz!)
   *
   * Host bireysel teşekkür mesajı gönderir.
   * Bu, toplu teşekkürden farklı olarak kişiye özeldir.
   * ANCAK sohbet başlatmaz - sadece bir kerelik mesajdır.
   */
  sendGratitudeNote: async (
    giftId: string,
    senderId: string,
    message: string,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create gratitude note record
    const { error } = await supabase.from('gratitude_notes').insert({
      gift_id: giftId,
      sender_id: senderId, // The gift giver
      receiver_id: user.id, // The host sending gratitude
      message,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    // Create notification for gift sender
    const { error: notifError } = await supabase.from('notifications').insert({
      user_id: senderId,
      type: 'gratitude_received',
      title: 'Teşekkür Notu Aldın! 🙏',
      body: message.substring(0, 100),
      data: { gift_id: giftId },
    });

    if (notifError) {
      console.error('Failed to create gratitude notification:', notifError);
    }

    return { success: true };
  },

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
   * REFACTOR: moment_id artık ZORUNLU - bağlamsız sohbetler engellendi
   *
   * CHAT LOCK: Host onayı olmadan chat açılamaz!
   * - Gift miktarına göre tier belirlenir
   * - Tier 1 (0-30$): Chat yok
   * - Tier 2+ (30$+): Host "Sohbeti Başlat" ile onay vermediyse chat açılamaz
   */
  createConversation: async (
    recipientId: string,
    momentId: string,
    giftId?: string,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate moment_id is provided
    if (!momentId) {
      throw new Error(
        'moment_id is required - contextless conversations are not allowed',
      );
    }

    // CHAT LOCK: Check if there's an approved gift for this conversation
    if (giftId) {
      const { data: gift, error: giftError } = await supabase
        .from('gifts')
        .select('id, amount, currency, host_approved, status')
        .eq('id', giftId)
        .single();

      if (giftError || !gift) {
        throw new Error('Gift not found');
      }

      // Determine chat tier based on gift amount
      const chatEligibility = determineChatTier(gift.amount || 0);

      // Tier 1: No chat allowed
      if (chatEligibility.tier === 'none') {
        throw new Error(chatEligibility.messageTR);
      }

      // Tier 2 & 3: Requires host approval (Sohbeti Başlat)
      if (chatEligibility.requiresApproval && !gift.host_approved) {
        throw new Error(
          'Chat requires host approval. Wait for the host to start the conversation.',
        );
      }
    }

    // Check if conversation already exists for this moment
    // SECURITY: Explicit column selection - never use select('*')
    const { data: existing } = await supabase
      .from('conversations')
      .select(
        `id, participant_ids, moment_id, created_at, updated_at, last_message_at`,
      )
      .contains('participant_ids', [user.id, recipientId])
      .eq('moment_id', momentId)
      .single();

    if (existing) return existing;

    // Create new conversation with moment context
    const insertPayload = {
      participant_ids: [user.id, recipientId],
      moment_id: momentId,
      gift_id: giftId, // Link to the gift that unlocked this chat
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

    const upsertPayload = {
      conversation_id: conversationId,
      user_id: user.id,
      is_archived: true,
    } as unknown as Database['public']['Tables']['conversation_settings']['Insert'];

    const { error } = await supabase
      .from('conversation_settings')
      .upsert(upsertPayload);

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
