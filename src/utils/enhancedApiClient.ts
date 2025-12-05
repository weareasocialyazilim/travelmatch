/**
 * Enhanced API Client
 * API client with built-in rate limiting, circuit breaker, and retry logic
 * @module utils/enhancedApiClient
 */

import { api } from './api';
import { logger } from './logger';
import {
  checkRateLimit,
  RateLimitError,
  RATE_LIMIT_CONFIGS,
} from './rateLimiter';
import type { CircuitBreaker, CircuitState } from './circuitBreaker';
import { CircuitBreakerError, ServiceBreakers } from './circuitBreaker';
import { fetchWithRetry, isRetryableError } from './errorRecovery';
import { PerformanceMonitor } from './performance';

/**
 * Request configuration options
 */
interface RequestConfig {
  /** Rate limit key (uses endpoint by default) */
  rateLimitKey?: string;
  /** Rate limit config (uses standard by default) */
  rateLimitConfig?: typeof RATE_LIMIT_CONFIGS.standard;
  /** Circuit breaker to use */
  circuitBreaker?: CircuitBreaker;
  /** Enable retry with backoff */
  retry?: boolean;
  /** Max retry attempts */
  maxRetries?: number;
  /** Track performance metrics */
  trackPerformance?: boolean;
  /** Skip rate limiting */
  skipRateLimit?: boolean;
  /** Skip circuit breaker */
  skipCircuitBreaker?: boolean;
}

/**
 * Default request configuration
 */
const DEFAULT_CONFIG: RequestConfig = {
  rateLimitConfig: RATE_LIMIT_CONFIGS.standard,
  retry: true,
  maxRetries: 3,
  trackPerformance: true,
  skipRateLimit: false,
  skipCircuitBreaker: false,
};

/**
 * Enhanced API response with metadata
 */
interface EnhancedResponse<T> {
  data: T;
  meta: {
    requestId: string;
    duration: number;
    cached: boolean;
    retries: number;
  };
}

/**
 * Generate unique request ID
 */
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Enhanced API Client Class
 */
class EnhancedApiClient {
  private defaultCircuitBreaker: CircuitBreaker;

  constructor() {
    this.defaultCircuitBreaker = ServiceBreakers.api();
  }

  /**
   * Check and apply rate limiting
   */
  private checkRateLimiting(endpoint: string, config: RequestConfig): void {
    if (config.skipRateLimit) return;

    const key = config.rateLimitKey || endpoint;
    const rateLimitConfig =
      config.rateLimitConfig || RATE_LIMIT_CONFIGS.standard;

    const { allowed, retryAfter } = checkRateLimit(key, rateLimitConfig);

    if (!allowed) {
      throw new RateLimitError(key, retryAfter);
    }
  }

  /**
   * Execute request through circuit breaker
   */
  private async executeWithCircuitBreaker<T>(
    fn: () => Promise<T>,
    config: RequestConfig,
  ): Promise<T> {
    if (config.skipCircuitBreaker) {
      return fn();
    }

    const breaker = config.circuitBreaker || this.defaultCircuitBreaker;
    return breaker.executeWithFilter(fn);
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    config: RequestConfig,
    endpoint: string,
  ): Promise<T> {
    if (!config.retry) {
      return fn();
    }

    return fetchWithRetry(fn, {
      maxRetries: config.maxRetries || 3,
      backoff: 'exponential',
      shouldRetry: isRetryableError,
      onRetry: (attempt, error) => {
        logger.debug(
          `Retrying ${endpoint} (${attempt}/${config.maxRetries}):`,
          error.message,
        );
      },
    });
  }

