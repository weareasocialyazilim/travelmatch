'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Promos Hook
 * Handles promo codes and referrals
 */

export interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count?: number;
  per_user_limit?: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  applicable_to?: Record<string, unknown>;
  campaign?: {
    id: string;
    name: string;
  };
  created_at: string;
}

export interface PromoStats {
  total: number;
  active: number;
  expired: number;
  totalRedemptions: number;
}

export interface PromosData {
  promo_codes: PromoCode[];
  total: number;
  limit: number;
  offset: number;
}

interface FetchPromosParams {
  isActive?: boolean;
  campaignId?: string;
  limit?: number;
  offset?: number;
}

async function fetchPromos(params: FetchPromosParams = {}): Promise<PromosData> {
  const searchParams = new URLSearchParams();
  if (params.isActive !== undefined) searchParams.set('is_active', params.isActive.toString());
  if (params.campaignId) searchParams.set('campaign_id', params.campaignId);
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());

  const response = await fetch(`/api/promos?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch promos');
  }
  return response.json();
}

export function usePromos(params: FetchPromosParams = {}) {
  return useQuery({
    queryKey: ['promos', params],
    queryFn: () => fetchPromos(params),
    staleTime: 60 * 1000,
  });
}

export function useActivePromos() {
  return usePromos({ isActive: true });
}

export function useCreatePromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promo: Partial<PromoCode>) => {
      const response = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promo),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create promo');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promos'] });
    },
  });
}

export function useUpdatePromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string } & Partial<PromoCode>) => {
      const response = await fetch('/api/promos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update promo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promos'] });
    },
  });
}

export function useDeletePromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/promos?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete promo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promos'] });
    },
  });
}

export function useTogglePromo() {
  const updatePromo = useUpdatePromo();

  return {
    ...updatePromo,
    mutate: (id: string, isActive: boolean) => {
      updatePromo.mutate({ id, is_active: isActive });
    },
    mutateAsync: (id: string, isActive: boolean) => {
      return updatePromo.mutateAsync({ id, is_active: isActive });
    },
  };
}

// ============================================================================
// Referrals
// ============================================================================

export interface Referral {
  id: string;
  referrer: string;
  referrer_id: string;
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_earnings: number;
  status: 'active' | 'inactive' | 'suspended';
}

export interface ReferralStats {
  totalReferrers: number;
  activeReferrers: number;
  totalReferrals: number;
  successRate: number;
  totalPayout: number;
}

export interface ReferralsData {
  referrals: Referral[];
  stats: ReferralStats;
  total: number;
  limit: number;
  offset: number;
}

// Mock data for fallback
const mockReferrals: Referral[] = [
  {
    id: '1',
    referrer: 'Ahmet Y.',
    referrer_id: 'user_1',
    total_referrals: 24,
    successful_referrals: 18,
    pending_referrals: 6,
    total_earnings: 540,
    status: 'active',
  },
  {
    id: '2',
    referrer: 'Elif K.',
    referrer_id: 'user_2',
    total_referrals: 15,
    successful_referrals: 12,
    pending_referrals: 3,
    total_earnings: 360,
    status: 'active',
  },
  {
    id: '3',
    referrer: 'Mehmet A.',
    referrer_id: 'user_3',
    total_referrals: 8,
    successful_referrals: 5,
    pending_referrals: 3,
    total_earnings: 150,
    status: 'active',
  },
];

const mockReferralStats: ReferralStats = {
  totalReferrers: 4500,
  activeReferrers: 1200,
  totalReferrals: 8900,
  successRate: 67.2,
  totalPayout: 267000,
};

const mockPromoCodes = [
  {
    id: '1',
    code: 'YILBASI30',
    discount_type: 'percentage' as const,
    discount_value: 30,
    description: 'Yilbasi kampanyasi - %30 indirim',
    is_active: true,
    usage_count: 456,
    usage_limit: 1000,
    valid_from: '2024-12-15T00:00:00Z',
    valid_until: '2024-12-31T23:59:59Z',
    created_at: '2024-12-01T00:00:00Z',
  },
  {
    id: '2',
    code: 'HOSGELDIN',
    discount_type: 'fixed' as const,
    discount_value: 50,
    description: 'Yeni kullanici indirimi',
    is_active: true,
    usage_count: 3240,
    usage_limit: undefined,
    valid_from: '2024-01-01T00:00:00Z',
    valid_until: undefined,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    code: 'PREMIUM50',
    discount_type: 'percentage' as const,
    discount_value: 50,
    description: 'Premium abonelik %50 indirim',
    is_active: false,
    usage_count: 0,
    usage_limit: 500,
    valid_from: '2024-12-20T00:00:00Z',
    valid_until: '2024-12-25T23:59:59Z',
    created_at: '2024-12-10T00:00:00Z',
  },
  {
    id: '4',
    code: 'BLACKFRIDAY',
    discount_type: 'percentage' as const,
    discount_value: 40,
    description: 'Black Friday kampanyasi',
    is_active: false,
    usage_count: 2800,
    usage_limit: 5000,
    valid_from: '2024-11-24T00:00:00Z',
    valid_until: '2024-11-27T23:59:59Z',
    created_at: '2024-11-20T00:00:00Z',
  },
];

const mockPromoStats = {
  totalCodes: 24,
  activeCodes: 8,
  totalUsage: 12450,
  totalRevenue: 650400,
  avgConversion: 23.5,
};

interface FetchReferralsParams {
  status?: 'active' | 'inactive' | 'suspended';
  limit?: number;
  offset?: number;
}

async function fetchReferrals(params: FetchReferralsParams = {}): Promise<ReferralsData> {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());

  const response = await fetch(`/api/referrals?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch referrals');
  }
  return response.json();
}

