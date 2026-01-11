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

// Mock data for development
const mockDisputes: Dispute[] = [
  {
    id: 'dispute-1',
    requester_id: 'user-1',
    responder_id: 'user-2',
    request_id: 'request-1',
    reason: 'scam',
    description: 'Ödeme yapıldı ancak hizmet verilmedi',
    status: 'pending',
    priority: 'high',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    requester: {
      id: 'user-1',
      display_name: 'Ahmet Yılmaz',
      avatar_url: undefined,
    },
    responder: {
      id: 'user-2',
      display_name: 'Mehmet Demir',
      avatar_url: undefined,
    },
  },
  {
    id: 'dispute-2',
    requester_id: 'user-3',
    responder_id: 'user-4',
    request_id: 'request-2',
    reason: 'harassment',
    description: 'Kullanıcı rahatsız edici mesajlar gönderiyor',
    status: 'under_review',
    priority: 'urgent',
    assigned_to: 'admin-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    requester: {
      id: 'user-3',
      display_name: 'Ayşe Kaya',
      avatar_url: undefined,
    },
    responder: {
      id: 'user-4',
      display_name: 'Fatma Şahin',
      avatar_url: undefined,
    },
  },
  {
    id: 'dispute-3',
    requester_id: 'user-5',
    responder_id: 'user-6',
    request_id: 'request-3',
    reason: 'payment',
    description: 'Para iadesi yapılmadı',
    status: 'resolved',
    priority: 'medium',
    resolution: 'İade işlemi tamamlandı',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    resolved_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    requester: {
      id: 'user-5',
      display_name: 'Ali Veli',
      avatar_url: undefined,
    },
    responder: {
      id: 'user-6',
      display_name: 'Zeynep Ak',
      avatar_url: undefined,
    },
  },
];

async function fetchDisputes(
  filters: DisputeFilters = {},
): Promise<DisputesResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.assigned_to) params.set('assigned_to', filters.assigned_to);
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.offset) params.set('offset', filters.offset.toString());

  try {
    const response = await fetch(`/api/disputes?${params.toString()}`);
    if (!response.ok) {
      // Return mock data on 401/error
      let filtered = mockDisputes;
      if (filters.status) {
        filtered = filtered.filter((d) => d.status === filters.status);
      }
      return {
        disputes: filtered,
        total: filtered.length,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      };
    }
    return response.json();
  } catch {
    // Return mock data on network error
    return {
      disputes: mockDisputes,
      total: mockDisputes.length,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    };
  }
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
