/**
 * GiftInboxScreen Tests
 * Smoke tests for gift inbox functionality
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

// Mock useGifts hook
jest.mock('../../hooks', () => ({
  useGifts: () => ({
    gifts: [],
    loading: false,
    error: null,
    fetchGifts: jest.fn(),
  }),
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
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
    },
  },
}));

import GiftInboxScreen from '../GiftInboxScreen';

describe('GiftInboxScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<GiftInboxScreen />);
    expect(toJSON()).toBeTruthy();
  });
});
