'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Feature Flags Hook
 * Manages feature flags for the application
 */

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  category: string;
  rollout_percentage: number;
  environments: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlagsStats {
  total: number;
  enabled: number;
  disabled: number;
  beta: number;
}

export interface FeatureFlagsData {
  flags: FeatureFlag[];
  groupedFlags: Record<string, FeatureFlag[]>;
  stats: FeatureFlagsStats;
  meta: {
    generatedAt: string;
    error?: string;
  };
}

async function fetchFeatureFlags(): Promise<FeatureFlagsData> {
  const response = await fetch('/api/feature-flags');
  if (!response.ok) {
    throw new Error('Failed to fetch feature flags');
  }
  return response.json();
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: fetchFeatureFlags,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useFeatureFlagsByCategory() {
  const { data, ...rest } = useFeatureFlags();
  return {
    groupedFlags: data?.groupedFlags || {},
    ...rest,
  };
}

export function useCreateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flag: Partial<FeatureFlag>) => {
      const response = await fetch('/api/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flag),
      });
      if (!response.ok) throw new Error('Failed to create flag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string } & Partial<FeatureFlag>) => {
      const response = await fetch('/api/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update flag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });
}

export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/feature-flags?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete flag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });
}

export function useToggleFeatureFlag() {
  const updateFlag = useUpdateFeatureFlag();

  return {
    ...updateFlag,
    mutate: (id: string, enabled: boolean) => {
      updateFlag.mutate({ id, enabled });
    },
    mutateAsync: (id: string, enabled: boolean) => {
      return updateFlag.mutateAsync({ id, enabled });
    },
  };
}
