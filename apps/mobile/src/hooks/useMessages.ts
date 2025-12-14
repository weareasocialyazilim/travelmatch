/**
 * useMessages Hook
 * Real-time messaging with conversations and messages
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../config/supabase';
import { messageService } from '../services/messageService';
import { logger } from '../utils/logger';
import { ErrorHandler, retryWithErrorHandling } from '../utils/errorHandler';
import type {
  Conversation,
  Message,
  SendMessageRequest,
} from '../services/messageService';
import type { MessageType, MessageStatus } from '../types/message.types';
import { isNotNull } from '../types/guards';

interface UseMessagesReturn {
  // Conversations
  conversations: Conversation[];
  conversationsLoading: boolean;
  conversationsError: string | null;
  refreshConversations: () => Promise<void>;

  // Messages
  messages: Message[];
  messagesLoading: boolean;
  messagesError: string | null;
  loadMessages: (conversationId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;

  // Actions
  sendMessage: (data: SendMessageRequest) => Promise<Message | null>;
  markAsRead: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<boolean>;

  // State
  totalUnread: number;
  currentConversationId: string | null;
}

export const useMessages = (): UseMessagesReturn => {
  // Mount tracking ref to prevent memory leaks
  const mountedRef = useRef(true);

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(
    null,
  );

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  // Pagination
  const [messagePage, setMessagePage] = useState(1);
  const currentConversationIdRef = useRef<string | null>(null);

  // Track mounted state for cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Total unread count
  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0,
  );

  /**
   * Fetch conversations
   */
  const refreshConversations = useCallback(async () => {
    try {
      setConversationsLoading(true);
      setConversationsError(null);
      const response = await retryWithErrorHandling(
        () => messageService.getConversations(),
        { context: 'refreshConversations', maxRetries: 2 }
      );
      if (mountedRef.current) {
        setConversations(response.conversations);
      }
    } catch (error) {
      if (mountedRef.current) {
        const standardizedError = ErrorHandler.handle(error, 'refreshConversations');
        setConversationsError(standardizedError.userMessage);
      }
    } finally {
      if (mountedRef.current) {
        setConversationsLoading(false);
      }
    }
  }, []);

  /**
   * Load messages for a conversation
   */
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      currentConversationIdRef.current = conversationId;
      setMessagesLoading(true);
      setMessagesError(null);
      setMessagePage(1);

      const response = await messageService.getMessages(conversationId, {
        page: 1,
      });

      if (!mountedRef.current) return;

      setMessages(response.messages);
      setHasMoreMessages(response.hasMore);

      // Mark as read
      messageService.markAsRead(conversationId);

      if (!mountedRef.current) return;

      // Update unread count in conversations
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
        ),
      );
    } catch (error) {
      if (mountedRef.current) {
        setMessagesError(
          error instanceof Error ? error.message : 'Failed to load messages',
        );
      }
    } finally {
      if (mountedRef.current) {
        setMessagesLoading(false);
      }
    }
  }, []);

  /**
   * Load more messages (pagination)
   */
  const loadMoreMessages = useCallback(async () => {
    if (
      !currentConversationIdRef.current ||
      !hasMoreMessages ||
      messagesLoading
    )
      return;

    try {
      const nextPage = messagePage + 1;
      const response = await messageService.getMessages(
        currentConversationIdRef.current,
        { page: nextPage },
      );

      if (mountedRef.current) {
        setMessages((prev) => [...prev, ...response.messages]);
        setMessagePage(nextPage);
        setHasMoreMessages(response.hasMore);
      }
    } catch (error) {
      logger.error('Failed to load more messages:', error);
    }
  }, [messagePage, hasMoreMessages, messagesLoading]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (data: SendMessageRequest): Promise<Message | null> => {
      try {
        const newMessage = await retryWithErrorHandling(
          () => messageService.sendMessage(data),
          { 
            context: 'sendMessage', 
            maxRetries: 3,
            baseDelay: 1000
          }
        );

        if (!mountedRef.current) return newMessage;

        // Add to messages list
        setMessages((prev) => [newMessage, ...prev]);

        // Update conversation's last message
        setConversations((prev) =>
          prev
            .map((conv) =>
              conv.id === data.conversationId
                ? {
                    ...conv,
                    lastMessage: newMessage.content || 'Attachment',
                    lastMessageAt: newMessage.createdAt,
                  }
                : conv,
            )
            .sort(
              (a, b) =>
                new Date(b.lastMessageAt).getTime() -
                new Date(a.lastMessageAt).getTime(),
            ),
        );

        return newMessage;
      } catch (error) {
        const standardizedError = ErrorHandler.handle(error, 'sendMessage');
        logger.error('Failed to send message:', standardizedError);
        return null;
      }
    },
    [],
  );

  /**
   * Mark conversation as read
   */
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      messageService.markAsRead(conversationId);
      if (mountedRef.current) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
          ),
        );
      }
    } catch (error) {
      logger.error('Failed to mark as read:', error);
    }
  }, []);

  /**
   * Archive a conversation
   */
  const archiveConversation = useCallback(
    async (conversationId: string): Promise<boolean> => {
      try {
        messageService.archiveConversation(conversationId);

        if (!mountedRef.current) return true;

        setConversations((prev) =>
          prev.filter((conv) => conv.id !== conversationId),
        );

        if (currentConversationIdRef.current === conversationId) {
          setMessages([]);
          currentConversationIdRef.current = null;
        }

        return true;
      } catch (error) {
        logger.error('Failed to archive conversation:', error);
        return false;
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    void refreshConversations();
  }, [refreshConversations]);

  // Real-time subscriptions for new messages and updates
  useEffect(() => {
    if (!currentConversationIdRef.current) return;

    logger.info('useMessages', `Setting up real-time for: ${currentConversationIdRef.current}`);

    // Subscribe to new messages in current conversation
    const channel = supabase
      .channel(`messages:${currentConversationIdRef.current}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversationIdRef.current}`,
        },
        (payload) => {
          if (!mountedRef.current) return;

          logger.info('useMessages', 'New message received:', payload.new);

          const dbMessage = payload.new;
          if (!dbMessage || typeof dbMessage !== 'object') return;

          const newMessage: Message = {
            id: String(dbMessage.id || ''),
            conversationId: String(dbMessage.conversation_id || ''),
            senderId: String(dbMessage.sender_id || ''),
            content: String(dbMessage.content || ''),
            type: (dbMessage.type as MessageType) || 'text',
            imageUrl: dbMessage.image_url ? String(dbMessage.image_url) : undefined,
            location: dbMessage.location || undefined,
            createdAt: String(dbMessage.created_at || new Date().toISOString()),
            status: 'sent' as MessageStatus,
          };

          // Add message if not already in list (avoid duplicates)
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) return prev;
            return [newMessage, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversationIdRef.current}`,
        },
        (payload) => {
          if (!mountedRef.current) return;

          logger.info('useMessages', 'Message updated:', payload.new);

          const dbMessage = payload.new;
          if (!dbMessage || typeof dbMessage !== 'object') return;

          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === String(dbMessage.id || '')) {
                return {
                  ...msg,
                  content: String(dbMessage.content || msg.content),
                  readAt: dbMessage.read_at ? String(dbMessage.read_at) : undefined,
                };
              }
              return msg;
            })
          );
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.info('useMessages', 'Subscribed to message updates');
        } else if (status === 'CHANNEL_ERROR') {
          logger.error('useMessages', 'Failed to subscribe to messages');
        }
      });

    // Cleanup
    return () => {
      logger.info('useMessages', 'Unsubscribing from message updates');
      supabase.removeChannel(channel);
    };
  }, [currentConversationIdRef.current]);

  // Real-time subscription for conversation updates (new conversations, unread counts)
  useEffect(() => {
    logger.info('useMessages', 'Setting up conversations real-time');

    // Subscribe to new conversations
    const conversationsChannel = supabase
      .channel('all-conversations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          if (!mountedRef.current) return;

          logger.info('useMessages', 'New conversation created:', payload.new);

          // Refresh conversations to get the new one
          void refreshConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          if (!mountedRef.current) return;

          logger.info('useMessages', 'Conversation updated:', payload.new);

          const dbConv = payload.new;
          if (!dbConv || typeof dbConv !== 'object') return;

          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.id === String(dbConv.id || '')) {
                return {
                  ...conv,
                  lastMessage: String(dbConv.last_message_content || conv.lastMessage),
                  lastMessageAt: String(dbConv.updated_at || conv.lastMessageAt),
                };
              }
              return conv;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [refreshConversations]);

  return {
    // Conversations
    conversations,
    conversationsLoading,
    conversationsError,
    refreshConversations,

    // Messages
    messages,
    messagesLoading,
    messagesError,
    loadMessages,
    loadMoreMessages,
    hasMoreMessages,

    // Actions
    sendMessage,
    markAsRead,
    archiveConversation,

    // State
    totalUnread,
    currentConversationId: currentConversationIdRef.current,
  };
};

export default useMessages;
