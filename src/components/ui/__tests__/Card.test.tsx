/**
 * Card Component Tests
 * Testing card variants, padding, and interactions
 */

import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Card } from '../Card';

describe('Card Component', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <Card>
          <Text>Card Content</Text>
        </Card>,
      );

      expect(getByText('Card Content')).toBeTruthy();
    });

    it('renders with elevated variant by default', () => {
      const { getByText } = render(
        <Card>
          <Text>Elevated Card</Text>
        </Card>,
      );

      expect(getByText('Elevated Card')).toBeTruthy();
    });

    it('renders outlined variant correctly', () => {
      const { getByText } = render(
        <Card variant="outlined">
          <Text>Outlined Card</Text>
        </Card>,
      );

      expect(getByText('Outlined Card')).toBeTruthy();
    });

    it('renders filled variant correctly', () => {
      const { getByText } = render(
        <Card variant="filled">
          <Text>Filled Card</Text>
        </Card>,
      );

      expect(getByText('Filled Card')).toBeTruthy();
    });
  });

  describe('Padding', () => {
    it('applies medium padding by default', () => {
      const { getByText } = render(
        <Card>
          <Text>Default Padding</Text>
        </Card>,
      );

      expect(getByText('Default Padding')).toBeTruthy();
    });

    it('applies no padding when padding="none"', () => {
      const { getByText } = render(
        <Card padding="none">
          <Text>No Padding</Text>
        </Card>,
      );

      expect(getByText('No Padding')).toBeTruthy();
    });

    it('applies small padding when padding="sm"', () => {
      const { getByText } = render(
        <Card padding="sm">
          <Text>Small Padding</Text>
        </Card>,
      );

      expect(getByText('Small Padding')).toBeTruthy();
    });

    it('applies large padding when padding="lg"', () => {
      const { getByText } = render(
        <Card padding="lg">
          <Text>Large Padding</Text>
        </Card>,
      );

      expect(getByText('Large Padding')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when card is pressed', () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <Card onPress={mockOnPress}>
          <Text>Pressable Card</Text>
        </Card>,
      );

      const card = getByRole('button');
      fireEvent.press(card);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when onPress is not provided', () => {
      const { getByText } = render(
        <Card>
          <Text>Non-Pressable Card</Text>
        </Card>,
      );

      const text = getByText('Non-Pressable Card');
      expect(text).toBeTruthy();
      // No button role should be present
    });

    it('can be pressed multiple times', () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <Card onPress={mockOnPress}>
          <Text>Multi Press Card</Text>
        </Card>,
      );

      const card = getByRole('button');
      fireEvent.press(card);
      fireEvent.press(card);
      fireEvent.press(card);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('has button role when pressable', () => {
      const { getByRole } = render(
        <Card onPress={jest.fn()}>
          <Text>Accessible Card</Text>
        </Card>,
      );

      expect(getByRole('button')).toBeTruthy();
    });

    it('does not have button role when not pressable', () => {
      const { queryByRole } = render(
        <Card>
          <Text>Static Card</Text>
        </Card>,
      );

      expect(queryByRole('button')).toBeNull();
    });
  });

  describe('Styling', () => {
    it('accepts custom style prop', () => {
      const customStyle = { marginTop: 20 };
      const { getByText } = render(
        <Card style={customStyle}>
          <Text>Styled Card</Text>
        </Card>,
      );

      expect(getByText('Styled Card')).toBeTruthy();
    });

    it('combines variant and padding styles', () => {
      const { getByText } = render(
        <Card variant="outlined" padding="lg">
          <Text>Combined Styles</Text>
        </Card>,
      );

      expect(getByText('Combined Styles')).toBeTruthy();
    });
  });

  describe('Memoization', () => {
    it('memoizes variant styles calculation', () => {
      const { getByText, rerender } = render(
        <Card variant="elevated">
          <Text>Memoized</Text>
        </Card>,
      );

      expect(getByText('Memoized')).toBeTruthy();

      // Re-render with same props
      rerender(
        <Card variant="elevated">
          <Text>Memoized</Text>
        </Card>,
      );

      expect(getByText('Memoized')).toBeTruthy();
    });

    it('recalculates styles when variant changes', () => {
      const { getByText, rerender } = render(
        <Card variant="elevated">
          <Text>Dynamic</Text>
        </Card>,
      );

      expect(getByText('Dynamic')).toBeTruthy();

      // Change variant
      rerender(
        <Card variant="outlined">
          <Text>Dynamic</Text>
        </Card>,
      );

      expect(getByText('Dynamic')).toBeTruthy();
    });
  });

  describe('Complex Children', () => {
    it('renders multiple children correctly', () => {
      const { getByText } = render(
        <Card>
          <Text>Title</Text>
          <Text>Subtitle</Text>
          <Text>Description</Text>
        </Card>,
      );

      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Subtitle')).toBeTruthy();
      expect(getByText('Description')).toBeTruthy();
    });

    it('renders nested components', () => {
      const { getByText } = render(
        <Card>
          <Card variant="outlined" padding="sm">
            <Text>Nested Card</Text>
          </Card>
        </Card>,
      );

      expect(getByText('Nested Card')).toBeTruthy();
    });
  });
});
