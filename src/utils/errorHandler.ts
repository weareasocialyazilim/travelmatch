/**
 * Standardized API Error Handling
 * Centralized error management for consistent error handling across the app
 */

import { logger } from './logger';
import { ErrorCode, getErrorMessage, getErrorCode } from './errors';

/**
 * Error Severity Levels
 */
export enum ErrorSeverity {
  /** Informational - user notification only */
  INFO = 'info',
  /** Warning - recoverable error */
  WARNING = 'warning',
  /** Error - action failed */
  ERROR = 'error',
  /** Critical - app state compromised */
  CRITICAL = 'critical',
}

/**
 * User-friendly error messages for common error codes
 */
export const USER_FRIENDLY_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]:
    'Unable to connect. Please check your internet connection and try again.',
  [ErrorCode.TIMEOUT_ERROR]: 'The request timed out. Please try again.',
  [ErrorCode.API_ERROR]: 'Something went wrong. Please try again later.',
  [ErrorCode.UNAUTHORIZED]: 'Your session has expired. Please log in again.',
  [ErrorCode.FORBIDDEN]: "You don't have permission to perform this action.",
  [ErrorCode.NOT_FOUND]: 'The requested content could not be found.',
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ErrorCode.STORAGE_ERROR]: 'Unable to save data. Please try again.',
  [ErrorCode.PERMISSION_DENIED]:
    'Permission was denied. Please enable it in settings.',
};

/**
 * Error recovery suggestions
 */
export const ERROR_RECOVERY_SUGGESTIONS: Record<ErrorCode, string[]> = {
  [ErrorCode.NETWORK_ERROR]: [
    'Check your WiFi or mobile data connection',
    'Try moving to an area with better signal',
    "Disable VPN if you're using one",
  ],
  [ErrorCode.TIMEOUT_ERROR]: [
    'Try again in a few moments',
    'Check your internet speed',
    'The server might be busy, try again later',
  ],
  [ErrorCode.API_ERROR]: [
    'Try refreshing the page',
    'Clear the app cache and try again',
    'Contact support if the problem persists',
  ],
  [ErrorCode.UNAUTHORIZED]: [
    'Log in again with your credentials',
    'If you forgot your password, use "Forgot Password"',
  ],
  [ErrorCode.FORBIDDEN]: [
    'Make sure you have the right permissions',
    'Contact the owner for access',
  ],
  [ErrorCode.NOT_FOUND]: [
    'The item may have been deleted',
    'Check the URL or link you used',
    'Go back and try navigating again',
  ],
  [ErrorCode.VALIDATION_ERROR]: [
    'Check all required fields are filled',
    'Make sure the format is correct',
    'Look for any highlighted error messages',
  ],
  [ErrorCode.UNKNOWN_ERROR]: [
    'Try again in a few moments',
    'Restart the app',
    'Contact support if the problem persists',
  ],
  [ErrorCode.STORAGE_ERROR]: [
    'Check if you have enough storage space',
    'Try clearing app cache',
    'Restart the app and try again',
  ],
  [ErrorCode.PERMISSION_DENIED]: [
    'Go to Settings > Apps > TravelMatch > Permissions',
    'Enable the required permission',
    'Restart the app after enabling',
  ],
};

/**
 * Standardized Error Response
 */
export interface StandardizedError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  recoverable: boolean;
  recoverySuggestions: string[];
  originalError?: unknown;
  metadata?: Record<string, unknown>;
}

/**
 * Convert any error to a standardized error format
 */
export const standardizeError = (
  error: unknown,
  context?: string,
): StandardizedError => {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);
  const userMessage =
    USER_FRIENDLY_MESSAGES[code] ||
    USER_FRIENDLY_MESSAGES[ErrorCode.UNKNOWN_ERROR];
  const recoverySuggestions =
    ERROR_RECOVERY_SUGGESTIONS[code] ||
    ERROR_RECOVERY_SUGGESTIONS[ErrorCode.UNKNOWN_ERROR];

  // Determine severity
  let severity = ErrorSeverity.ERROR;
  if (code === ErrorCode.NETWORK_ERROR || code === ErrorCode.TIMEOUT_ERROR) {
    severity = ErrorSeverity.WARNING;
  } else if (code === ErrorCode.UNAUTHORIZED) {
    severity = ErrorSeverity.CRITICAL;
  } else if (code === ErrorCode.VALIDATION_ERROR) {
    severity = ErrorSeverity.INFO;
  }

  // Determine if recoverable
  const recoverable = ![ErrorCode.UNAUTHORIZED, ErrorCode.FORBIDDEN].includes(
    code,
  );

  // Log the error
  logger.error(`[${context || 'Error'}] ${code}: ${message}`, {
    code,
    severity,
    context,
  });

  return {
    code,
    message,
    userMessage,
    severity,
    recoverable,
    recoverySuggestions,
    originalError: error,
    metadata: { context },
  };
};

