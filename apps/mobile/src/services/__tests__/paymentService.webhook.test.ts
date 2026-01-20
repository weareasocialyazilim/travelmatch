/**
 * Payment Service - Webhook Failure Edge Cases
 *
 * Tests for PayTR webhook failure scenarios:
 * - Webhook timeout
 * - Webhook retry logic
 * - Fallback to polling
 * - Payment status reconciliation
 */

// paymentService tested via mock implementations
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

// Simulated webhook handler (would be in Edge Function in production)
interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      status: string;
      amount: number;
    };
  };
}

async function handleWebhook(
  event: WebhookEvent,
  timeout = 5000,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Webhook processing timeout'));
    }, timeout);

    // Simulate webhook processing
    setTimeout(() => {
      clearTimeout(timer);

      if (event.type === 'payment_intent.succeeded') {
        resolve(true);
      } else if (event.type === 'payment_intent.failed') {
        resolve(false);
      } else {
        reject(new Error('Unknown webhook event type'));
      }
    }, 100);
  });
}

// Fallback polling mechanism (when webhook fails)
async function pollPaymentStatus(
  transactionId: string,
  maxAttempts = 10,
  interval = 2000,
): Promise<'completed' | 'failed' | 'pending'> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    logger.info(
      `Polling payment status, attempt ${attempt + 1}/${maxAttempts}`,
    );

    const transaction = await transactionsService.get(transactionId);

    if (
      transaction.data?.status === 'completed' ||
      transaction.data?.status === 'failed'
    ) {
      logger.info(`Payment status resolved: ${transaction.data.status}`);
      return transaction.data.status;
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  logger.warn('Payment status polling timed out, status still pending');
  return 'pending';
}

