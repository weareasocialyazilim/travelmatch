/**
 * Rate Limiting with Redis Support
 *
 * Provides rate limiting for API routes with optional Redis backend.
 * Falls back to in-memory storage when Redis is not available.
 *
 * @module lib/rate-limit
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Rate limit storage adapter interface
 * Allows swapping between in-memory and Redis implementations
 */
interface RateLimitStore {
  get(key: string): Promise<RateLimitEntry | null>;
  set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void>;
  increment(key: string): Promise<number>;
}

// ============================================================================
// IN-MEMORY STORE (Default - Single Instance)
// ============================================================================

const memoryStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      if (entry.resetTime < now) {
        memoryStore.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}

const inMemoryStore: RateLimitStore = {
  async get(key: string): Promise<RateLimitEntry | null> {
    return memoryStore.get(key) || null;
  },
  async set(key: string, entry: RateLimitEntry): Promise<void> {
    memoryStore.set(key, entry);
  },
  async increment(key: string): Promise<number> {
    const entry = memoryStore.get(key);
    if (entry) {
      entry.count++;
      return entry.count;
    }
    return 1;
  },
};

// ============================================================================
// REDIS STORE (Multi-Instance Production)
// ============================================================================

/**
 * Create a Redis-backed rate limit store
 *
 * @example
 * ```typescript
 * import { createClient } from 'redis';
 *
 * const redis = createClient({ url: process.env.REDIS_URL });
 * await redis.connect();
 *
 * const redisStore = createRedisStore(redis);
 * setRateLimitStore(redisStore);
 * ```
 */
export function createRedisStore(redisClient: {
  get: (key: string) => Promise<string | null>;
  set: (
    key: string,
    value: string,
    options?: { PX?: number },
  ) => Promise<unknown>;
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<unknown>;
}): RateLimitStore {
  const prefix = 'ratelimit:';

  return {
    async get(key: string): Promise<RateLimitEntry | null> {
      const data = await redisClient.get(prefix + key);
      if (!data) return null;
      try {
        return JSON.parse(data) as RateLimitEntry;
      } catch (parseError) {
        return null;
      }
    },

    async set(
      key: string,
      entry: RateLimitEntry,
      ttlMs: number,
    ): Promise<void> {
      await redisClient.set(prefix + key, JSON.stringify(entry), { PX: ttlMs });
    },

    async increment(key: string): Promise<number> {
      // For Redis, we use INCR which is atomic
      const fullKey = prefix + key + ':count';
      return await redisClient.incr(fullKey);
    },
  };
}

// ============================================================================
// UPSTASH REDIS STORE (Serverless-friendly)
// ============================================================================

/**
 * Create an Upstash Redis-backed rate limit store
 * Optimized for serverless environments (Vercel, Cloudflare Workers)
 *
 * @example
 * ```typescript
 * import { Redis } from '@upstash/redis';
 *
 * const redis = new Redis({
 *   url: process.env.UPSTASH_REDIS_REST_URL,
 *   token: process.env.UPSTASH_REDIS_REST_TOKEN,
 * });
 *
 * const upstashStore = createUpstashStore(redis);
 * setRateLimitStore(upstashStore);
 * ```
 */
export function createUpstashStore(upstashClient: {
  get: <T>(key: string) => Promise<T | null>;
  set: (
    key: string,
    value: unknown,
    options?: { px?: number },
  ) => Promise<unknown>;
  incr: (key: string) => Promise<number>;
}): RateLimitStore {
  const prefix = 'ratelimit:';

  return {
    async get(key: string): Promise<RateLimitEntry | null> {
      const data = await upstashClient.get<RateLimitEntry>(prefix + key);
      return data;
    },

    async set(
      key: string,
      entry: RateLimitEntry,
      ttlMs: number,
    ): Promise<void> {
      await upstashClient.set(prefix + key, entry, { px: ttlMs });
    },

    async increment(key: string): Promise<number> {
      const fullKey = prefix + key + ':count';
      return await upstashClient.incr(fullKey);
    },
  };
}

// ============================================================================
// RATE LIMIT CONFIGURATION
// ============================================================================

// Active store - defaults to in-memory, can be swapped to Redis
let activeStore: RateLimitStore = inMemoryStore;

/**
 * Set the rate limit store implementation
 * Call this at app startup to use Redis instead of in-memory
 */
export function setRateLimitStore(store: RateLimitStore): void {
  activeStore = store;
}

/**
 * Get the current rate limit store
 */
export function getRateLimitStore(): RateLimitStore {
  return activeStore;
}

/**
 * Reset to in-memory store (useful for testing)
 */
export function resetToInMemoryStore(): void {
  activeStore = inMemoryStore;
  memoryStore.clear();
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional custom key generator */
  keyGenerator?: (identifier: string) => string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check if a request is rate limited
 * Works with both in-memory and Redis stores
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const { limit, windowMs, keyGenerator } = config;
  const key = keyGenerator ? keyGenerator(identifier) : identifier;
  const now = Date.now();

  let entry = await activeStore.get(key);

  // If no entry or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    await activeStore.set(key, entry, windowMs);
    return {
      success: true,
      remaining: limit - 1,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count = await activeStore.increment(key);
  await activeStore.set(key, entry, entry.resetTime - now);

  // Check if over limit
  if (entry.count > limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  return {
    success: true,
    remaining: limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Synchronous rate limit check (in-memory only)
 * Use for non-async contexts where Redis is not needed
 */
export function checkRateLimitSync(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  const { limit, windowMs, keyGenerator } = config;
  const key = keyGenerator ? keyGenerator(identifier) : identifier;
  const now = Date.now();

  let entry = memoryStore.get(key);

  // If no entry or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    memoryStore.set(key, entry);
    return {
      success: true,
      remaining: limit - 1,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  return {
    success: true,
    remaining: limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Pre-configured rate limits for different endpoints
 */
export const rateLimits = {
  // Auth endpoints - strict limits
  auth: {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // 2FA verification - very strict to prevent brute force (6 digit = 1M combinations)
  // P0 FIX: Added 2FA rate limiting to prevent brute force attacks
  twoFactor: {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes - 5 attempts max
  },
  // Standard API endpoints
  api: {
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  // Sensitive operations (delete, ban, etc.)
  sensitive: {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  // Export operations
  export: {
    limit: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  // Search operations
  search: {
    limit: 30,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(
  result: RateLimitResult,
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
  };

  if (!result.success && result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 * Now supports async Redis-backed rate limiting
 */
export function withRateLimit<
  T extends (...args: unknown[]) => Promise<Response>,
>(handler: T, config: RateLimitConfig = rateLimits.api): T {
  return (async (...args: Parameters<T>) => {
    // Extract request from args (assuming first arg is Request)
    const request = args[0] as Request;

    // Get identifier from IP or auth header
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const result = await checkRateLimit(ip, config);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...createRateLimitHeaders(result),
          },
        },
      );
    }

    // Call original handler
    const response = await handler(...args);

    // Add rate limit headers to response
    const newHeaders = new Headers(response.headers);
    Object.entries(createRateLimitHeaders(result)).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }) as T;
}
