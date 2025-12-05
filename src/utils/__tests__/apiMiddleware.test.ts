/**
 * API Middleware Tests
 * Tests for centralized API request/response handling
 */

import { z } from 'zod';
import {
  validateRequest,
  createApiResponse,
  handleApiRequestError,
  withApiMiddleware,
} from '../apiMiddleware';
import { AppError, ErrorCode } from '../errors';

describe('API Middleware', () => {
  describe('validateRequest', () => {
    const testSchema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
    });

    it('should validate data against schema successfully', () => {
      const result = validateRequest({
        data: { name: 'John', email: 'john@example.com' },
        schema: testSchema,
      });

      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ name: 'John', email: 'john@example.com' });
    });

    it('should return validation error for invalid data', () => {
      const result = validateRequest({
        data: { name: 'J', email: 'invalid-email' },
        schema: testSchema,
      });

      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.details).toBeDefined();
    });

    it('should sanitize string inputs when enabled', () => {
      const result = validateRequest({
        data: { name: '<script>alert("xss")</script>John', email: 'test@example.com' },
        schema: z.object({
          name: z.string(),
          email: z.string(),
        }),
        sanitize: true,
      });

      expect(result.valid).toBe(true);
      expect(result.data?.name).not.toContain('<script>');
    });

    it('should pass through data without schema', () => {
      const result = validateRequest({
        data: { any: 'data' },
      });

      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ any: 'data' });
    });

    it('should handle rate limiting', () => {
      // First request should pass
      const result1 = validateRequest({
        data: {},
        rateLimitType: 'critical',
        rateLimitKey: 'test-rate-limit-key-1',
      });
      expect(result1.valid).toBe(true);

      // Make multiple requests to exceed limit (5 per minute for critical)
      for (let i = 0; i < 5; i++) {
        validateRequest({
          data: {},
          rateLimitType: 'critical',
          rateLimitKey: 'test-rate-limit-key-1',
        });
      }

      // Next request should be rate limited
      const result2 = validateRequest({
        data: {},
        rateLimitType: 'critical',
        rateLimitKey: 'test-rate-limit-key-1',
      });

      expect(result2.valid).toBe(false);
      expect(result2.error?.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('createApiResponse', () => {
    it('should create successful response with data', () => {
      const response = createApiResponse(true, { id: '123', name: 'Test' });

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: '123', name: 'Test' });
      expect(response.meta?.timestamp).toBeDefined();
    });

    it('should create error response', () => {
      const response = createApiResponse(false, undefined, {
        code: 'TEST_ERROR',
        message: 'Test error message',
      });

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('TEST_ERROR');
      expect(response.error?.message).toBe('Test error message');
    });

    it('should include meta information', () => {
      const response = createApiResponse(true, null, undefined, {
        requestId: 'req-123',
        rateLimitRemaining: 10,
      });

      expect(response.meta?.requestId).toBe('req-123');
      expect(response.meta?.rateLimitRemaining).toBe(10);
      expect(response.meta?.timestamp).toBeDefined();
    });
  });

  describe('handleApiRequestError', () => {
    it('should handle AppError', () => {
      const error = new AppError('Test error', ErrorCode.VALIDATION_ERROR);
      const response = handleApiRequestError(error, 'TestContext');

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(response.error?.message).toBe('Test error');
    });

    it('should handle ZodError', () => {
      const schema = z.object({ name: z.string().min(5) });
      const result = schema.safeParse({ name: 'ab' });

      if (!result.success) {
        const response = handleApiRequestError(result.error, 'TestContext');

        expect(response.success).toBe(false);
        expect(response.error?.code).toBe(ErrorCode.VALIDATION_ERROR);
        expect(response.error?.details).toBeDefined();
      }
    });

    it('should handle generic Error', () => {
      const error = new Error('Generic error');
      const response = handleApiRequestError(error, 'TestContext');

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });

    it('should handle unknown errors', () => {
      const response = handleApiRequestError('string error', 'TestContext');

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('withApiMiddleware', () => {
    it('should execute handler with validated data', async () => {
      const handler = jest.fn().mockResolvedValue({ result: 'success' });

      const wrappedHandler = withApiMiddleware(handler, {
        schema: z.object({ id: z.string() }),
      });

      const response = await wrappedHandler({ id: 'test-123' });

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ result: 'success' });
      expect(handler).toHaveBeenCalledWith({ id: 'test-123' });
    });

    it('should return validation error without calling handler', async () => {
      const handler = jest.fn();

      const wrappedHandler = withApiMiddleware(handler, {
        schema: z.object({ id: z.string().uuid() }),
      });

      const response = await wrappedHandler({ id: 'not-a-uuid' });

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('VALIDATION_ERROR');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should catch handler errors', async () => {
      const handler = jest.fn().mockRejectedValue(new Error('Handler error'));

      const wrappedHandler = withApiMiddleware(handler, {});

      const response = await wrappedHandler({});

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });

    it('should sanitize input when enabled', async () => {
      const handler = jest.fn().mockResolvedValue({ success: true });

      const wrappedHandler = withApiMiddleware(handler, {
        sanitize: true,
      });

      await wrappedHandler({ text: '<script>xss</script>Hello' });

      const calledArg = handler.mock.calls[0][0];
      expect(calledArg.text).not.toContain('<script>');
    });
  });
});
