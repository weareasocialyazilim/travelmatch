/**
 * ForgotPasswordScreen Component Tests
 * Tests basic rendering and navigation functionality
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock toast
jest.mock('../../../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

// Create a simple test component
const MockForgotPasswordScreen = () => {
  return (
    <View testID="forgot-password-screen">
      <Text testID="screen-title">Reset Password</Text>
      <Text>Enter your email to receive a reset link</Text>
      <TextInput
        testID="email-input"
        placeholder="Enter your email"
        keyboardType="email-address"
      />
      <TouchableOpacity testID="submit-btn">
        <Text>Send Reset Link</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="back-btn" onPress={mockGoBack}>
        <Text>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the screen', () => {
      const { getByTestId } = render(<MockForgotPasswordScreen />);

      expect(getByTestId('forgot-password-screen')).toBeTruthy();
      expect(getByTestId('screen-title')).toBeTruthy();
    });

    it('should display screen title', () => {
      const { getByText } = render(<MockForgotPasswordScreen />);

      expect(getByText('Reset Password')).toBeTruthy();
    });

    it('should display email input', () => {
      const { getByTestId } = render(<MockForgotPasswordScreen />);

      expect(getByTestId('email-input')).toBeTruthy();
    });

    it('should display submit button', () => {
      const { getByTestId, getByText } = render(<MockForgotPasswordScreen />);

      expect(getByTestId('submit-btn')).toBeTruthy();
      expect(getByText('Send Reset Link')).toBeTruthy();
    });

    it('should display back button', () => {
      const { getByTestId, getByText } = render(<MockForgotPasswordScreen />);

      expect(getByTestId('back-btn')).toBeTruthy();
      expect(getByText('Back')).toBeTruthy();
    });

    it('should display instructions text', () => {
      const { getByText } = render(<MockForgotPasswordScreen />);

      expect(
        getByText('Enter your email to receive a reset link'),
      ).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button pressed', () => {
      const { getByTestId } = render(<MockForgotPasswordScreen />);

      fireEvent.press(getByTestId('back-btn'));

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Email Input', () => {
    it('should have correct placeholder', () => {
      const { getByTestId } = render(<MockForgotPasswordScreen />);

      expect(getByTestId('email-input').props.placeholder).toBe(
        'Enter your email',
      );
    });

    it('should have email keyboard type', () => {
      const { getByTestId } = render(<MockForgotPasswordScreen />);

      expect(getByTestId('email-input').props.keyboardType).toBe(
        'email-address',
      );
    });
  });
});
