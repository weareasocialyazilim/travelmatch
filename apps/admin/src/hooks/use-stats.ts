'use client';

import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  // Main KPIs
  totalUsers: number;
  userGrowth: number;
  activeUsers: number;
  activeGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  totalMoments: number;
  momentGrowth: number;

  // Today's summary
  todayRegistrations: number;
  activeSessions: number;
  todayRevenue: number;
  todayMoments: number;

  // Legacy fields for backward compatibility
  total_users: number;
  active_users_24h: number;
  total_moments: number;
  pending_tasks: number;
  today_revenue: number;
}

async function fetchStats(): Promise<DashboardStats> {
  const response = await fetch('/api/dashboard');
  if (!response.ok) {
    throw new Error('İstatistikler yüklenemedi');
  }
  const data = await response.json();
  // Transform new dashboard API response to match Hook types
  // The dashboard API returns unified structure, so we map it here
  return {
    totalUsers: data.users.total,
    userGrowth: data.users.growth,
    activeUsers: data.users.active,
    activeGrowth: 0, // Not in API yet
    totalRevenue: data.revenue.total,
    revenueGrowth: data.revenue.growth,
    totalMoments: data.moments.total,
    momentGrowth: data.moments.growth,
    todayRegistrations: 0, // Not in API directly
    activeSessions: 0,
    todayRevenue: 0,
    todayMoments: 0,
    // Legacy fields
    total_users: data.users.total,
    active_users_24h: data.users.active,
    total_moments: data.moments.total,
    pending_tasks: data.tasks.pending,
    today_revenue: 0,
  };
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
