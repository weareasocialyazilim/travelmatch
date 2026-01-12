'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { getClient } from '@/lib/supabase';

/**
 * Chat Analytics Hooks
 *
 * Provides data fetching for chat analytics dashboard with:
 * - API/Supabase fetch with mock data fallback
 * - Loading states
 * - Error handling with toast notifications
 * - Auto-refresh capabilities
 */

// =============================================================================
// Type Definitions
// =============================================================================

export interface ChatStats {
  totalConversations: number;
  activeToday: number;
  messagestoday: number;
  avgResponseTime: number;
  chatLockRate: number;
  e2eEncrypted: number;
  avgMessagesPerConvo: number;
  mediaShared: number;
}

export interface ChatLockTier {
  tier: string;
  description: string;
  conversions: number;
  chatEligible: number;
  chatUnlocked: number;
  unlockRate: number;
}

export interface ResponseTimeItem {
  range: string;
  count: number;
  percentage: number;
}

export interface HourlyMessageItem {
  hour: string;
  messages: number;
  conversations: number;
}

export interface WeeklyTrendItem {
  date: string;
  messages: number;
  conversations: number;
  unlockRate: number;
}

export interface ActiveConversation {
  id: string;
  participants: string[];
  moment: string;
  giftAmount: number;
  messages: number;
  lastActivity: string;
  status: 'active' | 'idle' | 'closed';
  tier: 'tier_1' | 'tier_2' | 'tier_3';
}

export interface FlaggedMessage {
  id: string;
  conversation: string;
  sender: string;
  reason: 'potential_spam' | 'contact_sharing' | 'inappropriate' | 'other';
  snippet: string;
  flaggedAt: string;
  status: 'pending' | 'reviewing' | 'actioned';
}

export interface ChatAnalyticsData {
  chatStats: ChatStats;
  chatLockTiers: ChatLockTier[];
  responseTimeData: ResponseTimeItem[];
  hourlyMessageData: HourlyMessageItem[];
  weeklyTrendData: WeeklyTrendItem[];
  activeConversations: ActiveConversation[];
  flaggedMessages: FlaggedMessage[];
}

// =============================================================================
// Mock Data (Fallback)
// =============================================================================

const mockChatStats: ChatStats = {
  totalConversations: 12456,
  activeToday: 3421,
  messagestoday: 23456,
  avgResponseTime: 4.2,
  chatLockRate: 67.8,
  e2eEncrypted: 100,
  avgMessagesPerConvo: 12.3,
  mediaShared: 1234,
};

const mockChatLockTiers: ChatLockTier[] = [
  {
    tier: 'Tier 1 (0-30 USD)',
    description: 'Chat yok, toplu tesekkur',
    conversions: 45678,
    chatEligible: 0,
    chatUnlocked: 0,
    unlockRate: 0,
  },
  {
    tier: 'Tier 2 (30-100 USD)',
    description: 'Host onayi ile chat',
    conversions: 12345,
    chatEligible: 12345,
    chatUnlocked: 8234,
    unlockRate: 66.7,
  },
  {
    tier: 'Tier 3 (100+ USD)',
    description: 'Premium - Host onayi ile chat',
    conversions: 5678,
    chatEligible: 5678,
    chatUnlocked: 4123,
    unlockRate: 72.6,
  },
];

const mockResponseTimeData: ResponseTimeItem[] = [
  { range: '0-1 dk', count: 2345, percentage: 32 },
  { range: '1-5 dk', count: 3456, percentage: 45 },
  { range: '5-15 dk', count: 1234, percentage: 16 },
  { range: '15-60 dk', count: 456, percentage: 5 },
  { range: '1+ saat', count: 123, percentage: 2 },
];

const mockHourlyMessageData: HourlyMessageItem[] = [
  { hour: '00', messages: 456, conversations: 89 },
  { hour: '04', messages: 234, conversations: 45 },
  { hour: '08', messages: 1234, conversations: 234 },
  { hour: '12', messages: 2345, conversations: 456 },
  { hour: '16', messages: 3456, conversations: 678 },
  { hour: '20', messages: 4567, conversations: 890 },
  { hour: '24', messages: 2345, conversations: 456 },
];

const mockWeeklyTrendData: WeeklyTrendItem[] = [
  { date: 'Pzt', messages: 18500, conversations: 2345, unlockRate: 65 },
  { date: 'Sal', messages: 21200, conversations: 2678, unlockRate: 67 },
  { date: 'Car', messages: 19800, conversations: 2456, unlockRate: 66 },
  { date: 'Per', messages: 24500, conversations: 3123, unlockRate: 68 },
  { date: 'Cum', messages: 28900, conversations: 3678, unlockRate: 70 },
  { date: 'Cmt', messages: 32400, conversations: 4123, unlockRate: 72 },
  { date: 'Paz', messages: 23456, conversations: 3421, unlockRate: 67 },
];

