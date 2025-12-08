/**
 * User-Friendly Error Handler with i18n Support
 * 
 * Bridges the gap between technical errors and user-facing messages
 * Provides React Native Alert integration with translation support
 */

import { Alert } from 'react-native';
import { TFunction } from 'i18next';
import { logger } from './logger';

/**
 * Error codes matching locale translation keys
 */
export enum AppErrorCode {
  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  NO_INTERNET = 'NO_INTERNET',
  
  // Authentication
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_EMAIL_NOT_VERIFIED = 'AUTH_EMAIL_NOT_VERIFIED',
  AUTH_ACCOUNT_DISABLED = 'AUTH_ACCOUNT_DISABLED',
  AUTH_TOO_MANY_ATTEMPTS = 'AUTH_TOO_MANY_ATTEMPTS',
  
  // Validation
  VALIDATION_REQUIRED_FIELD = 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_EMAIL = 'VALIDATION_INVALID_EMAIL',
  VALIDATION_INVALID_PHONE = 'VALIDATION_INVALID_PHONE',
  VALIDATION_PASSWORD_TOO_SHORT = 'VALIDATION_PASSWORD_TOO_SHORT',
  VALIDATION_PASSWORDS_DONT_MATCH = 'VALIDATION_PASSWORDS_DONT_MATCH',
  
  // Payment
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_CARD_DECLINED = 'PAYMENT_CARD_DECLINED',
  PAYMENT_INSUFFICIENT_FUNDS = 'PAYMENT_INSUFFICIENT_FUNDS',
  PAYMENT_INVALID_CARD = 'PAYMENT_INVALID_CARD',
  PAYMENT_PROCESSING_ERROR = 'PAYMENT_PROCESSING_ERROR',
  
  // Upload
  UPLOAD_FILE_TOO_LARGE = 'UPLOAD_FILE_TOO_LARGE',
  UPLOAD_INVALID_FORMAT = 'UPLOAD_INVALID_FORMAT',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  UPLOAD_QUOTA_EXCEEDED = 'UPLOAD_QUOTA_EXCEEDED',
  
  // Permissions
  PERMISSION_CAMERA_DENIED = 'PERMISSION_CAMERA_DENIED',
  PERMISSION_LOCATION_DENIED = 'PERMISSION_LOCATION_DENIED',
  PERMISSION_STORAGE_DENIED = 'PERMISSION_STORAGE_DENIED',
  PERMISSION_NOTIFICATIONS_DENIED = 'PERMISSION_NOTIFICATIONS_DENIED',
  
  // Resources
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_DELETED = 'RESOURCE_DELETED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Application error with user-friendly message support
 */
export class AppError extends Error {
  code: AppErrorCode;
  details?: Record<string, unknown>;
  retryable: boolean;
  userMessage?: string;

  constructor(
    code: AppErrorCode,
    message?: string,
    details?: Record<string, unknown>,
    retryable = false,
  ) {
    super(message || code);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.retryable = retryable;
  }
}

/**
 * Parse unknown error into AppError
 */
export function parseError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('Network request failed') || 
        error.message.includes('Failed to fetch')) {
      return new AppError(AppErrorCode.NETWORK_ERROR, error.message, {}, true);
    }

    // Timeout errors
    if (error.message.toLowerCase().includes('timeout')) {
      return new AppError(AppErrorCode.TIMEOUT, error.message, {}, true);
    }

    return new AppError(AppErrorCode.UNKNOWN_ERROR, error.message);
  }

  // Supabase/API errors
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    
    if ('code' in err && 'message' in err) {
      const code = String(err.code);
      const message = String(err.message);
      
      // Map specific error codes
      if (code === 'PGRST116' || code === '404') {
        return new AppError(AppErrorCode.RESOURCE_NOT_FOUND, message);
      }
      if (code === '23505') {
        return new AppError(AppErrorCode.RESOURCE_ALREADY_EXISTS, message);
      }
      if (code === '401') {
        return new AppError(AppErrorCode.AUTH_SESSION_EXPIRED, message);
      }
      if (code === '429') {
        return new AppError(AppErrorCode.RATE_LIMIT_EXCEEDED, message, {}, true);
      }
      if (code.startsWith('5')) {
        return new AppError(AppErrorCode.SERVER_ERROR, message, {}, true);
      }
    }

    if ('status' in err) {
      const status = Number(err.status);
      if (status === 404) {
        return new AppError(AppErrorCode.RESOURCE_NOT_FOUND, String(err.message || 'Not found'));
      }
      if (status === 401 || status === 403) {
        return new AppError(AppErrorCode.AUTH_SESSION_EXPIRED, String(err.message || 'Session expired'));
      }
      if (status >= 500) {
        return new AppError(AppErrorCode.SERVER_ERROR, String(err.message || 'Server error'), {}, true);
      }
    }
  }

  return new AppError(AppErrorCode.UNKNOWN_ERROR, String(error));
}

/**
 * Show user-friendly error alert with i18n
 */
