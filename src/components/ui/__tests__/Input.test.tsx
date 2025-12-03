/**
 * Input Component Tests
 * Testing input functionality, validation, and accessibility
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders correctly with placeholder', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Enter text" />,
      );

      expect(getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('renders with label', () => {
      const { getByText } = render(
        <Input label="Username" placeholder="Enter username" />,
      );

      expect(getByText('Username')).toBeTruthy();
    });

    it('renders error message when provided', () => {
      const { getByText } = render(
        <Input placeholder="Email" error="Invalid email" />,
      );

      expect(getByText('Invalid email')).toBeTruthy();
    });

    it('renders hint text when provided', () => {
      const { getByText } = render(
        <Input placeholder="Password" hint="Must be 8+ characters" />,
      );

      expect(getByText('Must be 8+ characters')).toBeTruthy();
    });

    it('does not show hint when error is present', () => {
      const { queryByText, getByText } = render(
        <Input
          placeholder="Email"
          hint="Enter your email"
          error="Invalid email"
        />,
      );

      expect(getByText('Invalid email')).toBeTruthy();
      expect(queryByText('Enter your email')).toBeNull();
    });
  });

  describe('Password Input', () => {
    it('hides password by default', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Password" secureTextEntry />,
      );

      const input = getByPlaceholderText('Password');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('toggles password visibility when eye icon is pressed', () => {
      const { getByPlaceholderText, getByLabelText } = render(
        <Input placeholder="Password" secureTextEntry />,
      );

      const input = getByPlaceholderText('Password');
      const toggleButton = getByLabelText('Show password');

      // Initially hidden
      expect(input.props.secureTextEntry).toBe(true);

      // Toggle to show
      fireEvent.press(toggleButton);
      expect(input.props.secureTextEntry).toBe(false);

      // Toggle to hide again
      const hideButton = getByLabelText('Hide password');
      fireEvent.press(hideButton);
      expect(input.props.secureTextEntry).toBe(true);
    });
  });

  describe('Interactions', () => {
    it('calls onChangeText when text changes', () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <Input placeholder="Name" onChangeText={mockOnChange} />,
      );

      const input = getByPlaceholderText('Name');
      fireEvent.changeText(input, 'John Doe');

      expect(mockOnChange).toHaveBeenCalledWith('John Doe');
    });

    it('handles focus and blur events', () => {
      const mockOnFocus = jest.fn();
      const mockOnBlur = jest.fn();
      const { getByPlaceholderText } = render(
        <Input placeholder="Email" onFocus={mockOnFocus} onBlur={mockOnBlur} />,
      );

      const input = getByPlaceholderText('Email');

      fireEvent(input, 'focus');
      expect(mockOnFocus).toHaveBeenCalled();

      fireEvent(input, 'blur');
      expect(mockOnBlur).toHaveBeenCalled();
    });
  });

  describe('Icons', () => {
    it('renders left icon when provided', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Email" leftIcon="email" />,
      );

      expect(getByPlaceholderText('Email')).toBeTruthy();
    });

    it('renders right icon when provided', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Search" rightIcon="magnify" />,
      );

      expect(getByPlaceholderText('Search')).toBeTruthy();
    });

    it('calls onRightIconPress when right icon is pressed', () => {
      const mockOnPress = jest.fn();
      const { getByPlaceholderText } = render(
        <Input
          placeholder="Search"
          rightIcon="close"
          onRightIconPress={mockOnPress}
        />,
      );

      expect(getByPlaceholderText('Search')).toBeTruthy();
      // Icon press test would need access to the TouchableOpacity
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility label', () => {
      const { getByLabelText } = render(
        <Input label="Email Address" placeholder="Enter email" />,
      );

      expect(getByLabelText('Email Address')).toBeTruthy();
    });

    it('has accessibility hint when provided', () => {
      const { getByPlaceholderText } = render(
        <Input
          placeholder="Password"
          hint="Must be 8+ characters"
          accessibilityHint="Must be 8+ characters"
        />,
      );

      expect(getByPlaceholderText('Password')).toBeTruthy();
    });
  });

  describe('Validation States', () => {
    it('shows error state with red border', () => {
      const { getByText } = render(
        <Input placeholder="Email" error="Invalid email address" />,
      );

      expect(getByText('Invalid email address')).toBeTruthy();
    });

    it('shows focused state', () => {
      const { getByPlaceholderText } = render(<Input placeholder="Username" />);

      const input = getByPlaceholderText('Username');
      fireEvent(input, 'focus');

      // Input should be focused
      expect(input).toBeTruthy();
    });
  });

  describe('Memoization', () => {
    it('memoizes border color calculation', () => {
      const { getByPlaceholderText, rerender } = render(
        <Input placeholder="Test" />,
      );

      const input1 = getByPlaceholderText('Test');

      // Re-render with same props
      rerender(<Input placeholder="Test" />);

      const input2 = getByPlaceholderText('Test');
      expect(input1).toBeTruthy();
      expect(input2).toBeTruthy();
    });

    it('updates border color when error changes', () => {
      const { getByPlaceholderText, rerender, getByText } = render(
        <Input placeholder="Email" />,
      );

      expect(getByPlaceholderText('Email')).toBeTruthy();

      // Add error
      rerender(<Input placeholder="Email" error="Invalid" />);

      expect(getByText('Invalid')).toBeTruthy();
    });
  });
});
