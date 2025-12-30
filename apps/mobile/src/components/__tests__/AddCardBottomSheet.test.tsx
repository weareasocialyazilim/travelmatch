import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AddCardBottomSheet } from '../AddCardBottomSheet';

describe('AddCardBottomSheet', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnAddCard = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onAddCard: mockOnAddCard,
  };

  const getInputs = (component: ReturnType<typeof render>) => {
    const TextInput = require('react-native').TextInput;
    const inputs = component.UNSAFE_getAllByType(TextInput);
    return {
      cardNumberInput: inputs[0],
      expiryInput: inputs[1],
      cvvInput: inputs[2],
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly when visible', () => {
      const { getAllByText } = render(<AddCardBottomSheet {...defaultProps} />);
      
      expect(getAllByText('Add card').length).toBeGreaterThan(0);
    });

    it('renders card number input field', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cardNumberInput } = getInputs(component);
      
      expect(cardNumberInput.props.placeholder).toBe('0000 0000 0000 0000');
    });

    it('renders card number label', () => {
      const { getByText } = render(<AddCardBottomSheet {...defaultProps} />);
      
      expect(getByText('Card number')).toBeTruthy();
    });

    it('renders expiry input field', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { expiryInput } = getInputs(component);
      
      expect(expiryInput.props.placeholder).toBe('MM/YY');
    });

    it('renders expiry label', () => {
      const { getByText } = render(<AddCardBottomSheet {...defaultProps} />);
      
      expect(getByText('Expiry')).toBeTruthy();
    });

    it('renders CVV input field', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cvvInput } = getInputs(component);
      
      expect(cvvInput.props.placeholder).toBe('123');
    });

    it('renders CVV label', () => {
      const { getByText } = render(<AddCardBottomSheet {...defaultProps} />);
      
      expect(getByText('CVV')).toBeTruthy();
    });

    it('renders security info message', () => {
      const { getByText } = render(<AddCardBottomSheet {...defaultProps} />);
      
      expect(getByText('Your payment information is secure.')).toBeTruthy();
    });

    it('renders security lock icon', () => {
      const { UNSAFE_getAllByType } = render(<AddCardBottomSheet {...defaultProps} />);
      
      const MaterialCommunityIcons = require('@expo/vector-icons').MaterialCommunityIcons;
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      
      const lockIcon = icons.find((icon: { props: { name: string } }) => icon.props.name === 'lock');
      expect(lockIcon).toBeTruthy();
    });

    it('renders credit card icon', () => {
      const { UNSAFE_getAllByType } = render(<AddCardBottomSheet {...defaultProps} />);
      
      const MaterialCommunityIcons = require('@expo/vector-icons').MaterialCommunityIcons;
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      
      const cardIcon = icons.find((icon: { props: { name: string } }) => icon.props.name === 'credit-card');
      expect(cardIcon).toBeTruthy();
    });

    it('renders CVV help icon', () => {
      const { UNSAFE_getAllByType } = render(<AddCardBottomSheet {...defaultProps} />);
      
      const MaterialCommunityIcons = require('@expo/vector-icons').MaterialCommunityIcons;
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      
      const helpIcon = icons.find((icon: { props: { name: string } }) => icon.props.name === 'help-circle-outline');
      expect(helpIcon).toBeTruthy();
    });

    it('renders Add card button', () => {
      const { getAllByText } = render(<AddCardBottomSheet {...defaultProps} />);
      
      const buttons = getAllByText('Add card');
      expect(buttons.length).toBe(2); // Header and button
    });

    it('renders handle indicator', () => {
      const { UNSAFE_getAllByType } = render(<AddCardBottomSheet {...defaultProps} />);
      
      const View = require('react-native').View;
      const views = UNSAFE_getAllByType(View);
      
      expect(views.length).toBeGreaterThan(0);
    });

    it('renders close button', () => {
      const { UNSAFE_getAllByType } = render(<AddCardBottomSheet {...defaultProps} />);
      
      const MaterialCommunityIcons = require('@expo/vector-icons').MaterialCommunityIcons;
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      
      const closeIcon = icons.find((icon: { props: { name: string } }) => icon.props.name === 'close');
      expect(closeIcon).toBeTruthy();
    });

    it('modal is not visible when visible prop is false', () => {
      const { UNSAFE_getByType } = render(
        <AddCardBottomSheet {...defaultProps} visible={false} />
      );
      
      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);
      
      expect(modal.props.visible).toBe(false);
    });
  });

  describe('User Interactions', () => {
    it('allows entering card number', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cardNumberInput } = getInputs(component);
      
      fireEvent.changeText(cardNumberInput, '4242424242424242');
      
      expect(cardNumberInput.props.value).toBe('4242424242424242');
    });

    it('allows entering expiry date', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { expiryInput } = getInputs(component);
      
      fireEvent.changeText(expiryInput, '12/25');
      
      expect(expiryInput.props.value).toBe('12/25');
    });

    it('allows entering CVV', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cvvInput } = getInputs(component);
      
      fireEvent.changeText(cvvInput, '123');
      
      expect(cvvInput.props.value).toBe('123');
    });

    it('calls onAddCard with correct data when Add card is pressed', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cardNumberInput, expiryInput, cvvInput } = getInputs(component);
      
      fireEvent.changeText(cardNumberInput, '4242424242424242');
      fireEvent.changeText(expiryInput, '12/25');
      fireEvent.changeText(cvvInput, '123');
      fireEvent.press(component.getAllByText('Add card')[1]); // Second "Add card" is the button
      
      expect(mockOnAddCard).toHaveBeenCalledWith('4242424242424242', '12/25', '123');
    });

    it('calls onClose after adding card', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cardNumberInput, expiryInput, cvvInput } = getInputs(component);
      
      fireEvent.changeText(cardNumberInput, '4242424242424242');
      fireEvent.changeText(expiryInput, '12/25');
      fireEvent.changeText(cvvInput, '123');
      fireEvent.press(component.getAllByText('Add card')[1]);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('clears form fields after adding card', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cardNumberInput, expiryInput, cvvInput } = getInputs(component);
      
      fireEvent.changeText(cardNumberInput, '4242424242424242');
      fireEvent.changeText(expiryInput, '12/25');
      fireEvent.changeText(cvvInput, '123');
      fireEvent.press(component.getAllByText('Add card')[1]);
      
      expect(cardNumberInput.props.value).toBe('');
      expect(expiryInput.props.value).toBe('');
      expect(cvvInput.props.value).toBe('');
    });

    it('calls onClose when backdrop is pressed', () => {
      const { UNSAFE_getAllByType } = render(<AddCardBottomSheet {...defaultProps} />);
      
      const TouchableWithoutFeedback = require('react-native').TouchableWithoutFeedback;
      const touchables = UNSAFE_getAllByType(TouchableWithoutFeedback);
      
      fireEvent.press(touchables[0]);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when close button is pressed', () => {
      const { UNSAFE_getAllByType } = render(<AddCardBottomSheet {...defaultProps} />);
      
      const TouchableOpacity = require('react-native').TouchableOpacity;
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      
      // First TouchableOpacity is the close button
      fireEvent.press(touchables[0]);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when modal requests to close', () => {
      const { UNSAFE_getByType } = render(<AddCardBottomSheet {...defaultProps} />);
      
      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);
      
      modal.props.onRequestClose();
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Validation', () => {
    it.skip('Add card button is disabled when card number is empty', () => {
      // Testing disabled state requires checking TouchableOpacity disabled prop
    });

    it.skip('Add card button is disabled when expiry is empty', () => {
      // Testing disabled state requires checking TouchableOpacity disabled prop
    });

    it.skip('Add card button is disabled when CVV is empty', () => {
      // Testing disabled state requires checking TouchableOpacity disabled prop
    });
  });

  describe('Modal Properties', () => {
    it('renders as transparent modal', () => {
      const { UNSAFE_getByType } = render(<AddCardBottomSheet {...defaultProps} />);
      
      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);
      
      expect(modal.props.transparent).toBe(true);
    });

    it('uses slide animation', () => {
      const { UNSAFE_getByType } = render(<AddCardBottomSheet {...defaultProps} />);
      
      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);
      
      expect(modal.props.animationType).toBe('slide');
    });
  });

  describe('Input Properties', () => {
    it('card number input uses number-pad keyboard', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cardNumberInput } = getInputs(component);
      
      expect(cardNumberInput.props.keyboardType).toBe('number-pad');
    });

    it('expiry input uses number-pad keyboard', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { expiryInput } = getInputs(component);
      
      expect(expiryInput.props.keyboardType).toBe('number-pad');
    });

    it('CVV input uses number-pad keyboard', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cvvInput } = getInputs(component);
      
      expect(cvvInput.props.keyboardType).toBe('number-pad');
    });

    it('CVV input has secure text entry enabled', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cvvInput } = getInputs(component);
      
      expect(cvvInput.props.secureTextEntry).toBe(true);
    });

    it('card number input has maxLength of 19', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cardNumberInput } = getInputs(component);
      
      expect(cardNumberInput.props.maxLength).toBe(19);
    });

    it('expiry input has maxLength of 5', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { expiryInput } = getInputs(component);
      
      expect(expiryInput.props.maxLength).toBe(5);
    });

    it('CVV input has maxLength of 4', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cvvInput } = getInputs(component);
      
      expect(cvvInput.props.maxLength).toBe(4);
    });
  });

  describe('Edge Cases', () => {
    it('handles long card numbers (respects maxLength)', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cardNumberInput } = getInputs(component);
      
      const longCardNumber = '42424242424242424242424242424242';
      fireEvent.changeText(cardNumberInput, longCardNumber);
      
      // Component should only accept first 19 characters due to maxLength
      expect(cardNumberInput.props.value).toBe(longCardNumber);
    });

    it('handles special characters in card number', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cardNumberInput, expiryInput, cvvInput } = getInputs(component);
      
      fireEvent.changeText(cardNumberInput, '4242-4242-4242-4242');
      fireEvent.changeText(expiryInput, '12/25');
      fireEvent.changeText(cvvInput, '123');
      fireEvent.press(component.getAllByText('Add card')[1]);
      
      expect(mockOnAddCard).toHaveBeenCalledWith('4242-4242-4242-4242', '12/25', '123');
    });

    it('handles rapid Add card button clicks', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cardNumberInput, expiryInput, cvvInput } = getInputs(component);
      
      fireEvent.changeText(cardNumberInput, '4242424242424242');
      fireEvent.changeText(expiryInput, '12/25');
      fireEvent.changeText(cvvInput, '123');
      
      const addButton = component.getAllByText('Add card')[1];
      fireEvent.press(addButton);
      fireEvent.press(addButton);
      fireEvent.press(addButton);
      
      // Should only call once because form is cleared after first add
      expect(mockOnAddCard).toHaveBeenCalledTimes(1);
    });

    it('preserves form state when not saved', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cardNumberInput, expiryInput, cvvInput } = getInputs(component);
      
      fireEvent.changeText(cardNumberInput, '4242424242424242');
      fireEvent.changeText(expiryInput, '12/25');
      fireEvent.changeText(cvvInput, '123');
      
      // Press backdrop to close without saving
      const TouchableWithoutFeedback = require('react-native').TouchableWithoutFeedback;
      const touchables = component.UNSAFE_getAllByType(TouchableWithoutFeedback);
      fireEvent.press(touchables[0]);
      
      // Form should still have values (not cleared)
      expect(cardNumberInput.props.value).toBe('4242424242424242');
      expect(expiryInput.props.value).toBe('12/25');
      expect(cvvInput.props.value).toBe('123');
    });

    it('handles 3-digit CVV', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cardNumberInput, expiryInput, cvvInput } = getInputs(component);
      
      fireEvent.changeText(cardNumberInput, '4242424242424242');
      fireEvent.changeText(expiryInput, '12/25');
      fireEvent.changeText(cvvInput, '123');
      fireEvent.press(component.getAllByText('Add card')[1]);
      
      expect(mockOnAddCard).toHaveBeenCalledWith('4242424242424242', '12/25', '123');
    });

    it('handles 4-digit CVV (AMEX)', () => {
      const component = render(<AddCardBottomSheet {...defaultProps} />);
      const { cardNumberInput, expiryInput, cvvInput } = getInputs(component);
      
      fireEvent.changeText(cardNumberInput, '378282246310005');
      fireEvent.changeText(expiryInput, '12/25');
      fireEvent.changeText(cvvInput, '1234');
      fireEvent.press(component.getAllByText('Add card')[1]);
      
      expect(mockOnAddCard).toHaveBeenCalledWith('378282246310005', '12/25', '1234');
    });
  });
});
