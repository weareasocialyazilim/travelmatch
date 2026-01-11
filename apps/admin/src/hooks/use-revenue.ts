'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Revenue Data Hook
 * Fetches revenue metrics, charts, and payment data
 */

export interface RevenueOverview {
  totalRevenue: number;
  mrr: number;
  arr: number;
  growthRate: number;
  activeSubscriptions: number;
  avgSubscriptionValue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface RevenueByProduct {
  name: string;
  value: number;
  color: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  created_at: string;
  user_id: string;
}

export interface RevenueData {
  overview: RevenueOverview;
  monthlyRevenue: MonthlyRevenue[];
  revenueByProduct: RevenueByProduct[];
  recentPayments: Payment[];
  meta: {
    generatedAt: string;
    error?: string;
  };
}

async function fetchRevenue(): Promise<RevenueData> {
  const response = await fetch('/api/revenue');
  if (!response.ok) {
    throw new Error('Failed to fetch revenue data');
  }
  return response.json();
}

export function useRevenue() {
  return useQuery({
    queryKey: ['revenue'],
    queryFn: fetchRevenue,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRevenueOverview() {
  const { data, ...rest } = useRevenue();
  return {
    overview: data?.overview,
    ...rest,
  };
}

export function useRevenueCharts() {
  const { data, ...rest } = useRevenue();
  return {
    monthlyRevenue: data?.monthlyRevenue || [],
    revenueByProduct: data?.revenueByProduct || [],
    ...rest,
  };
}
