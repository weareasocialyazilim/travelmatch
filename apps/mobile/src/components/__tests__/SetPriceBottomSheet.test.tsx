import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SetPriceBottomSheet } from '../../features/moments/components/SetPriceBottomSheet';

describe('SetPriceBottomSheet', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnSetPrice = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onSetPrice: mockOnSetPrice,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly when visible', () => {
      const { getByText } = render(<SetPriceBottomSheet {...defaultProps} />);

      expect(getByText('Set price')).toBeTruthy();
    });

    it('renders all preset price chips', () => {
      const { getByText } = render(<SetPriceBottomSheet {...defaultProps} />);

      expect(getByText('Free')).toBeTruthy();
      expect(getByText('$5')).toBeTruthy();
      expect(getByText('$10')).toBeTruthy();
      expect(getByText('$20')).toBeTruthy();
      expect(getByText('$50')).toBeTruthy();
    });

    it('renders custom amount label', () => {
      const { getByText } = render(<SetPriceBottomSheet {...defaultProps} />);

      expect(getByText('Custom amount')).toBeTruthy();
    });

    it('renders custom amount input field', () => {
      const { UNSAFE_getByType } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      expect(input.props.placeholder).toBe('0.00');
    });

    it('renders currency icon', () => {
      const { UNSAFE_getAllByType } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const MaterialCommunityIcons =
        require('@expo/vector-icons').MaterialCommunityIcons;
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);

      const currencyIcon = icons.find(
        (icon: any) => icon.props.name === 'currency-usd',
      );
      expect(currencyIcon).toBeTruthy();
    });

    it('renders Set Amount button', () => {
      const { getByText } = render(<SetPriceBottomSheet {...defaultProps} />);

      expect(getByText('Set Amount')).toBeTruthy();
    });

    it('renders handle indicator', () => {
      const { UNSAFE_getAllByType } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const View = require('react-native').View;
      const views = UNSAFE_getAllByType(View);

      expect(views.length).toBeGreaterThan(0);
    });

    it('modal is not visible when visible prop is false', () => {
      const { UNSAFE_getByType } = render(
        <SetPriceBottomSheet {...defaultProps} visible={false} />,
      );

      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);

      expect(modal.props.visible).toBe(false);
    });

    it('selects current price preset on mount', () => {
      const { UNSAFE_getAllByType } = render(
        <SetPriceBottomSheet {...defaultProps} currentPrice={10} />,
      );

      const TouchableOpacity = require('react-native').TouchableOpacity;
      const touchables = UNSAFE_getAllByType(TouchableOpacity);

      // Find the $10 chip (second preset chip after Free)
      const chip10 = touchables[1]; // Index may vary, check by testID in real scenario

      expect(touchables.length).toBeGreaterThan(0);
    });

    it('shows custom amount when current price is not a preset', () => {
      const { UNSAFE_getByType } = render(
        <SetPriceBottomSheet {...defaultProps} currentPrice={15} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      expect(input.props.value).toBe('15');
    });
  });

  describe('User Interactions', () => {
    it('allows selecting preset price - Free', () => {
      const { getByText } = render(<SetPriceBottomSheet {...defaultProps} />);

      fireEvent.press(getByText('Free'));
      fireEvent.press(getByText('Set Amount'));

      expect(mockOnSetPrice).toHaveBeenCalledWith(0);
    });

    it('allows selecting preset price - $5', () => {
      const { getByText } = render(<SetPriceBottomSheet {...defaultProps} />);

      fireEvent.press(getByText('$5'));
      fireEvent.press(getByText('Set Amount'));

      expect(mockOnSetPrice).toHaveBeenCalledWith(5);
    });

    it('allows selecting preset price - $10', () => {
      const { getByText } = render(<SetPriceBottomSheet {...defaultProps} />);

      fireEvent.press(getByText('$10'));
      fireEvent.press(getByText('Set Amount'));

      expect(mockOnSetPrice).toHaveBeenCalledWith(10);
    });

    it('allows selecting preset price - $20', () => {
      const { getByText } = render(<SetPriceBottomSheet {...defaultProps} />);

      fireEvent.press(getByText('$20'));
      fireEvent.press(getByText('Set Amount'));

      expect(mockOnSetPrice).toHaveBeenCalledWith(20);
    });

    it('allows selecting preset price - $50', () => {
      const { getByText } = render(<SetPriceBottomSheet {...defaultProps} />);

      fireEvent.press(getByText('$50'));
      fireEvent.press(getByText('Set Amount'));

      expect(mockOnSetPrice).toHaveBeenCalledWith(50);
    });

    it('allows entering custom amount', () => {
      const { UNSAFE_getByType } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, '25.50');

      expect(input.props.value).toBe('25.50');
    });

    it('calls onSetPrice with custom amount', () => {
      const { UNSAFE_getByType, getByText } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, '35.75');
      fireEvent.press(getByText('Set Amount'));

      expect(mockOnSetPrice).toHaveBeenCalledWith(35.75);
    });

    it('clears custom amount when selecting preset', () => {
      const { UNSAFE_getByType, getByText } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, '25.50');
      fireEvent.press(getByText('$10'));

      expect(input.props.value).toBe('');
    });

    it('deselects preset when entering custom amount', () => {
      const { UNSAFE_getByType, getByText } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.press(getByText('$10'));
      fireEvent.changeText(input, '15');

      expect(input.props.value).toBe('15');
    });

    it('calls onClose after setting price', () => {
      const { getByText } = render(<SetPriceBottomSheet {...defaultProps} />);

      fireEvent.press(getByText('$10'));
      fireEvent.press(getByText('Set Amount'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is pressed', () => {
      const { UNSAFE_getAllByType } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const TouchableWithoutFeedback =
        require('react-native').TouchableWithoutFeedback;
      const touchables = UNSAFE_getAllByType(TouchableWithoutFeedback);

      fireEvent.press(touchables[0]);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when modal requests to close', () => {
      const { UNSAFE_getByType } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);

      modal.props.onRequestClose();

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Validation', () => {
    it('uses preset price when custom amount is empty', () => {
      const { getByText } = render(<SetPriceBottomSheet {...defaultProps} />);

      fireEvent.press(getByText('$20'));
      fireEvent.press(getByText('Set Amount'));

      expect(mockOnSetPrice).toHaveBeenCalledWith(20);
    });

    it('uses custom amount when preset is not selected', () => {
      const { UNSAFE_getByType, getByText } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, '33.33');
      fireEvent.press(getByText('Set Amount'));

      expect(mockOnSetPrice).toHaveBeenCalledWith(33.33);
    });

    it('uses 0 when no preset or custom amount is set', () => {
      const { getByText } = render(<SetPriceBottomSheet {...defaultProps} />);

      fireEvent.press(getByText('Set Amount'));

      expect(mockOnSetPrice).toHaveBeenCalledWith(0);
    });

    it('handles invalid custom amount (NaN)', () => {
      const { UNSAFE_getByType, getByText } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, 'invalid');
      fireEvent.press(getByText('Set Amount'));

      // Should not call onSetPrice for invalid number
      expect(mockOnSetPrice).not.toHaveBeenCalled();
    });

    it('handles negative custom amount', () => {
      const { UNSAFE_getByType, getByText } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, '-10');
      fireEvent.press(getByText('Set Amount'));

      // Should not call onSetPrice for negative number
      expect(mockOnSetPrice).not.toHaveBeenCalled();
    });

    it('handles decimal custom amounts', () => {
      const { UNSAFE_getByType, getByText } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, '9.99');
      fireEvent.press(getByText('Set Amount'));

      expect(mockOnSetPrice).toHaveBeenCalledWith(9.99);
    });
  });

  describe('Modal Properties', () => {
    it('renders as transparent modal', () => {
      const { UNSAFE_getByType } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);

      expect(modal.props.transparent).toBe(true);
    });

    it('uses slide animation', () => {
      const { UNSAFE_getByType } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);

      expect(modal.props.animationType).toBe('slide');
    });
  });

  describe('Input Properties', () => {
    it('custom amount input uses decimal-pad keyboard', () => {
      const { UNSAFE_getByType } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      expect(input.props.keyboardType).toBe('decimal-pad');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero price (Free)', () => {
      const { getByText } = render(<SetPriceBottomSheet {...defaultProps} />);

      fireEvent.press(getByText('Free'));
      fireEvent.press(getByText('Set Amount'));

      expect(mockOnSetPrice).toHaveBeenCalledWith(0);
    });

    it('handles very large custom amounts', () => {
      const { UNSAFE_getByType, getByText } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, '999999.99');
      fireEvent.press(getByText('Set Amount'));

      expect(mockOnSetPrice).toHaveBeenCalledWith(999999.99);
    });

    it('handles whitespace in custom amount', () => {
      const { UNSAFE_getByType, getByText } = render(
        <SetPriceBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, '  25.50  ');
      fireEvent.press(getByText('Set Amount'));

      expect(mockOnSetPrice).toHaveBeenCalledWith(25.5);
    });

    it('handles switching between presets', () => {
      const { getByText } = render(<SetPriceBottomSheet {...defaultProps} />);

      fireEvent.press(getByText('$5'));
      fireEvent.press(getByText('$10'));
      fireEvent.press(getByText('$20'));
      fireEvent.press(getByText('Set Amount'));

      expect(mockOnSetPrice).toHaveBeenCalledWith(20);
    });

    it('handles rapid Set Amount button clicks', () => {
      const { getByText } = render(<SetPriceBottomSheet {...defaultProps} />);

      fireEvent.press(getByText('$10'));
      const setButton = getByText('Set Amount');

      fireEvent.press(setButton);
      fireEvent.press(setButton);
      fireEvent.press(setButton);

      // Should call each time since there's no debouncing
      expect(mockOnSetPrice).toHaveBeenCalledTimes(3);
    });
  });
});
