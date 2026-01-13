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

// Mock data for development/fallback
const MOCK_STATS: DashboardStats = {
  totalUsers: 12500,
  userGrowth: 12.5,
  activeUsers: 3200,
  activeGrowth: 8.4,
  totalRevenue: 45000,
  revenueGrowth: 15.2,
  totalMoments: 8500,
  momentGrowth: 5.6,
  todayRegistrations: 45,
  activeSessions: 120,
  todayRevenue: 1200,
  todayMoments: 350,
  // Legacy fields
  total_users: 12500,
  active_users_24h: 3200,
  total_moments: 8500,
  pending_tasks: 5,
  today_revenue: 1200,
};

async function fetchStats(): Promise<DashboardStats> {
  // Use mock data until auth is sorted
  return MOCK_STATS;
  /*
  const response = await fetch('/api/stats');
  if (!response.ok) {
    throw new Error('İstatistikler yüklenemedi');
  }
  return response.json();
  */
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
