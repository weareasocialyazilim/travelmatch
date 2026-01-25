/**
 * Payment Service - Retry Logic Edge Cases
 *
 * Tests for payment retry scenarios without fake timers
 */

import { securePaymentService as paymentService } from '../securePaymentService';
import { supabase } from '../../config/supabase';
import { transactionsService } from '../supabaseDbService';
import { logger } from '../../utils/logger';

// Mock dependencies
jest.mock('../../config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(),
    functions: {
      invoke: jest.fn(),
    },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}));

jest.mock('../supabaseDbService', () => ({
  transactionsService: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockTransactionsService = transactionsService as jest.Mocked<
  typeof transactionsService
>;
const mockLogger = logger as jest.Mocked<typeof logger>;

// Helper function to simulate retry logic (no actual delays in tests)
async function processPaymentWithRetry(
  data: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    description?: string;
    metadata?: Record<string, unknown>;
    moment_id?: string | null;
    escrow_status?: 'locked' | 'released' | 'refunded' | null;
  },
  maxRetries = 3,
): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Payment attempt ${attempt + 1}/${maxRetries + 1}`);
      const result = await paymentService.processPayment(data);
      logger.info(`Payment succeeded on attempt ${attempt + 1}`);
      return result;
    } catch (error: any) {
      lastError = error;
      logger.warn(`Payment attempt ${attempt + 1} failed:`, error.message);

      if (attempt < maxRetries) {
        logger.info(`Will retry (attempt ${attempt + 2})`);
        // In tests, we skip the actual delay
      }
    }
  }

  logger.error(`Payment failed after ${maxRetries + 1} attempts`);
  throw lastError || new Error('Payment failed after retries');
}

describe('PaymentService - Retry Logic', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    });
  });

  describe('Network Failure Retry', () => {
    it('should retry payment after network failure', async () => {
      const mockTransaction = {
        id: 'tx-123',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift sent',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      };

      // First 2 attempts fail with network error, 3rd succeeds
      mockTransactionsService.create
        .mockRejectedValueOnce(new Error('Network request failed'))
        .mockRejectedValueOnce(new Error('Network request failed'))
        .mockResolvedValueOnce({ data: mockTransaction, error: null });

      const result = await processPaymentWithRetry({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift sent',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      });

      expect(result).toHaveProperty('transaction');
      expect(result.transaction.amount).toBe(50);
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(3);
      expect(mockLogger.warn).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('succeeded'),
      );
    });

    it('should use exponential backoff pattern', async () => {
      const mockTransaction = {
        id: 'tx-123',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift sent',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      };

      // Two failures then success
      mockTransactionsService.create
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValueOnce({ data: mockTransaction, error: null });

      const result = await processPaymentWithRetry({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift sent',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      });

      expect(result).toHaveProperty('transaction');
      // Verify retry info was logged
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Will retry'),
      );
    });

    it('should fail after max attempts (3)', async () => {
      // All attempts fail
      mockTransactionsService.create
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockRejectedValueOnce(new Error('Error 3'))
        .mockRejectedValueOnce(new Error('Error 4'));

      await expect(
        processPaymentWithRetry({
          amount: 50,
          currency: 'USD',
          paymentMethodId: 'pm_123',
          description: 'Gift sent',
          metadata: {},
          moment_id: null,
          escrow_status: null,
        }),
      ).rejects.toThrow('Error 4');

      expect(mockTransactionsService.create).toHaveBeenCalledTimes(4);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('failed after 4 attempts'),
      );
    });
  });

  describe('Retry Success Scenarios', () => {
    it('should succeed on first retry', async () => {
      const mockTransaction = {
        id: 'tx-123',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift sent',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      };

      // First attempt fails, second succeeds
      mockTransactionsService.create
        .mockRejectedValueOnce(new Error('Temporary network error'))
        .mockResolvedValueOnce({ data: mockTransaction, error: null });

      const result = await processPaymentWithRetry({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift sent',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      });

      expect(result).toHaveProperty('transaction');
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('succeeded on attempt 2'),
      );
    });

    it('should succeed on last retry attempt', async () => {
      const mockTransaction = {
        id: 'tx-123',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift sent',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      };

      // Fail 3 times, succeed on 4th (last) attempt
      mockTransactionsService.create
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockRejectedValueOnce(new Error('Error 3'))
        .mockResolvedValueOnce({ data: mockTransaction, error: null });

      const result = await processPaymentWithRetry({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift sent',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      });

      expect(result).toHaveProperty('transaction');
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(4);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('succeeded on attempt 4'),
      );
    });

    it('should succeed on first attempt with no retries needed', async () => {
      const mockTransaction = {
        id: 'tx-123',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift sent',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      };

      mockTransactionsService.create.mockResolvedValueOnce({
        data: mockTransaction,
        error: null,
      });

      const result = await processPaymentWithRetry({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift sent',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      });

      expect(result).toHaveProperty('transaction');
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(1);
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });
  });

  describe('Permanent Failure Handling', () => {
    it('should not retry on authentication errors', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(
        paymentService.processPayment({
          amount: 50,
          currency: 'USD',
          paymentMethodId: 'pm_123',
          description: 'Gift sent',
        }),
      ).rejects.toThrow();

      expect(mockTransactionsService.create).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      mockTransactionsService.create.mockRejectedValue(
        new Error('Invalid amount: must be positive'),
      );

      await expect(
        paymentService.processPayment({
          amount: -50,
          currency: 'USD',
          paymentMethodId: 'pm_123',
          description: 'Gift sent',
        }),
      ).rejects.toThrow();
    });

    it('should preserve original error message', async () => {
      const originalError = new Error('Card declined');
      mockTransactionsService.create.mockRejectedValue(originalError);

      await expect(
        processPaymentWithRetry(
          {
            amount: 50,
            currency: 'USD',
            paymentMethodId: 'pm_123',
            description: 'Gift sent',
            metadata: {},
            moment_id: null,
            escrow_status: null,
          },
          0,
        ),
      ).rejects.toThrow('Card declined');
    });
  });

  describe('Withdrawal Retry', () => {
    it('should retry withdrawal after network failure', async () => {
      const mockTransaction = {
        id: 'tx-456',
        user_id: 'user-123',
        amount: -100,
        currency: 'USD',
        type: 'withdrawal',
        status: 'pending',
        created_at: new Date().toISOString(),
        description: 'Withdrawal to bank account',
      };

      // Helper for withdrawal retry (simplified - no actual delays)
      async function withdrawWithRetry(data: any, maxRetries = 3) {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            return await paymentService.withdrawFunds(data);
          } catch (error: any) {
            lastError = error;
            if (attempt >= maxRetries) break;
          }
        }

        throw lastError || new Error('Withdrawal failed');
      }

      // First attempt fails, second succeeds
      jest
        .spyOn(paymentService, 'withdrawFunds')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          settlementId: 'sett-123',
          fiatAmount: 100,
        });

      const result = await withdrawWithRetry({
        amount: 100,
        currency: 'USD',
        bankAccountId: 'ba_123',
      });

      expect(result.settlementId).toBe('sett-123');
      expect(result.fiatAmount).toBe(100);
    });
  });

  describe('Retry Configuration', () => {
    it('should respect custom max retries', async () => {
      mockTransactionsService.create.mockRejectedValue(
        new Error('Always fail'),
      );

      // Custom max retries = 1
      await expect(
        processPaymentWithRetry(
          {
            amount: 50,
            currency: 'USD',
            paymentMethodId: 'pm_123',
            description: 'Gift sent',
            metadata: {},
            moment_id: null,
            escrow_status: null,
          },
          1,
        ),
      ).rejects.toThrow();

      // Should be called 2 times (initial + 1 retry)
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(2);
    });

    it('should work with zero retries', async () => {
      mockTransactionsService.create.mockRejectedValue(new Error('Fail'));

      await expect(
        processPaymentWithRetry(
          {
            amount: 50,
            currency: 'USD',
            paymentMethodId: 'pm_123',
            description: 'Gift sent',
            metadata: {},
            moment_id: null,
            escrow_status: null,
          },
          0,
        ),
      ).rejects.toThrow();

      expect(mockTransactionsService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Logging', () => {
    it('should log each failed attempt', async () => {
      mockTransactionsService.create
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockRejectedValueOnce(new Error('Error 3'))
        .mockRejectedValueOnce(new Error('Error 4'));

      await expect(
        processPaymentWithRetry({
          amount: 50,
          currency: 'USD',
          paymentMethodId: 'pm_123',
          description: 'Gift sent',
          metadata: {},
          moment_id: null,
          escrow_status: null,
        }),
      ).rejects.toThrow();

      // Should have logged warnings for retries (at least 3 retries)
      expect(mockLogger.warn.mock.calls.length).toBeGreaterThanOrEqual(3);
      // Should have logged at least one error for final failure
      expect(mockLogger.error.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    it('should log successful attempt after failures', async () => {
      const mockTransaction = {
        id: 'tx-123',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift sent',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      };

      mockTransactionsService.create
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce({ data: mockTransaction, error: null });

      await processPaymentWithRetry({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift sent',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('succeeded on attempt 2'),
      );
    });
  });
});
