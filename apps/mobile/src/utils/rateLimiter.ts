/**
 * Rate Limiter Utility
 * Client-side rate limiting to prevent API abuse and improve UX
 * @module utils/rateLimiter
 */

import { logger } from './logger';

/**
 * Rate limiter configuration
 */
interface RateLimiterConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Key to identify the rate limit bucket */
  key?: string;
}

/**
 * Rate limit state
 */
interface RateLimitState {
  requests: number;
  windowStart: number;
}

/**
 * Rate limiter storage
 */
const rateLimitStore = new Map<string, RateLimitState>();

/**
 * Default configurations for different API types
 */
export const RATE_LIMIT_CONFIGS = {
  /** Standard API calls - 100 requests per minute */
  standard: { maxRequests: 100, windowMs: 60000 },
  /** Auth related - 10 requests per minute */
  auth: { maxRequests: 10, windowMs: 60000 },
  /** Search - 30 requests per minute */
  search: { maxRequests: 30, windowMs: 60000 },
  /** Messages - 60 requests per minute */
  messages: { maxRequests: 60, windowMs: 60000 },
  /** Upload - 10 requests per minute */
  upload: { maxRequests: 10, windowMs: 60000 },
  /** Critical actions - 5 requests per minute */
  critical: { maxRequests: 5, windowMs: 60000 },
} as const;

/**
 * Check if request is allowed under rate limit
 *
 * @example
 * ```typescript
 * const { allowed, retryAfter } = checkRateLimit('api', RATE_LIMIT_CONFIGS.standard);
 * if (!allowed) {
 *   showToast(`Rate limited. Please wait ${retryAfter}s`);
 *   return;
 * }
 * ```
 */
export const checkRateLimit = (
  key: string,
  config: RateLimiterConfig,
): { allowed: boolean; remaining: number; retryAfter: number } => {
  const now = Date.now();
  const state = rateLimitStore.get(key);

  // Initialize or reset window
  if (!state || now - state.windowStart >= config.windowMs) {
    rateLimitStore.set(key, {
      requests: 1,
      windowStart: now,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      retryAfter: 0,
    };
  }

  // Check if within limit
  if (state.requests < config.maxRequests) {
    state.requests++;
    return {
      allowed: true,
      remaining: config.maxRequests - state.requests,
      retryAfter: 0,
    };
  }

  // Rate limited
  const retryAfter = Math.ceil(
    (config.windowMs - (now - state.windowStart)) / 1000,
  );

  logger.warn(`Rate limit exceeded for ${key}. Retry after ${retryAfter}s`);

  return {
    allowed: false,
    remaining: 0,
    retryAfter,
  };
};

/**
 * Rate limited function wrapper
 * Wraps an async function with rate limiting
 *
 * @example
 * ```typescript
 * const rateLimitedSearch = withRateLimit(
 *   searchMoments,
 *   'search',
 *   RATE_LIMIT_CONFIGS.search
 * );
 *
 * try {
 *   const results = await rateLimitedSearch(query);
 * } catch (error) {
 *   if (error instanceof RateLimiterError) {
 *     showToast(`Too many requests. Wait ${error.retryAfter}s`);
 *   }
 * }
 * ```
 */
export class RateLimiterError extends Error {
  public readonly retryAfter: number;
  public readonly key: string;

  constructor(key: string, retryAfter: number) {
    super(`Rate limit exceeded for ${key}. Retry after ${retryAfter} seconds.`);
    this.name = 'RateLimiterError';
    this.retryAfter = retryAfter;
    this.key = key;
  }
}

/**
 * Wrap a function with rate limiting
 */
export function withRateLimit<
  T extends (...args: unknown[]) => Promise<unknown>,
>(fn: T, key: string, config: RateLimiterConfig): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const { allowed, retryAfter } = checkRateLimit(key, config);

    if (!allowed) {
      throw new RateLimiterError(key, retryAfter);
    }

    return fn(...args) as ReturnType<T>;
  }) as T;
}

/**
 * Reset rate limit for a specific key
 */
export const resetRateLimit = (key: string): void => {
  rateLimitStore.delete(key);
};

/**
 * Reset all rate limits
 */
export const resetAllRateLimits = (): void => {
  rateLimitStore.clear();
};

/**
 * Get current rate limit status
 */
export const getRateLimitStatus = (
  key: string,
  config: RateLimiterConfig,
): {
  remaining: number;
  reset: number;
  total: number;
} => {
  const state = rateLimitStore.get(key);
  const now = Date.now();

  if (!state || now - state.windowStart >= config.windowMs) {
    return {
      remaining: config.maxRequests,
      reset: 0,
      total: config.maxRequests,
    };
  }

  return {
    remaining: Math.max(0, config.maxRequests - state.requests),
    reset: Math.ceil((config.windowMs - (now - state.windowStart)) / 1000),
    total: config.maxRequests,
  };
};

/**
 * Debounced rate limiter for search/autocomplete
 * Combines debouncing with rate limiting
 */
export class DebouncedRateLimiter {
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly key: string;
  private readonly config: RateLimiterConfig;
  private readonly debounceMs: number;

  constructor(key: string, config: RateLimiterConfig, debounceMs = 300) {
    this.key = key;
    this.config = config;
    this.debounceMs = debounceMs;
  }

  /**
   * Execute function with debounce and rate limit
   */
  execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // Clear existing timeout
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      // Set new timeout
      this.timeoutId = setTimeout(async () => {
        const { allowed, retryAfter } = checkRateLimit(this.key, this.config);

        if (!allowed) {
          reject(new RateLimiterError(this.key, retryAfter));
          return;
        }

        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, this.debounceMs);
    });
  }

  /**
   * Cancel pending execution
   */
  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export default {
  checkRateLimit,
  withRateLimit,
  resetRateLimit,
  resetAllRateLimits,
  getRateLimitStatus,
  RATE_LIMIT_CONFIGS,
  RateLimiterError,
  DebouncedRateLimiter,
};
