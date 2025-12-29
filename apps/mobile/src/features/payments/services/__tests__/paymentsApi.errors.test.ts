/**
 * Payments API Error Scenarios Tests
 * Tests for HTTP error handling (401, 403, 500, network errors)
 * Target Coverage: Comprehensive error handling
 */

import { paymentsApi } from '../paymentsApi';

// Mock dependencies
jest.mock('@/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
    functions: {
      invoke: jest.fn(),
    },
    storage: {
      from: jest.fn(),
    },
  },
}));

import { supabase } from '@/config/supabase';

describe('paymentsApi - Error Scenarios', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // 401 UNAUTHORIZED TESTS
  // ========================================
  describe('401 Unauthorized', () => {
    beforeEach(() => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });
    });

    it('getWallet should throw when user not authenticated', async () => {
      await expect(paymentsApi.getWallet()).rejects.toThrow('User not authenticated');
    });

    it('getTransactions should throw when user not authenticated', async () => {
      await expect(paymentsApi.getTransactions()).rejects.toThrow('User not authenticated');
    });

    it('getPaymentMethods should throw when user not authenticated', async () => {
      await expect(paymentsApi.getPaymentMethods()).rejects.toThrow('User not authenticated');
    });

    it('withdraw should throw when user not authenticated', async () => {
      await expect(paymentsApi.withdraw(100)).rejects.toThrow('User not authenticated');
    });

    it('getKYCStatus should throw when user not authenticated', async () => {
      await expect(paymentsApi.getKYCStatus()).rejects.toThrow('User not authenticated');
    });

    it('submitKYC should throw when user not authenticated', async () => {
      const formData = new FormData();
      await expect(paymentsApi.submitKYC(formData)).rejects.toThrow('User not authenticated');
    });

    it('getSubscription should throw when user not authenticated', async () => {
      await expect(paymentsApi.getSubscription()).rejects.toThrow('User not authenticated');
    });

    it('cancelSubscription should throw when user not authenticated', async () => {
      await expect(paymentsApi.cancelSubscription()).rejects.toThrow('User not authenticated');
    });

    it('getGifts should throw when user not authenticated', async () => {
      await expect(paymentsApi.getGifts()).rejects.toThrow('User not authenticated');
    });
  });

  // ========================================
  // 403 FORBIDDEN / PERMISSION ERRORS
  // ========================================
  describe('403 Forbidden', () => {
    const forbiddenError = {
      code: '42501', // PostgreSQL insufficient privilege
      message: 'new row violates row-level security policy',
      details: null,
      hint: null,
    };

    beforeEach(() => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });

    it('getWallet should throw on RLS violation', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: forbiddenError }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(paymentsApi.getWallet()).rejects.toMatchObject({
        code: '42501',
        message: expect.stringContaining('row-level security'),
      });
    });

    it('getTransactions should throw on permission denied', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: null, error: forbiddenError }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(paymentsApi.getTransactions()).rejects.toMatchObject({
        code: '42501',
      });
    });

    it('cancelSubscription should throw on RLS policy violation', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: forbiddenError }),
            }),
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      await expect(paymentsApi.cancelSubscription()).rejects.toMatchObject({
        code: '42501',
      });
    });
  });

  // ========================================
  // 500 INTERNAL SERVER ERROR
  // ========================================
  describe('500 Internal Server Error', () => {
    const serverError = {
      code: '50000',
      message: 'Internal server error',
      details: null,
      hint: null,
    };

    beforeEach(() => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });

    it('getWallet should throw on database error', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: serverError }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(paymentsApi.getWallet()).rejects.toMatchObject({
        code: '50000',
        message: 'Internal server error',
      });
    });

    it('createPaymentIntent should throw on Edge Function error', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Edge Function crashed', status: 500 },
      });

      await expect(
        paymentsApi.createPaymentIntent({ amount: 100, currency: 'usd' })
      ).rejects.toMatchObject({
        message: 'Edge Function crashed',
      });
    });

    it('withdraw should throw on Edge Function error', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Withdrawal service unavailable', status: 500 },
      });

      await expect(paymentsApi.withdraw(100)).rejects.toMatchObject({
        message: 'Withdrawal service unavailable',
      });
    });

    it('createSubscription should throw on Edge Function error', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Stripe service error', status: 500 },
      });

      await expect(paymentsApi.createSubscription('plan-123')).rejects.toMatchObject({
        message: 'Stripe service error',
      });
    });

    it('sendGift should throw on Edge Function error', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Gift service error', status: 500 },
      });

      await expect(paymentsApi.sendGift('user-456', 50)).rejects.toMatchObject({
        message: 'Gift service error',
      });
    });
  });

  // ========================================
  // NETWORK ERRORS
  // ========================================
  describe('Network Errors', () => {
    beforeEach(() => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });

    it('should handle network timeout', async () => {
      const timeoutError = new Error('Network request timeout');
      timeoutError.name = 'TimeoutError';

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockRejectedValue(timeoutError),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(paymentsApi.getWallet()).rejects.toThrow('Network request timeout');
    });

    it('should handle connection refused', async () => {
      const connectionError = new Error('Connection refused');
      connectionError.name = 'FetchError';

      (supabase.functions.invoke as jest.Mock).mockRejectedValue(connectionError);

      await expect(
        paymentsApi.createPaymentIntent({ amount: 100, currency: 'usd' })
      ).rejects.toThrow('Connection refused');
    });

    it('should handle DNS resolution failure', async () => {
      const dnsError = new Error('getaddrinfo ENOTFOUND api.supabase.co');

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockRejectedValue(dnsError),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(paymentsApi.getTransactions()).rejects.toThrow('ENOTFOUND');
    });
  });

  // ========================================
  // DATABASE SPECIFIC ERRORS
  // ========================================
  describe('Database Specific Errors', () => {
    beforeEach(() => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });

    it('should handle unique constraint violation', async () => {
      const uniqueError = {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
        details: 'Key (user_id)=(user-123) already exists.',
      };

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: uniqueError }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      await expect(
        paymentsApi.requestRefund('tx-123', 'Test reason')
      ).rejects.toMatchObject({
        code: '23505',
      });
    });

    it('should handle foreign key constraint violation', async () => {
      const fkError = {
        code: '23503',
        message: 'insert or update on table violates foreign key constraint',
        details: 'Key (transaction_id)=(tx-invalid) is not present in table "transactions".',
      };

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: fkError }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      await expect(
        paymentsApi.requestRefund('tx-invalid', 'Test reason')
      ).rejects.toMatchObject({
        code: '23503',
      });
    });

    it('should handle not null constraint violation', async () => {
      const nullError = {
        code: '23502',
        message: 'null value in column violates not-null constraint',
        details: 'Column "amount" contains null values.',
      };

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: nullError }),
            }),
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      await expect(paymentsApi.cancelSubscription()).rejects.toMatchObject({
        code: '23502',
      });
    });

    it('should handle PGRST116 (no rows) gracefully for optional queries', async () => {
      const noRowsError = {
        code: 'PGRST116',
        message: 'JSON object requested, multiple (or no) rows returned',
        details: null,
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: noRowsError }),
            }),
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      // getKYCStatus handles PGRST116 gracefully
      const result = await paymentsApi.getKYCStatus();
      expect(result).toBeNull();
    });
  });

  // ========================================
  // STORAGE ERRORS
  // ========================================
  describe('Storage Errors', () => {
    beforeEach(() => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });

    it('submitKYC should throw on storage upload error', async () => {
      const uploadError = {
        message: 'Payload too large',
        statusCode: 413,
      };

      const mockUpload = jest.fn().mockResolvedValue({ error: uploadError });
      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
      });

      const formData = new FormData();
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('front', mockFile);

      await expect(paymentsApi.submitKYC(formData)).rejects.toMatchObject({
        message: 'Payload too large',
      });
    });

    it('submitKYC should throw on storage permission error', async () => {
      const permissionError = {
        message: 'Not authorized to upload to this bucket',
        statusCode: 403,
      };

      const mockUpload = jest.fn().mockResolvedValue({ error: permissionError });
      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
      });

      const formData = new FormData();
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('front', mockFile);

      await expect(paymentsApi.submitKYC(formData)).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });

  // ========================================
  // EDGE FUNCTION SPECIFIC ERRORS
  // ========================================
  describe('Edge Function Errors', () => {
    beforeEach(() => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });

    it('should handle rate limiting (429)', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Rate limit exceeded',
          status: 429,
          details: 'Too many requests. Please try again later.',
        },
      });

      await expect(
        paymentsApi.createPaymentIntent({ amount: 100, currency: 'usd' })
      ).rejects.toMatchObject({
        status: 429,
      });
    });

    it('should handle bad gateway (502)', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Bad Gateway',
          status: 502,
        },
      });

      await expect(paymentsApi.withdraw(100)).rejects.toMatchObject({
        status: 502,
      });
    });

    it('should handle service unavailable (503)', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Service temporarily unavailable',
          status: 503,
        },
      });

      await expect(paymentsApi.sendGift('user-456', 50)).rejects.toMatchObject({
        status: 503,
      });
    });

    it('should handle gateway timeout (504)', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Gateway Timeout',
          status: 504,
        },
      });

      await expect(paymentsApi.createSubscription('plan-123')).rejects.toMatchObject({
        status: 504,
      });
    });
  });

  // ========================================
  // VALIDATION ERRORS (400)
  // ========================================
  describe('400 Bad Request', () => {
    beforeEach(() => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
    });

    it('should handle invalid amount for payment intent', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Invalid amount: must be a positive integer',
          status: 400,
        },
      });

      await expect(
        paymentsApi.createPaymentIntent({ amount: -100, currency: 'usd' })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Invalid amount'),
      });
    });

    it('should handle invalid currency', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Invalid currency code',
          status: 400,
        },
      });

      await expect(
        paymentsApi.createPaymentIntent({ amount: 100, currency: 'invalid' })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Invalid currency'),
      });
    });

    it('should handle insufficient balance for withdrawal', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Insufficient balance',
          status: 400,
        },
      });

      await expect(paymentsApi.withdraw(10000)).rejects.toMatchObject({
        message: 'Insufficient balance',
      });
    });
  });

  // ========================================
  // AUTH ERRORS
  // ========================================
  describe('Auth Errors', () => {
    it('should handle session expired during request', async () => {
      const sessionExpiredError = {
        code: 'session_expired',
        message: 'JWT expired',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: sessionExpiredError,
      });

      await expect(paymentsApi.getWallet()).rejects.toThrow('User not authenticated');
    });

    it('should handle invalid JWT token', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const invalidTokenError = {
        code: 'PGRST301',
        message: 'JWT could not be verified',
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: invalidTokenError }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(paymentsApi.getWallet()).rejects.toMatchObject({
        code: 'PGRST301',
      });
    });
  });
});
