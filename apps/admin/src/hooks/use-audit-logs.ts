'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';

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

// Mock data removed

async function fetchAuditLogs(
  filters: AuditLogFilters = {},
): Promise<AuditLogsResponse> {
  try {
    const params: Record<string, string | number | boolean | undefined> = {};

    if (filters.admin_id) params.admin_id = filters.admin_id;
    if (filters.action) params.action = filters.action;
    if (filters.resource_type) params.resource_type = filters.resource_type;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    if (filters.limit) params.limit = filters.limit;
    if (filters.offset) params.offset = filters.offset;

    const response = await apiClient.get<AuditLogsResponse>('/audit-logs', {
      params,
    });

    if (response.error) {
      // If API fails, return empty list instead of mocks
      logger.warn('Audit logs fetch failed', { error: response.error });
      return {
        logs: [],
        total: 0,
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      };
    }

    return (
      response.data || {
        logs: [],
        total: 0,
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      }
    );
  } catch (error) {
    logger.error('Audit logs fetch error:', error);
    return {
      logs: [],
      total: 0,
      limit: filters.limit || 100,
      offset: filters.offset || 0,
    };
  }
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export type { AuditLog, AuditLogsResponse, AuditLogFilters };
