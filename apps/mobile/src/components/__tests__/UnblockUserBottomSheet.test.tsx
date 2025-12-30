import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { UnblockUserBottomSheet } from '../UnblockUserBottomSheet';

describe('UnblockUserBottomSheet', () => {
  const mockOnUnblock = jest.fn() as jest.Mock;
  const mockOnCancel = jest.fn() as jest.Mock;
  const defaultProps = {
    visible: true,
    userName: 'Alex',
    onUnblock: mockOnUnblock,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when visible is true', () => {
      const { getByText } = render(<UnblockUserBottomSheet {...defaultProps} />);
      expect(getByText('Unblock Alex?')).toBeTruthy();
    });

    it('does not render when visible is false', () => {
      const { UNSAFE_queryByType } = render(<UnblockUserBottomSheet {...defaultProps} visible={false} />);
      const { Modal } = require('react-native');
      const modal = UNSAFE_queryByType(Modal);
      expect(modal.props.visible).toBe(false);
    });

    it('renders handle bar', () => {
      const { UNSAFE_getAllByType } = render(<UnblockUserBottomSheet {...defaultProps} />);
      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      expect(views.length).toBeGreaterThan(0);
    });

    it('renders user name in title', () => {
      const { getByText } = render(<UnblockUserBottomSheet {...defaultProps} userName="Maria" />);
      expect(getByText('Unblock Maria?')).toBeTruthy();
    });

    it('renders description text', () => {
      const { getByText } = render(<UnblockUserBottomSheet {...defaultProps} />);
      expect(getByText(/You will be able to see their travel moments/)).toBeTruthy();
    });

    it('renders avatar placeholder', () => {
      const { UNSAFE_getAllByType } = render(<UnblockUserBottomSheet {...defaultProps} />);
      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      expect(views.length).toBeGreaterThan(3); // backdrop, sheet, handle, avatar, etc.
    });

    it('renders Unblock button', () => {
      const { getByText } = render(<UnblockUserBottomSheet {...defaultProps} />);
      expect(getByText('Unblock')).toBeTruthy();
    });

    it('renders Cancel button', () => {
      const { getByText } = render(<UnblockUserBottomSheet {...defaultProps} />);
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('calls onUnblock when Unblock button is pressed', () => {
      const { getByText } = render(<UnblockUserBottomSheet {...defaultProps} />);
      const unblockButton = getByText('Unblock');
      fireEvent.press(unblockButton);
      expect(mockOnUnblock).toHaveBeenCalled();
    });

    it('calls onCancel when Cancel button is pressed', () => {
      const { getByText } = render(<UnblockUserBottomSheet {...defaultProps} />);
      const cancelButton = getByText('Cancel');
      fireEvent.press(cancelButton);
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('calls onCancel when backdrop is pressed', () => {
      const { UNSAFE_getAllByType } = render(<UnblockUserBottomSheet {...defaultProps} />);
      const { Pressable } = require('react-native');
      const pressables = UNSAFE_getAllByType(Pressable);
      const backdrop = pressables[0]; // First Pressable is the backdrop
      fireEvent.press(backdrop);
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Modal Properties', () => {
    it('renders as Modal with transparent background', () => {
      const { UNSAFE_getByType } = render(<UnblockUserBottomSheet {...defaultProps} />);
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.transparent).toBe(true);
    });

    it('uses fade animation', () => {
      const { UNSAFE_getByType } = render(<UnblockUserBottomSheet {...defaultProps} />);
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.animationType).toBe('fade');
    });

    it('calls onCancel when modal requests close', () => {
      const { UNSAFE_getByType } = render(<UnblockUserBottomSheet {...defaultProps} />);
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      modal.props.onRequestClose();
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid clicks on Unblock button', () => {
      const { getByText } = render(<UnblockUserBottomSheet {...defaultProps} />);
      const unblockButton = getByText('Unblock');
      fireEvent.press(unblockButton);
      fireEvent.press(unblockButton);
      fireEvent.press(unblockButton);
      expect(mockOnUnblock).toHaveBeenCalledTimes(3);
    });

    it('handles rapid clicks on Cancel button', () => {
      const { getByText } = render(<UnblockUserBottomSheet {...defaultProps} />);
      const cancelButton = getByText('Cancel');
      fireEvent.press(cancelButton);
      fireEvent.press(cancelButton);
      expect(mockOnCancel).toHaveBeenCalledTimes(2);
    });

    it('handles very long user names', () => {
      const longName = 'A'.repeat(100);
      const { getByText } = render(<UnblockUserBottomSheet {...defaultProps} userName={longName} />);
      expect(getByText(`Unblock ${longName}?`)).toBeTruthy();
    });

    it('handles user names with special characters', () => {
      const specialName = "O'Brien-García 🎉";
      const { getByText } = render(<UnblockUserBottomSheet {...defaultProps} userName={specialName} />);
      expect(getByText(`Unblock ${specialName}?`)).toBeTruthy();
    });

    it('handles empty user name gracefully', () => {
      const { getByText } = render(<UnblockUserBottomSheet {...defaultProps} userName="" />);
      expect(getByText('Unblock ?')).toBeTruthy();
    });
  });
});
