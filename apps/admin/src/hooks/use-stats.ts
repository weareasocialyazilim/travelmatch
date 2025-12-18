'use client';

import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  total_users: number;
  active_users_24h: number;
  total_moments: number;
  total_matches: number;
  pending_disputes: number;
  pending_tasks: number;
  today_revenue: number;
}

async function fetchStats(): Promise<{ stats: DashboardStats }> {
  const response = await fetch('/api/stats');
  if (!response.ok) {
    throw new Error('İstatistikler yüklenemedi');
  }
  return response.json();
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRealtimeStats() {
  return useQuery({
    queryKey: ['stats', 'realtime'],
    queryFn: fetchStats,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // 30 seconds
  });
}
