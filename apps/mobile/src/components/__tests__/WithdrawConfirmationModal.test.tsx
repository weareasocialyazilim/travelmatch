import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WithdrawConfirmationModal } from '../WithdrawConfirmationModal';

describe('WithdrawConfirmationModal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  const defaultProps = {
    visible: true,
    amount: 100,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders modal when visible is true', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      expect(getByText('Withdraw money?')).toBeTruthy();
      expect(getByText('It will arrive to your bank in 1–2 days.')).toBeTruthy();
    });

    it('renders with correct amount formatting', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} amount={100} />
      );

      expect(getByText('$100.00')).toBeTruthy();
    });

    it('renders with decimal amount', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} amount={123.45} />
      );

      expect(getByText('$123.45')).toBeTruthy();
    });

    it('renders wallet icon', () => {
      const { UNSAFE_getAllByType } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      
      expect(icons.length).toBeGreaterThan(0);
      expect(icons[0].props.name).toBe('wallet');
      expect(icons[0].props.size).toBe(40);
    });

    it('renders cancel button', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      expect(getByText('Cancel')).toBeTruthy();
    });

    it('renders confirm button', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      expect(getByText('Confirm')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('calls onConfirm when confirm button is pressed', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      fireEvent.press(getByText('Confirm'));

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('calls onCancel when cancel button is pressed', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      fireEvent.press(getByText('Cancel'));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('allows multiple confirm presses', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      fireEvent.press(getByText('Confirm'));
      fireEvent.press(getByText('Confirm'));
      fireEvent.press(getByText('Confirm'));

      expect(mockOnConfirm).toHaveBeenCalledTimes(3);
    });

    it('allows multiple cancel presses', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      fireEvent.press(getByText('Cancel'));
      fireEvent.press(getByText('Cancel'));

      expect(mockOnCancel).toHaveBeenCalledTimes(2);
    });
  });

  describe('Modal Behavior', () => {
    it('has transparent prop set to true', () => {
      const { UNSAFE_getByType } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);

      expect(modal.props.transparent).toBe(true);
    });

    it('has fade animation type', () => {
      const { UNSAFE_getByType } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);

      expect(modal.props.animationType).toBe('fade');
    });

    it('calls onCancel when modal requests close', () => {
      const { UNSAFE_getByType } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);

      modal.props.onRequestClose();

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('does not render when visible is false', () => {
      const { UNSAFE_getByType } = render(
        <WithdrawConfirmationModal {...defaultProps} visible={false} />
      );

      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);

      expect(modal.props.visible).toBe(false);
    });
  });

  describe('Amount Display', () => {
    it('formats small amounts correctly', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} amount={1.5} />
      );

      expect(getByText('$1.50')).toBeTruthy();
    });

    it('formats large amounts correctly', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} amount={999999.99} />
      );

      expect(getByText('$999999.99')).toBeTruthy();
    });

    it('formats zero amount', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} amount={0} />
      );

      expect(getByText('$0.00')).toBeTruthy();
    });

    it('handles single decimal place', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} amount={50.5} />
      );

      expect(getByText('$50.50')).toBeTruthy();
    });

    it('rounds to two decimal places', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} amount={12.345} />
      );

      expect(getByText('$12.35')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('cancel button has activeOpacity', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      const cancelButton = getByText('Cancel').parent?.parent;
      expect(cancelButton?.props.activeOpacity).toBe(0.8);
    });

    it('confirm button has activeOpacity', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      const confirmButton = getByText('Confirm').parent?.parent;
      expect(confirmButton?.props.activeOpacity).toBe(0.8);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined onConfirm gracefully', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal
          {...defaultProps}
          onConfirm={undefined as any}
        />
      );

      expect(() => fireEvent.press(getByText('Confirm'))).not.toThrow();
    });

    it('handles undefined onCancel gracefully', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal
          {...defaultProps}
          onCancel={undefined as any}
        />
      );

      expect(() => fireEvent.press(getByText('Cancel'))).not.toThrow();
    });

    it('handles negative amount', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} amount={-50} />
      );

      expect(getByText('$-50.00')).toBeTruthy();
    });

    it('handles very large amount', () => {
      const { getByText } = render(
        <WithdrawConfirmationModal {...defaultProps} amount={1000000000} />
      );

      expect(getByText('$1000000000.00')).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('renders backdrop view', () => {
      const { UNSAFE_getAllByType } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);

      // Should have multiple Views (modalContainer, backdrop, modalContent, iconContainer, buttonGroup)
      expect(views.length).toBeGreaterThan(4);
    });

    it('renders icon container with correct styling', () => {
      const { UNSAFE_getAllByType } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      
      // Icon container should have specific dimensions (64x64) and borderRadius (32)
      const iconContainer = views.find((view) => {
        const style = JSON.stringify(view.props.style);
        return style.includes('64') && style.includes('32');
      });
      
      expect(iconContainer).toBeTruthy();
    });

    it('renders button group container', () => {
      const { UNSAFE_getAllByType } = render(
        <WithdrawConfirmationModal {...defaultProps} />
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);

      // Button group should have flexDirection: 'row'
      const buttonGroup = views.find((view) => {
        const style = JSON.stringify(view.props.style);
        return style.includes('row');
      });

      expect(buttonGroup).toBeTruthy();
    });
  });
});
