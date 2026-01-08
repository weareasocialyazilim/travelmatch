/**
 * Database Service Types
 * Shared types for all database query services
 */

import type { Database, Json } from '../../types/database.types';

export type Tables = Database['public']['Tables'];

// Generic response types
export interface DbResult<T> {
  data: T | null;
  error: Error | null;
}

export interface ListResult<T> {
  data: T[];
  count: number;
  error: Error | null;
}

// Type definitions for tables not yet in generated types
export interface ReportRecord {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_moment_id: string | null;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface BlockRecord {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface TransactionInput {
  type: string;
  amount: number;
  currency: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  description?: string;
  moment_id?: string;
  sender_id?: string;
  receiver_id?: string;
  user_id: string;
  metadata?: Json;
}

// Helpers to normalize supabase responses into our DbResult/ListResult shapes
export const okSingle = <T>(data: unknown): DbResult<T> => ({
  data: (data as T) ?? null,
  error: null,
});

export const okList = <T>(
  data: unknown,
  count?: number | null,
): ListResult<T> => ({
  data: (data as T[]) || [],
  count: count ?? 0,
  error: null,
});
