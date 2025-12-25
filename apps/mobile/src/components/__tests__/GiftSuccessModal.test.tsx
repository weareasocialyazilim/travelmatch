import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { GiftSuccessModal } from '../GiftSuccessModal';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock react-native Vibration module explicitly for these tests
jest.mock('react-native/Libraries/Vibration/Vibration', () => ({
  vibrate: jest.fn(),
  cancel: jest.fn(),
}));

describe('GiftSuccessModal', () => {
  const mockOnClose = jest.fn();
  const mockOnViewApprovals = jest.fn();

  const defaultProps = {
    visible: true,
    amount: 25.5,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios'; // Reset to iOS by default
  });

  describe('Rendering', () => {
    it('renders correctly when visible', () => {
      const { getByText } = render(<GiftSuccessModal {...defaultProps} />);

      expect(getByText('Gesture Sent!')).toBeTruthy();
      expect(getByText('Return Home')).toBeTruthy();
    });

    it('modal is not visible when visible prop is false', () => {
      const { UNSAFE_getByType } = render(
        <GiftSuccessModal {...defaultProps} visible={false} />,
      );

      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(false);
    });

    it('displays success message', () => {
      const { getByText } = render(<GiftSuccessModal {...defaultProps} />);

      expect(getByText('Gesture Sent!')).toBeTruthy();
    });

    it('displays formatted amount', () => {
      const { getByText } = render(
        <GiftSuccessModal {...defaultProps} amount={50} />,
      );

      expect(getByText(/\$50\.00/)).toBeTruthy();
    });

    it('renders success icon', () => {
      const { UNSAFE_getAllByType } = render(
        <GiftSuccessModal {...defaultProps} />,
      );

      const icons = UNSAFE_getAllByType(
        require('@expo/vector-icons').MaterialCommunityIcons,
      );
      expect(icons.length).toBeGreaterThan(0);
    });

    it('renders Return Home button', () => {
      const { getByText } = render(<GiftSuccessModal {...defaultProps} />);

      expect(getByText('Return Home')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when Return Home button is pressed', () => {
      const { getByText } = render(<GiftSuccessModal {...defaultProps} />);

      fireEvent.press(getByText('Return Home'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when modal backdrop is requested to close', () => {
      const { UNSAFE_getByType } = render(
        <GiftSuccessModal {...defaultProps} />,
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);

      modal.props.onRequestClose();

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Properties', () => {
    it('renders as transparent modal', () => {
      const { UNSAFE_getByType } = render(
        <GiftSuccessModal {...defaultProps} />,
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);

      expect(modal.props.transparent).toBe(true);
    });

    it('sets visible prop correctly', () => {
      const { UNSAFE_getByType, rerender } = render(
        <GiftSuccessModal {...defaultProps} />,
      );
      let modal = UNSAFE_getByType(require('react-native').Modal);

      expect(modal.props.visible).toBe(true);

      rerender(<GiftSuccessModal {...defaultProps} visible={false} />);
      modal = UNSAFE_getByType(require('react-native').Modal);

      expect(modal.props.visible).toBe(false);
    });
  });

  describe('Optional Props', () => {
    it('handles missing momentTitle prop', () => {
      const { getByText } = render(<GiftSuccessModal {...defaultProps} />);

      expect(getByText('Gesture Sent!')).toBeTruthy();
    });

    it('handles missing onViewApprovals prop', () => {
      const { getByText } = render(<GiftSuccessModal {...defaultProps} />);

      fireEvent.press(getByText('Return Home'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('renders with momentTitle provided', () => {
      const { getByText } = render(
        <GiftSuccessModal {...defaultProps} momentTitle="Paris Trip" />,
      );

      expect(getByText('Gesture Sent!')).toBeTruthy();
    });

    it('renders with onViewApprovals provided', () => {
      const { getByText } = render(
        <GiftSuccessModal
          {...defaultProps}
          onViewApprovals={mockOnViewApprovals}
        />,
      );

      expect(getByText('Return Home')).toBeTruthy();
    });
  });

  describe('Amount Formatting', () => {
    it('formats whole numbers with decimals', () => {
      const { getByText } = render(
        <GiftSuccessModal {...defaultProps} amount={100} />,
      );

      expect(getByText(/\$100\.00/)).toBeTruthy();
    });

    it('formats cents correctly', () => {
      const { getByText } = render(
        <GiftSuccessModal {...defaultProps} amount={0.99} />,
      );

      expect(getByText(/\$0\.99/)).toBeTruthy();
    });

    it('formats decimal amounts', () => {
      const { getByText } = render(
        <GiftSuccessModal {...defaultProps} amount={25.5} />,
      );

      expect(getByText(/\$25\.50/)).toBeTruthy();
    });
  });

  describe('Platform Behavior', () => {
    it('triggers haptic feedback on iOS when modal appears', () => {
      const Haptics = require('expo-haptics');
      Platform.OS = 'ios';

      render(<GiftSuccessModal {...defaultProps} visible={true} />);

      expect(Haptics.notificationAsync).toHaveBeenCalled();
    });

    it('does not trigger iOS haptics on Android', () => {
      const Haptics = require('expo-haptics');
      Platform.OS = 'android';
      Haptics.notificationAsync.mockClear();

      render(<GiftSuccessModal {...defaultProps} visible={true} />);

      // Android uses Vibration instead
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid button presses', () => {
      const { getByText } = render(<GiftSuccessModal {...defaultProps} />);
      const doneButton = getByText('Return Home');

      fireEvent.press(doneButton);
      fireEvent.press(doneButton);
      fireEvent.press(doneButton);

      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it('handles zero amount', () => {
      const { getByText } = render(
        <GiftSuccessModal {...defaultProps} amount={0} />,
      );

      expect(getByText(/\$0\.00/)).toBeTruthy();
    });

    it('handles large amounts', () => {
      const { getByText } = render(
        <GiftSuccessModal {...defaultProps} amount={9999.99} />,
      );

      expect(getByText(/\$9999\.99/)).toBeTruthy();
    });

    it('handles modal visibility toggle', () => {
      const { UNSAFE_getByType, rerender } = render(
        <GiftSuccessModal {...defaultProps} visible={true} />,
      );

      let modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(true);

      rerender(<GiftSuccessModal {...defaultProps} visible={false} />);
      modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(false);

      rerender(<GiftSuccessModal {...defaultProps} visible={true} />);
      modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(true);
    });
  });
});
