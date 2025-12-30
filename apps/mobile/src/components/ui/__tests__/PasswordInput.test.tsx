/**
 * PasswordInput Component Test Suite
 * Tests password input with show/hide toggle functionality
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PasswordInput } from '../PasswordInput';

// Mock Input component
jest.mock('../Input', () => {
  const React = require('react');
  const RN = require('react-native');
  return {
    Input: ({
      leftIcon,
      rightIcon,
      onRightIconPress,
      secureTextEntry,
      autoCapitalize,
      autoCorrect,
      ...props
    }: {
      leftIcon?: string;
      rightIcon?: string;
      onRightIconPress?: () => void;
      secureTextEntry?: boolean;
      autoCapitalize?: string;
      autoCorrect?: boolean;
      [key: string]: unknown;
    }) =>
      React.createElement(
        RN.View,
        { testID: 'input-container' },
        React.createElement(RN.TextInput, {
          ...props,
          testID: 'text-input',
          secureTextEntry,
        }),
        leftIcon &&
          React.createElement(
            RN.Text,
            { testID: `left-icon-${leftIcon}` },
            leftIcon
          ),
        rightIcon &&
          React.createElement(
            RN.TouchableOpacity,
            { onPress: onRightIconPress, testID: `right-icon-${rightIcon}` },
            React.createElement(RN.Text, null, rightIcon)
          ),
        React.createElement(
          RN.Text,
          { testID: `auto-capitalize-${autoCapitalize}` },
          autoCapitalize
        ),
        React.createElement(
          RN.Text,
          { testID: `auto-correct-${autoCorrect}` },
          String(autoCorrect)
        )
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
      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('renders with password hidden by default', () => {
      const { getByTestId } = render(<PasswordInput />);
      const input = getByTestId('text-input');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('renders with lock icon on left', () => {
      const { getByTestId } = render(<PasswordInput />);
      expect(getByTestId('left-icon-lock-outline')).toBeTruthy();
    });

    it('renders with eye icon on right by default', () => {
      const { getByTestId } = render(<PasswordInput />);
      expect(getByTestId('right-icon-eye-outline')).toBeTruthy();
    });

    it('sets autoCapitalize to none', () => {
      const { getByTestId } = render(<PasswordInput />);
      expect(getByTestId('auto-capitalize-none')).toBeTruthy();
    });

    it('sets autoCorrect to false', () => {
      const { getByTestId } = render(<PasswordInput />);
      expect(getByTestId('auto-correct-false')).toBeTruthy();
    });
  });

  // ============================================
  // Toggle Visibility Tests
  // ============================================

  describe('Toggle Visibility', () => {
    it('toggles password visibility when eye icon pressed', () => {
      const { getByTestId, queryByTestId } = render(<PasswordInput />);

      // Initially hidden
      expect(getByTestId('text-input').props.secureTextEntry).toBe(true);
      expect(getByTestId('right-icon-eye-outline')).toBeTruthy();

      // Press to show
      fireEvent.press(getByTestId('right-icon-eye-outline'));

      // Now visible
      expect(getByTestId('text-input').props.secureTextEntry).toBe(false);
      expect(getByTestId('right-icon-eye-off-outline')).toBeTruthy();
      expect(queryByTestId('right-icon-eye-outline')).toBeNull();
    });

    it('toggles back to hidden when pressed again', () => {
      const { getByTestId } = render(<PasswordInput />);

      // Show password
      fireEvent.press(getByTestId('right-icon-eye-outline'));
      expect(getByTestId('text-input').props.secureTextEntry).toBe(false);

      // Hide password
      fireEvent.press(getByTestId('right-icon-eye-off-outline'));
      expect(getByTestId('text-input').props.secureTextEntry).toBe(true);
      expect(getByTestId('right-icon-eye-outline')).toBeTruthy();
    });

    it('toggles multiple times correctly', () => {
      const { getByTestId } = render(<PasswordInput />);

      for (let i = 0; i < 5; i++) {
        const isHidden = i % 2 === 0;
        const iconTestId = isHidden
          ? 'right-icon-eye-outline'
          : 'right-icon-eye-off-outline';

        expect(getByTestId('text-input').props.secureTextEntry).toBe(isHidden);
        expect(getByTestId(iconTestId)).toBeTruthy();

        fireEvent.press(getByTestId(iconTestId));
      }
    });
  });

  // ============================================
  // Props Tests
  // ============================================

  describe('Props', () => {
    it('renders with label', () => {
      const { getByTestId } = render(<PasswordInput label="Password" />);
      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('renders with error', () => {
      const { getByTestId } = render(
        <PasswordInput error="Password is required" />
      );
      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('renders with helperText', () => {
      const { getByTestId } = render(
        <PasswordInput helperText="At least 8 characters" />
      );
      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('renders with required flag', () => {
      const { getByTestId } = render(<PasswordInput required />);
      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('renders with showSuccess flag', () => {
      const { getByTestId } = render(<PasswordInput showSuccess />);
      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('renders with placeholder', () => {
      const { getByTestId } = render(
        <PasswordInput placeholder="Enter password" />
      );
      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('renders with value', () => {
      const { getByTestId } = render(<PasswordInput value="secret123" />);
      expect(getByTestId('input-container')).toBeTruthy();
    });
  });

  // ============================================
  // Event Handler Tests
  // ============================================

  describe('Event Handlers', () => {
    it('calls onChangeText when text changes', () => {
      const onChangeText = jest.fn() as jest.Mock;
      const { getByTestId } = render(
        <PasswordInput onChangeText={onChangeText} />
      );

      fireEvent.changeText(getByTestId('text-input'), 'password123');
      expect(onChangeText).toHaveBeenCalledWith('password123');
    });

    it('calls onBlur when input loses focus', () => {
      const onBlur = jest.fn() as jest.Mock;
      const { getByTestId } = render(<PasswordInput onBlur={onBlur} />);

      fireEvent(getByTestId('text-input'), 'blur');
      expect(onBlur).toHaveBeenCalled();
    });

    it('calls onFocus when input gains focus', () => {
      const onFocus = jest.fn() as jest.Mock;
      const { getByTestId } = render(<PasswordInput onFocus={onFocus} />);

      fireEvent(getByTestId('text-input'), 'focus');
      expect(onFocus).toHaveBeenCalled();
    });

    it('calls onSubmitEditing when submitted', () => {
      const onSubmitEditing = jest.fn() as jest.Mock;
      const { getByTestId } = render(
        <PasswordInput onSubmitEditing={onSubmitEditing} />
      );

      fireEvent(getByTestId('text-input'), 'submitEditing');
      expect(onSubmitEditing).toHaveBeenCalled();
    });
  });

  // ============================================
  // Combination Tests
  // ============================================

  describe('Combinations', () => {
    it('renders with all props', () => {
      const onChangeText = jest.fn() as jest.Mock;
      const { getByTestId } = render(
        <PasswordInput
          label="Password"
          placeholder="Enter password"
          value="secret"
          error="Too short"
          helperText="Min 8 chars"
          required
          showSuccess
          onChangeText={onChangeText}
        />
      );

      expect(getByTestId('input-container')).toBeTruthy();
      expect(getByTestId('text-input').props.secureTextEntry).toBe(true);
    });

    it('maintains visibility state with value changes', () => {
      const { getByTestId, rerender } = render(
        <PasswordInput value="pass1" />
      );

      // Show password
      fireEvent.press(getByTestId('right-icon-eye-outline'));
      expect(getByTestId('text-input').props.secureTextEntry).toBe(false);

      // Change value
      rerender(<PasswordInput value="pass2" />);

      // Visibility should still be shown
      expect(getByTestId('text-input').props.secureTextEntry).toBe(false);
    });

    it('works with error and visibility toggle', () => {
      const { getByTestId } = render(
        <PasswordInput error="Invalid password" />
      );

      // Toggle visibility with error present
      fireEvent.press(getByTestId('right-icon-eye-outline'));
      expect(getByTestId('text-input').props.secureTextEntry).toBe(false);

      fireEvent.press(getByTestId('right-icon-eye-off-outline'));
      expect(getByTestId('text-input').props.secureTextEntry).toBe(true);
    });
  });

  // ============================================
  // State Update Tests
  // ============================================

  describe('State Updates', () => {
    it('updates value dynamically', () => {
      const { getByTestId, rerender } = render(
        <PasswordInput value="pass1" />
      );
      expect(getByTestId('input-container')).toBeTruthy();

      rerender(<PasswordInput value="pass2" />);
      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('updates error dynamically', () => {
      const { getByTestId, rerender } = render(
        <PasswordInput error="Error 1" />
      );
      expect(getByTestId('input-container')).toBeTruthy();

      rerender(<PasswordInput error="Error 2" />);
      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('updates helperText dynamically', () => {
      const { getByTestId, rerender } = render(
        <PasswordInput helperText="Help 1" />
      );
      expect(getByTestId('input-container')).toBeTruthy();

      rerender(<PasswordInput helperText="Help 2" />);
      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('adds error after initial render', () => {
      const { getByTestId, rerender } = render(<PasswordInput />);
      expect(getByTestId('input-container')).toBeTruthy();

      rerender(<PasswordInput error="New error" />);
      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('removes error dynamically', () => {
      const { getByTestId, rerender } = render(
        <PasswordInput error="Error" />
      );
      expect(getByTestId('input-container')).toBeTruthy();

      rerender(<PasswordInput />);
      expect(getByTestId('input-container')).toBeTruthy();
    });
  });

  // ============================================
  // Edge Cases Tests
  // ============================================

  describe('Edge Cases', () => {
    it('handles empty string value', () => {
      const { getByTestId } = render(<PasswordInput value="" />);
      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('handles very long password', () => {
      const longPassword = 'a'.repeat(1000);
      const { getByTestId } = render(<PasswordInput value={longPassword} />);
      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('handles special characters in password', () => {
      const { getByTestId } = render(
        <PasswordInput value="P@ssw0rd!#$%" />
      );
      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('handles undefined value', () => {
      const { getByTestId } = render(<PasswordInput value={undefined} />);
      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('handles rapid visibility toggles', () => {
      const { getByTestId } = render(<PasswordInput />);

      for (let i = 0; i < 10; i++) {
        const iconTestId =
          i % 2 === 0 ? 'right-icon-eye-outline' : 'right-icon-eye-off-outline';
        fireEvent.press(getByTestId(iconTestId));
      }

      // After 10 toggles, should be hidden again (even number)
      expect(getByTestId('text-input').props.secureTextEntry).toBe(true);
    });
  });

  // ============================================
  // Real-World Use Cases
  // ============================================

  describe('Real-World Use Cases', () => {
    it('renders login password field', () => {
      const handleChange = jest.fn() as jest.Mock;
      const { getByTestId } = render(
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          onChangeText={handleChange}
          required
        />
      );

      expect(getByTestId('text-input').props.secureTextEntry).toBe(true);
      fireEvent.changeText(getByTestId('text-input'), 'mypassword');
      expect(handleChange).toHaveBeenCalledWith('mypassword');
    });

    it('renders signup password field with validation', () => {
      const { getByTestId } = render(
        <PasswordInput
          label="Create Password"
          placeholder="Min 8 characters"
          helperText="Must include uppercase, lowercase, and number"
          error="Password too weak"
          required
        />
      );

      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('renders confirm password field', () => {
      const { getByTestId } = render(
        <PasswordInput
          label="Confirm Password"
          placeholder="Re-enter password"
          error="Passwords do not match"
          required
        />
      );

      expect(getByTestId('input-container')).toBeTruthy();
    });

    it('allows user to verify password before submit', () => {
      const { getByTestId } = render(
        <PasswordInput value="SecretPass123" />
      );

      // Start hidden
      expect(getByTestId('text-input').props.secureTextEntry).toBe(true);

      // User shows to verify
      fireEvent.press(getByTestId('right-icon-eye-outline'));
      expect(getByTestId('text-input').props.secureTextEntry).toBe(false);

      // User hides again
      fireEvent.press(getByTestId('right-icon-eye-off-outline'));
      expect(getByTestId('text-input').props.secureTextEntry).toBe(true);
    });

    it('renders change password form fields', () => {
      const { getAllByTestId } = render(
        <>
          <PasswordInput label="Current Password" required />
          <PasswordInput label="New Password" required />
          <PasswordInput label="Confirm New Password" required />
        </>
      );

      const containers = getAllByTestId('input-container');
      expect(containers).toHaveLength(3);
    });
  });

  // ============================================
  // Integration Tests
  // ============================================

  describe('Integration', () => {
    it('works in a complete form', () => {
      const handlePasswordChange = jest.fn() as jest.Mock;
      const handleSubmit = jest.fn() as jest.Mock;

      const { getByTestId } = render(
        <PasswordInput
          label="Password"
          placeholder="Enter password"
          value="testpass"
          onChangeText={handlePasswordChange}
          onSubmitEditing={handleSubmit}
          error="Required"
        />
      );

      // Change password
      fireEvent.changeText(getByTestId('text-input'), 'newpass123');
      expect(handlePasswordChange).toHaveBeenCalledWith('newpass123');

      // Toggle visibility
      fireEvent.press(getByTestId('right-icon-eye-outline'));
      expect(getByTestId('text-input').props.secureTextEntry).toBe(false);

      // Submit
      fireEvent(getByTestId('text-input'), 'submitEditing');
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('maintains independent state across multiple instances', () => {
      const { getAllByTestId } = render(
        <>
          <PasswordInput testID="password1" />
          <PasswordInput testID="password2" />
        </>
      );

      const inputs = getAllByTestId('text-input');
      const eyeIcons = getAllByTestId('right-icon-eye-outline');

      // Toggle first password
      fireEvent.press(eyeIcons[0]);
      expect(inputs[0].props.secureTextEntry).toBe(false);
      expect(inputs[1].props.secureTextEntry).toBe(true);

      // Toggle second password
      fireEvent.press(eyeIcons[1]);
      expect(inputs[0].props.secureTextEntry).toBe(false);
      expect(inputs[1].props.secureTextEntry).toBe(false);
    });
  });
});
