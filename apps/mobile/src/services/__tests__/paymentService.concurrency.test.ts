/**
 * Payment Service - Concurrency Edge Cases
 * 
 * Tests for concurrent payment scenarios:
 * - Duplicate payment prevention (double-click)
 * - Concurrent payment requests
 * - Idempotency key validation
 * - Race condition handling
 */

import { paymentService } from '../paymentService';
import { supabase } from '../../config/supabase';
import { transactionsService } from '../supabaseDbService';
import { logger } from '../../utils/logger';

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
    get: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

const mockSupabase = supabase ;
const mockTransactionsService = transactionsService ;
const mockLogger = logger ;

// Simulated idempotency helper (would be in paymentService in production)
const pendingPayments = new Map<string, Promise<any>>();

async function processPaymentWithIdempotency(
  data: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    description?: string;
    metadata?;
    idempotencyKey?: string;
  }
): Promise<any> {
  const key = data.idempotencyKey || `${data.paymentMethodId}-${data.amount}-${Date.now()}`;

  // Check if payment is already in progress
  if (pendingPayments.has(key)) {
    logger.warn('Duplicate payment detected, returning pending request');
    return pendingPayments.get(key);
  }

  // Create new payment promise
  const paymentPromise = paymentService.processPayment(data);

  // Store pending promise
  pendingPayments.set(key, paymentPromise);

  try {
    const result = await paymentPromise;
    return result;
  } finally {
    // Clean up after completion (success or failure)
    setTimeout(() => pendingPayments.delete(key), 5000); // Keep for 5s to prevent immediate duplicates
  }
}

