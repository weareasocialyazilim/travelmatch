/**
 * Redis Cache Service (Supabase Edge Functions)
 * 
 * Provides caching layer for frequently accessed data:
 * - User profiles
 * - Popular moments
 * - Recent conversations
 * 
 * TTL Strategy:
 * - User profiles: 15 minutes
 * - Moments: 5 minutes
 * - Conversations: 2 minutes
 */

import { connect } from 'https://deno.land/x/redis@v0.29.0/mod.ts';

// Redis connection configuration
const REDIS_URL = Deno.env.get('REDIS_URL') || 'redis://localhost:6379';

// TTL constants (in seconds)
export const CacheTTL = {
  USER_PROFILE: 900, // 15 minutes
  MOMENT: 300, // 5 minutes
  CONVERSATION: 120, // 2 minutes
  POPULAR_MOMENTS: 600, // 10 minutes
} as const;

/**
 * Redis client singleton
 */
let redisClient: any = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = await connect({
      hostname: new URL(REDIS_URL).hostname,
      port: parseInt(new URL(REDIS_URL).port) || 6379,
    });
  }
  return redisClient;
}

/**
 * Get cached data
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const redis = await getRedisClient();
    const data = await redis.get(key);
    
    if (!data) {
      return null;
    }
    
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`[Cache] Get error for key ${key}:`, error);
    return null; // Fail-open: return null on cache miss
  }
}

/**
 * Set cached data with TTL
 */
export async function setCache(
  key: string,
  value: any,
  ttl: number,
): Promise<boolean> {
  try {
    const redis = await getRedisClient();
    const serialized = JSON.stringify(value);
    
    await redis.setex(key, ttl, serialized);
    return true;
  } catch (error) {
    console.error(`[Cache] Set error for key ${key}:`, error);
    return false; // Fail-open: return false on cache write failure
  }
}

/**
 * Delete cached data
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    const redis = await getRedisClient();
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`[Cache] Delete error for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete multiple cached keys by pattern
 */
export async function deleteCacheByPattern(pattern: string): Promise<number> {
  try {
    const redis = await getRedisClient();
    const keys = await redis.keys(pattern);
    
    if (keys.length === 0) {
      return 0;
    }
    
    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error(`[Cache] Delete pattern error for ${pattern}:`, error);
    return 0;
  }
}

/**
 * Cache key generators
 */
export const CacheKeys = {
  userProfile: (userId: string) => `user:profile:${userId}`,
  moment: (momentId: string) => `moment:${momentId}`,
  conversation: (conversationId: string) => `conversation:${conversationId}`,
  userConversations: (userId: string) => `user:${userId}:conversations`,
  popularMoments: (category?: string) => 
    category ? `moments:popular:${category}` : 'moments:popular',
} as const;

/**
 * High-level cache helpers
 */

/**
 * Get or fetch user profile with caching
 */
export async function getCachedUserProfile<T>(
  userId: string,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const cacheKey = CacheKeys.userProfile(userId);
  
  // Try cache first
  const cached = await getCache<T>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from database
  const data = await fetchFn();
  
  // Cache for future requests
  await setCache(cacheKey, data, CacheTTL.USER_PROFILE);
  
  return data;
}

/**
 * Get or fetch moment with caching
 */
export async function getCachedMoment<T>(
  momentId: string,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const cacheKey = CacheKeys.moment(momentId);
  
  const cached = await getCache<T>(cacheKey);
  if (cached) {
    return cached;
  }
  
  const data = await fetchFn();
  await setCache(cacheKey, data, CacheTTL.MOMENT);
  
  return data;
}

/**
 * Invalidate user-related caches
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await deleteCache(CacheKeys.userProfile(userId));
  await deleteCache(CacheKeys.userConversations(userId));
}

/**
 * Invalidate moment cache
 */
export async function invalidateMomentCache(momentId: string): Promise<void> {
  await deleteCache(CacheKeys.moment(momentId));
  // Also invalidate popular moments cache
  await deleteCacheByPattern('moments:popular:*');
}
