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
