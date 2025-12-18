'use client';

import { useQuery } from '@tanstack/react-query';

interface AnalyticsMetrics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  totalMatches: number;
  totalMessages: number;
  totalRevenue: number;
  avgRevenuePerUser: number;
  conversionRate: number;
}

interface AnalyticsData {
  period: string;
  metrics: AnalyticsMetrics;
}

interface UseAnalyticsOptions {
  period?: '7d' | '30d' | '90d' | '365d';
  metric?: string;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { period = '30d', metric } = options;

  return useQuery<AnalyticsData>({
    queryKey: ['analytics', period, metric],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('period', period);
      if (metric) params.set('metric', metric);

      const response = await fetch(`/api/analytics?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return response.json();
    },
  });
}

// Helper hooks for specific metrics
export function useUserMetrics(period: '7d' | '30d' | '90d' | '365d' = '30d') {
  const { data, isLoading, error } = useAnalytics({ period });

  return {
    totalUsers: data?.metrics.totalUsers ?? 0,
    newUsers: data?.metrics.newUsers ?? 0,
    activeUsers: data?.metrics.activeUsers ?? 0,
    isLoading,
    error,
  };
}

export function useRevenueMetrics(period: '7d' | '30d' | '90d' | '365d' = '30d') {
  const { data, isLoading, error } = useAnalytics({ period });

  return {
    totalRevenue: data?.metrics.totalRevenue ?? 0,
    avgRevenuePerUser: data?.metrics.avgRevenuePerUser ?? 0,
    isLoading,
    error,
  };
}

export function useEngagementMetrics(period: '7d' | '30d' | '90d' | '365d' = '30d') {
  const { data, isLoading, error } = useAnalytics({ period });

  return {
    totalMatches: data?.metrics.totalMatches ?? 0,
    totalMessages: data?.metrics.totalMessages ?? 0,
    conversionRate: data?.metrics.conversionRate ?? 0,
    isLoading,
    error,
  };
}
