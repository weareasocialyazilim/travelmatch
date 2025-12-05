/**
 * Application Error Classes
 * Centralized error types for consistent error handling
 */

/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;
  public readonly originalError?: Error;

  constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      isOperational?: boolean;
      context?: Record<string, unknown>;
      originalError?: Error;
    } = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.code = options.code || 'UNKNOWN_ERROR';
    this.statusCode = options.statusCode;
    this.isOperational = options.isOperational ?? true;
    this.context = options.context;
    this.originalError = options.originalError;

    // Maintains proper stack trace
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
    };
  }
}

/**
 * Network Error - for network-related issues
 */
export class NetworkError extends AppError {
  constructor(
    message = 'Network connection error',
    options: {
      context?: Record<string, unknown>;
      originalError?: Error;
    } = {},
  ) {
    super(message, {
      code: 'NETWORK_ERROR',
      statusCode: 0,
      isOperational: true,
      ...options,
    });
    this.name = 'NetworkError';
  }
}

/**
 * API Error - for API response errors
 */
export class ApiError extends AppError {
  public readonly endpoint?: string;
  public readonly method?: string;

  constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      endpoint?: string;
      method?: string;
      context?: Record<string, unknown>;
      originalError?: Error;
    } = {},
  ) {
    super(message, {
      code: options.code || 'API_ERROR',
      statusCode: options.statusCode,
      isOperational: true,
      context: options.context,
      originalError: options.originalError,
    });
    this.name = 'ApiError';
    this.endpoint = options.endpoint;
    this.method = options.method;
  }
}

/**
 * Authentication Error
 */
export class AuthError extends AppError {
  constructor(
    message = 'Authentication required',
    options: {
      code?: string;
      context?: Record<string, unknown>;
      originalError?: Error;
    } = {},
  ) {
    super(message, {
      code: options.code || 'AUTH_ERROR',
      statusCode: 401,
      isOperational: true,
      ...options,
    });
    this.name = 'AuthError';
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  public readonly fields?: Record<string, string>;

  constructor(
    message = 'Validation failed',
    options: {
      fields?: Record<string, string>;
      context?: Record<string, unknown>;
      originalError?: Error;
    } = {},
  ) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      isOperational: true,
      context: options.context,
      originalError: options.originalError,
    });
    this.name = 'ValidationError';
    this.fields = options.fields;
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  public readonly resource?: string;

  constructor(
    message = 'Resource not found',
    options: {
      resource?: string;
      context?: Record<string, unknown>;
      originalError?: Error;
    } = {},
  ) {
    super(message, {
      code: 'NOT_FOUND',
      statusCode: 404,
      isOperational: true,
      context: options.context,
      originalError: options.originalError,
    });
    this.name = 'NotFoundError';
    this.resource = options.resource;
  }
}

/**
 * Permission Error
 */
export class PermissionError extends AppError {
  constructor(
    message = 'Permission denied',
    options: {
      context?: Record<string, unknown>;
      originalError?: Error;
    } = {},
  ) {
    super(message, {
      code: 'PERMISSION_DENIED',
      statusCode: 403,
      isOperational: true,
      ...options,
    });
    this.name = 'PermissionError';
  }
}

/**
 * Rate Limit Error
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(
    message = 'Too many requests',
    options: {
      retryAfter?: number;
      context?: Record<string, unknown>;
      originalError?: Error;
    } = {},
  ) {
    super(message, {
      code: 'RATE_LIMIT',
      statusCode: 429,
      isOperational: true,
      context: options.context,
      originalError: options.originalError,
    });
    this.name = 'RateLimitError';
    this.retryAfter = options.retryAfter;
  }
}

/**
 * Server Error
 */
export class ServerError extends AppError {
  constructor(
    message = 'Internal server error',
    options: {
      context?: Record<string, unknown>;
      originalError?: Error;
    } = {},
  ) {
    super(message, {
      code: 'SERVER_ERROR',
      statusCode: 500,
      isOperational: false,
      ...options,
    });
    this.name = 'ServerError';
  }
}

/**
 * Timeout Error
 */
export class TimeoutError extends AppError {
  constructor(
    message = 'Request timed out',
    options: {
      context?: Record<string, unknown>;
      originalError?: Error;
    } = {},
  ) {
    super(message, {
      code: 'TIMEOUT',
      statusCode: 408,
      isOperational: true,
      ...options,
    });
    this.name = 'TimeoutError';
  }
}

/**
 * Error type guards
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export const isAuthError = (error: unknown): error is AuthError => {
  return error instanceof AuthError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

/**
 * Extract user-friendly message from error
 */
export const getErrorMessage = (error: unknown): string => {
  if (isAppError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};

/**
 * Convert unknown error to AppError
 */
export const toAppError = (error: unknown): AppError => {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    // Check for common error patterns
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return new NetworkError(error.message, { originalError: error });
    }

    if (message.includes('timeout')) {
      return new TimeoutError(error.message, { originalError: error });
    }

    if (message.includes('unauthorized') || message.includes('401')) {
      return new AuthError(error.message, { originalError: error });
    }

    return new AppError(error.message, { originalError: error });
  }

  return new AppError(typeof error === 'string' ? error : 'Unknown error');
};
