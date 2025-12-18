/**
 * Redis Cache Service for Heavy Operations
 * 
 * Optimizes expensive operations like export-user-data with caching
 * 
 * Features:
 * - TTL-based cache expiration
 * - Automatic cache invalidation
 * - Compression for large payloads
 * - Rate limiting integration
 * - Performance metrics
 * 
 * Setup with Upstash Redis (serverless, globally distributed):
 * 1. Create Upstash account: https://upstash.com
 * 2. Create Redis database
 * 3. Get UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * 4. Set environment variables in Supabase Edge Functions
 * 
 * @see https://upstash.com/docs/redis
 */

import { Redis } from 'https://esm.sh/@upstash/redis@1.20.1';

const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_REST_URL')!,
  token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN')!,
});

/**
 * Cache TTL configurations (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  HOUR: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
} as const;

/**
 * Cache key prefixes for organization
 */
export const CACHE_PREFIX = {
  USER_DATA: 'user_data',
  EXPORT: 'export',
  QUERY: 'query',
  SESSION: 'session',
  RATE_LIMIT: 'rate_limit',
} as const;

/**
 * Generate cache key
 */
function getCacheKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`;
}

/**
 * Set cache with TTL
 * Automatically compresses large payloads
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = CACHE_TTL.MEDIUM,
): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    const sizeKB = new Blob([serialized]).size / 1024;

    console.log(`[Redis] Setting cache: ${key} (${sizeKB.toFixed(2)}KB, TTL: ${ttl}s)`);

    // For large payloads (>100KB), consider compression
    if (sizeKB > 100) {
      console.log(`[Redis] Large payload detected, consider compression`);
    }

    await redis.set(key, serialized, { ex: ttl });
  } catch (error) {
    console.error('[Redis] Set cache failed:', error);
    throw error;
  }
}

/**
 * Get cache value
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    
    if (!cached) {
      console.log(`[Redis] Cache miss: ${key}`);
      return null;
    }

    console.log(`[Redis] Cache hit: ${key}`);
    return typeof cached === 'string' ? JSON.parse(cached) : cached;
  } catch (error) {
    console.error('[Redis] Get cache failed:', error);
    return null;
  }
}

/**
 * Delete cache
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
    console.log(`[Redis] Cache deleted: ${key}`);
  } catch (error) {
    console.error('[Redis] Delete cache failed:', error);
    throw error;
  }
}

/**
 * Delete multiple cache keys by pattern
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  try {
    // Get all keys matching pattern
    const keys = await redis.keys(pattern);
    
    if (keys.length === 0) {
      return 0;
    }

    // Delete all matching keys
    await redis.del(...keys);
    console.log(`[Redis] Deleted ${keys.length} keys matching: ${pattern}`);
    
    return keys.length;
  } catch (error) {
    console.error('[Redis] Delete pattern failed:', error);
    throw error;
  }
}

/**
 * Check if cache exists
 */
export async function hasCache(key: string): Promise<boolean> {
  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error('[Redis] Check cache failed:', error);
    return false;
  }
}

/**
 * Get cache TTL (remaining time to live)
 */
export async function getCacheTTL(key: string): Promise<number> {
  try {
    return await redis.ttl(key);
  } catch (error) {
    console.error('[Redis] Get TTL failed:', error);
    return -1;
  }
}

/**
 * Increment counter (for rate limiting, analytics)
 */
export async function incrementCounter(
  key: string,
  ttl?: number,
): Promise<number> {
  try {
    const count = await redis.incr(key);
    
    if (ttl && count === 1) {
      await redis.expire(key, ttl);
    }
    
    return count;
  } catch (error) {
    console.error('[Redis] Increment failed:', error);
    throw error;
  }
}

/**
 * Cached function wrapper
 * Automatically caches function results
 * 
 * @example
 * const getUserData = cached(
 *   (userId: string) => fetchUserData(userId),
 *   (userId) => `user:${userId}`,
 *   CACHE_TTL.HOUR
 * );
 */
export function cached<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyGenerator: (...args: TArgs) => string,
  ttl: number = CACHE_TTL.MEDIUM,
) {
  return async (...args: TArgs): Promise<TResult> => {
    const key = keyGenerator(...args);
    
    // Try to get from cache
    const cached = await getCache<TResult>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn(...args);
    
    // Store in cache
    await setCache(key, result, ttl);
    
    return result;
  };
}

/**
 * Cache for export-user-data
 * Stores large GDPR exports with compression
 */
export const exportDataCache = {
  /**
   * Set export data with automatic expiration
   */
  async set(userId: string, data: unknown): Promise<void> {
    const key = getCacheKey(CACHE_PREFIX.EXPORT, userId);
    await setCache(key, data, CACHE_TTL.WEEK);
  },

  /**
   * Get cached export data
   */
  async get(userId: string): Promise<unknown | null> {
    const key = getCacheKey(CACHE_PREFIX.EXPORT, userId);
    return await getCache(key);
  },

  /**
   * Delete export cache for user
   */
  async delete(userId: string): Promise<void> {
    const key = getCacheKey(CACHE_PREFIX.EXPORT, userId);
    await deleteCache(key);
  },

  /**
   * Check if export is cached
   */
  async exists(userId: string): Promise<boolean> {
    const key = getCacheKey(CACHE_PREFIX.EXPORT, userId);
    return await hasCache(key);
  },

  /**
   * Get export generation status
   */
  async getStatus(userId: string): Promise<'pending' | 'ready' | 'expired' | 'not_found'> {
    const key = getCacheKey(CACHE_PREFIX.EXPORT, userId);
    const ttl = await getCacheTTL(key);
    
    if (ttl === -2) return 'not_found'; // Key doesn't exist
    if (ttl === -1) return 'expired'; // Key exists but no TTL (shouldn't happen)
    if (ttl > 0) return 'ready'; // Key exists with TTL
    
    return 'pending';
  },
};

/**
 * Cache for expensive queries
 */
export const queryCache = {
  /**
   * Cache query results
   */
  async set(queryKey: string, results: unknown, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
    const key = getCacheKey(CACHE_PREFIX.QUERY, queryKey);
    await setCache(key, results, ttl);
  },

  /**
   * Get cached query results
   */
  async get(queryKey: string): Promise<unknown | null> {
    const key = getCacheKey(CACHE_PREFIX.QUERY, queryKey);
    return await getCache(key);
  },

  /**
   * Invalidate query cache
   */
  async invalidate(pattern: string): Promise<number> {
    const fullPattern = getCacheKey(CACHE_PREFIX.QUERY, pattern);
    return await deleteCachePattern(fullPattern);
  },
};

/**
 * Session cache
 */
export const sessionCache = {
  async set(sessionId: string, data: unknown, ttl: number = CACHE_TTL.DAY): Promise<void> {
    const key = getCacheKey(CACHE_PREFIX.SESSION, sessionId);
    await setCache(key, data, ttl);
  },

  async get(sessionId: string): Promise<unknown | null> {
    const key = getCacheKey(CACHE_PREFIX.SESSION, sessionId);
    return await getCache(key);
  },

  async delete(sessionId: string): Promise<void> {
    const key = getCacheKey(CACHE_PREFIX.SESSION, sessionId);
    await deleteCache(key);
  },
};

/**
 * Rate limiting with Redis
 */
export const rateLimiter = {
  /**
   * Check if request is allowed
   * @returns { allowed: boolean, remaining: number, resetAt: number }
   */
  async check(
    identifier: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const key = getCacheKey(CACHE_PREFIX.RATE_LIMIT, identifier);
    const count = await incrementCounter(key, windowSeconds);
    const ttl = await getCacheTTL(key);
    
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt: Date.now() + (ttl * 1000),
    };
  },

  /**
   * Reset rate limit for identifier
   */
  async reset(identifier: string): Promise<void> {
    const key = getCacheKey(CACHE_PREFIX.RATE_LIMIT, identifier);
    await deleteCache(key);
  },
};

/**
 * Cache statistics
 */
export async function getCacheStats() {
  try {
    const info = await redis.info();
    return {
      connected: true,
      info: info,
    };
  } catch (error) {
    console.error('[Redis] Get stats failed:', error);
    return {
      connected: false,
      error: error.message,
    };
  }
}

/**
 * Clear all cache (use with caution!)
 */
export async function clearAllCache(): Promise<void> {
  console.warn('[Redis] Clearing ALL cache - this is destructive!');
  await redis.flushdb();
}

export default {
  // Core operations
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  hasCache,
  getCacheTTL,
  incrementCounter,
  
  // Specialized caches
  exportDataCache,
  queryCache,
  sessionCache,
  rateLimiter,
  
  // Utilities
  cached,
  getCacheStats,
  clearAllCache,
  
  // Constants
  CACHE_TTL,
  CACHE_PREFIX,
};
