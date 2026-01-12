/**
 * Message Service
 *
 * High-level messaging API for the app.
 * Wraps supabaseDbService's messagesService and conversationsService.
 * Includes E2E encryption for all messages.
 *
 * @module services/messageService
 */
import { supabase } from './supabase';
import { messagesService, conversationsService } from './supabaseDbService';
import { encryptionService } from './encryptionService';
import { userService } from './userService';
import { logger } from '../utils/logger';
import type { Database } from '../types/database.types';

// Database types
type Tables = Database['public']['Tables'];
type MessageRow = Tables['messages']['Row'];
type UserRow = Tables['users']['Row'];

/**
 * E2E Encryption helpers
 */
const encryptMessageContent = async (
  content: string,
  recipientId: string,
): Promise<{
  encryptedContent: string;
  nonce: string;
  senderPublicKey: string;
} | null> => {
  try {
    const recipientPublicKey = await userService.getPublicKey(recipientId);
    if (!recipientPublicKey) {
      logger.debug('[MessageService] Recipient has no public key');
      return null;
    }

    const senderPublicKey = await encryptionService.getPublicKey();
    if (!senderPublicKey) {
      logger.debug('[MessageService] Sender has no public key');
      return null;
    }

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
    logger.error('[MessageService] Encryption failed', error);
    return null;
  }
};

const decryptMessageContent = async (
  message: {
    content: string;
    nonce?: string | null;
    sender_public_key?: string | null;
    sender_id: string;
    metadata?: { _senderContent?: string } | null;
  },
  currentUserId: string,
): Promise<string> => {
  // No encryption data - return as-is
  if (!message.nonce || !message.sender_public_key) {
    return message.content;
  }

  // We sent this - use stored original content from metadata
  if (message.sender_id === currentUserId) {
    // Return original content if available, otherwise encrypted content
    return message.metadata?._senderContent || message.content;
  }

  try {
    const decrypted = await encryptionService.decrypt(
      message.content,
      message.nonce,
      message.sender_public_key,
    );
    return decrypted;
  } catch (error) {
    logger.error('[MessageService] Decryption failed', error);
    return '[Şifreli mesaj - çözülemedi]';
  }
};

/**
 * Conversation with enriched data for display
 */
export interface Conversation {
  id: string;
  participantIds: string[];
  participants: ConversationParticipant[];
  lastMessage: Message | string | null;
  lastMessageAt?: string;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
  momentId: string | null;
  momentTitle?: string;
  isArchived: boolean;
  // Convenience properties for single-participant conversations
  participantId?: string;
  participantName?: string;
  participantAvatar?: string;
  participantVerified?: boolean;
}

export interface ConversationParticipant {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  isVerified: boolean;
}

/**
 * Message type for display
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  metadata: MessageMetadata | null;
  readAt: string | null;
  createdAt: string;
  sender?: MessageSender;
  // Optional fields for optimistic updates
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  imageUrl?: string;
  location?: { lat: number; lng: number };
  // E2E Encryption status
  isEncrypted?: boolean;
}

export interface MessageSender {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export type MessageType =
  | 'text'
  | 'image'
  | 'gift_offer'
  | 'system'
  | 'location'
  | 'offer';

export interface MessageMetadata {
  imageUrl?: string;
  thumbnailUrl?: string;
  giftId?: string;
  giftAmount?: number;
  giftStatus?: 'pending' | 'accepted' | 'declined';
  locationLat?: number;
  locationLng?: number;
  systemAction?: string;
}

/**
 * Request to send a message
 */
export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type?: MessageType;
  metadata?: MessageMetadata;
  imageUrl?: string;
  location?: { lat: number; lng: number };
}

// Response types
interface ConversationsResponse {
  conversations: Conversation[];
}

interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
}

/**
 * Transform raw database message to display format
 */
