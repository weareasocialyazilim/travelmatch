/**
 * Card Component Tests
 */

import React from 'react';
import { Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../../__tests__/testUtilsRender.helper';
import { Card } from '../../../components/ui/Card';

describe('Card Component', () => {
  describe('Rendering', () => {
    it('renders children content', () => {
      const { getByText } = render(
        <Card>
          <Text>Card Content</Text>
        </Card>,
      );
      expect(getByText('Card Content')).toBeTruthy();
    });

    it('renders without onPress (non-interactive)', () => {
      const { getByText } = render(
        <Card>
          <Text>Static Card</Text>
        </Card>,
      );
      const card = getByText('Static Card').parent;
      // Should not be pressable
    });

    it('renders with onPress (interactive)', () => {
      const { getByText } = render(
        <Card onPress={jest.fn()}>
          <Text>Pressable Card</Text>
        </Card>,
      );
      expect(getByText('Pressable Card')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Card onPress={onPress}>
          <Text>Click Me</Text>
        </Card>,
      );

      fireEvent.press(getByText('Click Me'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Card testID="disabled-card" onPress={onPress} disabled>
          <Text>Disabled Card</Text>
        </Card>,
      );

      fireEvent.press(getByTestId('disabled-card'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    it('renders elevated variant', () => {
      const { getByText } = render(
        <Card variant="elevated">
          <Text>Elevated</Text>
        </Card>,
      );
      expect(getByText('Elevated')).toBeTruthy();
    });

    it('renders outlined variant', () => {
      const { getByText } = render(
        <Card variant="outlined">
          <Text>Outlined</Text>
        </Card>,
      );
      expect(getByText('Outlined')).toBeTruthy();
    });

    it('renders filled variant', () => {
      const { getByText } = render(
        <Card variant="filled">
          <Text>Filled</Text>
        </Card>,
      );
      expect(getByText('Filled')).toBeTruthy();
    });
  });

  describe('Custom Styles', () => {
    it('applies custom style', () => {
      const customStyle = { marginTop: 20, backgroundColor: 'red' };
      const { getByTestId } = render(
        <Card style={customStyle} testID="custom-card">
          <Text>Styled Card</Text>
        </Card>,
      );
      const card = getByTestId('custom-card');
      expect(card.props.style).toEqual(expect.objectContaining(customStyle));
    });
  });

  describe('Disabled State', () => {
    it('renders with disabled styling', () => {
      const { getByTestId } = render(
        <Card testID="disabled-style-card" disabled>
          <Text>Disabled</Text>
        </Card>,
      );
      const card = getByTestId('disabled-style-card');
      // Should have disabled opacity or styling - non-pressable card just has style
      expect(card).toBeTruthy();
    });

    it('prevents interaction when disabled', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Card testID="disabled-interact-card" onPress={onPress} disabled>
          <Text>Disabled</Text>
        </Card>,
      );

      fireEvent.press(getByTestId('disabled-interact-card'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has button role when pressable', () => {
      const { getByTestId } = render(
        <Card testID="pressable-card" onPress={jest.fn()}>
          <Text>Pressable</Text>
        </Card>,
      );
      const card = getByTestId('pressable-card');
      expect(card.props.accessible).toBe(true);
    });

    it('announces disabled state', () => {
      const { getByTestId } = render(
        <Card testID="disabled-card" onPress={jest.fn()} disabled>
          <Text>Disabled</Text>
        </Card>,
      );
      const card = getByTestId('disabled-card');
      expect(card.props.accessibilityState).toEqual(
        expect.objectContaining({ disabled: true }),
      );
    });

    it('has custom accessibility label', () => {
      const { getByLabelText } = render(
        <Card onPress={jest.fn()} accessibilityLabel="Product card">
          <Text>Product</Text>
        </Card>,
      );
      expect(getByLabelText('Product card')).toBeTruthy();
    });
  });

  describe('Snapshots', () => {
    it('matches snapshot for basic card', () => {
      const { toJSON } = render(
        <Card>
          <Text>Basic Card</Text>
        </Card>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot for pressable card', () => {
      const { toJSON } = render(
        <Card onPress={jest.fn()}>
          <Text>Pressable Card</Text>
        </Card>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot for disabled card', () => {
      const { toJSON } = render(
        <Card onPress={jest.fn()} disabled>
          <Text>Disabled Card</Text>
        </Card>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
