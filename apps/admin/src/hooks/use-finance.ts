'use client';

import { useQuery } from '@tanstack/react-query';

interface Transaction {
  id: string;
  user_id: string;
  type: 'subscription' | 'boost' | 'refund' | 'gift';
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

interface FinanceData {
  transactions: Transaction[];
  summary: {
    totalRevenue: number;
    totalRefunds: number;
    subscriptionRevenue: number;
    boostRevenue: number;
    transactionCount: number;
  };
  total: number;
}

interface UseFinanceOptions {
  period?: '7d' | '30d' | '90d';
  type?: string;
}

export function useFinance(options: UseFinanceOptions = {}) {
  const { period = '30d', type } = options;

  return useQuery<FinanceData>({
    queryKey: ['finance', period, type],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('period', period);
      if (type) params.set('type', type);

      const response = await fetch(`/api/finance?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch finance data');
      }
      return response.json();
    },
  });
}
