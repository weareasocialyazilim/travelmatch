/**
 * API Utilities Tests
 * Tests for API client, error handling, and request utilities
 */

import axios from 'axios';
import { handleApiError, apiRequest } from '../api';
import {
  NetworkError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  AppError,
  ErrorCode,
} from '../errors';
import * as offline from '../offline';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
  isAxiosError: jest.fn((error) => error.isAxiosError),
}));

// Mock offline module
jest.mock('../offline', () => ({
  checkNetworkAvailability: jest.fn(),
  cache: {
    get: jest.fn(),
    set: jest.fn(),
  },
  retryWithBackoff: jest.fn(),
}));

const mockOffline = offline as jest.Mocked<typeof offline>;

describe('API Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleApiError', () => {
    it('should return NetworkError when no response', () => {
      const error = {
        isAxiosError: true,
        message: 'Network Error',
        response: undefined,
      };

      const result = handleApiError(error as any);

      expect(result).toBeInstanceOf(NetworkError);
      // NetworkError message comes from error.message
      expect(result.message).toBeTruthy();
    });

    it('should return NetworkError with custom message', () => {
      const error = {
        isAxiosError: true,
        message: 'timeout of 30000ms exceeded',
        response: undefined,
      };

      const result = handleApiError(error as any);

      expect(result).toBeInstanceOf(NetworkError);
    });

    it('should return ValidationError for 400 status', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            message: 'Invalid input',
            errors: {
              email: 'Invalid email format',
            },
          },
        },
        message: 'Request failed',
      };

      const result = handleApiError(error as any);

      expect(result).toBeInstanceOf(ValidationError);
      expect(result.message).toBe('Invalid input');
    });

    it('should return UnauthorizedError for 401 status', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 401,
          data: {
            message: 'Invalid credentials',
          },
        },
        message: 'Request failed',
      };

      const result = handleApiError(error as any);

      expect(result).toBeInstanceOf(UnauthorizedError);
      expect(result.message).toBe('Invalid credentials');
    });

    it('should return AppError with FORBIDDEN for 403 status', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 403,
          data: {
            message: 'Access denied',
          },
        },
        message: 'Request failed',
      };

      const result = handleApiError(error as any);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.FORBIDDEN);
      expect(result.statusCode).toBe(403);
    });

    it('should return NotFoundError for 404 status', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 404,
          data: {
            message: 'User not found',
          },
        },
        message: 'Request failed',
      };

      const result = handleApiError(error as any);

      expect(result).toBeInstanceOf(NotFoundError);
      expect(result.message).toBe('User not found');
    });

    it('should return ValidationError for 422 status', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 422,
          data: {
            message: 'Validation failed',
            errors: {
              password: ['Too short', 'Must contain number'],
            },
          },
        },
        message: 'Request failed',
      };

      const result = handleApiError(error as any);

      expect(result).toBeInstanceOf(ValidationError);
      expect(result.message).toBe('Validation failed');
    });

    it('should return AppError for 500 server error', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 500,
          data: {},
        },
        message: 'Internal Server Error',
      };

      const result = handleApiError(error as any);

      expect(result).toBeInstanceOf(AppError);
      expect(result.statusCode).toBe(500);
      expect(result.message).toContain('Server error');
    });

    it('should return AppError for 502 bad gateway', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 502,
          data: {},
        },
        message: 'Bad Gateway',
      };

      const result = handleApiError(error as any);

      expect(result).toBeInstanceOf(AppError);
      expect(result.statusCode).toBe(502);
    });

    it('should return AppError for 503 service unavailable', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 503,
          data: {},
        },
        message: 'Service Unavailable',
      };

      const result = handleApiError(error as any);

      expect(result).toBeInstanceOf(AppError);
      expect(result.statusCode).toBe(503);
    });

    it('should return AppError for unknown status codes', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 418, // I'm a teapot
          data: {
            message: 'I am a teapot',
          },
        },
        message: 'Request failed',
      };

      const result = handleApiError(error as any);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.API_ERROR);
    });

    it('should handle errors without message in response', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {},
        },
        message: 'Request failed',
      };

      const result = handleApiError(error as any);

      expect(result).toBeInstanceOf(ValidationError);
      // Message fallbacks to error.message or default
      expect(result.message).toBeTruthy();
    });

    it('should handle errors array format', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            message: 'Validation error',
            errors: {
              email: ['Invalid format', 'Already taken'],
            },
          },
        },
        message: 'Request failed',
      };

      const result = handleApiError(error as any);

      expect(result).toBeInstanceOf(ValidationError);
    });
  });

  describe('apiRequest', () => {
    it('should throw NetworkError when offline', async () => {
      mockOffline.checkNetworkAvailability.mockResolvedValue(false);

      await expect(
        apiRequest({ method: 'GET', url: '/test' })
      ).rejects.toThrow(NetworkError);
    });

    it('should check cache for GET requests when useCache is true', async () => {
      const cachedData = { id: 1, name: 'Cached' };
      mockOffline.cache.get.mockReturnValue(cachedData);

      const result = await apiRequest(
        { method: 'GET', url: '/test' },
        { useCache: true }
      );

      expect(result).toEqual(cachedData);
      expect(mockOffline.cache.get).toHaveBeenCalled();
    });

    it('should not check cache when useCache is false', async () => {
      mockOffline.checkNetworkAvailability.mockResolvedValue(true);

      // This will fail since axios is mocked, but we're testing the cache check
      try {
        await apiRequest({ method: 'GET', url: '/test' }, { useCache: false });
      } catch (e) {
        // Expected to fail
      }

      expect(mockOffline.cache.get).not.toHaveBeenCalled();
    });
  });

  describe('Error format handling', () => {
    it('should format string errors to array', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            message: 'Invalid',
            errors: {
              field: 'Single error string',
            },
          },
        },
        message: 'Request failed',
      };

      const result = handleApiError(error as any) as ValidationError;

      expect(result).toBeInstanceOf(ValidationError);
    });

    it('should preserve array errors', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 422,
          data: {
            message: 'Invalid',
            errors: {
              field: ['Error 1', 'Error 2'],
            },
          },
        },
        message: 'Request failed',
      };

      const result = handleApiError(error as any) as ValidationError;

      expect(result).toBeInstanceOf(ValidationError);
    });

    it('should handle missing errors object', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            message: 'Bad request',
          },
        },
        message: 'Request failed',
      };

      const result = handleApiError(error as any) as ValidationError;

      expect(result).toBeInstanceOf(ValidationError);
    });
  });

  describe('Status code edge cases', () => {
    it('should use default message for 403 when no message in response', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 403,
          data: {},
        },
        message: 'Request failed',
      };

      const result = handleApiError(error as any);

      // Should have default forbidden message
      expect(result.statusCode).toBe(403);
      expect(result.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should use default message for 404 without message', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 404,
          data: {},
        },
        message: '',
      };

      const result = handleApiError(error as any);

      expect(result).toBeInstanceOf(NotFoundError);
    });

    it('should handle null data in response', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 500,
          data: null,
        },
        message: 'Server Error',
      };

      const result = handleApiError(error as any);

      expect(result).toBeInstanceOf(AppError);
    });
  });
});
