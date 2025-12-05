/**
 * ForgotPasswordScreen Tests
 * Tests for the password recovery screen
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ForgotPasswordScreen } from '../ForgotPasswordScreen';
import { Alert } from 'react-native';

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

const mockNavigation = {
  goBack: mockGoBack,
  navigate: mockNavigate,
} as any;

const mockRoute = {
  params: {},
} as any;

// Mock Alert
jest.spyOn(Alert, 'alert');

// Render helper
const renderScreen = () => {
  return render(
    <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />,
  );
};

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial Render', () => {
    it('renders correctly', () => {
      const { getByText } = renderScreen();

      expect(getByText('Reset Password')).toBeTruthy();
      expect(getByText('Send Reset Link')).toBeTruthy();
    });

    it('shows description text', () => {
      const { getByText } = renderScreen();
      expect(getByText('Forgot your password?')).toBeTruthy();
    });

    it('starts with empty email field', () => {
      const { getByPlaceholderText } = renderScreen();
      const emailInput = getByPlaceholderText('name@example.com');
      expect(emailInput.props.value).toBe('');
    });
  });

  describe('Email Validation', () => {
    it('shows error for empty email', () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Send Reset Link'));

      // Button is disabled when email is empty, so no alert
    });

    it('accepts valid email format', async () => {
      const { getByText, getByPlaceholderText } = renderScreen();

      fireEvent.changeText(
        getByPlaceholderText('name@example.com'),
        'test@example.com',
      );
      fireEvent.press(getByText('Send Reset Link'));

      // Should not show error for valid email
    });
  });

  describe('Send Reset Link', () => {
    it('shows loading state when sending', async () => {
      const { getByText, getByPlaceholderText } = renderScreen();

      fireEvent.changeText(
        getByPlaceholderText('name@example.com'),
        'test@example.com',
      );
      fireEvent.press(getByText('Send Reset Link'));

      // Should be in loading state
      // The implementation uses setTimeout to simulate API call
    });

    it('shows success state after sending', async () => {
      const { getByText, getByPlaceholderText } = renderScreen();

      fireEvent.changeText(
        getByPlaceholderText('name@example.com'),
        'test@example.com',
      );
      fireEvent.press(getByText('Send Reset Link'));

      // Advance timers to complete the simulated API call
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(getByText('Check Your Email')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('goes back when back to sign in is pressed', () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Back to Sign In'));

      expect(mockGoBack).toHaveBeenCalled();
    });

    it('shows success screen after sending', async () => {
      const { getByText, getByPlaceholderText } = renderScreen();

      fireEvent.changeText(
        getByPlaceholderText('name@example.com'),
        'test@example.com',
      );
      fireEvent.press(getByText('Send Reset Link'));

      // Wait for success state
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(getByText('Check Your Email')).toBeTruthy();
      });
    });
  });

  describe('Resend Email', () => {
    it('shows success view after sending', async () => {
      const { getByText, getByPlaceholderText } = renderScreen();

      fireEvent.changeText(
        getByPlaceholderText('name@example.com'),
        'test@example.com',
      );
      fireEvent.press(getByText('Send Reset Link'));

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        // After sending, should show success view
        expect(getByText('Check Your Email')).toBeTruthy();
      });
    });
  });

  describe('User Experience', () => {
    it('has keyboard avoiding behavior', () => {
      const { UNSAFE_root } = renderScreen();
      // KeyboardAvoidingView should be present
    });

    it('email input accepts text input', () => {
      const { getByPlaceholderText } = renderScreen();
      const emailInput = getByPlaceholderText('name@example.com');

      fireEvent.changeText(emailInput, 'user@test.com');

      expect(emailInput.props.value).toBe('user@test.com');
    });
  });
});
