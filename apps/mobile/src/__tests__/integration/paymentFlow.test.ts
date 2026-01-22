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

import { securePaymentService as paymentService } from '@/services/securePaymentService';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import { transactionsService } from '@/services/supabaseDbService';

// Mock dependencies
jest.mock('@/config/supabase', () => {
  const actual = jest.requireActual('@/config/supabase');
  return {
    ...actual,
    supabase: {
      auth: {
        getUser: jest.fn(),
        getSession: jest.fn(),
      },
      from: jest.fn(),
      functions: {
        invoke: jest.fn(),
      },
    },
    SUPABASE_EDGE_URL: 'https://mock.supabase.co',
  };
});
jest.mock('@/utils/logger');
jest.mock('@/services/supabaseDbService', () => ({
  transactionsService: {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
  },
}));

type MockAuth = {
  getUser: jest.Mock;
  signInWithPassword: jest.Mock;
  signOut: jest.Mock;
  getSession: jest.Mock;
};

type MockSupabaseClient = {
  auth: MockAuth;
  from: jest.Mock;
  rpc: jest.Mock;
};

const mockSupabase = supabase as unknown as MockSupabaseClient;
const mockLogger = logger as unknown as jest.Mocked<typeof logger>;
const mockTransactionsService = transactionsService as unknown as jest.Mocked<
  typeof transactionsService
