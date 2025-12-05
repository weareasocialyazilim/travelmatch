/**
 * Button Component Tests
 * Testing button variants, sizes, loading states, and interactions
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

// Mock vector icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

// Mock accessibility utils
jest.mock('../../../utils/accessibility', () => ({
  a11yProps: {
    button: jest.fn((label: string, hint?: string, disabled?: boolean) => ({
      accessible: true,
      accessibilityRole: 'button',
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityState: { disabled },
    })),
  },
}));

describe('Button', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with title', () => {
      const { getByText } = render(
        <Button title="Click Me" onPress={mockOnPress} />,
      );
      expect(getByText('Click Me')).toBeTruthy();
    });

    it('renders as touchable element', () => {
      const { getByRole } = render(
        <Button title="Test" onPress={mockOnPress} />,
      );
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when pressed', () => {
      const { getByText } = render(
        <Button title="Press Me" onPress={mockOnPress} />,
      );
      fireEvent.press(getByText('Press Me'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const { getByText } = render(
        <Button title="Disabled" onPress={mockOnPress} disabled={true} />,
      );
      fireEvent.press(getByText('Disabled'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('does not call onPress when loading', () => {
      const { getByRole } = render(
        <Button title="Loading" onPress={mockOnPress} loading={true} />,
      );
      fireEvent.press(getByRole('button'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    it('renders primary variant', () => {
      const { getByText } = render(
        <Button title="Primary" onPress={mockOnPress} variant="primary" />,
      );
      expect(getByText('Primary')).toBeTruthy();
    });

    it('renders secondary variant', () => {
      const { getByText } = render(
        <Button title="Secondary" onPress={mockOnPress} variant="secondary" />,
      );
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('renders outline variant', () => {
      const { getByText } = render(
        <Button title="Outline" onPress={mockOnPress} variant="outline" />,
      );
      expect(getByText('Outline')).toBeTruthy();
    });

    it('renders ghost variant', () => {
      const { getByText } = render(
        <Button title="Ghost" onPress={mockOnPress} variant="ghost" />,
      );
      expect(getByText('Ghost')).toBeTruthy();
    });

    it('renders danger variant', () => {
      const { getByText } = render(
        <Button title="Danger" onPress={mockOnPress} variant="danger" />,
      );
      expect(getByText('Danger')).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      const { getByText } = render(
        <Button title="Small" onPress={mockOnPress} size="sm" />,
      );
      expect(getByText('Small')).toBeTruthy();
    });

    it('renders medium size', () => {
      const { getByText } = render(
        <Button title="Medium" onPress={mockOnPress} size="md" />,
      );
      expect(getByText('Medium')).toBeTruthy();
    });

    it('renders large size', () => {
      const { getByText } = render(
        <Button title="Large" onPress={mockOnPress} size="lg" />,
      );
      expect(getByText('Large')).toBeTruthy();
    });
  });

  describe('States', () => {
    it('renders disabled state', () => {
      const { getByRole } = render(
        <Button title="Disabled" onPress={mockOnPress} disabled={true} />,
      );
      const button = getByRole('button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('renders loading state with indicator', () => {
      const { getByRole, queryByText } = render(
        <Button title="Loading" onPress={mockOnPress} loading={true} />,
      );
      expect(getByRole('button')).toBeTruthy();
      // When loading, text is hidden
      expect(queryByText('Loading')).toBeNull();
    });
  });

  describe('Full Width', () => {
    it('renders full width button', () => {
      const { getByText } = render(
        <Button title="Full Width" onPress={mockOnPress} fullWidth={true} />,
      );
      expect(getByText('Full Width')).toBeTruthy();
    });
  });

  describe('Icon', () => {
    it('renders with left icon', () => {
      const { getByText } = render(
        <Button
          title="With Icon"
          onPress={mockOnPress}
          icon="check"
          iconPosition="left"
        />,
      );
      expect(getByText('With Icon')).toBeTruthy();
    });

    it('renders with right icon', () => {
      const { getByText } = render(
        <Button
          title="Icon Right"
          onPress={mockOnPress}
          icon="arrow-right"
          iconPosition="right"
        />,
      );
      expect(getByText('Icon Right')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('uses title as accessibility label when not provided', () => {
      const { getByRole } = render(
        <Button title="Submit" onPress={mockOnPress} />,
      );
      const button = getByRole('button');
      // The component uses title as label when accessibilityLabel is not provided
      expect(button.props.accessibilityLabel).toBeTruthy();
    });

    it('accepts custom accessibility hint', () => {
      const { getByRole } = render(
        <Button
          title="Submit"
          onPress={mockOnPress}
          accessibilityHint="Double tap to submit"
        />,
      );
      const button = getByRole('button');
      // Custom hint is passed through a11yProps
      expect(button.props.accessibilityHint).toBeTruthy();
    });
  });

  describe('Custom Styling', () => {
    it('accepts custom style prop', () => {
      const customStyle = { marginTop: 10 };
      const { getByText } = render(
        <Button title="Custom" onPress={mockOnPress} style={customStyle} />,
      );
      expect(getByText('Custom')).toBeTruthy();
    });

    it('accepts custom text style prop', () => {
      const customTextStyle = { fontWeight: 'bold' as const };
      const { getByText } = render(
        <Button
          title="Custom Text"
          onPress={mockOnPress}
          textStyle={customTextStyle}
        />,
      );
      expect(getByText('Custom Text')).toBeTruthy();
    });
  });
});
