'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  requires_2fa: boolean;
  totp_enabled: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

interface AdminUsersResponse {
  admins: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

interface AdminUserFilters {
  search?: string;
  role?: string;
  is_active?: string;
  limit?: number;
  offset?: number;
}

async function fetchAdminUsers(
  filters: AdminUserFilters = {},
): Promise<AdminUsersResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.role) params.set('role', filters.role);
  if (filters.is_active) params.set('is_active', filters.is_active);
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.offset) params.set('offset', filters.offset.toString());

  const response = await fetch(`/api/admin-users?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Admin kullanıcıları yüklenemedi');
  }
  return response.json();
}

async function fetchAdminUser(id: string): Promise<{ admin: AdminUser }> {
  const response = await fetch(`/api/admin-users/${id}`);
  if (!response.ok) {
    throw new Error('Admin kullanıcı bulunamadı');
  }
  return response.json();
}

async function createAdminUser(
  data: Partial<AdminUser>,
): Promise<{ admin: AdminUser }> {
  const response = await fetch('/api/admin-users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Admin kullanıcı oluşturulamadı');
  }
  return response.json();
}

async function updateAdminUser(
  id: string,
  data: Partial<AdminUser>,
): Promise<{ admin: AdminUser }> {
  const response = await fetch(`/api/admin-users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Admin kullanıcı güncellenemedi');
  }
  return response.json();
}

async function deleteAdminUser(id: string): Promise<void> {
  const response = await fetch(`/api/admin-users/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Admin kullanıcı silinemedi');
  }
}

export function useAdminUsers(filters: AdminUserFilters = {}) {
  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => fetchAdminUsers(filters),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => fetchAdminUser(id),
    enabled: !!id,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminUser> }) =>
      updateAdminUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user', variables.id] });
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}
