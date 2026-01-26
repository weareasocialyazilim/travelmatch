import { supabase } from '@/config/supabase';
import type { Database } from '../../../types/database.types';
import { ESCROW_THRESHOLDS } from '@/constants/values';
import { logger } from '@/utils/logger';
import { encryptionService } from '@/services/encryptionService';
import { userService } from '@/services/userService';

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

/**
 * E2E Encryption helpers for messages
 */
const encryptMessage = async (
  content: string,
  recipientId: string,
): Promise<{
  encryptedContent: string;
  nonce: string;
  senderPublicKey: string;
} | null> => {
  try {
    // Get recipient's public key
    const recipientPublicKey = await userService.getPublicKey(recipientId);
    if (!recipientPublicKey) {
      logger.warn(
        '[Messages] Recipient has no public key, sending unencrypted',
      );
      return null;
    }

    // Get our public key
    const senderPublicKey = await encryptionService.getPublicKey();
    if (!senderPublicKey) {
      logger.warn('[Messages] Sender has no public key, sending unencrypted');
      return null;
    }

    // Encrypt the message
    const encrypted = await encryptionService.encrypt(
      content,
      recipientPublicKey,
    );

    return {
      encryptedContent: encrypted.message,
      nonce: encrypted.nonce,
      senderPublicKey,
    };
  } catch (error) {
    logger.error('[Messages] Encryption failed', error);
    return null;
  }
};

const decryptMessage = async (
  encryptedContent: string,
  nonce: string,
  senderPublicKey: string,
): Promise<string | null> => {
  try {
    const decrypted = await encryptionService.decrypt(
      encryptedContent,
      nonce,
      senderPublicKey,
    );
    return decrypted;
  } catch (error) {
    logger.error('[Messages] Decryption failed', error);
    return null;
  }
};

/**
 * Decrypt a message object if it's encrypted
 */
