'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'push' | 'social' | 'display';
  target_audience: object;
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  impressions: number;
  clicks: number;
  conversions: number;
  created_by: string;
  created_at: string;
}

interface CampaignsData {
  campaigns: Campaign[];
  total: number;
}

interface UseCampaignsOptions {
  status?: string;
  type?: string;
}

export function useCampaigns(options: UseCampaignsOptions = {}) {
  const { status, type } = options;

  return useQuery<CampaignsData>({
    queryKey: ['campaigns', status, type],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (type) params.set('type', type);

      const response = await fetch(`/api/campaigns?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      return response.json();
    },
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Campaign>) => {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Campaign> & { id: string }) => {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update campaign');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}
