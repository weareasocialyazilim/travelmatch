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

// Mock data for fallback
const MOCK_ALERT_RULES: AlertRule[] = [
  {
    id: 'fraud-spike',
    name: 'Fraud Spike',
    category: 'security',
    condition: 'fraud_count > 10 in 1 hour',
    threshold: 10,
    severity: 'critical',
    enabled: true,
  },
  {
    id: 'payment-failure',
    name: 'Payment Gateway Error Rate',
    category: 'payments',
    condition: 'error_rate > 5%',
    threshold: 5,
    severity: 'critical',
    enabled: true,
  },
  {
    id: 'escrow-expiring',
    name: 'Escrow Expiring Soon',
    category: 'operations',
    condition: 'expires_in < 2 hours',
    threshold: 2,
    severity: 'high',
    enabled: true,
  },
  {
    id: 'proof-queue',
    name: 'Proof Queue Backlog',
    category: 'operations',
    condition: 'pending_proofs > 100',
    threshold: 100,
    severity: 'medium',
    enabled: true,
  },
  {
    id: 'system-latency',
    name: 'High API Latency',
    category: 'engineering',
    condition: 'p95_latency > 500ms',
    threshold: 500,
    severity: 'high',
    enabled: true,
  },
  {
    id: 'user-spike',
    name: 'Unusual User Activity',
    category: 'security',
    condition: 'registrations > 500 in 1 hour',
    threshold: 500,
    severity: 'medium',
    enabled: true,
  },
];

const MOCK_ACTIVE_ALERTS: ActiveAlert[] = [
  {
    id: 'alert-001',
    ruleId: 'payment-failure',
    title: 'PayTR Error Rate Yükseldi',
    description: 'Son 1 saatte error rate %7.2 (threshold: %5)',
    severity: 'critical',
    category: 'payments',
    triggeredAt: new Date(Date.now() - 45 * 60000),
    acknowledgedBy: null,
    status: 'active',
    metric: { current: 7.2, threshold: 5, unit: '%' },
  },
  {
    id: 'alert-002',
    ruleId: 'escrow-expiring',
    title: '12 Escrow 2 Saat Icinde Expire Olacak',
    description: 'Toplam deger: 45,200 TL',
    severity: 'high',
    category: 'operations',
    triggeredAt: new Date(Date.now() - 30 * 60000),
    acknowledgedBy: 'Kemal Y.',
    status: 'acknowledged',
    metric: { current: 12, threshold: 0, unit: 'adet' },
  },
  {
    id: 'alert-003',
    ruleId: 'proof-queue',
    title: 'Proof Queue Birikmesi',
    description: '127 proof manual review bekliyor',
    severity: 'medium',
    category: 'operations',
    triggeredAt: new Date(Date.now() - 2 * 3600000),
    acknowledgedBy: null,
    status: 'active',
    metric: { current: 127, threshold: 100, unit: 'adet' },
  },
  {
    id: 'alert-004',
    ruleId: 'fraud-spike',
    title: 'Potansiyel Fraud Ring Tespit',
    description: '5 hesap ayni device fingerprint ile islem yapiyor',
    severity: 'critical',
    category: 'security',
    triggeredAt: new Date(Date.now() - 15 * 60000),
    acknowledgedBy: null,
    status: 'active',
    metric: { current: 5, threshold: 3, unit: 'hesap' },
  },
];

const MOCK_ALERT_HISTORY: AlertHistoryItem[] = [
  {
    id: 'hist-001',
    title: 'Database Connection Pool Exhausted',
    severity: 'critical',
    resolvedAt: new Date(Date.now() - 24 * 3600000),
    duration: '8 dakika',
    resolvedBy: 'System Auto-recovery',
  },
  {
    id: 'hist-002',
    title: 'Twilio SMS Delivery Failure',
    severity: 'high',
    resolvedAt: new Date(Date.now() - 48 * 3600000),
    duration: '25 dakika',
    resolvedBy: 'Ahmet K.',
  },
];

// Helper to parse dates from API response
function parseActiveAlerts(alerts: unknown[]): ActiveAlert[] {
  return alerts.map((alert: Record<string, unknown>) => ({
    ...alert,
    triggeredAt: new Date(alert.triggeredAt as string),
  })) as ActiveAlert[];
}

function parseAlertHistory(history: unknown[]): AlertHistoryItem[] {
  return history.map((item: Record<string, unknown>) => ({
    ...item,
    resolvedAt: new Date(item.resolvedAt as string),
  })) as AlertHistoryItem[];
}

// Fetch functions with fallback
async function fetchAlertRules(): Promise<AlertRule[]> {
  // Use mock data directly until API is implemented
  return MOCK_ALERT_RULES;
  /*
  try {
    const response = await fetch('/api/alerts/rules');
    if (!response.ok) {
      throw new Error('Failed to fetch alert rules');
    }
    const data = await response.json();
    return data.rules || data;
  } catch {
    // Return mock data on failure
    logger.warn('Using mock alert rules data');
    return MOCK_ALERT_RULES;
  }
  */
}

async function fetchActiveAlerts(): Promise<ActiveAlert[]> {
  // Use mock data directly until API is implemented
  return MOCK_ACTIVE_ALERTS;
  /*
  try {
    const response = await fetch('/api/alerts/active');
    if (!response.ok) {
      throw new Error('Failed to fetch active alerts');
    }
    const data = await response.json();
    return parseActiveAlerts(data.alerts || data);
  } catch {
    // Return mock data on failure
    logger.warn('Using mock active alerts data');
    return MOCK_ACTIVE_ALERTS;
  }
  */
}

async function fetchAlertHistory(): Promise<AlertHistoryItem[]> {
  // Use mock data directly until API is implemented
  return MOCK_ALERT_HISTORY;
  /*
  try {
    const response = await fetch('/api/alerts/history');
    if (!response.ok) {
      throw new Error('Failed to fetch alert history');
    }
    const data = await response.json();
    return parseAlertHistory(data.history || data);
  } catch {
    // Return mock data on failure
    logger.warn('Using mock alert history data');
    return MOCK_ALERT_HISTORY;
  }
  */
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
