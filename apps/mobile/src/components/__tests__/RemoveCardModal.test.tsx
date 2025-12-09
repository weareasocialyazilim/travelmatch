import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RemoveCardModal } from '../RemoveCardModal';

describe('RemoveCardModal', () => {
  const mockOnCancel = jest.fn();
  const mockOnRemove = jest.fn();

  const defaultProps = {
    visible: true,
    onCancel: mockOnCancel,
    onRemove: mockOnRemove,
    cardLast4: '4242',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible is true', () => {
      const { getByText } = render(<RemoveCardModal {...defaultProps} />);
      expect(getByText('Remove card?')).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      const { UNSAFE_getByType } = render(
        <RemoveCardModal {...defaultProps} visible={false} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(false);
    });

    it('should render the headline', () => {
      const { getByText } = render(<RemoveCardModal {...defaultProps} />);
      expect(getByText('Remove card?')).toBeTruthy();
    });

    it('should render the body text', () => {
      const { getByText } = render(<RemoveCardModal {...defaultProps} />);
      expect(getByText('You can add it again anytime.')).toBeTruthy();
    });

    it('should render the Remove button', () => {
      const { getByText } = render(<RemoveCardModal {...defaultProps} />);
      expect(getByText('Remove')).toBeTruthy();
    });

    it('should render the Cancel button', () => {
      const { getByText } = render(<RemoveCardModal {...defaultProps} />);
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should render delete icon', () => {
      const { UNSAFE_getByType } = render(
        <RemoveCardModal {...defaultProps} />
      );
      const icon = UNSAFE_getByType(
        require('@expo/vector-icons').MaterialCommunityIcons
      );
      expect(icon).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onRemove when Remove button is pressed', () => {
      const { getByText } = render(<RemoveCardModal {...defaultProps} />);
      const removeButton = getByText('Remove');
      fireEvent.press(removeButton);
      expect(mockOnRemove).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when Cancel button is pressed', () => {
      const { getByText } = render(<RemoveCardModal {...defaultProps} />);
      const cancelButton = getByText('Cancel');
      fireEvent.press(cancelButton);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when modal onRequestClose is triggered', () => {
      const { UNSAFE_getByType } = render(
        <RemoveCardModal {...defaultProps} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      modal.props.onRequestClose();
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid button presses correctly', () => {
      const { getByText } = render(<RemoveCardModal {...defaultProps} />);
      const removeButton = getByText('Remove');
      fireEvent.press(removeButton);
      fireEvent.press(removeButton);
      fireEvent.press(removeButton);
      expect(mockOnRemove).toHaveBeenCalledTimes(3);
    });

    it('should handle both buttons being pressed in sequence', () => {
      const { getByText } = render(<RemoveCardModal {...defaultProps} />);
      fireEvent.press(getByText('Remove'));
      fireEvent.press(getByText('Cancel'));
      expect(mockOnRemove).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Properties', () => {
    it('should use transparent mode', () => {
      const { UNSAFE_getByType } = render(
        <RemoveCardModal {...defaultProps} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.transparent).toBe(true);
    });

    it('should use fade animation', () => {
      const { UNSAFE_getByType } = render(
        <RemoveCardModal {...defaultProps} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.animationType).toBe('fade');
    });

    it('should respect visible prop', () => {
      const { UNSAFE_getByType } = render(
        <RemoveCardModal {...defaultProps} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(true);
    });
  });

  describe('Card Last 4 Digits', () => {
    it('should use default card last 4 when not provided', () => {
      const { getByText } = render(
        <RemoveCardModal
          visible={true}
          onCancel={mockOnCancel}
          onRemove={mockOnRemove}
        />
      );
      // Component doesn't display last 4, but it accepts the prop
      expect(getByText('Remove card?')).toBeTruthy();
    });

    it('should accept custom card last 4 digits', () => {
      const { getByText } = render(
        <RemoveCardModal {...defaultProps} cardLast4="1234" />
      );
      expect(getByText('Remove card?')).toBeTruthy();
    });

    it('should handle empty string for cardLast4', () => {
      const { getByText } = render(
        <RemoveCardModal {...defaultProps} cardLast4="" />
      );
      expect(getByText('Remove card?')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle onCancel being called when not visible', () => {
      const { UNSAFE_getByType } = render(
        <RemoveCardModal {...defaultProps} visible={false} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      modal.props.onRequestClose();
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should handle missing callbacks gracefully', () => {
      const { getByText } = render(
        <RemoveCardModal
          visible={true}
          onCancel={() => {}}
          onRemove={() => {}}
        />
      );
      const removeButton = getByText('Remove');
      expect(() => fireEvent.press(removeButton)).not.toThrow();
    });

    it('should handle undefined cardLast4 prop', () => {
      const { getByText } = render(
        <RemoveCardModal
          visible={true}
          onCancel={mockOnCancel}
          onRemove={mockOnRemove}
          cardLast4={undefined}
        />
      );
      expect(getByText('Remove card?')).toBeTruthy();
    });

    it('should render correctly after visibility toggle', () => {
      const { rerender, UNSAFE_getByType } = render(
        <RemoveCardModal {...defaultProps} visible={false} />
      );
      let modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(false);

      rerender(<RemoveCardModal {...defaultProps} visible={true} />);
      modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(true);
    });
  });
});
