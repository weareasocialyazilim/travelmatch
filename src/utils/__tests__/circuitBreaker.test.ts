/**
 * Circuit Breaker Tests
 */
import {
  CircuitBreaker,
  CircuitBreakerError,
  CircuitState,
  circuitBreakerRegistry,
  ServiceBreakers,
} from '../circuitBreaker';

describe('CircuitBreaker', () => {
  beforeEach(() => {
    circuitBreakerRegistry.resetAll();
  });

  describe('initial state', () => {
    it('should start in CLOSED state', () => {
      const breaker = new CircuitBreaker();
      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should have zero failure count', () => {
      const breaker = new CircuitBreaker();
      const stats = breaker.getStats();
      expect(stats.failureCount).toBe(0);
      expect(stats.successCount).toBe(0);
    });
  });

  describe('execute', () => {
    it('should execute function successfully', async () => {
      const breaker = new CircuitBreaker();
      const result = await breaker.execute(() => Promise.resolve('success'));
      expect(result).toBe('success');
    });

    it('should pass through errors', async () => {
      const breaker = new CircuitBreaker();
      await expect(
        breaker.execute(() => Promise.reject(new Error('test error'))),
      ).rejects.toThrow('test error');
    });

    it('should track failures', async () => {
      const breaker = new CircuitBreaker();

      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch {
        // Expected
      }

      expect(breaker.getStats().failureCount).toBe(1);
    });
  });

  describe('state transitions', () => {
    it('should open after failure threshold', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 3,
        timeout: 1000,
      });

      // Trigger failures
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(() => Promise.reject(new Error('fail')));
        } catch {
          // Expected
        }
      }

      expect(breaker.getState()).toBe(CircuitState.OPEN);
    });

    it('should throw CircuitBreakerError when open', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 1,
        timeout: 60000,
      });

      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch {
        // Expected
      }

      await expect(
        breaker.execute(() => Promise.resolve('success')),
      ).rejects.toThrow(CircuitBreakerError);
    });

    it('should transition to HALF_OPEN after timeout', async () => {
      jest.useFakeTimers();

      const breaker = new CircuitBreaker({
        failureThreshold: 1,
        timeout: 1000,
      });

      // Open the circuit
      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch {
        // Expected
      }

      expect(breaker.getState()).toBe(CircuitState.OPEN);

      // Advance past timeout
      jest.advanceTimersByTime(1001);

      // Try to execute - should allow and transition to HALF_OPEN
      try {
        await breaker.execute(() => Promise.resolve('success'));
      } catch {
        // Might throw if it doesn't transition properly
      }

      // After successful execution in half-open, check state
      expect([CircuitState.HALF_OPEN, CircuitState.CLOSED]).toContain(
        breaker.getState(),
      );

      jest.useRealTimers();
    });

    it('should close after success threshold in HALF_OPEN', async () => {
      jest.useFakeTimers();

      const breaker = new CircuitBreaker({
        failureThreshold: 1,
        successThreshold: 2,
        timeout: 1000,
      });

      // Open the circuit
      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch {
        // Expected
      }

      // Advance past timeout
      jest.advanceTimersByTime(1001);

      // Successful executions
      await breaker.execute(() => Promise.resolve('success'));
      await breaker.execute(() => Promise.resolve('success'));

      expect(breaker.getState()).toBe(CircuitState.CLOSED);

      jest.useRealTimers();
    });
  });

  describe('reset', () => {
    it('should reset to CLOSED state', async () => {
      const breaker = new CircuitBreaker({ failureThreshold: 1 });

      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch {
        // Expected
      }

      expect(breaker.getState()).toBe(CircuitState.OPEN);

      breaker.reset();

      expect(breaker.getState()).toBe(CircuitState.CLOSED);
      expect(breaker.getStats().failureCount).toBe(0);
    });
  });

  describe('callbacks', () => {
    it('should call onOpen when circuit opens', async () => {
      const onOpen = jest.fn();
      const breaker = new CircuitBreaker({
        failureThreshold: 1,
        onOpen,
      });

      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch {
        // Expected
      }

      expect(onOpen).toHaveBeenCalledWith(1);
    });

    it('should call onClose when circuit closes', async () => {
      const onClose = jest.fn();
      const breaker = new CircuitBreaker({
        failureThreshold: 1,
        onClose,
      });

      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch {
        // Expected
      }

      breaker.reset();

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('shouldTrip', () => {
    it('should not trip on 4xx errors', async () => {
      const breaker = new CircuitBreaker({ failureThreshold: 1 });

      const clientError = new Error('Not found') as Error & { status: number };
      clientError.status = 404;

      try {
        await breaker.executeWithFilter(() => Promise.reject(clientError));
      } catch {
        // Expected
      }

      expect(breaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should trip on 5xx errors', async () => {
      const breaker = new CircuitBreaker({ failureThreshold: 1 });

      const serverError = new Error('Server error') as Error & {
        status: number;
      };
      serverError.status = 500;

      try {
        await breaker.executeWithFilter(() => Promise.reject(serverError));
      } catch {
        // Expected
      }

      expect(breaker.getState()).toBe(CircuitState.OPEN);
    });
  });
});

describe('CircuitBreakerError', () => {
  it('should have correct properties', () => {
    const error = new CircuitBreakerError('api', CircuitState.OPEN);

    expect(error.name).toBe('CircuitBreakerError');
    expect(error.state).toBe(CircuitState.OPEN);
    expect(error.message).toContain('api');
    expect(error.message).toContain('OPEN');
  });
});

describe('circuitBreakerRegistry', () => {
  beforeEach(() => {
    circuitBreakerRegistry.resetAll();
  });

  it('should create and return same breaker for same name', () => {
    const breaker1 = circuitBreakerRegistry.get('test');
    const breaker2 = circuitBreakerRegistry.get('test');

    expect(breaker1).toBe(breaker2);
  });

  it('should create different breakers for different names', () => {
    const breaker1 = circuitBreakerRegistry.get('test1');
    const breaker2 = circuitBreakerRegistry.get('test2');

    expect(breaker1).not.toBe(breaker2);
  });

  it('should reset specific breaker', async () => {
    const breaker = circuitBreakerRegistry.get('test', { failureThreshold: 1 });

    try {
      await breaker.execute(() => Promise.reject(new Error('fail')));
    } catch {
      // Expected
    }

    circuitBreakerRegistry.reset('test');

    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  });

  it('should return all states', async () => {
    circuitBreakerRegistry.get('api');
    circuitBreakerRegistry.get('auth');

    const states = circuitBreakerRegistry.getStates();

    expect(states.api).toBe(CircuitState.CLOSED);
    expect(states.auth).toBe(CircuitState.CLOSED);
  });
});

describe('ServiceBreakers', () => {
  beforeEach(() => {
    circuitBreakerRegistry.resetAll();
  });

  it('should provide pre-configured api breaker', () => {
    const breaker = ServiceBreakers.api();
    expect(breaker).toBeInstanceOf(CircuitBreaker);
  });

  it('should provide pre-configured auth breaker', () => {
    const breaker = ServiceBreakers.auth();
    expect(breaker).toBeInstanceOf(CircuitBreaker);
  });

  it('should provide pre-configured payment breaker', () => {
    const breaker = ServiceBreakers.payment();
    expect(breaker).toBeInstanceOf(CircuitBreaker);
  });

  it('should provide pre-configured upload breaker', () => {
    const breaker = ServiceBreakers.upload();
    expect(breaker).toBeInstanceOf(CircuitBreaker);
  });

  it('should provide pre-configured realtime breaker', () => {
    const breaker = ServiceBreakers.realtime();
    expect(breaker).toBeInstanceOf(CircuitBreaker);
  });
});
