'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Task Queue Hook
 * Manages admin tasks and queue operations
 */

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
  assignee?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface QueueStats {
  pending: number;
  inProgress: number;
  completed: number;
  urgent: number;
  overdue: number;
  total: number;
}

export interface QueueData {
  tasks: Task[];
  stats: QueueStats;
  taskTypes: string[];
  meta: {
    generatedAt: string;
    error?: string;
  };
}

interface FetchQueueParams {
  status?: string;
  type?: string;
  priority?: string;
  limit?: number;
}

async function fetchQueue(params: FetchQueueParams = {}): Promise<QueueData> {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.type) searchParams.set('type', params.type);
  if (params.priority) searchParams.set('priority', params.priority);
  if (params.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`/api/queue?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch queue data');
  }
  return response.json();
}

export function useQueue(params: FetchQueueParams = {}) {
  return useQuery({
    queryKey: ['queue', params],
    queryFn: () => fetchQueue(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
}

export function useQueueStats() {
  const { data, ...rest } = useQueue();
  return {
    stats: data?.stats,
    ...rest,
  };
}

export function usePendingQueue() {
  return useQueue({ status: 'pending' });
}

export function useUrgentTasks() {
  return useQueue({ priority: 'urgent' });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      const response = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string } & Partial<Task>) => {
      const response = await fetch('/api/queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/queue?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCompleteTask() {
  const updateTask = useUpdateTask();

  return {
    ...updateTask,
    mutate: (id: string) => {
      updateTask.mutate({ id, status: 'completed' });
    },
    mutateAsync: (id: string) => {
      return updateTask.mutateAsync({ id, status: 'completed' });
    },
  };
}

export function useAssignTask() {
  const updateTask = useUpdateTask();

  return {
    ...updateTask,
    mutate: (id: string, assignedTo: string) => {
      updateTask.mutate({ id, assigned_to: assignedTo, status: 'in_progress' });
    },
    mutateAsync: (id: string, assignedTo: string) => {
      return updateTask.mutateAsync({ id, assigned_to: assignedTo, status: 'in_progress' });
    },
  };
}
