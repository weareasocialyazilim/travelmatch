import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { BlockConfirmation } from '../BlockConfirmation';
import { moderationService } from '../../../../services/moderationService';
import { useToast } from '../../../../context/ToastContext';

// Mock dependencies
jest.mock('../../../../services/moderationService', () => ({
  moderationService: {
    blockUser: jest.fn(),
  },
}));

jest.mock('../../../../context/ToastContext', () => ({
  useToast: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 20, top: 20, left: 0, right: 0 }),
}));

describe('BlockConfirmation', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnBlocked = jest.fn() as jest.Mock;
  const mockShowToast = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    userId: 'user123',
    userName: 'John Doe',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    (moderationService.blockUser as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('renders correctly when visible', () => {
      const { getByText } = render(<BlockConfirmation {...defaultProps} />);

      expect(getByText(`Block ${defaultProps.userName}?`)).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Block')).toBeTruthy();
    });

    it('displays all four consequences', () => {
      const { getByText } = render(<BlockConfirmation {...defaultProps} />);

      expect(
        getByText("They won't be able to see your profile or moments"),
      ).toBeTruthy();
      expect(getByText("They can't message you or send requests")).toBeTruthy();
      expect(
        getByText('Their content will be hidden from your feed'),
      ).toBeTruthy();
      expect(
        getByText('Any existing conversations will be hidden'),
      ).toBeTruthy();
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

    it('calls moderationService.blockUser when Block is pressed', async () => {
      const { getByText } = render(<BlockConfirmation {...defaultProps} />);

      fireEvent.press(getByText('Block'));

      await waitFor(() => {
        expect(moderationService.blockUser).toHaveBeenCalledWith(
          defaultProps.userId,
        );
      });
    });
  });

  describe('Async Block Operation - Success', () => {
    it('shows success toast after blocking user', async () => {
      const { getByText } = render(<BlockConfirmation {...defaultProps} />);

      fireEvent.press(getByText('Block'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          `${defaultProps.userName} has been blocked`,
          'success',
        );
      });
    });

    it('calls onBlocked callback after successful block', async () => {
      const { getByText } = render(
        <BlockConfirmation {...defaultProps} onBlocked={mockOnBlocked} />,
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

      (moderationService.blockUser as jest.Mock).mockImplementation(() => {
        callOrder.push('blockUser');
        return Promise.resolve();
      });

      (useToast as jest.Mock).mockReturnValue({
        showToast: () => callOrder.push('showToast'),
      });

      const onBlocked = () => callOrder.push('onBlocked');
      const onClose = () => callOrder.push('onClose');

      const { getByText } = render(
        <BlockConfirmation
          {...defaultProps}
          onBlocked={onBlocked}
          onClose={onClose}
        />,
      );

      fireEvent.press(getByText('Block'));

      await waitFor(() => {
        expect(callOrder).toEqual([
          'blockUser',
          'showToast',
          'onBlocked',
          'onClose',
        ]);
      });
    });
  });

  describe('Async Block Operation - Error', () => {
    it('shows error toast when block fails', async () => {
      const error = new Error('Network error');
      (moderationService.blockUser as jest.Mock).mockRejectedValue(error);

      const { getByText } = render(<BlockConfirmation {...defaultProps} />);

      fireEvent.press(getByText('Block'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'Failed to block user',
          'error',
        );
      });
    });

    it('does not call onBlocked when block fails', async () => {
      (moderationService.blockUser as jest.Mock).mockRejectedValue(
        new Error('Error'),
      );

      const { getByText } = render(
        <BlockConfirmation {...defaultProps} onBlocked={mockOnBlocked} />,
      );

      fireEvent.press(getByText('Block'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalled();
      });

      expect(mockOnBlocked).not.toHaveBeenCalled();
    });

    it('does not call onClose when block fails', async () => {
      (moderationService.blockUser as jest.Mock).mockRejectedValue(
        new Error('Error'),
      );

      const { getByText } = render(<BlockConfirmation {...defaultProps} />);

      fireEvent.press(getByText('Block'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalled();
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty userName', () => {
      const { getByText } = render(
        <BlockConfirmation {...defaultProps} userName="" />,
      );

      expect(getByText('Block ?')).toBeTruthy();
    });

    it('handles very long userName', () => {
      const longName = 'A'.repeat(100);
      const { getByText } = render(
        <BlockConfirmation {...defaultProps} userName={longName} />,
      );

      expect(getByText(`Block ${longName}?`)).toBeTruthy();
    });

    it('handles userName with special characters', () => {
      const { getByText } = render(
        <BlockConfirmation {...defaultProps} userName="John O'Brien-Smith" />,
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
  });
});