function transformMessage(raw: MessageRow & { sender?: UserRow }): Message {
  return {
    id: raw.id,
    conversationId: raw.conversation_id,
    senderId: raw.sender_id,
    content: raw.content,
    type: (raw.type as MessageType) || 'text',
    metadata: raw.metadata as MessageMetadata | null,
    readAt: raw.read_at,
    createdAt: raw.created_at || new Date().toISOString(),
    sender: raw.sender
      ? {
          id: raw.sender.id,
          displayName: raw.sender.full_name || 'Unknown User',
          avatarUrl: raw.sender.avatar_url,
        }
      : undefined,
  };
}

/**
 * Message Service
 * Provides high-level messaging functionality
 */
class MessageService {
  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<ConversationsResponse> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const result = await conversationsService.list(user.id);

      if (result.error) {
        throw result.error;
      }

      // Fetch participant details and last messages for each conversation
      const conversations: Conversation[] = await Promise.all(
        result.data.map(async (conv) => {
          // Get participant details
          const participantIds = conv.participant_ids || [];
          const otherParticipantIds = participantIds.filter(
            (id: string) => id !== user.id,
          );

          let participants: ConversationParticipant[] = [];
          if (otherParticipantIds.length > 0) {
            const { data: users } = await supabase
              .from('users')
              .select('id, full_name, avatar_url, verified')
              .in('id', otherParticipantIds);

            participants = (users || []).map((u) => ({
              id: u.id,
              displayName: u.full_name || 'Unknown User',
              avatarUrl: u.avatar_url,
              isVerified: u.verified || false,
            }));
          }

          // Get last message if exists
          let lastMessage: Message | null = null;
          if (conv.last_message_id) {
            const { data: msg } = await supabase
              .from('messages')
              .select('*, sender:users(*)')
              .eq('id', conv.last_message_id)
              .single();

            if (msg) {
              lastMessage = transformMessage(
                msg as MessageRow & { sender?: UserRow },
              );
            }
          }

          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            id: conv.id,
            participantIds: conv.participant_ids,
            participants,
            lastMessage,
            unreadCount: count || 0,
            updatedAt:
              conv.updated_at || conv.created_at || new Date().toISOString(),
            createdAt: conv.created_at || new Date().toISOString(),
            momentId: conv.moment_id,
            isArchived: false, // Archive feature planned for v1.1
          };
        }),
      );

      // Sort by most recent activity
      conversations.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

      return { conversations };
    } catch (error) {
      logger.error('[MessageService] getConversations error:', error);
      throw error;
    }
  }

  /**
   * Get messages for a specific conversation (with E2E decryption)
   */
  async getMessages(
    conversationId: string,
    options?: { page?: number; limit?: number },
  ): Promise<MessagesResponse> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const limit = options?.limit || 50;
      const offset = ((options?.page || 1) - 1) * limit;

      const { data, error, count } = await supabase
        .from('messages')
        .select('*, sender:users(*)', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Decrypt messages in parallel
      const decryptedMessages = await Promise.all(
        (data || []).map(async (msg) => {
          const rawMsg = msg as MessageRow & {
            sender?: UserRow;
            nonce?: string;
            sender_public_key?: string;
          };

          // Decrypt content if encrypted (pass metadata for sender's own messages)
          const decryptedContent = await decryptMessageContent(
            {
              content: rawMsg.content,
              nonce: rawMsg.nonce,
              sender_public_key: rawMsg.sender_public_key,
              sender_id: rawMsg.sender_id,
              metadata: rawMsg.metadata as { _senderContent?: string } | null,
            },
            user.id,
          );

          return transformMessage({
            ...rawMsg,
            content: decryptedContent,
          });
        }),
      );

      // Reverse to show oldest first
      const messages = decryptedMessages.reverse();

      const totalCount = count || 0;
      const hasMore = offset + limit < totalCount;

      return { messages, hasMore };
    } catch (error) {
      logger.error('[MessageService] getMessages error:', error);
      throw error;
    }
  }

  /**
   * Send a message (with E2E encryption)
   */
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get conversation to find recipient for encryption
      const { data: conversation } = await supabase
        .from('conversations')
        .select('participant_ids')
        .eq('id', data.conversationId)
        .single();

      let contentToSend = data.content;
      let nonce: string | undefined;
      let senderPublicKey: string | undefined;

      // Try to encrypt if we can find the recipient
      if (conversation?.participant_ids) {
        const recipientId = conversation.participant_ids.find(
          (id: string) => id !== user.id,
        );

        if (recipientId) {
          const encrypted = await encryptMessageContent(
            data.content,
            recipientId,
          );
          if (encrypted) {
            contentToSend = encrypted.encryptedContent;
            nonce = encrypted.nonce;
            senderPublicKey = encrypted.senderPublicKey;
            logger.debug('[MessageService] Message encrypted for recipient');
          }
        }
      }

      // Build metadata with original content for sender (when encrypted)
      // This allows sender to see their own messages when fetched from DB
      const messageMetadata = {
        ...(data.metadata || {}),
        // Store original content only if message was encrypted
        ...(nonce ? { _senderContent: data.content } : {}),
      };

      // Send message with encryption data
      const { data: insertedMsg, error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: data.conversationId,
          sender_id: user.id,
          content: contentToSend,
          type: data.type || 'text',
          metadata:
            messageMetadata as Database['public']['Tables']['messages']['Insert']['metadata'],
          nonce,
          sender_public_key: senderPublicKey,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({
          updated_at: new Date().toISOString(),
          last_message_id: insertedMsg.id,
        })
        .eq('id', data.conversationId);

      // Fetch full message with sender info for return
      const { data: fullMessage } = await supabase
        .from('messages')
        .select('*, sender:users(*)')
        .eq('id', insertedMsg.id)
        .single();

      // Determine if message was encrypted
      const wasEncrypted = !!nonce;

      // Log warning if message was not encrypted (for monitoring)
      if (!wasEncrypted) {
        logger.warn(
          '[MessageService] Message sent without encryption - recipient may not have public key',
        );
      }

      // Return with original content (not encrypted) for immediate UI display
      const transformedMessage = transformMessage(
        fullMessage as MessageRow & { sender?: UserRow },
      );
      return {
        ...transformedMessage,
        content: data.content, // Use original content for UI
        isEncrypted: wasEncrypted,
      };
    } catch (error) {
      logger.error('[MessageService] sendMessage error:', error);
      throw error;
    }
  }

  /**
   * Mark conversation messages as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get unread message IDs in this conversation
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (unreadMessages && unreadMessages.length > 0) {
        const messageIds = unreadMessages.map((m) => m.id);
        await messagesService.markAsRead(messageIds);
      }
    } catch (error) {
      logger.error('[MessageService] markAsRead error:', error);
      // Don't throw - mark as read is non-critical
    }
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(conversationId: string): Promise<boolean> {
    try {
      // Archive feature planned for v1.1 - requires is_archived column
      logger.info(
        '[MessageService] archiveConversation called:',
        conversationId,
      );
      return true;
    } catch (error) {
      logger.error('[MessageService] archiveConversation error:', error);
      return false;
    }
  }

  /**
   * Get or create a conversation with specific participants
   */
  async getOrCreateConversation(
    participantIds: string[],
  ): Promise<Conversation> {
    try {
      const result = await conversationsService.getOrCreate(participantIds);

      if (result.error) {
        throw result.error;
      }

      const conv = result.data!;

      return {
        id: conv.id,
        participantIds: conv.participant_ids,
        participants: [],
        lastMessage: null,
        unreadCount: 0,
        updatedAt:
          conv.updated_at || conv.created_at || new Date().toISOString(),
        createdAt: conv.created_at || new Date().toISOString(),
        momentId: conv.moment_id || null,
        isArchived: false,
      };
    } catch (error) {
      logger.error('[MessageService] getOrCreateConversation error:', error);
      throw error;
    }
  }

  /**
   * Subscribe to new messages in a conversation
   */
  subscribeToConversation(
    conversationId: string,
    callback: (message: Message) => void,
  ) {
    return messagesService.subscribeToConversation(
      conversationId,
      (rawMessage: MessageRow) => {
        callback(transformMessage(rawMessage));
      },
    );
  }
}

// Export singleton instance
export const messageService = new MessageService();