  /**
   * Make enhanced GET request
   */
  async get<T>(
    endpoint: string,
    config: Partial<RequestConfig> = {},
  ): Promise<EnhancedResponse<T>> {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const requestId = generateRequestId();
    const startTime = Date.now();
    let retries = 0;

    try {
      // Check rate limiting
      this.checkRateLimiting(endpoint, mergedConfig);

      // Execute with circuit breaker and retry
      const data = await this.executeWithCircuitBreaker(
        () =>
          this.executeWithRetry(
            async () => {
              retries++;
              return api.get<T>(endpoint);
            },
            mergedConfig,
            endpoint,
          ),
        mergedConfig,
      );

      const duration = Date.now() - startTime;

      // Track performance
      if (mergedConfig.trackPerformance) {
        PerformanceMonitor.trackAPILatency(`GET ${endpoint}`, startTime);
      }

      logger.debug(`[API] GET ${endpoint} completed in ${duration}ms`);

      return {
        data,
        meta: {
          requestId,
          duration,
          cached: false,
          retries: retries - 1,
        },
      };
    } catch (error) {
      this.handleError(error, endpoint, requestId);
      throw error;
    }
  }

  /**
   * Make enhanced POST request
   */
  async post<T>(
    endpoint: string,
    body: unknown,
    config: Partial<RequestConfig> = {},
  ): Promise<EnhancedResponse<T>> {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const requestId = generateRequestId();
    const startTime = Date.now();
    let retries = 0;

    try {
      this.checkRateLimiting(endpoint, mergedConfig);

      const data = await this.executeWithCircuitBreaker(
        () =>
          this.executeWithRetry(
            async () => {
              retries++;
              return api.post<T>(endpoint, body);
            },
            mergedConfig,
            endpoint,
          ),
        mergedConfig,
      );

      const duration = Date.now() - startTime;

      if (mergedConfig.trackPerformance) {
        PerformanceMonitor.trackAPILatency(`POST ${endpoint}`, startTime);
      }

      return {
        data,
        meta: {
          requestId,
          duration,
          cached: false,
          retries: retries - 1,
        },
      };
    } catch (error) {
      this.handleError(error, endpoint, requestId);
      throw error;
    }
  }

  /**
   * Make enhanced PUT request
   */
  async put<T>(
    endpoint: string,
    body: unknown,
    config: Partial<RequestConfig> = {},
  ): Promise<EnhancedResponse<T>> {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const requestId = generateRequestId();
    const startTime = Date.now();
    let retries = 0;

    try {
      this.checkRateLimiting(endpoint, mergedConfig);

      const data = await this.executeWithCircuitBreaker(
        () =>
          this.executeWithRetry(
            async () => {
              retries++;
              return api.put<T>(endpoint, body);
            },
            mergedConfig,
            endpoint,
          ),
        mergedConfig,
      );

      const duration = Date.now() - startTime;

      if (mergedConfig.trackPerformance) {
        PerformanceMonitor.trackAPILatency(`PUT ${endpoint}`, startTime);
      }

      return {
        data,
        meta: {
          requestId,
          duration,
          cached: false,
          retries: retries - 1,
        },
      };
    } catch (error) {
      this.handleError(error, endpoint, requestId);
      throw error;
    }
  }

  /**
   * Make enhanced DELETE request
   */
  async delete<T>(
    endpoint: string,
    config: Partial<RequestConfig> = {},
  ): Promise<EnhancedResponse<T>> {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const requestId = generateRequestId();
    const startTime = Date.now();
    let retries = 0;

    try {
      this.checkRateLimiting(endpoint, mergedConfig);

      const data = await this.executeWithCircuitBreaker(
        () =>
          this.executeWithRetry(
            async () => {
              retries++;
              return api.delete<T>(endpoint);
            },
            mergedConfig,
            endpoint,
          ),
        mergedConfig,
      );

      const duration = Date.now() - startTime;

      if (mergedConfig.trackPerformance) {
        PerformanceMonitor.trackAPILatency(`DELETE ${endpoint}`, startTime);
      }

      return {
        data,
        meta: {
          requestId,
          duration,
          cached: false,
          retries: retries - 1,
        },
      };
    } catch (error) {
      this.handleError(error, endpoint, requestId);
      throw error;
    }
  }

  /**
   * Handle and log errors
   */
  private handleError(
    error: unknown,
    endpoint: string,
    requestId: string,
  ): void {
    if (error instanceof RateLimitError) {
      logger.warn(`[API] Rate limited: ${endpoint}`, {
        requestId,
        retryAfter: error.retryAfter,
      });
    } else if (error instanceof CircuitBreakerError) {
      logger.warn(`[API] Circuit open: ${endpoint}`, {
        requestId,
        state: error.state,
      });
    } else {
      logger.error(`[API] Request failed: ${endpoint}`, {
        requestId,
        error,
      });
    }
  }

