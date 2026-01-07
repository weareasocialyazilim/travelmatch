'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Dispute {
  id: string;
  requester_id: string;
  responder_id: string;
  request_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'rejected';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assigned_to?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolved_by?: string;
  requester?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  responder?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface DisputesResponse {
  disputes: Dispute[];
  total: number;
  limit: number;
  offset: number;
}

interface DisputeFilters {
  status?: string;
  priority?: string;
  assigned_to?: string;
  limit?: number;
  offset?: number;
}

async function fetchDisputes(
  filters: DisputeFilters = {},
): Promise<DisputesResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.assigned_to) params.set('assigned_to', filters.assigned_to);
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.offset) params.set('offset', filters.offset.toString());

  const response = await fetch(`/api/disputes?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Anlaşmazlıklar yüklenemedi');
  }
  return response.json();
}

async function createDispute(
  data: Partial<Dispute>,
): Promise<{ dispute: Dispute }> {
  const response = await fetch('/api/disputes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Anlaşmazlık oluşturulamadı');
  }
  return response.json();
}

export function useDisputes(filters: DisputeFilters = {}) {
  return useQuery({
    queryKey: ['disputes', filters],
    queryFn: () => fetchDisputes(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDispute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    },
  });
}

async function updateDisputeStatus(
  id: string,
  status: 'resolved' | 'rejected',
  resolution?: string,
): Promise<{ dispute: Dispute }> {
  const response = await fetch(`/api/disputes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, resolution }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Anlaşmazlık güncellenemedi');
  }
  return response.json();
}

export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution?: string }) =>
      updateDisputeStatus(id, 'resolved', resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    },
  });
}

export function useRejectDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution?: string }) =>
      updateDisputeStatus(id, 'rejected', resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    },
  });
}

export type { Dispute, DisputesResponse, DisputeFilters };
