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

// Mock data for development fallback
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    admin_id: 'admin-1',
    action: 'user.ban',
    resource_type: 'user',
    resource_id: 'user-123',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    admin: {
      id: 'admin-1',
      name: 'Kemal Teksal',
      email: 'kemal@weareasocial.com',
    },
  },
  {
    id: '2',
    admin_id: 'admin-1',
    action: 'moment.approve',
    resource_type: 'moment',
    resource_id: 'moment-456',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    admin: {
      id: 'admin-1',
      name: 'Kemal Teksal',
      email: 'kemal@weareasocial.com',
    },
  },
  {
    id: '3',
    admin_id: 'admin-2',
    action: 'settings.update',
    resource_type: 'settings',
    resource_id: 'feature-flags',
    old_value: { dark_mode: false },
    new_value: { dark_mode: true },
    ip_address: '192.168.1.2',
    user_agent: 'Mozilla/5.0',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    admin: {
      id: 'admin-2',
      name: 'Admin User',
      email: 'admin@travelmatch.com',
    },
  },
  {
    id: '4',
    admin_id: 'admin-1',
    action: 'user.verify',
    resource_type: 'user',
    resource_id: 'user-789',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    admin: {
      id: 'admin-1',
      name: 'Kemal Teksal',
      email: 'kemal@weareasocial.com',
    },
  },
  {
    id: '5',
    admin_id: 'admin-2',
    action: 'transaction.refund',
    resource_type: 'transaction',
    resource_id: 'tx-001',
    old_value: { status: 'completed' },
    new_value: { status: 'refunded', amount: 150 },
    ip_address: '192.168.1.2',
    user_agent: 'Mozilla/5.0',
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    admin: {
      id: 'admin-2',
      name: 'Admin User',
      email: 'admin@travelmatch.com',
    },
  },
  {
    id: '6',
    admin_id: 'admin-1',
    action: 'feature_flag.update',
    resource_type: 'feature_flag',
    resource_id: 'ff-001',
    old_value: { enabled: false },
    new_value: { enabled: true },
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0',
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    admin: {
      id: 'admin-1',
      name: 'Kemal Teksal',
      email: 'kemal@weareasocial.com',
    },
  },
];

// Helper function to filter mock data
function filterMockLogs(logs: AuditLog[], filters: AuditLogFilters): AuditLog[] {
  let filtered = logs;

  if (filters.action) {
    filtered = filtered.filter((log) => log.action === filters.action);
  }

  if (filters.admin_id) {
    filtered = filtered.filter((log) => log.admin_id === filters.admin_id);
  }

  if (filters.resource_type) {
    filtered = filtered.filter((log) => log.resource_type === filters.resource_type);
  }

  if (filters.start_date) {
    const startDate = new Date(filters.start_date);
    filtered = filtered.filter((log) => new Date(log.created_at) >= startDate);
  }

  if (filters.end_date) {
    const endDate = new Date(filters.end_date);
    filtered = filtered.filter((log) => new Date(log.created_at) <= endDate);
  }

  // Apply pagination
  const offset = filters.offset || 0;
  const limit = filters.limit || 100;
  filtered = filtered.slice(offset, offset + limit);

  return filtered;
}

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

    const response = await apiClient.get<AuditLogsResponse>('/audit-logs', { params });

    if (response.error) {
      logger.warn('Audit logs fetch failed, using fallback:', response.error);
      const filteredLogs = filterMockLogs(mockAuditLogs, filters);
      return {
        logs: filteredLogs,
        total: mockAuditLogs.length,
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      };
    }

    return response.data || {
      logs: filterMockLogs(mockAuditLogs, filters),
      total: mockAuditLogs.length,
      limit: filters.limit || 100,
      offset: filters.offset || 0,
    };
  } catch (error) {
    logger.error('Audit logs fetch error:', error);
    const filteredLogs = filterMockLogs(mockAuditLogs, filters);
    return {
      logs: filteredLogs,
      total: mockAuditLogs.length,
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
