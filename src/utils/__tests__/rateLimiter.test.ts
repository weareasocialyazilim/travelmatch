/**
 * Rate Limiter Tests
 */
import {
  checkRateLimit,
  withRateLimit,
  resetRateLimit,
  resetAllRateLimits,
  getRateLimitStatus,
  RateLimitError,
  DebouncedRateLimiter,
  RATE_LIMIT_CONFIGS,
} from '../rateLimiter';

describe('rateLimiter', () => {
  beforeEach(() => {
    resetAllRateLimits();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const config = { maxRequests: 5, windowMs: 60000 };

      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit('test', config);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });

    it('should block requests exceeding limit', () => {
      const config = { maxRequests: 3, windowMs: 60000 };

      // Use up all requests
      for (let i = 0; i < 3; i++) {
        checkRateLimit('test', config);
      }

      // Next request should be blocked
      const result = checkRateLimit('test', config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should use separate buckets for different keys', () => {
      const config = { maxRequests: 2, windowMs: 60000 };

      checkRateLimit('key1', config);
      checkRateLimit('key1', config);
      const result1 = checkRateLimit('key1', config);

      const result2 = checkRateLimit('key2', config);

      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(true);
    });

    it('should reset after window expires', () => {
      jest.useFakeTimers();
      const config = { maxRequests: 2, windowMs: 1000 };

      checkRateLimit('test', config);
      checkRateLimit('test', config);
      expect(checkRateLimit('test', config).allowed).toBe(false);

      // Advance time past window
      jest.advanceTimersByTime(1001);

      expect(checkRateLimit('test', config).allowed).toBe(true);
      jest.useRealTimers();
    });
  });

  describe('withRateLimit', () => {
    it('should execute function when under limit', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const limitedFn = withRateLimit(
        mockFn,
        'test',
        RATE_LIMIT_CONFIGS.standard,
      );

      const result = await limitedFn();

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalled();
    });

    it('should throw RateLimitError when over limit', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const config = { maxRequests: 1, windowMs: 60000 };
      const limitedFn = withRateLimit(mockFn, 'test', config);

      await limitedFn();

      await expect(limitedFn()).rejects.toThrow(RateLimitError);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return full capacity for new keys', () => {
      const config = { maxRequests: 10, windowMs: 60000 };
      const status = getRateLimitStatus('new-key', config);

      expect(status.remaining).toBe(10);
      expect(status.total).toBe(10);
      expect(status.reset).toBe(0);
    });

    it('should return correct remaining requests', () => {
      const config = { maxRequests: 10, windowMs: 60000 };

      checkRateLimit('test', config);
      checkRateLimit('test', config);
      checkRateLimit('test', config);

      const status = getRateLimitStatus('test', config);
      expect(status.remaining).toBe(7);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset specific key', () => {
      const config = { maxRequests: 2, windowMs: 60000 };

      checkRateLimit('test', config);
      checkRateLimit('test', config);
      expect(checkRateLimit('test', config).allowed).toBe(false);

      resetRateLimit('test');

      expect(checkRateLimit('test', config).allowed).toBe(true);
    });
  });

  describe('RateLimitError', () => {
    it('should have correct properties', () => {
      const error = new RateLimitError('test', 30);

      expect(error.name).toBe('RateLimitError');
      expect(error.key).toBe('test');
      expect(error.retryAfter).toBe(30);
      expect(error.message).toContain('test');
      expect(error.message).toContain('30');
    });
  });

  describe('DebouncedRateLimiter', () => {
    it('should debounce rapid calls', async () => {
      jest.useFakeTimers();
      const mockFn = jest.fn().mockResolvedValue('result');
      const limiter = new DebouncedRateLimiter(
        'test',
        RATE_LIMIT_CONFIGS.search,
        300,
      );

      // Trigger multiple executions rapidly
      limiter.execute(mockFn);
      limiter.execute(mockFn);
      limiter.execute(mockFn);

      // Function shouldn't be called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Advance past debounce
      jest.advanceTimersByTime(301);

      // Should only be called once
      await Promise.resolve(); // Flush promises
      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('should cancel pending execution', () => {
      jest.useFakeTimers();
      const mockFn = jest.fn().mockResolvedValue('result');
      const limiter = new DebouncedRateLimiter(
        'test',
        RATE_LIMIT_CONFIGS.search,
        300,
      );

      limiter.execute(mockFn);
      limiter.cancel();

      jest.advanceTimersByTime(500);

      expect(mockFn).not.toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe('RATE_LIMIT_CONFIGS', () => {
    it('should have all expected configurations', () => {
      expect(RATE_LIMIT_CONFIGS.standard).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.auth).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.search).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.messages).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.upload).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.critical).toBeDefined();
    });

    it('should have stricter limits for auth', () => {
      expect(RATE_LIMIT_CONFIGS.auth.maxRequests).toBeLessThan(
        RATE_LIMIT_CONFIGS.standard.maxRequests,
      );
    });
  });
});
