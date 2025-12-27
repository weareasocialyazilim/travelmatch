/**
 * Rate Limit - Comprehensive Tests
 *
 * Tests for rate limiting functionality:
 * - Rate limit checking
 * - Pre-configured rate limits
 * - Rate limit headers creation
 * - Higher-order function wrapper
 */

import {
  checkRateLimitSync as checkRateLimit,
  rateLimits,
  createRateLimitHeaders,
  RateLimitConfig,
  RateLimitResult,
  resetToInMemoryStore,
} from '../rate-limit';

describe('Rate Limit', () => {
  beforeEach(() => {
    // Clear any existing rate limit entries between tests
    resetToInMemoryStore();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const config: RateLimitConfig = { limit: 5, windowMs: 60000 };
      const result = checkRateLimit('test-user-1', config);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should decrement remaining count', () => {
      const config: RateLimitConfig = { limit: 5, windowMs: 60000 };
      const identifier = 'test-user-2';

      const result1 = checkRateLimit(identifier, config);
      expect(result1.remaining).toBe(4);

      const result2 = checkRateLimit(identifier, config);
      expect(result2.remaining).toBe(3);

      const result3 = checkRateLimit(identifier, config);
      expect(result3.remaining).toBe(2);
    });

    it('should block requests over limit', () => {
      const config: RateLimitConfig = { limit: 3, windowMs: 60000 };
      const identifier = 'test-user-3';

      // Make requests up to limit
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);

      // Fourth request should be blocked
      const result = checkRateLimit(identifier, config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset after window expires', () => {
      const config: RateLimitConfig = { limit: 2, windowMs: 1000 };
      const identifier = 'test-user-4';

      // Exhaust limit
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);
      const blocked = checkRateLimit(identifier, config);
      expect(blocked.success).toBe(false);

      // Advance time past window
      jest.advanceTimersByTime(1100);

      // Should be allowed again
      const result = checkRateLimit(identifier, config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should use custom key generator', () => {
      const config: RateLimitConfig = {
        limit: 2,
        windowMs: 60000,
        keyGenerator: (id) => `custom-${id}`,
      };

      const result1 = checkRateLimit('user-a', config);
      const result2 = checkRateLimit('user-b', config);

      // Both should have full remaining since different keys
      expect(result1.remaining).toBe(1);
      expect(result2.remaining).toBe(1);
    });

    it('should track different identifiers separately', () => {
      const config: RateLimitConfig = { limit: 2, windowMs: 60000 };

      // User A makes requests
      checkRateLimit('user-a-sep', config);
      checkRateLimit('user-a-sep', config);
      const userABlocked = checkRateLimit('user-a-sep', config);

      // User B should still be allowed
      const userBResult = checkRateLimit('user-b-sep', config);

      expect(userABlocked.success).toBe(false);
      expect(userBResult.success).toBe(true);
    });
  });

  describe('rateLimits presets', () => {
    it('should define auth rate limits', () => {
      expect(rateLimits.auth).toBeDefined();
      expect(rateLimits.auth.limit).toBe(5);
      expect(rateLimits.auth.windowMs).toBe(15 * 60 * 1000);
    });

    it('should define api rate limits', () => {
      expect(rateLimits.api).toBeDefined();
      expect(rateLimits.api.limit).toBe(100);
      expect(rateLimits.api.windowMs).toBe(60 * 1000);
    });

    it('should define sensitive rate limits', () => {
      expect(rateLimits.sensitive).toBeDefined();
      expect(rateLimits.sensitive.limit).toBe(10);
      expect(rateLimits.sensitive.windowMs).toBe(60 * 1000);
    });

    it('should define export rate limits', () => {
      expect(rateLimits.export).toBeDefined();
      expect(rateLimits.export.limit).toBe(5);
      expect(rateLimits.export.windowMs).toBe(60 * 1000);
    });

    it('should define search rate limits', () => {
      expect(rateLimits.search).toBeDefined();
      expect(rateLimits.search.limit).toBe(30);
      expect(rateLimits.search.windowMs).toBe(60 * 1000);
    });

    it('should have strictest limits for auth', () => {
      expect(rateLimits.auth.limit).toBeLessThanOrEqual(rateLimits.api.limit);
      expect(rateLimits.auth.windowMs).toBeGreaterThanOrEqual(
        rateLimits.api.windowMs,
      );
    });
  });

  describe('createRateLimitHeaders', () => {
    it('should create headers for successful request', () => {
      const result: RateLimitResult = {
        success: true,
        remaining: 5,
        resetTime: Date.now() + 60000,
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Remaining']).toBe('5');
      expect(headers['X-RateLimit-Reset']).toBeDefined();
      expect(headers['Retry-After']).toBeUndefined();
    });

    it('should include Retry-After for blocked requests', () => {
      const result: RateLimitResult = {
        success: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 30,
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Remaining']).toBe('0');
      expect(headers['Retry-After']).toBe('30');
    });

    it('should not include Retry-After if not provided', () => {
      const result: RateLimitResult = {
        success: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['Retry-After']).toBeUndefined();
    });
  });

  describe('Rate Limit Scenarios', () => {
    it('should handle burst traffic', () => {
      const config: RateLimitConfig = { limit: 10, windowMs: 60000 };
      const identifier = 'burst-user';

      // Simulate burst of 15 requests
      const results: RateLimitResult[] = [];
      for (let i = 0; i < 15; i++) {
        results.push(checkRateLimit(identifier, config));
      }

      // First 10 should succeed
      expect(results.slice(0, 10).every((r) => r.success)).toBe(true);

      // Last 5 should fail
      expect(results.slice(10).every((r) => !r.success)).toBe(true);
    });

    it('should correctly calculate retryAfter', () => {
      const config: RateLimitConfig = { limit: 1, windowMs: 60000 };
      const identifier = 'retry-after-user';

      // Exhaust limit
      checkRateLimit(identifier, config);

      // Next request should be blocked with retryAfter
      const blocked = checkRateLimit(identifier, config);

      expect(blocked.success).toBe(false);
      expect(blocked.retryAfter).toBeDefined();
      expect(blocked.retryAfter).toBeGreaterThan(0);
      expect(blocked.retryAfter).toBeLessThanOrEqual(60);
    });

    it('should handle edge case of exactly at limit', () => {
      const config: RateLimitConfig = { limit: 3, windowMs: 60000 };
      const identifier = 'exact-limit-user';

      // Make exactly limit number of requests
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);
      const atLimit = checkRateLimit(identifier, config);

      expect(atLimit.success).toBe(true);
      expect(atLimit.remaining).toBe(0);

      // Next request should fail
      const overLimit = checkRateLimit(identifier, config);
      expect(overLimit.success).toBe(false);
    });

    it('should handle concurrent requests from same user', () => {
      const config: RateLimitConfig = { limit: 5, windowMs: 60000 };
      const identifier = 'concurrent-user';

      // Simulate concurrent requests
      const promises = Array(7)
        .fill(null)
        .map(() => Promise.resolve(checkRateLimit(identifier, config)));

      return Promise.all(promises).then((results) => {
        const successCount = results.filter((r) => r.success).length;
        const failCount = results.filter((r) => !r.success).length;

        expect(successCount).toBe(5);
        expect(failCount).toBe(2);
      });
    });
  });

  describe('Rate Limit with Auth Preset', () => {
    it('should block after 5 auth attempts', () => {
      const identifier = 'auth-test-user';

      // Make 5 auth attempts
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(identifier, rateLimits.auth);
        expect(result.success).toBe(true);
      }

      // 6th attempt should be blocked
      const blocked = checkRateLimit(identifier, rateLimits.auth);
      expect(blocked.success).toBe(false);
    });
  });

  describe('Rate Limit with API Preset', () => {
    it('should allow 100 API requests per minute', () => {
      const identifier = 'api-test-user';

      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        const result = checkRateLimit(identifier, rateLimits.api);
        expect(result.success).toBe(true);
      }

      // 101st should be blocked
      const blocked = checkRateLimit(identifier, rateLimits.api);
      expect(blocked.success).toBe(false);
    });
  });
});
