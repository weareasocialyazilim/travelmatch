/**
 * AboutScreen Tests
 * Testing about screen rendering and navigation
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AboutScreen } from '../AboutScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
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
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
}));

describe('AboutScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly', () => {
      const { getByText } = render(<AboutScreen />);

      expect(getByText('About TravelMatch')).toBeTruthy();
    });

    it('displays app name', () => {
      const { getByText } = render(<AboutScreen />);

      expect(getByText('TravelMatch')).toBeTruthy();
    });

    it('displays tagline', () => {
      const { getByText } = render(<AboutScreen />);

      expect(
        getByText(
          'A proof-based social gifting platform built for real moments.',
        ),
      ).toBeTruthy();
    });

    it('displays app version', () => {
      const { getByText } = render(<AboutScreen />);

      expect(getByText('Version')).toBeTruthy();
      expect(getByText('1.0.2')).toBeTruthy();
    });

    it('displays build number', () => {
      const { getByText } = render(<AboutScreen />);

      expect(getByText('Build')).toBeTruthy();
      expect(getByText('245')).toBeTruthy();
    });

    it('displays build date', () => {
      const { getByText } = render(<AboutScreen />);

      expect(getByText('Build Date')).toBeTruthy();
      expect(getByText('October 26, 2023')).toBeTruthy();
    });

    it('displays copyright', () => {
      const { getByText } = render(<AboutScreen />);

      expect(getByText('Copyright')).toBeTruthy();
      expect(getByText('© 2023 TravelMatch Inc.')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to Terms of Service when pressed', () => {
      const { getByText } = render(<AboutScreen />);

      const termsLink = getByText('Terms of Service');
      fireEvent.press(termsLink);

      expect(mockNavigate).toHaveBeenCalledWith('TermsOfService');
    });

    it('navigates to Privacy Policy when pressed', () => {
      const { getByText } = render(<AboutScreen />);

      const privacyLink = getByText('Privacy Policy');
      fireEvent.press(privacyLink);

      expect(mockNavigate).toHaveBeenCalledWith('PrivacyPolicy');
    });
  });

  describe('Legal Links', () => {
    it('renders Terms of Service link', () => {
      const { getByText } = render(<AboutScreen />);

      expect(getByText('Terms of Service')).toBeTruthy();
    });

    it('renders Privacy Policy link', () => {
      const { getByText } = render(<AboutScreen />);

      expect(getByText('Privacy Policy')).toBeTruthy();
    });
  });
});
