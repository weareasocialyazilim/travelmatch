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
  participantName: string;
  participantAvatar: string;
  participantVerified: boolean;
  lastMessage: string;
  lastMessageAt: string;
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
  imageUrl?: string;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
  createdAt: string;
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
        .select('id, name, avatar, is_verified')
        .in('id', Array.from(otherUserIds));

      if (usersError) {
        logger.error('Error fetching conversation participants:', usersError);
      }

      const userMap = new Map(users?.map((u) => [u.id, u]));

      // Map DB rows to UI Conversation type
      const conversations: Conversation[] = data.map((row) => {
        const otherUserId =
          row.participant_ids.find((id: string) => id !== user.id) || 'unknown';

        const otherUser = userMap.get(otherUserId);

        return {
          id: row.id,
          participantId: otherUserId,
          participantName: otherUser?.name || 'Unknown User',
          participantAvatar: otherUser?.avatar || '',
          participantVerified: otherUser?.is_verified || false,
          lastMessage: row.last_message?.content || '',
          lastMessageAt: row.updated_at,
          unreadCount: 0, // Needs calculation
          momentId: row.moment_id,
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

      const { data: message, error } = await dbMessagesService.create({
        conversation_id: data.conversationId,
        sender_id: user.id,
        content: data.content,
        type: data.type,
        image_url: data.imageUrl,
        location: data.location,
      });

      if (error) throw error;

      return {
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        content: message.content,
        type: message.type as MessageType,
        imageUrl: message.image_url,
        location: message.location,
        createdAt: message.created_at,
        status: 'sent' as MessageStatus,
      };
    } catch (error) {
      logger.error('Send message error:', error);
      throw error;
    }
  },
  getMessages: async (
    conversationId: string,
    params?: { page?: number; pageSize?: number; before?: string },
  ): Promise<MessagesResponse> => {
    try {
      const { data, count, error } = await dbMessagesService.listByConversation(
        conversationId,
        {
          limit: params?.pageSize,
          before: params?.before,
        },
      );
      if (error) throw error;

      const messages: Message[] = data.map((row) => ({
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        content: row.content,
        type: 'text', // Default for now
        createdAt: row.created_at,
        readAt: row.read_at,
        status: row.read_at ? 'read' : 'delivered',
      }));

      return {
        messages,
        total: count,
        page: params?.page || 1,
        pageSize: params?.pageSize || 20,
        hasMore: data.length === (params?.pageSize || 20),
      };
    } catch (error) {
      logger.error('Get messages error:', error);
      return { messages: [], total: 0, page: 1, pageSize: 20, hasMore: false };
    }
  },

  /**
   * Send a message
   */
  sendMessage: async (data: SendMessageRequest): Promise<Message> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get conversation to find recipient
      const { data: conversation } = await conversationsService.getById(
        data.conversationId,
      );
      if (!conversation) throw new Error('Conversation not found');

      const recipientId = conversation.participant_ids.find(
        (id: string) => id !== user.id,
      );
      if (!recipientId) throw new Error('Recipient not found');

      // Get recipient's public key
      const { data: recipient } = await usersService.getById(recipientId);
      // @ts-ignore
      const recipientPublicKey = recipient?.public_key;

      let encryptedContent = data.content;
      let nonce = null;

      // Encrypt if recipient has a public key and it's a text message
      if (recipientPublicKey && data.type === 'text') {
        const encrypted = await encryptionService.encrypt(
          data.content,
          recipientPublicKey,
        );
        encryptedContent = encrypted.message;
        nonce = encrypted.nonce;
      }

      const { data: message, error } = await dbMessagesService.create({
        conversation_id: data.conversationId,
        sender_id: user.id,
        content: encryptedContent,
        // @ts-ignore
        nonce: nonce,
        type: data.type,
        metadata: {
          imageUrl: data.imageUrl,
          location: data.location,
        },
      });

      if (error) throw error;
      if (!message) throw new Error('Failed to create message');

      return {
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        content: data.content, // Return original content for UI
        type: message.type as MessageType,
        imageUrl: message.metadata?.imageUrl,
        location: message.metadata?.location,
        createdAt: message.created_at,
        status: 'sent' as MessageStatus,
      };
    } catch (error) {
      logger.error('[Message] Send message error:', error);
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
      const { data, count, error } = await dbMessagesService.list(
        conversationId,
        params?.page || 1,
        params?.pageSize || 20,
      );

      if (error) throw error;

      // Decrypt messages
      const decryptedMessages = await Promise.all(
        data.map(async (msg) => {
          let content = msg.content;

          // Try to decrypt if it has a nonce and is text
          if (msg.nonce && msg.type === 'text') {
            try {
              // We need the sender's public key
              const { data: sender } = await usersService.getById(
                msg.sender_id,
              );
              // @ts-ignore
              if (sender?.public_key) {
                // @ts-ignore
                content = await encryptionService.decrypt(
                  msg.content,
                  msg.nonce,
                  // @ts-ignore
                  sender.public_key,
                );
              }
            } catch (e) {
              logger.warn('[Message] Failed to decrypt message', msg.id);
              content = '🔒 Encrypted message';
            }
          }

          return {
            id: msg.id,
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
            content,
            type: msg.type,
            imageUrl: msg.metadata?.imageUrl,
            location: msg.metadata?.location,
            createdAt: msg.created_at,
            readAt: msg.read_at,
            status: msg.read_at ? 'read' : 'delivered',
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
  markAsRead: (_conversationId: string) => {
    // In a real app, you'd find unread messages in this conversation and mark them
    // For now, we'll just return success as the DB service requires message IDs
    return { success: true };
  },

  /**
   * Delete a message (soft delete)
   */
  deleteMessage: (_conversationId: string, _messageId: string) => {
    // TODO: Implement soft delete in DB service
    return { success: true };
  },

  /**
   * Get unread count
   */
  getUnreadCount: () => {
    // TODO: Implement unread count query
    return { unreadCount: 0 };
  },

  /**
   * Archive a conversation
   */
  archiveConversation: (_conversationId: string) => {
    return { success: true };
  },

  /**
   * Unarchive a conversation
   */
  unarchiveConversation: (_conversationId: string) => {
    return { success: true };
  },

  /**
   * Get archived conversations
   */
  getArchivedConversations: (_params?: {
    page?: number;
    pageSize?: number;
  }) => {
    return { conversations: [], total: 0, page: 1, pageSize: 20 };
  },

  /**
   * Send typing indicator
   */
  sendTypingIndicator: (_conversationId: string, _isTyping: boolean) => {
    // Real-time typing indicators usually go through Supabase Realtime channels directly
    return { success: true };
  },
};

export default messageService;
