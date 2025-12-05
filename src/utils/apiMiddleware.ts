/**
 * API Middleware
 * Centralized API request/response handling with security features
 * @module utils/apiMiddleware
 */

import { z } from 'zod';
import { logger } from './logger';
import { checkRateLimit, RATE_LIMIT_CONFIGS } from './rateLimiter';
import { sanitizeInput } from './security';
import { formatZodErrors } from './validation';
import { AppError, ErrorCode } from './errors';

/**
 * Rate limit types for different API operations
 */
export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

/**
 * Request configuration
 */
export interface ApiRequestConfig<T> {
  /** Request data/payload */
  data?: unknown;
  /** Zod schema for validation */
  schema?: z.ZodSchema<T>;
  /** Rate limit type */
  rateLimitType?: RateLimitType;
  /** Rate limit key (e.g., userId, IP) */
  rateLimitKey?: string;
  /** Whether to sanitize string inputs */
  sanitize?: boolean;
  /** Request timeout in ms */
  timeout?: number;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    requestId?: string;
    timestamp: string;
    rateLimitRemaining?: number;
  };
}

/**
 * Sanitize object recursively
 */
const sanitizeObject = (obj: unknown): unknown => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};

/**
 * Validate request with rate limiting and input validation
 */
export const validateRequest = <T>(
  config: ApiRequestConfig<T>,
): {
  valid: boolean;
  data?: T;
  error?: ApiResponse<never>['error'];
  rateLimitRemaining?: number;
} => {
  // Check rate limit
  if (config.rateLimitType && config.rateLimitKey) {
    const rateLimitConfig = RATE_LIMIT_CONFIGS[config.rateLimitType];
    const { allowed, remaining } = checkRateLimit(
      config.rateLimitKey,
      rateLimitConfig,
    );

    if (!allowed) {
      logger.warn('Rate limit exceeded', {
        type: config.rateLimitType,
        key: config.rateLimitKey,
      });

      return {
        valid: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
        },
        rateLimitRemaining: 0,
      };
    }

    // Sanitize input if enabled
    let processedData = config.data;
    if (config.sanitize && config.data) {
      processedData = sanitizeObject(config.data);
    }

    // Validate with schema if provided
    if (config.schema) {
      const result = config.schema.safeParse(processedData);

      if (!result.success) {
        return {
          valid: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: formatZodErrors(result.error),
          },
          rateLimitRemaining: remaining,
        };
      }

      return {
        valid: true,
        data: result.data,
        rateLimitRemaining: remaining,
      };
    }

    return {
      valid: true,
      data: processedData as T,
      rateLimitRemaining: remaining,
    };
  }

  // No rate limiting, just validate schema
  let processedData = config.data;
  if (config.sanitize && config.data) {
    processedData = sanitizeObject(config.data);
  }

  if (config.schema) {
    const result = config.schema.safeParse(processedData);

    if (!result.success) {
      return {
        valid: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: formatZodErrors(result.error),
        },
      };
    }

    return {
      valid: true,
      data: result.data,
    };
  }

  return {
    valid: true,
    data: processedData as T,
  };
};

/**
 * Create standardized API response
 */
export const createApiResponse = <T>(
  success: boolean,
  data?: T,
  error?: ApiResponse<T>['error'],
  meta?: Partial<ApiResponse<T>['meta']>,
): ApiResponse<T> => {
  return {
    success,
    ...(data !== undefined && { data }),
    ...(error && { error }),
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
};

/**
 * Handle API errors consistently
 */
export const handleApiRequestError = (
  error: unknown,
  context?: string,
): ApiResponse<never> => {
  logger.error(`API Error [${context}]:`, error);

  if (error instanceof AppError) {
    return createApiResponse(false, undefined, {
      code: error.code,
      message: error.message,
    });
  }

  if (error instanceof z.ZodError) {
    return createApiResponse(false, undefined, {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Validation failed',
      details: formatZodErrors(error),
    });
  }

  if (error instanceof Error) {
    return createApiResponse(false, undefined, {
      code: ErrorCode.UNKNOWN_ERROR,
      message: __DEV__ ? error.message : 'An unexpected error occurred',
    });
  }

  return createApiResponse(false, undefined, {
    code: ErrorCode.UNKNOWN_ERROR,
    message: 'An unexpected error occurred',
  });
};

/**
 * Wrap an API handler with middleware
 */
export const withApiMiddleware = <TInput, TOutput>(
  handler: (data: TInput) => Promise<TOutput>,
  config: Omit<ApiRequestConfig<TInput>, 'data'>,
) => {
  return async (data: unknown): Promise<ApiResponse<TOutput>> => {
    try {
      // Validate request
      const validation = validateRequest<TInput>({
        ...config,
        data,
      });

      if (!validation.valid) {
        return createApiResponse(false, undefined, validation.error, {
          rateLimitRemaining: validation.rateLimitRemaining,
        });
      }

      // Execute handler
      const result = await handler(validation.data as TInput);

      return createApiResponse(true, result, undefined, {
        rateLimitRemaining: validation.rateLimitRemaining,
      });
    } catch (error) {
      return handleApiRequestError(error);
    }
  };
};
