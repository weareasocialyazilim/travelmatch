/**
 * Supabase Helper Types
 * Generic types for type-safe database operations
 */

import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

/**
 * Pagination Options
 */
export interface PaginationOptions {
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
}

/**
 * Pagination Result
 */
export interface PaginationResult<T> {
  data: T[];
  hasMore: boolean;
  nextCursor: string | null;
  total?: number;
}

/**
 * Supabase Query Type Helper
 * Provides type-safe query building
 */
 
export type SupabaseQuery<T extends Record<string, unknown> = Record<string, unknown>> = PostgrestFilterBuilder<any, any, T, any, any>;

/**
 * Generic Service Response
 */
export interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * List Response with Pagination
 */
export interface ListResponse<T> extends ServiceResponse<T[]> {
  pagination?: PaginationResult<T>;
}

/**
 * Database Error Types
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public constraint?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Type-safe cursor pagination helper
 */
export function withCursorPagination<T extends Record<string, unknown>>(
  query: SupabaseQuery<T>,
  options: PaginationOptions & { cursor?: string }
): SupabaseQuery<T> {
  const { pageSize = 20, orderBy = 'created_at', ascending = false, cursor } = options;

  let paginatedQuery = query.order(orderBy, { ascending });

  if (cursor) {
    paginatedQuery = paginatedQuery.gt('created_at', cursor);
  }

  return paginatedQuery.limit(pageSize + 1); // +1 to check if there are more
}

/**
 * Type-safe offset pagination helper
 */
export function withOffsetPagination<T extends Record<string, unknown>>(
  query: SupabaseQuery<T>,
  options: PaginationOptions & { page?: number }
): SupabaseQuery<T> {
  const { pageSize = 20, orderBy = 'created_at', ascending = false, page = 1 } = options;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return query
    .order(orderBy, { ascending })
    .range(from, to);
}
