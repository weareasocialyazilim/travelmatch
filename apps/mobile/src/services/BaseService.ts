/**
 * Base Service
 *
 * Abstract base class for all TravelMatch services.
 * Provides automatic error recovery, retry logic, and logging.
 *
 * @example
 * class UserService extends BaseService {
 *   constructor() {
 *     super('UserService');
 *   }
 *
 *   async getUser(id: string) {
 *     return this.withRetry(() => api.getUser(id));
 *   }
 * }
 */

import {
  fetchWithRetry,
  isNetworkError,
  isRetryableError,
  NetworkQueue,
  safeAsync,
} from '../utils/errorRecovery';
import { logger } from '../utils/logger';

// ============================================
// Types
// ============================================

export interface RetryConfig {
  maxRetries?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

export interface ServiceConfig {
  name: string;
  defaultRetries?: number;
  enableLogging?: boolean;
  offlineQueueEnabled?: boolean;
}

// ============================================
// Base Service Class
// ============================================

export abstract class BaseService {
  protected readonly serviceName: string;
  protected readonly defaultRetries: number;
  protected readonly enableLogging: boolean;
  protected readonly offlineQueueEnabled: boolean;

  constructor(config: ServiceConfig | string) {
    if (typeof config === 'string') {
      this.serviceName = config;
      this.defaultRetries = 3;
      this.enableLogging = true;
      this.offlineQueueEnabled = true;
    } else {
      this.serviceName = config.name;
      this.defaultRetries = config.defaultRetries ?? 3;
      this.enableLogging = config.enableLogging ?? true;
      this.offlineQueueEnabled = config.offlineQueueEnabled ?? true;
    }
  }

  // ============================================
  // Logging Methods
  // ============================================

  protected log(message: string, data?: unknown): void {
    if (this.enableLogging) {
      logger.info(`[${this.serviceName}] ${message}`, data);
    }
  }

  protected logError(message: string, error: unknown): void {
    logger.error(`[${this.serviceName}] ${message}`, error);
  }

  protected logWarn(message: string, data?: unknown): void {
    if (this.enableLogging) {
      logger.warn(`[${this.serviceName}] ${message}`, data);
    }
  }

  protected logDebug(message: string, data?: unknown): void {
    if (this.enableLogging) {
      logger.debug(`[${this.serviceName}] ${message}`, data);
    }
  }

  // ============================================
  // Error Recovery Methods
  // ============================================

  /**
   * Execute an async operation with automatic retry
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    config?: RetryConfig,
  ): Promise<T> {
    const retryConfig: RetryConfig = {
      maxRetries: config?.maxRetries ?? this.defaultRetries,
      backoff: config?.backoff ?? 'exponential',
      shouldRetry: config?.shouldRetry ?? isRetryableError,
      onRetry: (attempt, error) => {
        this.logWarn(`Retry attempt ${attempt}`, { error: error.message });
        config?.onRetry?.(attempt, error);
      },
    };

    try {
      return await fetchWithRetry(operation, retryConfig);
    } catch (error) {
      this.logError('Operation failed after retries', error);
      throw error;
    }
  }

  /**
   * Execute a safe async operation with fallback
   */
  protected async safeExecute<T>(
    operation: () => Promise<T>,
    fallback: T,
    errorMessage?: string,
  ): Promise<T> {
    return safeAsync(
      operation,
      fallback,
      (error) => {
        this.logError(errorMessage || 'Safe operation failed', error);
      },
    );
  }

  /**
   * Queue operation for offline execution
   */
  protected queueOffline(
    operation: () => Promise<unknown>,
    options?: { id?: string; maxRetries?: number },
  ): string {
    if (!this.offlineQueueEnabled) {
      this.logWarn('Offline queue disabled, executing immediately');
      void operation();
      return 'immediate';
    }

    const opId = NetworkQueue.add(operation, {
      id: options?.id ?? `${this.serviceName}_${Date.now()}`,
      maxRetries: options?.maxRetries ?? this.defaultRetries,
    });

    this.logDebug('Operation queued for offline execution', { opId });
    return opId;
  }

  // ============================================
  // Error Classification
  // ============================================

  /**
   * Check if error is network-related
   */
  protected isNetworkError(error: Error): boolean {
    return isNetworkError(error);
  }

  /**
   * Check if error is retryable
   */
  protected isRetryable(error: Error): boolean {
    return isRetryableError(error);
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Create a timeout promise
   */
  protected timeout<T>(
    operation: Promise<T>,
    timeoutMs: number,
    message = 'Operation timed out',
  ): Promise<T> {
    return Promise.race([
      operation,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(message)), timeoutMs),
      ),
    ]);
  }

  /**
   * Debounce an operation
   */
  protected debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    waitMs: number,
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => func(...args), waitMs);
    };
  }

  /**
   * Throttle an operation
   */
  protected throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limitMs: number,
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limitMs);
      }
    };
  }
}

export default BaseService;
