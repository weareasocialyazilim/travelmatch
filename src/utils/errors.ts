/**
 * Error Handling Utilities
 * Custom error classes and helper functions for consistent error handling
 * @module utils/errors
 *
 * @description
 * Provides a structured error handling system with:
 * - Typed error codes for programmatic handling
 * - Custom error classes for different error types
 * - Helper functions for safe error extraction
 *
 * @example
 * ```typescript
 * import { AppError, ErrorCode, getErrorMessage } from '@/utils/errors';
 *
 * // Throwing typed errors
 * throw new AppError('Invalid input', ErrorCode.VALIDATION_ERROR, 400);
 *
 * // Handling errors safely
 * try {
 *   await fetchData();
 * } catch (error) {
 *   const message = getErrorMessage(error);
 *   const code = getErrorCode(error);
 *   showToast(message);
 * }
 * ```
 */

/**
 * Standardized error codes for the application
 * @enum {string}
 */
export enum ErrorCode {
  // Network Errors
  /** Network connection failed or unavailable */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Request timed out */
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // API Errors
  /** Generic API error */
  API_ERROR = 'API_ERROR',
  /** Authentication required (401) */
  UNAUTHORIZED = 'UNAUTHORIZED',
  /** Permission denied (403) */
  FORBIDDEN = 'FORBIDDEN',
  /** Resource not found (404) */
  NOT_FOUND = 'NOT_FOUND',
  /** Input validation failed (422) */
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // App Errors
  /** Unknown or unexpected error */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  /** Local storage operation failed */
  STORAGE_ERROR = 'STORAGE_ERROR',
  /** Device permission denied */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

/**
 * Base application error class
 *
 * @example
 * ```typescript
 * throw new AppError('User not found', ErrorCode.NOT_FOUND, 404);
 * ```
 */
export class AppError extends Error {
  /** Error code for programmatic handling */
  code: ErrorCode;
  /** HTTP status code (if applicable) */
  statusCode?: number;
  /** Whether this is an operational (expected) error */
  isOperational: boolean;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode?: number,
    isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Network connectivity error
 */
export class NetworkError extends AppError {
  constructor(message = 'Network connection failed') {
    super(message, ErrorCode.NETWORK_ERROR);
    this.name = 'NetworkError';
  }
}

/**
 * Input validation error with field-level details
 */
export class ValidationError extends AppError {
  /** Field-level validation errors */
  errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message, ErrorCode.VALIDATION_ERROR, 422);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Authentication required error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'You are not authorized to perform this action') {
    super(message, ErrorCode.UNAUTHORIZED, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Resource not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, ErrorCode.NOT_FOUND, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Safely extracts error message from any error type
 *
 * @param {unknown} error - Any error value
 * @returns {string} Human-readable error message
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   showToast(getErrorMessage(error));
 * }
 * ```
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
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
 * Safely extracts error code from any error type
 *
 * @param {unknown} error - Any error value
 * @returns {ErrorCode} Error code for programmatic handling
 */
export const getErrorCode = (error: unknown): ErrorCode => {
  if (error instanceof AppError) {
    return error.code;
  }

  return ErrorCode.UNKNOWN_ERROR;
};

export const isOperationalError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }

  return false;
};
