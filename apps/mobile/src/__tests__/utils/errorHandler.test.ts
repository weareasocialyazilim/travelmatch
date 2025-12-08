/**
 * Tests for errorHandler utility
 * Target: 85%+ coverage
 */

import { renderHook, act } from '@testing-library/react-native';
import {
  ErrorHandler,
  standardizeError,
  useErrorHandler,
  withErrorHandling,
  retryWithErrorHandling,
  ErrorSeverity,
  USER_FRIENDLY_MESSAGES,
  ERROR_RECOVERY_SUGGESTIONS,
} from '@/utils/errorHandler';
import {
  ErrorCode,
  AppError,
  NetworkError,
  ApiError,
  UnauthorizedError,
  ValidationError,
} from '@/utils/appErrors';
import { logger } from '@/utils/logger';

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock global Sentry
const mockSentryCaptureException = jest.fn();
(global as unknown as { Sentry: unknown }).Sentry = {
  captureException: mockSentryCaptureException,
};

describe('errorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    delete (global as unknown as { Sentry?: unknown }).Sentry;
  });

  describe('USER_FRIENDLY_MESSAGES', () => {
    it('should have messages for all error codes', () => {
      expect(USER_FRIENDLY_MESSAGES[ErrorCode.NETWORK_ERROR]).toBeDefined();
      expect(USER_FRIENDLY_MESSAGES[ErrorCode.UNAUTHORIZED]).toBeDefined();
      expect(USER_FRIENDLY_MESSAGES[ErrorCode.VALIDATION_ERROR]).toBeDefined();
    });

    it('should contain user-friendly language', () => {
      expect(USER_FRIENDLY_MESSAGES[ErrorCode.NETWORK_ERROR]).toContain('internet connection');
      expect(USER_FRIENDLY_MESSAGES[ErrorCode.UNAUTHORIZED]).toContain('log in');
    });
  });

  describe('ERROR_RECOVERY_SUGGESTIONS', () => {
    it('should have recovery suggestions for all error codes', () => {
      expect(ERROR_RECOVERY_SUGGESTIONS[ErrorCode.NETWORK_ERROR]).toBeInstanceOf(Array);
      expect(ERROR_RECOVERY_SUGGESTIONS[ErrorCode.TIMEOUT_ERROR]).toBeInstanceOf(Array);
    });

    it('should provide actionable suggestions', () => {
      const networkSuggestions = ERROR_RECOVERY_SUGGESTIONS[ErrorCode.NETWORK_ERROR];
      expect(networkSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('standardizeError', () => {
    it('should standardize AppError', () => {
      const appError = new AppError('Test error', { code: ErrorCode.API_ERROR });
      const result = standardizeError(appError, 'TestContext');

      expect(result.code).toBe(ErrorCode.API_ERROR);
      expect(result.message).toBe('Test error');
      expect(result.userMessage).toBe(USER_FRIENDLY_MESSAGES[ErrorCode.API_ERROR]);
      expect(result.severity).toBe(ErrorSeverity.ERROR);
      expect(result.recoverable).toBe(true);
    });

    it('should standardize NetworkError with WARNING severity', () => {
      const networkError = new NetworkError('Network is down');
      const result = standardizeError(networkError);

      expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(result.severity).toBe(ErrorSeverity.WARNING);
      expect(result.recoverable).toBe(true);
    });

    it('should standardize UnauthorizedError with CRITICAL severity', () => {
      const unauthorizedError = new UnauthorizedError();
      const result = standardizeError(unauthorizedError);

      expect(result.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(result.severity).toBe(ErrorSeverity.CRITICAL);
      expect(result.recoverable).toBe(false);
    });

    it('should standardize ValidationError with INFO severity', () => {
      const validationError = new ValidationError('Invalid email');
      const result = standardizeError(validationError);

      expect(result.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(result.severity).toBe(ErrorSeverity.INFO);
    });

    it('should handle regular Error objects', () => {
      const error = new Error('Regular error');
      const result = standardizeError(error);

      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(result.message).toBe('Regular error');
    });

    it('should handle string errors', () => {
      const result = standardizeError('String error message');

      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(result.message).toBe('String error message');
    });

    it('should log errors with context', () => {
      const error = new AppError('Test', { code: ErrorCode.API_ERROR });
      standardizeError(error, 'MyComponent');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('ErrorHandler.handle', () => {
    it('should handle errors and return standardized error', () => {
      const error = new NetworkError('Connection failed');
      const result = ErrorHandler.handle(error, 'NetworkService');

      expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(result.message).toBe('Connection failed');
    });

    it('should notify subscribers', () => {
      const listener = jest.fn();
      const unsubscribe = ErrorHandler.subscribe(listener);

      const error = new ApiError('API failed');
      ErrorHandler.handle(error);

      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });

    it('should report critical errors to Sentry', () => {
      const criticalError = new UnauthorizedError('Session expired');
      ErrorHandler.handle(criticalError);

      expect(mockSentryCaptureException).toHaveBeenCalled();
    });

    it('should handle errors in listeners gracefully', () => {
      const badListener = jest.fn(() => {
        throw new Error('Listener error');
      });

      ErrorHandler.subscribe(badListener);
      const error = new ApiError('Test');
      ErrorHandler.handle(error);

      expect(logger.error).toHaveBeenCalledWith('Error in error listener:', expect.any(Error));
    });
  });

  describe('ErrorHandler.subscribe', () => {
    it('should unsubscribe from error events', () => {
      const listener = jest.fn();
      const unsubscribe = ErrorHandler.subscribe(listener);

      ErrorHandler.handle(new ApiError('First error'));
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      ErrorHandler.handle(new ApiError('Second error'));
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('ErrorHandler.wrap', () => {
    it('should wrap async functions and handle errors', async () => {
      const mockFn = jest.fn().mockRejectedValue(new ApiError('API call failed'));
      const wrappedFn = ErrorHandler.wrap(mockFn, 'WrappedFunction');

      await expect(wrappedFn()).rejects.toMatchObject({
        code: ErrorCode.API_ERROR,
      });
    });

    it('should pass through successful results', async () => {
      const mockFn = jest.fn().mockResolvedValue({ success: true });
      const wrappedFn = ErrorHandler.wrap(mockFn);

      const result = await wrappedFn();
      expect(result).toEqual({ success: true });
    });
  });

  describe('ErrorHandler.createBoundaryHandler', () => {
    it('should create error boundary handler', () => {
      const fallback = jest.fn();
      const handler = ErrorHandler.createBoundaryHandler(fallback);

      const error = new Error('Component error');
      const errorInfo = { componentStack: 'Stack trace here' };

      handler(error, errorInfo);
      expect(fallback).toHaveBeenCalled();
    });
  });

  describe('useErrorHandler', () => {
    it('should provide error state and handlers', () => {
      const { result } = renderHook(() => useErrorHandler());

      expect(result.current.error).toBeNull();
      expect(result.current.hasError).toBe(false);
      expect(typeof result.current.handleError).toBe('function');
    });

    it('should handle errors', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(new ApiError('Test error'), 'TestComponent');
      });

      expect(result.current.hasError).toBe(true);
    });

    it('should clear errors', () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(new Error('Test'));
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.hasError).toBe(false);
    });
  });

  describe('withErrorHandling', () => {
    it('should return data on success', async () => {
      const apiCall = jest.fn().mockResolvedValue({ id: 1, name: 'Test' });

      const result = await withErrorHandling(apiCall, 'API');

      expect(result.data).toEqual({ id: 1, name: 'Test' });
      expect(result.error).toBeUndefined();
    });

    it('should return standardized error on failure', async () => {
      const apiCall = jest.fn().mockRejectedValue(new ApiError('Failed'));

      const result = await withErrorHandling(apiCall, 'API');

      expect(result.data).toBeUndefined();
      expect(result.error?.code).toBe(ErrorCode.API_ERROR);
    });
  });

  describe('retryWithErrorHandling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should retry on recoverable network errors', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new NetworkError('Failed 1'))
        .mockRejectedValueOnce(new NetworkError('Failed 2'))
        .mockResolvedValueOnce('Success');

      const promise = retryWithErrorHandling(mockFn, { maxRetries: 3, baseDelay: 100 });

      await jest.advanceTimersByTimeAsync(100);
      await jest.advanceTimersByTimeAsync(200);

      const result = await promise;
      expect(result).toBe('Success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-recoverable errors', async () => {
      const mockFn = jest.fn().mockRejectedValue(new UnauthorizedError());

      const promise = retryWithErrorHandling(mockFn, { maxRetries: 3 });

      await expect(promise).rejects.toMatchObject({ code: ErrorCode.UNAUTHORIZED });
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should succeed on first attempt without retrying', async () => {
      const mockFn = jest.fn().mockResolvedValue('Immediate success');

      const result = await retryWithErrorHandling(mockFn);

      expect(result).toBe('Immediate success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});
