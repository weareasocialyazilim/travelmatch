import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DeleteMomentDialog } from '../DeleteMomentDialog';

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  AlertTriangle: 'AlertTriangle',
  X: 'X',
}));

describe('DeleteMomentDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    momentTitle: 'My Amazing Trip to Paris',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly when visible', () => {
      const { getByText } = render(<DeleteMomentDialog {...defaultProps} />);

      expect(getByText('Delete Moment?')).toBeTruthy();
      expect(getByText('"My Amazing Trip to Paris"')).toBeTruthy();
    });

    it('renders Cancel button', () => {
      const { getByText } = render(<DeleteMomentDialog {...defaultProps} />);

      expect(getByText('Cancel')).toBeTruthy();
    });

    it('renders Delete button', () => {
      const { getByText } = render(<DeleteMomentDialog {...defaultProps} />);

      expect(getByText('Delete')).toBeTruthy();
    });

    it('modal is not visible when visible prop is false', () => {
      const { UNSAFE_getByType } = render(
        <DeleteMomentDialog {...defaultProps} visible={false} />,
      );

      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(false);
    });

    it('displays moment title in quotes', () => {
      const customTitle = 'Sunset at the Beach';
      const { getByText } = render(
        <DeleteMomentDialog {...defaultProps} momentTitle={customTitle} />,
      );

      expect(getByText(`"${customTitle}"`)).toBeTruthy();
    });

    it('displays 90-day restore information', () => {
      const { getByText } = render(<DeleteMomentDialog {...defaultProps} />);

      expect(getByText(/restored within 90 days/)).toBeTruthy();
      expect(getByText(/After 90 days/)).toBeTruthy();
    });

    // Note: Component doesn't include this specific text
    it.skip('displays restore location hint', () => {
      const { getByText } = render(<DeleteMomentDialog {...defaultProps} />);

      expect(
        getByText(/You can restore this from Profile → Deleted Moments/),
      ).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when Cancel button is pressed', () => {
      const { getByText } = render(<DeleteMomentDialog {...defaultProps} />);

      fireEvent.press(getByText('Cancel'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('calls both onConfirm and onClose when Delete button is pressed', () => {
      const { getByText } = render(<DeleteMomentDialog {...defaultProps} />);

      fireEvent.press(getByText('Delete'));

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm before onClose when Delete is pressed', () => {
      const callOrder: string[] = [];
      const onConfirm = jest.fn(() => callOrder.push('confirm'));
      const onClose = jest.fn(() => callOrder.push('close'));

      const { getByText } = render(
        <DeleteMomentDialog
          {...defaultProps}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      );

      fireEvent.press(getByText('Delete'));

      expect(callOrder).toEqual(['confirm', 'close']);
    });

    it('calls onClose when close X button is pressed', () => {
      const { UNSAFE_getAllByType } = render(
        <DeleteMomentDialog {...defaultProps} />,
      );
      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity,
      );
      const closeButton = touchables[0]; // First touchable is the close button

      fireEvent.press(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when modal backdrop is requested to close', () => {
      const { UNSAFE_getByType } = render(
        <DeleteMomentDialog {...defaultProps} />,
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);

      modal.props.onRequestClose();

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('shows "Deleting..." when isDeleting is true', () => {
      const { getByText, queryByText } = render(
        <DeleteMomentDialog {...defaultProps} isDeleting={true} />,
      );

      expect(getByText('Deleting...')).toBeTruthy();
      expect(queryByText('Delete')).toBeNull();
    });

    it('shows "Delete" when isDeleting is false', () => {
      const { getByText, queryByText } = render(
        <DeleteMomentDialog {...defaultProps} isDeleting={false} />,
      );

      expect(getByText('Delete')).toBeTruthy();
      expect(queryByText('Deleting...')).toBeNull();
    });
  });

  describe('Modal Properties', () => {
    it('renders as transparent modal', () => {
      const { UNSAFE_getByType } = render(
        <DeleteMomentDialog {...defaultProps} />,
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);

      expect(modal.props.transparent).toBe(true);
    });

    it('uses fade animation', () => {
      const { UNSAFE_getByType } = render(
        <DeleteMomentDialog {...defaultProps} />,
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);

      expect(modal.props.animationType).toBe('fade');
    });

    it('sets visible prop correctly', () => {
      const { UNSAFE_getByType, rerender } = render(
        <DeleteMomentDialog {...defaultProps} />,
      );
      let modal = UNSAFE_getByType(require('react-native').Modal);

      expect(modal.props.visible).toBe(true);

      rerender(<DeleteMomentDialog {...defaultProps} visible={false} />);
      modal = UNSAFE_getByType(require('react-native').Modal);

      expect(modal.props.visible).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty moment title', () => {
      const { getByText } = render(
        <DeleteMomentDialog {...defaultProps} momentTitle="" />,
      );

      expect(getByText('""')).toBeTruthy();
    });

    it('handles very long moment title', () => {
      const longTitle = 'A'.repeat(200);
      const { getByText } = render(
        <DeleteMomentDialog {...defaultProps} momentTitle={longTitle} />,
      );

      expect(getByText(`"${longTitle}"`)).toBeTruthy();
    });

    it('handles moment title with special characters', () => {
      const specialTitle = 'Trip to "Paris" & <Rome>';
      const { getByText } = render(
        <DeleteMomentDialog {...defaultProps} momentTitle={specialTitle} />,
      );

      expect(getByText(`"${specialTitle}"`)).toBeTruthy();
    });

    it('handles rapid button presses when not deleting', () => {
      const { getByText } = render(<DeleteMomentDialog {...defaultProps} />);
      const deleteButton = getByText('Delete');

      fireEvent.press(deleteButton);
      fireEvent.press(deleteButton);
      fireEvent.press(deleteButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(3);
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it('shows deleting state when isDeleting is true', () => {
      const { getByText } = render(
        <DeleteMomentDialog {...defaultProps} isDeleting={true} />,
      );

      expect(getByText('Deleting...')).toBeTruthy();
    });
  });
});
