'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  display_name: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  is_verified: boolean;
  is_active: boolean;
  is_suspended: boolean;
  is_banned: boolean;
  verification_level: number;
  created_at: string;
  last_active_at?: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  limit: number;
  offset: number;
}

interface UserFilters {
  search?: string;
  status?: string;
  verified?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

interface UserDetails extends User {
  stats: {
    moments: number;
    matches: number;
    reports: number;
  };
  recent_transactions: Array<{
    id: string;
    amount: number;
    type: string;
    status: string;
    created_at: string;
  }>;
}

async function fetchUsers(filters: UserFilters = {}): Promise<UsersResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.verified) params.set('verified', filters.verified);
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.offset) params.set('offset', filters.offset.toString());
  if (filters.sort_by) params.set('sort_by', filters.sort_by);
  if (filters.sort_order) params.set('sort_order', filters.sort_order);

  const response = await fetch(`/api/users?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Kullanıcılar yüklenemedi');
  }
  return response.json();
}

async function fetchUser(id: string): Promise<{ user: UserDetails }> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error('Kullanıcı bulunamadı');
  }
  return response.json();
}

async function updateUser(
  id: string,
  data: Partial<User>
): Promise<{ user: User }> {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kullanıcı güncellenemedi');
  }
  return response.json();
}

export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
}

export function useSuspendUser() {
  const updateUser = useUpdateUser();

  return {
    ...updateUser,
    mutate: (id: string, reason?: string) =>
      updateUser.mutate({
        id,
        data: { is_suspended: true, suspension_reason: reason } as Partial<User>,
      }),
    mutateAsync: (id: string, reason?: string) =>
      updateUser.mutateAsync({
        id,
        data: { is_suspended: true, suspension_reason: reason } as Partial<User>,
      }),
  };
}

export function useBanUser() {
  const updateUser = useUpdateUser();

  return {
    ...updateUser,
    mutate: (id: string, reason?: string) =>
      updateUser.mutate({
        id,
        data: { is_banned: true, ban_reason: reason } as Partial<User>,
      }),
    mutateAsync: (id: string, reason?: string) =>
      updateUser.mutateAsync({
        id,
        data: { is_banned: true, ban_reason: reason } as Partial<User>,
      }),
  };
}

export function useVerifyUser() {
  const updateUser = useUpdateUser();

  return {
    ...updateUser,
    mutate: (id: string) =>
      updateUser.mutate({ id, data: { is_verified: true } }),
    mutateAsync: (id: string) =>
      updateUser.mutateAsync({ id, data: { is_verified: true } }),
  };
}
