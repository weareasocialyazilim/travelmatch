/**
 * Tests for usePayments hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePayments } from '../usePayments';
import { paymentService } from '../../services/paymentService';

// Mock the payment service
jest.mock('../../services/paymentService', () => ({
  paymentService: {
    getWalletBalance: jest.fn(),
    getTransactions: jest.fn(),
    requestWithdrawal: jest.fn(),
    getPaymentMethods: jest.fn(),
    addCard: jest.fn(),
    removeCard: jest.fn(),
    addBankAccount: jest.fn(),
    removeBankAccount: jest.fn(),
  },
  PAYMENT_CONFIG: {
    MIN_WITHDRAWAL: 10,
    MAX_WITHDRAWAL: 10000,
  },
}));

const mockPaymentService = paymentService as jest.Mocked<typeof paymentService>;

describe('usePayments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshBalance', () => {
    it('should fetch wallet balance', async () => {
      const mockBalance = {
        available: 1000,
        escrow: 200,
        currency: 'USD',
      };

      // Hook expects response.balance structure
      mockPaymentService.getWalletBalance.mockResolvedValueOnce({
        balance: mockBalance,
      });

      const { result } = renderHook(() => usePayments());

      await act(async () => {
        await result.current.refreshBalance();
      });

      await waitFor(() => {
        expect(result.current.balance).toEqual(mockBalance);
        expect(result.current.balanceLoading).toBe(false);
      });
    });

    it('should handle balance fetch errors', async () => {
      mockPaymentService.getWalletBalance.mockRejectedValueOnce(
        new Error('Network error'),
      );

      const { result } = renderHook(() => usePayments());

      await act(async () => {
        await result.current.refreshBalance();
      });

      // Balance errors are logged but not stored in transactionsError
      await waitFor(() => {
        expect(result.current.balanceLoading).toBe(false);
      });
    });
  });

  describe('loadTransactions', () => {
    it('should fetch transaction history', async () => {
      const mockTransactions = [
        { id: 't1', amount: 50, type: 'gift_received' },
        { id: 't2', amount: -30, type: 'withdrawal' },
      ];

      // Hook expects response.transactions structure
      mockPaymentService.getTransactions.mockResolvedValueOnce({
        transactions: mockTransactions,
      });

      const { result } = renderHook(() => usePayments());

      await act(async () => {
        await result.current.loadTransactions();
      });

      await waitFor(() => {
        expect(result.current.transactions).toEqual(mockTransactions);
      });
    });
  });

  describe('requestWithdrawal', () => {
    it('should initiate a withdrawal', async () => {
      const mockBalance = { available: 1000, escrow: 0, currency: 'USD' };
      const mockWithdrawal = { id: 'w1', amount: 100, status: 'pending' };

      mockPaymentService.getWalletBalance.mockResolvedValueOnce({
        balance: mockBalance,
      });
      mockPaymentService.requestWithdrawal.mockResolvedValueOnce({
        transaction: mockWithdrawal,
      });

      const { result } = renderHook(() => usePayments());

      // First fetch balance
      await act(async () => {
        await result.current.refreshBalance();
      });

      // Then withdraw - returns Transaction | null
      let withdrawalResult: any = null;
      await act(async () => {
        withdrawalResult = await result.current.requestWithdrawal(
          100,
          'bank-1',
        );
      });

      expect(withdrawalResult).toBeTruthy();
    });

    it('should handle withdrawal errors gracefully', async () => {
      const mockBalance = { available: 1000, escrow: 0, currency: 'USD' };

      mockPaymentService.getWalletBalance.mockResolvedValueOnce({
        balance: mockBalance,
      });
      mockPaymentService.requestWithdrawal.mockRejectedValueOnce(
        new Error('Withdrawal failed'),
      );

      const { result } = renderHook(() => usePayments());

      await act(async () => {
        await result.current.refreshBalance();
      });

      let withdrawalResult: any = 'not-null';
      await act(async () => {
        withdrawalResult = await result.current.requestWithdrawal(
          100,
          'bank-1',
        );
      });

      // Should return null on error
      expect(withdrawalResult).toBeNull();
    });
  });

  describe('refreshPaymentMethods', () => {
    it('should fetch payment methods', async () => {
      const mockMethods = {
        cards: [{ id: 'c1', last4: '4242', brand: 'visa' }],
        bankAccounts: [{ id: 'b1', bankName: 'Test Bank' }],
      };

      mockPaymentService.getPaymentMethods.mockResolvedValueOnce(
        mockMethods as any,
      );

      const { result } = renderHook(() => usePayments());

      await act(async () => {
        await result.current.refreshPaymentMethods();
      });

      await waitFor(() => {
        expect(result.current.cards).toEqual(mockMethods.cards);
        expect(result.current.bankAccounts).toEqual(mockMethods.bankAccounts);
      });
    });
  });

  describe('addCard', () => {
    it('should add a new card', async () => {
      const mockCard = { id: 'c2', last4: '1234', brand: 'mastercard' };

      // Hook expects response.card structure
      mockPaymentService.addCard.mockResolvedValueOnce({ card: mockCard });

      const { result } = renderHook(() => usePayments());

      // addCard returns PaymentCard | null
      let cardResult: any = null;
      await act(async () => {
        cardResult = await result.current.addCard('tok_mastercard');
      });

      expect(cardResult).toBeTruthy();
      expect(mockPaymentService.addCard).toHaveBeenCalledWith('tok_mastercard');
    });
  });

  describe('removeCard', () => {
    it('should remove a card', async () => {
      mockPaymentService.removeCard.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => usePayments());

      let success = false;
      await act(async () => {
        success = await result.current.removeCard('c1');
      });

      expect(success).toBe(true);
      expect(mockPaymentService.removeCard).toHaveBeenCalledWith('c1');
    });
  });

  describe('addBankAccount', () => {
    it('should add a bank account', async () => {
      const mockBankAccount = { id: 'b2', bankName: 'New Bank' };
      const accountData = {
        accountNumber: '123456789',
        routingNumber: '021000021',
        accountHolderName: 'John Doe',
        accountType: 'checking' as const,
      };

      // Hook expects response.bankAccount structure
      mockPaymentService.addBankAccount.mockResolvedValueOnce({
        bankAccount: mockBankAccount,
      });

      const { result } = renderHook(() => usePayments());

      // addBankAccount returns BankAccount | null
      let bankResult: any = null;
      await act(async () => {
        bankResult = await result.current.addBankAccount(accountData);
      });

      expect(bankResult).toBeTruthy();
      expect(mockPaymentService.addBankAccount).toHaveBeenCalledWith(
        accountData,
      );
    });
  });
});