const decryptMessageIfNeeded = async (
  message: {
    content: string;
    nonce?: string | null;
    sender_public_key?: string | null;
    sender_id: string;
    metadata?: { _senderContent?: string } | null;
  },
  currentUserId: string,
): Promise<string> => {
  // If no encryption data, return as-is
  if (!message.nonce || !message.sender_public_key) {
    return message.content;
  }

  // We sent this message - use stored original content from metadata
  if (message.sender_id === currentUserId) {
    // Return original content if available in metadata
    return message.metadata?._senderContent || message.content;
  }

  // Decrypt the message
  const decrypted = await decryptMessage(
    message.content,
    message.nonce,
    message.sender_public_key,
  );

  return decrypted || '[Şifresi çözülemedi]';
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

    // RATE LIMITING: Max 10 chat unlocks per hour per host
    const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentUnlocks, error: rateLimitError } = await supabase
      .from('gift_approval_logs')
      .select('*', { count: 'exact', head: true })
      .eq('host_id', user.id)
      .gte('created_at', ONE_HOUR_AGO);

    if (rateLimitError) {
      logger.error('[Messages] Rate limit check failed:', rateLimitError);
    }

    if (recentUnlocks && recentUnlocks >= 10) {
      throw new Error(
        'Çok fazla sohbet açma isteği. 1 saat bekleyin.',
      );
    }

    // MASTER RULE: First check gift amount meets $30 minimum for chat unlock
    const { data: gift, error: fetchError } = await supabase
      .from('gifts')
      .select('id, amount, currency, status')
      .eq('id', giftId)
      .eq('receiver_id', user.id)
      .single();

    if (fetchError || !gift) {
      throw new Error('Gift not found or you are not the recipient');
    }

    // Cast to proper type after null check
    const giftData = gift as {
      id: string;
      amount: number;
      currency: string;
      status: string;
    };

    // CRITICAL: Enforce $30 minimum for chat unlock (Tier 2+)
    const chatEligibility = determineChatTier(giftData.amount || 0);
    if (chatEligibility.tier === 'none') {
      throw new Error(
        `Chat cannot be unlocked for gifts under $30. ${chatEligibility.messageTR}`,
      );
    }

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

    // Log the approval for rate limiting tracking
    const { error: logError } = await supabase.from('gift_approval_logs').insert({
      host_id: user.id,
      gift_id: giftId,
      sender_id: senderId,
      action: 'unlock',
    });

    if (logError) {
      logger.error('[Messages] Failed to log approval:', logError);
    }

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
      logger.error('Failed to create notification:', { error: notifError });
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
      logger.error('Failed to create gratitude notification:', {
        error: notifError,
      });
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
   * Konuşmadaki mesajları getir (E2E Decryption)
   * Messages are decrypted on retrieval if they were encrypted
   */
  getMessages: async (conversationId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    // Decrypt messages in parallel
    const decryptedMessages = await Promise.all(
      data.map(async (message) => {
        try {
          const decryptedContent = await decryptMessageIfNeeded(
            {
              content: message.content,
              nonce: message.nonce,
              sender_public_key: message.sender_public_key,
              sender_id: message.sender_id,
              metadata: message.metadata as { _senderContent?: string } | null,
            },
            user.id,
          );
          return {
            ...message,
            content: decryptedContent,
            is_encrypted: !!(message.nonce && message.sender_public_key),
          };
        } catch (decryptError) {
          logger.error('[Messages] Failed to decrypt message', {
            messageId: message.id,
            error: decryptError,
          });
          return {
            ...message,
            content: message.nonce ? '[Şifreli mesaj]' : message.content,
            is_encrypted: !!message.nonce,
          };
        }
      }),
    );

    return decryptedMessages;
  },

  /**
   * Mesaj gönder (E2E Encrypted)
   * Message is encrypted before sending if recipient has a public key
   */
  sendMessage: async (conversationId: string, content: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get conversation to find recipient
    const { data: conversation } = await supabase
      .from('conversations')
      .select('participant_ids')
      .eq('id', conversationId)
      .single();

    if (!conversation) throw new Error('Conversation not found');

    // Find recipient (the other participant)
    const recipientId = conversation.participant_ids?.find(
      (id: string) => id !== user.id,
    );

    // Try to encrypt the message
    let messageData: {
      conversation_id: string;
      sender_id: string;
      content: string;
      nonce?: string;
      sender_public_key?: string;
      metadata?: { _senderContent?: string };
    } = {
      conversation_id: conversationId,
      sender_id: user.id,
      content, // Will be replaced with encrypted content if encryption succeeds
    };

    if (recipientId) {
      const encrypted = await encryptMessage(content, recipientId);
      if (encrypted) {
        // Store encrypted content with encryption metadata
        // Also store original content in metadata for sender to read later
        messageData = {
          ...messageData,
          content: encrypted.encryptedContent,
          nonce: encrypted.nonce,
          sender_public_key: encrypted.senderPublicKey,
          metadata: { _senderContent: content },
        };
        logger.debug('[Messages] Message encrypted successfully');
      } else {
        // Fallback to unencrypted if encryption fails
        logger.warn(
          '[Messages] Sending unencrypted message (encryption unavailable)',
        );
      }
    }

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;

    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Return with original content for UI (since we just sent it)
    return { ...data, content };
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

      // Cast to proper type after null check
      const giftData = gift as {
        id: string;
        amount: number;
        currency: string;
        host_approved: boolean;
        status: string;
      };

      // Determine chat tier based on gift amount
      const chatEligibility = determineChatTier(giftData.amount || 0);

      // Tier 1: No chat allowed
      if (chatEligibility.tier === 'none') {
        throw new Error(chatEligibility.messageTR);
      }

      // Tier 2 & 3: Requires host approval (Sohbeti Başlat)
      if (chatEligibility.requiresApproval && !giftData.host_approved) {
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

  /**
   * P2 FIX: Konuşmayı arşivden çıkar
   */
  unarchiveConversation: async (conversationId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const upsertPayload = {
      conversation_id: conversationId,
      user_id: user.id,
      is_archived: false,
    } as unknown as Database['public']['Tables']['conversation_settings']['Insert'];

    const { error } = await supabase
      .from('conversation_settings')
      .upsert(upsertPayload);

    if (error) throw error;
  },
};
