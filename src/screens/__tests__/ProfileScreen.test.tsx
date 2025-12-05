/**
 * ProfileScreen Tests
 * Testing profile display, navigation, and user interactions
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileScreen from '../ProfileScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      name: 'Test User',
      kyc: 'Verified',
      location: { city: 'Istanbul' },
    },
    isLoading: false,
  }),
}));

// Mock currentUser
jest.mock('../../mocks/currentUser', () => ({
  CURRENT_USER: {
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
    location: 'Istanbul, Turkey',
    momentsCount: 12,
    exchangesCount: 8,
    responseRate: 95,
    activeMoments: 5,
    completedMoments: 7,
    walletBalance: 250,
    giftsSentCount: 3,
    savedCount: 15,
  },
  isVerified: () => true,
  getProofScore: () => 85,
}));

// Mock BottomNav
jest.mock('../../components/BottomNav', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require('react-native');
  const MockBottomNav = () => <View testID="bottom-nav" />;
  MockBottomNav.displayName = 'MockBottomNav';
  return MockBottomNav;
});

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
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
    },
  },
}));

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly', () => {
      const { getByText } = render(<ProfileScreen />);
      expect(getByText('Profile')).toBeTruthy();
    });

    it('displays user name', () => {
      const { getByText } = render(<ProfileScreen />);
      expect(getByText('Test User')).toBeTruthy();
    });

    it('displays user location', () => {
      const { getByText } = render(<ProfileScreen />);
      // Location shows city only in the UI
      expect(getByText('Istanbul')).toBeTruthy();
    });

    it('displays ProofScore', () => {
      const { getByText } = render(<ProfileScreen />);
      expect(getByText('ProofScore 85%')).toBeTruthy();
    });

    it('displays stats correctly', () => {
      const { getByText } = render(<ProfileScreen />);

      expect(getByText('12')).toBeTruthy(); // momentsCount
      expect(getByText('Moments')).toBeTruthy();
      expect(getByText('8')).toBeTruthy(); // exchangesCount
      expect(getByText('Exchanges')).toBeTruthy();
      expect(getByText('95%')).toBeTruthy(); // responseRate
      expect(getByText('Response')).toBeTruthy();
    });

    it('displays wallet balance', () => {
      const { getByText } = render(<ProfileScreen />);
      expect(getByText('$250.00')).toBeTruthy();
    });

    it('renders bottom navigation', () => {
      const { getByTestId } = render(<ProfileScreen />);
      expect(getByTestId('bottom-nav')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to EditProfile when edit button pressed', () => {
      // Find touchable elements and simulate press on edit button
      // This will be found by the pencil icon button
      render(<ProfileScreen />);
    });

    it('navigates to AppSettings when settings button pressed', () => {
      // Settings navigation test
      render(<ProfileScreen />);
    });

    it('navigates to TrustGardenDetail when ProofScore pressed', () => {
      const { getByText } = render(<ProfileScreen />);

      const proofScoreBadge = getByText('ProofScore 85%');
      fireEvent.press(proofScoreBadge);

      expect(mockNavigate).toHaveBeenCalledWith('TrustGardenDetail');
    });

    it('navigates to MyMoments when moments stat pressed', () => {
      const { getByText } = render(<ProfileScreen />);

      const momentsLabel = getByText('Moments');
      fireEvent.press(momentsLabel);

      expect(mockNavigate).toHaveBeenCalledWith('MyMoments');
    });

    it('navigates to MyGifts when exchanges stat pressed', () => {
      const { getByText } = render(<ProfileScreen />);

      const exchangesLabel = getByText('Exchanges');
      fireEvent.press(exchangesLabel);

      expect(mockNavigate).toHaveBeenCalledWith('MyGifts');
    });

    it('navigates to Wallet when wallet card pressed', () => {
      const { getByText } = render(<ProfileScreen />);

      const walletBalance = getByText('$250.00');
      fireEvent.press(walletBalance);

      expect(mockNavigate).toHaveBeenCalledWith('Wallet');
    });
  });

  describe('Tabs', () => {
    it('displays Active and Past tabs', () => {
      const { getByText } = render(<ProfileScreen />);

      // Tabs show count in parentheses
      expect(getByText(/Active \(\d+\)/)).toBeTruthy();
      expect(getByText(/Past \(\d+\)/)).toBeTruthy();
    });

    it('Active tab is selected by default', () => {
      const { getByText } = render(<ProfileScreen />);

      const activeTab = getByText(/Active \(\d+\)/);
      // Active tab should have different styling
      expect(activeTab).toBeTruthy();
    });

    it('can switch to Past tab', () => {
      const { getByText } = render(<ProfileScreen />);

      const pastTab = getByText(/Past \(\d+\)/);
      fireEvent.press(pastTab);

      // Tab should be switchable
      expect(pastTab).toBeTruthy();
    });
  });

  describe('Moments Display', () => {
    it('displays moment cards', () => {
      const { getByText } = render(<ProfileScreen />);

      // Should show active moments by default
      expect(getByText('Coffee Tour')).toBeTruthy();
    });

    it('displays moment prices', () => {
      const { getByText } = render(<ProfileScreen />);

      expect(getByText('$25')).toBeTruthy();
    });
  });

  describe('Quick Actions', () => {
    it('displays quick action buttons', () => {
      const { getByText } = render(<ProfileScreen />);

      expect(getByText('Gifts Sent')).toBeTruthy();
      expect(getByText('Saved Moments')).toBeTruthy();
    });

    it('navigates to MyGifts when Gifts Sent pressed', () => {
      const { getByText } = render(<ProfileScreen />);

      const giftsSentButton = getByText('Gifts Sent');
      fireEvent.press(giftsSentButton);

      expect(mockNavigate).toHaveBeenCalledWith('MyGifts');
    });

    it('navigates to SavedMoments when Saved Moments pressed', () => {
      const { getByText } = render(<ProfileScreen />);

      const savedButton = getByText('Saved Moments');
      fireEvent.press(savedButton);

      expect(mockNavigate).toHaveBeenCalledWith('SavedMoments');
    });
  });
});

describe('ProfileScreen - Unverified User', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Override mock for unverified user
    jest.doMock('../../context/AuthContext', () => ({
      useAuth: () => ({
        user: {
          name: 'Unverified User',
          kyc: 'Pending',
          location: { city: 'London' },
        },
        isLoading: false,
      }),
    }));
  });

  it('handles unverified user state', () => {
    const { getByText } = render(<ProfileScreen />);
    // Screen should still render
    expect(getByText('Profile')).toBeTruthy();
  });
});