const mockActiveConversations: ActiveConversation[] = [
  {
    id: 'CONV-001',
    participants: ['Ahmet K.', 'Ayse M.'],
    moment: 'Kapadokya Balloon Tour',
    giftAmount: 2450,
    messages: 24,
    lastActivity: '2 dk once',
    status: 'active',
    tier: 'tier_3',
  },
  {
    id: 'CONV-002',
    participants: ['Mehmet S.', 'Zeynep A.'],
    moment: 'Bosphorus Dinner',
    giftAmount: 1800,
    messages: 18,
    lastActivity: '5 dk once',
    status: 'active',
    tier: 'tier_2',
  },
  {
    id: 'CONV-003',
    participants: ['Can B.', 'Deniz K.'],
    moment: 'Istanbul Food Tour',
    giftAmount: 950,
    messages: 12,
    lastActivity: '12 dk once',
    status: 'active',
    tier: 'tier_2',
  },
  {
    id: 'CONV-004',
    participants: ['Elif T.', 'Burak Y.'],
    moment: 'Luxury Yacht',
    giftAmount: 5600,
    messages: 45,
    lastActivity: '1 saat once',
    status: 'idle',
    tier: 'tier_3',
  },
];

const mockFlaggedMessages: FlaggedMessage[] = [
  {
    id: 'MSG-001',
    conversation: 'CONV-089',
    sender: 'User123',
    reason: 'potential_spam',
    snippet: 'Hey check out this external link...',
    flaggedAt: '10 dk once',
    status: 'pending',
  },
  {
    id: 'MSG-002',
    conversation: 'CONV-145',
    sender: 'User456',
    reason: 'contact_sharing',
    snippet: 'My phone number is +90...',
    flaggedAt: '25 dk once',
    status: 'reviewing',
  },
  {
    id: 'MSG-003',
    conversation: 'CONV-234',
    sender: 'User789',
    reason: 'inappropriate',
    snippet: '[Content removed]',
    flaggedAt: '1 saat once',
    status: 'actioned',
  },
];

// =============================================================================
// API Fetch Functions
// =============================================================================

async function fetchChatStats(): Promise<ChatStats> {
  const response = await fetch('/api/chat-analytics/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch chat stats');
  }
  return response.json();
}

async function fetchChatLockTiers(): Promise<ChatLockTier[]> {
  const response = await fetch('/api/chat-analytics/lock-tiers');
  if (!response.ok) {
    throw new Error('Failed to fetch chat lock tiers');
  }
  return response.json();
}

async function fetchResponseTimeData(): Promise<ResponseTimeItem[]> {
  const response = await fetch('/api/chat-analytics/response-time');
  if (!response.ok) {
    throw new Error('Failed to fetch response time data');
  }
  return response.json();
}

async function fetchHourlyMessageData(): Promise<HourlyMessageItem[]> {
  const response = await fetch('/api/chat-analytics/hourly-messages');
  if (!response.ok) {
    throw new Error('Failed to fetch hourly message data');
  }
  return response.json();
}

async function fetchWeeklyTrendData(): Promise<WeeklyTrendItem[]> {
  const response = await fetch('/api/chat-analytics/weekly-trend');
  if (!response.ok) {
    throw new Error('Failed to fetch weekly trend data');
  }
  return response.json();
}

async function fetchActiveConversations(): Promise<ActiveConversation[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .in('status', ['active', 'idle'])
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error('Failed to fetch active conversations');
  }

  // Transform Supabase data to expected format
  return (data || []).map((conv) => ({
    id: conv.id,
    participants: conv.participants || [],
    moment: conv.moment_title || '',
    giftAmount: conv.gift_amount || 0,
    messages: conv.message_count || 0,
    lastActivity: formatRelativeTime(conv.updated_at),
    status: conv.status as 'active' | 'idle' | 'closed',
    tier: conv.tier as 'tier_1' | 'tier_2' | 'tier_3',
  }));
}

async function fetchFlaggedMessages(): Promise<FlaggedMessage[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('flagged_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error('Failed to fetch flagged messages');
  }

  // Transform Supabase data to expected format
  return (data || []).map((msg) => ({
    id: msg.id,
    conversation: msg.conversation_id,
    sender: msg.sender_id,
    reason: msg.reason as FlaggedMessage['reason'],
    snippet: msg.snippet || '',
    flaggedAt: formatRelativeTime(msg.created_at),
    status: msg.status as 'pending' | 'reviewing' | 'actioned',
  }));
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'simdi';
  if (diffMins < 60) return `${diffMins} dk once`;
  if (diffHours < 24) return `${diffHours} saat once`;
  return `${diffDays} gun once`;
}

