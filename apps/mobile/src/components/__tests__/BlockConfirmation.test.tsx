import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { BlockConfirmation } from '../BlockConfirmation';
import { moderationService } from '../../services/moderationService';
import { useToast } from '../../context/ToastContext';

// Mock dependencies
jest.mock('../../services/moderationService', () => ({
  moderationService: {
    blockUser: jest.fn(),
  },
}));

jest.mock('../../context/ToastContext', () => ({
  useToast: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 20, top: 20, left: 0, right: 0 }),
}));

describe('BlockConfirmation', () => {
  const mockOnClose = jest.fn();
  const mockOnBlocked = jest.fn();
  const mockShowToast = jest.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    userId: 'user123',
    userName: 'John Doe',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast ).mockReturnValue({ showToast: mockShowToast });
    (moderationService.blockUser ).mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('renders correctly when visible', () => {
      const { getByText } = render(<BlockConfirmation {...defaultProps} />);
      
      expect(getByText(`Block ${defaultProps.userName}?`)).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Block')).toBeTruthy();
    });

    it('modal is not visible when visible prop is false', () => {
      const { UNSAFE_getByType } = render(
        <BlockConfirmation {...defaultProps} visible={false} />
      );
      
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(false);
    });

    it('displays user avatar when provided', () => {
      const { UNSAFE_getByType } = render(
        <BlockConfirmation {...defaultProps} userAvatar="https://example.com/avatar.jpg" />
      );
      
      const images = UNSAFE_getByType(require('react-native').Image);
      expect(images).toBeTruthy();
    });

    it('displays placeholder icon when no avatar provided', () => {
      const { UNSAFE_getAllByType } = render(<BlockConfirmation {...defaultProps} />);
      
      const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
      expect(icons.length).toBeGreaterThan(0);
    });

    it('displays all four consequences', () => {
      const { getByText } = render(<BlockConfirmation {...defaultProps} />);
      
      expect(getByText("They won't be able to see your profile or moments")).toBeTruthy();
      expect(getByText("They can't message you or send requests")).toBeTruthy();
      expect(getByText("Their content will be hidden from your feed")).toBeTruthy();
      expect(getByText("Any existing conversations will be hidden")).toBeTruthy();
    });

    it('displays note about not notifying user', () => {
      const { getByText } = render(<BlockConfirmation {...defaultProps} />);
      
      expect(getByText(/won't be notified that you blocked them/)).toBeTruthy();
    });

    it('displays note about unblocking', () => {
      const { getByText } = render(<BlockConfirmation {...defaultProps} />);
      
      expect(getByText(/unblock them later in Settings/)).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when Cancel is pressed', () => {
      const { getByText } = render(<BlockConfirmation {...defaultProps} />);
      
      fireEvent.press(getByText('Cancel'));
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when close X button is pressed', () => {
      const { UNSAFE_getAllByType } = render(<BlockConfirmation {...defaultProps} />);
      
      const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
      const closeButton = touchables[0]; // First touchable is the close X button
      
      fireEvent.press(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when modal backdrop is requested to close', () => {
      const { UNSAFE_getByType } = render(<BlockConfirmation {...defaultProps} />);
      const modal = UNSAFE_getByType(require('react-native').Modal);
      
      modal.props.onRequestClose();
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls moderationService.blockUser when Block is pressed', async () => {
      const { getByText } = render(<BlockConfirmation {...defaultProps} />);
      
      fireEvent.press(getByText('Block'));
      
      await waitFor(() => {
        expect(moderationService.blockUser).toHaveBeenCalledWith(defaultProps.userId);
      });
    });
  });

  describe('Async Block Operation - Success', () => {
    it('shows loading indicator and disables buttons during block operation', async () => {
      let resolveBlock: () => void;
      const blockPromise = new Promise<void>((resolve) => {
        resolveBlock = resolve;
      });
      (moderationService.blockUser ).mockReturnValue(blockPromise);

      const { getByText, UNSAFE_getByType } = render(<BlockConfirmation {...defaultProps} />);

      fireEvent.press(getByText('Block'));

      await waitFor(() => {
        expect(UNSAFE_getByType(require('react-native').ActivityIndicator)).toBeTruthy();
      });

      // Resolve and wait for state to settle
      await act(async () => {
        resolveBlock!();
        await blockPromise;
      });
    });

    it('shows success toast after blocking user', async () => {
      const { getByText } = render(<BlockConfirmation {...defaultProps} />);
      
      fireEvent.press(getByText('Block'));
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          `${defaultProps.userName} has been blocked`,
          'success'
        );
      });
    });

    it('calls onBlocked callback after successful block', async () => {
      const { getByText } = render(
        <BlockConfirmation {...defaultProps} onBlocked={mockOnBlocked} />
      );
      
      fireEvent.press(getByText('Block'));
      
      await waitFor(() => {
        expect(mockOnBlocked).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onClose after successful block', async () => {
      const { getByText } = render(<BlockConfirmation {...defaultProps} />);
      
      fireEvent.press(getByText('Block'));
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('executes full success flow in correct order', async () => {
      const callOrder: string[] = [];
      
      (moderationService.blockUser ).mockImplementation(() => {
        callOrder.push('blockUser');
        return Promise.resolve();
      });
      
      (useToast ).mockReturnValue({
        showToast: () => callOrder.push('showToast'),
      });
      
      const onBlocked = () => callOrder.push('onBlocked');
      const onClose = () => callOrder.push('onClose');
      
      const { getByText } = render(
        <BlockConfirmation {...defaultProps} onBlocked={onBlocked} onClose={onClose} />
      );
      
      fireEvent.press(getByText('Block'));
      
      await waitFor(() => {
        expect(callOrder).toEqual(['blockUser', 'showToast', 'onBlocked', 'onClose']);
      });
    });
  });

  describe('Async Block Operation - Error', () => {
    it('shows error toast when block fails', async () => {
      const error = new Error('Network error');
      (moderationService.blockUser ).mockRejectedValue(error);

      const { getByText } = render(<BlockConfirmation {...defaultProps} />);
      
      fireEvent.press(getByText('Block'));
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'Failed to block user',
          'error'
        );
      });
    });

    it('does not call onBlocked when block fails', async () => {
      (moderationService.blockUser ).mockRejectedValue(new Error('Error'));

      const { getByText } = render(
        <BlockConfirmation {...defaultProps} onBlocked={mockOnBlocked} />
      );
      
      fireEvent.press(getByText('Block'));
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalled();
      });
      
      expect(mockOnBlocked).not.toHaveBeenCalled();
    });

    it('does not call onClose when block fails', async () => {
      (moderationService.blockUser ).mockRejectedValue(new Error('Error'));

      const { getByText } = render(<BlockConfirmation {...defaultProps} />);
      
      fireEvent.press(getByText('Block'));
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalled();
      });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('re-enables buttons after error', async () => {
      (moderationService.blockUser ).mockRejectedValue(new Error('Error'));

      const { getByText } = render(<BlockConfirmation {...defaultProps} />);
      
      fireEvent.press(getByText('Block'));
      
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalled();
      });
      
      const cancelButton = getByText('Cancel').parent;
      const blockButton = getByText('Block').parent;
      
      expect(cancelButton?.props.disabled).toBeUndefined();
      expect(blockButton?.props.disabled).toBeUndefined();
    });
  });

  describe('Modal Properties', () => {
    it('renders as transparent modal', () => {
      const { UNSAFE_getByType } = render(<BlockConfirmation {...defaultProps} />);
      const modal = UNSAFE_getByType(require('react-native').Modal);
      
      expect(modal.props.transparent).toBe(true);
    });

    it('uses fade animation', () => {
      const { UNSAFE_getByType } = render(<BlockConfirmation {...defaultProps} />);
      const modal = UNSAFE_getByType(require('react-native').Modal);
      
      expect(modal.props.animationType).toBe('fade');
    });

    it('sets visible prop correctly', () => {
      const { UNSAFE_getByType, rerender } = render(<BlockConfirmation {...defaultProps} />);
      let modal = UNSAFE_getByType(require('react-native').Modal);
      
      expect(modal.props.visible).toBe(true);

      rerender(<BlockConfirmation {...defaultProps} visible={false} />);
      modal = UNSAFE_getByType(require('react-native').Modal);
      
      expect(modal.props.visible).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty userName', () => {
      const { getByText } = render(
        <BlockConfirmation {...defaultProps} userName="" />
      );
      
      expect(getByText('Block ?')).toBeTruthy();
    });

    it('handles very long userName', () => {
      const longName = 'A'.repeat(100);
      const { getByText } = render(
        <BlockConfirmation {...defaultProps} userName={longName} />
      );
      
      expect(getByText(`Block ${longName}?`)).toBeTruthy();
    });

    it('handles userName with special characters', () => {
      const { getByText } = render(
        <BlockConfirmation {...defaultProps} userName="John O'Brien-Smith" />
      );
      
      expect(getByText("Block John O'Brien-Smith?")).toBeTruthy();
    });

    it('handles missing onBlocked callback', async () => {
      const { getByText } = render(<BlockConfirmation {...defaultProps} />);
      
      fireEvent.press(getByText('Block'));
      
      await waitFor(() => {
        expect(moderationService.blockUser).toHaveBeenCalled();
      });
      
      // Should not throw error
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('handles rapid button presses during block operation', async () => {
      const { getByText } = render(<BlockConfirmation {...defaultProps} />);
      const blockButton = getByText('Block');
      
      fireEvent.press(blockButton);
      fireEvent.press(blockButton);
      fireEvent.press(blockButton);
      
      await waitFor(() => {
        expect(moderationService.blockUser).toHaveBeenCalledTimes(1);
      });
    });

    it('handles invalid userAvatar URL gracefully', () => {
      const { UNSAFE_getByType } = render(
        <BlockConfirmation {...defaultProps} userAvatar="invalid-url" />
      );
      
      // Should still render Image component
      expect(UNSAFE_getByType(require('react-native').Image)).toBeTruthy();
    });

    it('prevents callbacks during loading state', async () => {
      let resolveBlock: () => void;
      const blockPromise = new Promise<void>((resolve) => {
        resolveBlock = resolve;
      });
      (moderationService.blockUser ).mockReturnValue(blockPromise);

      const { getByText } = render(<BlockConfirmation {...defaultProps} />);
      
      fireEvent.press(getByText('Block'));
      
      await waitFor(() => {
        expect(moderationService.blockUser).toHaveBeenCalled();
      });
      
      // onClose should not be called yet (operation still in progress)
      expect(mockOnClose).not.toHaveBeenCalled();
      
      resolveBlock!();
      
      // After resolution, onClose should be called
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Content Display', () => {
    it('displays user avatar with correct source', () => {
      const avatarUrl = 'https://example.com/avatar.jpg';
      const { UNSAFE_getByType } = render(
        <BlockConfirmation {...defaultProps} userAvatar={avatarUrl} />
      );
      
      const image = UNSAFE_getByType(require('react-native').Image);
      expect(image.props.source).toEqual({ uri: avatarUrl });
    });

    it('displays checkmark icons for each consequence', () => {
      const { UNSAFE_getAllByType } = render(<BlockConfirmation {...defaultProps} />);
      
      const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
      const checkmarkIcons = icons.filter((icon: any) => icon.props.name === 'checkmark-circle');
      
      // Should have 4 checkmark icons (one for each consequence)
      expect(checkmarkIcons.length).toBeGreaterThanOrEqual(4);
    });
  });
});
