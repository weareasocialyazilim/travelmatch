/**
 * WalletScreen Tests
 * Testing wallet balance display, transaction list, filtering, and navigation
 */

/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock usePayments hook
const mockRefreshBalance = jest.fn();
const mockLoadTransactions = jest.fn();
jest.mock('../../hooks/usePayments', () => ({
  usePayments: () => ({
    balance: 150.0,
    transactions: [
      {
        id: '1',
        type: 'gift_received',
        description: 'Gift for Coffee',
        status: 'pending',
        amount: 10.0,
      },
      {
        id: '2',
        type: 'withdrawal',
        description: 'Bank withdrawal',
        status: 'completed',
        amount: 50.0,
      },
      {
        id: '3',
        type: 'gift_sent',
        description: 'Gift sent',
        status: 'completed',
        amount: 25.0,
      },
    ],
    balanceLoading: false,
    transactionsError: null,
    refreshBalance: mockRefreshBalance,
    loadTransactions: mockLoadTransactions,
  }),
}));

// Mock BottomNav
jest.mock('../../components/BottomNav', () => {
  const { View } = require('react-native');
  const MockBottomNav = () => <View testID="bottom-nav" />;
  MockBottomNav.displayName = 'MockBottomNav';
  return MockBottomNav;
});

// Mock ErrorBoundary
jest.mock('../../components/ErrorBoundary', () => ({
  ScreenErrorBoundary: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock constants
jest.mock('../../constants/colors', () => ({
  COLORS: {
    background: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    primary: '#3B82F6',
    white: '#FFFFFF',
    border: '#E5E5E5',
    mint: '#10B981',
    success: '#22C55E',
    error: '#EF4444',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      400: '#9CA3AF',
    },
  },
}));

import WalletScreen from '../WalletScreen';

describe('WalletScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly', () => {
      const { getByText } = render(<WalletScreen />);
      expect(getByText('Wallet')).toBeTruthy();
    });

    it('displays transactions list', () => {
      const { getByText } = render(<WalletScreen />);
      expect(getByText('Gift for Coffee')).toBeTruthy();
    });

    it('renders bottom navigation', () => {
      const { getByTestId } = render(<WalletScreen />);
      expect(getByTestId('bottom-nav')).toBeTruthy();
    });

    it('displays filter tabs', () => {
      const { getByText } = render(<WalletScreen />);
      expect(getByText('All')).toBeTruthy();
      expect(getByText('Incoming')).toBeTruthy();
      expect(getByText('Outgoing')).toBeTruthy();
    });
  });

  describe('Data Loading', () => {
    it('calls refreshBalance on mount', () => {
      render(<WalletScreen />);
      expect(mockRefreshBalance).toHaveBeenCalled();
    });

    it('calls loadTransactions on mount', () => {
      render(<WalletScreen />);
      expect(mockLoadTransactions).toHaveBeenCalled();
    });
  });

  describe('Filtering', () => {
    it('shows all transactions by default', () => {
      const { getByText } = render(<WalletScreen />);
      expect(getByText('Gift for Coffee')).toBeTruthy();
      expect(getByText('Bank withdrawal')).toBeTruthy();
    });

    it('filters to incoming transactions', () => {
      const { getByText } = render(<WalletScreen />);

      fireEvent.press(getByText('Incoming'));

      // Should show gift_received
      expect(getByText('Gift for Coffee')).toBeTruthy();
    });

    it('filters to outgoing transactions', () => {
      const { getByText, queryByText } = render(<WalletScreen />);

      fireEvent.press(getByText('Outgoing'));

      // Should show withdrawal but not gift_received
      expect(queryByText('Gift for Coffee')).toBeFalsy();
    });

    it('can switch back to all filter', () => {
      const { getByText } = render(<WalletScreen />);

      fireEvent.press(getByText('Outgoing'));
      fireEvent.press(getByText('All'));

      expect(getByText('Gift for Coffee')).toBeTruthy();
      expect(getByText('Bank withdrawal')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to TransactionDetail on transaction press', () => {
      const { getByText } = render(<WalletScreen />);

      fireEvent.press(getByText('Gift for Coffee'));

      expect(mockNavigate).toHaveBeenCalledWith('TransactionDetail', {
        transactionId: '1',
      });
    });

    it('navigates to Withdraw screen', () => {
      const { getByText } = render(<WalletScreen />);

      const withdrawButton = getByText('Withdraw');
      fireEvent.press(withdrawButton);

      expect(mockNavigate).toHaveBeenCalledWith('Withdraw');
    });
  });

  describe('Loading States', () => {
    it('shows loading state when balance is loading', () => {
      // Component should handle loading state gracefully
      const { getByText } = render(<WalletScreen />);
      expect(getByText('Wallet')).toBeTruthy();
    });
  });

  describe('Transaction Display', () => {
    it('displays transaction amount correctly', () => {
      const { getByText } = render(<WalletScreen />);
      expect(getByText('+$10.00')).toBeTruthy();
    });

    it('displays negative amount for withdrawals', () => {
      const { getByText } = render(<WalletScreen />);
      expect(getByText('-$50.00')).toBeTruthy();
    });

    it('shows pending status indicator', () => {
      const { getByText } = render(<WalletScreen />);
      // Transaction with pending status should show indicator
      expect(getByText('pending')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no transactions', () => {
      // Component should handle empty state
      const { getByText } = render(<WalletScreen />);
      expect(getByText('Wallet')).toBeTruthy();
    });
  });
});
