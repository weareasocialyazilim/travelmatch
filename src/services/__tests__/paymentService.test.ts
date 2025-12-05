/**
 * Tests for paymentService
 * Verifies wallet, transactions, and payment method operations
 */

import {
  paymentService,
  formatCurrency,
  getTransactionTypeLabel,
  getTransactionIcon,
  isPositiveTransaction,
} from '../paymentService';
import { api } from '../../utils/api';

// Mock the api module
jest.mock('../../utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('paymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWalletBalance', () => {
    it('should fetch wallet balance', async () => {
      const mockBalance = {
        balance: {
          available: 150.0,
          pending: 50.0,
          total: 200.0,
          currency: 'USD',
        },
      };

      mockApi.get.mockResolvedValueOnce(mockBalance);

      const result = await paymentService.getWalletBalance();

      expect(mockApi.get).toHaveBeenCalledWith('/wallet/balance');
      expect(result.balance.available).toBe(150.0);
      expect(result.balance.currency).toBe('USD');
    });
  });

  describe('getTransactions', () => {
    it('should fetch transaction history', async () => {
      const mockTransactions = {
        transactions: [
          { id: 't1', type: 'payment', amount: 50, status: 'completed' },
          { id: 't2', type: 'withdrawal', amount: 100, status: 'pending' },
        ],
        total: 2,
      };

      mockApi.get.mockResolvedValueOnce(mockTransactions);

      const result = await paymentService.getTransactions();

      expect(mockApi.get).toHaveBeenCalledWith('/wallet/transactions', {
        params: undefined,
      });
      expect(result.transactions).toHaveLength(2);
    });

    it('should support filtering by type', async () => {
      const mockTransactions = { transactions: [], total: 0 };

      mockApi.get.mockResolvedValueOnce(mockTransactions);

      await paymentService.getTransactions({ type: 'payment' });

      expect(mockApi.get).toHaveBeenCalledWith('/wallet/transactions', {
        params: { type: 'payment' },
      });
    });
  });

  describe('getPaymentMethods', () => {
    it('should fetch all payment methods', async () => {
      const mockMethods = {
        cards: [{ id: 'c1', last4: '4242', brand: 'visa' }],
        bankAccounts: [
          { id: 'b1', bankName: 'Test Bank', accountLast4: '6789' },
        ],
      };

      mockApi.get.mockResolvedValueOnce(mockMethods);

      const result = await paymentService.getPaymentMethods();

      expect(mockApi.get).toHaveBeenCalledWith('/payment-methods');
      expect(result.cards).toHaveLength(1);
      expect(result.bankAccounts).toHaveLength(1);
    });
  });

  describe('addCard', () => {
    it('should add a new card', async () => {
      const mockCard = { card: { id: 'c1', last4: '4242', brand: 'visa' } };

      mockApi.post.mockResolvedValueOnce(mockCard);

      const result = await paymentService.addCard('tok_visa');

      expect(mockApi.post).toHaveBeenCalledWith('/payment-methods/cards', {
        tokenId: 'tok_visa',
      });
      expect(result.card.last4).toBe('4242');
    });
  });

  describe('removeCard', () => {
    it('should remove a card', async () => {
      mockApi.delete.mockResolvedValueOnce({ success: true });

      await paymentService.removeCard('c1');

      expect(mockApi.delete).toHaveBeenCalledWith('/payment-methods/cards/c1');
    });
  });

  describe('addBankAccount', () => {
    it('should add a new bank account', async () => {
      const accountData = {
        accountNumber: '1234567890',
        routingNumber: '110000000',
        accountHolderName: 'John Doe',
      };

      const mockAccount = {
        bankAccount: { id: 'b1', bankName: 'Test Bank', accountLast4: '7890' },
      };

      mockApi.post.mockResolvedValueOnce(mockAccount);

      const result = await paymentService.addBankAccount(accountData);

      expect(mockApi.post).toHaveBeenCalledWith(
        '/payment-methods/bank-accounts',
        accountData,
      );
      expect(result.bankAccount.id).toBe('b1');
    });
  });

  describe('requestWithdrawal', () => {
    it('should request a withdrawal', async () => {
      const mockWithdrawal = {
        transaction: { id: 'w1', amount: 100, status: 'pending' },
      };

      mockApi.post.mockResolvedValueOnce(mockWithdrawal);

      const result = await paymentService.requestWithdrawal({
        amount: 100,
        bankAccountId: 'b1',
      });

      expect(mockApi.post).toHaveBeenCalledWith('/wallet/withdraw', {
        amount: 100,
        bankAccountId: 'b1',
      });
      expect(result.transaction.amount).toBe(100);
    });
  });

  describe('releaseEscrow', () => {
    it('should release escrow funds', async () => {
      const mockResult = {
        success: true,
        transaction: { id: 't1', amount: 100, status: 'completed' },
      };

      mockApi.post.mockResolvedValueOnce(mockResult);

      const result = await paymentService.releaseEscrow('r1');

      expect(mockApi.post).toHaveBeenCalledWith('/escrow/r1/release');
      expect(result.success).toBe(true);
      expect(result.transaction.id).toBe('t1');
    });
  });

  describe('getTransaction', () => {
    it('should fetch a single transaction by id', async () => {
      const mockTransaction = {
        transaction: {
          id: 't1',
          type: 'gift_sent',
          amount: 50,
          status: 'completed',
          description: 'Gift to John',
          createdAt: '2024-01-01T00:00:00Z',
        },
      };

      mockApi.get.mockResolvedValueOnce(mockTransaction);

      const result = await paymentService.getTransaction('t1');

      expect(mockApi.get).toHaveBeenCalledWith('/wallet/transactions/t1');
      expect(result.transaction.id).toBe('t1');
    });
  });

  describe('setDefaultCard', () => {
    it('should set a card as default', async () => {
      mockApi.post.mockResolvedValueOnce({ success: true });

      const result = await paymentService.setDefaultCard('c1');

      expect(mockApi.post).toHaveBeenCalledWith(
        '/payment-methods/cards/c1/default',
      );
      expect(result.success).toBe(true);
    });
  });

  describe('removeBankAccount', () => {
    it('should remove a bank account', async () => {
      mockApi.delete.mockResolvedValueOnce({ success: true });

      const result = await paymentService.removeBankAccount('b1');

      expect(mockApi.delete).toHaveBeenCalledWith(
        '/payment-methods/bank-accounts/b1',
      );
      expect(result.success).toBe(true);
    });
  });

  describe('verifyBankAccount', () => {
    it('should verify bank account with micro-deposits', async () => {
      mockApi.post.mockResolvedValueOnce({ success: true });

      const result = await paymentService.verifyBankAccount('b1', [0.32, 0.45]);

      expect(mockApi.post).toHaveBeenCalledWith(
        '/payment-methods/bank-accounts/b1/verify',
        { amounts: [0.32, 0.45] },
      );
      expect(result.success).toBe(true);
    });
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent for gifting', async () => {
      const mockIntent = {
        paymentIntent: {
          id: 'pi_123',
          clientSecret: 'pi_123_secret_abc',
          amount: 5000,
          currency: 'usd',
          status: 'requires_payment_method',
        },
      };

      mockApi.post.mockResolvedValueOnce(mockIntent);

      const result = await paymentService.createPaymentIntent({
        momentId: 'm1',
        amount: 50,
      });

      expect(mockApi.post).toHaveBeenCalledWith('/payments/create-intent', {
        momentId: 'm1',
        amount: 50,
      });
      expect(result.paymentIntent.id).toBe('pi_123');
      expect(result.paymentIntent.clientSecret).toBe('pi_123_secret_abc');
    });

    it('should create payment intent with optional payment method', async () => {
      const mockIntent = {
        paymentIntent: {
          id: 'pi_456',
          clientSecret: 'pi_456_secret_def',
          amount: 10000,
          currency: 'eur',
          status: 'requires_confirmation',
        },
      };

      mockApi.post.mockResolvedValueOnce(mockIntent);

      const _result = await paymentService.createPaymentIntent({
        momentId: 'm2',
        amount: 100,
        currency: 'eur',
        paymentMethodId: 'pm_card_visa',
      });

      expect(mockApi.post).toHaveBeenCalledWith('/payments/create-intent', {
        momentId: 'm2',
        amount: 100,
        currency: 'eur',
        paymentMethodId: 'pm_card_visa',
      });
    });
  });

  describe('confirmPayment', () => {
    it('should confirm a payment', async () => {
      const mockResult = {
        success: true,
        transaction: {
          id: 't1',
          type: 'gift_sent',
          amount: 50,
          status: 'completed',
        },
      };

      mockApi.post.mockResolvedValueOnce(mockResult);

      const result = await paymentService.confirmPayment('pi_123');

      expect(mockApi.post).toHaveBeenCalledWith('/payments/confirm', {
        paymentIntentId: 'pi_123',
        paymentMethodId: undefined,
      });
      expect(result.success).toBe(true);
      expect(result.transaction.status).toBe('completed');
    });

    it('should confirm payment with specific payment method', async () => {
      const mockResult = {
        success: true,
        transaction: { id: 't2', amount: 100, status: 'completed' },
      };

      mockApi.post.mockResolvedValueOnce(mockResult);

      await paymentService.confirmPayment('pi_456', 'pm_card_mastercard');

      expect(mockApi.post).toHaveBeenCalledWith('/payments/confirm', {
        paymentIntentId: 'pi_456',
        paymentMethodId: 'pm_card_mastercard',
      });
    });
  });

  describe('cancelPayment', () => {
    it('should cancel a payment', async () => {
      mockApi.post.mockResolvedValueOnce({ success: true });

      const result = await paymentService.cancelPayment('pi_123');

      expect(mockApi.post).toHaveBeenCalledWith('/payments/cancel', {
        paymentIntentId: 'pi_123',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getWithdrawalLimits', () => {
    it('should fetch withdrawal limits', async () => {
      const mockLimits = {
        minAmount: 10,
        maxAmount: 10000,
        dailyLimit: 5000,
        remainingDaily: 3500,
      };

      mockApi.get.mockResolvedValueOnce(mockLimits);

      const result = await paymentService.getWithdrawalLimits();

      expect(mockApi.get).toHaveBeenCalledWith('/wallet/withdrawal-limits');
      expect(result.minAmount).toBe(10);
      expect(result.maxAmount).toBe(10000);
      expect(result.remainingDaily).toBe(3500);
    });
  });

  describe('getEscrowStatus', () => {
    it('should fetch escrow status', async () => {
      const mockStatus = {
        status: 'held',
        amount: 100,
        heldAt: '2024-01-01T00:00:00Z',
      };

      mockApi.get.mockResolvedValueOnce(mockStatus);

      const result = await paymentService.getEscrowStatus('r1');

      expect(mockApi.get).toHaveBeenCalledWith('/escrow/r1');
      expect(result.status).toBe('held');
      expect(result.amount).toBe(100);
    });
  });

  describe('requestRefund', () => {
    it('should request escrow refund', async () => {
      mockApi.post.mockResolvedValueOnce({ success: true });

      const result = await paymentService.requestRefund(
        'r1',
        'Item not as described',
      );

      expect(mockApi.post).toHaveBeenCalledWith('/escrow/r1/refund-request', {
        reason: 'Item not as described',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should propagate API errors for getWalletBalance', async () => {
      const error = new Error('Network error');
      mockApi.get.mockRejectedValueOnce(error);

      await expect(paymentService.getWalletBalance()).rejects.toThrow(
        'Network error',
      );
    });

    it('should propagate API errors for createPaymentIntent', async () => {
      const error = new Error('Invalid amount');
      mockApi.post.mockRejectedValueOnce(error);

      await expect(
        paymentService.createPaymentIntent({ momentId: 'm1', amount: -50 }),
      ).rejects.toThrow('Invalid amount');
    });

    it('should propagate API errors for confirmPayment', async () => {
      const error = new Error('Payment declined');
      mockApi.post.mockRejectedValueOnce(error);

      await expect(paymentService.confirmPayment('pi_123')).rejects.toThrow(
        'Payment declined',
      );
    });
  });
});

// Helper function tests
describe('Payment Helper Functions', () => {
  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0.99)).toBe('$0.99');
    });

    it('should format other currencies', () => {
      expect(formatCurrency(100, 'EUR')).toBe('€100.00');
      expect(formatCurrency(100, 'GBP')).toBe('£100.00');
    });

    it('should handle zero and negative values', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(-50)).toBe('-$50.00');
    });
  });

  describe('getTransactionTypeLabel', () => {
    it('should return correct labels for each type', () => {
      expect(getTransactionTypeLabel('gift_sent')).toBe('Gift Sent');
      expect(getTransactionTypeLabel('gift_received')).toBe('Gift Received');
      expect(getTransactionTypeLabel('withdrawal')).toBe('Withdrawal');
      expect(getTransactionTypeLabel('deposit')).toBe('Deposit');
      expect(getTransactionTypeLabel('refund')).toBe('Refund');
      expect(getTransactionTypeLabel('fee')).toBe('Fee');
    });
  });

  describe('getTransactionIcon', () => {
    it('should return correct icons for each type', () => {
      expect(getTransactionIcon('gift_sent')).toBe('gift-outline');
      expect(getTransactionIcon('gift_received')).toBe('gift');
      expect(getTransactionIcon('withdrawal')).toBe('arrow-up-circle-outline');
      expect(getTransactionIcon('deposit')).toBe('arrow-down-circle-outline');
      expect(getTransactionIcon('refund')).toBe('refresh-outline');
      expect(getTransactionIcon('fee')).toBe('receipt-outline');
    });
  });

  describe('isPositiveTransaction', () => {
    it('should return true for positive transaction types', () => {
      expect(isPositiveTransaction('gift_received')).toBe(true);
      expect(isPositiveTransaction('deposit')).toBe(true);
      expect(isPositiveTransaction('refund')).toBe(true);
    });

    it('should return false for negative transaction types', () => {
      expect(isPositiveTransaction('gift_sent')).toBe(false);
      expect(isPositiveTransaction('withdrawal')).toBe(false);
      expect(isPositiveTransaction('fee')).toBe(false);
    });
  });
});
