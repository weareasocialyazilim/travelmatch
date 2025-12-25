/**
 * Offline-aware Supabase Hook
 *
 * Wraps Supabase queries with automatic offline detection
 * Use this instead of direct supabase.from() calls
 */

import { useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

/**
 * Error thrown when offline
 */
export class OfflineError extends Error {
  code = 'OFFLINE';

  constructor(message = 'İnternet bağlantısı yok') {
    super(message);
    this.name = 'OfflineError';
  }
}

/**
 * Check if device is online before making request
 */
const checkOnline = async (): Promise<boolean> => {
  try {
    const netState = await NetInfo.fetch();
    const isConnected = netState.isConnected ?? false;
    const isReachable = netState.isInternetReachable ?? true;
    return isConnected && isReachable;
  } catch (error) {
    logger.error('[Supabase] NetInfo check failed, assuming online:', error);
    return true; // Fail-open
  }
};

/**
 * Hook for offline-aware Supabase queries
 *
 * @example
 * const { query } = useOfflineSupabase();
 *
 * // Automatic offline check
 * const { data, error } = await query('moments').select('*');
 *
 * // Will throw OfflineError if not connected
 */
export const useOfflineSupabase = () => {
  const query = useCallback((table: string) => {
    // Create a proxy that checks online status before each query
    const baseQuery = supabase.from(table);

    return new Proxy(baseQuery, {
      get(target, prop) {
        const original = target[prop as keyof typeof target];

        // If it's a function that executes the query (select, insert, update, delete)
        if (
          typeof original === 'function' &&
          ['select', 'insert', 'update', 'delete', 'upsert'].includes(
            String(prop),
          )
        ) {
          return async function (...args: unknown[]) {
            // Check online status
            const isOnline = await checkOnline();

            if (!isOnline) {
              logger.warn(
                `[Supabase] Offline - blocking ${String(prop)} on ${table}`,
              );
              throw new OfflineError();
            }

            // Execute original method (typed call)
            const fn = original as (...a: unknown[]) => unknown;
             
            return fn(...args);
          };
        }

        return original;
      },
    });
  }, []);

  return {
    query,
    supabase, // Still export supabase for auth and other non-query operations
  };
};

/**
 * Utility: Wrap any async function with offline check
 *
 * @example
 * const safeFetch = withOfflineCheck(async () => {
 *   return await fetch('https://api.example.com');
 * });
 *
 * await safeFetch(); // Throws OfflineError if offline
 */
export const withOfflineCheck = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
): T => {
  return (async (...args: Parameters<T>) => {
    const isOnline = await checkOnline();

    if (!isOnline) {
      throw new OfflineError();
    }

    return fn(...args);
  }) as T;
};
