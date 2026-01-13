'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Support Tickets Hook
 * Manages support ticket data and operations
 */

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  user_id: string;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
  };
}

export interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category: string;
}

export interface SupportStats {
  open: number;
  pending: number;
  resolved: number;
  total: number;
}

export interface SupportData {
  tickets: SupportTicket[];
  stats: SupportStats;
  cannedResponses: CannedResponse[];
  meta: {
    generatedAt: string;
    error?: string;
  };
}

interface FetchSupportParams {
  status?: string;
  priority?: string;
  limit?: number;
}

async function fetchSupport(params: FetchSupportParams = {}): Promise<SupportData> {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.priority) searchParams.set('priority', params.priority);
  if (params.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`/api/support?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch support data');
  }
  return response.json();
}

export function useSupport(params: FetchSupportParams = {}) {
  return useQuery({
    queryKey: ['support', params],
    queryFn: () => fetchSupport(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
}

export function useSupportStats() {
  const { data, ...rest } = useSupport();
  return {
    stats: data?.stats,
    ...rest,
  };
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticket: Partial<SupportTicket>) => {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
      });
      if (!response.ok) throw new Error('Failed to create ticket');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support'] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string } & Partial<SupportTicket>) => {
      const response = await fetch('/api/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update ticket');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support'] });
    },
  });
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender: 'user' | 'admin';
  content: string;
  created_at: string;
  admin_id?: string;
  admin_name?: string;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      content,
      adminName,
    }: {
      ticketId: string;
      content: string;
      adminName?: string;
    }): Promise<SupportMessage> => {
      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: ticketId,
          content,
          sender: 'admin',
          admin_name: adminName || 'Destek Ekibi',
        }),
      });

      if (!response.ok) {
        // Fallback: Create a local message object for demo
        return {
          id: `msg-${Date.now()}`,
          ticket_id: ticketId,
          sender: 'admin',
          content,
          created_at: new Date().toISOString(),
          admin_name: adminName || 'Destek Ekibi',
        };
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support'] });
    },
  });
}

export function useTicketMessages(ticketId: string) {
  return useQuery({
    queryKey: ['support-messages', ticketId],
    queryFn: async (): Promise<SupportMessage[]> => {
      const response = await fetch(`/api/support/messages?ticket_id=${ticketId}`);
      if (!response.ok) {
        return [];
      }
      return response.json();
    },
    enabled: !!ticketId,
    staleTime: 10000,
    refetchInterval: 30000,
  });
}
