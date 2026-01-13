'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface NotificationCampaign {
  id: string;
  title: string;
  message?: string;
  body?: string;
  type: 'push' | 'email' | 'in_app';
  target_audience?: { segment?: string };
  segment?: string;
  scheduled_at?: string | null;
  scheduled_for?: string | null;
  sent_at?: string | null;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled' | 'failed';
  sent_count?: number;
  opened_count?: number;
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  } | null;
  created_by?: string;
  created_at: string;
}

interface NotificationStats {
  totalSent: number;
  avgDeliveryRate: number;
  avgOpenRate: number;
  avgClickRate: number;
}

interface NotificationSegment {
  id: string;
  name: string;
  count: number;
}

interface NotificationsData {
  campaigns: NotificationCampaign[];
  total: number;
  stats?: NotificationStats;
  segments?: NotificationSegment[];
}

interface UseNotificationsOptions {
  status?: string;
  type?: string;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { status, type } = options;

  return useQuery<NotificationsData>({
    queryKey: ['notifications', status, type],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (type) params.set('type', type);

      const response = await fetch(`/api/notifications?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      return response.json();
    },
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<NotificationCampaign>) => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create notification');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notifications/${id}/send`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
