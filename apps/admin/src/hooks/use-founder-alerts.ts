'use client';

import { useQuery } from '@tanstack/react-query';
import {
  FOUNDER_ALERTS_ENABLED,
  type AlertItem,
} from '@/config/founder-alerts';
import { usePermission } from './use-permission';

/**
 * Founder Alerts Hook
 *
 * Provides alert data from internal sources.
 * NO external API calls - purely internal database queries.
 *
 * Two-layer security:
 * 1. Client flag: Controls UI visibility
 * 2. Server flag: Controls API data access (checked server-side)
 */

// ═══════════════════════════════════════════════════════════════════════════
// CHECK IF FEATURE IS ENABLED
// ═══════════════════════════════════════════════════════════════════════════

export function useFounderAlertsEnabled(): boolean {
  const { isSuperAdmin } = usePermission();

  // Both conditions must be true:
  // 1. Feature flag is ON (client-side)
  // 2. User is super_admin
  return FOUNDER_ALERTS_ENABLED && isSuperAdmin();
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface AlertsResponse {
  alerts: AlertItem[];
  totalCount: number;
  fetchedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// FETCH ALERTS
// ═══════════════════════════════════════════════════════════════════════════

async function fetchAlerts(): Promise<AlertsResponse> {
  const response = await fetch('/api/founder-alerts');

  if (!response.ok) {
    if (response.status === 403) {
      // Feature disabled - return empty data
      return {
        alerts: [],
        totalCount: 0,
        fetchedAt: new Date().toISOString(),
      };
    }
    throw new Error('Failed to fetch alerts');
  }

  return response.json();
}

export function useFounderAlerts() {
  const isEnabled = useFounderAlertsEnabled();

  const queryResult = useQuery({
    queryKey: ['founder-alerts'],
    queryFn: fetchAlerts,
    enabled: isEnabled, // Only fetch if feature is enabled
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    retry: 1,
  });

  return {
    isEnabled,
    alerts: queryResult.data?.alerts || [],
    totalCount: queryResult.data?.totalCount || 0,
    fetchedAt: queryResult.data?.fetchedAt || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    refetch: queryResult.refetch,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useAlertCounts() {
  const { alerts } = useFounderAlerts();

  const errorCount = alerts.filter((a) => a.level === 'error').length;
  const warnCount = alerts.filter((a) => a.level === 'warn').length;
  const infoCount = alerts.filter((a) => a.level === 'info').length;

  return {
    error: errorCount,
    warn: warnCount,
    info: infoCount,
    total: alerts.length,
    hasErrors: errorCount > 0,
    hasWarnings: warnCount > 0,
  };
}
