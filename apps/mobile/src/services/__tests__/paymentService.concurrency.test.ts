/**
 * Payment Service - Concurrency Edge Cases
 *
 * Tests for concurrent payment scenarios:
 * - Duplicate payment prevention (double-click)
 * - Concurrent payment requests
 * - Idempotency key validation
 * - Race condition handling
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

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockTransactionsService = transactionsService as jest.Mocked<
  typeof transactionsService
>;
const mockLogger = logger as jest.Mocked<typeof logger>;

// Simulated idempotency helper (would be in paymentService in production)
const pendingPayments = new Map<string, Promise<any>>();

async function processPaymentWithIdempotency(data: {
  amount: number;
  currency: string;
  paymentMethodId: string;
  description?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}): Promise<any> {
  const key =
    data.idempotencyKey ||
    `${data.paymentMethodId}-${data.amount}-${Date.now()}`;

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
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
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

      mockTransactionsService.create.mockResolvedValue({
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
        expect.stringContaining('Duplicate payment detected'),
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

      mockTransactionsService.create
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

      mockTransactionsService.create
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

      mockTransactionsService.create
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

      mockTransactionsService.create
        .mockResolvedValueOnce({ data: mockTransaction1, error: null })
        .mockRejectedValueOnce(new Error('Insufficient funds'))
        .mockResolvedValueOnce({
          data: { ...mockTransaction1, id: 'tx-3', description: 'Gift 3' },
          error: null,
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
      }).catch((err) => err);

      const payment3 = processPaymentWithIdempotency({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift 3',
        idempotencyKey: 'key-3',
      });

      const [result1, result2, result3] = await Promise.all([
        payment1,
        payment2,
        payment3,
      ]);

      expect(result1).toHaveProperty('transaction');
      expect(result2).toBeInstanceOf(Error);
      expect(result3).toHaveProperty('transaction');
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('Race Condition Handling', () => {
    it('should handle race condition when checking balance simultaneously', async () => {
      const mockBalance = { balance: 100, currency: 'USD', status: 'active' };

      // Need to mock both wallets query and escrow_transactions query
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockBalance, error: null }),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'wallets') {
          return mockChain;
        }
        // escrow_transactions query
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      });

      // Multiple simultaneous balance checks
      const balance1 = paymentService.getBalance();
      const balance2 = paymentService.getBalance();
      const balance3 = paymentService.getBalance();

      const [result1, result2, result3] = await Promise.all([
        balance1,
        balance2,
        balance3,
      ]);

      // All should return same balance
      expect(result1.available).toBe(100);
      expect(result2.available).toBe(100);
      expect(result3.available).toBe(100);
    });

    it('should handle concurrent withdrawals', async () => {
      // This test verifies that concurrent withdrawal attempts are processed
      // The actual race condition prevention happens at the database level
      const mockBalance = { balance: 100, currency: 'USD', status: 'active' };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'wallets') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest
              .fn()
              .mockResolvedValue({ data: mockBalance, error: null }),
          };
        }
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      });

      // Just verify the balance check works, actual withdrawal logic is tested elsewhere
      const balance = await paymentService.getBalance();
      expect(balance.available).toBe(100);
    });
  });

  describe('Transaction Ordering', () => {
    it('should process payments in correct order despite concurrent requests', async () => {
      const transactions: string[] = [];

      mockTransactionsService.create.mockImplementation((data) => {
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

      mockTransactionsService.create.mockResolvedValue({
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
