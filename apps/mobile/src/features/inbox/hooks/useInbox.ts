/**
 * TravelMatch Vibe Room - Inbox Hook
 *
 * Manages inbox state, real-time updates, and data fetching.
 * Integrates with existing message and realtime services.
 */

import { useState, useCallback, useEffect } from 'react';
import { useRealtime, useRealtimeEvent } from '@/context/RealtimeContext';
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

  // Realtime context
  const { isUserOnline } = useRealtime();

  // Track typing users
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Fetch inbox data
  const fetchInbox = useCallback(async () => {
    try {
      setError(null);

      // TODO: Replace with actual API calls
      // const [chatsResponse, requestsResponse] = await Promise.all([
      //   inboxApi.getActiveChats(),
      //   inboxApi.getRequests(),
      // ]);
      // setChats(chatsResponse);
      // setRequests(requestsResponse);

      // Simulating API delay for now
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inbox');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchInbox();
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
        // Auto-remove after 5 seconds
        setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Set(prev);
            next.delete(data.conversationId);
            return next;
          });
        }, 5000);
      } else {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.conversationId);
          return next;
        });
      }
    },
    [],
  );

  // Update chats with typing status
  const chatsWithTyping = chats.map((chat) => ({
    ...chat,
    isTyping: typingUsers.has(chat.id),
    user: {
      ...chat.user,
      isOnline: chat.user.id ? isUserOnline(chat.user.id) : false,
    },
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
