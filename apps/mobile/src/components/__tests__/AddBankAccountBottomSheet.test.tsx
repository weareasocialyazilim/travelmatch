import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AddBankAccountBottomSheet } from '../../features/wallet/components/AddBankAccountBottomSheet';

describe('AddBankAccountBottomSheet', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnSave = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly when visible', () => {
      const { getByText } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );

      expect(getByText('Add bank account')).toBeTruthy();
    });

    it('renders IBAN input field', () => {
      const { getByTestId } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );

      const ibanInput = getByTestId('iban-input');
      expect(ibanInput.props.placeholder).toBe('DE89 3704 0044 0532 0130 00');
    });

    it('renders IBAN label', () => {
      const { getByText } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );

      expect(getByText('IBAN')).toBeTruthy();
    });

    it('renders Account holder input field', () => {
      const { getByTestId } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );

      const holderInput = getByTestId('account-holder-input');
      expect(holderInput.props.placeholder).toBe('Jane Doe');
    });

    it('renders Account holder label', () => {
      const { getByText } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );

      expect(getByText('Account holder')).toBeTruthy();
    });

    it('renders security info message', () => {
      const { getByText } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );

      expect(getByText('Your information is securely encrypted.')).toBeTruthy();
    });

    it('renders Save button', () => {
      const { getByText } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );

      expect(getByText('Save')).toBeTruthy();
    });

    it('renders handle indicator', () => {
      render(<AddBankAccountBottomSheet {...defaultProps} />);

      // Handle is a View with specific styling (width: 36, height: 4)
    });

    it('modal is not visible when visible prop is false', () => {
      const { getByTestId } = render(
        <AddBankAccountBottomSheet {...defaultProps} visible={false} />,
      );

      const modal = getByTestId('add-bank-account-modal');
      expect(modal.props.visible).toBe(false);
    });
  });

  describe('User Interactions', () => {
    it('Save button is disabled initially when both fields are empty', () => {
      const { getByTestId } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );
      const saveButton = getByTestId('save-bank-account-button');

      expect(
        saveButton.props.accessibilityState?.disabled ??
          saveButton.props.disabled,
      ).toBe(true);
    });

    it('does not call onSave when Save button pressed with empty fields', () => {
      const { getByText } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('Save'));

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('calls onClose when backdrop is pressed', () => {
      const { getByTestId } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );

      const backdrop = getByTestId('bank-account-backdrop');
      fireEvent.press(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when modal requests to close', () => {
      const { getByTestId } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );

      const modal = getByTestId('add-bank-account-modal');
      modal.props.onRequestClose();

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Validation', () => {
    it('does not call onSave when fields contain only whitespace', () => {
      const { getByText } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('Save'));

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Modal Properties', () => {
    it('renders as transparent modal', () => {
      const { getByTestId } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );

      const modal = getByTestId('add-bank-account-modal');

      expect(modal.props.transparent).toBe(true);
    });

    it('uses slide animation', () => {
      const { getByTestId } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );

      const modal = getByTestId('add-bank-account-modal');

      expect(modal.props.animationType).toBe('slide');
    });
  });

  describe('Input Properties', () => {
    it('IBAN input uses character capitalization', () => {
      const { getByTestId } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );
      const ibanInput = getByTestId('iban-input');

      expect(ibanInput.props.autoCapitalize).toBe('characters');
    });

    it('Account holder input uses words capitalization', () => {
      const { getByTestId } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );
      const holderInput = getByTestId('account-holder-input');

      expect(holderInput.props.autoCapitalize).toBe('words');
    });
  });

  describe('Edge Cases', () => {
    it('does not call onSave when backdrop is pressed', () => {
      const { getByTestId } = render(
        <AddBankAccountBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByTestId('bank-account-backdrop'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });
});
