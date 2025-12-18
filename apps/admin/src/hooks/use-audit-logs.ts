'use client';

import { useQuery } from '@tanstack/react-query';

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  admin?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

interface AuditLogFilters {
  admin_id?: string;
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

async function fetchAuditLogs(
  filters: AuditLogFilters = {}
): Promise<AuditLogsResponse> {
  const params = new URLSearchParams();
  if (filters.admin_id) params.set('admin_id', filters.admin_id);
  if (filters.action) params.set('action', filters.action);
  if (filters.resource_type) params.set('resource_type', filters.resource_type);
  if (filters.start_date) params.set('start_date', filters.start_date);
  if (filters.end_date) params.set('end_date', filters.end_date);
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.offset) params.set('offset', filters.offset.toString());

  const response = await fetch(`/api/audit-logs?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Audit logları yüklenemedi');
  }
  return response.json();
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}
