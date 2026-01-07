/**
 * usePagination Hook
 * Generic cursor-based pagination for Supabase
 *
 * Why cursor-based pagination?
 * - O(1) vs O(n) performance for offset-based
 * - Consistent results even with real-time inserts
 * - Better scalability for large datasets (1000+ items)
 *
 * @example
 * ```typescript
 * const fetcher = async (cursor?: string) => {
 *   return await momentsService.listWithCursor({ cursor, limit: 20 });
 * };
 *
 * const { items, loadMore, refresh, hasMore, loading } = usePagination(fetcher);
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '../utils/logger';
import type { SupabaseQuery } from '../types/supabase-helpers';

/**
 * Pagination metadata from API responses
 */
export interface PaginationMeta {
  next_cursor?: string | null;
  has_more: boolean;
  count?: number;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Fetcher function type - must return paginated response
 */
export type PaginationFetcher<T> = (
  cursor?: string | null,
) => Promise<PaginatedResponse<T>>;

/**
 * Hook options
 */
export interface UsePaginationOptions {
  /** Items per page (default: 20) */
  limit?: number;
  /** Auto-load first page on mount (default: true) */
  autoLoad?: boolean;
  /** Enable logging (default: false) */
  debug?: boolean;
}

/**
 * Return type of usePagination hook
 */
export interface UsePaginationReturn<T> {
  /** Paginated items */
  items: T[];
  /** Load next page */
  loadMore: () => Promise<void>;
  /** Refresh from start */
  refresh: () => Promise<void>;
  /** Has more items to load */
  hasMore: boolean;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Current cursor */
  cursor: string | null;
  /** Clear all items */
  clear: () => void;
}

/**
 * Cursor-based pagination hook
 *
 * Performance characteristics:
 * - Offset pagination: SELECT * FROM table OFFSET 1000 LIMIT 20 → Scans 1000 rows (O(n))
 * - Cursor pagination: SELECT * FROM table WHERE id < cursor LIMIT 20 → Uses index (O(1))
 *
 * @param fetcher - Function that fetches paginated data
 * @param options - Configuration options
 * @returns Pagination state and controls
 */
export function usePagination<T>(
  fetcher: PaginationFetcher<T>,
  options: UsePaginationOptions = {},
): UsePaginationReturn<T> {
  const { limit = 20, autoLoad = true, debug = false } = options;

  // Track if component is mounted (prevent memory leaks)
  const mountedRef = useRef(true);
  const initialLoadDone = useRef(false);

  // State
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track mounted state for cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Load next page of data
   */
  const loadMore = useCallback(async () => {
    // Prevent duplicate requests
    if (loading || !hasMore) {
      if (debug) {
        logger.info('usePagination: Skipping loadMore', { loading, hasMore });
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (debug) {
        logger.info('usePagination: Loading more', { cursor, limit });
      }

      const response = await fetcher(cursor);

      // Check if component is still mounted
      if (!mountedRef.current) return;

      const { data, meta } = response;

      if (debug) {
        logger.info('usePagination: Response received', {
          itemCount: data.length,
          nextCursor: meta.next_cursor,
          hasMore: meta.has_more,
        });
      }

      // Append new items
      setItems((prev) => [...prev, ...data]);

      // Update pagination state
      setCursor(meta.next_cursor || null);
      setHasMore(meta.has_more);
    } catch (err) {
      if (!mountedRef.current) return;

      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      logger.error('usePagination: Load error', err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [cursor, hasMore, loading, fetcher, limit, debug]);

  /**
   * Refresh pagination (start from beginning)
   */
  const refresh = useCallback(async () => {
    if (debug) {
      logger.info('usePagination: Refreshing');
    }

    // Reset state
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setError(null);
    setLoading(true);

    try {
      const response = await fetcher(null);

      if (!mountedRef.current) return;

      const { data, meta } = response;

      if (debug) {
        logger.info('usePagination: Refresh complete', {
          itemCount: data.length,
          nextCursor: meta.next_cursor,
        });
      }

      setItems(data);
      setCursor(meta.next_cursor || null);
      setHasMore(meta.has_more);
    } catch (err) {
      if (!mountedRef.current) return;

      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMessage);
      logger.error('usePagination: Refresh error', err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher, debug]);

  /**
   * Clear all items and reset state
   */
  const clear = useCallback(() => {
    if (debug) {
      logger.info('usePagination: Clearing');
    }
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setError(null);
  }, [debug]);

  // Auto-load first page on mount
  useEffect(() => {
    if (autoLoad && !initialLoadDone.current) {
      initialLoadDone.current = true;
      void loadMore();
    }
  }, [autoLoad, loadMore]);

  return {
    items,
    loadMore,
    refresh,
    hasMore,
    loading,
    error,
    cursor,
    clear,
  };
}

/**
 * Utility: Encode cursor from timestamp and ID
 *
 * @example
 * ```typescript
 * const cursor = encodeCursor('2024-01-15T10:30:00Z', 'uuid-123');
 * // Returns: eyJjcmVhdGVkX2F0IjoiMjAyNC0wMS0xNVQxMDozMDowMFoiLCJpZCI6InV1aWQtMTIzIn0=
 * ```
 */
export function encodeCursor(created_at: string, id: string): string {
  const payload = JSON.stringify({ created_at, id });
  return Buffer.from(payload).toString('base64');
}

/**
 * Utility: Decode cursor to timestamp and ID
 *
 * @example
 * ```typescript
 * const { created_at, id } = decodeCursor(cursorString);
 * ```
 */
export function decodeCursor(cursor: string): {
  created_at: string;
  id: string;
} {
  try {
    const payload = Buffer.from(cursor, 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch (err) {
    logger.error('Failed to decode cursor', err);
    throw new Error('Invalid cursor format');
  }
}

/**
 * Utility: Build Supabase query with cursor pagination
 *
 * @example
 * ```typescript
 * const query = supabase.from('moments').select('*');
 * const paginatedQuery = applyCursorToQuery(query, cursor, 20);
 * const { data } = await paginatedQuery;
 * ```
 */
export function applyCursorToQuery<T extends Record<string, unknown>>(
  query: SupabaseQuery<T>,
  cursor: string | null,
  limit: number,
): SupabaseQuery<T> {
  let paginatedQuery = query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1); // Fetch one extra to check hasMore

  if (cursor) {
    const { created_at, id } = decodeCursor(cursor);
    // PostgreSQL: WHERE (created_at < cursor_date) OR (created_at = cursor_date AND id < cursor_id)
    paginatedQuery = paginatedQuery.or(
      `created_at.lt.${created_at},and(created_at.eq.${created_at},id.lt.${id})`,
    );
  }

  return paginatedQuery;
}

export default usePagination;