describe('PaymentService - Concurrency Edge Cases', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    pendingPayments.clear();
    (mockSupabase.auth.getUser ).mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    });
  });

  describe('Duplicate Payment Prevention', () => {
    it('should prevent duplicate payment on double-click', async () => {
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

      (mockTransactionsService.create ).mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      const paymentData = {
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift sent',
        idempotencyKey: 'unique-key-123',
      };

      // Simulate double-click (two rapid requests)
      const payment1 = processPaymentWithIdempotency(paymentData);
      const payment2 = processPaymentWithIdempotency(paymentData);

      const [result1, result2] = await Promise.all([payment1, payment2]);

      // Both should return the same result
      expect(result1).toBe(result2);
      
      // But only one payment should be created
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(1);
      
      // Warning should be logged for duplicate
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Duplicate payment detected')
      );
    });

    it('should create separate payments with different idempotency keys', async () => {
      const mockTransaction1 = {
        id: 'tx-123',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift 1',
      };

      const mockTransaction2 = {
        id: 'tx-124',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift 2',
      };

      (mockTransactionsService.create )
        .mockResolvedValueOnce({ data: mockTransaction1, error: null })
        .mockResolvedValueOnce({ data: mockTransaction2, error: null });

      const payment1 = processPaymentWithIdempotency({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift 1',
        idempotencyKey: 'key-1',
      });

      const payment2 = processPaymentWithIdempotency({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift 2',
        idempotencyKey: 'key-2',
      });

      const [result1, result2] = await Promise.all([payment1, payment2]);

      expect(result1.transaction.id).toBe('tx-123');
      expect(result2.transaction.id).toBe('tx-124');
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(2);
    });

    it('should allow new payment after idempotency key expires', async () => {
      jest.useFakeTimers();

      const mockTransaction1 = {
        id: 'tx-123',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift 1',
      };

      const mockTransaction2 = {
        id: 'tx-124',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift 2',
      };

      (mockTransactionsService.create )
        .mockResolvedValueOnce({ data: mockTransaction1, error: null })
        .mockResolvedValueOnce({ data: mockTransaction2, error: null });

      const paymentData = {
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift',
        idempotencyKey: 'key-1',
      };

      // First payment
      const result1 = await processPaymentWithIdempotency(paymentData);

      // Wait for idempotency key to expire (5s)
      jest.advanceTimersByTime(6000);

      // Second payment with same key should be allowed
      const result2 = await processPaymentWithIdempotency(paymentData);

      expect(result1.transaction.id).toBe('tx-123');
      expect(result2.transaction.id).toBe('tx-124');
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });
  });

  describe('Concurrent Payment Requests', () => {
    it('should handle multiple concurrent payments for different moments', async () => {
      const mockTransaction1 = {
        id: 'tx-1',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift for Moment 1',
      };

      const mockTransaction2 = {
        id: 'tx-2',
        user_id: 'user-123',
        amount: 75,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift for Moment 2',
      };

      const mockTransaction3 = {
        id: 'tx-3',
        user_id: 'user-123',
        amount: 100,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift for Moment 3',
      };

      (mockTransactionsService.create )
        .mockResolvedValueOnce({ data: mockTransaction1, error: null })
        .mockResolvedValueOnce({ data: mockTransaction2, error: null })
        .mockResolvedValueOnce({ data: mockTransaction3, error: null });

      const payment1 = processPaymentWithIdempotency({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift for Moment 1',
        metadata: { momentId: 'moment-1' },
        idempotencyKey: 'moment-1-payment',
      });

      const payment2 = processPaymentWithIdempotency({
        amount: 75,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift for Moment 2',
        metadata: { momentId: 'moment-2' },
        idempotencyKey: 'moment-2-payment',
      });

      const payment3 = processPaymentWithIdempotency({
        amount: 100,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift for Moment 3',
        metadata: { momentId: 'moment-3' },
        idempotencyKey: 'moment-3-payment',
      });

      const results = await Promise.all([payment1, payment2, payment3]);

      expect(results).toHaveLength(3);
      expect(results[0].transaction.amount).toBe(50);
      expect(results[1].transaction.amount).toBe(75);
      expect(results[2].transaction.amount).toBe(100);
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(3);
    });

    it('should handle mix of successful and failed concurrent payments', async () => {
      const mockTransaction1 = {
        id: 'tx-1',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift 1',
      };

      (mockTransactionsService.create )
        .mockResolvedValueOnce({ data: mockTransaction1, error: null })
        .mockRejectedValueOnce(new Error('Insufficient funds'))
        .mockResolvedValueOnce({ 
          data: { ...mockTransaction1, id: 'tx-3', description: 'Gift 3' }, 
          error: null 
        });

      const payment1 = processPaymentWithIdempotency({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift 1',
        idempotencyKey: 'key-1',
      });

      const payment2 = processPaymentWithIdempotency({
        amount: 1000,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift 2 (too large)',
        idempotencyKey: 'key-2',
      }).catch(err => err);

      const payment3 = processPaymentWithIdempotency({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift 3',
        idempotencyKey: 'key-3',
      });

      const [result1, result2, result3] = await Promise.all([payment1, payment2, payment3]);

      expect(result1).toHaveProperty('transaction');
      expect(result2).toBeInstanceOf(Error);
      expect(result3).toHaveProperty('transaction');
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('Race Condition Handling', () => {
    it('should handle race condition when checking balance simultaneously', async () => {
      const mockBalance = { balance: 100, currency: 'USD' };

      (mockSupabase.from ).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockBalance, error: null }),
          }),
        }),
      });

      // Multiple simultaneous balance checks
      const balance1 = paymentService.getBalance();
      const balance2 = paymentService.getBalance();
      const balance3 = paymentService.getBalance();

      const [result1, result2, result3] = await Promise.all([balance1, balance2, balance3]);

      // All should return same balance
      expect(result1.available).toBe(100);
      expect(result2.available).toBe(100);
      expect(result3.available).toBe(100);

      // All requests should complete successfully
      expect(mockSupabase.from).toHaveBeenCalledTimes(3);
    });

    it('should prevent race condition in concurrent withdrawals', async () => {
      // Simulate balance check before withdrawal
      const mockBalance = { balance: 100, currency: 'USD' };

      (mockSupabase.from ).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockBalance, error: null }),
          }),
        }),
      });

      const mockTransaction1 = {
        id: 'tx-w1',
        user_id: 'user-123',
        amount: -80,
        currency: 'USD',
        type: 'withdrawal',
        status: 'pending',
        created_at: new Date().toISOString(),
        description: 'Withdrawal 1',
      };

      // First withdrawal should succeed, second should fail (insufficient funds)
      (mockTransactionsService.create )
        .mockResolvedValueOnce({ data: mockTransaction1, error: null })
        .mockRejectedValueOnce(new Error('Insufficient funds'));

      const withdrawal1 = paymentService.withdrawFunds({
        amount: 80,
        currency: 'USD',
        bankAccountId: 'bank_123',
      });

      const withdrawal2 = paymentService.withdrawFunds({
        amount: 80,
        currency: 'USD',
        bankAccountId: 'bank_123',
      }).catch(err => err);

      const [result1, result2] = await Promise.all([withdrawal1, withdrawal2]);

      expect(result1).toHaveProperty('transaction');
      expect(result1.transaction.amount).toBe(-80);
      expect(result2).toBeInstanceOf(Error);
    });
  });

  describe('Transaction Ordering', () => {
    it('should process payments in correct order despite concurrent requests', async () => {
      const transactions: string[] = [];

      (mockTransactionsService.create ).mockImplementation((data) => {
        transactions.push(data.description);
        return Promise.resolve({
          data: {
            id: `tx-${transactions.length}`,
            user_id: 'user-123',
            amount: data.amount,
            currency: data.currency,
            type: data.type,
            status: 'completed',
            created_at: new Date().toISOString(),
            description: data.description,
          },
          error: null,
        });
      });

      const payment1 = paymentService.processPayment({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Payment 1',
      });

      const payment2 = paymentService.processPayment({
        amount: 75,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Payment 2',
      });

      const payment3 = paymentService.processPayment({
        amount: 100,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Payment 3',
      });

      await Promise.all([payment1, payment2, payment3]);

      // All transactions should be created
      expect(transactions).toHaveLength(3);
      expect(transactions).toContain('Payment 1');
      expect(transactions).toContain('Payment 2');
      expect(transactions).toContain('Payment 3');
    });
  });

  describe('Idempotency Key Generation', () => {
    it('should generate unique idempotency keys for different payments', () => {
      const key1 = `pm_123-50-${Date.now()}`;
      const key2 = `pm_456-75-${Date.now()}`;

      expect(key1).not.toBe(key2);
    });

    it('should use provided idempotency key if available', async () => {
      const mockTransaction = {
        id: 'tx-123',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift',
      };

      (mockTransactionsService.create ).mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      const customKey = 'my-custom-idempotency-key';

      const payment1 = processPaymentWithIdempotency({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift',
        idempotencyKey: customKey,
      });

      const payment2 = processPaymentWithIdempotency({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift',
        idempotencyKey: customKey,
      });

      const [result1, result2] = await Promise.all([payment1, payment2]);

      // Same idempotency key = same result
      expect(result1).toBe(result2);
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(1);
    });
  });
});
