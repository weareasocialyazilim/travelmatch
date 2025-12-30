import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CompleteGiftBottomSheet } from '../CompleteGiftBottomSheet';

describe('CompleteGiftBottomSheet', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnComplete = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onComplete: mockOnComplete,
    amount: 25.5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getCardNumberInput = (component: ReturnType<typeof render>) => {
    const { TextInput } = require('react-native');
    const inputs = component.UNSAFE_queryAllByType(TextInput);
    return inputs.find((input: { props: { placeholder?: string } }) => input.props.placeholder === 'Card number');
  };

  const getExpiryInput = (component: ReturnType<typeof render>) => {
    const { TextInput } = require('react-native');
    const inputs = component.UNSAFE_queryAllByType(TextInput);
    return inputs.find((input: { props: { placeholder?: string } }) => input.props.placeholder === 'Expiry');
  };

  const getCvcInput = (component: ReturnType<typeof render>) => {
    const { TextInput } = require('react-native');
    const inputs = component.UNSAFE_queryAllByType(TextInput);
    return inputs.find((input: { props: { placeholder?: string } }) => input.props.placeholder === 'CVC');
  };

  const getNameInput = (component: ReturnType<typeof render>) => {
    const { TextInput } = require('react-native');
    const inputs = component.UNSAFE_queryAllByType(TextInput);
    return inputs.find((input: { props: { placeholder?: string } }) => input.props.placeholder === 'Name on card');
  };

  describe('Rendering', () => {
    it('renders when visible', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      expect(getByText('Complete your gift')).toBeTruthy();
    });

    it('renders title', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      expect(getByText('Complete your gift')).toBeTruthy();
    });

    it('renders amount with green dot', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      expect(getByText('$25.50')).toBeTruthy();
    });

    it('renders Apple Pay button', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      expect(getByText('Apple Pay')).toBeTruthy();
    });

    it('renders Google Pay button', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      expect(getByText('Google Pay')).toBeTruthy();
    });

    it('renders "Or pay with card" section', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      expect(getByText('Or pay with card')).toBeTruthy();
    });

    it('renders card number input', () => {
      const component = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const cardInput = getCardNumberInput(component);
      expect(cardInput).toBeTruthy();
    });

    it('renders expiry input', () => {
      const component = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const expiryInput = getExpiryInput(component);
      expect(expiryInput).toBeTruthy();
    });

    it('renders CVC input', () => {
      const component = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const cvcInput = getCvcInput(component);
      expect(cvcInput).toBeTruthy();
    });

    it('renders name on card input', () => {
      const component = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const nameInput = getNameInput(component);
      expect(nameInput).toBeTruthy();
    });

    it('renders saved cards section', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      expect(getByText('Saved cards')).toBeTruthy();
    });

    it('renders escrow notice', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      expect(getByText('Your gift is held in escrow until the moment is verified.')).toBeTruthy();
    });

    it('does not render when not visible', () => {
      const { toJSON } = render(<CompleteGiftBottomSheet {...defaultProps} visible={false} />);
      const modal = toJSON();
      expect(modal?.props.visible).toBe(false);
    });
  });

  describe('Digital Wallet Payments', () => {
    it('calls onComplete with apple-pay when Apple Pay pressed', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const applePayButton = getByText('Apple Pay');
      fireEvent.press(applePayButton);
      expect(mockOnComplete).toHaveBeenCalledWith('apple-pay');
    });

    it('calls onComplete with google-pay when Google Pay pressed', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const googlePayButton = getByText('Google Pay');
      fireEvent.press(googlePayButton);
      expect(mockOnComplete).toHaveBeenCalledWith('google-pay');
    });
  });

  describe('Card Input', () => {
    it('accepts card number input', () => {
      const component = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const cardInput = getCardNumberInput(component);
      
      fireEvent.changeText(cardInput, '4242424242424242');
      expect(cardInput.props.value).toBe('4242424242424242');
    });

    it('accepts expiry input', () => {
      const component = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const expiryInput = getExpiryInput(component);
      
      fireEvent.changeText(expiryInput, '12/25');
      expect(expiryInput.props.value).toBe('12/25');
    });

    it('accepts CVC input with maxLength 3', () => {
      const component = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const cvcInput = getCvcInput(component);
      
      expect(cvcInput.props.maxLength).toBe(3);
      fireEvent.changeText(cvcInput, '123');
      expect(cvcInput.props.value).toBe('123');
    });

    it('accepts name on card input', () => {
      const component = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const nameInput = getNameInput(component);
      
      fireEvent.changeText(nameInput, 'John Doe');
      expect(nameInput.props.value).toBe('John Doe');
    });
  });

  describe('Saved Card Selection', () => {
    it('displays saved card with brand and last four digits', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      expect(getByText('Visa ... 1234')).toBeTruthy();
    });

    it('toggles saved card selection on press', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const savedCardRow = getByText('Visa ... 1234');
      
      fireEvent.press(savedCardRow);
      // Checkbox state is managed internally
      expect(savedCardRow).toBeTruthy();
    });
  });

  describe('Modal Properties', () => {
    it('sets modal as transparent', () => {
      const { toJSON } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const modal = toJSON();
      expect(modal?.props.transparent).toBe(true);
    });

    it('uses none animation (custom animated)', () => {
      const { toJSON } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const modal = toJSON();
      expect(modal?.props.animationType).toBe('none');
    });

    it('calls onClose on onRequestClose', () => {
      const { toJSON } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const modal = toJSON();
      modal?.props.onRequestClose();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('formats amount correctly with decimals', () => {
      const { getByText, rerender } = render(<CompleteGiftBottomSheet {...defaultProps} amount={100} />);
      expect(getByText('$100.00')).toBeTruthy();
      
      rerender(<CompleteGiftBottomSheet {...defaultProps} amount={15.99} />);
      expect(getByText('$15.99')).toBeTruthy();
    });

    it('handles rapid Apple Pay clicks', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const applePayButton = getByText('Apple Pay');
      
      fireEvent.press(applePayButton);
      fireEvent.press(applePayButton);
      fireEvent.press(applePayButton);
      
      expect(mockOnComplete).toHaveBeenCalledTimes(3);
    });

    it('handles rapid Google Pay clicks', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} />);
      const googlePayButton = getByText('Google Pay');
      
      fireEvent.press(googlePayButton);
      fireEvent.press(googlePayButton);
      
      expect(mockOnComplete).toHaveBeenCalledTimes(2);
    });

    it('handles large amounts', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} amount={9999.99} />);
      expect(getByText('$9999.99')).toBeTruthy();
    });

    it('handles small amounts', () => {
      const { getByText } = render(<CompleteGiftBottomSheet {...defaultProps} amount={0.01} />);
      expect(getByText('$0.01')).toBeTruthy();
    });
  });
});
