'use client';

/**
 * Escrow Operations Hook
 *
 * P2 FIX: Created hook to replace mock data in escrow-operations page
 *
 * Provides real-time escrow and payment statistics from the API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logger';

// Types
interface EscrowStats {
  totalEscrow: number;
  pendingRelease: number;
  releasedToday: number;
  refundedToday: number;
  activeTransactions: number;
  avgEscrowDuration: number;
  disputeRate: number;
  successRate: number;
}

interface PaymentStats {
  todayVolume: number;
  todayTransactions: number;
  avgTransactionValue: number;
  successRate: number;
  failedTransactions: number;
  pendingKYC: number;
  subscriptionRevenue: number;
  giftRevenue: number;
}

interface EscrowStatsResponse {
  escrow: EscrowStats;
  payment: PaymentStats;
}

interface EscrowTransaction {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  currency: string;
  moment: string;
  status: string;
  proofStatus: string;
  createdAt: string;
  expiresAt: string;
  daysRemaining: number;
}

interface EscrowListResponse {
  escrowTransactions: EscrowTransaction[];
  summary: {
    total: number;
    pending: number;
    released: number;
    refunded: number;
    expired: number;
    totalAmount: number;
    pendingAmount: number;
  };
  total: number;
  limit: number;
  offset: number;
}

interface EscrowFilters {
  status?: string;
  userId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// Fetch functions
async function fetchEscrowStats(): Promise<EscrowStatsResponse> {
  const response = await fetch('/api/escrow/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch escrow stats');
  }
  return response.json();
}

async function fetchEscrows(
  filters: EscrowFilters = {},
): Promise<EscrowListResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.userId) params.set('user_id', filters.userId);
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.offset) params.set('offset', filters.offset.toString());

  const response = await fetch(`/api/escrow?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch escrows');
  }
  return response.json();
}

async function performEscrowAction(
  escrowId: string,
  action: 'release' | 'refund' | 'extend',
  reason?: string,
): Promise<{ escrow: EscrowTransaction; message: string }> {
  // Audit logging: Log admin action before performing
  const auditLog = {
    escrow_id: escrowId,
    action,
    reason,
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch('/api/admin/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'escrow_action',
        ...auditLog,
      }),
    });
  } catch (auditError) {
    // Log but don't block the action
    logger.error('[Admin] Failed to log escrow action audit:', auditError);
  }

  const response = await fetch('/api/escrow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ escrow_id: escrowId, action, reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Escrow işlemi başarısız');
  }

  return response.json();
}

// Hooks
export function useEscrowStats() {
  return useQuery({
    queryKey: ['escrow', 'stats'],
    queryFn: fetchEscrowStats,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useEscrows(filters: EscrowFilters = {}) {
  return useQuery({
    queryKey: ['escrow', 'list', filters],
    queryFn: () => fetchEscrows(filters),
    staleTime: 30 * 1000,
  });
}

export function useEscrowAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      escrowId,
      action,
      reason,
    }: {
      escrowId: string;
      action: 'release' | 'refund' | 'extend';
      reason?: string;
    }) => performEscrowAction(escrowId, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrow'] });
    },
  });
}

export function useReleaseEscrow() {
  const action = useEscrowAction();

  return {
    ...action,
    mutate: (escrowId: string, reason?: string) =>
      action.mutate({ escrowId, action: 'release', reason }),
    mutateAsync: (escrowId: string, reason?: string) =>
      action.mutateAsync({ escrowId, action: 'release', reason }),
  };
}

export function useRefundEscrow() {
  const action = useEscrowAction();

  return {
    ...action,
    mutate: (escrowId: string, reason?: string) =>
      action.mutate({ escrowId, action: 'refund', reason }),
    mutateAsync: (escrowId: string, reason?: string) =>
      action.mutateAsync({ escrowId, action: 'refund', reason }),
  };
}

export function useExtendEscrow() {
  const action = useEscrowAction();

  return {
    ...action,
    mutate: (escrowId: string, reason?: string) =>
      action.mutate({ escrowId, action: 'extend', reason }),
    mutateAsync: (escrowId: string, reason?: string) =>
      action.mutateAsync({ escrowId, action: 'extend', reason }),
  };
}
