/**
 * Database Utilities for Edge Functions
 *
 * Common database operations, query helpers, and error handling.
 */

import { createSupabaseClients } from './supabase.ts';
import { createLogger, Logger } from './logger.ts';
import { ERROR_CODES } from './types.ts';

// =============================================================================
// DATABASE ERROR HANDLING
// =============================================================================

export class DatabaseError extends Error {
  code: string;
  details?: unknown;
  hint?: string;

  constructor(message: string, code: string, details?: unknown, hint?: string) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.details = details;
    this.hint = hint;
  }
}

/**
 * Convert Supabase/PostgreSQL error to DatabaseError
 */
export function handleDbError(error: unknown): DatabaseError {
  if (error instanceof DatabaseError) {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    // PostgreSQL error codes
    if (err.code === '23505') {
      return new DatabaseError(
        'A record with this value already exists',
        ERROR_CODES.CONFLICT,
        err.details,
        err.hint as string,
      );
    }

    if (err.code === '23503') {
      return new DatabaseError(
        'Referenced record not found',
        ERROR_CODES.NOT_FOUND,
        err.details,
        err.hint as string,
      );
    }

    if (err.code === '42501') {
      return new DatabaseError(
        'Permission denied',
        ERROR_CODES.FORBIDDEN,
        err.details,
        err.hint as string,
      );
    }

    if (err.code === 'PGRST116') {
      return new DatabaseError('Record not found', ERROR_CODES.NOT_FOUND);
    }

    return new DatabaseError(
      (err.message as string) || 'Database error',
      ERROR_CODES.INTERNAL_ERROR,
      err.details,
      err.hint as string,
    );
  }

  return new DatabaseError(
    'Unknown database error',
    ERROR_CODES.INTERNAL_ERROR,
  );
}

// =============================================================================
// QUERY BUILDERS
// =============================================================================

interface QueryOptions {
  select?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  single?: boolean;
}

/**
 * Build a select query with common options
 */
export function buildSelectQuery(
  table: ReturnType<ReturnType<typeof createSupabaseClients>['admin']['from']>,
  options: QueryOptions = {},
) {
  let query = table.select(options.select || '*');

  if (options.orderBy) {
    query = query.order(options.orderBy, {
      ascending: options.orderDirection !== 'desc',
    });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 20) - 1,
    );
  }

  return query;
}

// =============================================================================
// PAGINATION HELPERS
// =============================================================================

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Execute paginated query
 */
export async function paginatedQuery<T>(
  query: ReturnType<ReturnType<typeof createSupabaseClients>['admin']['from']>,
  options: {
    page?: number;
    limit?: number;
    select?: string;
  } = {},
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const offset = (page - 1) * limit;

  // Get count
  const countQuery = query.select('*', { count: 'exact', head: true });
  const { count, error: countError } = await countQuery;

  if (countError) {
    throw handleDbError(countError);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  // Get data
  const dataQuery = query
    .select(options.select || '*')
    .range(offset, offset + limit - 1);

  const { data, error: dataError } = await dataQuery;

  if (dataError) {
    throw handleDbError(dataError);
  }

  return {
    data: (data || []) as T[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// =============================================================================
// CURSOR PAGINATION
// =============================================================================

export interface CursorPaginatedResult<T> {
  data: T[];
  pagination: {
    cursor: string | null;
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

/**
 * Encode cursor
 */
export function encodeCursor(
  value: string | number | Date,
  id: string,
): string {
  const timestamp = value instanceof Date ? value.toISOString() : String(value);
  return btoa(JSON.stringify({ ts: timestamp, id }));
}

/**
 * Decode cursor
 */
export function decodeCursor(
  cursor: string,
): { ts: string; id: string } | null {
  try {
    const decoded = JSON.parse(atob(cursor));
    if (decoded.ts && decoded.id) {
      return decoded;
    }
    return null;
  } catch (cursorDecodeError) {
    return null;
  }
}

// =============================================================================
// TRANSACTION HELPER
// =============================================================================

/**
 * Execute multiple operations in a transaction-like manner
 * Note: Supabase doesn't support true transactions in JS SDK,
 * but we can use database functions for atomic operations
 */
export async function withTransaction<T>(
  request: Request,
  authHeader: string,
  operation: () => Promise<T>,
  logger?: Logger,
): Promise<T> {
  const log = logger || createLogger('transaction', request);
  const startTime = Date.now();

  try {
    log.debug('Starting transaction-like operation');
    const result = await operation();
    log.debug('Transaction completed', { durationMs: Date.now() - startTime });
    return result;
  } catch (error) {
    log.error(
      'Transaction failed',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw handleDbError(error);
  }
}

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

/**
 * Execute operations in batches
 */
export async function batchOperation<T, R>(
  items: T[],
  batchSize: number,
  operation: (batch: T[]) => Promise<R[]>,
  logger?: Logger,
): Promise<R[]> {
  const results: R[] = [];
  const batches = Math.ceil(items.length / batchSize);

  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const batch = items.slice(start, start + batchSize);

    logger?.debug(`Processing batch ${i + 1}/${batches}`, {
      batchSize: batch.length,
    });

    const batchResults = await operation(batch);
    results.push(...batchResults);
  }

  return results;
}

// =============================================================================
// SOFT DELETE HELPERS
// =============================================================================

/**
 * Check if record is soft deleted
 */
export function isDeleted(record: { deleted_at?: string | null }): boolean {
  return record.deleted_at !== null && record.deleted_at !== undefined;
}

/**
 * Add soft delete filter to query
 */
export function excludeDeleted<
  T extends { is: (column: string, value: null) => T },
>(query: T): T {
  return query.is('deleted_at', null);
}

// =============================================================================
// GEOMETRY HELPERS (PostGIS)
// =============================================================================

/**
 * Create PostGIS point from coordinates
 */
export function createPoint(lat: number, lng: number): string {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

/**
 * Parse PostGIS point to coordinates
 */
export function parsePoint(point: string): { lat: number; lng: number } | null {
  const match = point.match(/POINT\(([^\s]+)\s+([^\s)]+)\)/);
  if (match) {
    return {
      lng: parseFloat(match[1]),
      lat: parseFloat(match[2]),
    };
  }
  return null;
}

/**
 * Calculate distance in meters using Haversine formula
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