export function showErrorAlert(
  error: unknown,
  t: TFunction,
  options?: {
    onRetry?: () => void;
    onDismiss?: () => void;
    customTitle?: string;
    customMessage?: string;
  },
): void {
  const appError = parseError(error);
  
  // Get localized title
  const title = options?.customTitle || getErrorTitle(appError, t);
  
  // Get localized message
  const message = options?.customMessage || getErrorMessage(appError, t);
  
  // Log for debugging
  logger.error('Error shown to user:', {
    code: appError.code,
    message: appError.message,
    details: appError.details,
  });

  // Build alert buttons
  const buttons: Array<{ text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }> = [];

  if (appError.retryable && options?.onRetry) {
    buttons.push({
      text: t('common.retry'),
      onPress: options.onRetry,
    });
    buttons.push({
      text: t('common.cancel'),
      style: 'cancel',
      onPress: options?.onDismiss,
    });
  } else {
    buttons.push({
      text: t('common.close'),
      onPress: options?.onDismiss,
    });
  }

  Alert.alert(title, message, buttons, { cancelable: true });
}

/**
 * Get error title based on error code
 */
export function getErrorTitle(error: AppError, t: TFunction): string {
  if (error.code.startsWith('AUTH_')) {
    return t('errors.titles.authentication');
  }
  if (error.code.startsWith('PAYMENT_')) {
    return t('errors.titles.payment');
  }
  if (error.code.startsWith('VALIDATION_')) {
    return t('errors.titles.validation');
  }
  if (error.code.startsWith('PERMISSION_')) {
    return t('errors.titles.permission');
  }
  if (error.code.startsWith('UPLOAD_')) {
    return t('errors.titles.upload');
  }
  if (['NETWORK_ERROR', 'TIMEOUT', 'NO_INTERNET'].includes(error.code)) {
    return t('errors.titles.network');
  }
  
  return t('errors.titles.error');
}

/**
 * Get localized error message
 */
export function getErrorMessage(error: AppError, t: TFunction): string {
  const key = `errors.${error.code}`;
  const translated = t(key, error.details || {});
  
  // If translation exists, use it
  if (translated !== key) {
    return translated;
  }
  
  // Fallback to error message or generic
  return error.message || t('errors.UNKNOWN_ERROR');
}

/**
 * Async wrapper with automatic error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  t: TFunction,
  options?: {
    onError?: (error: AppError) => void;
    showAlert?: boolean;
    onRetry?: () => void;
    customErrorMessage?: string;
  },
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const appError = parseError(error);
    
    logger.error('Async operation failed:', {
      code: appError.code,
      message: appError.message,
    });

    if (options?.onError) {
      options.onError(appError);
    }

    if (options?.showAlert !== false) {
      showErrorAlert(error, t, {
        onRetry: options?.onRetry,
        customMessage: options?.customErrorMessage,
      });
    }

    return null;
  }
}

/**
 * Validation helpers that throw AppError
 */
export function validateRequired(value: string | null | undefined, fieldName?: string): asserts value is string {
  if (!value || value.trim() === '') {
    throw new AppError(
      AppErrorCode.VALIDATION_REQUIRED_FIELD,
      `${fieldName || 'Field'} is required`,
      { field: fieldName },
    );
  }
}

export function validateEmail(email: string): asserts email is string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(AppErrorCode.VALIDATION_INVALID_EMAIL, 'Invalid email address');
  }
}

export function validatePassword(password: string): asserts password is string {
  if (password.length < 8) {
    throw new AppError(
      AppErrorCode.VALIDATION_PASSWORD_TOO_SHORT,
      'Password must be at least 8 characters',
    );
  }
}

export function validatePhone(phone: string): asserts phone is string {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
    throw new AppError(AppErrorCode.VALIDATION_INVALID_PHONE, 'Invalid phone number');
  }
}

/**
 * Create specific error types
 */
export const createError = {
  network: (message?: string) => 
    new AppError(AppErrorCode.NETWORK_ERROR, message, {}, true),
  
  timeout: (message?: string) => 
    new AppError(AppErrorCode.TIMEOUT, message, {}, true),
  
  auth: (message?: string) => 
    new AppError(AppErrorCode.AUTH_INVALID_CREDENTIALS, message),
  
  sessionExpired: () => 
    new AppError(AppErrorCode.AUTH_SESSION_EXPIRED, 'Session expired'),
  
  notFound: (resource?: string) => 
    new AppError(AppErrorCode.RESOURCE_NOT_FOUND, `${resource || 'Resource'} not found`),
  
  validation: (field: string) => 
    new AppError(AppErrorCode.VALIDATION_REQUIRED_FIELD, `${field} is required`, { field }),
  
  payment: (message?: string) => 
    new AppError(AppErrorCode.PAYMENT_FAILED, message),
  
  server: (message?: string) => 
    new AppError(AppErrorCode.SERVER_ERROR, message, {}, true),
};

/**
 * Check error type
 */
export const isNetworkError = (error: unknown): boolean => {
  const appError = parseError(error);
  return ['NETWORK_ERROR', 'TIMEOUT', 'NO_INTERNET'].includes(appError.code);
};

export const isAuthError = (error: unknown): boolean => {
  const appError = parseError(error);
  return appError.code.startsWith('AUTH_');
};

export const isValidationError = (error: unknown): boolean => {
  const appError = parseError(error);
  return appError.code.startsWith('VALIDATION_');
};

export const isRetryable = (error: unknown): boolean => {
  const appError = parseError(error);
  return appError.retryable;
};
