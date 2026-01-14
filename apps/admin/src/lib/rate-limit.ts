/**
 * Rate Limiting for API Routes
 *
 * Provides in-memory rate limiting for API protection.
 * Cloudflare handles DDoS and edge-level protection.
 *
 * @module lib/rate-limit
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// ============================================================================
// IN-MEMORY STORE
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
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check if a request is rate limited
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
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
 * Synchronous rate limit check
 */
export function checkRateLimitSync(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  const { limit, windowMs, keyGenerator } = config;
  const key = keyGenerator ? keyGenerator(identifier) : identifier;
  const now = Date.now();

  let entry = memoryStore.get(key);

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

  entry.count++;

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
