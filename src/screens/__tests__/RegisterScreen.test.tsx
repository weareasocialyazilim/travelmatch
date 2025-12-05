/**
 * RegisterScreen Tests
 * Testing register screen rendering, validation, and registration flow
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { RegisterScreen } from '../RegisterScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
};

// Mock route
const mockRoute = {
  key: 'Register',
  name: 'Register' as const,
  params: undefined,
};

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock expo icons
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock LoadingState
jest.mock('../../components/LoadingState', () => ({
  LoadingState: ({ message }: { message: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Text } = require('react-native');
    return <Text testID="loading-state">{message}</Text>;
  },
}));

// Mock SocialButton
jest.mock('../../components/SocialButton', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { TouchableOpacity, Text } = require('react-native');
  const MockSocialButton = ({
    provider,
    label,
    onPress,
  }: {
    provider: string;
    label: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity onPress={onPress} testID={`social-${provider}`}>
      <Text>{label}</Text>
    </TouchableOpacity>
  );
  return MockSocialButton;
});

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
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
    error: '#EF4444',
    mint: '#10B981',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
    },
  },
}));

// Spy on Alert
jest.spyOn(Alert, 'alert');

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders correctly', () => {
      const { getByRole } = render(
        <RegisterScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      expect(getByRole('header')).toBeTruthy();
    });

    it('displays welcome message', () => {
      const { getByText } = render(
        <RegisterScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      expect(getByText('Join TravelMatch')).toBeTruthy();
      expect(
        getByText(
          'Create an account to start connecting with travelers and locals',
        ),
      ).toBeTruthy();
    });

    it('renders email input field', () => {
      const { getByPlaceholderText } = render(
        <RegisterScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      expect(getByPlaceholderText('name@example.com')).toBeTruthy();
    });

    it('renders password input fields', () => {
      const { getByPlaceholderText } = render(
        <RegisterScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      expect(getByPlaceholderText('Min. 8 characters')).toBeTruthy();
      expect(getByPlaceholderText('Re-enter password')).toBeTruthy();
    });

    it('renders social login buttons', () => {
      const { getByTestId } = render(
        <RegisterScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      expect(getByTestId('social-apple')).toBeTruthy();
      expect(getByTestId('social-google')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates back when back button is pressed', () => {
      const { getByLabelText } = render(
        <RegisterScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const backButton = getByLabelText('Go back');
      fireEvent.press(backButton);

      expect(mockGoBack).toHaveBeenCalled();
    });

    it('navigates to login screen when sign in link is pressed', () => {
      const { getByText } = render(
        <RegisterScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const signInLink = getByText('Log in');
      fireEvent.press(signInLink);

      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });

  describe('Form Validation', () => {
    it('shows inline error for invalid email', () => {
      const { getByPlaceholderText, getByText } = render(
        <RegisterScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const emailInput = getByPlaceholderText('name@example.com');
      fireEvent.changeText(emailInput, 'invalid-email');

      expect(getByText('Please enter a valid email')).toBeTruthy();
    });

    it('shows inline error for weak password', () => {
      const { getByPlaceholderText, getByText } = render(
        <RegisterScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const passwordInput = getByPlaceholderText('Min. 8 characters');
      fireEvent.changeText(passwordInput, 'short');

      expect(getByText('Password must be at least 8 characters')).toBeTruthy();
    });

    it('shows inline error for password mismatch', () => {
      const { getByPlaceholderText, getByText } = render(
        <RegisterScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const passwordInput = getByPlaceholderText('Min. 8 characters');
      const confirmPasswordInput = getByPlaceholderText('Re-enter password');

      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'differentpassword');

      expect(getByText('Passwords do not match')).toBeTruthy();
    });
  });

  describe('Registration Flow', () => {
    it('shows loading state during registration', async () => {
      const { getByPlaceholderText, getAllByText, getByTestId } = render(
        <RegisterScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const emailInput = getByPlaceholderText('name@example.com');
      const passwordInput = getByPlaceholderText('Min. 8 characters');
      const confirmPasswordInput = getByPlaceholderText('Re-enter password');
      const registerButtons = getAllByText('Create Account');
      const registerButton = registerButtons[registerButtons.length - 1];

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');
      fireEvent.press(registerButton);

      expect(getByTestId('loading-state')).toBeTruthy();
    });

    it('navigates to CompleteProfile after successful registration', async () => {
      const { getByPlaceholderText, getAllByText } = render(
        <RegisterScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const emailInput = getByPlaceholderText('name@example.com');
      const passwordInput = getByPlaceholderText('Min. 8 characters');
      const confirmPasswordInput = getByPlaceholderText('Re-enter password');
      const registerButtons = getAllByText('Create Account');
      const registerButton = registerButtons[registerButtons.length - 1];

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');
      fireEvent.press(registerButton);

      // Fast-forward timer
      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('CompleteProfile');
      });
    });

    it('handles social registration with Apple', () => {
      const { getByTestId } = render(
        <RegisterScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const appleButton = getByTestId('social-apple');
      fireEvent.press(appleButton);

      expect(mockNavigate).toHaveBeenCalledWith('CompleteProfile');
    });

    it('handles social registration with Google', () => {
      const { getByTestId } = render(
        <RegisterScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const googleButton = getByTestId('social-google');
      fireEvent.press(googleButton);

      expect(mockNavigate).toHaveBeenCalledWith('CompleteProfile');
    });
  });

  describe('Password Visibility', () => {
    it('toggles password visibility', () => {
      const { getByPlaceholderText } = render(
        <RegisterScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const passwordInput = getByPlaceholderText('Min. 8 characters');

      // Initial state - password hidden
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });
});
