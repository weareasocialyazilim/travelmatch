'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Task {
  id: string;
  type: string;
  title: string;
  description?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  resource_type: string;
  resource_id: string;
  assigned_to?: string;
  assigned_roles: string[];
  due_date?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  completed_by?: string;
  assigned_to_user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

interface TasksResponse {
  tasks: Task[];
  total: number;
  limit: number;
  offset: number;
}

interface TaskFilters {
  status?: string;
  priority?: string;
  assigned_to?: string;
  limit?: number;
  offset?: number;
}

async function fetchTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.assigned_to) params.set('assigned_to', filters.assigned_to);
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.offset) params.set('offset', filters.offset.toString());

  const response = await fetch(`/api/tasks?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Görevler yüklenemedi');
  }
  return response.json();
}

async function fetchTask(id: string): Promise<{ task: Task }> {
  const response = await fetch(`/api/tasks/${id}`);
  if (!response.ok) {
    throw new Error('Görev bulunamadı');
  }
  return response.json();
}

async function createTask(data: Partial<Task>): Promise<{ task: Task }> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Görev oluşturulamadı');
  }
  return response.json();
}

async function updateTask(
  id: string,
  data: Partial<Task>,
): Promise<{ task: Task }> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Görev güncellenemedi');
  }
  return response.json();
}

async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Görev silinemedi');
  }
}

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCompleteTask() {
  const updateTask = useUpdateTask();

  return {
    ...updateTask,
    mutate: (id: string) =>
      updateTask.mutate({ id, data: { status: 'completed' } }),
    mutateAsync: (id: string) =>
      updateTask.mutateAsync({ id, data: { status: 'completed' } }),
  };
}
