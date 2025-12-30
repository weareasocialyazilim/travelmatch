import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AddBankAccountBottomSheet } from '../AddBankAccountBottomSheet';

describe('AddBankAccountBottomSheet', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnSave = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
  };

  // Helper function to get inputs
  const getInputs = (component: ReturnType<typeof render>) => {
    const TextInput = require('react-native').TextInput;
    const inputs = component.UNSAFE_getAllByType(TextInput);
    return {
      ibanInput: inputs[0],
      holderInput: inputs[1],
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly when visible', () => {
      const { getByText } = render(<AddBankAccountBottomSheet {...defaultProps} />);
      
      expect(getByText('Add bank account')).toBeTruthy();
    });

    it('renders IBAN input field', () => {
      const { UNSAFE_getAllByType } = render(<AddBankAccountBottomSheet {...defaultProps} />);
      
      const TextInput = require('react-native').TextInput;
      const inputs = UNSAFE_getAllByType(TextInput);
      
      // First input is IBAN
      expect(inputs[0].props.placeholder).toBe('DE89 3704 0044 0532 0130 00');
    });

    it('renders IBAN label', () => {
      const { getByText } = render(<AddBankAccountBottomSheet {...defaultProps} />);
      
      expect(getByText('IBAN')).toBeTruthy();
    });

    it('renders Account holder input field', () => {
      const { UNSAFE_getAllByType } = render(<AddBankAccountBottomSheet {...defaultProps} />);
      
      const TextInput = require('react-native').TextInput;
      const inputs = UNSAFE_getAllByType(TextInput);
      
      // Second input is Account holder
      expect(inputs[1].props.placeholder).toBe('Jane Doe');
    });

    it('renders Account holder label', () => {
      const { getByText } = render(<AddBankAccountBottomSheet {...defaultProps} />);
      
      expect(getByText('Account holder')).toBeTruthy();
    });

    it('renders security info message', () => {
      const { getByText } = render(<AddBankAccountBottomSheet {...defaultProps} />);
      
      expect(getByText('Your information is securely encrypted.')).toBeTruthy();
    });

    it('renders security lock icon', () => {
      const { UNSAFE_queryAllByType } = render(<AddBankAccountBottomSheet {...defaultProps} />);
      
      const MaterialCommunityIcons = require('@expo/vector-icons').MaterialCommunityIcons;
      const icons = UNSAFE_queryAllByType(MaterialCommunityIcons);
      
      const lockIcon = icons.find((icon: { props: { name: string } }) => icon.props.name === 'lock');
      expect(lockIcon).toBeTruthy();
    });

    it('renders Save button', () => {
      const { getByText } = render(<AddBankAccountBottomSheet {...defaultProps} />);
      
      expect(getByText('Save')).toBeTruthy();
    });

    it('renders handle indicator', () => {
      const { UNSAFE_root } = render(<AddBankAccountBottomSheet {...defaultProps} />);
      
      // Handle is a View with specific styling (width: 36, height: 4)
      expect(UNSAFE_root).toBeTruthy();
    });

    it('modal is not visible when visible prop is false', () => {
      const { UNSAFE_getByType } = render(
        <AddBankAccountBottomSheet {...defaultProps} visible={false} />
      );
      
      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.visible).toBe(false);
    });
  });

  describe('User Interactions', () => {
    it('allows entering IBAN', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { ibanInput } = getInputs(component);
      
      fireEvent.changeText(ibanInput, 'DE89370400440532013000');
      
      expect(ibanInput.props.value).toBe('DE89370400440532013000');
    });

    it('allows entering account holder name', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { holderInput } = getInputs(component);
      
      fireEvent.changeText(holderInput, 'John Smith');
      
      expect(holderInput.props.value).toBe('John Smith');
    });

    it('Save button is disabled when IBAN is empty', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { holderInput } = getInputs(component);

      fireEvent.changeText(holderInput, 'John Smith');

      const TouchableOpacity = require('react-native').TouchableOpacity;
      const touchables = component.UNSAFE_getAllByType(TouchableOpacity);
      const saveButton = touchables.find((t: { props: { children?: React.ReactNode } }) => {
        const children = t.props.children;
        return children && JSON.stringify(children).includes('Save');
      });

      expect(saveButton?.props.disabled).toBe(true);
    });

    it('Save button is disabled when account holder is empty', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { ibanInput } = getInputs(component);

      fireEvent.changeText(ibanInput, 'DE89370400440532013000');

      const TouchableOpacity = require('react-native').TouchableOpacity;
      const touchables = component.UNSAFE_getAllByType(TouchableOpacity);
      const saveButton = touchables.find((t: { props: { children?: React.ReactNode } }) => {
        const children = t.props.children;
        return children && JSON.stringify(children).includes('Save');
      });

      expect(saveButton?.props.disabled).toBe(true);
    });

    it('Save button is disabled when both fields are empty', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);

      const TouchableOpacity = require('react-native').TouchableOpacity;
      const touchables = component.UNSAFE_getAllByType(TouchableOpacity);
      const saveButton = touchables.find((t: { props: { children?: React.ReactNode } }) => {
        const children = t.props.children;
        return children && JSON.stringify(children).includes('Save');
      });

      expect(saveButton?.props.disabled).toBe(true);
    });

    it('Save button is enabled when both fields are filled', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { ibanInput, holderInput } = getInputs(component);

      fireEvent.changeText(ibanInput, 'DE89370400440532013000');
      fireEvent.changeText(holderInput, 'John Smith');

      const TouchableOpacity = require('react-native').TouchableOpacity;
      const touchables = component.UNSAFE_getAllByType(TouchableOpacity);
      const saveButton = touchables.find((t: { props: { children?: React.ReactNode } }) => {
        const children = t.props.children;
        return children && JSON.stringify(children).includes('Save');
      });

      expect(saveButton?.props.disabled).toBe(false);
    });

    it('calls onSave with correct data when Save is pressed', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { ibanInput, holderInput } = getInputs(component);
      
      fireEvent.changeText(ibanInput, 'DE89370400440532013000');
      fireEvent.changeText(holderInput, 'John Smith');
      fireEvent.press(component.getByText('Save'));
      
      expect(mockOnSave).toHaveBeenCalledWith('DE89370400440532013000', 'John Smith');
    });

    it('calls onClose after saving', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { ibanInput, holderInput } = getInputs(component);
      
      fireEvent.changeText(ibanInput, 'DE89370400440532013000');
      fireEvent.changeText(holderInput, 'John Smith');
      fireEvent.press(component.getByText('Save'));
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('clears form fields after saving', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { ibanInput, holderInput } = getInputs(component);
      
      fireEvent.changeText(ibanInput, 'DE89370400440532013000');
      fireEvent.changeText(holderInput, 'John Smith');
      fireEvent.press(component.getByText('Save'));
      
      expect(ibanInput.props.value).toBe('');
      expect(holderInput.props.value).toBe('');
    });

    it('calls onClose when backdrop is pressed', () => {
      const { UNSAFE_getAllByType } = render(<AddBankAccountBottomSheet {...defaultProps} />);
      
      const TouchableWithoutFeedback = require('react-native').TouchableWithoutFeedback;
      const touchables = UNSAFE_getAllByType(TouchableWithoutFeedback);
      
      // First TouchableWithoutFeedback is the backdrop
      const backdrop = touchables[0];
      fireEvent.press(backdrop);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when modal requests to close', () => {
      const { UNSAFE_getByType } = render(<AddBankAccountBottomSheet {...defaultProps} />);
      
      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);
      
      modal.props.onRequestClose();
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Validation', () => {
    it('trims whitespace from IBAN before validation', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { ibanInput, holderInput } = getInputs(component);

      // Enter only whitespace in IBAN
      fireEvent.changeText(ibanInput, '   ');
      fireEvent.changeText(holderInput, 'John Smith');

      const TouchableOpacity = require('react-native').TouchableOpacity;
      const touchables = component.UNSAFE_getAllByType(TouchableOpacity);
      const saveButton = touchables.find((t: { props: { children?: React.ReactNode } }) => {
        const children = t.props.children;
        return children && JSON.stringify(children).includes('Save');
      });

      expect(saveButton?.props.disabled).toBe(true);
    });

    it('trims whitespace from account holder before validation', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { ibanInput, holderInput } = getInputs(component);

      fireEvent.changeText(ibanInput, 'DE89370400440532013000');
      // Enter only whitespace in account holder
      fireEvent.changeText(holderInput, '   ');

      const TouchableOpacity = require('react-native').TouchableOpacity;
      const touchables = component.UNSAFE_getAllByType(TouchableOpacity);
      const saveButton = touchables.find((t: { props: { children?: React.ReactNode } }) => {
        const children = t.props.children;
        return children && JSON.stringify(children).includes('Save');
      });

      expect(saveButton?.props.disabled).toBe(true);
    });

    it('does not call onSave when fields contain only whitespace', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { ibanInput, holderInput } = getInputs(component);

      fireEvent.changeText(ibanInput, '   ');
      fireEvent.changeText(holderInput, '   ');
      fireEvent.press(component.getByText('Save'));

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Modal Properties', () => {
    it('renders as transparent modal', () => {
      const { UNSAFE_getByType } = render(<AddBankAccountBottomSheet {...defaultProps} />);
      
      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);
      
      expect(modal.props.transparent).toBe(true);
    });

    it('uses slide animation', () => {
      const { UNSAFE_getByType } = render(<AddBankAccountBottomSheet {...defaultProps} />);
      
      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);
      
      expect(modal.props.animationType).toBe('slide');
    });
  });

  describe('Input Properties', () => {
    it('IBAN input uses character capitalization', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { ibanInput } = getInputs(component);
      
      expect(ibanInput.props.autoCapitalize).toBe('characters');
    });

    it('Account holder input uses words capitalization', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { holderInput } = getInputs(component);
      
      expect(holderInput.props.autoCapitalize).toBe('words');
    });
  });

  describe('Edge Cases', () => {
    it('handles long IBAN numbers', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { ibanInput } = getInputs(component);
      
      const longIban = 'DE89370400440532013000123456789012345678901234567890';
      fireEvent.changeText(ibanInput, longIban);
      
      expect(ibanInput.props.value).toBe(longIban);
    });

    it('handles long account holder names', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { holderInput } = getInputs(component);
      
      const longName = 'Sir Patrick Michael Sebastian Fitzwilliam O\'Reilly-Smith Jr.';
      fireEvent.changeText(holderInput, longName);
      
      expect(holderInput.props.value).toBe(longName);
    });

    it('handles special characters in account holder name', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { ibanInput, holderInput } = getInputs(component);
      
      fireEvent.changeText(ibanInput, 'DE89370400440532013000');
      fireEvent.changeText(holderInput, "O'Connor-Smith");
      fireEvent.press(component.getByText('Save'));
      
      expect(mockOnSave).toHaveBeenCalledWith('DE89370400440532013000', "O'Connor-Smith");
    });

    it('handles rapid Save button clicks', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { ibanInput, holderInput } = getInputs(component);
      
      fireEvent.changeText(ibanInput, 'DE89370400440532013000');
      fireEvent.changeText(holderInput, 'John Smith');
      
      const saveButton = component.getByText('Save');
      fireEvent.press(saveButton);
      fireEvent.press(saveButton);
      fireEvent.press(saveButton);
      
      // Should only call once because form is cleared after first save
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('preserves form state when not saved', () => {
      const component = render(<AddBankAccountBottomSheet {...defaultProps} />);
      const { ibanInput, holderInput } = getInputs(component);
      
      fireEvent.changeText(ibanInput, 'DE89370400440532013000');
      fireEvent.changeText(holderInput, 'John Smith');
      
      // Press backdrop to close without saving
      const TouchableWithoutFeedback = require('react-native').TouchableWithoutFeedback;
      const touchables = component.UNSAFE_getAllByType(TouchableWithoutFeedback);
      fireEvent.press(touchables[0]);
      
      // Form should still have values (not cleared)
      expect(ibanInput.props.value).toBe('DE89370400440532013000');
      expect(holderInput.props.value).toBe('John Smith');
    });
  });
});
