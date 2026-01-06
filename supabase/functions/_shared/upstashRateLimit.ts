/**
 * Upstash Redis Rate Limiting for Supabase Edge Functions
 *
 * Production-ready rate limiting using Upstash Redis
 * Replaces in-memory rate limiting with persistent, distributed storage
 *
 * Setup:
 * 1. Create Upstash Redis database at https://console.upstash.com/
 * 2. Add secrets to Supabase:
 *    - UPSTASH_REDIS_REST_URL
 *    - UPSTASH_REDIS_REST_TOKEN
 *
 * Usage:
 * ```typescript
 * import { createUpstashRateLimiter } from '../_shared/upstashRateLimit.ts';
 *
 * const limiter = createUpstashRateLimiter({
 *   windowMs: 60000, // 1 minute
 *   maxRequests: 10,
 * });
 *
 * serve(async (req) => {
 *   const result = await limiter.check(req);
 *   if (!result.success) {
 *     return new Response(JSON.stringify({
 *       error: 'Too many requests',
 *       retryAfter: result.reset
 *     }), {
 *       status: 429,
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
 *         'X-RateLimit-Limit': String(result.limit),
 *         'X-RateLimit-Remaining': String(result.remaining),
 *         'X-RateLimit-Reset': String(result.reset),
 *       }
 *     });
 *   }
 *   // ... your handler logic
 * });
 * ```
 */

export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Optional key prefix (default: 'ratelimit') */
  keyPrefix?: string;
}

import { Logger } from './logger.ts';
const logger = new Logger('rate-limit');

export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Maximum requests allowed */
  limit: number;
  /** Remaining requests in current window */
  remaining: number;
  /** Timestamp when the limit resets (ms) */
  reset: number;
  /** Pending requests (for retry logic) */
  pending?: number;
}

/**
 * Upstash Redis Rate Limiter using sliding window algorithm
 */
export class UpstashRateLimiter {
  private baseUrl: string;
  private token: string;
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    const upstashUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
    const upstashToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

    if (!upstashUrl || !upstashToken) {
      throw new Error(
        'Missing Upstash Redis credentials. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.',
      );
    }

    this.baseUrl = upstashUrl;
    this.token = upstashToken;
    this.config = {
      keyPrefix: 'ratelimit',
      ...config,
    };
  }

  /**
   * Extract client identifier from request
   */
  private getClientId(req: Request): string {
    // Priority 1: User ID from JWT
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const tokenPart = token.split('.')[1];
        if (!tokenPart) throw new Error('Invalid token format');
        const payload = JSON.parse(atob(tokenPart));
        if (payload.sub) {
          return `user:${payload.sub}`;
        }
      } catch (tokenError) {
        // Fall through to IP-based limiting
      }
    }

    // Priority 2: IP address
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded
      ? (forwarded.split(',')[0]?.trim() ?? 'unknown')
      : 'unknown';
    return `ip:${ip}`;
  }

  /**
   * Execute Redis command via REST API
   */
  private async redis(command: string[]): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${command.join('/')}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Redis command failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
  }

  /**
   * Check rate limit using sliding window counter
   */
  async check(req: Request): Promise<RateLimitResult> {
    const clientId = this.getClientId(req);
    const key = `${this.config.keyPrefix}:${clientId}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Use Redis sorted set for sliding window
      // Score = timestamp, Value = unique request ID
      const requestId = `${now}:${Math.random()}`;

      // Pipeline commands for atomic operation
      // 1. Remove old entries outside the window
      await this.redis(['ZREMRANGEBYSCORE', key, '0', String(windowStart)]);

      // 2. Add current request
      await this.redis(['ZADD', key, String(now), requestId]);

      // 3. Count requests in window
      const count = (await this.redis(['ZCARD', key])) as number;

      // 4. Set expiration (cleanup)
      const ttlSeconds = Math.ceil(this.config.windowMs / 1000);
      await this.redis(['EXPIRE', key, String(ttlSeconds)]);

      const remaining = Math.max(0, this.config.maxRequests - count);
      const reset = now + this.config.windowMs;

      return {
        success: count <= this.config.maxRequests,
        limit: this.config.maxRequests,
        remaining,
        reset,
      };
    } catch (error) {
      // On Redis error, fail open (allow request) but log error
      logger.error(
        'Rate limit check failed',
        error instanceof Error ? error : new Error(String(error)),
      );
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        reset: now + this.config.windowMs,
      };
    }
  }

  /**
   * Reset rate limit for a specific client
   * Useful for admin operations or testing
   */
  async reset(req: Request): Promise<void> {
    const clientId = this.getClientId(req);
    const key = `${this.config.keyPrefix}:${clientId}`;
    await this.redis(['DEL', key]);
  }

  /**
   * Get current rate limit status without incrementing
   */
  async status(req: Request): Promise<RateLimitResult> {
    const clientId = this.getClientId(req);
    const key = `${this.config.keyPrefix}:${clientId}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Remove old entries
      await this.redis(['ZREMRANGEBYSCORE', key, '0', String(windowStart)]);

      // Count current requests
      const count = (await this.redis(['ZCARD', key])) as number;

      const remaining = Math.max(0, this.config.maxRequests - count);
      const reset = now + this.config.windowMs;

      return {
        success: count < this.config.maxRequests,
        limit: this.config.maxRequests,
        remaining,
        reset,
      };
    } catch (error) {
      logger.error(
        'Rate limit status check failed',
        error instanceof Error ? error : new Error(String(error)),
      );
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        reset: now + this.config.windowMs,
      };
    }
  }
}

/**
 * Factory function to create rate limiter instance
 */
export function createUpstashRateLimiter(
  config: RateLimitConfig,
): UpstashRateLimiter {
  return new UpstashRateLimiter(config);
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimitPresets = {
  /** Strict: 5 requests per minute */
  STRICT: { windowMs: 60000, maxRequests: 5 },

  /** Standard: 30 requests per minute */
  STANDARD: { windowMs: 60000, maxRequests: 30 },

  /** Relaxed: 100 requests per minute */
  RELAXED: { windowMs: 60000, maxRequests: 100 },

  /** Auth: 5 login attempts per 15 minutes */
  AUTH: { windowMs: 900000, maxRequests: 5 },

  /** Payment: 10 requests per hour */
  PAYMENT: { windowMs: 3600000, maxRequests: 10 },

  /** Upload: 20 uploads per hour */
  UPLOAD: { windowMs: 3600000, maxRequests: 20 },
};
