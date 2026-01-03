/**
 * Chaos Engineering Module for Edge Functions
 *
 * Controlled failure injection for testing system resilience.
 * Use in staging/development environments to verify error handling.
 *
 * Features:
 * - Latency injection
 * - Random failure injection
 * - Circuit breaker simulation
 * - Timeout simulation
 * - Memory pressure simulation
 *
 * @example
 * ```ts
 * import { chaosMonkey, ChaosMode } from '../_shared/chaos.ts';
 *
 * // Enable chaos in staging
 * if (Deno.env.get('ENABLE_CHAOS') === 'true') {
 *   chaosMonkey.enable({
 *     mode: ChaosMode.RANDOM,
 *     failureRate: 0.1, // 10% failure rate
 *     latencyMs: 500,   // Add 500ms latency
 *   });
 * }
 *
 * // Wrap function calls
 * const result = await chaosMonkey.maybeDisrupt(() => fetchData());
 * ```
 *
 * IMPORTANT: Never enable in production!
 */

import { createLogger } from './logger.ts';

const logger = createLogger('chaos-monkey');

// =============================================================================
// TYPES
// =============================================================================

export enum ChaosMode {
  /** No chaos - normal operation */
  DISABLED = 'DISABLED',
  /** Random failures based on failureRate */
  RANDOM = 'RANDOM',
  /** Fail every Nth request */
  PERIODIC = 'PERIODIC',
  /** Fail requests matching specific patterns */
  TARGETED = 'TARGETED',
  /** Add latency to all requests */
  LATENCY_ONLY = 'LATENCY_ONLY',
  /** Simulate circuit breaker open state */
  CIRCUIT_OPEN = 'CIRCUIT_OPEN',
}

export interface ChaosConfig {
  /** Chaos mode */
  mode: ChaosMode;
  /** Failure rate (0-1) for RANDOM mode */
  failureRate?: number;
  /** Period for PERIODIC mode (fail every N requests) */
  period?: number;
  /** Target patterns for TARGETED mode */
  targets?: string[];
  /** Latency to inject in milliseconds */
  latencyMs?: number;
  /** Latency variance (adds random jitter) */
  latencyVarianceMs?: number;
  /** Custom error message */
  errorMessage?: string;
  /** Custom error status code */
  errorStatus?: number;
  /** Function to determine if chaos should apply */
  shouldApply?: (context: ChaosContext) => boolean;
}

export interface ChaosContext {
  functionName?: string;
  requestId?: string;
  traceId?: string;
  path?: string;
  method?: string;
}

export interface ChaosResult {
  disrupted: boolean;
  latencyAdded: number;
  errorInjected: boolean;
  reason?: string;
}

// =============================================================================
// CHAOS ERROR
// =============================================================================

export class ChaosError extends Error {
  public readonly isChaos = true;
  public readonly status: number;
  public readonly context: ChaosContext;

  constructor(message: string, status: number, context: ChaosContext) {
    super(message);
    this.name = 'ChaosError';
    this.status = status;
    this.context = context;
  }
}

// =============================================================================
// CHAOS MONKEY
// =============================================================================

class ChaosMonkey {
  private config: ChaosConfig = { mode: ChaosMode.DISABLED };
  private requestCount = 0;
  private disruptionCount = 0;
  private startTime = Date.now();

  /**
   * Enable chaos engineering
   */
  enable(config: ChaosConfig): void {
    // Safety check - never enable in production
    const env = Deno.env.get('DENO_ENV') || Deno.env.get('NODE_ENV');
    if (env === 'production') {
      logger.error('Attempted to enable chaos in production - ignoring!');
      return;
    }

    this.config = config;
    logger.warn('Chaos Monkey ENABLED', {
      mode: config.mode,
      failureRate: config.failureRate,
      latencyMs: config.latencyMs,
    });
  }

