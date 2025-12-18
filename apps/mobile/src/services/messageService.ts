/**
 * Message Service
 * Real-time messaging operations backed by Supabase
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { encryptionService } from './encryptionService';
import {
  conversationsService,
  messagesService as dbMessagesService,
  usersService,
} from './supabaseDbService';
import type { MessageType, MessageStatus } from '../types/message.types';

const OFFLINE_QUEUE_KEY = 'offline_message_queue';

// Types
export interface Conversation {
  id: string;
  participantId: string;
  participantName: string | null;
  participantAvatar: string | null;
  participantVerified: boolean | null;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
  momentId?: string;
  momentTitle?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'system' | 'location';
  imageUrl?: string | null;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
  createdAt: string | null;
  readAt?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'location';
  imageUrl?: string;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
}

// Message Service
export const messageService = {
  /**
   * Initialize service (setup listeners)
   */
  init: () => {
    // Listen for network restoration to process queue
    NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        void messageService.processOfflineQueue();
      }
    });
  },

  /**
   * Process offline message queue
   */
  processOfflineQueue: async () => {
    try {
      const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!queueJson) return;

      const queue: SendMessageRequest[] = JSON.parse(queueJson);
      if (queue.length === 0) return;

      logger.info(`[Message] Processing ${queue.length} offline messages`);

      const newQueue: SendMessageRequest[] = [];

      for (const msg of queue) {
        try {
          await messageService.sendMessage(msg);
        } catch (error) {
          // If still failing, keep in queue
          logger.warn('[Message] Failed to send queued message', error);
          newQueue.push(msg);
        }
      }

      if (newQueue.length > 0) {
        await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
      } else {
        await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
      }
    } catch (error) {
      logger.error('[Message] Queue processing error', error);
    }
  },

  /**
   * Get all conversations for current user
   */
  getConversations: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ConversationsResponse> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, count, error } = await conversationsService.list(user.id);
      if (error) throw error;

      // Collect all other user IDs
      const otherUserIds = new Set<string>();
      data.forEach((row) => {
        const otherId = row.participant_ids.find(
          (id: string) => id !== user.id,
        );
        if (otherId) otherUserIds.add(otherId);
      });

      // Fetch user profiles
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, avatar_url, verified')
        .in('id', Array.from(otherUserIds));

      if (usersError) {
        logger.error('Error fetching conversation participants:', usersError);
      }

      // Fetch last messages for conversations
      const lastMessageIds = data
        .map((row) => row.last_message_id)
        .filter((id): id is string => id !== null);

      let lastMessagesMap = new Map<string, { content: string }>();
      if (lastMessageIds.length > 0) {
        const { data: lastMessages } = await supabase
          .from('messages')
          .select('id, content')
          .in('id', lastMessageIds);

        if (lastMessages) {
          lastMessagesMap = new Map(
            lastMessages.map((m) => [m.id, { content: m.content }]),
          );
        }
      }

      const userMap = new Map(users?.map((u) => [u.id, u]));

      // Fetch unread counts for all conversations in batch
      const conversationIds = data.map((row) => row.id);
      let unreadCountMap = new Map<string, number>();

      if (conversationIds.length > 0) {
        const { data: unreadCounts, error: unreadError } = await supabase
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', conversationIds)
          .neq('sender_id', user.id)
          .is('read_at', null);

        if (!unreadError && unreadCounts) {
          // Count unread messages per conversation
          unreadCounts.forEach((msg) => {
            const currentCount = unreadCountMap.get(msg.conversation_id) || 0;
            unreadCountMap.set(msg.conversation_id, currentCount + 1);
          });
        }
      }

      // Map DB rows to UI Conversation type
      const conversations: Conversation[] = data.map((row) => {
        const otherUserId =
          row.participant_ids.find((id: string) => id !== user.id) || 'unknown';

        const otherUser = userMap.get(otherUserId);
        const lastMessage = row.last_message_id
          ? lastMessagesMap.get(row.last_message_id)
          : null;

        return {
          id: row.id,
          participantId: otherUserId,
          participantName: otherUser?.full_name || 'Unknown User',
          participantAvatar: otherUser?.avatar_url || '',
          participantVerified: otherUser?.verified || false,
          lastMessage: lastMessage?.content || '',
          lastMessageAt: row.updated_at,
          unreadCount: unreadCountMap.get(row.id) || 0,
          momentId: undefined, // Would need separate join
        };
      });

      return {
        conversations,
        total: count,
        page: params?.page || 1,
        pageSize: params?.pageSize || 20,
      };
    } catch (error) {
      logger.error('Get conversations error:', error);
      return { conversations: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  /**
   * Get or create a conversation with a user
   */
  getOrCreateConversation: async (userId: string, momentId?: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await conversationsService.getOrCreate([
        user.id,
        userId,
      ]);
      if (error) throw error;

      // Return a basic conversation object
      return {
        conversation: {
          id: data!.id,
          participantId: userId,
          participantName: '', // Fetched elsewhere
          participantAvatar: '',
          participantVerified: false,
          lastMessage: '',
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
          momentId,
        } as Conversation,
      };
    } catch (error) {
      logger.error('Get/Create conversation error:', error);
      throw error;
    }
  },

  /**
   * Send a message
   */
  sendMessage: async (data: SendMessageRequest): Promise<Message> => {
    try {
      // Check network status
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        logger.info('[Message] Offline, queuing message');

        // Add to offline queue
        const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        const queue = queueJson ? JSON.parse(queueJson) : [];
        queue.push(data);
        await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));

        // Return a temporary "pending" message for UI
        return {
          id: `temp-${Date.now()}`,
          conversationId: data.conversationId,
          senderId: 'current-user', // UI should handle this
          content: data.content,
          type: data.type as MessageType,
          imageUrl: data.imageUrl,
          location: data.location,
          createdAt: new Date().toISOString(),
          status: 'sending' as MessageStatus,
        };
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { data: message, error } = await dbMessagesService.send({
        conversation_id: data.conversationId,
        sender_id: user.id,
        content: data.content,
        type: data.type === 'location' ? 'text' : data.type, // Map location to text for DB
        read_at: null,
      });

      if (error) throw error;
      if (!message) throw new Error('Failed to create message');

      return {
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        content: message.content,
        type: data.type as MessageType, // Use original type for UI
        imageUrl: data.imageUrl,
        location: data.location,
        createdAt: message.created_at,
        status: 'sent' as MessageStatus,
      };
    } catch (error) {
      logger.error('Send message error:', error);
      throw error;
    }
  },

  /**
   * Get messages for a conversation
   */
  getMessages: async (
    conversationId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<MessagesResponse> => {
    try {
      const { data, count, error } = await dbMessagesService.listByConversation(
        conversationId,
        { limit: params?.pageSize || 20 },
      );

      if (error) throw error;

      // Decrypt messages
      const decryptedMessages: Message[] = await Promise.all(
        data.map(async (msg) => {
          let content = msg.content;

          // Try to decrypt if it has a nonce and is text
          const msgNonce = (msg as { nonce?: string }).nonce;
          if (msgNonce && msg.type === 'text') {
            try {
              // We need the sender's public key
              const { data: sender } = await usersService.getById(
                msg.sender_id,
              );

              // Type assertion for user with encryption keys
              interface UserWithEncryption {
                public_key?: string;
              }
              const senderWithKey = sender as UserWithEncryption | null;

              if (senderWithKey?.public_key) {
                content = await encryptionService.decrypt(
                  msg.content,
                  msgNonce,
                  senderWithKey.public_key,
                );
              }
            } catch (e) {
              logger.warn('[Message] Failed to decrypt message', msg.id);
              content = '🔒 Encrypted message';
            }
          }

          const msgType =
            msg.type === 'system'
              ? 'system'
              : msg.type === 'image'
              ? 'image'
              : 'text';

          return {
            id: msg.id,
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
            content,
            type: msgType as MessageType,
            imageUrl: undefined,
            location: undefined,
            createdAt: msg.created_at,
            readAt: msg.read_at || undefined,
            status: (msg.read_at ? 'read' : 'delivered') as MessageStatus,
          };
        }),
      );

      return {
        messages: decryptedMessages,
        total: count,
        page: params?.page || 1,
        pageSize: params?.pageSize || 20,
        hasMore: count > (params?.page || 1) * (params?.pageSize || 20),
      };
    } catch (error) {
      logger.error('[Message] Get messages error:', error);
      throw error;
    }
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (conversationId: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Find all unread messages in this conversation that weren't sent by current user
      const { data: unreadMessages, error: fetchError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (fetchError) {
        logger.error('Failed to fetch unread messages', fetchError);
        return { success: false, error: fetchError.message };
      }

      if (!unreadMessages || unreadMessages.length === 0) {
        return { success: true }; // No unread messages
      }

      // Mark them as read
      const messageIds = unreadMessages.map((m) => m.id);
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds);

      if (updateError) {
        logger.error('Failed to mark messages as read', updateError);
        return { success: false, error: updateError.message };
      }

      logger.info('Marked messages as read', {
        conversationId,
        count: messageIds.length,
      });
      return { success: true };
    } catch (error) {
      logger.error('Error marking messages as read', error as Error);
      return { success: false, error: 'Failed to mark messages as read' };
    }
  },

  /**
   * Delete a message (soft delete)
   */
  deleteMessage: async (conversationId: string, messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('conversation_id', conversationId);

      if (error) {
        logger.error('Failed to delete message', error);
        return { success: false, error: error.message };
      }

      logger.info('Message soft deleted', { messageId, conversationId });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting message', error as Error);
      return { success: false, error: 'Failed to delete message' };
    }
  },

  /**
   * Get unread count
   */
  getUnreadCount: async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        return { unreadCount: 0 };
      }

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .neq('sender_id', user.id) // Don't count own messages
        .is('read_at', null);

      if (error) {
        logger.error('Failed to get unread count', error);
        return { unreadCount: 0 };
      }

      return { unreadCount: count ?? 0 };
    } catch (error) {
      logger.error('Error getting unread count', error as Error);
      return { unreadCount: 0 };
    }
  },

  /**
   * Archive a conversation
   */
  archiveConversation: async (conversationId: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Update conversation to set archived_at timestamp
      const { error } = await supabase
        .from('conversations')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', conversationId)
        .contains('participant_ids', [user.id]);

      if (error) {
        logger.error('Failed to archive conversation', error);
        return { success: false, error: error.message };
      }

      logger.info('Archived conversation', { conversationId });
      return { success: true };
    } catch (error) {
      logger.error('Error archiving conversation', error as Error);
      return { success: false, error: 'Failed to archive conversation' };
    }
  },

  /**
   * Unarchive a conversation
   */
  unarchiveConversation: async (conversationId: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Update conversation to clear archived_at timestamp
      const { error } = await supabase
        .from('conversations')
        .update({ archived_at: null })
        .eq('id', conversationId)
        .contains('participant_ids', [user.id]);

      if (error) {
        logger.error('Failed to unarchive conversation', error);
        return { success: false, error: error.message };
      }

      logger.info('Unarchived conversation', { conversationId });
      return { success: true };
    } catch (error) {
      logger.error('Error unarchiving conversation', error as Error);
      return { success: false, error: 'Failed to unarchive conversation' };
    }
  },

  /**
   * Get archived conversations
   */
  getArchivedConversations: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ConversationsResponse> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const pageSize = params?.pageSize || 20;
      const page = params?.page || 1;
      const offset = (page - 1) * pageSize;

      // Fetch archived conversations for current user
      const { data, count, error } = await supabase
        .from('conversations')
        .select('*', { count: 'exact' })
        .contains('participant_ids', [user.id])
        .not('archived_at', 'is', null)
        .order('updated_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { conversations: [], total: 0, page, pageSize };
      }

      // Get participant details
      const otherUserIds = new Set<string>();
      data.forEach((row) => {
        const otherId = row.participant_ids.find(
          (id: string) => id !== user.id,
        );
        if (otherId) otherUserIds.add(otherId);
      });

      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, avatar_url, verified')
        .in('id', Array.from(otherUserIds));

      const userMap = new Map(users?.map((u) => [u.id, u]));

      const conversations: Conversation[] = data.map((row) => {
        const otherUserId =
          row.participant_ids.find((id: string) => id !== user.id) || 'unknown';
        const otherUser = userMap.get(otherUserId);

        return {
          id: row.id,
          participantId: otherUserId,
          participantName: otherUser?.full_name || 'Unknown User',
          participantAvatar: otherUser?.avatar_url || '',
          participantVerified: otherUser?.verified || false,
          lastMessage: '',
          lastMessageAt: row.updated_at,
          unreadCount: 0,
          momentId: undefined,
        };
      });

      return { conversations, total: count ?? 0, page, pageSize };
    } catch (error) {
      logger.error('Get archived conversations error:', error);
      return { conversations: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  /**
   * Send typing indicator
   */
  sendTypingIndicator: async (conversationId: string, isTyping: boolean) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        return { success: false };
      }

      // Broadcast typing indicator through Supabase Realtime channel
      const channel = supabase.channel(`conversation:${conversationId}`);
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: user.id,
          isTyping,
          timestamp: new Date().toISOString(),
        },
      });

      return { success: true };
    } catch (error) {
      logger.error('Error sending typing indicator', error as Error);
      return { success: false };
    }
  },
};

export default messageService;
