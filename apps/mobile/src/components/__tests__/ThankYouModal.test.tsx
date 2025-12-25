import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { ThankYouModal } from '../ThankYouModal';

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock @expo/vector-icons with a proper forwardRef component
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const MockIcon = React.forwardRef(
    ({ name, size, color, ...props }: any, ref: any) => (
      <View {...props} testID={`icon-${name}`} ref={ref}>
        <Text>{name}</Text>
      </View>
    ),
  );
  MockIcon.displayName = 'Icon';
  return MockIcon;
});

jest.mock('@expo/vector-icons', () => {
  const MockIcon = require('@expo/vector-icons/MaterialCommunityIcons');
  return {
    MaterialCommunityIcons: MockIcon,
  };
});

describe('ThankYouModal', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    giverName: 'John Doe',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders modal when visible is true', () => {
      const { getByText } = render(<ThankYouModal {...defaultProps} />);

      expect(getByText('Thank You Sent!')).toBeTruthy();
    });

    it('renders with giver name in message', () => {
      const { getByText } = render(
        <ThankYouModal {...defaultProps} giverName="Alice" />,
      );

      expect(
        getByText('Your gratitude message has been sent to Alice.'),
      ).toBeTruthy();
    });

    it('renders with amount in message when provided', () => {
      const { getByText } = render(
        <ThankYouModal {...defaultProps} giverName="Bob" amount={50} />,
      );

      expect(
        getByText(
          'Your gratitude message has been sent to Bob for their 50 contribution.',
        ),
      ).toBeTruthy();
    });

    it('renders without amount in message when not provided', () => {
      const { getByText } = render(
        <ThankYouModal {...defaultProps} giverName="Charlie" />,
      );

      expect(
        getByText('Your gratitude message has been sent to Charlie.'),
      ).toBeTruthy();
    });

    it('renders check-circle icon', () => {
      const { getByTestId } = render(<ThankYouModal {...defaultProps} />);

      // Icon mock renders with testID="icon-{name}"
      const checkIcon = getByTestId('icon-check-circle');
      expect(checkIcon).toBeTruthy();
    });

    it('renders heart icon in note card', () => {
      const { getByTestId } = render(<ThankYouModal {...defaultProps} />);

      // Icon mock renders with testID="icon-{name}"
      const heartIcon = getByTestId('icon-heart');
      expect(heartIcon).toBeTruthy();
    });

    it('renders appreciation note', () => {
      const { getByText } = render(<ThankYouModal {...defaultProps} />);

      expect(
        getByText('Gratitude strengthens the bond of kindness'),
      ).toBeTruthy();
    });

    it('renders Continue button', () => {
      const { getByText } = render(<ThankYouModal {...defaultProps} />);

      expect(getByText('Continue')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when Continue button is pressed', () => {
      const { getByText } = render(<ThankYouModal {...defaultProps} />);

      fireEvent.press(getByText('Continue'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('allows multiple Continue presses', () => {
      const { getByText } = render(<ThankYouModal {...defaultProps} />);

      fireEvent.press(getByText('Continue'));
      fireEvent.press(getByText('Continue'));
      fireEvent.press(getByText('Continue'));

      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });
  });

  describe('Modal Behavior', () => {
    it('has transparent prop set to true', () => {
      const { UNSAFE_getByType } = render(<ThankYouModal {...defaultProps} />);

      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);

      expect(modal.props.transparent).toBe(true);
    });

    it('has none animation type', () => {
      const { UNSAFE_getByType } = render(<ThankYouModal {...defaultProps} />);

      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);

      expect(modal.props.animationType).toBe('none');
    });

    it('calls onClose when modal requests close', () => {
      const { UNSAFE_getByType } = render(<ThankYouModal {...defaultProps} />);

      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);

      modal.props.onRequestClose();

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not render when visible is false', () => {
      const { UNSAFE_getByType } = render(
        <ThankYouModal {...defaultProps} visible={false} />,
      );

      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);

      expect(modal.props.visible).toBe(false);
    });
  });

  describe('Giver Name Display', () => {
    it('handles short names', () => {
      const { getByText } = render(
        <ThankYouModal {...defaultProps} giverName="Jo" />,
      );

      expect(
        getByText('Your gratitude message has been sent to Jo.'),
      ).toBeTruthy();
    });

    it('handles long names', () => {
      const { getByText } = render(
        <ThankYouModal
          {...defaultProps}
          giverName="Christopher Alexander Wellington"
        />,
      );

      expect(
        getByText(
          'Your gratitude message has been sent to Christopher Alexander Wellington.',
        ),
      ).toBeTruthy();
    });

    it('handles names with special characters', () => {
      const { getByText } = render(
        <ThankYouModal {...defaultProps} giverName="O'Brien-Smith" />,
      );

      expect(
        getByText("Your gratitude message has been sent to O'Brien-Smith."),
      ).toBeTruthy();
    });

    it('handles empty name', () => {
      const { getByText } = render(
        <ThankYouModal {...defaultProps} giverName="" />,
      );

      expect(
        getByText('Your gratitude message has been sent to .'),
      ).toBeTruthy();
    });
  });

  describe('Amount Display', () => {
    it('handles small amounts', () => {
      const { getByText } = render(
        <ThankYouModal {...defaultProps} amount={1} />,
      );

      expect(getByText(/for their 1 contribution/)).toBeTruthy();
    });

    it('handles large amounts', () => {
      const { getByText } = render(
        <ThankYouModal {...defaultProps} amount={999999} />,
      );

      expect(getByText(/for their 999999 contribution/)).toBeTruthy();
    });

    it('handles decimal amounts', () => {
      const { getByText } = render(
        <ThankYouModal {...defaultProps} amount={123.45} />,
      );

      expect(getByText(/for their 123.45 contribution/)).toBeTruthy();
    });

    it('handles zero amount', () => {
      const { getAllByText } = render(
        <ThankYouModal {...defaultProps} amount={0} />,
      );

      // Component shows the full message with "0" in it
      const texts = getAllByText(/John Doe.*0/);
      expect(texts.length).toBeGreaterThan(0);
    });
  });

  describe('LinearGradient', () => {
    it('renders LinearGradient component', () => {
      const { UNSAFE_getByType } = render(<ThankYouModal {...defaultProps} />);

      const LinearGradient = require('expo-linear-gradient').LinearGradient;
      const gradient = UNSAFE_getByType(LinearGradient);

      expect(gradient).toBeTruthy();
    });

    it('has correct gradient colors prop', () => {
      const { UNSAFE_getByType } = render(<ThankYouModal {...defaultProps} />);

      const LinearGradient = require('expo-linear-gradient').LinearGradient;
      const gradient = UNSAFE_getByType(LinearGradient);

      expect(gradient.props.colors).toBeDefined();
      expect(Array.isArray(gradient.props.colors)).toBe(true);
      expect(gradient.props.colors.length).toBe(2);
    });

    it('has correct gradient start/end points', () => {
      const { UNSAFE_getByType } = render(<ThankYouModal {...defaultProps} />);

      const LinearGradient = require('expo-linear-gradient').LinearGradient;
      const gradient = UNSAFE_getByType(LinearGradient);

      expect(gradient.props.start).toEqual({ x: 0, y: 0 });
      expect(gradient.props.end).toEqual({ x: 1, y: 1 });
    });
  });

  describe('Accessibility', () => {
    it('Continue button is touchable', () => {
      const { getByText } = render(<ThankYouModal {...defaultProps} />);

      const continueButton = getByText('Continue').parent?.parent;
      expect(continueButton).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined onClose gracefully', () => {
      const { getByText } = render(
        <ThankYouModal {...defaultProps} onClose={undefined} />,
      );

      expect(() => fireEvent.press(getByText('Continue'))).not.toThrow();
    });

    it('handles negative amount', () => {
      const { getByText } = render(
        <ThankYouModal {...defaultProps} amount={-50} />,
      );

      expect(getByText(/for their -50 contribution/)).toBeTruthy();
    });

    it('renders correctly when visible changes from true to false', () => {
      const { rerender, UNSAFE_getByType } = render(
        <ThankYouModal {...defaultProps} visible={true} />,
      );

      const { Modal } = require('react-native');
      let modal = UNSAFE_getByType(Modal);
      expect(modal.props.visible).toBe(true);

      rerender(<ThankYouModal {...defaultProps} visible={false} />);

      modal = UNSAFE_getByType(Modal);
      expect(modal.props.visible).toBe(false);
    });

    it('renders correctly when visible changes from false to true', () => {
      const { rerender, UNSAFE_getByType } = render(
        <ThankYouModal {...defaultProps} visible={false} />,
      );

      const { Modal } = require('react-native');
      let modal = UNSAFE_getByType(Modal);
      expect(modal.props.visible).toBe(false);

      rerender(<ThankYouModal {...defaultProps} visible={true} />);

      modal = UNSAFE_getByType(Modal);
      expect(modal.props.visible).toBe(true);
    });
  });

  describe('Component Structure', () => {
    it('renders animated view', () => {
      const { UNSAFE_getAllByType } = render(
        <ThankYouModal {...defaultProps} />,
      );

      const Animated = require('react-native-reanimated').default;
      const animatedViews = UNSAFE_getAllByType(Animated.View);

      expect(animatedViews.length).toBeGreaterThan(0);
    });

    it('renders multiple Text components', () => {
      const { UNSAFE_getAllByType } = render(
        <ThankYouModal {...defaultProps} />,
      );

      const { Text } = require('react-native');
      const texts = UNSAFE_getAllByType(Text);

      // Should have title, message, note text, and button text
      expect(texts.length).toBeGreaterThanOrEqual(4);
    });

    it('renders multiple View components', () => {
      const { UNSAFE_getAllByType } = render(
        <ThankYouModal {...defaultProps} />,
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);

      // Should have overlay, modal, iconContainer, noteCard, closeButton, whiteButton
      expect(views.length).toBeGreaterThanOrEqual(5);
    });
  });
});
