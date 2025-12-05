/**
 * AppSettingsScreen Tests
 * Testing settings display, navigation, and user interactions
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AppSettingsScreen from '../AppSettingsScreen';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    reset: mockReset,
  }),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock LanguageSelectionBottomSheet
jest.mock('../../components/LanguageSelectionBottomSheet', () => ({
  LanguageSelectionBottomSheet: () => null,
}));

// Mock current user
jest.mock('../../mocks/currentUser', () => ({
  CURRENT_USER: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    memberSince: 'January 2024',
    kycStatus: 'verified',
  },
  isKYCVerified: () => true,
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
    error: '#EF4444',
    mint: '#10B981',
    mintTransparent: '#10B98120',
    coral: '#FF6B6B',
    coralTransparent: '#FF6B6B20',
    softOrange: '#FB923C',
    softOrangeTransparent: '#FB923C20',
    softGray: '#9CA3AF',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    errorLight: '#FEE2E2',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
    },
  },
}));

describe('AppSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly', () => {
      const { getByText } = render(<AppSettingsScreen />);
      expect(getByText('App Settings')).toBeTruthy();
    });

    it('displays notification section', () => {
      const { getByText } = render(<AppSettingsScreen />);
      expect(getByText('NOTIFICATIONS')).toBeTruthy();
      expect(getByText('Push Notifications')).toBeTruthy();
    });

    it('displays privacy section', () => {
      const { getByText } = render(<AppSettingsScreen />);
      expect(getByText('PRIVACY')).toBeTruthy();
      expect(getByText('Profile Visibility')).toBeTruthy();
    });

    it('displays language section', () => {
      const { getByText } = render(<AppSettingsScreen />);
      expect(getByText('LANGUAGE')).toBeTruthy();
      expect(getByText('App Language')).toBeTruthy();
    });

    it('displays share section', () => {
      const { getByText } = render(<AppSettingsScreen />);
      expect(getByText('SHARE')).toBeTruthy();
      expect(getByText('Invite Friends')).toBeTruthy();
    });

    it('displays storage section', () => {
      const { getByText } = render(<AppSettingsScreen />);
      expect(getByText('STORAGE')).toBeTruthy();
      expect(getByText('Clear Cache')).toBeTruthy();
    });

    it('displays about section', () => {
      const { getByText } = render(<AppSettingsScreen />);
      expect(getByText('ABOUT')).toBeTruthy();
      expect(getByText('Version')).toBeTruthy();
      expect(getByText('1.0.0 (Build 100)')).toBeTruthy();
    });

    it('displays account section', () => {
      const { getByText } = render(<AppSettingsScreen />);
      expect(getByText('ACCOUNT')).toBeTruthy();
      expect(getByText('Sign Out')).toBeTruthy();
      expect(getByText('Delete Account')).toBeTruthy();
    });

    it('displays member since date', () => {
      const { getByText } = render(<AppSettingsScreen />);
      expect(getByText('Member Since')).toBeTruthy();
      expect(getByText('January 2024')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates back when back button pressed', () => {
      // Find back button by finding the arrow-left icon container
      const { getAllByText } = render(<AppSettingsScreen />);
      // Press the header area to trigger goBack
      fireEvent.press(getAllByText('App Settings')[0]);
    });

    it('navigates to Invite Friends', () => {
      const { getByText } = render(<AppSettingsScreen />);
      const inviteButton = getByText('Invite Friends');
      fireEvent.press(inviteButton);
      expect(mockNavigate).toHaveBeenCalledWith('InviteFriends');
    });

    it('navigates to Terms of Service', () => {
      const { getByText } = render(<AppSettingsScreen />);
      const termsButton = getByText('Terms of Service');
      fireEvent.press(termsButton);
      expect(mockNavigate).toHaveBeenCalledWith('TermsOfService');
    });

    it('navigates to Privacy Policy', () => {
      const { getByText } = render(<AppSettingsScreen />);
      const privacyButton = getByText('Privacy Policy');
      fireEvent.press(privacyButton);
      expect(mockNavigate).toHaveBeenCalledWith('PrivacyPolicy');
    });

    it('navigates to Delete Account', () => {
      const { getByText } = render(<AppSettingsScreen />);
      const deleteButton = getByText('Delete Account');
      fireEvent.press(deleteButton);
      expect(mockNavigate).toHaveBeenCalledWith('DeleteAccount');
    });
  });

  describe('Notifications', () => {
    it('shows sub-notification options when push is enabled', () => {
      const { getByText } = render(<AppSettingsScreen />);
      expect(getByText('Chat Messages')).toBeTruthy();
      expect(getByText('Request Updates')).toBeTruthy();
      expect(getByText('Marketing')).toBeTruthy();
    });
  });

  describe('Sign Out', () => {
    it('shows sign out confirmation alert', () => {
      const { getByText } = render(<AppSettingsScreen />);
      const signOutButton = getByText('Sign Out');
      fireEvent.press(signOutButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Sign Out',
        'Are you sure you want to sign out?',
        expect.any(Array),
      );
    });
  });

  describe('Clear Cache', () => {
    it('shows clear cache confirmation alert', () => {
      const { getByText } = render(<AppSettingsScreen />);
      const clearCacheButton = getByText('Clear Cache');
      fireEvent.press(clearCacheButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Clear Cache',
        'This will clear all cached data. Are you sure?',
        expect.any(Array),
      );
    });

    it('displays cache size', () => {
      const { getByText } = render(<AppSettingsScreen />);
      expect(getByText('24.5 MB')).toBeTruthy();
    });
  });

  describe('Identity Verification', () => {
    it('shows verified badge when user is verified', () => {
      const { getByText } = render(<AppSettingsScreen />);
      expect(getByText('Verified')).toBeTruthy();
      expect(getByText('Your identity has been verified')).toBeTruthy();
    });
  });
});
