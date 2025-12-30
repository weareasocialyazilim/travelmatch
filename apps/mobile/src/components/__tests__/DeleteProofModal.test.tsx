import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DeleteProofModal } from '../DeleteProofModal';

describe('DeleteProofModal', () => {
  const mockOnCancel = jest.fn() as jest.Mock;
  const mockOnDelete = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onCancel: mockOnCancel,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly when visible', () => {
      const { getByText } = render(<DeleteProofModal {...defaultProps} />);
      
      expect(getByText('Delete this proof?')).toBeTruthy();
      expect(getByText('You can upload a new proof afterward.')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Delete')).toBeTruthy();
    });

    it('modal is not visible when visible prop is false', () => {
      const { UNSAFE_getByType } = render(
        <DeleteProofModal {...defaultProps} visible={false} />
      );
      
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(false);
    });

    it('renders headline text', () => {
      const { getByText } = render(<DeleteProofModal {...defaultProps} />);
      
      expect(getByText('Delete this proof?')).toBeTruthy();
    });

    it('renders body text about uploading new proof', () => {
      const { getByText } = render(<DeleteProofModal {...defaultProps} />);
      
      expect(getByText('You can upload a new proof afterward.')).toBeTruthy();
    });

    it('renders both action buttons', () => {
      const { getByText } = render(<DeleteProofModal {...defaultProps} />);
      
      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Delete')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('calls onCancel when Cancel button is pressed', () => {
      const { getByText } = render(<DeleteProofModal {...defaultProps} />);
      
      fireEvent.press(getByText('Cancel'));
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onDelete when Delete button is pressed', () => {
      const { getByText } = render(<DeleteProofModal {...defaultProps} />);
      
      fireEvent.press(getByText('Delete'));
      
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when modal backdrop is requested to close', () => {
      const { UNSAFE_getByType } = render(<DeleteProofModal {...defaultProps} />);
      const modal = UNSAFE_getByType(require('react-native').Modal);
      
      modal.props.onRequestClose();
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onDelete when Cancel is pressed', () => {
      const { getByText } = render(<DeleteProofModal {...defaultProps} />);
      
      fireEvent.press(getByText('Cancel'));
      
      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('does not call onCancel when Delete is pressed', () => {
      const { getByText } = render(<DeleteProofModal {...defaultProps} />);
      
      fireEvent.press(getByText('Delete'));
      
      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe('Modal Properties', () => {
    it('renders as transparent modal', () => {
      const { UNSAFE_getByType } = render(<DeleteProofModal {...defaultProps} />);
      const modal = UNSAFE_getByType(require('react-native').Modal);
      
      expect(modal.props.transparent).toBe(true);
    });

    it('uses fade animation', () => {
      const { UNSAFE_getByType } = render(<DeleteProofModal {...defaultProps} />);
      const modal = UNSAFE_getByType(require('react-native').Modal);
      
      expect(modal.props.animationType).toBe('fade');
    });

    it('sets visible prop correctly', () => {
      const { UNSAFE_getByType, rerender } = render(<DeleteProofModal {...defaultProps} />);
      let modal = UNSAFE_getByType(require('react-native').Modal);
      
      expect(modal.props.visible).toBe(true);

      rerender(<DeleteProofModal {...defaultProps} visible={false} />);
      modal = UNSAFE_getByType(require('react-native').Modal);
      
      expect(modal.props.visible).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid button presses on Cancel', () => {
      const { getByText } = render(<DeleteProofModal {...defaultProps} />);
      const cancelButton = getByText('Cancel');
      
      fireEvent.press(cancelButton);
      fireEvent.press(cancelButton);
      fireEvent.press(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalledTimes(3);
    });

    it('handles rapid button presses on Delete', () => {
      const { getByText } = render(<DeleteProofModal {...defaultProps} />);
      const deleteButton = getByText('Delete');
      
      fireEvent.press(deleteButton);
      fireEvent.press(deleteButton);
      fireEvent.press(deleteButton);
      
      expect(mockOnDelete).toHaveBeenCalledTimes(3);
    });

    it('handles alternating button presses', () => {
      const { getByText } = render(<DeleteProofModal {...defaultProps} />);
      
      fireEvent.press(getByText('Cancel'));
      fireEvent.press(getByText('Delete'));
      fireEvent.press(getByText('Cancel'));
      
      expect(mockOnCancel).toHaveBeenCalledTimes(2);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });
});