export function useReferrals(params: FetchReferralsParams = {}) {
  return useQuery({
    queryKey: ['referrals', params],
    queryFn: () => fetchReferrals(params),
    staleTime: 60 * 1000,
  });
}

export function useActiveReferrals() {
  return useReferrals({ status: 'active' });
}

// ============================================================================
// Combined Promos Page Hook - Fetches both promos and referrals with fallbacks
// ============================================================================

export interface PromosPageData {
  promoCodes: PromoCode[];
  promoStats: {
    totalCodes: number;
    activeCodes: number;
    totalUsage: number;
    totalRevenue: number;
    avgConversion: number;
  };
  referrals: Referral[];
  referralStats: ReferralStats;
  isUsingMockPromos: boolean;
  isUsingMockReferrals: boolean;
}

export function usePromosPageData() {
  const promosQuery = usePromos();
  const referralsQuery = useReferrals();

  // Determine if we should use mock data
  const shouldUseMockPromos =
    promosQuery.isError ||
    (!promosQuery.isLoading && (!promosQuery.data?.promo_codes || promosQuery.data.promo_codes.length === 0));

  const shouldUseMockReferrals =
    referralsQuery.isError ||
    (!referralsQuery.isLoading && (!referralsQuery.data?.referrals || referralsQuery.data.referrals.length === 0));

  // Get promo codes with fallback
  const promoCodes: PromoCode[] = shouldUseMockPromos
    ? mockPromoCodes
    : (promosQuery.data?.promo_codes ?? []);

  // Calculate promo stats
  const promoStats = shouldUseMockPromos
    ? mockPromoStats
    : {
        totalCodes: promoCodes.length || mockPromoStats.totalCodes,
        activeCodes: promoCodes.filter((p) => p.is_active).length || mockPromoStats.activeCodes,
        totalUsage: promoCodes.reduce((sum, p) => sum + (p.usage_count || 0), 0) || mockPromoStats.totalUsage,
        totalRevenue: mockPromoStats.totalRevenue, // Revenue not tracked in API yet
        avgConversion: mockPromoStats.avgConversion, // Conversion not tracked yet
      };

  // Get referrals with fallback
  const referrals: Referral[] = shouldUseMockReferrals
    ? mockReferrals
    : (referralsQuery.data?.referrals ?? []);

  // Get referral stats with fallback
  const referralStats: ReferralStats = shouldUseMockReferrals
    ? mockReferralStats
    : (referralsQuery.data?.stats ?? mockReferralStats);

  return {
    // Combined data
    data: {
      promoCodes,
      promoStats,
      referrals,
      referralStats,
      isUsingMockPromos: shouldUseMockPromos,
      isUsingMockReferrals: shouldUseMockReferrals,
    } as PromosPageData,

    // Loading state - only true if both are loading
    isLoading: promosQuery.isLoading || referralsQuery.isLoading,

    // Error state - only show error if both failed
    error: promosQuery.isError && referralsQuery.isError
      ? promosQuery.error
      : null,

    // Individual query states for granular control
    promos: {
      isLoading: promosQuery.isLoading,
      isError: promosQuery.isError,
      error: promosQuery.error,
    },
    referrals: {
      isLoading: referralsQuery.isLoading,
      isError: referralsQuery.isError,
      error: referralsQuery.error,
    },

    // Refetch functions
    refetch: () => {
      promosQuery.refetch();
      referralsQuery.refetch();
    },
    refetchPromos: promosQuery.refetch,
    refetchReferrals: referralsQuery.refetch,
  };
}

// ============================================================================
// Referral Settings Mutations
// ============================================================================

export interface ReferralSettings {
  referrerReward: number;
  referredReward: number;
  isAbuseDetectionEnabled: boolean;
}

export function useUpdateReferralSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<ReferralSettings>) => {
      const response = await fetch('/api/referrals/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update referral settings');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      queryClient.invalidateQueries({ queryKey: ['referral-settings'] });
    },
  });
}

export function useReferralSettings() {
  return useQuery({
    queryKey: ['referral-settings'],
    queryFn: async () => {
      const response = await fetch('/api/referrals/settings');
      if (!response.ok) {
        // Return defaults if API fails
        return {
          referrerReward: 30,
          referredReward: 20,
          isAbuseDetectionEnabled: true,
        } as ReferralSettings;
      }
      return response.json() as Promise<ReferralSettings>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
