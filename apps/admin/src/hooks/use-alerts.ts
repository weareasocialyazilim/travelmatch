'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logger';

// Types
export interface AlertRule {
  id: string;
  name: string;
  category: 'security' | 'payments' | 'operations' | 'engineering';
  condition: string;
  threshold: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
}

export interface AlertMetric {
  current: number;
  threshold: number;
  unit: string;
}

export interface ActiveAlert {
  id: string;
  ruleId: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'payments' | 'operations' | 'engineering';
  triggeredAt: Date;
  acknowledgedBy: string | null;
  status: 'active' | 'acknowledged' | 'resolved';
  metric: AlertMetric;
}

export interface AlertHistoryItem {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  resolvedAt: Date;
  duration: string;
  resolvedBy: string;
}

// Mock data removed

// Helper to parse dates from API response
function parseActiveAlerts(alerts: unknown[]): ActiveAlert[] {
  return (alerts as Array<Record<string, unknown>>).map((alert) => ({
    ...alert,
    triggeredAt: new Date(alert.triggeredAt as string),
  })) as ActiveAlert[];
}

function parseAlertHistory(history: unknown[]): AlertHistoryItem[] {
  return (history as Array<Record<string, unknown>>).map((item) => ({
    ...item,
    resolvedAt: new Date(item.resolvedAt as string),
  })) as AlertHistoryItem[];
}

// Fetch functions - uses real API with mock fallback
async function fetchAlertRules(): Promise<AlertRule[]> {
  const response = await fetch('/api/alerts/rules');
  if (!response.ok) {
    throw new Error('Failed to fetch alert rules');
  }
  const data = await response.json();
  return data.rules || [];
}

async function fetchActiveAlerts(): Promise<ActiveAlert[]> {
  const response = await fetch('/api/alerts/active');
  if (!response.ok) {
    throw new Error('Failed to fetch active alerts');
  }
  const data = await response.json();
  return parseActiveAlerts(data.alerts || []);
}

async function fetchAlertHistory(): Promise<AlertHistoryItem[]> {
  const response = await fetch('/api/alerts/history');
  if (!response.ok) {
    throw new Error('Failed to fetch alert history');
  }
  const data = await response.json();
  return parseAlertHistory(data.history || []);
}

// Query hooks
export function useAlertRules() {
  return useQuery<AlertRule[]>({
    queryKey: ['alerts', 'rules'],
    queryFn: fetchAlertRules,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useActiveAlerts() {
  return useQuery<ActiveAlert[]>({
    queryKey: ['alerts', 'active'],
    queryFn: fetchActiveAlerts,
    staleTime: 30 * 1000, // 30 seconds for real-time data
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useAlertHistory() {
  return useQuery<AlertHistoryItem[]>({
    queryKey: ['alerts', 'history'],
    queryFn: fetchAlertHistory,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Mutation hooks
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to acknowledge alert');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'active'] });
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to resolve alert');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['alerts', 'history'] });
    },
  });
}

export function useUpdateAlertRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ruleId,
      enabled,
    }: {
      ruleId: string;
      enabled: boolean;
    }) => {
      const response = await fetch(`/api/alerts/rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) {
        throw new Error('Failed to update alert rule');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'rules'] });
    },
  });
}
