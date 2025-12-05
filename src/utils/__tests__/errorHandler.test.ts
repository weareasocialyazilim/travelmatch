/**
 * ErrorHandler Tests
 * Tests for centralized error handling functionality
 */

import {
  ErrorHandler,
  standardizeError,
  ErrorSeverity,
  USER_FRIENDLY_MESSAGES,
  ERROR_RECOVERY_SUGGESTIONS,
  withErrorHandling,
  retryWithErrorHandling,
} from '../errorHandler';
import {
  NetworkError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ErrorCode,
} from '../errors';

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('standardizeError', () => {
    it('should standardize NetworkError correctly', () => {
      const error = new NetworkError('Network unavailable');

      const result = standardizeError(error, 'TestContext');

      expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(result.severity).toBe(ErrorSeverity.WARNING);
      expect(result.recoverable).toBe(true);
      expect(result.userMessage).toBe(
        USER_FRIENDLY_MESSAGES[ErrorCode.NETWORK_ERROR],
      );
      expect(result.recoverySuggestions).toEqual(
        ERROR_RECOVERY_SUGGESTIONS[ErrorCode.NETWORK_ERROR],
      );
    });

    it('should standardize UnauthorizedError correctly', () => {
      const error = new UnauthorizedError('Session expired');

      const result = standardizeError(error, 'AuthContext');

      expect(result.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(result.severity).toBe(ErrorSeverity.CRITICAL);
      expect(result.recoverable).toBe(false);
      expect(result.userMessage).toBe(
        USER_FRIENDLY_MESSAGES[ErrorCode.UNAUTHORIZED],
      );
    });

    it('should standardize ValidationError correctly', () => {
      const error = new ValidationError('Invalid input', {
        email: ['Invalid email format'],
      });

      const result = standardizeError(error);

      expect(result.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(result.severity).toBe(ErrorSeverity.INFO);
      expect(result.recoverable).toBe(true);
    });

    it('should standardize NotFoundError correctly', () => {
      const error = new NotFoundError('Moment not found');

      const result = standardizeError(error);

      expect(result.code).toBe(ErrorCode.NOT_FOUND);
      expect(result.severity).toBe(ErrorSeverity.ERROR);
    });

    it('should handle generic Error', () => {
      const error = new Error('Something went wrong');

      const result = standardizeError(error);

      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(result.message).toBe('Something went wrong');
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';

      const result = standardizeError(error);

      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });

    it('should include context in metadata', () => {
      const error = new Error('Test error');
      const context = 'PaymentService';

      const result = standardizeError(error, context);

      expect(result.metadata?.context).toBe(context);
    });
  });

  describe('ErrorHandler.handle', () => {
    it('should standardize and return error', () => {
      const error = new NetworkError('Connection failed');

      const result = ErrorHandler.handle(error, 'API');

      expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(result.originalError).toBe(error);
    });

    it('should notify subscribers', () => {
      const listener = jest.fn();
      const unsubscribe = ErrorHandler.subscribe(listener);

      const error = new Error('Test');
      ErrorHandler.handle(error);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ErrorCode.UNKNOWN_ERROR,
        }),
      );

      unsubscribe();
    });

    it('should allow unsubscribing', () => {
      const listener = jest.fn();
      const unsubscribe = ErrorHandler.subscribe(listener);

      unsubscribe();

      ErrorHandler.handle(new Error('Test'));

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('withErrorHandling', () => {
    it('should return data on success', async () => {
      const apiCall = jest.fn().mockResolvedValue({ id: '1', name: 'Test' });

      const result = await withErrorHandling(apiCall, 'TestAPI');

      expect(result.data).toEqual({ id: '1', name: 'Test' });
      expect(result.error).toBeUndefined();
    });

    it('should return standardized error on failure', async () => {
      const apiCall = jest.fn().mockRejectedValue(new NetworkError('Failed'));

      const result = await withErrorHandling(apiCall, 'TestAPI');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(ErrorCode.NETWORK_ERROR);
    });
  });

  describe('retryWithErrorHandling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return result on first success', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const resultPromise = retryWithErrorHandling(fn, { maxRetries: 3 });
      const result = await resultPromise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on recoverable network error', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new NetworkError('Temporary failure'))
        .mockResolvedValueOnce('success');

      const resultPromise = retryWithErrorHandling(fn, {
        maxRetries: 3,
        baseDelay: 100,
      });

      // Fast-forward timers for retry delay
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-recoverable error', async () => {
      const fn = jest
        .fn()
        .mockRejectedValue(new UnauthorizedError('Invalid token'));

      const resultPromise = retryWithErrorHandling(fn, { maxRetries: 3 });

      await expect(resultPromise).rejects.toMatchObject({
        code: ErrorCode.UNAUTHORIZED,
      });

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries exceeded', async () => {
      jest.useRealTimers(); // Use real timers for this test

      const fn = jest.fn().mockRejectedValue(new NetworkError('Always fails'));

      await expect(
        retryWithErrorHandling(fn, {
          maxRetries: 3,
          baseDelay: 1, // Use 1ms delay for fast testing
        }),
      ).rejects.toMatchObject({
        code: ErrorCode.NETWORK_ERROR,
      });

      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe('USER_FRIENDLY_MESSAGES', () => {
    it('should have messages for all error codes', () => {
      const errorCodes = Object.values(ErrorCode);

      errorCodes.forEach((code) => {
        expect(USER_FRIENDLY_MESSAGES[code]).toBeDefined();
        expect(typeof USER_FRIENDLY_MESSAGES[code]).toBe('string');
      });
    });
  });

  describe('ERROR_RECOVERY_SUGGESTIONS', () => {
    it('should have suggestions for all error codes', () => {
      const errorCodes = Object.values(ErrorCode);

      errorCodes.forEach((code) => {
        expect(ERROR_RECOVERY_SUGGESTIONS[code]).toBeDefined();
        expect(Array.isArray(ERROR_RECOVERY_SUGGESTIONS[code])).toBe(true);
        expect(ERROR_RECOVERY_SUGGESTIONS[code].length).toBeGreaterThan(0);
      });
    });
  });
});