  /**
   * Disable chaos engineering
   */
  disable(): void {
    this.config = { mode: ChaosMode.DISABLED };
    logger.info('Chaos Monkey disabled');
  }

  /**
   * Check if chaos is enabled
   */
  isEnabled(): boolean {
    return this.config.mode !== ChaosMode.DISABLED;
  }

  /**
   * Get chaos statistics
   */
  getStats(): {
    enabled: boolean;
    mode: ChaosMode;
    requestCount: number;
    disruptionCount: number;
    disruptionRate: number;
    uptimeSeconds: number;
  } {
    return {
      enabled: this.isEnabled(),
      mode: this.config.mode,
      requestCount: this.requestCount,
      disruptionCount: this.disruptionCount,
      disruptionRate: this.requestCount > 0
        ? this.disruptionCount / this.requestCount
        : 0,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  /**
   * Maybe disrupt a function call
   */
  async maybeDisrupt<T>(
    fn: () => Promise<T>,
    context: ChaosContext = {}
  ): Promise<T> {
    this.requestCount++;

    if (!this.isEnabled()) {
      return fn();
    }

    // Check if custom shouldApply function exists and use it
    if (this.config.shouldApply && !this.config.shouldApply(context)) {
      return fn();
    }

    const result = await this.applyDisruption(context);

    if (result.errorInjected) {
      this.disruptionCount++;
      throw new ChaosError(
        this.config.errorMessage || 'Chaos Monkey: Simulated failure',
        this.config.errorStatus || 500,
        context
      );
    }

    // Apply latency if configured
    if (result.latencyAdded > 0) {
      await this.sleep(result.latencyAdded);
    }

    return fn();
  }

  /**
   * Apply disruption based on mode
   */
  private async applyDisruption(context: ChaosContext): Promise<ChaosResult> {
    const result: ChaosResult = {
      disrupted: false,
      latencyAdded: 0,
      errorInjected: false,
    };

    // Calculate latency (applied in most modes)
    if (this.config.latencyMs && this.config.latencyMs > 0) {
      const variance = this.config.latencyVarianceMs || 0;
      const jitter = variance > 0 ? (Math.random() - 0.5) * 2 * variance : 0;
      result.latencyAdded = Math.max(0, this.config.latencyMs + jitter);
      result.disrupted = true;
    }

    switch (this.config.mode) {
      case ChaosMode.RANDOM:
        if (Math.random() < (this.config.failureRate || 0.1)) {
          result.errorInjected = true;
          result.reason = 'Random failure';
        }
        break;

      case ChaosMode.PERIODIC:
        const period = this.config.period || 10;
        if (this.requestCount % period === 0) {
          result.errorInjected = true;
          result.reason = `Periodic failure (every ${period} requests)`;
        }
        break;

      case ChaosMode.TARGETED:
        const targets = this.config.targets || [];
        const matchesTarget = targets.some(target => {
          return (
            context.functionName?.includes(target) ||
            context.path?.includes(target)
          );
        });
        if (matchesTarget) {
          result.errorInjected = true;
          result.reason = `Targeted failure (matched: ${targets.join(', ')})`;
        }
        break;

      case ChaosMode.CIRCUIT_OPEN:
        result.errorInjected = true;
        result.reason = 'Simulated circuit breaker open';
        break;

      case ChaosMode.LATENCY_ONLY:
        // Just latency, no errors
        break;
    }

    if (result.errorInjected || result.latencyAdded > 0) {
      logger.debug('Chaos disruption applied', {
        ...result,
        context,
      });
    }

    return result;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.requestCount = 0;
    this.disruptionCount = 0;
    this.startTime = Date.now();
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const chaosMonkey = new ChaosMonkey();

// =============================================================================
// CHAOS SCENARIOS (Pre-configured chaos patterns)
// =============================================================================

export const ChaosScenarios = {
  /**
   * Light chaos - occasional failures
   */
  light: (): ChaosConfig => ({
    mode: ChaosMode.RANDOM,
    failureRate: 0.05, // 5% failure rate
    latencyMs: 100,
    latencyVarianceMs: 50,
  }),

  /**
   * Moderate chaos - more frequent issues
   */
  moderate: (): ChaosConfig => ({
    mode: ChaosMode.RANDOM,
    failureRate: 0.15, // 15% failure rate
    latencyMs: 300,
    latencyVarianceMs: 200,
  }),

  /**
   * Heavy chaos - stress testing
   */
  heavy: (): ChaosConfig => ({
    mode: ChaosMode.RANDOM,
    failureRate: 0.30, // 30% failure rate
    latencyMs: 1000,
    latencyVarianceMs: 500,
  }),

  /**
   * Latency spike simulation
   */
  latencySpike: (): ChaosConfig => ({
    mode: ChaosMode.LATENCY_ONLY,
    latencyMs: 2000,
    latencyVarianceMs: 1000,
  }),

  /**
   * Payment service failure
   */
  paymentFailure: (): ChaosConfig => ({
    mode: ChaosMode.TARGETED,
    targets: ['payment', 'paytr', 'transfer'],
    errorMessage: 'Payment service temporarily unavailable',
    errorStatus: 503,
  }),

  /**
   * Database connection issues
   */
  dbConnectionIssues: (): ChaosConfig => ({
    mode: ChaosMode.RANDOM,
    failureRate: 0.2,
    latencyMs: 500,
    errorMessage: 'Database connection timeout',
    errorStatus: 504,
  }),

  /**
   * Authentication failures
   */
  authFailures: (): ChaosConfig => ({
    mode: ChaosMode.TARGETED,
    targets: ['auth', 'verify', '2fa'],
    failureRate: 0.25,
    errorMessage: 'Authentication service unavailable',
    errorStatus: 503,
  }),

  /**
   * Rate limiting simulation
   */
  rateLimiting: (): ChaosConfig => ({
    mode: ChaosMode.PERIODIC,
    period: 5, // Every 5th request
    errorMessage: 'Rate limit exceeded',
    errorStatus: 429,
  }),
};

// =============================================================================
// CHAOS TEST RUNNER
// =============================================================================

export class ChaosTestRunner {
  private results: Array<{
    scenario: string;
    success: boolean;
    error?: string;
    duration: number;
    disruptions: number;
  }> = [];

  /**
   * Run a chaos test scenario
   */
  async runScenario(
    name: string,
    config: ChaosConfig,
    testFn: () => Promise<void>,
    iterations: number = 10
  ): Promise<{
    scenario: string;
    success: boolean;
    error?: string;
    duration: number;
    disruptions: number;
  }> {
    const start = Date.now();
    let success = true;
    let error: string | undefined;
    let disruptions = 0;

    chaosMonkey.enable(config);
    chaosMonkey.resetStats();

    try {
      for (let i = 0; i < iterations; i++) {
        try {
          await testFn();
        } catch (e) {
          if (e instanceof ChaosError) {
            disruptions++;
            // Expected chaos error - continue
          } else {
            // Unexpected error - test failed to handle chaos
            throw e;
          }
        }
      }
    } catch (e) {
      success = false;
      error = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      chaosMonkey.disable();
    }

    const result = {
      scenario: name,
      success,
      error,
      duration: Date.now() - start,
      disruptions,
    };

    this.results.push(result);
    return result;
  }

  /**
   * Get all test results
   */
  getResults(): typeof this.results {
    return this.results;
  }

  /**
   * Get summary report
   */
  getSummary(): {
    total: number;
    passed: number;
    failed: number;
    totalDuration: number;
  } {
    return {
      total: this.results.length,
      passed: this.results.filter(r => r.success).length,
      failed: this.results.filter(r => !r.success).length,
      totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0),
    };
  }

  /**
   * Clear results
   */
  clear(): void {
    this.results = [];
  }
}

export const chaosTestRunner = new ChaosTestRunner();
