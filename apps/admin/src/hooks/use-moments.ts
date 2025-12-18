'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Moment {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'approved' | 'rejected';
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_featured: boolean;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

interface MomentsData {
  moments: Moment[];
  total: number;
}

interface UseMomentsOptions {
  status?: string;
  featured?: boolean;
  limit?: number;
}

export function useMoments(options: UseMomentsOptions = {}) {
  const { status, featured, limit = 50 } = options;

  return useQuery<MomentsData>({
    queryKey: ['moments', status, featured, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (featured !== undefined) params.set('featured', String(featured));
      params.set('limit', String(limit));

      const response = await fetch(`/api/moments?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch moments');
      }
      return response.json();
    },
  });
}

export function useMoment(id: string) {
  return useQuery<Moment>({
    queryKey: ['moments', id],
    queryFn: async () => {
      const response = await fetch(`/api/moments/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch moment');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useApproveMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/moments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!response.ok) {
        throw new Error('Failed to approve moment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moments'] });
    },
  });
}

export function useRejectMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(`/api/moments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejection_reason: reason }),
      });
      if (!response.ok) {
        throw new Error('Failed to reject moment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moments'] });
    },
  });
}

export function useFeatureMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const response = await fetch(`/api/moments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: featured }),
      });
      if (!response.ok) {
        throw new Error('Failed to update moment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moments'] });
    },
  });
}
