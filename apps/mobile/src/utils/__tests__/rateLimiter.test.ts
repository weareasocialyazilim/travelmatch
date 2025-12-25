import {
  checkRateLimit,
  withRateLimit,
  resetRateLimit,
  resetAllRateLimits,
  getRateLimitStatus,
  RateLimiterError,
  DebouncedRateLimiter,
  RATE_LIMIT_CONFIGS,
} from '../../utils/rateLimiter';

describe('rateLimiter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAllRateLimits();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('checkRateLimit', () => {
    describe('window management', () => {
      it('should allow first request and initialize window', () => {
        const result = checkRateLimit('test-key', RATE_LIMIT_CONFIGS.standard);

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(99); // 100 - 1
        expect(result.retryAfter).toBe(0);
      });

      it('should reset window after windowMs expires', () => {
        jest.useFakeTimers();
        const config = { maxRequests: 2, windowMs: 1000 };

        // Exhaust limit
        checkRateLimit('test-key', config);
        checkRateLimit('test-key', config);

        const blocked = checkRateLimit('test-key', config);
        expect(blocked.allowed).toBe(false);

        // Fast forward past window
        jest.advanceTimersByTime(1001);

        const allowed = checkRateLimit('test-key', config);
        expect(allowed.allowed).toBe(true);
        expect(allowed.remaining).toBe(1); // New window

        jest.useRealTimers();
      });

      it('should maintain separate windows for different keys', () => {
        const config = { maxRequests: 1, windowMs: 1000 };

        const result1 = checkRateLimit('key-1', config);
        const result2 = checkRateLimit('key-2', config);

        expect(result1.allowed).toBe(true);
        expect(result2.allowed).toBe(true);

        // Both should be rate limited independently
        const blocked1 = checkRateLimit('key-1', config);
        const blocked2 = checkRateLimit('key-2', config);

        expect(blocked1.allowed).toBe(false);
        expect(blocked2.allowed).toBe(false);
      });
    });

    describe('rate limit enforcement', () => {
      it('should enforce maxRequests limit', () => {
        const config = { maxRequests: 3, windowMs: 60000 };

        const r1 = checkRateLimit('test-key', config);
        const r2 = checkRateLimit('test-key', config);
        const r3 = checkRateLimit('test-key', config);
        const r4 = checkRateLimit('test-key', config);

        expect(r1.allowed).toBe(true);
        expect(r1.remaining).toBe(2);
        expect(r2.allowed).toBe(true);
        expect(r2.remaining).toBe(1);
        expect(r3.allowed).toBe(true);
        expect(r3.remaining).toBe(0);
        expect(r4.allowed).toBe(false);
        expect(r4.remaining).toBe(0);
      });

      it('should calculate correct retryAfter when rate limited', () => {
        jest.useFakeTimers();
        const config = { maxRequests: 1, windowMs: 5000 };

        checkRateLimit('test-key', config);
        jest.advanceTimersByTime(2000);

        const blocked = checkRateLimit('test-key', config);

        expect(blocked.allowed).toBe(false);
        expect(blocked.retryAfter).toBeGreaterThan(0);
        expect(blocked.retryAfter).toBeLessThanOrEqual(3); // ~3 seconds left

        jest.useRealTimers();
      });

      it('should handle zero maxRequests', () => {
        const config = { maxRequests: 0, windowMs: 1000 };

        const result = checkRateLimit('test-key', config);

        // First call initializes window but still allows (edge case behavior)
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(-1); // maxRequests - 1 = -1
        
        // Second call should be blocked
        const blocked = checkRateLimit('test-key', config);
        expect(blocked.allowed).toBe(false);
        expect(blocked.remaining).toBe(0);
      });
    });

    describe('burst handling', () => {
      it('should handle rapid successive requests correctly', () => {
        const config = { maxRequests: 5, windowMs: 1000 };
        const results = [];

        for (let i = 0; i < 10; i++) {
          results.push(checkRateLimit('burst-key', config));
        }

        const allowed = results.filter((r) => r.allowed);
        const blocked = results.filter((r) => !r.allowed);

        expect(allowed.length).toBe(5);
        expect(blocked.length).toBe(5);
      });

      it('should maintain correct remaining count during burst', () => {
        const config = { maxRequests: 3, windowMs: 1000 };

        const r1 = checkRateLimit('burst-key', config);
        const r2 = checkRateLimit('burst-key', config);
        const r3 = checkRateLimit('burst-key', config);

        expect(r1.remaining).toBe(2);
        expect(r2.remaining).toBe(1);
        expect(r3.remaining).toBe(0);
      });
    });

    describe('preset configurations', () => {
      it('should work with standard config', () => {
        const result = checkRateLimit('std', RATE_LIMIT_CONFIGS.standard);

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(99); // 100 - 1
      });

      it('should work with auth config', () => {
        const result = checkRateLimit('auth', RATE_LIMIT_CONFIGS.auth);

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(9); // 10 - 1
      });

      it('should work with search config', () => {
        const result = checkRateLimit('search', RATE_LIMIT_CONFIGS.search);

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(29); // 30 - 1
      });

      it('should work with messages config', () => {
        const result = checkRateLimit('msg', RATE_LIMIT_CONFIGS.messages);

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(59); // 60 - 1
      });

      it('should work with upload config', () => {
        const result = checkRateLimit('upload', RATE_LIMIT_CONFIGS.upload);

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(9); // 10 - 1
      });

      it('should work with critical config', () => {
        const result = checkRateLimit('crit', RATE_LIMIT_CONFIGS.critical);

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4); // 5 - 1
      });
    });
  });

  describe('RateLimiterError', () => {
    it('should create error with correct properties', () => {
      const error = new RateLimiterError('test-key', 30);

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('RateLimiterError');
      expect(error.key).toBe('test-key');
      expect(error.retryAfter).toBe(30);
      expect(error.message).toContain('test-key');
      expect(error.message).toContain('30');
    });

    it('should be catchable as Error', () => {
      const error = new RateLimiterError('key', 10);

      expect(() => {
        throw error;
      }).toThrow(Error);
    });
  });

  describe('withRateLimit', () => {
    it('should allow function execution when under limit', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const config = { maxRequests: 5, windowMs: 1000 };

      const wrapped = withRateLimit(mockFn, 'test-key', config);
      const result = await wrapped('arg1', 'arg2');

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should throw RateLimiterError when rate limited', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const config = { maxRequests: 1, windowMs: 1000 };

      const wrapped = withRateLimit(mockFn, 'test-key', config);

      await wrapped(); // First call succeeds

      await expect(wrapped()).rejects.toThrow(RateLimiterError);
      expect(mockFn).toHaveBeenCalledTimes(1); // Only first call executed
    });

    it('should preserve function arguments and return types', async () => {
      const mockFn = jest.fn((a: number, b: string) => Promise.resolve(a + b.length));
      const config = { maxRequests: 5, windowMs: 1000 };

      const wrapped = withRateLimit(mockFn, 'test-key', config);
      const result = await wrapped(10, 'test');

      expect(result).toBe(14);
      expect(mockFn).toHaveBeenCalledWith(10, 'test');
    });

    it('should propagate function errors', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Function error'));
      const config = { maxRequests: 5, windowMs: 1000 };

      const wrapped = withRateLimit(mockFn, 'test-key', config);

      await expect(wrapped()).rejects.toThrow('Function error');
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for specific key', () => {
      const config = { maxRequests: 1, windowMs: 1000 };

      checkRateLimit('test-key', config); // Exhaust limit
      const blocked = checkRateLimit('test-key', config);
      expect(blocked.allowed).toBe(false);

      resetRateLimit('test-key');

      const allowed = checkRateLimit('test-key', config);
      expect(allowed.allowed).toBe(true);
    });

    it('should not affect other keys', () => {
      const config = { maxRequests: 1, windowMs: 1000 };

      checkRateLimit('key-1', config);
      checkRateLimit('key-2', config);

      resetRateLimit('key-1');

      const r1 = checkRateLimit('key-1', config);
      const r2 = checkRateLimit('key-2', config);

      expect(r1.allowed).toBe(true); // Reset
      expect(r2.allowed).toBe(false); // Not reset
    });

    it('should handle non-existent keys gracefully', () => {
      expect(() => resetRateLimit('non-existent')).not.toThrow();
    });
  });

  describe('resetAllRateLimits', () => {
    it('should reset all rate limits', () => {
      const config = { maxRequests: 1, windowMs: 1000 };

      checkRateLimit('key-1', config);
      checkRateLimit('key-2', config);
      checkRateLimit('key-3', config);

      resetAllRateLimits();

      const r1 = checkRateLimit('key-1', config);
      const r2 = checkRateLimit('key-2', config);
      const r3 = checkRateLimit('key-3', config);

      expect(r1.allowed).toBe(true);
      expect(r2.allowed).toBe(true);
      expect(r3.allowed).toBe(true);
    });

    it('should allow immediate reuse after reset', () => {
      const config = { maxRequests: 2, windowMs: 1000 };

      checkRateLimit('test-key', config);
      checkRateLimit('test-key', config);

      resetAllRateLimits();

      const r1 = checkRateLimit('test-key', config);
      const r2 = checkRateLimit('test-key', config);

      expect(r1.allowed).toBe(true);
      expect(r2.allowed).toBe(true);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return full remaining count for new key', () => {
      const config = { maxRequests: 10, windowMs: 1000 };

      const status = getRateLimitStatus('new-key', config);

      expect(status.remaining).toBe(10);
      expect(status.total).toBe(10);
      expect(status.reset).toBe(0);
    });

    it('should return correct remaining after requests', () => {
      const config = { maxRequests: 5, windowMs: 1000 };

      checkRateLimit('test-key', config);
      checkRateLimit('test-key', config);

      const status = getRateLimitStatus('test-key', config);

      expect(status.remaining).toBe(3);
      expect(status.total).toBe(5);
    });

    it('should return zero remaining when rate limited', () => {
      const config = { maxRequests: 2, windowMs: 1000 };

      checkRateLimit('test-key', config);
      checkRateLimit('test-key', config);

      const status = getRateLimitStatus('test-key', config);

      expect(status.remaining).toBe(0);
      expect(status.total).toBe(2);
    });

    it('should calculate reset time correctly', () => {
      jest.useFakeTimers();
      const config = { maxRequests: 1, windowMs: 5000 };

      checkRateLimit('test-key', config);
      jest.advanceTimersByTime(2000);

      const status = getRateLimitStatus('test-key', config);

      expect(status.reset).toBeGreaterThan(0);
      expect(status.reset).toBeLessThanOrEqual(3); // ~3 seconds left

      jest.useRealTimers();
    });

    it('should reset to full remaining after window expires', () => {
      jest.useFakeTimers();
      const config = { maxRequests: 5, windowMs: 1000 };

      checkRateLimit('test-key', config);
      jest.advanceTimersByTime(1001);

      const status = getRateLimitStatus('test-key', config);

      expect(status.remaining).toBe(5);
      expect(status.reset).toBe(0);

      jest.useRealTimers();
    });
  });

  describe('DebouncedRateLimiter', () => {
    it('should debounce multiple rapid calls', async () => {
      jest.useFakeTimers();
      const mockFn = jest.fn().mockResolvedValue('result');
      const config = { maxRequests: 10, windowMs: 1000 };
      const limiter = new DebouncedRateLimiter('test-key', config, 300);

      limiter.execute(mockFn);
      limiter.execute(mockFn);
      limiter.execute(mockFn);

      jest.advanceTimersByTime(300);
      await Promise.resolve(); // Wait for promise resolution

      expect(mockFn).toHaveBeenCalledTimes(1); // Only last call executed

      jest.useRealTimers();
    });

    it('should respect rate limit after debounce', async () => {
      jest.useFakeTimers();
      const mockFn = jest.fn().mockResolvedValue('result');
      const config = { maxRequests: 1, windowMs: 5000 };
      const limiter = new DebouncedRateLimiter('test-key', config, 100);

      // First execution
      const promise1 = limiter.execute(mockFn);
      jest.advanceTimersByTime(100);
      await promise1;

      // Second execution (should be rate limited)
      const promise2 = limiter.execute(mockFn);
      jest.advanceTimersByTime(100);

      await expect(promise2).rejects.toThrow(RateLimiterError);

      jest.useRealTimers();
    });

    it('should cancel pending execution', async () => {
      jest.useFakeTimers();
      const mockFn = jest.fn().mockResolvedValue('result');
      const config = { maxRequests: 10, windowMs: 1000 };
      const limiter = new DebouncedRateLimiter('test-key', config, 300);

      limiter.execute(mockFn);
      limiter.cancel();

      jest.advanceTimersByTime(300);
      await Promise.resolve();

      expect(mockFn).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should handle function errors', async () => {
      jest.useFakeTimers();
      const mockFn = jest.fn().mockRejectedValue(new Error('Test error'));
      const config = { maxRequests: 10, windowMs: 1000 };
      const limiter = new DebouncedRateLimiter('test-key', config, 100);

      const promise = limiter.execute(mockFn);
      jest.advanceTimersByTime(100);

      await expect(promise).rejects.toThrow('Test error');

      jest.useRealTimers();
    });

    it('should use default debounce time', async () => {
      jest.useFakeTimers();
      const mockFn = jest.fn().mockResolvedValue('result');
      const config = { maxRequests: 10, windowMs: 1000 };
      const limiter = new DebouncedRateLimiter('test-key', config); // No debounceMs

      const promise = limiter.execute(mockFn);
      jest.advanceTimersByTime(300); // Default is 300ms
      await promise;

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('should support custom debounce times', async () => {
      jest.useFakeTimers();
      const mockFn = jest.fn().mockResolvedValue('result');
      const config = { maxRequests: 10, windowMs: 1000 };
      const limiter = new DebouncedRateLimiter('test-key', config, 500);

      const promise = limiter.execute(mockFn);
      jest.advanceTimersByTime(500);
      await promise;

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });

  describe('edge cases', () => {
    it('should handle concurrent requests on same key', () => {
      const config = { maxRequests: 3, windowMs: 1000 };

      const results = Array.from({ length: 5 }, () =>
        checkRateLimit('concurrent-key', config),
      );

      const allowed = results.filter((r) => r.allowed).length;
      const blocked = results.filter((r) => !r.allowed).length;

      expect(allowed).toBe(3);
      expect(blocked).toBe(2);
    });

    it('should handle very short windows', () => {
      jest.useFakeTimers();
      const config = { maxRequests: 1, windowMs: 1 };

      checkRateLimit('test-key', config);
      jest.advanceTimersByTime(2);

      const result = checkRateLimit('test-key', config);
      expect(result.allowed).toBe(true);

      jest.useRealTimers();
    });

    it('should handle very long windows', () => {
      const config = { maxRequests: 1, windowMs: 86400000 }; // 24 hours

      const r1 = checkRateLimit('test-key', config);
      const r2 = checkRateLimit('test-key', config);

      expect(r1.allowed).toBe(true);
      expect(r2.allowed).toBe(false);
    });

    it('should handle large maxRequests', () => {
      const config = { maxRequests: 1000, windowMs: 1000 };

      for (let i = 0; i < 1000; i++) {
        const result = checkRateLimit('test-key', config);
        expect(result.allowed).toBe(true);
      }

      const blocked = checkRateLimit('test-key', config);
      expect(blocked.allowed).toBe(false);
    });

    it('should handle special characters in keys', () => {
      const config = { maxRequests: 1, windowMs: 1000 };

      const r1 = checkRateLimit('key-with-@#$%^&*()', config);
      const r2 = checkRateLimit('key-with-@#$%^&*()', config);

      expect(r1.allowed).toBe(true);
      expect(r2.allowed).toBe(false);
    });

    it('should handle empty string keys', () => {
      const config = { maxRequests: 1, windowMs: 1000 };

      const r1 = checkRateLimit('', config);
      const r2 = checkRateLimit('', config);

      expect(r1.allowed).toBe(true);
      expect(r2.allowed).toBe(false);
    });
  });
});
