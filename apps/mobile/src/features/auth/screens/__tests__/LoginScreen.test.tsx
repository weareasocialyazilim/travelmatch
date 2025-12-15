/**
 * LoginScreen Component Tests
 * Tests for the login screen including form validation, authentication flow, and error handling
 * Target Coverage: 70%+
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/utils/logger';
import * as friendlyErrorHandler from '@/utils/friendlyErrorHandler';

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('@/utils/logger');
jest.mock('@/utils/friendlyErrorHandler');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
} as any;

const mockRoute = {
  key: 'Login',
  name: 'Login' as const,
};

describe('LoginScreen', () => {
  const mockLogin = jest.fn();
  const mockUseAuth = useAuth ;
  const mockLogger = logger ;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      logout: jest.fn(),
      user: null,
      loading: false,
      register: jest.fn(),
    } as any);

    // Mock friendlyErrorHandler functions
    // validateEmail returns true/false for inline validation, throws for form submission validation
    (friendlyErrorHandler.validateEmail ) = jest.fn((email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    });
    (friendlyErrorHandler.validateRequired ) = jest.fn((value, field) => {
      if (!value || value.trim() === '') {
        throw new Error(`${field} is required`);
      }
      return true;
    });
    (friendlyErrorHandler.showErrorAlert ) = jest.fn();
  });

  describe('Rendering', () => {
    it('should render all form elements', () => {
      const { getByLabelText, getByRole } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByLabelText('Email address')).toBeTruthy();
      expect(getByLabelText('Password')).toBeTruthy();
      expect(getByLabelText('Log in to your account')).toBeTruthy();
    });

    it('should render social login buttons', () => {
      const { getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Social login section should be present
      expect(getByText(/or login with email/i)).toBeTruthy();
    });

    it('should render sign up link', () => {
      const { getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText(/Sign up/i)).toBeTruthy();
    });

    it('should render back button', () => {
      const { getByLabelText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByLabelText('Go back')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should update email input', () => {
      const { getByLabelText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByLabelText('Email address');
      fireEvent.changeText(emailInput, 'test@example.com');

      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should update password input', () => {
      const { getByLabelText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const passwordInput = getByLabelText('Password');
      fireEvent.changeText(passwordInput, 'password123');

      expect(passwordInput.props.value).toBe('password123');
    });

    it('should toggle password visibility', () => {
      const { getByLabelText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const passwordInput = getByLabelText('Password');
      const toggleButton = getByLabelText('Show password');

      // Initially password should be hidden
      expect(passwordInput.props.secureTextEntry).toBe(true);

      // Toggle to show password
      fireEvent.press(toggleButton);
      
      const hideButton = getByLabelText('Hide password');
      expect(passwordInput.props.secureTextEntry).toBe(false);

      // Toggle back to hide password
      fireEvent.press(hideButton);
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });

  describe('Authentication Flow', () => {
    it('should handle successful login', async () => {
      mockLogin.mockResolvedValue({ success: true });

      const { getByLabelText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill in form
      fireEvent.changeText(getByLabelText('Email address'), 'test@example.com');
      fireEvent.changeText(getByLabelText('Password'), 'password123');

      // Submit form
      const loginButton = getByLabelText('Log in to your account');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Should navigate to Discover screen
      await waitFor(() => {
        expect(mockNavigation.reset).toHaveBeenCalledWith({
          index: 0,
          routes: [{ name: 'Discover' }],
        });
      });
    });

    it('should handle login failure', async () => {
      mockLogin.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      const { getByLabelText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill in form
      fireEvent.changeText(getByLabelText('Email address'), 'test@example.com');
      fireEvent.changeText(getByLabelText('Password'), 'wrongpassword');

      // Submit form
      fireEvent.press(getByLabelText('Log in to your account'));

      await waitFor(() => {
        expect(friendlyErrorHandler.showErrorAlert).toHaveBeenCalled();
      });
    });

    it('should validate email before login', async () => {
      const { getByLabelText, queryByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill in invalid email
      fireEvent.changeText(getByLabelText('Email address'), 'invalid-email');
      fireEvent.changeText(getByLabelText('Password'), 'password123');

      // Should show validation error inline
      await waitFor(() => {
        expect(queryByText('Please enter a valid email')).toBeTruthy();
      });

      // Login button should be disabled for invalid email
      const loginButton = getByLabelText('Log in to your account');
      expect(loginButton.props.accessibilityState.disabled).toBe(true);
      
      // Login should not be called when form is invalid
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const { getByLabelText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Login button should be disabled when fields are empty
      const loginButton = getByLabelText('Log in to your account');
      expect(loginButton.props.accessibilityState.disabled).toBe(true);

      // Fill in only email
      fireEvent.changeText(getByLabelText('Email address'), 'test@example.com');
      
      // Still disabled without password
      expect(loginButton.props.accessibilityState.disabled).toBe(true);
      
      // Login should not be called when form is incomplete
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should show loading state during login', async () => {
      mockLogin.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      const { getByLabelText, queryByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Fill in form
      fireEvent.changeText(getByLabelText('Email address'), 'test@example.com');
      fireEvent.changeText(getByLabelText('Password'), 'password123');

      // Submit form
      fireEvent.press(getByLabelText('Log in to your account'));

      // Loading state should appear
      await waitFor(() => {
        expect(queryByText('Logging in...')).toBeTruthy();
      });

      // Wait for login to complete
      await waitFor(() => {
        expect(mockNavigation.reset).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is pressed', () => {
      const { getByLabelText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const backButton = getByLabelText('Go back');
      fireEvent.press(backButton);

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('should navigate to register screen when sign up is pressed', () => {
      const { getByLabelText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const signUpLink = getByLabelText('Sign up for an account');
      fireEvent.press(signUpLink);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
    });

    it('should navigate to forgot password screen', () => {
      const { getByLabelText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const forgotPasswordLink = getByLabelText('Forgot your password? Tap to reset');
      fireEvent.press(forgotPasswordLink);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
    });
  });

  describe('Social Login', () => {
    it('should handle Google social login', () => {
      const { getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const googleButton = getByText(/Continue with Google/i);
      fireEvent.press(googleButton);

      // Should navigate to Discover after successful social login
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Discover' }],
      });
      expect(mockLogger.debug).toHaveBeenCalledWith('Social login:', 'google');
    });

    it('should handle Apple social login', () => {
      const { getByText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const appleButton = getByText(/Continue with Apple/i);
      fireEvent.press(appleButton);

      // Should navigate to Discover after successful social login
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Discover' }],
      });
      expect(mockLogger.debug).toHaveBeenCalledWith('Social login:', 'apple');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockLogin.mockRejectedValue(new Error('Network error'));

      const { getByLabelText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByLabelText('Email address'), 'test@example.com');
      fireEvent.changeText(getByLabelText('Password'), 'password123');

      fireEvent.press(getByLabelText('Log in to your account'));

      await waitFor(() => {
        expect(mockLogger.error).toHaveBeenCalled();
        expect(friendlyErrorHandler.showErrorAlert).toHaveBeenCalled();
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      mockLogin.mockRejectedValue(new Error('Unexpected error'));

      const { getByLabelText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByLabelText('Email address'), 'test@example.com');
      fireEvent.changeText(getByLabelText('Password'), 'password123');

      fireEvent.press(getByLabelText('Log in to your account'));

      await waitFor(() => {
        expect(mockLogger.error).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByLabelText('Go back')).toBeTruthy();
      expect(getByLabelText(/Show password|Hide password/i)).toBeTruthy();
    });

    it('should have header with proper role', () => {
      const { getByRole } = render(
        <LoginScreen navigation={mockNavigation} route={mockRoute} />
      );

      const header = getByRole('header');
      expect(header).toBeTruthy();
      expect(header.props.children).toBe('Log In');
    });
  });
});
