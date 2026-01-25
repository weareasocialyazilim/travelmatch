/**
 * Rate Limiting for API Routes
 *
 * Provides distributed rate limiting via Upstash Redis with in-memory fallback.
 * Cloudflare handles DDoS and edge-level protection.
 *
 * @module lib/rate-limit
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// ============================================================================
// UPSTASH REDIS CLIENT (if configured)
// ============================================================================

let redis: Redis | null = null;
let upstashRateLimiter: Ratelimit | null = null;

// Initialize Upstash if environment variables are available
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    upstashRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'lovendo:ratelimit',
    });

    console.log('[RateLimit] Upstash Redis initialized successfully');
  } catch (error) {
    console.warn('[RateLimit] Failed to initialize Upstash, using in-memory fallback:', error);
    redis = null;
    upstashRateLimiter = null;
  }
}

// ============================================================================
// IN-MEMORY STORE (fallback)
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

// ============================================================================
// RATE LIMIT CONFIGURATION
// ============================================================================

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional custom key generator */
  keyGenerator?: (identifier: string) => string;
  /** Use Upstash Redis if available (default: true) */
  useRedis?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check if Upstash Redis is available
 */
export function isRedisAvailable(): boolean {
  return redis !== null && upstashRateLimiter !== null;
}

/**
 * Reset in-memory store (for testing)
 */
export function resetToInMemoryStore() {
  memoryStore.clear();
}

/**
 * Check if a request is rate limited (async - supports Redis)
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const { limit, windowMs, keyGenerator, useRedis = true } = config;
  const key = keyGenerator ? keyGenerator(identifier) : identifier;

  // Try Upstash Redis first if available and enabled
  if (useRedis && upstashRateLimiter) {
    try {
      const result = await upstashRateLimiter.limit(key);
      return {
        success: result.success,
        remaining: result.remaining,
        resetTime: result.reset,
        retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
      };
    } catch (error) {
      console.warn('[RateLimit] Upstash error, falling back to in-memory:', error);
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  return checkRateLimitInMemory(key, limit, windowMs);
}

/**
 * In-memory rate limit check
 */
function checkRateLimitInMemory(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
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
 * Synchronous rate limit check (in-memory only)
 */
export function checkRateLimitSync(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  const { limit, windowMs, keyGenerator } = config;
  const key = keyGenerator ? keyGenerator(identifier) : identifier;
  return checkRateLimitInMemory(key, limit, windowMs);
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
  // 2FA verification - very strict to prevent brute force
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
 */
export function withRateLimit<
  T extends (...args: unknown[]) => Promise<Response>,
>(handler: T, config: RateLimitConfig = rateLimits.api): T {
  return (async (...args: Parameters<T>) => {
    const request = args[0] as Request;

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

    const response = await handler(...args);

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

/**
 * Reset rate limit store (useful for testing)
 */
export function resetRateLimitStore(): void {
  memoryStore.clear();
}

/**
 * Create a custom rate limiter with Upstash Redis
 */
export function createRateLimiter(
  requests: number,
  window: `${number} s` | `${number} m` | `${number} h` | `${number} d`,
  prefix?: string,
): Ratelimit | null {
  if (!redis) {
    console.warn('[RateLimit] Redis not available for custom rate limiter');
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: prefix || 'lovendo:custom',
  });
}
