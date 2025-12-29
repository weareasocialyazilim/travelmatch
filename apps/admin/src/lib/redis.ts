/**
 * Redis Configuration for Admin Panel
 *
 * Uses Upstash Redis for serverless-friendly rate limiting.
 * Falls back to in-memory when Redis is not configured.
 */

import { setRateLimitStore, createUpstashStore } from './rate-limit';

// Singleton Redis instance
let redisInstance: unknown | null = null;

/**
 * Initialize Redis connection and set up rate limiting store
 * Call this once at application startup
 */
export function initializeRedis(): void {
  // Check if Redis environment variables are configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        '[Redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured.',
        'Falling back to in-memory rate limiting.',
        'Note: In-memory rate limiting will reset on server restart and is not suitable for multi-instance deployments.',
      );
    }
    return;
  }

  try {
    // Dynamically import and initialize Redis
    void (async () => {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: redisUrl,
        token: redisToken,
      });

      redisInstance = redis;

      // Create the Upstash store adapter with compatible types
      const upstashStore = createUpstashStore({
        get: async <T>(key: string) => redis.get<T>(key),
        set: async (key: string, value: unknown, options?: { px?: number }) => {
          if (options?.px) {
            return redis.set(key, value, { px: options.px });
          }
          return redis.set(key, value);
        },
        incr: async (key: string) => redis.incr(key),
      });
      setRateLimitStore(upstashStore);

      console.info(
        '[Redis] Successfully connected to Upstash Redis for rate limiting',
      );
    })();
  } catch (error) {
    console.error('[Redis] Failed to initialize Upstash Redis:', error);
    console.warn('[Redis] Falling back to in-memory rate limiting');
  }
}

/**
 * Get the Redis instance for direct operations
 */
export function getRedisInstance(): unknown | null {
  return redisInstance;
}

/**
 * Check if Redis is available and connected
 */
export function isRedisConnected(): boolean {
  return redisInstance !== null;
}

// Auto-initialize on module load in production
if (process.env.NODE_ENV === 'production') {
  initializeRedis();
}
