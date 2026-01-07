'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  type:
    | 'spam'
    | 'harassment'
    | 'fake_profile'
    | 'inappropriate_content'
    | 'scam'
    | 'other';
  reason: string;
  description: string;
  evidence: string[];
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: string | null;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  reporter?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  reported?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

interface ReportsData {
  reports: Report[];
  total: number;
}

interface UseReportsOptions {
  status?: string;
  type?: string;
  priority?: string;
}

export function useReports(options: UseReportsOptions = {}) {
  const { status, type, priority } = options;

  return useQuery<ReportsData>({
    queryKey: ['reports', status, type, priority],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (type) params.set('type', type);
      if (priority) params.set('priority', priority);

      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      return response.json();
    },
  });
}

export function useReport(id: string) {
  return useQuery<Report>({
    queryKey: ['reports', id],
    queryFn: async () => {
      const response = await fetch(`/api/reports/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Report> & { id: string }) => {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update report');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', variables.id] });
    },
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      resolution,
    }: {
      id: string;
      resolution: string;
    }) => {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved', resolution }),
      });
      if (!response.ok) {
        throw new Error('Failed to resolve report');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', variables.id] });
    },
  });
}
