'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Compliance Hook
 * Handles AML, fraud detection, and risk management
 */

export interface ComplianceStats {
  pendingSar: number;
  highRiskUsers: number;
  mediumRiskUsers: number;
  flaggedTransactions: number;
  activeAlerts: number;
  totalSar: number;
}

export interface SarReport {
  id: string;
  user_id: string;
  report_type: string;
  description: string;
  evidence: string[];
  status: 'pending' | 'investigating' | 'filed' | 'dismissed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

export interface RiskProfile {
  id: string;
  user_id: string;
  risk_score: number;
  risk_factors: string[];
  last_reviewed: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface FlaggedTransaction {
  id: string;
  transaction_id: string;
  user_id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'reviewed' | 'cleared' | 'blocked';
  created_at: string;
}

export interface ComplianceAlert {
  id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
}

export interface ComplianceData {
  stats: ComplianceStats;
  sarReports: SarReport[];
  riskProfiles: RiskProfile[];
  flaggedTransactions: FlaggedTransaction[];
  complianceAlerts: ComplianceAlert[];
  meta: {
    generatedAt: string;
    error?: string;
  };
}

async function fetchCompliance(): Promise<ComplianceData> {
  const response = await fetch('/api/compliance');
  if (!response.ok) {
    throw new Error('Failed to fetch compliance data');
  }
  return response.json();
}

export function useCompliance() {
  return useQuery({
    queryKey: ['compliance'],
    queryFn: fetchCompliance,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useComplianceStats() {
  const { data, ...rest } = useCompliance();
  return {
    stats: data?.stats,
    ...rest,
  };
}

export function useSarReports() {
  const { data, ...rest } = useCompliance();
  return {
    reports: data?.sarReports || [],
    ...rest,
  };
}

export function useRiskProfiles() {
  const { data, ...rest } = useCompliance();
  return {
    profiles: data?.riskProfiles || [],
    ...rest,
  };
}

export function useCreateSarReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: Partial<SarReport>) => {
      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sar', ...report }),
      });
      if (!response.ok) throw new Error('Failed to create SAR report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
    },
  });
}

export function useUpdateSarReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string } & Partial<SarReport>) => {
      const response = await fetch('/api/compliance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sar', ...updates }),
      });
      if (!response.ok) throw new Error('Failed to update SAR report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
    },
  });
}

export function useUpdateFlaggedTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; status: string }) => {
      const response = await fetch('/api/compliance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'flagged_transaction', ...updates }),
      });
      if (!response.ok) throw new Error('Failed to update transaction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
    },
  });
}
