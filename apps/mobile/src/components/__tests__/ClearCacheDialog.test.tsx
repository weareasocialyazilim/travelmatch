import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ClearCacheDialog } from '../ClearCacheDialog';

describe('ClearCacheDialog', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnConfirm = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly when visible', () => {
      const { getByText } = render(<ClearCacheDialog {...defaultProps} />);

      expect(getByText('Clear cache?')).toBeTruthy();
      expect(getByText(/This will remove temporary data/)).toBeTruthy();
    });

    it('renders Cancel button', () => {
      const { getByText } = render(<ClearCacheDialog {...defaultProps} />);

      expect(getByText('Cancel')).toBeTruthy();
    });

    it('renders Clear button', () => {
      const { getByText } = render(<ClearCacheDialog {...defaultProps} />);

      expect(getByText('Clear')).toBeTruthy();
    });

    it('modal is not visible when visible prop is false', () => {
      const { getByTestId } = render(
        <ClearCacheDialog {...defaultProps} visible={false} />,
      );

      const modal = getByTestId('clear-cache-modal');
      expect(modal.props.visible).toBe(false);
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when Cancel button is pressed', () => {
      const { getByText } = render(<ClearCacheDialog {...defaultProps} />);

      fireEvent.press(getByText('Cancel'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('calls both onConfirm and onClose when Clear button is pressed', () => {
      const { getByText } = render(<ClearCacheDialog {...defaultProps} />);

      fireEvent.press(getByText('Clear'));

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm before onClose when Clear is pressed', () => {
      const callOrder: string[] = [];
      const onConfirm = jest.fn(() => callOrder.push('confirm'));
      const onClose = jest.fn(() => callOrder.push('close'));

      const { getByText } = render(
        <ClearCacheDialog
          {...defaultProps}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      );

      fireEvent.press(getByText('Clear'));

      expect(callOrder).toEqual(['confirm', 'close']);
    });

    it('calls onClose when modal backdrop is requested to close', () => {
      const { getByTestId } = render(<ClearCacheDialog {...defaultProps} />);
      const modal = getByTestId('clear-cache-modal');

      // Trigger onRequestClose callback
      if (modal.props.onRequestClose) {
        modal.props.onRequestClose();
      }

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Properties', () => {
    it('renders as transparent modal', () => {
      const { getByTestId } = render(<ClearCacheDialog {...defaultProps} />);
      const modal = getByTestId('clear-cache-modal');

      expect(modal.props.transparent).toBe(true);
    });

    it('uses fade animation', () => {
      const { getByTestId } = render(<ClearCacheDialog {...defaultProps} />);
      const modal = getByTestId('clear-cache-modal');

      expect(modal.props.animationType).toBe('fade');
    });

    it('sets visible prop correctly', () => {
      const { getByTestId, rerender } = render(
        <ClearCacheDialog {...defaultProps} />,
      );
      let modal = getByTestId('clear-cache-modal');

      expect(modal.props.visible).toBe(true);

      rerender(<ClearCacheDialog {...defaultProps} visible={false} />);
      modal = getByTestId('clear-cache-modal');

      expect(modal.props.visible).toBe(false);
    });
  });

  describe('Content Display', () => {
    it('displays correct headline text', () => {
      const { getByText } = render(<ClearCacheDialog {...defaultProps} />);

      expect(getByText('Clear cache?')).toBeTruthy();
    });

    it('displays correct body text about not deleting moments', () => {
      const { getByText } = render(<ClearCacheDialog {...defaultProps} />);

      expect(getByText(/won't delete your moments/)).toBeTruthy();
    });

    it('displays information about removing temporary data', () => {
      const { getByText } = render(<ClearCacheDialog {...defaultProps} />);

      expect(getByText(/remove temporary data/)).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid button presses', () => {
      const { getByText } = render(<ClearCacheDialog {...defaultProps} />);
      const clearButton = getByText('Clear');

      fireEvent.press(clearButton);
      fireEvent.press(clearButton);
      fireEvent.press(clearButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(3);
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it('handles Cancel after Clear is pressed', () => {
      const { getByText } = render(<ClearCacheDialog {...defaultProps} />);

      fireEvent.press(getByText('Clear'));
      fireEvent.press(getByText('Cancel'));

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });

    it('renders correctly with missing optional props', () => {
      const { getByText } = render(
        <ClearCacheDialog
          visible={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />,
      );

      expect(getByText('Clear cache?')).toBeTruthy();
    });
  });
});
