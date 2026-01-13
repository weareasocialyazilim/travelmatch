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

// Mock data for development
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
    action: 'report.resolve',
    resource_type: 'report',
    resource_id: 'report-123',
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

async function fetchAuditLogs(
  filters: AuditLogFilters = {},
): Promise<AuditLogsResponse> {
  // const params = new URLSearchParams();
  // if (filters.admin_id) params.set('admin_id', filters.admin_id);
  // if (filters.action) params.set('action', filters.action);
  // if (filters.resource_type) params.set('resource_type', filters.resource_type);
  // if (filters.start_date) params.set('start_date', filters.start_date);
  // if (filters.end_date) params.set('end_date', filters.end_date);
  // if (filters.limit) params.set('limit', filters.limit.toString());
  // if (filters.offset) params.set('offset', filters.offset.toString());

  // try {
  //   const response = await fetch(`/api/audit-logs?${params.toString()}`);
  //   if (!response.ok) {
  //     // Return mock data on 401/error
  //     let filteredLogs = mockAuditLogs;
  //     if (filters.action) {
  //       filteredLogs = filteredLogs.filter(
  //         (log) => log.action === filters.action,
  //       );
  //     }
  //     return {
  //       logs: filteredLogs,
  //       total: filteredLogs.length,
  //       limit: filters.limit || 100,
  //       offset: filters.offset || 0,
  //     };
  //   }
  //   return response.json();
  // } catch {
  // Return mock data on network error
  let filteredLogs = mockAuditLogs;
  if (filters.action) {
    filteredLogs = filteredLogs.filter((log) => log.action === filters.action);
  }
  return {
    logs: filteredLogs,
    total: filteredLogs.length,
    limit: filters.limit || 100,
    offset: filters.offset || 0,
  };
  // }
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}
