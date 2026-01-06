/**
 * useMessages Hook
 * Real-time messaging with conversations and messages
 * Optimized with centralized channel manager for better performance
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { messageService } from '../services/messageService';
import { logger } from '../utils/logger';
import { ErrorHandler, retryWithErrorHandling } from '../utils/errorHandler';
import { realtimeChannelManager } from '../services/realtimeChannelManager';
import type {
  Conversation,
  Message,
  SendMessageRequest,
} from '../services/messageService';
import type { MessageType, MessageStatus } from '../types/message.types';

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
        { context: 'refreshConversations', maxRetries: 2 },
      );
      if (mountedRef.current) {
        setConversations(response.conversations);
      }
    } catch (error) {
      if (mountedRef.current) {
        const standardizedError = ErrorHandler.handle(
          error,
          'refreshConversations',
        );
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

      // Mark as read (fire and forget - this is synchronous for now)
      try {
        messageService.markAsRead(conversationId);
      } catch (err: unknown) {
        logger.warn('Failed to mark conversation as read', {
          conversationId,
          error: err,
        });
      }

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
   * Send a message with optimistic UI
   * Message appears immediately with 'sending' status, then updates on success/failure
   */
  const sendMessage = useCallback(
    async (data: SendMessageRequest): Promise<Message | null> => {
      // Create optimistic message with temporary ID
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        conversationId: data.conversationId,
        senderId: 'current-user', // Will be updated with real sender
        content: data.content || '',
        type: data.type || 'text',
        metadata: null,
        readAt: null,
        imageUrl: data.imageUrl,
        location: data.location,
        createdAt: new Date().toISOString(),
        status: 'sending' as MessageStatus,
      };

      // Add optimistic message immediately (appears as "sending")
      if (mountedRef.current) {
        setMessages((prev) => [optimisticMessage, ...prev]);

        // Update conversation's last message optimistically
        setConversations((prev) =>
          prev
            .map((conv) =>
              conv.id === data.conversationId
                ? {
                    ...conv,
                    lastMessage: data.content || 'Attachment',
                    lastMessageAt: optimisticMessage.createdAt,
                  }
                : conv,
            )
            .sort((a, b) => {
              const bTime = b.lastMessageAt
                ? new Date(b.lastMessageAt).getTime()
                : 0;
              const aTime = a.lastMessageAt
                ? new Date(a.lastMessageAt).getTime()
                : 0;
              return bTime - aTime;
            }),
        );
      }

      try {
        const newMessage = await retryWithErrorHandling(
          () => messageService.sendMessage(data),
          {
            context: 'sendMessage',
            maxRetries: 3,
            baseDelay: 1000,
          },
        );

        if (!mountedRef.current) return newMessage;

        // Replace optimistic message with real message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? { ...newMessage, status: 'sent' as MessageStatus }
              : msg,
          ),
        );

        // Update conversation with real message data
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
            .sort((a, b) => {
              const bTime = b.lastMessageAt
                ? new Date(b.lastMessageAt).getTime()
                : 0;
              const aTime = a.lastMessageAt
                ? new Date(a.lastMessageAt).getTime()
                : 0;
              return bTime - aTime;
            }),
        );

        return newMessage;
      } catch (error) {
        const standardizedError = ErrorHandler.handle(error, 'sendMessage');
        logger.error('Failed to send message:', standardizedError);

        // Mark optimistic message as failed (allows retry in UI)
        if (mountedRef.current) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? { ...msg, status: 'failed' as MessageStatus }
                : msg,
            ),
          );
        }

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

  // Track current conversation for subscription
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);

  // Update active conversation when loading messages
  useEffect(() => {
    setActiveConversationId(currentConversationIdRef.current);
  }, [messages]); // Re-sync when messages change (after loadMessages)

  // Real-time subscriptions for new messages and updates
  // Using centralized channel manager for better performance
  useEffect(() => {
    if (!activeConversationId) return;

    logger.info(
      'useMessages',
      `Setting up real-time for: ${activeConversationId}`,
    );

    // Subscribe to messages using the channel manager
    // This enables channel multiplexing if multiple components subscribe to the same conversation
    interface DbMessage {
      id: string;
      conversation_id: string;
      sender_id: string;
      content: string;
      type: string;
      image_url?: string;
      location?: { lat: number; lng: number; name: string } | null;
      created_at: string;
      read_at?: string;
      [key: string]: unknown; // Index signature for Supabase realtime
    }

    const unsubscribe = realtimeChannelManager.subscribeToTable<DbMessage>(
      'messages',
      {
        filter: `conversation_id=eq.${activeConversationId}`,
        onInsert: (payload) => {
          if (!mountedRef.current) return;

          logger.info('useMessages', 'New message received:', payload.new);

          const dbMessage = payload.new as DbMessage | null;
          if (
            !dbMessage ||
            typeof dbMessage !== 'object' ||
            !('id' in dbMessage)
          )
            return;

          const newMessage: Message = {
            id: String(dbMessage.id || ''),
            conversationId: String(dbMessage.conversation_id || ''),
            senderId: String(dbMessage.sender_id || ''),
            content: String(dbMessage.content || ''),
            type: (dbMessage.type as MessageType) || 'text',
            metadata: null,
            readAt: dbMessage.read_at ? String(dbMessage.read_at) : null,
            imageUrl: dbMessage.image_url
              ? String(dbMessage.image_url)
              : undefined,
            location: dbMessage.location ?? undefined,
            createdAt: String(dbMessage.created_at || new Date().toISOString()),
            status: 'sent' as MessageStatus,
          };

          // Add message if not already in list (avoid duplicates)
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) return prev;
            return [newMessage, ...prev];
          });
        },
        onUpdate: (payload) => {
          if (!mountedRef.current) return;

          logger.info('useMessages', 'Message updated:', payload.new);

          const dbMessage = payload.new as DbMessage | null;
          if (
            !dbMessage ||
            typeof dbMessage !== 'object' ||
            !('id' in dbMessage)
          )
            return;

          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === String(dbMessage.id || '')) {
                return {
                  ...msg,
                  content: String(dbMessage.content || msg.content),
                  readAt: dbMessage.read_at ? String(dbMessage.read_at) : null,
                };
              }
              return msg;
            }),
          );
        },
      },
    );

    // Cleanup - channel manager handles the unsubscription
    return () => {
      logger.info('useMessages', 'Unsubscribing from message updates');
      unsubscribe();
    };
  }, [activeConversationId]);

  // Real-time subscription for conversation updates (new conversations, unread counts)
  // Note: For optimal performance, add user_id filter when user context is available
  useEffect(() => {
    logger.info('useMessages', 'Setting up conversations real-time');

    // Subscribe to conversation updates using channel manager
    // This provides channel multiplexing and better connection management
    interface DbConversation {
      id: string;
      last_message_content?: string;
      updated_at?: string;
      [key: string]: unknown; // Index signature for Supabase realtime
    }

    const unsubscribe = realtimeChannelManager.subscribeToTable<DbConversation>(
      'conversations',
      {
        // TODO: Add filter when user context is available: `participant_ids=cs.{${userId}}`
        onInsert: (payload) => {
          if (!mountedRef.current) return;

          logger.info('useMessages', 'New conversation created:', payload.new);

          // Refresh conversations to get the new one with full data
          void refreshConversations();
        },
        onUpdate: (payload) => {
          if (!mountedRef.current) return;

          logger.info('useMessages', 'Conversation updated:', payload.new);

          const dbConv = payload.new as DbConversation | null;
          if (!dbConv || typeof dbConv !== 'object' || !('id' in dbConv))
            return;

          // Update only if this conversation is in our list
          // (RLS will filter on the server, but we double-check client-side)
          setConversations((prev) => {
            const existingConv = prev.find(
              (conv) => conv.id === String(dbConv.id || ''),
            );
            if (!existingConv) return prev;

            return prev.map((conv) => {
              if (conv.id === String(dbConv.id || '')) {
                return {
                  ...conv,
                  lastMessage: String(
                    dbConv.last_message_content || conv.lastMessage,
                  ),
                  lastMessageAt: String(
                    dbConv.updated_at || conv.lastMessageAt,
                  ),
                };
              }
              return conv;
            });
          });
        },
      },
    );

    return () => {
      unsubscribe();
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
