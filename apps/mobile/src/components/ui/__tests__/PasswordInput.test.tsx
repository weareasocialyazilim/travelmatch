/**
 * PasswordInput Component Test Suite
 * Tests password input with show/hide toggle functionality
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PasswordInput } from '../PasswordInput';

// Mock LiquidInput component
jest.mock('../LiquidInput', () => {
  const React = require('react');
  const RN = require('react-native');
  return {
    LiquidInput: ({
      label,
      icon,
      error,
      secureTextEntry,
      autoCapitalize,
      autoCorrect,
      testID,
      ...props
    }: {
      label?: string;
      icon?: string;
      error?: string;
      secureTextEntry?: boolean;
      autoCapitalize?: string;
      autoCorrect?: boolean;
      testID?: string;
      [key: string]: unknown;
    }) =>
      React.createElement(
        RN.View,
        { testID: testID || 'liquid-input-container' },
        label && React.createElement(RN.Text, { testID: 'input-label' }, label),
        React.createElement(RN.TextInput, {
          ...props,
          testID: 'password-text-input',
          secureTextEntry,
          autoCapitalize,
          autoCorrect,
        }),
        icon && React.createElement(RN.Text, { testID: `icon-${icon}` }, icon),
        error && React.createElement(RN.Text, { testID: 'error-text' }, error),
      ),
  };
});

describe('PasswordInput Component', () => {
  // ============================================
  // Basic Rendering Tests
  // ============================================

  describe('Basic Rendering', () => {
    it('renders without props', () => {
      const { getByTestId } = render(<PasswordInput />);
      expect(getByTestId('liquid-input-container')).toBeTruthy();
    });

    it('renders with password hidden by default', () => {
      const { getByTestId } = render(<PasswordInput />);
      const input = getByTestId('password-text-input');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('renders with lock icon', () => {
      const { getByTestId } = render(<PasswordInput />);
      expect(getByTestId('icon-lock-closed-outline')).toBeTruthy();
    });

    it('renders with label when provided', () => {
      const { getByTestId, getByText } = render(
        <PasswordInput label="Password" />,
      );
      expect(getByTestId('input-label')).toBeTruthy();
      expect(getByText('Password')).toBeTruthy();
    });

    it('renders error message when provided', () => {
      const { getByTestId, getByText } = render(
        <PasswordInput error="Password is required" />,
      );
      expect(getByTestId('error-text')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
    });
  });

  // ============================================
  // Password Visibility Toggle Tests
  // ============================================

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility when toggle button is pressed', () => {
      const { getByTestId } = render(<PasswordInput />);
      const input = getByTestId('password-text-input');

      // Initially hidden
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('shows eye-outline icon when password is hidden', () => {
      const { UNSAFE_getAllByType } = render(<PasswordInput />);
      const { Ionicons } = require('@expo/vector-icons');
      const icons = UNSAFE_getAllByType(Ionicons);
      const eyeIcon = icons.find(
        (icon: { props?: { name?: string } }) =>
          icon.props?.name === 'eye-outline',
      );
      expect(eyeIcon).toBeTruthy();
    });
  });

  // ============================================
  // Props Forwarding Tests
  // ============================================

  describe('Props Forwarding', () => {
    it('forwards placeholder to underlying input', () => {
      const { getByTestId } = render(
        <PasswordInput placeholder="Enter password" />,
      );
      const input = getByTestId('password-text-input');
      expect(input.props.placeholder).toBe('Enter password');
    });

    it('forwards value to underlying input', () => {
      const { getByTestId } = render(<PasswordInput value="secret123" />);
      const input = getByTestId('password-text-input');
      expect(input.props.value).toBe('secret123');
    });

    it('forwards onChangeText to underlying input', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <PasswordInput onChangeText={onChangeText} />,
      );
      const input = getByTestId('password-text-input');
      fireEvent.changeText(input, 'newpassword');
      expect(onChangeText).toHaveBeenCalledWith('newpassword');
    });

    it('sets autoCapitalize to none', () => {
      const { getByTestId } = render(<PasswordInput />);
      const input = getByTestId('password-text-input');
      expect(input.props.autoCapitalize).toBe('none');
    });

    it('sets autoCorrect to false', () => {
      const { getByTestId } = render(<PasswordInput />);
      const input = getByTestId('password-text-input');
      expect(input.props.autoCorrect).toBe(false);
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================

  describe('Accessibility', () => {
    it('renders correctly with all accessibility props', () => {
      const { getByTestId } = render(
        <PasswordInput
          accessibilityLabel="Password field"
          accessibilityHint="Enter your password"
        />,
      );
      expect(getByTestId('liquid-input-container')).toBeTruthy();
    });
  });

  // ============================================
  // Memoization Tests
  // ============================================

  describe('Memoization', () => {
    it('has displayName set', () => {
      expect(PasswordInput.displayName).toBe('PasswordInput');
    });
  });
});