/**
 * Error handler class for consistent error processing
 */
class ErrorHandlerClass {
  private listeners: ((error: StandardizedError) => void)[] = [];

  /**
   * Handle an error with standardization and notification
   */
  handle = (error: unknown, context?: string): StandardizedError => {
    const standardizedError = standardizeError(error, context);

    // Notify all listeners
    this.listeners.forEach((listener) => {
      try {
        listener(standardizedError);
      } catch (e) {
        logger.error('Error in error listener:', e);
      }
    });

    // Report to Sentry for critical errors
    if (standardizedError.severity === ErrorSeverity.CRITICAL) {
      this.reportToSentry(standardizedError);
    }

    return standardizedError;
  };

  /**
   * Subscribe to error events
   */
  subscribe = (listener: (error: StandardizedError) => void): (() => void) => {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  };

  /**
   * Report error to Sentry
   */
  private reportToSentry = (error: StandardizedError): void => {
    if (typeof (global as Record<string, unknown>).Sentry !== 'undefined') {
      const Sentry = (global as Record<string, unknown>).Sentry as {
        captureException: (err: unknown, opts?: unknown) => void;
      };

      Sentry.captureException(error.originalError, {
        level: error.severity === ErrorSeverity.CRITICAL ? 'error' : 'warning',
        tags: { errorCode: error.code },
        extra: {
          userMessage: error.userMessage,
          recoverySuggestions: error.recoverySuggestions,
          ...error.metadata,
        },
      });
    }
  };

  /**
   * Create a try-catch wrapper for async functions
   */
  wrap = <T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    context?: string,
  ): T => {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        throw this.handle(error, context);
      }
    }) as T;
  };

  /**
   * Create error boundary handler
   */
  createBoundaryHandler = (fallback?: () => void) => {
    return (error: Error, errorInfo: { componentStack: string }) => {
      this.handle(error, 'ErrorBoundary');
      logger.error('Component Stack:', errorInfo.componentStack);
      fallback?.();
    };
  };
}

export const ErrorHandler = new ErrorHandlerClass();

/**
 * React hook for error handling
 */
import { useState, useCallback } from 'react';

export interface UseErrorHandlerReturn {
  error: StandardizedError | null;
  handleError: (error: unknown, context?: string) => void;
  clearError: () => void;
  hasError: boolean;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<StandardizedError | null>(null);

  const handleError = useCallback((err: unknown, context?: string) => {
    const standardizedError = ErrorHandler.handle(err, context);
    setError(standardizedError);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null,
  };
};

/**
 * HOC for adding error handling to API calls
 */
export const withErrorHandling = <T>(
  apiCall: () => Promise<T>,
  context?: string,
): Promise<{ data?: T; error?: StandardizedError }> => {
  return apiCall()
    .then((data) => ({ data }))
    .catch((error) => ({
      error: ErrorHandler.handle(error, context),
    }));
};

/**
 * Retry mechanism with exponential backoff
 */
export const retryWithErrorHandling = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    context?: string;
    shouldRetry?: (error: StandardizedError) => boolean;
  } = {},
): Promise<T> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    context,
    shouldRetry = (err) =>
      err.recoverable && err.code === ErrorCode.NETWORK_ERROR,
  } = options;

  let lastError: StandardizedError | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = standardizeError(error, context);

      if (!shouldRetry(lastError) || attempt === maxRetries - 1) {
        throw lastError;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));

      logger.info(
        `Retrying after error (attempt ${attempt + 1}/${maxRetries})`,
      );
    }
  }

  throw lastError;
};

export default ErrorHandler;
