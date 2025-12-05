/**
 * WelcomeScreen Tests
 * Testing welcome/landing screen rendering and navigation
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WelcomeScreen } from '../WelcomeScreen';

// Mock navigation
const mockNavigate = jest.fn();

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
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
    },
  },
}));

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly', () => {
      const { getByText } = render(
        <WelcomeScreen navigation={{ navigate: mockNavigate }} />,
      );

      expect(getByText('Welcome to TravelMatch')).toBeTruthy();
    });

    it('displays app description', () => {
      const { getByText } = render(
        <WelcomeScreen navigation={{ navigate: mockNavigate }} />,
      );

      expect(getByText(/Connect with locals/)).toBeTruthy();
      expect(getByText(/Share experiences/)).toBeTruthy();
    });

    it('renders create account button', () => {
      const { getByText } = render(
        <WelcomeScreen navigation={{ navigate: mockNavigate }} />,
      );

      expect(getByText('Create an account')).toBeTruthy();
    });

    it('renders login button', () => {
      const { getByText } = render(
        <WelcomeScreen navigation={{ navigate: mockNavigate }} />,
      );

      expect(getByText('Log in')).toBeTruthy();
    });

    it('displays terms and privacy links', () => {
      const { getByText } = render(
        <WelcomeScreen navigation={{ navigate: mockNavigate }} />,
      );

      expect(getByText('Terms')).toBeTruthy();
      expect(getByText('Privacy')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to Register when create account is pressed', () => {
      const { getByText } = render(
        <WelcomeScreen navigation={{ navigate: mockNavigate }} />,
      );

      const createAccountButton = getByText('Create an account');
      fireEvent.press(createAccountButton);

      expect(mockNavigate).toHaveBeenCalledWith('Register');
    });

    it('navigates to Login when log in is pressed', () => {
      const { getByText } = render(
        <WelcomeScreen navigation={{ navigate: mockNavigate }} />,
      );

      const loginButton = getByText('Log in');
      fireEvent.press(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });

    it('navigates to Terms of Service when Terms link is pressed', () => {
      const { getByText } = render(
        <WelcomeScreen navigation={{ navigate: mockNavigate }} />,
      );

      const termsLink = getByText('Terms');
      fireEvent.press(termsLink);

      expect(mockNavigate).toHaveBeenCalledWith('TermsOfService');
    });

    it('navigates to Privacy Policy when Privacy link is pressed', () => {
      const { getByText } = render(
        <WelcomeScreen navigation={{ navigate: mockNavigate }} />,
      );

      const privacyLink = getByText('Privacy');
      fireEvent.press(privacyLink);

      expect(mockNavigate).toHaveBeenCalledWith('PrivacyPolicy');
    });
  });

  describe('Accessibility', () => {
    it('has accessible buttons', () => {
      const { getByText } = render(
        <WelcomeScreen navigation={{ navigate: mockNavigate }} />,
      );

      const createAccountButton = getByText('Create an account');
      const loginButton = getByText('Log in');

      // Buttons should be pressable
      expect(createAccountButton).toBeTruthy();
      expect(loginButton).toBeTruthy();
    });
  });
});
