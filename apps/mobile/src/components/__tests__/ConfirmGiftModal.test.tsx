import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConfirmGiftModal } from '../ConfirmGiftModal';

describe('ConfirmGiftModal', () => {
  const mockOnCancel = jest.fn() as jest.Mock;
  const mockOnConfirm = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    amount: 25.50,
    recipientName: 'John Doe',
    onCancel: mockOnCancel,
    onConfirm: mockOnConfirm,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly when visible', () => {
      const { getByText } = render(<ConfirmGiftModal {...defaultProps} />);
      
      expect(getByText('Confirm Gift')).toBeTruthy();
      expect(getByText(/\$25\.50/)).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Confirm')).toBeTruthy();
    });

    it('modal is not visible when visible prop is false', () => {
      const { UNSAFE_getByType } = render(
        <ConfirmGiftModal {...defaultProps} visible={false} />
      );
      
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(false);
    });

    it('displays formatted amount with 2 decimal places', () => {
      const { getByText } = render(<ConfirmGiftModal {...defaultProps} amount={10} />);
      
      expect(getByText('$10.00')).toBeTruthy();
    });

    it('displays recipient name', () => {
      const { getByText } = render(
        <ConfirmGiftModal {...defaultProps} recipientName="Jane Smith" />
      );
      
      expect(getByText('Jane Smith')).toBeTruthy();
    });

    it('renders gift icon', () => {
      const { UNSAFE_getAllByType } = render(<ConfirmGiftModal {...defaultProps} />);
      
      const icons = UNSAFE_getAllByType(require('@expo/vector-icons').MaterialCommunityIcons);
      expect(icons.length).toBeGreaterThan(0);
    });

    it('displays title', () => {
      const { getByText } = render(<ConfirmGiftModal {...defaultProps} />);
      
      expect(getByText('Confirm Gift')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('calls onCancel when Cancel button is pressed', () => {
      const { getByText } = render(<ConfirmGiftModal {...defaultProps} />);
      
      fireEvent.press(getByText('Cancel'));
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when Confirm button is pressed', () => {
      const { getByText } = render(<ConfirmGiftModal {...defaultProps} />);
      
      fireEvent.press(getByText('Confirm'));
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when modal backdrop is requested to close', () => {
      const { UNSAFE_getByType } = render(<ConfirmGiftModal {...defaultProps} />);
      const modal = UNSAFE_getByType(require('react-native').Modal);
      
      modal.props.onRequestClose();
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onConfirm when Cancel is pressed', () => {
      const { getByText } = render(<ConfirmGiftModal {...defaultProps} />);
      
      fireEvent.press(getByText('Cancel'));
      
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('does not call onCancel when Confirm is pressed', () => {
      const { getByText } = render(<ConfirmGiftModal {...defaultProps} />);
      
      fireEvent.press(getByText('Confirm'));
      
      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe('Modal Properties', () => {
    it('renders as transparent modal', () => {
      const { UNSAFE_getByType } = render(<ConfirmGiftModal {...defaultProps} />);
      const modal = UNSAFE_getByType(require('react-native').Modal);
      
      expect(modal.props.transparent).toBe(true);
    });

    it('uses none animation type (custom animation)', () => {
      const { UNSAFE_getByType } = render(<ConfirmGiftModal {...defaultProps} />);
      const modal = UNSAFE_getByType(require('react-native').Modal);
      
      expect(modal.props.animationType).toBe('none');
    });

    it('sets visible prop correctly', () => {
      const { UNSAFE_getByType, rerender } = render(<ConfirmGiftModal {...defaultProps} />);
      let modal = UNSAFE_getByType(require('react-native').Modal);
      
      expect(modal.props.visible).toBe(true);

      rerender(<ConfirmGiftModal {...defaultProps} visible={false} />);
      modal = UNSAFE_getByType(require('react-native').Modal);
      
      expect(modal.props.visible).toBe(false);
    });
  });

  describe('Amount Formatting', () => {
    it('formats whole numbers with decimals', () => {
      const { getByText } = render(<ConfirmGiftModal {...defaultProps} amount={50} />);
      
      expect(getByText('$50.00')).toBeTruthy();
    });

    it('formats cents correctly', () => {
      const { getByText } = render(<ConfirmGiftModal {...defaultProps} amount={0.99} />);
      
      expect(getByText('$0.99')).toBeTruthy();
    });

    it('formats large amounts', () => {
      const { getByText } = render(<ConfirmGiftModal {...defaultProps} amount={999.99} />);
      
      expect(getByText('$999.99')).toBeTruthy();
    });

    it('formats amounts with trailing zeros', () => {
      const { getByText } = render(<ConfirmGiftModal {...defaultProps} amount={25.5} />);
      
      expect(getByText('$25.50')).toBeTruthy();
    });

    it('handles zero amount', () => {
      const { getByText } = render(<ConfirmGiftModal {...defaultProps} amount={0} />);
      
      expect(getByText('$0.00')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid button presses on Cancel', () => {
      const { getByText } = render(<ConfirmGiftModal {...defaultProps} />);
      const cancelButton = getByText('Cancel');
      
      fireEvent.press(cancelButton);
      fireEvent.press(cancelButton);
      fireEvent.press(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalledTimes(3);
    });

    it('handles rapid button presses on Confirm', () => {
      const { getByText } = render(<ConfirmGiftModal {...defaultProps} />);
      const confirmButton = getByText('Confirm');
      
      fireEvent.press(confirmButton);
      fireEvent.press(confirmButton);
      fireEvent.press(confirmButton);
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(3);
    });

    it('handles empty recipient name', () => {
      const { getByText } = render(
        <ConfirmGiftModal {...defaultProps} recipientName="" />
      );
      
      expect(getByText('Confirm Gift')).toBeTruthy();
    });

    it('handles very long recipient name', () => {
      const longName = 'A'.repeat(100);
      const { getByText } = render(
        <ConfirmGiftModal {...defaultProps} recipientName={longName} />
      );
      
      expect(getByText(longName)).toBeTruthy();
    });

    it('handles special characters in recipient name', () => {
      const { getByText } = render(
        <ConfirmGiftModal {...defaultProps} recipientName="O'Brien-Smith" />
      );
      
      expect(getByText("O'Brien-Smith")).toBeTruthy();
    });

    it('handles very small amounts', () => {
      const { getByText } = render(<ConfirmGiftModal {...defaultProps} amount={0.01} />);
      
      expect(getByText('$0.01')).toBeTruthy();
    });
  });
});
