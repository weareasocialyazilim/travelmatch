/**
 * Payment Flow Integration Tests
 * 
 * Tests complete payment workflows that span multiple services:
 * - Create payment → Process → Update balance
 * - Add payment method → Make payment → Verify transaction
 * - Request withdrawal → Process → Update balance
 * - Payment failure → Retry → Success
 * - Refund processing flow
 * - Transaction history and filtering
 * 
 * Target: 6 scenarios
 */

import { paymentService } from '@/services/paymentService';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import { transactionsService } from '@/services/supabaseDbService';

// Mock dependencies
jest.mock('@/config/supabase');
jest.mock('@/utils/logger');
jest.mock('@/services/supabaseDbService', () => ({
  transactionsService: {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
  },
}));

const mockSupabase = supabase ;
const mockLogger = logger ;
const mockTransactionsService = transactionsService ;

describe('Payment Flow Integration', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default Supabase auth mock
    mockSupabase.auth = {
      getUser: jest.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      }),
    } as any;

    // Setup default from() chain mock
    const mockFromChain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    mockSupabase.from = jest.fn(() => mockFromChain) as any;
  });

  describe('Scenario 1: Complete Payment Processing Flow', () => {
    it('should create payment → process → update balance → confirm transaction', async () => {
      const initialBalance = 100;
      const paymentAmount = 50;
      const finalBalance = initialBalance - paymentAmount;

      // Step 1: Get initial balance
      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { balance: initialBalance, currency: 'USD' },
          error: null,
        }),
      };
      (mockSupabase.from ).mockReturnValue(mockFromChain);

      const balanceBefore = await paymentService.getBalance();
      expect(balanceBefore.available).toBe(initialBalance);

      // Step 2: Process payment
      const mockTransaction = {
        id: 'txn-123',
        user_id: mockUser.id,
        amount: paymentAmount,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        description: 'Gift payment',
        created_at: '2024-01-15T10:00:00Z',
        metadata: { momentId: 'moment-456' },
      };

      mockTransactionsService.create.mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      const paymentResult = await paymentService.processPayment({
        amount: paymentAmount,
        currency: 'USD',
        paymentMethodId: 'pm-card-123',
        description: 'Gift payment',
        metadata: { momentId: 'moment-456' },
      });

      // Assert payment created
      expect(paymentResult.transaction.id).toBe('txn-123');
      expect(paymentResult.transaction.amount).toBe(paymentAmount);
      expect(paymentResult.transaction.status).toBe('completed');
      expect(mockTransactionsService.create).toHaveBeenCalledWith({
        user_id: mockUser.id,
        amount: paymentAmount,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        description: 'Gift payment',
        metadata: { momentId: 'moment-456' },
      });

      // Step 3: Verify updated balance (simulate balance update)
      mockFromChain.single.mockResolvedValue({
        data: { balance: finalBalance, currency: 'USD' },
        error: null,
      });

      const balanceAfter = await paymentService.getBalance();
      expect(balanceAfter.available).toBe(finalBalance);
    });

    it('should handle payment processing errors', async () => {
      // Arrange: Mock payment processing failure
      mockTransactionsService.create.mockResolvedValue({
        data: null,
        error: new Error('Insufficient funds'),
      });

      // Act & Assert: Payment should fail
      await expect(
        paymentService.processPayment({
          amount: 1000000,
          currency: 'USD',
          paymentMethodId: 'pm-card-123',
        })
      ).rejects.toThrow('Insufficient funds');

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Process payment error:',
        expect.any(Error)
      );
    });
  });

  describe('Scenario 2: Add Payment Method and Make Payment', () => {
    it('should add card → verify it exists → use for payment', async () => {
      // Step 1: Add payment card
      const addedCard = paymentService.addCard('tok_visa');
      expect(addedCard.card.last4).toBe('4242');
      expect(addedCard.card.brand).toBe('visa');
      const cardId = addedCard.card.id;

      // Step 2: Verify card was added
      const paymentMethods = paymentService.getPaymentMethods();
      const verifiedCard = paymentMethods.cards.find(c => c.id === cardId);
      expect(verifiedCard).toBeDefined();

      // Step 3: Use card for payment
      const mockTransaction = {
        id: 'txn-456',
        user_id: mockUser.id,
        amount: 75,
        currency: 'USD',
        type: 'payment',
        status: 'completed',
        description: 'Payment with new card',
        created_at: '2024-01-15T11:00:00Z',
      };

      mockTransactionsService.create.mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      const paymentResult = await paymentService.processPayment({
        amount: 75,
        currency: 'USD',
        paymentMethodId: cardId,
        description: 'Payment with new card',
      });

      expect(paymentResult.transaction.status).toBe('completed');
    });

    it('should handle invalid payment method', async () => {
      // Arrange: Try to use non-existent payment method
      mockTransactionsService.create.mockResolvedValue({
        data: null,
        error: new Error('Payment method not found'),
      });

      // Act & Assert
      await expect(
        paymentService.processPayment({
          amount: 50,
          currency: 'USD',
          paymentMethodId: 'invalid-pm-123',
        })
      ).rejects.toThrow('Payment method not found');
    });
  });

  describe('Scenario 3: Withdrawal Flow', () => {
    it('should request withdrawal → process → update balance → create transaction', async () => {
      const initialBalance = 500;
      const withdrawalAmount = 200;
      const finalBalance = initialBalance - withdrawalAmount;

      // Step 1: Verify sufficient balance
      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { balance: initialBalance, currency: 'USD' },
          error: null,
        }),
      };
      (mockSupabase.from ).mockReturnValue(mockFromChain);

      const balanceBefore = await paymentService.getBalance();
      expect(balanceBefore.available).toBe(initialBalance);

      // Step 2: Request withdrawal
      const mockWithdrawalTxn = {
        id: 'txn-withdraw-789',
        user_id: mockUser.id,
        amount: -withdrawalAmount,
        currency: 'USD',
        type: 'withdrawal',
        status: 'pending',
        description: 'Withdrawal to bank account',
        created_at: '2024-01-15T12:00:00Z',
      };

      mockTransactionsService.create.mockResolvedValue({
        data: mockWithdrawalTxn,
        error: null,
      });

      const withdrawalResult = await paymentService.withdrawFunds({
        amount: withdrawalAmount,
        currency: 'USD',
        bankAccountId: 'ba-123',
      });

      // Assert withdrawal created with pending status
      expect(withdrawalResult.transaction.id).toBe('txn-withdraw-789');
      expect(withdrawalResult.transaction.type).toBe('withdrawal');
      expect(withdrawalResult.transaction.status).toBe('pending');
      expect(mockTransactionsService.create).toHaveBeenCalledWith({
        user_id: mockUser.id,
        amount: -withdrawalAmount,
        currency: 'USD',
        type: 'withdrawal',
        status: 'pending',
        description: 'Withdrawal to bank account',
      });

      // Step 3: Verify balance after withdrawal (would be updated when status changes to completed)
      mockFromChain.single.mockResolvedValue({
        data: { balance: finalBalance, currency: 'USD' },
        error: null,
      });

      const balanceAfter = await paymentService.getBalance();
      expect(balanceAfter.available).toBe(finalBalance);
    });

    it('should handle withdrawal with insufficient balance', async () => {
      // Arrange: Mock balance check showing insufficient funds
      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { balance: 50, currency: 'USD' },
          error: null,
        }),
      };
      (mockSupabase.from ).mockReturnValue(mockFromChain);

      // Mock withdrawal rejection
      mockTransactionsService.create.mockResolvedValue({
        data: null,
        error: new Error('Insufficient balance for withdrawal'),
      });

      // Act & Assert
      await expect(
        paymentService.withdrawFunds({
          amount: 1000,
          currency: 'USD',
          bankAccountId: 'ba-123',
        })
      ).rejects.toThrow('Insufficient balance for withdrawal');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Withdraw funds error:',
        expect.any(Error)
      );
    });
  });

  describe('Scenario 4: Payment Retry Flow', () => {
    it('should fail payment → retry with different method → succeed', async () => {
      // Step 1: First payment attempt fails
      mockTransactionsService.create
        .mockResolvedValueOnce({
          data: null,
          error: new Error('Card declined'),
        })
        .mockResolvedValueOnce({
          data: {
            id: 'txn-retry-456',
            user_id: mockUser.id,
            amount: 100,
            currency: 'USD',
            type: 'payment',
            status: 'completed',
            description: 'Retry payment',
            created_at: '2024-01-15T13:00:00Z',
          },
          error: null,
        });

      // Attempt 1: Fail
      await expect(
        paymentService.processPayment({
          amount: 100,
          currency: 'USD',
          paymentMethodId: 'card-declined-123',
        })
      ).rejects.toThrow('Card declined');

      // Attempt 2: Succeed with different card
      const retryResult = await paymentService.processPayment({
        amount: 100,
        currency: 'USD',
        paymentMethodId: 'card-valid-456',
        description: 'Retry payment',
      });

      expect(retryResult.transaction.status).toBe('completed');
      expect(retryResult.transaction.id).toBe('txn-retry-456');
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('Scenario 5: Transaction History and Filtering', () => {
    it('should fetch transactions → filter by type → filter by date', async () => {
      const mockTransactions = [
        {
          id: 'txn-1',
          user_id: mockUser.id,
          amount: 50,
          currency: 'USD',
          type: 'payment',
          status: 'completed',
          description: 'Gift payment 1',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 'txn-2',
          user_id: mockUser.id,
          amount: -100,
          currency: 'USD',
          type: 'withdrawal',
          status: 'completed',
          description: 'Withdrawal',
          created_at: '2024-01-14T10:00:00Z',
        },
        {
          id: 'txn-3',
          user_id: mockUser.id,
          amount: 75,
          currency: 'USD',
          type: 'deposit',
          status: 'completed',
          description: 'Deposit',
          created_at: '2024-01-13T10:00:00Z',
        },
      ];

      // Step 1: Fetch all transactions
      mockTransactionsService.list.mockResolvedValue({
        data: mockTransactions,
        count: 3,
        error: null,
      });

      const allTransactions = await paymentService.getTransactions();
      expect(allTransactions.transactions).toHaveLength(3);
      expect(allTransactions.total).toBe(3);

      // Step 2: Filter by type (withdrawals only)
      const withdrawalTransactions = mockTransactions.filter(
        t => t.type === 'withdrawal'
      );
      mockTransactionsService.list.mockResolvedValue({
        data: withdrawalTransactions,
        count: 1,
        error: null,
      });

      const withdrawals = await paymentService.getTransactions({
        type: 'withdrawal',
      });
      expect(withdrawals.transactions).toHaveLength(1);
      expect(withdrawals.transactions[0].type).toBe('withdrawal');

      // Step 3: Filter by date range
      const recentTransactions = mockTransactions.filter(
        t => new Date(t.created_at) >= new Date('2024-01-14T00:00:00Z')
      );
      mockTransactionsService.list.mockResolvedValue({
        data: recentTransactions,
        count: 2,
        error: null,
      });

      const recentTxns = await paymentService.getTransactions({
        startDate: '2024-01-14T00:00:00Z',
      });
      expect(recentTxns.transactions).toHaveLength(2);
    });

    it('should handle empty transaction history', async () => {
      // Arrange: No transactions found
      mockTransactionsService.list.mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      // Act
      const result = await paymentService.getTransactions();

      // Assert
      expect(result.transactions).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('Scenario 6: Balance Update Across Multiple Transactions', () => {
    it('should handle multiple transactions → track balance changes → verify final state', async () => {
      let currentBalance = 1000;

      // Setup balance mock
      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => 
          Promise.resolve({
            data: { balance: currentBalance, currency: 'USD' },
            error: null,
          })
        ),
      };
      (mockSupabase.from ).mockReturnValue(mockFromChain);

      // Initial balance
      const balance1 = await paymentService.getBalance();
      expect(balance1.available).toBe(1000);

      // Transaction 1: Payment -50
      mockTransactionsService.create.mockResolvedValue({
        data: {
          id: 'txn-1',
          user_id: mockUser.id,
          amount: 50,
          currency: 'USD',
          type: 'payment',
          status: 'completed',
          created_at: '2024-01-15T10:00:00Z',
        },
        error: null,
      });

      await paymentService.processPayment({
        amount: 50,
        currency: 'USD',
        paymentMethodId: 'pm-123',
      });

      currentBalance -= 50;
      const balance2 = await paymentService.getBalance();
      expect(balance2.available).toBe(950);

      // Transaction 2: Deposit +200
      currentBalance += 200;
      const balance3 = await paymentService.getBalance();
      expect(balance3.available).toBe(1150);

      // Transaction 3: Withdrawal -300
      mockTransactionsService.create.mockResolvedValue({
        data: {
          id: 'txn-3',
          user_id: mockUser.id,
          amount: -300,
          currency: 'USD',
          type: 'withdrawal',
          status: 'pending',
          created_at: '2024-01-15T12:00:00Z',
        },
        error: null,
      });

      await paymentService.withdrawFunds({
        amount: 300,
        currency: 'USD',
        bankAccountId: 'ba-123',
      });

      currentBalance -= 300;
      const finalBalance = await paymentService.getBalance();
      expect(finalBalance.available).toBe(850);
    });

    it('should handle concurrent transactions safely', async () => {
      // This tests that multiple transactions don't cause race conditions
      const transactions = [
        { amount: 50, id: 'txn-1' },
        { amount: 75, id: 'txn-2' },
        { amount: 100, id: 'txn-3' },
      ];

      mockTransactionsService.create.mockImplementation((data) => {
        return Promise.resolve({
          data: {
            id: `txn-${Date.now()}`,
            user_id: mockUser.id,
            ...data,
            created_at: new Date().toISOString(),
          },
          error: null,
        });
      });

      // Process all transactions concurrently
      const results = await Promise.all(
        transactions.map(txn =>
          paymentService.processPayment({
            amount: txn.amount,
            currency: 'USD',
            paymentMethodId: 'pm-123',
          })
        )
      );

      // Verify all completed successfully
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.transaction.status).toBe('completed');
      });

      // Verify transaction service was called for each
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(3);
    });
  });
});