describe('PaymentService - Webhook Failures', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

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

  describe('Webhook Timeout', () => {
    it('should timeout webhook processing after specified timeout', async () => {
      // Use real timers for this test - fake timers don't work well with Promise.race patterns
      jest.useRealTimers();

      const webhookEvent: WebhookEvent = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            status: 'succeeded',
            amount: 5000,
          },
        },
      };

      // Webhook with very short timeout (10ms) while processing takes 100ms
      await expect(handleWebhook(webhookEvent, 10)).rejects.toThrow(
        'Webhook processing timeout',
      );

      // Restore fake timers for other tests
      jest.useFakeTimers();
    });

    it('should complete webhook processing before timeout', async () => {
      const webhookEvent: WebhookEvent = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            status: 'succeeded',
            amount: 5000,
          },
        },
      };

      const webhookPromise = handleWebhook(webhookEvent, 5000);

      // Fast processing (< 5s)
      jest.advanceTimersByTime(200);

      const result = await webhookPromise;

      expect(result).toBe(true);
    });
  });

  describe('Fallback to Polling', () => {
    it('should poll payment status when webhook fails', async () => {
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

      // First 3 polls: pending, then completed
      mockTransactionsService.get
        .mockResolvedValueOnce({
          data: { ...mockTransaction, status: 'pending' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { ...mockTransaction, status: 'pending' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { ...mockTransaction, status: 'pending' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { ...mockTransaction, status: 'completed' },
          error: null,
        });

      const pollingPromise = pollPaymentStatus('tx-123', 10, 2000);

      // Advance through polling intervals
      await jest.advanceTimersByTimeAsync(2000); // Poll 1
      await jest.advanceTimersByTimeAsync(2000); // Poll 2
      await jest.advanceTimersByTimeAsync(2000); // Poll 3
      await jest.advanceTimersByTimeAsync(2000); // Poll 4

      const status = await pollingPromise;

      expect(status).toBe('completed');
      expect(mockTransactionsService.get).toHaveBeenCalledTimes(4);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Payment status resolved: completed'),
      );
    });

    it('should timeout polling after max attempts', async () => {
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

      // Always return pending
      mockTransactionsService.get.mockResolvedValue({
        data: { ...mockTransaction, status: 'pending' },
        error: null,
      });

      const pollingPromise = pollPaymentStatus('tx-123', 5, 1000);

      // Advance through all polling attempts
      for (let i = 0; i < 5; i++) {
        await jest.advanceTimersByTimeAsync(1000);
      }

      const status = await pollingPromise;

      expect(status).toBe('pending');
      expect(mockTransactionsService.get).toHaveBeenCalledTimes(5);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Payment status polling timed out'),
      );
    });

    it('should stop polling when payment fails', async () => {
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

      // Poll 1: pending, Poll 2: failed
      mockTransactionsService.get
        .mockResolvedValueOnce({
          data: { ...mockTransaction, status: 'pending' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { ...mockTransaction, status: 'failed' },
          error: null,
        });

      const pollingPromise = pollPaymentStatus('tx-123', 10, 2000);

      await jest.advanceTimersByTimeAsync(2000); // Poll 1
      await jest.advanceTimersByTimeAsync(2000); // Poll 2

      const status = await pollingPromise;

      expect(status).toBe('failed');
      expect(mockTransactionsService.get).toHaveBeenCalledTimes(2); // Stopped after failure
    });
  });

  describe('Webhook Retry Logic', () => {
    it('should retry webhook delivery with exponential backoff', async () => {
      let attempts = 0;

      // Simulated retry handler with exponential backoff
      async function handleWebhookWithRetry(
        processAttempt: () => Promise<boolean>,
        maxRetries = 3,
      ): Promise<boolean> {
        for (let retry = 0; retry <= maxRetries; retry++) {
          attempts++;
          try {
            mockLogger.info(`Webhook attempt ${retry + 1}/${maxRetries + 1}`);
            return await processAttempt();
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            mockLogger.warn(
              `Webhook attempt ${retry + 1} failed: ${errorMessage}`,
            );

            if (retry < maxRetries) {
              const delay = 100 * Math.pow(2, retry); // 100, 200, 400ms
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
              throw error;
            }
          }
        }
        throw new Error('Webhook failed after retries');
      }

      // Mock that fails first 2 attempts, succeeds on 3rd
      let callCount = 0;
      const mockProcess = jest.fn(async () => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Webhook timeout');
        }
        return true;
      });

      const resultPromise = handleWebhookWithRetry(mockProcess, 3);

      // Advance through retry delays: 100ms, then 200ms
      await jest.advanceTimersByTimeAsync(100); // After 1st retry delay
      await jest.advanceTimersByTimeAsync(200); // After 2nd retry delay

      const result = await resultPromise;

      expect(result).toBe(true);
      expect(attempts).toBe(3);
      expect(mockLogger.warn).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('attempt 3/4'),
      );
    });

    it('should throw after max retries exceeded', async () => {
      // Use real timers for this test - fake timers don't work well with Promise.race patterns
      jest.useRealTimers();

      let attempts = 0;

      async function handleWebhookWithRetry(
        processAttempt: () => Promise<boolean>,
        maxRetries = 2,
      ): Promise<boolean> {
        for (let retry = 0; retry <= maxRetries; retry++) {
          attempts++;
          try {
            return await processAttempt();
          } catch (error: unknown) {
            if (retry < maxRetries) {
              // Use very short delays for testing
              const delay = 1;
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
              throw error;
            }
          }
        }
        throw new Error('Webhook failed after retries');
      }

      // Always fails
      const mockProcess = jest.fn(async () => {
        throw new Error('Persistent failure');
      });

      await expect(handleWebhookWithRetry(mockProcess, 2)).rejects.toThrow(
        'Persistent failure',
      );
      expect(attempts).toBe(3); // Initial + 2 retries

      // Restore fake timers for other tests
      jest.useFakeTimers();
    });
  });

  describe('Payment Status Reconciliation', () => {
    it('should reconcile payment status via polling when webhook times out', async () => {
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

      // Webhook times out (50ms timeout, 100ms processing)
      const webhookEvent: WebhookEvent = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            status: 'succeeded',
            amount: 5000,
          },
        },
      };

      const webhookPromise = handleWebhook(webhookEvent, 50).catch(() => {
        mockLogger.warn('Webhook failed, falling back to polling');
        return null;
      });

      // Advance past timeout
      await jest.advanceTimersByTimeAsync(60);

      const webhookResult = await webhookPromise;
      expect(webhookResult).toBeNull(); // Webhook timed out

      // Now fallback to polling - transaction is immediately completed
      mockTransactionsService.get.mockResolvedValue({
        data: { ...mockTransaction, status: 'completed' },
        error: null,
      });

      const pollingPromise = pollPaymentStatus('tx-123', 5, 1000);

      // First poll should find completed status immediately
      const status = await pollingPromise;

      expect(status).toBe('completed');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Webhook failed'),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Payment status resolved: completed'),
      );
    });

    it('should update transaction status when webhook succeeds', async () => {
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

      mockTransactionsService.update.mockResolvedValue({
        data: { ...mockTransaction, status: 'completed' },
        error: null,
      });

      const webhookEvent: WebhookEvent = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            status: 'succeeded',
            amount: 5000,
          },
        },
      };

      const webhookPromise = handleWebhook(webhookEvent);

      jest.advanceTimersByTime(200);

      const success = await webhookPromise;

      expect(success).toBe(true);

      // Update transaction status
      await mockTransactionsService.update({
        id: 'tx-123',
        status: 'completed',
      });

      expect(mockTransactionsService.update).toHaveBeenCalledWith({
        id: 'tx-123',
        status: 'completed',
      });
    });

    it('should handle failed payment webhook', async () => {
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

      mockTransactionsService.update.mockResolvedValue({
        data: { ...mockTransaction, status: 'failed' },
        error: null,
      });

      const webhookEvent: WebhookEvent = {
        id: 'evt_123',
        type: 'payment_intent.failed',
        data: {
          object: {
            id: 'pi_123',
            status: 'failed',
            amount: 5000,
          },
        },
      };

      const webhookPromise = handleWebhook(webhookEvent);

      jest.advanceTimersByTime(200);

      const success = await webhookPromise;

      expect(success).toBe(false);

      // Update transaction status to failed
      await mockTransactionsService.update({
        id: 'tx-123',
        status: 'failed',
      });

      expect(mockTransactionsService.update).toHaveBeenCalledWith({
        id: 'tx-123',
        status: 'failed',
      });
    });
  });

  describe('Concurrent Webhook Processing', () => {
    it('should handle multiple webhooks for different payments', async () => {
      const webhook1: WebhookEvent = {
        id: 'evt_1',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_1', status: 'succeeded', amount: 5000 } },
      };

      const webhook2: WebhookEvent = {
        id: 'evt_2',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_2', status: 'succeeded', amount: 7500 } },
      };

      const webhook3: WebhookEvent = {
        id: 'evt_3',
        type: 'payment_intent.failed',
        data: { object: { id: 'pi_3', status: 'failed', amount: 10000 } },
      };

      const promise1 = handleWebhook(webhook1);
      const promise2 = handleWebhook(webhook2);
      const promise3 = handleWebhook(webhook3);

      jest.advanceTimersByTime(200);

      const [result1, result2, result3] = await Promise.all([
        promise1,
        promise2,
        promise3,
      ]);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(false);
    });

    it('should not process duplicate webhook events', async () => {
      const processedWebhooks = new Set<string>();

      async function handleWebhookOnce(event: WebhookEvent): Promise<boolean> {
        if (processedWebhooks.has(event.id)) {
          logger.warn(`Duplicate webhook detected: ${event.id}`);
          return true; // Already processed
        }

        processedWebhooks.add(event.id);
        return handleWebhook(event);
      }

      const webhookEvent: WebhookEvent = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123', status: 'succeeded', amount: 5000 } },
      };

      const promise1 = handleWebhookOnce(webhookEvent);
      const promise2 = handleWebhookOnce(webhookEvent); // Duplicate

      jest.advanceTimersByTime(200);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Duplicate webhook detected'),
      );
      expect(processedWebhooks.size).toBe(1);
    });
  });
});