// =============================================================================
// Individual Hooks
// =============================================================================

export function useChatStats() {
  return useQuery<ChatStats>({
    queryKey: ['chat-analytics', 'stats'],
    queryFn: async () => {
      try {
        return await fetchChatStats();
      } catch (error) {
        toast.error('Chat istatistikleri yuklenemedi, mock veri kullaniliyor');
        return mockChatStats;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

export function useChatLockTiers() {
  return useQuery<ChatLockTier[]>({
    queryKey: ['chat-analytics', 'lock-tiers'],
    queryFn: async () => {
      try {
        return await fetchChatLockTiers();
      } catch (error) {
        toast.error('Chat lock verileri yuklenemedi, mock veri kullaniliyor');
        return mockChatLockTiers;
      }
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useResponseTimeData() {
  return useQuery<ResponseTimeItem[]>({
    queryKey: ['chat-analytics', 'response-time'],
    queryFn: async () => {
      try {
        return await fetchResponseTimeData();
      } catch (error) {
        toast.error('Yanit suresi verileri yuklenemedi, mock veri kullaniliyor');
        return mockResponseTimeData;
      }
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useHourlyMessageData() {
  return useQuery<HourlyMessageItem[]>({
    queryKey: ['chat-analytics', 'hourly-messages'],
    queryFn: async () => {
      try {
        return await fetchHourlyMessageData();
      } catch (error) {
        toast.error('Saatlik mesaj verileri yuklenemedi, mock veri kullaniliyor');
        return mockHourlyMessageData;
      }
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useWeeklyTrendData() {
  return useQuery<WeeklyTrendItem[]>({
    queryKey: ['chat-analytics', 'weekly-trend'],
    queryFn: async () => {
      try {
        return await fetchWeeklyTrendData();
      } catch (error) {
        toast.error('Haftalik trend verileri yuklenemedi, mock veri kullaniliyor');
        return mockWeeklyTrendData;
      }
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useActiveConversations() {
  return useQuery<ActiveConversation[]>({
    queryKey: ['chat-analytics', 'active-conversations'],
    queryFn: async () => {
      try {
        return await fetchActiveConversations();
      } catch (error) {
        toast.error('Aktif sohbetler yuklenemedi, mock veri kullaniliyor');
        return mockActiveConversations;
      }
    },
    staleTime: 30 * 1000, // 30 seconds (more frequent for active data)
    refetchInterval: 60 * 1000, // 1 minute
  });
}

export function useFlaggedMessages() {
  return useQuery<FlaggedMessage[]>({
    queryKey: ['chat-analytics', 'flagged-messages'],
    queryFn: async () => {
      try {
        return await fetchFlaggedMessages();
      } catch (error) {
        toast.error('Isaretlenen mesajlar yuklenemedi, mock veri kullaniliyor');
        return mockFlaggedMessages;
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

// =============================================================================
// Combined Hook
// =============================================================================

export function useChatAnalytics() {
  const queryClient = useQueryClient();

  const chatStats = useChatStats();
  const chatLockTiers = useChatLockTiers();
  const responseTimeData = useResponseTimeData();
  const hourlyMessageData = useHourlyMessageData();
  const weeklyTrendData = useWeeklyTrendData();
  const activeConversations = useActiveConversations();
  const flaggedMessages = useFlaggedMessages();

  const isLoading =
    chatStats.isLoading ||
    chatLockTiers.isLoading ||
    responseTimeData.isLoading ||
    hourlyMessageData.isLoading ||
    weeklyTrendData.isLoading ||
    activeConversations.isLoading ||
    flaggedMessages.isLoading;

  const isError =
    chatStats.isError ||
    chatLockTiers.isError ||
    responseTimeData.isError ||
    hourlyMessageData.isError ||
    weeklyTrendData.isError ||
    activeConversations.isError ||
    flaggedMessages.isError;

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['chat-analytics'] });
  }, [queryClient]);

  return {
    chatStats: chatStats.data ?? mockChatStats,
    chatLockTiers: chatLockTiers.data ?? mockChatLockTiers,
    responseTimeData: responseTimeData.data ?? mockResponseTimeData,
    hourlyMessageData: hourlyMessageData.data ?? mockHourlyMessageData,
    weeklyTrendData: weeklyTrendData.data ?? mockWeeklyTrendData,
    activeConversations: activeConversations.data ?? mockActiveConversations,
    flaggedMessages: flaggedMessages.data ?? mockFlaggedMessages,
    isLoading,
    isError,
    refresh,
  };
}
