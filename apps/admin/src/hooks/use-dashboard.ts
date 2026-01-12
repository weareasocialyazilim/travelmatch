'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { getClient } from '@/lib/supabase';

/**
 * Dashboard Data Hook
 *
 * CEO/CMO Meeting Decision: Unified hook for all dashboard data
 * Design: META's real-time data architecture + TESLA's telemetry approach
 *
 * Features:
 * - Single API call for all dashboard data
 * - Real-time subscriptions for live updates
 * - Automatic refetch on focus
 * - Smart caching with stale-while-revalidate
 */

export interface DashboardMetrics {
  totalUsers: number;
  totalMoments: number;
  totalRevenue: number;
  pendingTasks: number;
  activeUsers24h: number;
  engagementRate: number;
  userGrowth: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface SystemHealth {
  database: 'operational' | 'degraded' | 'down' | 'unknown';
  api: 'operational' | 'degraded' | 'down' | 'unknown';
  payments: 'operational' | 'degraded' | 'down' | 'unknown';
  storage: 'operational' | 'degraded' | 'down' | 'unknown';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
}

export interface PendingTask {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  created_at: string;
  assigned_to?: string;
}

export interface RecentActivity {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  charts: {
    userActivity: ChartData;
    revenue: ChartData;
  };
  systemHealth: SystemHealth;
  pendingTasksList: PendingTask[];
  recentActivities: RecentActivity[];
  meta: {
    generatedAt: string;
    cacheExpiry?: number;
    error?: string;
  };
}

async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch('/api/dashboard', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Dashboard API error: ${response.status}`);
  }

  return response.json();
}

export function useDashboard() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refetch every minute
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Manual refresh function
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  }, [queryClient]);

  return {
    ...query,
    refresh,
  };
}

/**
 * Real-time Dashboard Hook
 *
 * Subscribes to Supabase real-time changes for live updates
 * Used for critical metrics that need immediate reflection
 */
export function useRealtimeDashboard() {
  const queryClient = useQueryClient();
  const dashboard = useDashboard();

  useEffect(() => {
    const supabase = getClient();

    // Subscribe to profiles changes (new users)
    const profilesChannel = supabase
      .channel('dashboard-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
      )
      .subscribe();

    // Subscribe to moments changes
    const momentsChannel = supabase
      .channel('dashboard-moments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'moments' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
      )
      .subscribe();

    // Subscribe to payments changes (revenue)
    const paymentsChannel = supabase
      .channel('dashboard-payments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
      )
      .subscribe();

    // Subscribe to tasks changes
    const tasksChannel = supabase
      .channel('dashboard-tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(momentsChannel);
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [queryClient]);

  return dashboard;
}

/**
 * Dashboard Metrics Only Hook
 *
 * Lighter version for components that only need metrics
 */
export function useDashboardMetrics() {
  const { data, isLoading, error, refresh } = useDashboard();

  return {
    metrics: data?.metrics,
    isLoading,
    error,
    refresh,
  };
}

/**
 * System Health Hook
 *
 * For system status indicators
 */
export function useSystemHealth() {
  const { data, isLoading, error, refresh } = useDashboard();

  return {
    health: data?.systemHealth,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Pending Tasks Hook
 *
 * For task management widgets
 */
export function usePendingTasks() {
  const { data, isLoading, error, refresh } = useDashboard();

  return {
    tasks: data?.pendingTasksList || [],
    count: data?.metrics.pendingTasks || 0,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Chart Data Hook
 *
 * For analytics visualizations
 */
export function useChartData() {
  const { data, isLoading, error, refresh } = useDashboard();

  return {
    userActivity: data?.charts.userActivity,
    revenue: data?.charts.revenue,
    isLoading,
    error,
    refresh,
  };
}
