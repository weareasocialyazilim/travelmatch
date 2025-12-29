/**
 * ⚠️ DEPRECATED: In-memory Rate Limiting
 *
 * This file is kept for backward compatibility but should not be used in production.
 * Use upstashRateLimit.ts for production-ready distributed rate limiting.
 *
 * Migration Guide:
 * ```typescript
 * // OLD (in-memory, not distributed)
 * import { createRateLimiter } from '../_shared/rateLimit.ts';
 *
 * // NEW (Upstash Redis, distributed)
 * import { createUpstashRateLimiter, RateLimitPresets } from '../_shared/upstashRateLimit.ts';
 *
 * const limiter = createUpstashRateLimiter(RateLimitPresets.STANDARD);
 * ```
 *
 * @deprecated Use upstashRateLimit.ts instead
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { Logger } from './logger.ts';

const logger = new Logger('rate-limit-deprecated');

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  keyPrefix?: string; // Prefix for rate limit keys
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter?: number; // seconds until reset
}

export class RateLimiter {
  private config: Required<RateLimitConfig>;
  private supabase: ReturnType<typeof createClient>;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyPrefix: 'ratelimit',
      ...config,
    };

    // Initialize Supabase client for storing rate limit data
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get client identifier from request
   */
  private getClientId(req: Request): string {
    // Try to get user ID from JWT
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.sub) return `user:${payload.sub}`;
      } catch {
        // Fall through to IP-based limiting
      }
    }

    // Fallback to IP address
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    return `ip:${ip}`;
  }

  /**
   * Check rate limit for request
   */
  async check(req: Request): Promise<RateLimitResult> {
    const clientId = this.getClientId(req);
    const key = `${this.config.keyPrefix}:${clientId}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Get or create rate limit record
      const { data: existing } = await this.supabase
        .from('rate_limits')
        .select('*')
        .eq('key', key)
        .single();

      if (!existing) {
        // First request - create record
        await this.supabase.from('rate_limits').insert({
          key,
          count: 1,
          window_start: new Date(now).toISOString(),
          expires_at: new Date(now + this.config.windowMs).toISOString(),
        });

        return {
          ok: true,
          remaining: this.config.max - 1,
        };
      }

      const expiresAt = new Date(existing.expires_at).getTime();

      // Check if window has expired
      if (now > expiresAt) {
        // Reset counter
        await this.supabase
          .from('rate_limits')
          .update({
            count: 1,
            window_start: new Date(now).toISOString(),
            expires_at: new Date(now + this.config.windowMs).toISOString(),
          })
          .eq('key', key);

        return {
          ok: true,
          remaining: this.config.max - 1,
        };
      }

      // Within window - check limit
      if (existing.count >= this.config.max) {
        const retryAfter = Math.ceil((expiresAt - now) / 1000);
        return {
          ok: false,
          remaining: 0,
          retryAfter,
        };
      }

      // Increment counter
      await this.supabase
        .from('rate_limits')
        .update({ count: existing.count + 1 })
        .eq('key', key);

      return {
        ok: true,
        remaining: this.config.max - existing.count - 1,
      };
    } catch (error) {
      logger.error(
        'Rate limit check failed',
        error instanceof Error ? error : new Error(String(error)),
      );
      // On error, allow request (fail open)
      return { ok: true, remaining: this.config.max };
    }
  }
}

/**
 * Create rate limiter instance
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimitPresets = {
  // Strict limit for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
  },

  // Medium limit for signup
  signup: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 signups per hour
  },

  // Generous limit for general API
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests
  },

  // Tight limit for password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts
  },
};
