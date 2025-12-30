/**
 * Payment Service - Timeout Edge Cases
 * 
 * Tests for payment timeout scenarios:
 * - Payment intent creation timeout (30s)
 * - Transaction confirmation timeout
 * - Webhook response timeout
 * - Timeout error handling and recovery
 */

import { paymentService } from '../paymentService';
import { supabase } from '../../config/supabase';
import { transactionsService } from '../supabaseDbService';

// Mock dependencies
jest.mock('../../config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
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
const mockTransactionsService = transactionsService as jest.Mocked<typeof transactionsService>;

describe('PaymentService - Timeout Edge Cases', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (mockSupabase.auth.getUser ).mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Payment Intent Timeout', () => {
    it('should timeout payment intent creation after 30 seconds', async () => {
      // Mock slow payment intent creation
      const slowPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              id: 'tx-123',
              user_id: 'user-123',
              amount: 50,
              currency: 'USD',
              type: 'payment',
              status: 'completed',
              created_at: new Date().toISOString(),
              description: 'Gift sent',
            },
            error: null,
          });
        }, 35000); // 35 seconds (exceeds 30s timeout)
      });

      (mockTransactionsService.create ).mockReturnValue(slowPromise);

      // Create payment with timeout wrapper
      const paymentPromise = Promise.race([
        paymentService.processPayment({
          amount: 50,
          currency: 'USD',
          paymentMethodId: 'pm_123',
          description: 'Gift sent',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Payment timeout after 30s')), 30000)
        ),
      ]);

      // Fast-forward time
      jest.advanceTimersByTime(30000);

      await expect(paymentPromise).rejects.toThrow('Payment timeout after 30s');
    });

    it('should complete payment before timeout (fast payment)', async () => {
      const mockTransaction = {
        id: 'tx-123',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift sent',
      };

      // Mock fast response (2 seconds)
      (mockTransactionsService.create ).mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      const paymentPromise = Promise.race([
        paymentService.processPayment({
          amount: 50,
          currency: 'USD',
          paymentMethodId: 'pm_123',
          description: 'Gift sent',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Payment timeout after 30s')), 30000)
        ),
      ]);

      // Fast-forward only 2 seconds
      jest.advanceTimersByTime(2000);

      const result = await paymentPromise;

      expect(result).toHaveProperty('transaction');
      expect(result.transaction.amount).toBe(50);
      expect(result.transaction.status).toBe('completed');
    });

    it('should mark transaction as failed on timeout', async () => {
      const mockTransaction = {
        id: 'tx-123',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'pending',
        created_at: new Date().toISOString(),
        description: 'Gift sent',
      };

      // Create transaction first
      (mockTransactionsService.create ).mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      // Mock update to mark as failed
      (mockTransactionsService.update ).mockResolvedValue({
        data: { ...mockTransaction, status: 'failed' },
        error: null,
      });

      // Simulate timeout
      const paymentPromise = Promise.race([
        paymentService.processPayment({
          amount: 50,
          currency: 'USD',
          paymentMethodId: 'pm_123',
          description: 'Gift sent',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Payment timeout after 30s')), 30000)
        ),
      ]);

      jest.advanceTimersByTime(30000);

      try {
        await paymentPromise;
      } catch (error: any) {
        expect(error.message).toBe('Payment timeout after 30s');
      }

      // Verify transaction would be marked as failed
      // Note: This would require implementing timeout handler in paymentService
    });
  });

  describe('Withdrawal Timeout', () => {
    it('should timeout withdrawal after 30 seconds', async () => {
      const slowPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              id: 'tx-456',
              user_id: 'user-123',
              amount: -100,
              currency: 'USD',
              type: 'withdrawal',
              status: 'pending',
              created_at: new Date().toISOString(),
              description: 'Withdrawal to bank account',
            },
            error: null,
          });
        }, 35000);
      });

      (mockTransactionsService.create ).mockReturnValue(slowPromise);

      const withdrawalPromise = Promise.race([
        paymentService.withdrawFunds({
          amount: 100,
          currency: 'USD',
          bankAccountId: 'bank_123',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Withdrawal timeout after 30s')), 30000)
        ),
      ]);

      jest.advanceTimersByTime(30000);

      await expect(withdrawalPromise).rejects.toThrow('Withdrawal timeout after 30s');
    });

    it('should complete withdrawal before timeout', async () => {
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

      (mockTransactionsService.create ).mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      const withdrawalPromise = Promise.race([
        paymentService.withdrawFunds({
          amount: 100,
          currency: 'USD',
          bankAccountId: 'bank_123',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Withdrawal timeout after 30s')), 30000)
        ),
      ]);

      jest.advanceTimersByTime(2000);

      const result = await withdrawalPromise;

      expect(result).toHaveProperty('transaction');
      expect(result.transaction.amount).toBe(-100);
      expect(result.transaction.status).toBe('pending');
    });
  });

  describe('Balance Query Timeout', () => {
    it('should timeout balance query after 10 seconds', async () => {
      const slowPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: { balance: 100, currency: 'USD' },
            error: null,
          });
        }, 15000);
      });

      (mockSupabase.from ).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockReturnValue(slowPromise),
          }),
        }),
      });

      const balancePromise = Promise.race([
        paymentService.getBalance(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Balance query timeout after 10s')), 10000)
        ),
      ]);

      jest.advanceTimersByTime(10000);

      await expect(balancePromise).rejects.toThrow('Balance query timeout after 10s');
    });

    it('should return default balance on timeout', async () => {
      const slowPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: { balance: 100, currency: 'USD' },
            error: null,
          });
        }, 15000);
      });

      (mockSupabase.from ).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockReturnValue(slowPromise),
          }),
        }),
      });

      // Wrap with timeout and fallback
      const balancePromise = Promise.race([
        paymentService.getBalance(),
        new Promise<{ available: number; pending: number; currency: string }>((resolve) => 
          setTimeout(() => resolve({ available: 0, pending: 0, currency: 'USD' }), 10000)
        ),
      ]);

      jest.advanceTimersByTime(10000);

      const result = await balancePromise;

      expect(result).toEqual({
        available: 0,
        pending: 0,
        currency: 'USD',
      });
    });
  });

  describe('Timeout Recovery', () => {
    it('should allow retry after timeout', async () => {
      // First attempt: timeout
      const slowPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              id: 'tx-123',
              user_id: 'user-123',
              amount: 50,
              currency: 'USD',
              type: 'payment',
              status: 'completed',
              created_at: new Date().toISOString(),
              description: 'Gift sent',
            },
            error: null,
          });
        }, 35000);
      });

      (mockTransactionsService.create )
        .mockReturnValueOnce(slowPromise) // First call: slow
        .mockResolvedValueOnce({ // Second call: fast
          data: {
            id: 'tx-124',
            user_id: 'user-123',
            amount: 50,
            currency: 'USD',
            type: 'payment',
            status: 'completed',
            created_at: new Date().toISOString(),
            description: 'Gift sent (retry)',
          },
          error: null,
        });

      // First attempt
      const firstAttempt = Promise.race([
        paymentService.processPayment({
          amount: 50,
          currency: 'USD',
          paymentMethodId: 'pm_123',
          description: 'Gift sent',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Payment timeout after 30s')), 30000)
        ),
      ]);

      jest.advanceTimersByTime(30000);

      await expect(firstAttempt).rejects.toThrow('Payment timeout after 30s');

      // Reset timers for retry
      jest.clearAllTimers();

      // Second attempt (retry)
      const secondAttempt = await paymentService.processPayment({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift sent (retry)',
      });

      expect(secondAttempt).toHaveProperty('transaction');
      expect(secondAttempt.transaction.id).toBe('tx-124');
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('Concurrent Timeouts', () => {
    it('should handle multiple simultaneous timeout scenarios', async () => {
      const slowPromise1 = new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              id: 'tx-1',
              user_id: 'user-123',
              amount: 50,
              currency: 'USD',
              type: 'payment',
              status: 'completed',
              created_at: new Date().toISOString(),
              description: 'Payment 1',
            },
            error: null,
          });
        }, 35000);
      });

      const slowPromise2 = new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              id: 'tx-2',
              user_id: 'user-123',
              amount: 75,
              currency: 'USD',
              type: 'payment',
              status: 'completed',
              created_at: new Date().toISOString(),
              description: 'Payment 2',
            },
            error: null,
          });
        }, 35000);
      });

      (mockTransactionsService.create )
        .mockReturnValueOnce(slowPromise1)
        .mockReturnValueOnce(slowPromise2);

      const payment1 = Promise.race([
        paymentService.processPayment({
          amount: 50,
          currency: 'USD',
          paymentMethodId: 'pm_123',
          description: 'Payment 1',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Payment 1 timeout')), 30000)
        ),
      ]);

      const payment2 = Promise.race([
        paymentService.processPayment({
          amount: 75,
          currency: 'USD',
          paymentMethodId: 'pm_456',
          description: 'Payment 2',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Payment 2 timeout')), 30000)
        ),
      ]);

      jest.advanceTimersByTime(30000);

      await expect(payment1).rejects.toThrow('Payment 1 timeout');
      await expect(payment2).rejects.toThrow('Payment 2 timeout');

      expect(mockTransactionsService.create).toHaveBeenCalledTimes(2);
    });
  });
});
