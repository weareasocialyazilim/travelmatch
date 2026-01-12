'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getClient } from '@/lib/supabase';

/**
 * Feature Flags Hook
 * Manages feature flags for the application
 * Fetches from Supabase via API, falls back to mock data if API fails
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
    isMockData?: boolean;
  };
}

// Mock data for fallback when API fails
const mockFlags: FeatureFlag[] = [
  {
    id: 'ff_1',
    name: 'Dark Mode',
    description: 'Karanlik tema ozelligini etkinlestirir',
    enabled: true,
    rollout_percentage: 100,
    environments: ['production'],
    category: 'feature',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-12-18T08:00:00Z',
  },
  {
    id: 'ff_2',
    name: 'Yeni Esleme Algoritmasi',
    description: 'ML tabanli gelismis esleme algoritmasi',
    enabled: true,
    rollout_percentage: 25,
    environments: ['production'],
    category: 'experiment',
    created_at: '2024-11-01T10:00:00Z',
    updated_at: '2024-12-17T14:00:00Z',
  },
  {
    id: 'ff_3',
    name: 'Video Gorusme',
    description: 'Uygulama ici video gorusme ozelligi',
    enabled: false,
    rollout_percentage: 0,
    environments: ['staging'],
    category: 'feature',
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2024-12-15T10:00:00Z',
  },
  {
    id: 'ff_4',
    name: 'Bakim Modu',
    description: 'Acil durumlarda tum sistemi bakim moduna alir',
    enabled: false,
    rollout_percentage: 0,
    environments: ['production'],
    category: 'kill_switch',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-06-15T10:00:00Z',
  },
  {
    id: 'ff_5',
    name: 'Odeme Sistemi Durdur',
    description: 'Acil durumlarda odeme sistemini devre disi birakir',
    enabled: false,
    rollout_percentage: 0,
    environments: ['production'],
    category: 'kill_switch',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z',
  },
  {
    id: 'ff_6',
    name: 'Super Like',
    description: 'Gunluk super like ozelligi',
    enabled: true,
    rollout_percentage: 100,
    environments: ['production'],
    category: 'feature',
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'ff_7',
    name: 'AI Biyografi Onerileri',
    description: 'Yapay zeka destekli profil biyografisi onerileri',
    enabled: true,
    rollout_percentage: 50,
    environments: ['production'],
    category: 'experiment',
    created_at: '2024-10-01T10:00:00Z',
    updated_at: '2024-12-10T10:00:00Z',
  },
  {
    id: 'ff_8',
    name: 'Siki Rate Limiting',
    description: 'API isteklerinde siki rate limiting uygular',
    enabled: true,
    rollout_percentage: 100,
    environments: ['production'],
    category: 'operational',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-12-05T10:00:00Z',
  },
];

function generateMockData(): FeatureFlagsData {
  const groupedFlags = mockFlags.reduce(
    (acc, flag) => {
      const category = flag.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(flag);
      return acc;
    },
    {} as Record<string, FeatureFlag[]>,
  );

  const totalFlags = mockFlags.length;
  const enabledFlags = mockFlags.filter((f) => f.enabled).length;
  const betaFlags = mockFlags.filter(
    (f) => f.rollout_percentage < 100 && f.rollout_percentage > 0,
  ).length;

  return {
    flags: mockFlags,
    groupedFlags,
    stats: {
      total: totalFlags,
      enabled: enabledFlags,
      disabled: totalFlags - enabledFlags,
      beta: betaFlags,
    },
    meta: {
      generatedAt: new Date().toISOString(),
      isMockData: true,
    },
  };
}

async function fetchFeatureFlagsFromSupabase(): Promise<FeatureFlagsData> {
  try {
    const supabase = getClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: flags, error } = await (supabase.from('feature_flags') as any)
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    if (!flags || flags.length === 0) {
      // No data in database, return mock data
      return generateMockData();
    }

    // Group flags by category
    const groupedFlags = flags.reduce(
      (acc: Record<string, FeatureFlag[]>, flag: FeatureFlag) => {
        const category = flag.category || 'general';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(flag);
        return acc;
      },
      {} as Record<string, FeatureFlag[]>,
    );

    // Calculate stats
    const totalFlags = flags.length;
    const enabledFlags = flags.filter((f: FeatureFlag) => f.enabled).length;
    const betaFlags = flags.filter(
      (f: FeatureFlag) =>
        f.rollout_percentage < 100 && f.rollout_percentage > 0,
    ).length;

    return {
      flags,
      groupedFlags,
      stats: {
        total: totalFlags,
        enabled: enabledFlags,
        disabled: totalFlags - enabledFlags,
        beta: betaFlags,
      },
      meta: {
        generatedAt: new Date().toISOString(),
        isMockData: false,
      },
    };
  } catch {
    // If Supabase fails, try API route
    return fetchFeatureFlagsFromAPI();
  }
}

async function fetchFeatureFlagsFromAPI(): Promise<FeatureFlagsData> {
  try {
    const response = await fetch('/api/feature-flags');

    if (!response.ok) {
      throw new Error('Failed to fetch feature flags from API');
    }

    const data = await response.json();

    // If API returns empty data, use mock data
    if (!data.flags || data.flags.length === 0) {
      return generateMockData();
    }

    return {
      ...data,
      meta: {
        ...data.meta,
        isMockData: false,
      },
    };
  } catch {
    // If API fails, return mock data
    return generateMockData();
  }
}

async function fetchFeatureFlags(): Promise<FeatureFlagsData> {
  // Try Supabase first (direct client), then API, then mock data
  try {
    return await fetchFeatureFlagsFromSupabase();
  } catch {
    try {
      return await fetchFeatureFlagsFromAPI();
    } catch {
      return generateMockData();
    }
  }
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: fetchFeatureFlags,
    staleTime: 60 * 1000, // 1 minute
    retry: 1, // Only retry once before falling back to mock data
    retryDelay: 1000,
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
      // Try direct Supabase first
      try {
        const supabase = getClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('feature_flags') as any)
          .insert({
            name: flag.name,
            description: flag.description,
            enabled: flag.enabled ?? false,
            category: flag.category || 'general',
            rollout_percentage: flag.rollout_percentage ?? 100,
            environments: flag.environments || ['production'],
            metadata: flag.metadata || {},
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch {
        // Fallback to API route
        const response = await fetch('/api/feature-flags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(flag),
        });
        if (!response.ok) throw new Error('Failed to create flag');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flag olusturuldu');
    },
    onError: (error: Error) => {
      toast.error(`Flag olusturulamadi: ${error.message}`);
    },
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string } & Partial<FeatureFlag>) => {
      const { id, ...data } = updates;

      // Try direct Supabase first
      try {
        const supabase = getClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: result, error } = await (
          supabase.from('feature_flags') as any
        )
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return result;
      } catch {
        // Fallback to API route
        const response = await fetch('/api/feature-flags', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Failed to update flag');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
    onError: (error: Error) => {
      toast.error(`Flag guncellenemedi: ${error.message}`);
    },
  });
}

export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Try direct Supabase first
      try {
        const supabase = getClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('feature_flags') as any)
          .delete()
          .eq('id', id);

        if (error) throw error;
        return { success: true };
      } catch {
        // Fallback to API route
        const response = await fetch(`/api/feature-flags?id=${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete flag');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flag silindi');
    },
    onError: (error: Error) => {
      toast.error(`Flag silinemedi: ${error.message}`);
    },
  });
}

export function useToggleFeatureFlag() {
  const updateFlag = useUpdateFeatureFlag();
  const queryClient = useQueryClient();

  return {
    ...updateFlag,
    mutate: (id: string, enabled: boolean) => {
      // Optimistic update
      queryClient.setQueryData(
        ['feature-flags'],
        (oldData: FeatureFlagsData | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            flags: oldData.flags.map((flag) =>
              flag.id === id ? { ...flag, enabled } : flag,
            ),
          };
        },
      );

      updateFlag.mutate(
        { id, enabled },
        {
          onError: () => {
            // Revert optimistic update on error
            queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
          },
        },
      );
    },
    mutateAsync: (id: string, enabled: boolean) => {
      return updateFlag.mutateAsync({ id, enabled });
    },
  };
}
