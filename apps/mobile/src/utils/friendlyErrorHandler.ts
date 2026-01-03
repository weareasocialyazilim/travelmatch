/**
 * @deprecated This file is deprecated. Use errorHandler.ts instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { showErrorAlert, parseError, FriendlyAppError } from '@/utils/friendlyErrorHandler';
 * ```
 *
 * AFTER:
 * ```tsx
 * import { showErrorAlert, standardizeError, StandardizedError } from '@/utils/errorHandler';
 * import { AppError, toAppError } from '@/utils/appErrors';
 * ```
 *
 * Key changes:
 * - FriendlyAppError → Use StandardizedError or AppError from appErrors.ts
 * - parseError → Use standardizeError from errorHandler.ts
 * - showErrorAlert → Now in errorHandler.ts with same signature
 * - withErrorHandling → Use withErrorAlert from errorHandler.ts
 * - AppErrorCode enum → Use ErrorCode from appErrors.ts
 *
 * This file re-exports from errorHandler.ts for backward compatibility.
 * Will be removed in a future major version.
 */

// Re-export from the main error handler
export {
  showErrorAlert,
  withErrorAlert as withErrorHandling,
  standardizeError as parseError,
  isRetryableError as isRetryable,
  isAuthError,
  isNetworkRelatedError as isNetworkError,
  StandardizedError,
} from './errorHandler';

// Re-export error codes and classes from appErrors
export { ErrorCode as AppErrorCode, AppError as FriendlyAppError, toAppError } from './appErrors';

// Validation helpers - re-exported for backward compatibility
// These should be moved to a validation module in the future
import { AppError } from './appErrors';

export function validateRequired(
  value: string | null | undefined,
  fieldName?: string,
): asserts value is string {
  if (!value || value.trim() === '') {
    throw new AppError(`${fieldName || 'Field'} is required`, {
      code: 'VALIDATION_REQUIRED_FIELD',
      context: { field: fieldName },
    });
  }
}

export function validateEmail(email: string): asserts email is string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Invalid email address', {
      code: 'VALIDATION_INVALID_EMAIL',
    });
  }
}

export function validatePassword(password: string): asserts password is string {
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', {
      code: 'VALIDATION_PASSWORD_TOO_SHORT',
    });
  }
}

export function validatePhone(phone: string): asserts phone is string {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
    throw new AppError('Invalid phone number', {
      code: 'VALIDATION_INVALID_PHONE',
    });
  }
}

// Error factory - deprecated, use AppError directly
export const createError = {
  network: (message?: string) => new AppError(message || 'Network error', { code: 'NETWORK_ERROR' }),
  timeout: (message?: string) => new AppError(message || 'Timeout', { code: 'TIMEOUT' }),
  auth: (message?: string) => new AppError(message || 'Authentication failed', { code: 'AUTH_ERROR' }),
  sessionExpired: () => new AppError('Session expired', { code: 'AUTH_SESSION_EXPIRED' }),
  notFound: (resource?: string) => new AppError(`${resource || 'Resource'} not found`, { code: 'NOT_FOUND' }),
  validation: (field: string) => new AppError(`${field} is required`, { code: 'VALIDATION_ERROR', context: { field } }),
  payment: (message?: string) => new AppError(message || 'Payment failed', { code: 'PAYMENT_FAILED' }),
  server: (message?: string) => new AppError(message || 'Server error', { code: 'SERVER_ERROR' }),
};

// Deprecated: Use isValidationError from appErrors.ts
export const isValidationError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.code.startsWith('VALIDATION_');
  }
  return false;
};

// Error title helper - use showErrorAlert which handles this internally
import { TFunction } from 'i18next';

export function getErrorTitle(error: AppError, t: TFunction): string {
  if (error.code.startsWith('AUTH_')) {
    return t('errors.titles.authentication', 'Authentication Error');
  }
  if (error.code.startsWith('PAYMENT_')) {
    return t('errors.titles.payment', 'Payment Error');
  }
  if (error.code.startsWith('VALIDATION_')) {
    return t('errors.titles.validation', 'Validation Error');
  }
  if (error.code.startsWith('PERMISSION_')) {
    return t('errors.titles.permission', 'Permission Error');
  }
  if (['NETWORK_ERROR', 'TIMEOUT'].includes(error.code)) {
    return t('errors.titles.network', 'Connection Error');
  }
  return t('errors.titles.error', 'Error');
}

export function getErrorMessage(error: AppError, t: TFunction): string {
  const key = `errors.${error.code}`;
  const translated = t(key, error.context || {});
  if (translated !== key) {
    return translated;
  }
  return error.message || t('errors.UNKNOWN_ERROR', 'An unexpected error occurred');
}
