'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FOUNDER_DECISION_LOOP_ENABLED,
  type FounderDecision,
  type FounderDecisionStats,
  type DecisionAction,
  type DecisionItemType,
  type DecisionContextPage,
  DECISION_ACTIONS,
} from '@/config/founder-config';
import { usePermission } from './use-permission';

/**
 * Founder Decisions Hook
 *
 * Provides:
 * - useFounderDecisionStats() - Get today's stats and current focus
 * - useLogFounderDecision() - Log a new decision
 * - useFounderDecisionEnabled() - Check if feature is enabled for current user
 */

// ═══════════════════════════════════════════════════════════════════════════
// CHECK IF FEATURE IS ENABLED
// ═══════════════════════════════════════════════════════════════════════════

export function useFounderDecisionEnabled(): boolean {
  const { isSuperAdmin } = usePermission();

  // Both conditions must be true:
  // 1. Feature flag is ON
  // 2. User is super_admin
  return FOUNDER_DECISION_LOOP_ENABLED && isSuperAdmin();
}

// ═══════════════════════════════════════════════════════════════════════════
// FETCH DECISION STATS
// ═══════════════════════════════════════════════════════════════════════════

async function fetchDecisionStats(): Promise<FounderDecisionStats> {
  const response = await fetch('/api/founder-decisions');

  if (!response.ok) {
    if (response.status === 403) {
      // Feature disabled - return empty stats
      return {
        reviewedToday: 0,
        deferredToday: 0,
        currentFocus: null,
        focusSetAt: null,
      };
    }
    throw new Error('Failed to fetch decision stats');
  }

  const data = await response.json();
  return data.stats;
}

export function useFounderDecisionStats() {
  const isEnabled = useFounderDecisionEnabled();

  return useQuery({
    queryKey: ['founder-decision-stats'],
    queryFn: fetchDecisionStats,
    enabled: isEnabled, // Only fetch if feature is enabled
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
    retry: 1,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// LOG DECISION MUTATION
// ═══════════════════════════════════════════════════════════════════════════

interface LogDecisionParams {
  context_page: DecisionContextPage;
  item_type: DecisionItemType;
  item_key: string;
  action: DecisionAction;
  note?: string;
  metadata?: Record<string, unknown>;
}

async function logDecision(params: LogDecisionParams): Promise<{ id: string; created_at: string }> {
  const response = await fetch('/api/founder-decisions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to log decision');
  }

  return response.json();
}

export function useLogFounderDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logDecision,
    onSuccess: (_, variables) => {
      // Invalidate stats to refresh counts
      queryClient.invalidateQueries({ queryKey: ['founder-decision-stats'] });

      // Show success toast with action name
      const actionLabel = DECISION_ACTIONS[variables.action];
      toast.success(`${actionLabel}`, {
        description: variables.item_key,
        duration: 2000,
      });
    },
    onError: (error: Error) => {
      toast.error('İşlem başarısız', {
        description: error.message,
      });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE HOOKS FOR SPECIFIC ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function useMarkAsReviewed() {
  const mutation = useLogFounderDecision();

  return {
    ...mutation,
    markAsReviewed: (
      context_page: DecisionContextPage,
      item_type: DecisionItemType,
      item_key: string,
      note?: string
    ) => {
      mutation.mutate({
        context_page,
        item_type,
        item_key,
        action: 'reviewed',
        note,
      });
    },
  };
}

export function useMarkAsDeferred() {
  const mutation = useLogFounderDecision();

  return {
    ...mutation,
    markAsDeferred: (
      context_page: DecisionContextPage,
      item_type: DecisionItemType,
      item_key: string,
      note?: string
    ) => {
      mutation.mutate({
        context_page,
        item_type,
        item_key,
        action: 'deferred',
        note,
      });
    },
  };
}

export function useSetAsFocus() {
  const mutation = useLogFounderDecision();

  return {
    ...mutation,
    setAsFocus: (
      context_page: DecisionContextPage,
      item_key: string,
      note?: string
    ) => {
      mutation.mutate({
        context_page,
        item_type: 'focus',
        item_key,
        action: 'focused',
        note,
      });
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED HOOK FOR COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

export function useFounderDecisions() {
  const isEnabled = useFounderDecisionEnabled();
  const stats = useFounderDecisionStats();
  const logMutation = useLogFounderDecision();

  return {
    isEnabled,
    stats: stats.data,
    isLoading: stats.isLoading,
    isError: stats.isError,

    // Actions
    markAsReviewed: (
      context_page: DecisionContextPage,
      item_type: DecisionItemType,
      item_key: string,
      note?: string
    ) => {
      if (!isEnabled) return;
      logMutation.mutate({
        context_page,
        item_type,
        item_key,
        action: 'reviewed',
        note,
      });
    },

    markAsDeferred: (
      context_page: DecisionContextPage,
      item_type: DecisionItemType,
      item_key: string,
      note?: string
    ) => {
      if (!isEnabled) return;
      logMutation.mutate({
        context_page,
        item_type,
        item_key,
        action: 'deferred',
        note,
      });
    },

    setAsFocus: (
      context_page: DecisionContextPage,
      item_key: string,
      note?: string
    ) => {
      if (!isEnabled) return;
      logMutation.mutate({
        context_page,
        item_type: 'focus',
        item_key,
        action: 'focused',
        note,
      });
    },

    isPending: logMutation.isPending,
  };
}
