/**
 * Custom Error Classes
 * Uygulama genelinde kullanılacak özel hata sınıfları
 */

export enum ErrorCode {
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // API Errors
  API_ERROR = 'API_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // App Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

export class AppError extends Error {
  code: ErrorCode;
  statusCode?: number;
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

export class NetworkError extends AppError {
  constructor(message = 'Network connection failed') {
    super(message, ErrorCode.NETWORK_ERROR);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message, ErrorCode.VALIDATION_ERROR, 422);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'You are not authorized to perform this action') {
    super(message, ErrorCode.UNAUTHORIZED, 401);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, ErrorCode.NOT_FOUND, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Error Helper Functions
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
