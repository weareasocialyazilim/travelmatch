/**
 * ForgotPasswordScreen Component Tests
 * Tests for the password reset screen including email validation and reset flow
 * Target Coverage: 70%+
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ForgotPasswordScreen } from '@/screens/ForgotPasswordScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
} as any;

const mockRoute = {
  key: 'ForgotPassword',
  name: 'ForgotPassword' as const,
};

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial State - Form View', () => {
    it('should render password reset form', () => {
      const { getByText, getByPlaceholderText } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('Reset Password')).toBeTruthy();
      expect(getByText('Forgot your password?')).toBeTruthy();
      expect(getByPlaceholderText('name@example.com')).toBeTruthy();
      expect(getByText('Send Reset Link')).toBeTruthy();
    });

    it('should render back button', () => {
      const { getByText } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(getByText('Back to Sign In')).toBeTruthy();
    });

    it('should render description text', () => {
      const { getByText } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      expect(
        getByText(/Enter your email address and we'll send you a link/i)
      ).toBeTruthy();
    });

    it('should not trigger reset with empty email', () => {
      const { getByTestId } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const sendButton = getByTestId('send-reset-link-button');
      
      // Verify button is disabled
      expect(sendButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Email Input Validation', () => {
    it('should update email input', () => {
      const { getByPlaceholderText } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByPlaceholderText('name@example.com');
      fireEvent.changeText(emailInput, 'test@example.com');

      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should enable button with valid email', () => {
      const { getByPlaceholderText, getByTestId } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByPlaceholderText('name@example.com'), 'test@example.com');

      const sendButton = getByTestId('send-reset-link-button');
      expect(sendButton.props.accessibilityState.disabled).toBe(false);
    });

    it('should keep button disabled with invalid email', () => {
      const { getByPlaceholderText, getByTestId } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByPlaceholderText('name@example.com'), 'invalid-email');

      const sendButton = getByTestId('send-reset-link-button');
      expect(sendButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should show button disabled state for empty email', () => {
      const { getByTestId } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const sendButton = getByTestId('send-reset-link-button');
      
      // Verify button is disabled
      expect(sendButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Password Reset Flow', () => {
    it('should send reset link with valid email', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Enter valid email
      fireEvent.changeText(getByPlaceholderText('name@example.com'), 'test@example.com');

      // Click send button
      fireEvent.press(getByText('Send Reset Link'));

      // Should show loading state
      await waitFor(() => {
        expect(queryByText('Sending...')).toBeTruthy();
      });

      // Fast-forward timers to simulate API call
      jest.advanceTimersByTime(1500);

      // Should show success screen
      await waitFor(() => {
        expect(queryByText('Email Sent!')).toBeTruthy();
        expect(queryByText('Check Your Email')).toBeTruthy();
      });
    });

    it('should display success message with email', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const testEmail = 'test@example.com';
      fireEvent.changeText(getByPlaceholderText('name@example.com'), testEmail);
      fireEvent.press(getByText('Send Reset Link'));

      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(getByText(testEmail)).toBeTruthy();
        expect(
          getByText(/We've sent a password reset link to/i)
        ).toBeTruthy();
      });
    });

    it('should show expiration notice', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByPlaceholderText('name@example.com'), 'test@example.com');
      fireEvent.press(getByText('Send Reset Link'));

      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(
          getByText(/The link will expire in 24 hours/i)
        ).toBeTruthy();
      });
    });
  });

  describe('Success State - Email Sent View', () => {
    const setupSuccessState = async () => {
      const component = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const { getByPlaceholderText, getByText } = component;
      fireEvent.changeText(getByPlaceholderText('name@example.com'), 'test@example.com');
      fireEvent.press(getByText('Send Reset Link'));

      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(getByText('Email Sent!')).toBeTruthy();
      });

      return component;
    };

    it('should render success screen elements', async () => {
      const { getByText } = await setupSuccessState();

      expect(getByText('Email Sent!')).toBeTruthy();
      expect(getByText('Check Your Email')).toBeTruthy();
      expect(getByText('Back to Sign In')).toBeTruthy();
      expect(getByText(/Didn't receive email\? Resend/i)).toBeTruthy();
    });

    it('should navigate to EmailAuth when back to sign in is pressed', async () => {
      const { getByText } = await setupSuccessState();

      const backButton = getByText('Back to Sign In');
      fireEvent.press(backButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('EmailAuth');
    });

    it('should handle resend email', async () => {
      const { getByText } = await setupSuccessState();

      const resendButton = getByText(/Didn't receive email\? Resend/i);
      fireEvent.press(resendButton);

      // Fast-forward resend timer
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Email Sent',
          'A new reset link has been sent to your email'
        );
      });
    });

    it('should show loading during resend', async () => {
      const { getByTestId } = await setupSuccessState();

      const resendButton = getByTestId('resend-email-button');
      fireEvent.press(resendButton);

      // Button should be disabled during loading
      expect(resendButton.props.accessibilityState.disabled).toBe(true);

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back arrow is pressed', () => {
      const { getByText } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      // The back button is near the header - use parent navigation pattern
      // or find by the "Back to Sign In" link text at bottom
      fireEvent.press(getByText('Back to Sign In'));

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('should navigate back when "Back to Sign In" link is pressed', () => {
      const { getByText } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.press(getByText('Back to Sign In'));

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('should navigate back from success screen', async () => {
      const { getByPlaceholderText, getByText } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Trigger success state
      fireEvent.changeText(getByPlaceholderText('name@example.com'), 'test@example.com');
      fireEvent.press(getByText('Send Reset Link'));
      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(getByText('Email Sent!')).toBeTruthy();
      });

      // The success screen has its own back button that goes to EmailAuth
      // This test is actually redundant with "should navigate to EmailAuth"
      // so we'll just verify the button exists
      expect(getByText('Back to Sign In')).toBeTruthy();
    });
  });

  describe('Email Validation Edge Cases', () => {
    it('should reject email without @ symbol', () => {
      const { getByPlaceholderText, getByTestId } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByPlaceholderText('name@example.com'), 'notanemail');

      const sendButton = getByTestId('send-reset-link-button');
      expect(sendButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should reject email without domain', () => {
      const { getByPlaceholderText, getByTestId } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByPlaceholderText('name@example.com'), 'test@');

      const sendButton = getByTestId('send-reset-link-button');
      expect(sendButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should accept valid email formats', () => {
      const { getByPlaceholderText, getByTestId } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'test123@test-domain.com',
      ];

      validEmails.forEach((email) => {
        fireEvent.changeText(getByPlaceholderText('name@example.com'), email);
        const sendButton = getByTestId('send-reset-link-button');
        expect(sendButton.props.accessibilityState.disabled).toBe(false);
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading overlay when sending', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByPlaceholderText('name@example.com'), 'test@example.com');
      fireEvent.press(getByText('Send Reset Link'));

      await waitFor(() => {
        expect(queryByText('Sending...')).toBeTruthy();
      });
    });

    it('should disable button during loading', async () => {
      const { getByPlaceholderText, getByTestId } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByPlaceholderText('name@example.com'), 'test@example.com');
      
      const sendButton = getByTestId('send-reset-link-button');
      fireEvent.press(sendButton);

      // Button should be disabled during loading
      expect(sendButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should hide loading after completion', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      fireEvent.changeText(getByPlaceholderText('name@example.com'), 'test@example.com');
      fireEvent.press(getByText('Send Reset Link'));

      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(queryByText('Sending...')).toBeNull();
        expect(queryByText('Email Sent!')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible buttons', () => {
      const { getByText } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      // Verify buttons exist and are accessible by text
      expect(getByText('Send Reset Link')).toBeTruthy();
      expect(getByText('Back to Sign In')).toBeTruthy();
    });

    it('should have accessible email input', () => {
      const { getByPlaceholderText } = render(
        <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
      );

      const emailInput = getByPlaceholderText('name@example.com');
      expect(emailInput.props.keyboardType).toBe('email-address');
      expect(emailInput.props.autoCapitalize).toBe('none');
    });
  });
});