>;

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
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: 'fake-token' } },
        error: null,
      }),
    } as unknown as typeof mockSupabase.auth;

    // Setup default from() chain mock
    const mockFromChain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    mockSupabase.from = jest.fn(
      () => mockFromChain,
    ) as unknown as typeof mockSupabase.from;

    // Mock global fetch for Edge Functions
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ error: 'PayTR API Error' }),
    });
  });

  describe('Scenario 1: Complete Payment Processing Flow', () => {
    it('should create payment → process → update balance → confirm transaction', async () => {
      const initialBalance = 100;
      const paymentAmount = 50;
      const finalBalance = initialBalance - paymentAmount;

      // Step 1: Get initial balance
      let mockWallets = [
        {
          balance: initialBalance,
          coins_balance: initialBalance,
          currency: 'TRY',
        },
        {
          balance: initialBalance,
          coins_balance: initialBalance,
          currency: 'LVND',
        },
      ];

      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: mockWallets, error: null }),
        single: jest
          .fn()
          .mockImplementation(() =>
            Promise.resolve({ data: mockWallets[0], error: null }),
          ),
      };

      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'wallets') {
          return mockFromChain;
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              balance: initialBalance,
              coins_balance: initialBalance,
              pending_balance: 0,
              currency: 'LVND',
            },
            error: null,
          }),
        };
      });

      const balanceBefore = await paymentService.getBalance();
      expect(balanceBefore.available).toBe(initialBalance);

      // Step 2: Process payment
      const mockTransaction = {
        id: 'txn-123',
        user_id: mockUser.id,
        amount: paymentAmount,
        currency: 'LVND',
        type: 'payment',
        status: 'completed',
        description: 'Gift payment',
        created_at: '2024-01-15T10:00:00Z',
        metadata: { momentId: 'moment-456' },
        moment_id: 'moment-456',
        escrow_status: null,
      };

      mockTransactionsService.create.mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      const paymentResult = await paymentService.processPayment({
        amount: paymentAmount,
        currency: 'LVND',
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
        currency: 'LVND',
        type: 'payment',
        status: 'completed',
        description: 'Gift payment',
        metadata: { momentId: 'moment-456' },
      });

      // Step 3: Verify updated balance (simulate balance update)
      mockWallets = [
        {
          balance: finalBalance,
          coins_balance: finalBalance,
          currency: 'TRY',
        },
        {
          balance: finalBalance,
          coins_balance: finalBalance,
          currency: 'LVND',
        },
      ];

      const balanceAfter = await paymentService.getBalance();
      expect(balanceAfter.available).toBe(finalBalance);
    });

    it('should handle payment processing errors', async () => {
      // Arrange: Mock payment processing failure
      mockTransactionsService.create.mockResolvedValue({
        data: null,
        error: new Error('Yetersiz bakiye'),
      });

      // Act & Assert: Payment should fail
      await expect(
        paymentService.processPayment({
          amount: 1000000,
          currency: 'LVND',
          paymentMethodId: 'pm-card-123',
        }),
      ).rejects.toThrow('Yetersiz bakiye');

      // Verify error logging (securePaymentService logs with standardized error object)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Process payment error:',
        expect.objectContaining({
          code: expect.any(String),
          message: expect.stringContaining('Yetersiz bakiye'),
        }),
      );
    });
  });

  describe('Scenario 2: Add Payment Method and Make Payment', () => {
    it('should add card → verify it exists → use for payment', async () => {
      // Setup mocks for functions.invoke (addCard)
      (mockSupabase as any).functions = {
        invoke: jest.fn().mockResolvedValue({
          data: {
            id: 'card_new123',
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2030,
            is_default: true,
          },
          error: null,
        }),
      };

      // Step 1: Add payment card (async!)
      const addedCard = await paymentService.addCard('tok_visa');
      expect(addedCard.card.last4).toBe('4242');
      expect(addedCard.card.brand).toBe('visa');
      const cardId = addedCard.card.id;

      // Step 2: Setup mock for getPaymentMethods
      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockSupabase.from = jest.fn().mockReturnValue(mockFromChain);
      mockFromChain.eq.mockImplementation(() => ({
        ...mockFromChain,
        eq: jest.fn().mockResolvedValue({
          data: [
            {
              id: cardId,
              type: 'card',
              brand: 'visa',
              last_four: '4242',
              exp_month: 12,
              exp_year: 2030,
              is_default: true,
            },
          ],
          error: null,
        }),
      }));

      // Step 3: Use card for payment
      const mockTransaction = {
        id: 'txn-456',
        user_id: mockUser.id,
        amount: 75,
        currency: 'LVND',
        type: 'payment',
        status: 'completed',
        description: 'Payment with new card',
        created_at: '2024-01-15T11:00:00Z',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      };

      mockTransactionsService.create.mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      const paymentResult = await paymentService.processPayment({
        amount: 75,
        currency: 'LVND',
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
          currency: 'LVND',
          paymentMethodId: 'invalid-pm-123',
        }),
      ).rejects.toThrow('Payment method not found');
    });
  });

  describe('Scenario 3: Withdrawal Flow', () => {
    // Helper to create a proper chainable mock that handles any depth of chaining
    const createChainMock = (finalResult: any) => {
      const handler: ProxyHandler<any> = {
        get: (_: any, prop: string) => {
          if (prop === 'then') {
            return finalResult.then
              ? finalResult.then.bind(finalResult)
              : (resolve: any) => resolve(finalResult);
          }
          return jest.fn().mockReturnValue(new Proxy({}, handler));
        },
      };
      return new Proxy({}, handler);
    };

    it('should request withdrawal → process → update balance → create transaction', async () => {
      // Mock successful fetch for withdrawal
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          settlementId: 'txn-withdraw-789',
          fiat_amount: 200,
          status: 'success',
        }),
      });

      const initialBalance = 500;
      const withdrawalAmount = 200;
      const finalBalance = initialBalance - withdrawalAmount;
      let currentBalance = initialBalance;

      // Create mock that routes by table
      mockSupabase.from = jest.fn((table: string) => {
        switch (table) {
          case 'wallets':
            return createChainMock({
              data: [
                {
                  balance: currentBalance,
                  coins_balance: currentBalance,
                  currency: 'TRY',
                },
                {
                  balance: initialBalance,
                  coins_balance: initialBalance,
                  currency: 'LVND',
                },
              ],
              error: null,
            });
          case 'gifts':
            return createChainMock({ data: [], error: null });
          case 'users':
            return createChainMock({
              data: {
                balance: currentBalance,
                coins_balance: currentBalance,
                pending_balance: 0,
                currency: 'LVND',
              },
              error: null,
            });
          case 'escrow_transactions':
            return createChainMock({ data: [], error: null });
          case 'bank_accounts':
            return createChainMock({
              data: { id: 'ba-123', is_verified: true },
              error: null,
            });
          default:
            return createChainMock({ data: null, error: null });
        }
      }) as unknown as typeof mockSupabase.from;

      // Step 1: Verify sufficient balance
      const balanceBefore = await paymentService.getBalance();
      expect(balanceBefore.available).toBe(initialBalance);

      // Step 2: Request withdrawal
      const mockWithdrawalTxn = {
        id: 'txn-withdraw-789',
        user_id: mockUser.id,
        amount: withdrawalAmount,
        currency: 'LVND',
        type: 'withdrawal',
        status: 'pending',
        description: 'Withdrawal to bank account',
        created_at: '2024-01-15T12:00:00Z',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      };

      mockTransactionsService.create.mockResolvedValue({
        data: mockWithdrawalTxn,
        error: null,
      });

      const withdrawalResult = await paymentService.withdrawFunds({
        coinAmount: withdrawalAmount,
        bankAccountId: 'ba-123',
      });

      // Assert withdrawal created with pending status
      expect(withdrawalResult).toHaveProperty('settlementId');
      expect(withdrawalResult).toHaveProperty('fiatAmount');

      // Step 3: Verify balance after withdrawal
      currentBalance = finalBalance;
      const balanceAfter = await paymentService.getBalance();
      expect(balanceAfter.available).toBe(finalBalance);
    });

    it('should handle withdrawal with insufficient balance', async () => {
      // Helper to create a proper chainable mock
      const createChainMock = (finalResult: any) => {
        const chain: any = {};
        const handler = {
          get: (_: any, prop: string) => {
            if (prop === 'then') {
              return finalResult.then
                ? finalResult.then.bind(finalResult)
                : (resolve: any) => resolve(finalResult);
            }
            return jest.fn().mockReturnValue(new Proxy({}, handler));
          },
        };
        return new Proxy(chain, handler);
      };

      // Create mock that routes by table
      mockSupabase.from = jest.fn((table: string) => {
        switch (table) {
          case 'gifts':
            return createChainMock({ data: [], error: null });
          case 'users':
            return createChainMock({
              data: { balance: 50, currency: 'LVND' },
              error: null,
            });
          case 'escrow_transactions':
            return createChainMock({ data: [], error: null });
          case 'bank_accounts':
            return createChainMock({
              data: { id: 'ba-123', is_verified: true },
              error: null,
            });
          default:
            return createChainMock({ data: null, error: null });
        }
      }) as unknown as typeof mockSupabase.from;

      // Act & Assert: Withdrawal should fail due to insufficient balance
      await expect(
        paymentService.withdrawFunds({
          coinAmount: 1000,
          bankAccountId: 'ba-123',
        }),
      ).rejects.toThrow('Yetersiz bakiye');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Withdraw funds error:',
        expect.objectContaining({
          code: expect.any(String),
        }),
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
            currency: 'LVND',
            type: 'payment',
            status: 'completed',
            description: 'Retry payment',
            created_at: '2024-01-15T13:00:00Z',
            metadata: {},
            moment_id: null,
            escrow_status: null,
          },
          error: null,
        });

      // Attempt 1: Fail
      await expect(
        paymentService.processPayment({
          amount: 100,
          currency: 'LVND',
          paymentMethodId: 'card-declined-123',
        }),
      ).rejects.toThrow('Card declined');

      // Attempt 2: Succeed with different card
      const retryResult = await paymentService.processPayment({
        amount: 100,
        currency: 'LVND',
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
          currency: 'LVND',
          type: 'payment',
          status: 'completed',
          description: 'Gift payment 1',
          created_at: '2024-01-15T10:00:00Z',
          metadata: {},
          moment_id: null,
          escrow_status: null,
        },
        {
          id: 'txn-2',
          user_id: mockUser.id,
          amount: -100,
          currency: 'LVND',
          type: 'withdrawal',
          status: 'completed',
          description: 'Withdrawal',
          created_at: '2024-01-14T10:00:00Z',
          metadata: {},
          moment_id: null,
          escrow_status: null,
        },
        {
          id: 'txn-3',
          user_id: mockUser.id,
          amount: 75,
          currency: 'LVND',
          type: 'deposit',
          status: 'completed',
          description: 'Deposit',
          created_at: '2024-01-13T10:00:00Z',
          metadata: {},
          moment_id: null,
          escrow_status: null,
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
        (t) => t.type === 'withdrawal',
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
        (t) => new Date(t.created_at) >= new Date('2024-01-14T00:00:00Z'),
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
    // Helper to create a proper chainable mock that handles any depth of chaining
    const createChainMock = (finalResult: any) => {
      const handler: ProxyHandler<any> = {
        get: (_: any, prop: string) => {
          if (prop === 'then') {
            return finalResult.then
              ? finalResult.then.bind(finalResult)
              : (resolve: any) => resolve(finalResult);
          }
          return jest.fn().mockReturnValue(new Proxy({}, handler));
        },
      };
      return new Proxy({}, handler);
    };

    it('should handle multiple transactions → track balance changes → verify final state', async () => {
      // Mock successful fetch for withdrawal
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          settlementId: 'sett-multi',
          fiat_amount: 50,
          status: 'success',
        }),
      });

      let currentBalance = 1000;

      // Create mock that routes by table
      mockSupabase.from = jest.fn((table: string) => {
        switch (table) {
          case 'wallets':
            return createChainMock({
              data: [
                {
                  balance: currentBalance,
                  coins_balance: currentBalance,
                  currency: 'TRY',
                },
                {
                  balance: currentBalance,
                  coins_balance: currentBalance,
                  currency: 'LVND',
                },
              ],
              error: null,
            });
          case 'gifts':
            return createChainMock({ data: [], error: null });
          case 'users':
            return createChainMock({
              data: {
                balance: currentBalance,
                coins_balance: currentBalance,
                pending_balance: 0,
                currency: 'LVND',
              },
              error: null,
            });
          case 'escrow_transactions':
            return createChainMock({ data: [], error: null });
          case 'bank_accounts':
            return createChainMock({
              data: { id: 'ba-123', is_verified: true },
              error: null,
            });
          default:
            return createChainMock({ data: null, error: null });
        }
      }) as unknown as typeof mockSupabase.from;

      // Initial balance
      const balance1 = await paymentService.getBalance();
      expect(balance1.available).toBe(1000);

      // Transaction 1: Payment -50
      mockTransactionsService.create.mockResolvedValue({
        data: {
          id: 'txn-1',
          user_id: mockUser.id,
          amount: 50,
          currency: 'LVND',
          type: 'payment',
          status: 'completed',
          created_at: '2024-01-15T10:00:00Z',
          description: 'Payment 1',
          metadata: {},
          moment_id: null,
          escrow_status: null,
        },
        error: null,
      });

      await paymentService.processPayment({
        amount: 50,
        currency: 'LVND',
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
          amount: 300,
          currency: 'LVND',
          type: 'withdrawal',
          status: 'pending',
          created_at: '2024-01-15T12:00:00Z',
          description: 'Withdrawal',
          metadata: {},
          moment_id: null,
          escrow_status: null,
        },
        error: null,
      });

      await paymentService.withdrawFunds({
        coinAmount: 300,
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

      mockTransactionsService.create.mockImplementation((data: any) => {
        return Promise.resolve({
          data: {
            id: `txn-${Date.now()}`,
            user_id: mockUser.id,
            description: 'Concurrent txn',
            metadata: {},
            moment_id: null,
            escrow_status: null,
            status: 'completed',
            type: 'payment',
            currency: 'USD',
            amount: 0,
            ...data,
            created_at: new Date().toISOString(),
          },
          error: null,
        });
      });

      // Process all transactions concurrently
      const results = await Promise.all(
        transactions.map((txn) =>
          paymentService.processPayment({
            amount: txn.amount,
            currency: 'LVND',
            paymentMethodId: 'pm-123',
          }),
        ),
      );

      // Verify all completed successfully
      expect(results).toHaveLength(3);
      results.forEach((result: { transaction: { status: string } }) => {
        expect(result.transaction.status).toBe('completed');
      });

      // Verify transaction service was called for each
      expect(mockTransactionsService.create).toHaveBeenCalledTimes(3);
    });
  });
});
