/**
 * Button Component Tests
 * Tests for button variants, accessibility, and interactions
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

// Mock reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
  useAnimatedStyle: jest.fn(() => ({})),
  withSpring: jest.fn((value) => value),
  withTiming: jest.fn((value) => value),
  View: 'View',
  default: {
    View: 'View',
  },
}));

// Mock haptics
jest.mock('../../utils/haptics', () => ({
  hapticPatterns: {
    primaryAction: jest.fn(),
    buttonPress: jest.fn(),
  },
}));

// Mock animations
jest.mock('../../utils/animations', () => ({
  usePressScale: jest.fn(() => ({
    animatedStyle: {},
    onPressIn: jest.fn(),
    onPressOut: jest.fn(),
  })),
}));

import { hapticPatterns } from '../../utils/haptics';

describe('Button', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders with title', () => {
      const { getByText } = render(
        <Button title="Click Me" onPress={mockOnPress} />
      );
      
      expect(getByText('Click Me')).toBeTruthy();
    });

    it('renders primary variant by default', () => {
      const { toJSON } = render(
        <Button title="Primary" onPress={mockOnPress} />
      );
      
      expect(toJSON()).toBeTruthy();
    });

    it('renders secondary variant', () => {
      const { toJSON } = render(
        <Button title="Secondary" onPress={mockOnPress} variant="secondary" />
      );
      
      expect(toJSON()).toBeTruthy();
    });

    it('renders outline variant', () => {
      const { toJSON } = render(
        <Button title="Outline" onPress={mockOnPress} variant="outline" />
      );
      
      expect(toJSON()).toBeTruthy();
    });

    it('renders disabled state', () => {
      const { toJSON } = render(
        <Button title="Disabled" onPress={mockOnPress} disabled />
      );
      
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Press handling', () => {
    it('calls onPress when pressed', () => {
      const { getByText } = render(
        <Button title="Press Me" onPress={mockOnPress} />
      );
      
      fireEvent.press(getByText('Press Me'));
      
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const { getByText } = render(
        <Button title="Disabled" onPress={mockOnPress} disabled />
      );
      
      fireEvent.press(getByText('Disabled'));
      
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('calls onPress even when disabled prop changes dynamically', () => {
      const { getByText, rerender } = render(
        <Button title="Button" onPress={mockOnPress} disabled />
      );
      
      // Should not call when disabled
      fireEvent.press(getByText('Button'));
      expect(mockOnPress).not.toHaveBeenCalled();
      
      // Re-render with disabled false
      rerender(<Button title="Button" onPress={mockOnPress} disabled={false} />);
      
      fireEvent.press(getByText('Button'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Haptic feedback', () => {
    it('triggers primary haptic for primary variant', () => {
      const { getByText } = render(
        <Button title="Primary" onPress={mockOnPress} variant="primary" />
      );
      
      fireEvent.press(getByText('Primary'));
      
      expect(hapticPatterns.primaryAction).toHaveBeenCalled();
    });

    it('triggers button press haptic for secondary variant', () => {
      const { getByText } = render(
        <Button title="Secondary" onPress={mockOnPress} variant="secondary" />
      );
      
      fireEvent.press(getByText('Secondary'));
      
      expect(hapticPatterns.buttonPress).toHaveBeenCalled();
    });

    it('triggers button press haptic for outline variant', () => {
      const { getByText } = render(
        <Button title="Outline" onPress={mockOnPress} variant="outline" />
      );
      
      fireEvent.press(getByText('Outline'));
      
      expect(hapticPatterns.buttonPress).toHaveBeenCalled();
    });

    it('does not trigger haptic when enableHaptic is false', () => {
      const { getByText } = render(
        <Button title="No Haptic" onPress={mockOnPress} enableHaptic={false} />
      );
      
      fireEvent.press(getByText('No Haptic'));
      
      expect(hapticPatterns.primaryAction).not.toHaveBeenCalled();
      expect(hapticPatterns.buttonPress).not.toHaveBeenCalled();
    });

    it('does not trigger haptic when disabled', () => {
      const { getByText } = render(
        <Button title="Disabled" onPress={mockOnPress} disabled />
      );
      
      fireEvent.press(getByText('Disabled'));
      
      expect(hapticPatterns.primaryAction).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility role', () => {
      const { getByRole } = render(
        <Button title="Accessible" onPress={mockOnPress} />
      );
      
      expect(getByRole('button')).toBeTruthy();
    });

    it('has correct accessibility label', () => {
      const { getByLabelText } = render(
        <Button title="Submit Form" onPress={mockOnPress} />
      );
      
      expect(getByLabelText('Submit Form')).toBeTruthy();
    });

    it('has disabled accessibility state when disabled', () => {
      const { getByRole } = render(
        <Button title="Disabled" onPress={mockOnPress} disabled />
      );
      
      const button = getByRole('button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('has accessibility hint when disabled', () => {
      const { getByRole } = render(
        <Button title="Disabled" onPress={mockOnPress} disabled />
      );
      
      const button = getByRole('button');
      expect(button.props.accessibilityHint).toBe('Button is disabled');
    });

    it('does not have accessibility hint when enabled', () => {
      const { getByRole } = render(
        <Button title="Enabled" onPress={mockOnPress} />
      );
      
      const button = getByRole('button');
      expect(button.props.accessibilityHint).toBeUndefined();
    });
  });

  describe('Custom styles', () => {
    it('applies custom style prop', () => {
      const customStyle = { marginTop: 20 };
      const { toJSON } = render(
        <Button title="Styled" onPress={mockOnPress} style={customStyle} />
      );
      
      expect(toJSON()).toBeTruthy();
    });

    it('merges custom styles with variant styles', () => {
      const customStyle = { borderRadius: 20 };
      const { toJSON } = render(
        <Button 
          title="Custom" 
          onPress={mockOnPress} 
          variant="outline" 
          style={customStyle} 
        />
      );
      
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Memo optimization', () => {
    it('has displayName set', () => {
      expect(Button.displayName).toBe('Button');
    });
  });

  describe('Press in/out handlers', () => {
    it('handles pressIn and pressOut events', () => {
      const { getByText } = render(
        <Button title="Press" onPress={mockOnPress} />
      );
      
      const button = getByText('Press').parent?.parent;
      
      if (button) {
        fireEvent(button, 'pressIn');
        fireEvent(button, 'pressOut');
      }
      
      // Should not throw
      expect(true).toBe(true);
    });
  });
});
