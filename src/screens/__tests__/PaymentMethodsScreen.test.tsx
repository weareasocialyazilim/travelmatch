/**
 * PaymentMethodsScreen Tests
 * Smoke tests for payment methods management
 */
/* eslint-disable @typescript-eslint/no-var-requires */

import React from 'react';
import { render } from '@testing-library/react-native';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock BottomNav
jest.mock('../../components/BottomNav', () => {
  const { View } = require('react-native');
  const MockBottomNav = () => <View testID="bottom-nav" />;
  MockBottomNav.displayName = 'MockBottomNav';
  return MockBottomNav;
});

// Mock usePayments hook
jest.mock('../../hooks/usePayments', () => ({
  usePayments: () => ({
    paymentMethods: [],
    loading: false,
    error: null,
    fetchPaymentMethods: jest.fn(),
  }),
}));

// Mock constants
jest.mock('../../constants/colors', () => ({
  COLORS: {
    background: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    primary: '#3B82F6',
    border: '#E5E5E5',
    error: '#EF4444',
    white: '#FFFFFF',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
    },
  },
}));

import PaymentMethodsScreen from '../PaymentMethodsScreen';

describe('PaymentMethodsScreen', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<PaymentMethodsScreen />);
    expect(getByText('Payment methods')).toBeTruthy();
  });

  it('renders add card option', () => {
    const { getByText } = render(<PaymentMethodsScreen />);
    expect(getByText(/Add new card/i)).toBeTruthy();
  });
});
