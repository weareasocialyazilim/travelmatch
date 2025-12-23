/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by temporarily blocking requests to failing services
 * @module utils/circuitBreaker
 */

import { logger } from './logger';

/**
 * Circuit breaker states
 */
export enum CircuitState {
  /** Normal operation - requests pass through */
  CLOSED = 'CLOSED',
  /** Failure threshold exceeded - requests blocked */
  OPEN = 'OPEN',
  /** Testing if service recovered - limited requests */
  HALF_OPEN = 'HALF_OPEN',
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Number of successes needed to close circuit in half-open state */
  successThreshold: number;
  /** Time in ms before attempting to recover (moving to half-open) */
  timeout: number;
  /** Optional name for logging */
  name?: string;
  /** Callback when circuit opens */
  onOpen?: (failures: number) => void;
  /** Callback when circuit closes */
  onClose?: () => void;
  /** Callback when circuit half-opens */
  onHalfOpen?: () => void;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 30000, // 30 seconds
};

/**
 * Circuit breaker error
 */
export class CircuitBreakerError extends Error {
  public readonly state: CircuitState;
  public readonly name: string;

  constructor(circuitName: string, state: CircuitState) {
    super(`Circuit breaker "${circuitName}" is ${state}`);
    this.name = 'CircuitBreakerError';
    this.state = state;
  }
}

/**
 * Circuit Breaker Class
 *
 * @example
 * ```typescript
 * const apiBreaker = new CircuitBreaker({
 *   failureThreshold: 5,
 *   timeout: 30000,
 *   name: 'api',
 *   onOpen: () => showToast('API temporarily unavailable'),
 * });
 *
 * try {
 *   const result = await apiBreaker.execute(() => api.getMoments());
 * } catch (error) {
 *   if (error instanceof CircuitBreakerError) {
 *     // Circuit is open, use cached data
 *     return getCachedMoments();
 *   }
 *   throw error;
 * }
 * ```
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private readonly config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get circuit statistics
   */
  getStats(): {
    state: CircuitState;
    failureCount: number;
    successCount: number;
    lastFailureTime: number | null;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  /**
   * Check if circuit allows requests
   */
  private canExecute(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      // Check if timeout has passed
      if (
        this.lastFailureTime &&
        Date.now() - this.lastFailureTime >= this.config.timeout
      ) {
        this.transitionTo(CircuitState.HALF_OPEN);
        return true;
      }
      return false;
    }

    // Half-open - allow limited requests
    return true;
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    const name = this.config.name || 'default';
    logger.info(`Circuit "${name}" transition: ${oldState} -> ${newState}`);

    switch (newState) {
      case CircuitState.OPEN:
        this.config.onOpen?.(this.failureCount);
        break;
      case CircuitState.CLOSED:
        this.config.onClose?.();
        break;
      case CircuitState.HALF_OPEN:
        this.config.onHalfOpen?.();
        break;
    }
  }

  /**
   * Record a successful execution
   */
  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.reset();
      }
    } else {
      this.failureCount = 0;
    }
  }

  /**
   * Record a failed execution
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.successCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  /**
   * Reset circuit to closed state
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.config.onClose?.();
  }

  /**
   * Execute a function through the circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new CircuitBreakerError(this.config.name || 'default', this.state);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Check if error should trigger circuit breaker
   * Override this for custom error classification
   */
  shouldTrip(error: Error): boolean {
    // Don't trip on client errors (4xx)
    // @ts-expect-error - status may exist on error object
     
    const status: number | undefined = error.status || error.statusCode;
    if (status && status >= 400 && status < 500) {
      return false;
    }

    // Trip on server errors and network errors
    return true;
  }

  /**
   * Execute with selective circuit breaking
   */
  async executeWithFilter<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new CircuitBreakerError(this.config.name || 'default', this.state);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      if (this.shouldTrip(error as Error)) {
        this.onFailure();
      }
      throw error;
    }
  }
}

/**
 * Circuit breaker registry for managing multiple breakers
 */
class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();

  /**
   * Get or create a circuit breaker
   */
  get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    let breaker = this.breakers.get(name);
    if (!breaker) {
      breaker = new CircuitBreaker({ ...config, name });
      this.breakers.set(name, breaker);
    }
    return breaker;
  }

  /**
   * Reset a specific breaker
   */
  reset(name: string): void {
    this.breakers.get(name)?.reset();
  }

  /**
   * Reset all breakers
   */
  resetAll(): void {
    this.breakers.forEach((breaker) => breaker.reset());
  }

  /**
   * Get all breaker states
   */
  getStates(): Record<string, CircuitState> {
    const states: Record<string, CircuitState> = {};
    this.breakers.forEach((breaker, name) => {
      states[name] = breaker.getState();
    });
    return states;
  }

  /**
   * Remove a breaker
   */
  remove(name: string): void {
    this.breakers.delete(name);
  }
}

/**
 * Global circuit breaker registry
 */
export const circuitBreakerRegistry = new CircuitBreakerRegistry();

/**
 * Pre-configured circuit breakers for common services
 */
export const ServiceBreakers = {
  /** API circuit breaker */
  api: () =>
    circuitBreakerRegistry.get('api', {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 30000,
    }),

  /** Auth service circuit breaker */
  auth: () =>
    circuitBreakerRegistry.get('auth', {
      failureThreshold: 3,
      successThreshold: 1,
      timeout: 60000, // Longer timeout for auth
    }),

  /** Payment service circuit breaker (more sensitive) */
  payment: () =>
    circuitBreakerRegistry.get('payment', {
      failureThreshold: 2,
      successThreshold: 3,
      timeout: 60000,
    }),

  /** Upload service circuit breaker */
  upload: () =>
    circuitBreakerRegistry.get('upload', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 30000,
    }),

  /** Real-time/WebSocket circuit breaker */
  realtime: () =>
    circuitBreakerRegistry.get('realtime', {
      failureThreshold: 5,
      successThreshold: 1,
      timeout: 15000, // Shorter for real-time
    }),
};

export default {
  CircuitBreaker,
  CircuitBreakerError,
  CircuitState,
  circuitBreakerRegistry,
  ServiceBreakers,
};
