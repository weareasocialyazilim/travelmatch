/**
 * Payment Service Complete Test Suite
 *
 * Comprehensive tests for payment operations, wallet, and transactions
 */

// Define __DEV__ for tests if not already defined
if (typeof (global as any).__DEV__ === 'undefined') {
  (global as any).__DEV__ = true;
}

import { securePaymentService as paymentService } from '../securePaymentService';
import { supabase } from '../../config/supabase';
import { transactionsService } from '../supabaseDbService';

// Mock dependencies
jest.mock('../../config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: 'fake-token' } },
        error: null,
      }),
    },
    from: jest.fn(),
  },
  SUPABASE_EDGE_URL: 'https://mock.supabase.co',
}));

jest.mock('../supabaseDbService', () => ({
  transactionsService: {
    create: jest.fn(),
    get: jest.fn(),
    list: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockSupabase = supabase as any;
const mockTransactionsService = transactionsService as any;

describe('PaymentService', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock global fetch for Edge Functions
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ error: 'PayTR API Error' }),
    });
  });

  describe('getBalance', () => {
    it('should fetch user wallet balance', async () => {
      const mockWalletBalance = {
        balance: 100.5,
        coins_balance: 100.5,
        pending_balance: 0,
        currency: 'LVND',
        status: 'active',
      };

      // Mock both wallets and escrow_transactions tables
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                balance: 100.5,
                coins_balance: 100.5,
                pending_balance: 0,
                currency: 'TRY',
              },
              error: null,
            }),
          };
        }
        if (tableName === 'wallets') {
          const mockWallets = [
            { ...mockWalletBalance, currency: 'LVND', balance: 100.5 },
            { ...mockWalletBalance, currency: 'TRY', balance: 100.5 },
          ];
          const queryChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest
              .fn()
              .mockResolvedValue({ data: mockWallets[0], error: null }),
            then: (resolve: any) => resolve({ data: mockWallets, error: null }),
          };
          return {
            select: jest.fn().mockReturnValue(queryChain),
            upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (tableName === 'escrow_transactions') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              balance: 100.5,
              coins_balance: 100.5,
              pending_balance: 0,
              currency: 'TRY',
            },
            error: null,
          }),
        };
      });

      const result = await paymentService.getBalance();

      expect(result).toEqual({
        available: 100.5,
        pending: 0,
        coins: 100.5,
        currency: 'TRY',
      });
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });

    it('should return zero balance when user not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            then: (resolve: any) => resolve({ data: [], error: null }),
            single: jest.fn().mockResolvedValue({
              data: {
                balance: 0,
                coins_balance: 0,
                pending_balance: 0,
                currency: 'TRY',
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await paymentService.getBalance();

      expect(result).toEqual({
        available: 0,
        pending: 0,
        coins: 0,
        currency: 'TRY',
      });
    });

    it('should return zero balance when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await paymentService.getBalance();

      expect(result).toEqual({
        available: 0,
        pending: 0,
        coins: 0,
        currency: 'LVND',
      });
    });
  });

  describe('getTransactions', () => {
    it('should fetch transaction history', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          user_id: 'user-123',
          amount: 50,
          currency: 'LVND',
          type: 'payment',
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
          description: 'Gift sent',
          moment_id: 'moment-1',
          metadata: {},
          escrow_status: null,
        },
      ];

      mockTransactionsService.list.mockResolvedValue({
        data: mockTransactions,
        count: 1,
        error: null,
      });

      const result = await paymentService.getTransactions();

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0]).toMatchObject({
        id: 'tx-1',
        amount: 50,
        status: 'completed',
      });
      expect(result.total).toBe(1);
    });

    it('should filter transactions by type', async () => {
      mockTransactionsService.list.mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      await paymentService.getTransactions({ type: 'withdrawal' });

      expect(mockTransactionsService.list).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          type: 'withdrawal',
        }),
      );
    });

    it('should filter transactions by status', async () => {
      mockTransactionsService.list.mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      await paymentService.getTransactions({ status: 'pending' });

      expect(mockTransactionsService.list).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          status: 'pending',
        }),
      );
    });

    it('should filter transactions by date range', async () => {
      mockTransactionsService.list.mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      await paymentService.getTransactions({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      expect(mockTransactionsService.list).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        }),
      );
    });

    it('should handle pagination', async () => {
      mockTransactionsService.list.mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      await paymentService.getTransactions({ page: 2, pageSize: 20 });

      expect(mockTransactionsService.list).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          limit: 20,
        }),
      );
    });

    it('should return empty array on error', async () => {
      mockTransactionsService.list.mockResolvedValue({
        data: null as any,
        count: 0,
        error: new Error('Database error'),
      });

      const result = await paymentService.getTransactions();

      expect(result.transactions).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getTransaction', () => {
    it('should fetch single transaction by ID', async () => {
      const mockTransaction = {
        id: 'tx-1',
        user_id: 'user-123',
        amount: 50,
        currency: 'LVND',
        type: 'payment',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
        description: 'Gift sent',
        moment_id: 'moment-1',
        metadata: {},
        escrow_status: 'locked' as const,
      };

      mockTransactionsService.get.mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      const result = await paymentService.getTransaction('tx-1');

      expect(result.transaction).toMatchObject({
        id: 'tx-1',
        amount: 50,
        status: 'completed',
      });
      expect(mockTransactionsService.get).toHaveBeenCalledWith('tx-1');
    });

    it('should throw error when transaction not found', async () => {
      mockTransactionsService.get.mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      await expect(
        paymentService.getTransaction('invalid-id'),
      ).rejects.toThrow();
    });
  });

  describe('getPaymentMethods', () => {
    it('should return saved cards and bank accounts', async () => {
      const result = await paymentService.getPaymentMethods();

      expect(result).toHaveProperty('cards');
      expect(result).toHaveProperty('bankAccounts');
      expect(Array.isArray(result.cards)).toBe(true);
      expect(Array.isArray(result.bankAccounts)).toBe(true);
    });
  });

  describe('addCard', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Setup proper mock for functions.invoke
      mockSupabase.functions = {
        invoke: jest.fn().mockResolvedValue({
          data: {
            id: 'card_test123',
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2030,
            is_default: true,
          },
          error: null,
        }),
      };
    });

    it('should add new payment card', async () => {
      const tokenId = 'tok_visa';

      const result = await paymentService.addCard(tokenId);

      expect(result.card).toHaveProperty('id');
      expect(result.card).toHaveProperty('brand');
      expect(result.card).toHaveProperty('last4');
      expect(result.card.isDefault).toBeDefined();
    });

    it('should set first card as default', async () => {
      const result = await paymentService.addCard('tok_visa');

      expect(result.card.isDefault).toBe(true);
    });
  });

  describe('removeCard', () => {
    beforeEach(() => {
      // Setup mock for from().update().eq().eq()
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });
    });

    it('should remove payment card', async () => {
      const cardId = 'card_123';

      const result = await paymentService.removeCard(cardId);

      expect(result.success).toBe(true);
    });
  });

  describe('addBankAccount', () => {
    beforeEach(() => {
      // Setup proper mock for functions.invoke
      mockSupabase.functions = {
        invoke: jest.fn().mockResolvedValue({
          data: {
            id: 'ba_test123',
            bank_name: 'Test Bank',
            account_type: 'checking',
            last_four: '6789',
            is_default: false,
            is_verified: true,
          },
          error: null,
        }),
      };
    });

    it('should add bank account', async () => {
      const accountData = {
        routingNumber: '110000000',
        accountNumber: '000123456789',
        accountType: 'checking' as const,
      };

      const result = await paymentService.addBankAccount(accountData);

      expect(result.bankAccount).toHaveProperty('id');
      expect(result.bankAccount).toHaveProperty('bankName');
      expect(result.bankAccount.accountType).toBe('checking');
    });
  });

  describe('removeBankAccount', () => {
    beforeEach(() => {
      // Setup mock for from().update().eq().eq()
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });
    });

    it('should remove bank account', async () => {
      const accountId = 'ba_123';

      const result = await paymentService.removeBankAccount(accountId);

      expect(result.success).toBe(true);
    });
  });

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      const mockTransaction = {
        id: 'tx-new',
        user_id: 'user-123',
        amount: 25,
        currency: 'LVND',
        type: 'payment',
        status: 'completed',
        created_at: new Date().toISOString(),
        description: 'Payment processed',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      };

      mockTransactionsService.create.mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      const result = await paymentService.processPayment({
        amount: 25,
        currency: 'LVND',
        paymentMethodId: 'pm_123',
        description: 'Payment processed',
      });

      expect(result.transaction).toMatchObject({
        amount: 25,
        status: 'completed',
      });
      expect(mockTransactionsService.create).toHaveBeenCalled();
    });

    it('should throw error when payment fails', async () => {
      mockTransactionsService.create.mockResolvedValue({
        data: null,
        error: new Error('Payment failed'),
      });

      await expect(
        paymentService.processPayment({
          amount: 25,
          currency: 'LVND',
          paymentMethodId: 'pm_123',
        }),
      ).rejects.toThrow();
    });
  });

  describe('withdrawFunds', () => {
    beforeEach(() => {
      // Mock all table queries for withdrawal flow
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'wallets') {
          const mockWallets = [
            { balance: 500, coins_balance: 500, currency: 'LVND' },
            { balance: 500, coins_balance: 500, currency: 'TRY' },
          ];
          const queryChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest
              .fn()
              .mockResolvedValue({ data: mockWallets[0], error: null }),
            then: (resolve: any) => resolve({ data: mockWallets, error: null }),
          };
          return {
            select: jest.fn().mockReturnValue(queryChain),
            upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (tableName === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    balance: 500,
                    coins_balance: 500,
                    pending_balance: 0,
                    currency: 'LVND',
                    status: 'active',
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (tableName === 'gifts') {
          // Mock for thank_you_pending check - no pending thank yous
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    limit: jest
                      .fn()
                      .mockResolvedValue({ data: [], error: null }),
                  }),
                }),
              }),
            }),
          };
        }
        if (tableName === 'escrow_transactions') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          };
        }
        if (tableName === 'bank_accounts') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { id: 'ba_123', is_verified: true },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              balance: 100.5,
              coins_balance: 100.5,
              pending_balance: 0,
              currency: 'LVND',
            },
            error: null,
          }),
        };
      });
    });

    it('should create withdrawal transaction', async () => {
      // Mock successful fetch for this specific test
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          settlementId: 'sett-123',
          fiat_amount: 100,
          status: 'success',
        }),
      });

      const mockTransaction = {
        id: 'tx-withdrawal',
        user_id: 'user-123',
        amount: 100,
        currency: 'LVND',
        type: 'withdrawal',
        status: 'pending',
        created_at: new Date().toISOString(),
        description: 'Withdrawal to bank account',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      };

      mockTransactionsService.create.mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      const result = await paymentService.withdrawFunds({
        coinAmount: 100,
        bankAccountId: 'ba_123',
      });

      expect(result).toHaveProperty('settlementId');
      expect(result).toHaveProperty('fiatAmount');
    });

    it('should throw error when withdrawal fails', async () => {
      // Mock low balance to trigger local "Yetersiz bakiye"
      mockSupabase.from.mockImplementation((tableName: string) => {
        const chain = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          insert: jest.fn().mockResolvedValue({ error: null }),
          single: jest.fn().mockResolvedValue({
            data:
              tableName === 'users'
                ? {
                    balance: 0,
                    coins_balance: 0,
                    pending_balance: 0,
                    currency: 'LVND',
                  }
                : null,
            error: null,
          }),
          then: (resolve: any) => resolve({ data: [], error: null }),
        };
        return chain;
      });

      await expect(
        paymentService.withdrawFunds({
          coinAmount: 100,
          bankAccountId: 'ba_123',
        }),
      ).rejects.toThrow('Yetersiz bakiye');
    });
  });

  describe('requestWithdrawal', () => {
    beforeEach(() => {
      // Mock all table queries for withdrawal flow
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    balance: 250.75,
                    coins_balance: 250.75,
                    pending_balance: 100,
                    currency: 'LVND',
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (tableName === 'gifts') {
          // Mock for thank_you_pending check - no pending thank yous
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    limit: jest
                      .fn()
                      .mockResolvedValue({ data: [], error: null }),
                  }),
                }),
              }),
            }),
          };
        }
        if (tableName === 'escrow_transactions') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          };
        }
        if (tableName === 'bank_accounts') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { id: 'ba_123', is_verified: true },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              balance: 100.5,
              coins_balance: 100.5,
              pending_balance: 0,
              currency: 'LVND',
            },
            error: null,
          }),
        };
      });
    });

    it('should request withdrawal to bank account', async () => {
      // Mock wallets for balance check
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'wallets') {
          const mockWallets = [
            { balance: 500, coins_balance: 500, currency: 'LVND' },
            { balance: 500, coins_balance: 500, currency: 'TRY' },
          ];
          const queryChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest
              .fn()
              .mockResolvedValue({ data: mockWallets[0], error: null }),
            then: (resolve: any) => resolve({ data: mockWallets, error: null }),
          };
          return {
            select: jest.fn().mockReturnValue(queryChain),
            upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
            insert: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (tableName === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                balance: 500,
                coins_balance: 500,
                pending_balance: 0,
                currency: 'TRY',
              },
              error: null,
            }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          insert: jest.fn().mockResolvedValue({ data: [], error: null }),
          single: jest.fn().mockResolvedValue({ data: {}, error: null }),
        };
      });

      const mockTransaction = {
        id: 'tx-withdrawal',
        user_id: 'user-123',
        amount: 50,
        currency: 'LVND',
        type: 'withdrawal',
        status: 'pending',
        created_at: new Date().toISOString(),
        description: 'Withdrawal to bank account',
        metadata: {},
        moment_id: null,
        escrow_status: null,
      };

      mockTransactionsService.create.mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      // Mock successful fetch for this specific test
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          settlementId: 'sett-123',
          status: 'success',
          fiat_amount: 100,
        }),
      });

      const result = await paymentService.requestWithdrawal(100, 'ba_123');
      expect(result).toHaveProperty('settlementId', 'sett-123');
      expect(result.fiatAmount).toBeDefined();
    });
  });

  describe('getWalletBalance', () => {
    it('should get complete wallet balance', async () => {
      // Mock both wallets and escrow_transactions tables
      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                balance: 250.75,
                coins_balance: 0,
                pending_balance: 0,
                currency: 'TRY',
              },
              error: null,
            }),
          };
        }
        if (tableName === 'wallets') {
          const mockWallets = [
            { balance: 250.75, coins_balance: 0, currency: 'TRY' },
            { balance: 250.75, coins_balance: 0, currency: 'USD' },
          ];
          const queryChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest
              .fn()
              .mockResolvedValue({ data: mockWallets[0], error: null }),
            then: (resolve: any) => resolve({ data: mockWallets, error: null }),
          };
          return {
            select: jest.fn().mockReturnValue(queryChain),
            upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (tableName === 'escrow_transactions') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(), // Added for generic mock
          order: jest.fn().mockReturnThis(), // Added for generic mock
          insert: jest.fn().mockResolvedValue({ data: [], error: null }), // Added for generic mock
          single: jest.fn().mockResolvedValue({
            data: {
              balance: 100.5,
              coins_balance: 100.5,
              pending_balance: 0,
              currency: 'LVND',
            },
            error: null,
          }),
        };
      });

      const result = await paymentService.getWalletBalance();

      // getWalletBalance returns { available, pending, currency } directly
      expect(result).toMatchObject({
        available: 250.75,
        currency: 'TRY',
      });
    });
  });

  describe('createPaymentIntent', () => {
    it('should create PayTR payment intent', async () => {
      // createPaymentIntent takes (momentId, amount) as separate args
      const result = await paymentService.createPaymentIntent(
        'moment-123',
        1000,
      );

      expect(result).toMatchObject({
        amount: 1000,
        currency: 'LVND',
        status: 'requires_payment_method',
      });
      expect(result.clientSecret).toBeDefined();
      expect(result.momentId).toBe('moment-123');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment intent', async () => {
      const result = await paymentService.confirmPayment(
        'pi_123',
        'pm_card_123',
      );

      expect(result.success).toBe(true);
    });

    it('should confirm payment without payment method', async () => {
      const result = await paymentService.confirmPayment('pi_123');

      expect(result.success).toBe(true);
    });
  });
});
