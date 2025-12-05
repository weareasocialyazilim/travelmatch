/**
 * TransactionHistoryScreen Tests
 * Smoke tests for transaction history display
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
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
    success: '#22C55E',
    successTransparent33: 'rgba(34, 197, 94, 0.33)',
    error: '#EF4444',
    errorTransparent33: 'rgba(239, 68, 68, 0.33)',
    warningTransparent33: 'rgba(245, 158, 11, 0.33)',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
    },
  },
}));

import { TransactionHistoryScreen } from '../TransactionHistoryScreen';

describe('TransactionHistoryScreen', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<TransactionHistoryScreen />);
    expect(getByText('Transaction History')).toBeTruthy();
  });

  it('displays filter tabs', () => {
    const { getByText } = render(<TransactionHistoryScreen />);
    expect(getByText('All')).toBeTruthy();
  });
});
