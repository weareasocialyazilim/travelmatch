import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LimitReachedModal } from '../LimitReachedModal';

describe('LimitReachedModal', () => {
  const mockOnClose = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    limitAmount: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible is true', () => {
      const { getByText } = render(<LimitReachedModal {...defaultProps} />);
      expect(getByText('Limit reached')).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      const { UNSAFE_getByType } = render(
        <LimitReachedModal {...defaultProps} visible={false} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(false);
    });

    it('should render the headline', () => {
      const { getByText } = render(<LimitReachedModal {...defaultProps} />);
      expect(getByText('Limit reached')).toBeTruthy();
    });

    it('should render the limit amount in body text', () => {
      const { getByText } = render(<LimitReachedModal {...defaultProps} />);
      expect(
        getByText(
          'This amount exceeds your daily gift limit of $100.'
        )
      ).toBeTruthy();
    });

    it('should render the okay button', () => {
      const { getByText } = render(<LimitReachedModal {...defaultProps} />);
      expect(getByText('Okay')).toBeTruthy();
    });

    it('should render alert icon', () => {
      const { UNSAFE_getByType } = render(
        <LimitReachedModal {...defaultProps} />
      );
      const icons = UNSAFE_getByType(
        require('@expo/vector-icons').MaterialCommunityIcons
      );
      expect(icons).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when Okay button is pressed', () => {
      const { getByText } = render(<LimitReachedModal {...defaultProps} />);
      const okayButton = getByText('Okay');
      fireEvent.press(okayButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when modal onRequestClose is triggered', () => {
      const { UNSAFE_getByType } = render(
        <LimitReachedModal {...defaultProps} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      modal.props.onRequestClose();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid button presses correctly', () => {
      const { getByText } = render(<LimitReachedModal {...defaultProps} />);
      const okayButton = getByText('Okay');
      fireEvent.press(okayButton);
      fireEvent.press(okayButton);
      fireEvent.press(okayButton);
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });
  });

  describe('Modal Properties', () => {
    it('should use transparent mode', () => {
      const { UNSAFE_getByType } = render(
        <LimitReachedModal {...defaultProps} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.transparent).toBe(true);
    });

    it('should use fade animation', () => {
      const { UNSAFE_getByType } = render(
        <LimitReachedModal {...defaultProps} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.animationType).toBe('fade');
    });

    it('should respect visible prop', () => {
      const { UNSAFE_getByType } = render(
        <LimitReachedModal {...defaultProps} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(true);
    });
  });

  describe('Limit Amount Formatting', () => {
    it('should display small limit amounts correctly', () => {
      const { getByText } = render(
        <LimitReachedModal {...defaultProps} limitAmount={10} />
      );
      expect(
        getByText('This amount exceeds your daily gift limit of $10.')
      ).toBeTruthy();
    });

    it('should display large limit amounts correctly', () => {
      const { getByText } = render(
        <LimitReachedModal {...defaultProps} limitAmount={1000} />
      );
      expect(
        getByText(
          'This amount exceeds your daily gift limit of $1000.'
        )
      ).toBeTruthy();
    });

    it('should display zero limit correctly', () => {
      const { getByText } = render(
        <LimitReachedModal {...defaultProps} limitAmount={0} />
      );
      expect(
        getByText('This amount exceeds your daily gift limit of $0.')
      ).toBeTruthy();
    });

    it('should handle decimal amounts', () => {
      const { getByText } = render(
        <LimitReachedModal {...defaultProps} limitAmount={50.5} />
      );
      expect(
        getByText(
          'This amount exceeds your daily gift limit of $50.5.'
        )
      ).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle onClose being called when not visible', () => {
      const { UNSAFE_getByType } = render(
        <LimitReachedModal {...defaultProps} visible={false} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      modal.props.onRequestClose();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle missing onClose gracefully', () => {
      const { getByText } = render(
        <LimitReachedModal
          visible={true}
          onClose={() => {}}
          limitAmount={100}
        />
      );
      const okayButton = getByText('Okay');
      expect(() => fireEvent.press(okayButton)).not.toThrow();
    });

    it('should render correctly with very large limit amounts', () => {
      const { getByText } = render(
        <LimitReachedModal {...defaultProps} limitAmount={999999} />
      );
      expect(
        getByText(
          'This amount exceeds your daily gift limit of $999999.'
        )
      ).toBeTruthy();
    });

    it('should handle negative limit amounts', () => {
      const { getByText } = render(
        <LimitReachedModal {...defaultProps} limitAmount={-50} />
      );
      expect(
        getByText(
          'This amount exceeds your daily gift limit of $-50.'
        )
      ).toBeTruthy();
    });
  });
});
