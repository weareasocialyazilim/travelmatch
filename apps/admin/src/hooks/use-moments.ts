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

// Mock data for development
const mockMoments: Moment[] = [
  {
    id: 'moment-1',
    user_id: 'user-1',
    media_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    media_type: 'image',
    caption: 'Kapadokya manzarası 🎈',
    location: 'Kapadokya, Nevşehir',
    latitude: 38.6587,
    longitude: 34.8424,
    status: 'pending',
    likes_count: 45,
    comments_count: 12,
    views_count: 230,
    is_featured: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    user: { id: 'user-1', full_name: 'Ahmet Yılmaz', avatar_url: '' },
  },
  {
    id: 'moment-2',
    user_id: 'user-2',
    media_url:
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400',
    media_type: 'image',
    caption: 'Boğaz turu 🚢',
    location: 'İstanbul Boğazı',
    latitude: 41.0082,
    longitude: 28.9784,
    status: 'pending',
    likes_count: 89,
    comments_count: 23,
    views_count: 456,
    is_featured: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    user: { id: 'user-2', full_name: 'Ayşe Kaya', avatar_url: '' },
  },
  {
    id: 'moment-3',
    user_id: 'user-3',
    media_url:
      'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=400',
    media_type: 'image',
    caption: 'Antalya sahili ☀️',
    location: 'Antalya',
    latitude: 36.8969,
    longitude: 30.7133,
    status: 'approved',
    likes_count: 156,
    comments_count: 34,
    views_count: 890,
    is_featured: true,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    user: { id: 'user-3', full_name: 'Mehmet Demir', avatar_url: '' },
  },
];

export function useMoments(options: UseMomentsOptions = {}) {
  const { status, featured, limit = 50 } = options;

  return useQuery<MomentsData>({
    queryKey: ['moments', status, featured, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (featured !== undefined) params.set('featured', String(featured));
      params.set('limit', String(limit));

      try {
        const response = await fetch(`/api/moments?${params}`);
        if (!response.ok) {
          // Return mock data on 401/error
          let filtered = mockMoments;
          if (status) {
            filtered = filtered.filter((m) => m.status === status);
          }
          if (featured !== undefined) {
            filtered = filtered.filter((m) => m.is_featured === featured);
          }
          return { moments: filtered, total: filtered.length };
        }
        return response.json();
      } catch {
        // Return mock data on network error
        return { moments: mockMoments, total: mockMoments.length };
      }
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
