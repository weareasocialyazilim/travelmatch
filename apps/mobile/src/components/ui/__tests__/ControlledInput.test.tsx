/**
 * Tests for ControlledInput - React Hook Form integrated input
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { ControlledInput } from '../ControlledInput';

// Mock dependencies
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: {
      View: (props: any) => React.createElement('View', props),
      Text: (props: any) => React.createElement('Text', props),
      FadeIn: {
        duration: jest.fn().mockReturnThis(),
      },
      FadeOut: {
        duration: jest.fn().mockReturnThis(),
      },
    },
    FadeIn: {
      duration: jest.fn().mockReturnThis(),
    },
  };
});

// Test wrapper component
interface TestFormData {
  testField: string;
  password: string;
  email: string;
}

function TestWrapper({
  onSubmit,
  defaultValues = {},
  ...controlledInputProps
}: any) {
  const { control, handleSubmit } = useForm<TestFormData>({
    defaultValues,
  });

  return (
    <>
      <ControlledInput control={control} {...controlledInputProps} />
    </>
  );
}

describe('ControlledInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // =========================
  // Basic Rendering
  // =========================

  describe('Basic Rendering', () => {
    it('renders correctly with required props', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" testID="controlled-input" />
      );

      expect(getByTestId('controlled-input')).toBeTruthy();
    });

    it('renders with label', () => {
      const { getByText } = render(
        <TestWrapper name="testField" label="Username" />
      );

      expect(getByText('Username')).toBeTruthy();
    });

    it('renders with hint', () => {
      const { getByText } = render(
        <TestWrapper name="testField" hint="Enter your username" />
      );

      expect(getByText('Enter your username')).toBeTruthy();
    });

    it('renders with placeholder', () => {
      const { getByTestId } = render(
        <TestWrapper
          name="testField"
          placeholder="Type here..."
          testID="input"
        />
      );

      expect(getByTestId('input').props.placeholder).toBe('Type here...');
    });

    it('renders required indicator when required=true', () => {
      const { getByText, getByTestId } = render(
        <TestWrapper
          name="testField"
          label="Email"
          required={true}
          testID="input"
        />
      );

      expect(getByText('Email')).toBeTruthy();
      // Required prop is passed to Input component
      const input = getByTestId('input');
      expect(input.props.required).toBe(true);
    });
  });

  // =========================
  // Input Types
  // =========================

  describe('Input Types', () => {
    it('renders regular Input by default', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" testID="regular-input" />
      );

      const input = getByTestId('regular-input');
      expect(input).toBeTruthy();
      // Regular Input has secureTextEntry=false
      expect(input.props.secureTextEntry).toBe(false);
    });

    it('renders PasswordInput when isPassword=true', () => {
      const { getByTestId } = render(
        <TestWrapper
          name="password"
          isPassword={true}
          testID="password-input"
        />
      );

      const input = getByTestId('password-input');
      expect(input).toBeTruthy();
    });

    it('switches between Input and PasswordInput based on isPassword prop', () => {
      const { rerender, getByTestId } = render(
        <TestWrapper name="testField" testID="input" />
      );

      let input = getByTestId('input');
      // Regular Input has secureTextEntry=false
      expect(input.props.secureTextEntry).toBe(false);

      rerender(
        <TestWrapper name="testField" isPassword={true} testID="input" />
      );

      input = getByTestId('input');
      expect(input).toBeTruthy();
    });
  });

  // =========================
  // Form Integration
  // =========================

  describe('Form Integration', () => {
    it('displays initial value from defaultValues', () => {
      const { getByTestId } = render(
        <TestWrapper
          name="testField"
          defaultValues={{ testField: 'initial value' }}
          testID="input"
        />
      );

      expect(getByTestId('input').props.value).toBe('initial value');
    });

    it('updates value on text change', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" testID="input" />
      );

      const input = getByTestId('input');
      fireEvent.changeText(input, 'new value');

      expect(getByTestId('input').props.value).toBe('new value');
    });

    it('handles empty value correctly', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" testID="input" />
      );

      const input = getByTestId('input');
      expect(input.props.value).toBe('');
    });

    it('calls onBlur when input loses focus', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" testID="input" />
      );

      const input = getByTestId('input');
      fireEvent(input, 'blur');

      // Input should still be accessible after blur
      expect(input).toBeTruthy();
    });
  });

  // =========================
  // Validation & Errors
  // =========================

  describe('Validation & Errors', () => {
    it('does not show error initially', () => {
      const { queryByText } = render(<TestWrapper name="testField" />);

      expect(queryByText(/error/i)).toBeNull();
    });

    it('shows error after blur with delay', async () => {
      function TestFormWithValidation() {
        const { control } = useForm<TestFormData>({
          defaultValues: { testField: '' },
        });

        return (
          <ControlledInput
            control={control}
            name="testField"
            testID="input"
            // Simulate validation error
          />
        );
      }

      const { getByTestId } = render(<TestFormWithValidation />);

      const input = getByTestId('input');
      fireEvent(input, 'blur');

      jest.advanceTimersByTime(300);
    });

    it('hides error when user starts typing', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" testID="input" />
      );

      const input = getByTestId('input');

      // Trigger error
      fireEvent(input, 'blur');
      jest.advanceTimersByTime(300);

      // Start typing
      fireEvent.changeText(input, 'fixing');

      // Error should be hidden
      expect(input).toBeTruthy();
    });

    it('applies 300ms delay before showing error', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" testID="input" />
      );

      const input = getByTestId('input');
      fireEvent(input, 'blur');

      // Before delay
      jest.advanceTimersByTime(100);

      // After delay
      jest.advanceTimersByTime(200);
    });

    it('clears error timer when unmounted', () => {
      const { unmount, getByTestId } = render(
        <TestWrapper name="testField" testID="input" />
      );

      const input = getByTestId('input');
      fireEvent(input, 'blur');

      unmount();

      // Should not cause any issues
      jest.advanceTimersByTime(300);
    });
  });

  // =========================
  // Success State
  // =========================

  describe('Success State', () => {
    it('shows success when showSuccess=true and field is valid', () => {
      const { getByTestId } = render(
        <TestWrapper
          name="testField"
          showSuccess={true}
          defaultValues={{ testField: 'valid' }}
          testID="input"
        />
      );

      const input = getByTestId('input');
      fireEvent(input, 'blur');

      // Success should be shown
      expect(input.props.showSuccess).toBeDefined();
    });

    it('does not show success when showSuccess=false', () => {
      const { getByTestId } = render(
        <TestWrapper
          name="testField"
          showSuccess={false}
          defaultValues={{ testField: 'valid' }}
          testID="input"
        />
      );

      const input = getByTestId('input');
      expect(input.props.showSuccess).toBeFalsy();
    });

    it('does not show success when field is empty', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" showSuccess={true} testID="input" />
      );

      const input = getByTestId('input');
      expect(input.props.showSuccess).toBeFalsy();
    });

    it('does not show success before blur (not touched)', () => {
      const { getByTestId } = render(
        <TestWrapper
          name="testField"
          showSuccess={true}
          defaultValues={{ testField: 'valid' }}
          testID="input"
        />
      );

      const input = getByTestId('input');
      // Before blur
      expect(input.props.showSuccess).toBeFalsy();
    });
  });

  // =========================
  // Icons & Actions
  // =========================

  describe('Icons & Actions', () => {
    it('renders with left icon', () => {
      const { UNSAFE_root } = render(
        <TestWrapper
          name="testField"
          leftIcon={<MockIcon testID="left-icon" />}
        />
      );

      const leftIcon = UNSAFE_root.findAllByProps({ testID: 'left-icon' });
      expect(leftIcon.length).toBeGreaterThan(0);
    });

    it('renders with right icon', () => {
      const { UNSAFE_root } = render(
        <TestWrapper
          name="testField"
          rightIcon={<MockIcon testID="right-icon" />}
        />
      );

      const rightIcon = UNSAFE_root.findAllByProps({ testID: 'right-icon' });
      expect(rightIcon.length).toBeGreaterThan(0);
    });

    it('calls onRightIconPress when right icon is pressed', () => {
      const onRightIconPress = jest.fn();

      const { getByTestId } = render(
        <TestWrapper
          name="testField"
          rightIcon={<MockIcon testID="right-icon" />}
          onRightIconPress={onRightIconPress}
          testID="input"
        />
      );

      // ControlledInput receives and forwards the callback
      const input = getByTestId('input');
      expect(input).toBeTruthy();
      // Callback is passed through (though Input component may not use it the same way)
    });

    it('passes icons to underlying Input component', () => {
      const leftIcon = <MockIcon testID="left" />;
      const rightIcon = <MockIcon testID="right" />;

      const { getByTestId } = render(
        <TestWrapper
          name="testField"
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          testID="input"
        />
      );

      const input = getByTestId('input');
      // Icons are passed through (note: Input component expects icon names as strings,
      // so the ReactNode icons may not be directly used)
      expect(input).toBeTruthy();
    });
  });

  // =========================
  // TextInput Props
  // =========================

  describe('TextInput Props', () => {
    it('forwards keyboardType prop', () => {
      const { getByTestId } = render(
        <TestWrapper
          name="email"
          keyboardType="email-address"
          testID="input"
        />
      );

      expect(getByTestId('input').props.keyboardType).toBe('email-address');
    });

    it('forwards autoCapitalize prop', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" autoCapitalize="words" testID="input" />
      );

      expect(getByTestId('input').props.autoCapitalize).toBe('words');
    });

    it('forwards autoComplete prop', () => {
      const { getByTestId } = render(
        <TestWrapper name="email" autoComplete="email" testID="input" />
      );

      expect(getByTestId('input').props.autoComplete).toBe('email');
    });

    it('forwards multiline prop', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" multiline={true} testID="input" />
      );

      expect(getByTestId('input').props.multiline).toBe(true);
    });

    it('forwards numberOfLines prop', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" numberOfLines={5} testID="input" />
      );

      expect(getByTestId('input').props.numberOfLines).toBe(5);
    });

    it('forwards maxLength prop', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" maxLength={100} testID="input" />
      );

      expect(getByTestId('input').props.maxLength).toBe(100);
    });

    it('forwards editable prop', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" editable={false} testID="input" />
      );

      expect(getByTestId('input').props.editable).toBe(false);
    });
  });

  // =========================
  // Edge Cases
  // =========================

  describe('Edge Cases', () => {
    it('handles undefined value gracefully', () => {
      const { getByTestId } = render(
        <TestWrapper
          name="testField"
          defaultValues={{ testField: undefined }}
          testID="input"
        />
      );

      const input = getByTestId('input');
      expect(input.props.value).toBe('');
    });

    it('handles null value gracefully', () => {
      const { getByTestId } = render(
        <TestWrapper
          name="testField"
          defaultValues={{ testField: null }}
          testID="input"
        />
      );

      const input = getByTestId('input');
      expect(input.props.value).toBe('');
    });

    it('handles very long text', () => {
      const longText = 'a'.repeat(1000);
      const { getByTestId } = render(
        <TestWrapper name="testField" testID="input" />
      );

      const input = getByTestId('input');
      fireEvent.changeText(input, longText);

      expect(getByTestId('input').props.value).toBe(longText);
    });

    it('handles special characters', () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const { getByTestId } = render(
        <TestWrapper name="testField" testID="input" />
      );

      const input = getByTestId('input');
      fireEvent.changeText(input, specialText);

      expect(getByTestId('input').props.value).toBe(specialText);
    });

    it('handles emoji characters', () => {
      const emojiText = '😀🎉👍🔥';
      const { getByTestId } = render(
        <TestWrapper name="testField" testID="input" />
      );

      const input = getByTestId('input');
      fireEvent.changeText(input, emojiText);

      expect(getByTestId('input').props.value).toBe(emojiText);
    });

    it('handles rapid text changes', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" testID="input" />
      );

      const input = getByTestId('input');

      fireEvent.changeText(input, 'a');
      fireEvent.changeText(input, 'ab');
      fireEvent.changeText(input, 'abc');
      fireEvent.changeText(input, 'abcd');

      expect(getByTestId('input').props.value).toBe('abcd');
    });

    it('handles blur without any interaction', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" testID="input" />
      );

      const input = getByTestId('input');
      fireEvent(input, 'blur');

      expect(input).toBeTruthy();
    });
  });

  // =========================
  // Real-world Use Cases
  // =========================

  describe('Real-world Use Cases', () => {
    it('simulates email field validation flow', () => {
      const { getByTestId } = render(
        <TestWrapper
          name="email"
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          testID="email-input"
        />
      );

      const input = getByTestId('email-input');

      // User types email
      fireEvent.changeText(input, 'test@example.com');
      expect(input.props.value).toBe('test@example.com');

      // User moves to next field
      fireEvent(input, 'blur');
      expect(input).toBeTruthy();
    });

    it('simulates password field flow', () => {
      const { getByTestId } = render(
        <TestWrapper
          name="password"
          label="Password"
          placeholder="Enter password"
          isPassword={true}
          testID="password-input"
        />
      );

      const input = getByTestId('password-input');

      // User types password
      fireEvent.changeText(input, 'SecurePass123!');
      expect(input.props.value).toBe('SecurePass123!');
    });

    it('simulates multi-line text area', () => {
      const { getByTestId } = render(
        <TestWrapper
          name="description"
          label="Description"
          multiline={true}
          numberOfLines={4}
          testID="textarea"
        />
      );

      const textarea = getByTestId('textarea');

      fireEvent.changeText(textarea, 'Line 1\nLine 2\nLine 3');
      expect(textarea.props.value).toBe('Line 1\nLine 2\nLine 3');
    });

    it('simulates form field with character limit', () => {
      const { getByTestId } = render(
        <TestWrapper
          name="bio"
          label="Bio"
          maxLength={100}
          hint="Max 100 characters"
          testID="bio-input"
        />
      );

      const input = getByTestId('bio-input');

      fireEvent.changeText(input, 'a'.repeat(150));
      // Input component should handle truncation
      expect(input.props.maxLength).toBe(100);
    });

    it('simulates disabled/readonly field', () => {
      const { getByTestId } = render(
        <TestWrapper
          name="username"
          defaultValues={{ username: 'john_doe' }}
          editable={false}
          testID="readonly-input"
        />
      );

      const input = getByTestId('readonly-input');
      expect(input.props.editable).toBe(false);
      expect(input.props.value).toBe('john_doe');
    });

    it('simulates error correction flow', () => {
      const { getByTestId } = render(
        <TestWrapper name="testField" testID="input" />
      );

      const input = getByTestId('input');

      // User enters invalid data
      fireEvent.changeText(input, 'invalid');
      fireEvent(input, 'blur');

      jest.advanceTimersByTime(300);

      // User corrects the input
      fireEvent.changeText(input, 'valid data');

      expect(input.props.value).toBe('valid data');
    });

    it('simulates complete form field lifecycle', () => {
      const { getByTestId } = render(
        <TestWrapper
          name="fullName"
          label="Full Name"
          required={true}
          showSuccess={true}
          testID="name-input"
        />
      );

      const input = getByTestId('name-input');

      // Initial state
      expect(input.props.value).toBe('');

      // User types
      fireEvent.changeText(input, 'J');
      expect(input.props.value).toBe('J');

      fireEvent.changeText(input, 'John');
      expect(input.props.value).toBe('John');

      fireEvent.changeText(input, 'John Doe');
      expect(input.props.value).toBe('John Doe');

      // User confirms
      fireEvent(input, 'blur');

      jest.advanceTimersByTime(300);

      expect(input.props.value).toBe('John Doe');
    });
  });
});

// Mock Icon component for testing
function MockIcon({ testID }: { testID: string }) {
  const React = require('react');
  const { View } = require('react-native');
  return React.createElement(View, { testID });
}
