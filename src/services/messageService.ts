/**
 * Message Service
 * Real-time messaging operations
 */

import { api } from '../utils/api';

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
   * Get all conversations for current user
   */
  getConversations: async (params?: { page?: number; pageSize?: number }) => {
    return api.get<ConversationsResponse>('/conversations', { params });
  },

  /**
   * Get or create a conversation with a user
   */
  getOrCreateConversation: async (userId: string, momentId?: string) => {
    return api.post<{ conversation: Conversation }>('/conversations', {
      participantId: userId,
      momentId,
    });
  },

  /**
   * Get messages for a conversation
   */
  getMessages: async (
    conversationId: string,
    params?: { page?: number; pageSize?: number; before?: string },
  ) => {
    return api.get<MessagesResponse>(
      `/conversations/${conversationId}/messages`,
      { params },
    );
  },

  /**
   * Send a message
   */
  sendMessage: async (data: SendMessageRequest) => {
    return api.post<{ message: Message }>(
      `/conversations/${data.conversationId}/messages`,
      {
        content: data.content,
        type: data.type,
        imageUrl: data.imageUrl,
        location: data.location,
      },
    );
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (conversationId: string) => {
    return api.post<{ success: boolean }>(
      `/conversations/${conversationId}/read`,
    );
  },

  /**
   * Delete a message (soft delete)
   */
  deleteMessage: async (conversationId: string, messageId: string) => {
    return api.delete<{ success: boolean }>(
      `/conversations/${conversationId}/messages/${messageId}`,
    );
  },

  /**
   * Get unread count
   */
  getUnreadCount: async () => {
    return api.get<{ unreadCount: number }>('/conversations/unread-count');
  },

  /**
   * Archive a conversation
   */
  archiveConversation: async (conversationId: string) => {
    return api.post<{ success: boolean }>(
      `/conversations/${conversationId}/archive`,
    );
  },

  /**
   * Unarchive a conversation
   */
  unarchiveConversation: async (conversationId: string) => {
    return api.post<{ success: boolean }>(
      `/conversations/${conversationId}/unarchive`,
    );
  },

  /**
   * Get archived conversations
   */
  getArchivedConversations: async (params?: {
    page?: number;
    pageSize?: number;
  }) => {
    return api.get<ConversationsResponse>('/conversations/archived', {
      params,
    });
  },

  /**
   * Send typing indicator
   */
  sendTypingIndicator: async (conversationId: string, isTyping: boolean) => {
    return api.post<{ success: boolean }>(
      `/conversations/${conversationId}/typing`,
      { isTyping },
    );
  },
};

export default messageService;
