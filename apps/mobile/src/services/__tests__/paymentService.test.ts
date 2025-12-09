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
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
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

      (supabase.from as jest.Mock).mockReturnValue({
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

      (supabase.from as jest.Mock).mockReturnValue({
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

      (supabase.from as jest.Mock).mockReturnValue({
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
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
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

      (supabase.from as jest.Mock).mockReturnValue({
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

      (transactionsService.list as jest.Mock).mockResolvedValue({
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
      (transactionsService.list as jest.Mock).mockResolvedValue({
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
      (transactionsService.list as jest.Mock).mockResolvedValue({
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
      (transactionsService.list as jest.Mock).mockResolvedValue({
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
      (transactionsService.list as jest.Mock).mockResolvedValue({
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
      (transactionsService.list as jest.Mock).mockResolvedValue({
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
      (transactionsService.list as jest.Mock).mockResolvedValue({
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
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
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

      (transactionsService.list as jest.Mock).mockResolvedValue({
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
      (transactionsService.get as jest.Mock).mockResolvedValue({
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
      (transactionsService.get as jest.Mock).mockResolvedValue({
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

      (transactionsService.get as jest.Mock).mockResolvedValue({
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
      (transactionsService.create as jest.Mock).mockResolvedValue({
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
      (transactionsService.create as jest.Mock).mockResolvedValue({
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
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
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
      (transactionsService.create as jest.Mock).mockResolvedValue({
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
      (transactionsService.create as jest.Mock).mockResolvedValue({
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

      (transactionsService.create as jest.Mock).mockResolvedValue({
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
      (transactionsService.create as jest.Mock).mockResolvedValue({
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
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
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
      (transactionsService.create as jest.Mock).mockResolvedValue({
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
  describe('Payment Methods (Dev Mode)', () => {
    const originalDev = global.__DEV__;

    beforeAll(() => {
      global.__DEV__ = true;
    });

    afterAll(() => {
      global.__DEV__ = originalDev;
    });

    describe('getPaymentMethods', () => {
      it('should return mock payment methods in dev mode', () => {
        const result = paymentService.getPaymentMethods();

        expect(result).toHaveProperty('cards');
        expect(result).toHaveProperty('bankAccounts');
        expect(Array.isArray(result.cards)).toBe(true);
        expect(Array.isArray(result.bankAccounts)).toBe(true);
      });
    });

    describe('addCard', () => {
      it('should add a mock card in dev mode', () => {
        const result = paymentService.addCard('tok_visa');

        expect(result.card).toHaveProperty('id');
        expect(result.card).toHaveProperty('brand');
        expect(result.card).toHaveProperty('last4');
        expect(result.card.brand).toBe('visa');
        expect(result.card.last4).toBe('4242');
      });

      it('should set first card as default', () => {
        // Clear mock cards
        paymentService.getPaymentMethods().cards.length = 0;

        const result = paymentService.addCard('tok_visa');

        expect(result.card.isDefault).toBe(true);
      });
    });

    describe('removeCard', () => {
      it('should remove a card in dev mode', () => {
        const { card } = paymentService.addCard('tok_visa');
        const result = paymentService.removeCard(card.id);

        expect(result.success).toBe(true);
      });
    });

    describe('addBankAccount', () => {
      it('should add a mock bank account in dev mode', () => {
        const result = paymentService.addBankAccount({
          routingNumber: '110000000',
          accountNumber: '000123456789',
        });

        expect(result.bankAccount).toHaveProperty('id');
        expect(result.bankAccount).toHaveProperty('bankName');
        expect(result.bankAccount.accountType).toBe('checking');
        expect(result.bankAccount.isVerified).toBe(true);
      });
    });

    describe('removeBankAccount', () => {
      it('should remove a bank account in dev mode', () => {
        const { bankAccount } = paymentService.addBankAccount({});
        const result = paymentService.removeBankAccount(bankAccount.id);

        expect(result.success).toBe(true);
      });
    });
  });

  // ========================================
  // PRODUCTION MODE TESTS
  // ========================================
  describe('Payment Methods (Production Mode)', () => {
    const originalDev = global.__DEV__;

    beforeAll(() => {
      global.__DEV__ = false;
    });

    afterAll(() => {
      global.__DEV__ = originalDev;
    });

    it('should return empty arrays in production mode', () => {
      const result = paymentService.getPaymentMethods();

      expect(result.cards).toEqual([]);
      expect(result.bankAccounts).toEqual([]);
      expect(logger.warn).toHaveBeenCalledWith(
        'Using mock payment methods in production!'
      );
    });

    it('should throw error when adding card in production', () => {
      expect(() => paymentService.addCard('tok_visa')).toThrow(
        'Payment methods not configured for production'
      );
    });

    it('should throw error when removing card in production', () => {
      expect(() => paymentService.removeCard('card-123')).toThrow(
        'Payment methods not configured for production'
      );
    });

    it('should throw error when adding bank account in production', () => {
      expect(() => paymentService.addBankAccount({})).toThrow(
        'Payment methods not configured for production'
      );
    });

    it('should throw error when removing bank account in production', () => {
      expect(() => paymentService.removeBankAccount('bank-123')).toThrow(
        'Payment methods not configured for production'
      );
    });
  });
});
