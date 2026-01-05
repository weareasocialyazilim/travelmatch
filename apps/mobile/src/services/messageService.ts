/**
 * Message Service
 *
 * High-level messaging API for the app.
 * Wraps supabaseDbService's messagesService and conversationsService.
 *
 * @module services/messageService
 */
import { supabase } from './supabase';
import { messagesService, conversationsService } from './supabaseDbService';
import { logger } from '../utils/logger';
import type { Database } from '../types/database.types';

// Database types
type Tables = Database['public']['Tables'];
type MessageRow = Tables['messages']['Row'];
type ConversationRow = Tables['conversations']['Row'];
type UserRow = Tables['users']['Row'];

/**
 * Conversation with enriched data for display
 */
export interface Conversation {
  id: string;
  participantIds: string[];
  participants: ConversationParticipant[];
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
  momentId: string | null;
  isArchived: boolean;
}

export interface ConversationParticipant {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  isVerified: boolean;
  isOnline: boolean;
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
  | 'location';

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
          displayName: raw.sender.display_name || 'Unknown User',
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
              .select('id, display_name, avatar_url, is_verified')
              .in('id', otherParticipantIds);

            participants = (users || []).map((u: UserRow) => ({
              id: u.id,
              displayName: u.display_name || 'Unknown User',
              avatarUrl: u.avatar_url,
              isVerified: u.is_verified || false,
              isOnline: false, // TODO: Implement online status
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
            isArchived: false, // TODO: Implement archive status
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
   * Get messages for a specific conversation
   */
  async getMessages(
    conversationId: string,
    options?: { page?: number; limit?: number },
  ): Promise<MessagesResponse> {
    try {
      const limit = options?.limit || 50;
      const offset = ((options?.page || 1) - 1) * limit;

      const { data, error, count } = await supabase
        .from('messages')
        .select('*, sender:users(*)', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const messages = (data || [])
        .map((msg) =>
          transformMessage(msg as MessageRow & { sender?: UserRow }),
        )
        .reverse(); // Reverse to show oldest first

      const totalCount = count || 0;
      const hasMore = offset + limit < totalCount;

      return { messages, hasMore };
    } catch (error) {
      logger.error('[MessageService] getMessages error:', error);
      throw error;
    }
  }

  /**
   * Send a message
   */
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const result = await messagesService.send({
        conversation_id: data.conversationId,
        sender_id: user.id,
        content: data.content,
        type: data.type || 'text',
        metadata:
          data.metadata as Database['public']['Tables']['messages']['Insert']['metadata'],
      });

      if (result.error) {
        throw result.error;
      }

      // Fetch full message with sender info
      const { data: fullMessage } = await supabase
        .from('messages')
        .select('*, sender:users(*)')
        .eq('id', result.data!.id)
        .single();

      return transformMessage(fullMessage as MessageRow & { sender?: UserRow });
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
      // TODO: Implement conversation archival
      // For now, we'll just log and return true
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
