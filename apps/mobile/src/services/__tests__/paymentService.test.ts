/**
 * Payment Service Tests
 * Tests for payment creation, refunds, transaction history, and balance operations
 * Target Coverage: 85%+
 */

import { paymentService } from '@/services/paymentService';
import { supabase } from '@/config/supabase';
import { transactionsService } from '@/services/supabaseDbService';
import { logger } from '@/utils/logger';

// Mock dependencies
jest.mock('@/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock('@/services/supabaseDbService', () => ({
  transactionsService: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('paymentService', () => {
  // Mock data
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockTransaction = {
    id: 'txn-123',
    user_id: 'user-123',
    amount: 25.0,
    currency: 'USD',
    type: 'payment' as const,
    status: 'completed' as const,
    description: 'Coffee moment',
    date: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    referenceId: 'moment-123', // Changed from momentId
    metadata: { momentId: 'moment-123' }, // Keep in metadata
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock authenticated user by default
    (supabase.auth.getUser ).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  // ========================================
  // BALANCE OPERATIONS TESTS
  // ========================================
  describe('getBalance', () => {
    it('should retrieve user balance successfully', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { balance: 150.5, currency: 'USD' },
        error: null,
      });

      (supabase.from ).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      const result = await paymentService.getBalance();

      expect(result.available).toBe(150.5);
      expect(result.pending).toBe(0);
      expect(result.currency).toBe('USD');
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('balance, currency');
      expect(mockEq).toHaveBeenCalledWith('id', mockUser.id);
    });

    it('should handle missing balance (default to 0)', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { balance: null, currency: 'USD' },
        error: null,
      });

      (supabase.from ).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      const result = await paymentService.getBalance();

      expect(result.available).toBe(0);
      expect(result.currency).toBe('USD');
    });

    it('should return default values on error', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      (supabase.from ).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      const result = await paymentService.getBalance();

      expect(result.available).toBe(0);
      expect(result.pending).toBe(0);
      expect(result.currency).toBe('USD');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle unauthenticated user', async () => {
      (supabase.auth.getUser ).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await paymentService.getBalance();

      expect(result.available).toBe(0);
      expect(result.pending).toBe(0);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should use USD as default currency if not set', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { balance: 100, currency: null },
        error: null,
      });

      (supabase.from ).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      const result = await paymentService.getBalance();

      expect(result.currency).toBe('USD');
    });
  });

  // ========================================
  // TRANSACTION HISTORY TESTS
  // ========================================
  describe('getTransactions', () => {
    it('should retrieve transaction history successfully', async () => {
      const mockTransactions = [mockTransaction];

      (transactionsService.list ).mockResolvedValue({
        data: mockTransactions,
        count: 1,
        error: null,
      });

      const result = await paymentService.getTransactions();

      expect(result.transactions).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.transactions[0].id).toBe('txn-123');
      expect(result.transactions[0].amount).toBe(25.0);
      expect(transactionsService.list).toHaveBeenCalledWith(mockUser.id, {
        type: undefined,
        status: undefined,
        limit: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should filter transactions by type', async () => {
      (transactionsService.list ).mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      await paymentService.getTransactions({ type: 'withdrawal' });

      expect(transactionsService.list).toHaveBeenCalledWith(mockUser.id, {
        type: 'withdrawal',
        status: undefined,
        limit: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should filter transactions by status', async () => {
      (transactionsService.list ).mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      await paymentService.getTransactions({ status: 'pending' });

      expect(transactionsService.list).toHaveBeenCalledWith(mockUser.id, {
        type: undefined,
        status: 'pending',
        limit: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should support pagination', async () => {
      (transactionsService.list ).mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      await paymentService.getTransactions({ page: 2, pageSize: 20 });

      expect(transactionsService.list).toHaveBeenCalledWith(mockUser.id, {
        type: undefined,
        status: undefined,
        limit: 20,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should filter transactions by date range', async () => {
      (transactionsService.list ).mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      await paymentService.getTransactions({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(transactionsService.list).toHaveBeenCalledWith(mockUser.id, {
        type: undefined,
        status: undefined,
        limit: undefined,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
    });

    it('should handle multiple filters simultaneously', async () => {
      (transactionsService.list ).mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      await paymentService.getTransactions({
        type: 'deposit',
        status: 'completed',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        pageSize: 50,
      });

      expect(transactionsService.list).toHaveBeenCalledWith(mockUser.id, {
        type: 'deposit',
        status: 'completed',
        limit: 50,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
    });

    it('should return empty array on error', async () => {
      (transactionsService.list ).mockResolvedValue({
        data: [],
        count: 0,
        error: { message: 'Database error' },
      });

      const result = await paymentService.getTransactions();

      expect(result.transactions).toEqual([]);
      expect(result.total).toBe(0);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle unauthenticated user', async () => {
      (supabase.auth.getUser ).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await paymentService.getTransactions();

      expect(result.transactions).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should map transaction types correctly', async () => {
      const mockTransactions = [
        { ...mockTransaction, type: 'payment' },
        { ...mockTransaction, id: 'txn-124', type: 'deposit' },
        { ...mockTransaction, id: 'txn-125', type: 'withdrawal' },
        { ...mockTransaction, id: 'txn-126', type: 'refund' },
      ];

      (transactionsService.list ).mockResolvedValue({
        data: mockTransactions,
        count: 4,
        error: null,
      });

      const result = await paymentService.getTransactions();

      expect(result.transactions).toHaveLength(4);
      expect(result.transactions[0].type).toBe('payment');
      expect(result.transactions[1].type).toBe('deposit');
      expect(result.transactions[2].type).toBe('withdrawal');
      expect(result.transactions[3].type).toBe('refund');
    });
  });

  describe('getTransaction', () => {
    it('should retrieve single transaction successfully', async () => {
      (transactionsService.get ).mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      const result = await paymentService.getTransaction('txn-123');

      expect(result.transaction.id).toBe('txn-123');
      expect(result.transaction.amount).toBe(25.0);
      expect(result.transaction.type).toBe('payment');
      expect(transactionsService.get).toHaveBeenCalledWith('txn-123');
    });

    it('should throw error when transaction not found', async () => {
      const error = new Error('Transaction not found');
      (transactionsService.get ).mockResolvedValue({
        data: null,
        error,
      });

      await expect(paymentService.getTransaction('invalid-id')).rejects.toThrow('Transaction not found');
      expect(logger.error).toHaveBeenCalledWith('Get transaction error:', error);
    });

    it('should map transaction metadata correctly', async () => {
      const txnWithMetadata = {
        ...mockTransaction,
        metadata: { momentId: 'moment-123', requestId: 'req-456' },
      };

      (transactionsService.get ).mockResolvedValue({
        data: txnWithMetadata,
        error: null,
      });

      const result = await paymentService.getTransaction('txn-123');

      expect(result.transaction.metadata).toEqual({
        momentId: 'moment-123',
        requestId: 'req-456',
      });
    });
  });

  // ========================================
  // PAYMENT PROCESSING TESTS
  // ========================================
  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      (transactionsService.create ).mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      const result = await paymentService.processPayment({
        amount: 25.0,
        currency: 'USD',
        paymentMethodId: 'card-123',
        description: 'Coffee moment',
        metadata: { momentId: 'moment-123' },
      });

      expect(result.transaction.id).toBe('txn-123');
      expect(result.transaction.amount).toBe(25.0);
      expect(result.transaction.status).toBe('completed');
      expect(transactionsService.create).toHaveBeenCalledWith({
        user_id: mockUser.id,
        amount: 25.0,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        description: 'Coffee moment',
        metadata: { momentId: 'moment-123' },
      });
    });

    it('should handle payment creation errors', async () => {
      const error = new Error('Insufficient funds');
      (transactionsService.create ).mockResolvedValue({
        data: null,
        error,
      });

      await expect(
        paymentService.processPayment({
          amount: 1000,
          currency: 'USD',
          paymentMethodId: 'card-123',
        })
      ).rejects.toThrow('Insufficient funds');
      expect(logger.error).toHaveBeenCalledWith('Process payment error:', error);
    });

    it('should require authentication', async () => {
      (supabase.auth.getUser ).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(
        paymentService.processPayment({
          amount: 25.0,
          currency: 'USD',
          paymentMethodId: 'card-123',
        })
      ).rejects.toThrow('Not authenticated');
    });

    it('should process payment without optional fields', async () => {
      (transactionsService.create ).mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      await paymentService.processPayment({
        amount: 50.0,
        currency: 'EUR',
        paymentMethodId: 'card-456',
      });

      expect(transactionsService.create).toHaveBeenCalledWith({
        user_id: mockUser.id,
        amount: 50.0,
        currency: 'EUR',
        type: 'payment',
        status: 'completed',
        description: undefined,
        metadata: undefined,
      });
    });

    it('should handle large payment amounts', async () => {
      const largeTransaction = { ...mockTransaction, amount: 9999.99 };
      (transactionsService.create ).mockResolvedValue({
        data: largeTransaction,
        error: null,
      });

      const result = await paymentService.processPayment({
        amount: 9999.99,
        currency: 'USD',
        paymentMethodId: 'card-123',
      });

      expect(result.transaction.amount).toBe(9999.99);
    });
  });

  // ========================================
  // WITHDRAWAL TESTS
  // ========================================
  describe('withdrawFunds', () => {
    it('should create withdrawal request successfully', async () => {
      const withdrawalTxn = {
        ...mockTransaction,
        id: 'txn-withdraw-123',
        type: 'withdrawal',
        status: 'pending',
        amount: 100.0,
      };

      (transactionsService.create ).mockResolvedValue({
        data: withdrawalTxn,
        error: null,
      });

      const result = await paymentService.withdrawFunds({
        amount: 100.0,
        currency: 'USD',
        bankAccountId: 'bank-123',
      });

      expect(result.transaction.type).toBe('withdrawal');
      expect(result.transaction.status).toBe('pending');
      expect(result.transaction.amount).toBe(100.0);
      expect(transactionsService.create).toHaveBeenCalledWith({
        user_id: mockUser.id,
        amount: -100.0, // Negative for withdrawal
        currency: 'USD',
        type: 'withdrawal',
        status: 'pending',
        description: 'Withdrawal to bank account',
      });
    });

    it('should handle withdrawal errors', async () => {
      const error = new Error('Insufficient balance');
      (transactionsService.create ).mockResolvedValue({
        data: null,
        error,
      });

      await expect(
        paymentService.withdrawFunds({
          amount: 1000,
          currency: 'USD',
          bankAccountId: 'bank-123',
        })
      ).rejects.toThrow('Insufficient balance');
      expect(logger.error).toHaveBeenCalledWith('Withdraw funds error:', error);
    });

    it('should require authentication for withdrawal', async () => {
      (supabase.auth.getUser ).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(
        paymentService.withdrawFunds({
          amount: 50,
          currency: 'USD',
          bankAccountId: 'bank-123',
        })
      ).rejects.toThrow('Not authenticated');
    });

    it('should create withdrawal with correct description', async () => {
      (transactionsService.create ).mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      await paymentService.withdrawFunds({
        amount: 200,
        currency: 'EUR',
        bankAccountId: 'bank-456',
      });

      expect(transactionsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Withdrawal to bank account',
        })
      );
    });
  });

  // ========================================
  // PAYMENT METHODS TESTS (DEV MODE)
  // ========================================
  // Note: Payment methods work the same in development and production
  // All functions are async and use Supabase edge functions for secure handling
  // Tests for these functions are in paymentService.complete.test.ts with proper async mocking

  // ========================================
  // PRODUCTION MODE TESTS
  // ========================================
  // Note: Payment methods work the same in development and production
  // They use Supabase edge functions for secure token handling
  // No __DEV__ guards needed as Supabase handles environment separation
});
