/**
 * useMessages Hook
 * Real-time messaging with conversations and messages
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { messageService } from '../services/messageService';
import { logger } from '../utils/logger';
import type {
  Conversation,
  Message,
  SendMessageRequest,
} from '../services/messageService';

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
      const response = await messageService.getConversations();
      if (mountedRef.current) {
        setConversations(response.conversations);
      }
    } catch (error) {
      if (mountedRef.current) {
        setConversationsError(
          error instanceof Error
            ? error.message
            : 'Failed to load conversations',
        );
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
      await messageService.markAsRead(conversationId);

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
        const response = await messageService.sendMessage(data);
        const newMessage = response.message;

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
        logger.error('Failed to send message:', error);
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
      await messageService.markAsRead(conversationId);
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
        await messageService.archiveConversation(conversationId);

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

  // TODO: Set up real-time subscription for new messages
  // useEffect(() => {
  //   const unsubscribe = messageService.subscribeToMessages((message) => {
  //     // Handle incoming message
  //   });
  //   return () => unsubscribe();
  // }, []);

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
