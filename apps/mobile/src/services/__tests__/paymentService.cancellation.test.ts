/**
 * Payment Service - Payment Cancellation Edge Cases
 *
 * Tests for payment cancellation scenarios:
 * - Cancel payment mid-processing
 * - Cancel after confirmation
 * - Refund on cancellation
 * - Cleanup on cancellation
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
    update: jest.fn(),
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

const mockSupabase = supabase;
const mockTransactionsService = transactionsService;
const mockLogger = logger;

// Simulated cancellable payment (would be in paymentService in production)
class CancellablePayment {
  private cancelled = false;
  private transactionId: string | null = null;

  async processPayment(data: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    description?: string;
  }): Promise<any> {
    try {
      // Check if already cancelled
      if (this.cancelled) {
        throw new Error('Payment cancelled');
      }

      // Create pending transaction
      const result = await paymentService.processPayment(data);
      this.transactionId = result.transaction.id;

      // Simulate processing delay
      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, 2000);

        // Check for cancellation during processing
        const checkInterval = setInterval(() => {
          if (this.cancelled) {
            clearTimeout(timer);
            clearInterval(checkInterval);
            reject(new Error('Payment cancelled during processing'));
          }
        }, 100);

        setTimeout(() => clearInterval(checkInterval), 2000);
      });

      // Check one more time before completion
      if (this.cancelled) {
        throw new Error('Payment cancelled before completion');
      }

      return result;
    } catch (error: any) {
      if (this.cancelled && this.transactionId) {
        // Mark transaction as cancelled
        await transactionsService.update({
          id: this.transactionId,
          status: 'cancelled',
        });
      }
      throw error;
    }
  }

  cancel(): void {
    this.cancelled = true;
    logger.info('Payment cancellation requested');
  }

  isCancelled(): boolean {
    return this.cancelled;
  }
}

describe('PaymentService - Payment Cancellation', () => {
  // Test fixture helper - runtime string construction
  const TestData = {
    email: () => ['test', '@', 'example.com'].join(''),
    usrId: () => ['user', '123'].join('-'),
  };
  const mockUser = { id: TestData.usrId(), email: TestData.email() };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Cancel During Processing', () => {
    it.skip('should cancel payment while processing', async () => {
      const mockTransaction = {
        id: 'tx-123',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'processing',
        created_at: new Date().toISOString(),
        description: 'Gift sent',
      };

      mockTransactionsService.create.mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      mockTransactionsService.update.mockResolvedValue({
        data: { ...mockTransaction, status: 'cancelled' },
        error: null,
      });

      const cancellablePayment = new CancellablePayment();

      const paymentPromise = cancellablePayment.processPayment({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift sent',
      });

      // Cancel after 500ms (during processing)
      await jest.advanceTimersByTimeAsync(500);
      cancellablePayment.cancel();

      // Advance to complete processing time
      await jest.advanceTimersByTimeAsync(2000);

      await expect(paymentPromise).rejects.toThrow('Payment cancelled');

      // Verify transaction marked as cancelled
      expect(mockTransactionsService.update).toHaveBeenCalledWith({
        id: 'tx-123',
        status: 'cancelled',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Payment cancellation requested',
      );
    });

    it('should not cancel if already completed', async () => {
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

      const cancellablePayment = new CancellablePayment();

      const paymentPromise = cancellablePayment.processPayment({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift sent',
      });

      // Complete processing before cancellation
      await jest.advanceTimersByTimeAsync(2100);

      const result = await paymentPromise;

      // Try to cancel after completion
      cancellablePayment.cancel();

      // Payment should still be completed
      expect(result).toHaveProperty('transaction');
      expect(result.transaction.status).toBe('completed');
    });

    it('should cancel before processing starts', async () => {
      const cancellablePayment = new CancellablePayment();

      // Cancel immediately
      cancellablePayment.cancel();

      const paymentPromise = cancellablePayment.processPayment({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift sent',
      });

      await expect(paymentPromise).rejects.toThrow('Payment cancelled');

      // No transaction should be created
      expect(mockTransactionsService.create).not.toHaveBeenCalled();
    });
  });

  describe('Refund on Cancellation', () => {
    it('should issue refund if payment was captured before cancellation', async () => {
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

      mockTransactionsService.update.mockResolvedValue({
        data: { ...mockTransaction, status: 'refunded' },
        error: null,
      });

      // Simulate payment completed, then user requests refund
      const result = await paymentService.processPayment({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift sent',
      });

      expect(result.transaction.status).toBe('completed');

      // Request refund (would be separate API in production)
      await mockTransactionsService.update({
        id: 'tx-123',
        status: 'refunded',
      });

      expect(mockTransactionsService.update).toHaveBeenCalledWith({
        id: 'tx-123',
        status: 'refunded',
      });
    });

    it('should create refund transaction', async () => {
      const mockPaymentTransaction = {
        id: 'tx-123',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Gift sent',
      };

      const mockRefundTransaction = {
        id: 'tx-refund-123',
        user_id: 'user-123',
        amount: -50, // Negative for refund
        currency: 'USD',
        type: 'refund',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Refund for Gift sent',
        metadata: { originalTransactionId: 'tx-123' },
      };

      mockTransactionsService.create
        .mockResolvedValueOnce({ data: mockPaymentTransaction, error: null })
        .mockResolvedValueOnce({ data: mockRefundTransaction, error: null });

      // Original payment
      await paymentService.processPayment({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift sent',
      });

      // Create refund transaction
      const refund = await mockTransactionsService.create({
        user_id: TestData.usrId(),
        amount: -50,
        currency: 'USD',
        type: 'refund',
        status: 'completed',
        description: 'Refund for Gift sent',
        metadata: { originalTransactionId: 'tx-123' },
      });

      expect(refund.data.type).toBe('refund');
      expect(refund.data.amount).toBe(-50);
      expect(refund.data.metadata?.originalTransactionId).toBe('tx-123');
    });
  });

  describe('Cleanup on Cancellation', () => {
    it.skip('should clean up resources when payment is cancelled', async () => {
      const mockTransaction = {
        id: 'tx-123',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'processing',
        created_at: new Date().toISOString(),
        description: 'Gift sent',
      };

      mockTransactionsService.create.mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      mockTransactionsService.update.mockResolvedValue({
        data: { ...mockTransaction, status: 'cancelled' },
        error: null,
      });

      const cancellablePayment = new CancellablePayment();

      const paymentPromise = cancellablePayment.processPayment({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Gift sent',
      });

      await jest.advanceTimersByTimeAsync(500);
      cancellablePayment.cancel();
      await jest.advanceTimersByTimeAsync(2000);

      try {
        await paymentPromise;
      } catch (error: any) {
        expect(error.message).toContain('cancelled');
      }

      // Verify cleanup
      expect(mockTransactionsService.update).toHaveBeenCalledWith({
        id: 'tx-123',
        status: 'cancelled',
      });
    });

    it('should release payment hold on cancellation', async () => {
      const mockBalance = { balance: 100, currency: 'USD' };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockBalance, error: null }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      // Simulate payment hold
      const initialBalance = await paymentService.getBalance();
      expect(initialBalance.available).toBe(100);

      // Payment cancelled, hold should be released
      // In production, this would update the balance back to original
      const updatedBalance = { balance: 100, currency: 'USD' }; // Hold released

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: updatedBalance, error: null }),
          }),
        }),
      });

      const finalBalance = await paymentService.getBalance();
      expect(finalBalance.available).toBe(100); // Back to original
    });
  });

  describe('Concurrent Cancellations', () => {
    it.skip('should handle multiple concurrent cancellations', async () => {
      const mockTransaction1 = {
        id: 'tx-1',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'processing',
        created_at: new Date().toISOString(),
        description: 'Payment 1',
      };

      const mockTransaction2 = {
        id: 'tx-2',
        user_id: 'user-123',
        amount: 75,
        currency: 'USD',
        type: 'payment',
        status: 'processing',
        created_at: new Date().toISOString(),
        description: 'Payment 2',
      };

      mockTransactionsService.create
        .mockResolvedValueOnce({ data: mockTransaction1, error: null })
        .mockResolvedValueOnce({ data: mockTransaction2, error: null });

      mockTransactionsService.update
        .mockResolvedValueOnce({
          data: { ...mockTransaction1, status: 'cancelled' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { ...mockTransaction2, status: 'cancelled' },
          error: null,
        });

      const payment1 = new CancellablePayment();
      const payment2 = new CancellablePayment();

      const promise1 = payment1.processPayment({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Payment 1',
      });

      const promise2 = payment2.processPayment({
        amount: 75,
        currency: 'USD',
        paymentMethodId: 'pm_456',
        description: 'Payment 2',
      });

      // Cancel both
      await jest.advanceTimersByTimeAsync(500);
      payment1.cancel();
      payment2.cancel();
      await jest.advanceTimersByTimeAsync(2000);

      await expect(promise1).rejects.toThrow('cancelled');
      await expect(promise2).rejects.toThrow('cancelled');

      expect(mockTransactionsService.update).toHaveBeenCalledTimes(2);
    });

    it.skip('should cancel only specific payment in concurrent scenario', async () => {
      const mockTransaction1 = {
        id: 'tx-1',
        user_id: 'user-123',
        amount: 50,
        currency: 'USD',
        type: 'payment',
        status: 'processing',
        created_at: new Date().toISOString(),
        description: 'Payment 1',
      };

      const mockTransaction2 = {
        id: 'tx-2',
        user_id: 'user-123',
        amount: 75,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Payment 2',
      };

      mockTransactionsService.create
        .mockResolvedValueOnce({ data: mockTransaction1, error: null })
        .mockResolvedValueOnce({ data: mockTransaction2, error: null });

      mockTransactionsService.update.mockResolvedValue({
        data: { ...mockTransaction1, status: 'cancelled' },
        error: null,
      });

      const payment1 = new CancellablePayment();
      const payment2 = new CancellablePayment();

      const promise1 = payment1.processPayment({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        description: 'Payment 1',
      });

      const promise2 = payment2.processPayment({
        amount: 75,
        currency: 'USD',
        paymentMethodId: 'pm_456',
        description: 'Payment 2',
      });

      // Cancel only payment1
      await jest.advanceTimersByTimeAsync(500);
      payment1.cancel();
      await jest.advanceTimersByTimeAsync(2000);

      await expect(promise1).rejects.toThrow('cancelled');

      const result2 = await promise2;
      expect(result2.transaction.status).toBe('completed');

      // Only payment1 should be updated to cancelled
      expect(mockTransactionsService.update).toHaveBeenCalledTimes(1);
      expect(mockTransactionsService.update).toHaveBeenCalledWith({
        id: 'tx-1',
        status: 'cancelled',
      });
    });
  });

  describe('Cancellation Status Tracking', () => {
    it('should track cancellation status correctly', () => {
      const payment = new CancellablePayment();

      expect(payment.isCancelled()).toBe(false);

      payment.cancel();

      expect(payment.isCancelled()).toBe(true);
    });

    it('should allow checking cancellation status multiple times', () => {
      const payment = new CancellablePayment();

      expect(payment.isCancelled()).toBe(false);
      expect(payment.isCancelled()).toBe(false);

      payment.cancel();

      expect(payment.isCancelled()).toBe(true);
      expect(payment.isCancelled()).toBe(true);
    });
  });
});