  /**
   * Get circuit breaker status
   */
  getCircuitStatus(): CircuitState {
    return this.defaultCircuitBreaker.getState();
  }

  /**
   * Reset circuit breaker
   */
  resetCircuit(): void {
    this.defaultCircuitBreaker.reset();
  }
}

/**
 * Singleton instance
 */
export const enhancedApi = new EnhancedApiClient();

/**
 * Specialized API clients for different services
 */
export const AuthApi = {
  async login(credentials: { email: string; password: string }) {
    return enhancedApi.post('/auth/login', credentials, {
      rateLimitConfig: RATE_LIMIT_CONFIGS.auth,
      circuitBreaker: ServiceBreakers.auth(),
      retry: false, // Don't retry auth requests
    });
  },

  async register(data: { email: string; password: string; name: string }) {
    return enhancedApi.post('/auth/register', data, {
      rateLimitConfig: RATE_LIMIT_CONFIGS.auth,
      circuitBreaker: ServiceBreakers.auth(),
      retry: false,
    });
  },

  async refreshToken(refreshToken: string) {
    return enhancedApi.post(
      '/auth/refresh',
      { refreshToken },
      {
        rateLimitConfig: RATE_LIMIT_CONFIGS.auth,
        retry: true,
        maxRetries: 2,
      },
    );
  },

  async logout() {
    return enhancedApi.post(
      '/auth/logout',
      {},
      {
        skipRateLimit: true,
        skipCircuitBreaker: true,
      },
    );
  },
};

export const MomentsApi = {
  async getAll() {
    return enhancedApi.get('/moments');
  },

  async getById(id: string) {
    return enhancedApi.get(`/moments/${id}`);
  },

  async create(data: unknown) {
    return enhancedApi.post('/moments', data, {
      rateLimitConfig: RATE_LIMIT_CONFIGS.upload,
    });
  },

  async update(id: string, data: unknown) {
    return enhancedApi.put(`/moments/${id}`, data);
  },

  async delete(id: string) {
    return enhancedApi.delete(`/moments/${id}`, {
      rateLimitConfig: RATE_LIMIT_CONFIGS.critical,
    });
  },

  async search(query: string, filters?: unknown) {
    return enhancedApi.post(
      '/moments/search',
      { query, filters },
      {
        rateLimitConfig: RATE_LIMIT_CONFIGS.search,
      },
    );
  },
};

export const MessagesApi = {
  async getConversations() {
    return enhancedApi.get('/conversations', {
      rateLimitConfig: RATE_LIMIT_CONFIGS.messages,
    });
  },

  async getMessages(conversationId: string, page = 1) {
    return enhancedApi.get(
      `/conversations/${conversationId}/messages?page=${page}`,
      {
        rateLimitConfig: RATE_LIMIT_CONFIGS.messages,
      },
    );
  },

  async sendMessage(conversationId: string, content: string) {
    return enhancedApi.post(
      `/conversations/${conversationId}/messages`,
      { content },
      {
        rateLimitConfig: RATE_LIMIT_CONFIGS.messages,
      },
    );
  },
};

export const PaymentsApi = {
  async getMethods() {
    return enhancedApi.get('/payments/methods', {
      circuitBreaker: ServiceBreakers.payment(),
    });
  },

  async addCard(cardData: unknown) {
    return enhancedApi.post('/payments/cards', cardData, {
      circuitBreaker: ServiceBreakers.payment(),
      rateLimitConfig: RATE_LIMIT_CONFIGS.critical,
    });
  },

  async withdraw(amount: number, methodId: string) {
    return enhancedApi.post(
      '/payments/withdraw',
      { amount, methodId },
      {
        circuitBreaker: ServiceBreakers.payment(),
        rateLimitConfig: RATE_LIMIT_CONFIGS.critical,
        retry: false, // Never retry payment operations
      },
    );
  },
};

export default enhancedApi;
