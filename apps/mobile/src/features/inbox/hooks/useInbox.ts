/**
 * Lovendo Vibe Room - Inbox Hook
 *
 * Manages inbox state, real-time updates, and data fetching.
 * Integrates with existing message and realtime services.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRealtime, useRealtimeEvent } from '@/context/RealtimeContext';
import { messageService } from '@/services/messageService';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import type { InboxChat, InboxTab } from '../types/inbox.types';

interface UseInboxOptions {
  initialTab?: InboxTab;
}

interface UseInboxReturn {
  // Data
  chats: InboxChat[];
  requests: InboxChat[];
  activeTab: InboxTab;

  // State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  setActiveTab: (tab: InboxTab) => void;
  refreshInbox: () => Promise<void>;
  markAsRead: (chatId: string) => void;
  archiveChat: (chatId: string) => void;

  // Computed
  totalUnread: number;
  requestCount: number;
  hasNewRequests: boolean;
}

export const useInbox = (options: UseInboxOptions = {}): UseInboxReturn => {
  const { initialTab = 'active' } = options;

  // State
  const [chats, setChats] = useState<InboxChat[]>([]);
  const [requests, setRequests] = useState<InboxChat[]>([]);
  const [activeTab, setActiveTab] = useState<InboxTab>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Realtime context - online status removed for privacy
  const _realtime = useRealtime();

  // Track typing users
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Ref to track component mount state
  const isMountedRef = useRef(true);

  // Fetch inbox data
  const fetchInbox = useCallback(async () => {
    try {
      setError(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
        return;
      }

      // Fetch conversations from messageService
      const { conversations } = await messageService.getConversations();

      if (!isMountedRef.current) return;

      // Transform conversations to InboxChat format
      // Active chats = conversations with matched/paid/completed status
      // Requests = conversations with offer_received/offer_sent status
      const activeChats: InboxChat[] = [];
      const requestChats: InboxChat[] = [];

      for (const conv of conversations) {
        // Extract lastMessage as string
        let lastMessageStr: string = '';
        if (conv.lastMessage) {
          if (typeof conv.lastMessage === 'string') {
            lastMessageStr = conv.lastMessage;
          } else if (
            typeof conv.lastMessage === 'object' &&
            'content' in conv.lastMessage
          ) {
            lastMessageStr = (conv.lastMessage as { content: string }).content;
          }
        }

        const inboxChat: InboxChat = {
          id: conv.id,
          user: {
            id: conv.participantId || conv.participantIds?.[0] || '',
            name: conv.participantName || 'Unknown',
            avatar: conv.participantAvatar || '',
            isVerified: conv.participantVerified || false,
          },
          moment: conv.momentId
            ? {
                id: conv.momentId,
                title: conv.momentTitle || '',
                image: '',
                emoji: '✨',
              }
            : undefined,
          lastMessage: lastMessageStr,
          lastMessageAt: conv.lastMessageAt || new Date().toISOString(),
          status: 'matched', // Default status, should come from API
          unreadCount: conv.unreadCount,
        };

        // For now, put all in active chats
        // In a real app, you'd check the conversation status
        activeChats.push(inboxChat);
      }

      if (isMountedRef.current) {
        setChats(activeChats);
        setRequests(requestChats);
      }
    } catch (err) {
      logger.error('Failed to fetch inbox:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load inbox');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  // Initial fetch with cleanup
  useEffect(() => {
    isMountedRef.current = true;
    fetchInbox();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchInbox]);

  // Refresh inbox
  const refreshInbox = useCallback(async () => {
    setIsRefreshing(true);
    await fetchInbox();
  }, [fetchInbox]);

  // Mark chat as read
  const markAsRead = useCallback((chatId: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat,
      ),
    );
    setRequests((prev) =>
      prev.map((req) => (req.id === chatId ? { ...req, unreadCount: 0 } : req)),
    );
  }, []);

  // Archive chat
  const archiveChat = useCallback((chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    setRequests((prev) => prev.filter((req) => req.id !== chatId));
  }, []);

  // Listen for new messages
  useRealtimeEvent<{ conversationId: string }>(
    'message:new',
    (_data) => {
      // Refresh inbox when new message arrives
      refreshInbox();
    },
    [refreshInbox],
  );

  // Track active typing timeouts for cleanup
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Listen for typing indicators
  useRealtimeEvent<{
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }>(
    'message:typing',
    (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => new Set([...prev, data.conversationId]));

        // Clear existing timeout for this conversation
        const existingTimeout = typingTimeoutsRef.current.get(
          data.conversationId,
        );
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Auto-remove after 5 seconds
        const timeout = setTimeout(() => {
          if (isMountedRef.current) {
            setTypingUsers((prev) => {
              const next = new Set(prev);
              next.delete(data.conversationId);
              return next;
            });
          }
          typingTimeoutsRef.current.delete(data.conversationId);
        }, 5000);

        typingTimeoutsRef.current.set(data.conversationId, timeout);
      } else {
        // Clear timeout if user stopped typing
        const existingTimeout = typingTimeoutsRef.current.get(
          data.conversationId,
        );
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          typingTimeoutsRef.current.delete(data.conversationId);
        }

        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.conversationId);
          return next;
        });
      }
    },
    [],
  );

  // Cleanup typing timeouts on unmount
  useEffect(() => {
    return () => {
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
    };
  }, []);

  // Update chats with typing status
  const chatsWithTyping = chats.map((chat) => ({
    ...chat,
    isTyping: typingUsers.has(chat.id),
  }));

  // Computed values
  const totalUnread = chatsWithTyping.reduce(
    (sum, chat) => sum + chat.unreadCount,
    0,
  );
  const requestCount = requests.length;
  const hasNewRequests = requests.some((req) => req.unreadCount > 0);

  return {
    // Data
    chats: chatsWithTyping,
    requests,
    activeTab,

    // State
    isLoading,
    isRefreshing,
    error,

    // Actions
    setActiveTab,
    refreshInbox,
    markAsRead,
    archiveChat,

    // Computed
    totalUnread,
    requestCount,
    hasNewRequests,
  };
};

export default useInbox;
