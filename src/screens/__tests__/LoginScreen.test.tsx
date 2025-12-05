/**
 * LoginScreen Tests
 * Testing login screen rendering, validation, and authentication flow
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { LoginScreen } from '../LoginScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  reset: mockReset,
};

// Mock route
const mockRoute = {
  key: 'Login',
  name: 'Login' as const,
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

describe('LoginScreen', () => {
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
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      expect(getByRole('header')).toBeTruthy();
    });

    it('displays welcome message', () => {
      const { getByText } = render(
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      expect(getByText('Welcome Back')).toBeTruthy();
      expect(
        getByText('Sign in to continue exploring and connecting'),
      ).toBeTruthy();
    });

    it('renders email input field', () => {
      const { getByPlaceholderText } = render(
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      expect(getByPlaceholderText('name@example.com')).toBeTruthy();
    });

    it('renders password input field', () => {
      const { getByPlaceholderText } = render(
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    });

    it('renders social login buttons', () => {
      const { getByTestId } = render(
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      expect(getByTestId('social-apple')).toBeTruthy();
      expect(getByTestId('social-google')).toBeTruthy();
    });

    it('renders forgot password link', () => {
      const { getByText } = render(
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      expect(getByText('Forgot your password?')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates back when back button is pressed', () => {
      const { getByLabelText } = render(
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const backButton = getByLabelText('Go back');
      fireEvent.press(backButton);

      expect(mockGoBack).toHaveBeenCalled();
    });

    it('navigates to forgot password screen', () => {
      const { getByText } = render(
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const forgotPasswordLink = getByText('Forgot your password?');
      fireEvent.press(forgotPasswordLink);

      expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
    });

    it('navigates to register screen when sign up link is pressed', () => {
      const { getByText } = render(
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const signUpLink = getByText('Sign up');
      fireEvent.press(signUpLink);

      expect(mockNavigate).toHaveBeenCalledWith('Register');
    });
  });

  describe('Form Validation', () => {
    it('button is disabled for invalid email', () => {
      const { getByPlaceholderText, getByLabelText } = render(
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const emailInput = getByPlaceholderText('name@example.com');
      const passwordInput = getByPlaceholderText('Enter your password');
      const loginButton = getByLabelText('Log in to your account');

      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'password123');

      // Button should be disabled for invalid form
      expect(loginButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('button is enabled for valid form', () => {
      const { getByPlaceholderText, getByLabelText } = render(
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const emailInput = getByPlaceholderText('name@example.com');
      const passwordInput = getByPlaceholderText('Enter your password');
      const loginButton = getByLabelText('Log in to your account');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'validpassword');

      // Button should be enabled for valid form
      expect(loginButton.props.accessibilityState?.disabled).toBe(false);
    });
  });

  describe('Authentication Flow', () => {
    it('shows loading state during login', async () => {
      const { getByPlaceholderText, getByLabelText, getByTestId } = render(
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const emailInput = getByPlaceholderText('name@example.com');
      const passwordInput = getByPlaceholderText('Enter your password');
      const loginButton = getByLabelText('Log in to your account');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      expect(getByTestId('loading-state')).toBeTruthy();
    });

    it('navigates to Discover after successful login', async () => {
      const { getByPlaceholderText, getByLabelText } = render(
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const emailInput = getByPlaceholderText('name@example.com');
      const passwordInput = getByPlaceholderText('Enter your password');
      const loginButton = getByLabelText('Log in to your account');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      // Fast-forward timer
      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(mockReset).toHaveBeenCalledWith({
          index: 0,
          routes: [{ name: 'Discover' }],
        });
      });
    });

    it('handles social login with Apple', () => {
      const { getByTestId } = render(
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const appleButton = getByTestId('social-apple');
      fireEvent.press(appleButton);

      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Discover' }],
      });
    });

    it('handles social login with Google', () => {
      const { getByTestId } = render(
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const googleButton = getByTestId('social-google');
      fireEvent.press(googleButton);

      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Discover' }],
      });
    });
  });

  describe('Password Visibility', () => {
    it('toggles password visibility', () => {
      const { getByPlaceholderText, getByLabelText } = render(
        <LoginScreen navigation={mockNavigation as any} route={mockRoute} />,
      );

      const passwordInput = getByPlaceholderText('Enter your password');

      // Initial state - password hidden
      expect(passwordInput.props.secureTextEntry).toBe(true);

      // Toggle visibility
      const toggleButton = getByLabelText('Show password');
      fireEvent.press(toggleButton);

      // Password should now be visible
      expect(passwordInput.props.secureTextEntry).toBe(false);
    });
  });
});
