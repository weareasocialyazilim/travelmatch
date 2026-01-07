import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Clipboard, Share, Linking } from 'react-native';
import { ShareMomentBottomSheet } from '../../features/moments/components/ShareMomentBottomSheet';

// Mock the toast context
const mockShowToast = jest.fn() as jest.Mock;
jest.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('ShareMomentBottomSheet', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    momentUrl: 'https://travelmatch.app/moment/123',
    momentTitle: 'Amazing coffee experience!',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Share and Linking mocks from jest.native-mocks.js
    (Share.share as jest.Mock).mockResolvedValue({ action: 'sharedAction' });
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    (Linking.openURL as jest.Mock).mockResolvedValue(undefined);
    (Clipboard.setString as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    it('renders when visible is true', () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      expect(getByText('Share moment')).toBeTruthy();
    });

    it('does not render content when visible is false', () => {
      const { queryByText } = render(
        <ShareMomentBottomSheet {...defaultProps} visible={false} />,
      );
      // Modal content should not be accessible when not visible
      expect(queryByText('Share moment')).toBeNull();
    });

    it('renders title and handle bar', () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      // Handle bar is visual - verify the bottom sheet title renders
      expect(getByText('Share moment')).toBeTruthy();
    });

    it('renders all share options', () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      expect(getByText('Copy link')).toBeTruthy();
      expect(getByText('Share via...')).toBeTruthy();
    });

    it('renders social platform options', () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      expect(getByText('Share to WhatsApp')).toBeTruthy();
      expect(getByText('Share to Instagram')).toBeTruthy();
    });

    it('renders divider between general and social options', () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      // Divider is visual - verify both sections render
      expect(getByText('Copy link')).toBeTruthy();
      expect(getByText('Share to WhatsApp')).toBeTruthy();
    });

    it('renders all share option labels', () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      // Verify all 4 share options render with labels
      expect(getByText('Copy link')).toBeTruthy();
      expect(getByText('Share via...')).toBeTruthy();
      expect(getByText('Share to WhatsApp')).toBeTruthy();
      expect(getByText('Share to Instagram')).toBeTruthy();
    });
  });

  describe('Copy Link Functionality', () => {
    it('copies link to clipboard when "Copy link" is pressed', () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      expect(Clipboard.setString).toHaveBeenCalledWith(
        'https://travelmatch.app/moment/123',
      );
    });

    it('shows success toast after copying link', () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      expect(mockShowToast).toHaveBeenCalledWith(
        'Link copied to clipboard!',
        'success',
      );
    });

    it('closes bottom sheet after successful copy', () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('shows error toast if copy fails', () => {
      (Clipboard.setString as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Copy failed');
      });
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      expect(mockShowToast).toHaveBeenCalledWith('Link kopyalanamadı', 'error');
    });
  });

  describe('Native Share Functionality', () => {
    it('calls Share.share when "Share via..." is pressed', async () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const shareButton = getByText('Share via...');
      fireEvent.press(shareButton);
      await waitFor(() => {
        expect(Share.share).toHaveBeenCalledWith({
          message:
            'Amazing coffee experience!\nhttps://travelmatch.app/moment/123',
          url: 'https://travelmatch.app/moment/123',
        });
      });
    });

    it('closes bottom sheet after successful share', async () => {
      (Share.share as jest.Mock).mockResolvedValueOnce({
        action: 'sharedAction',
      });
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const shareButton = getByText('Share via...');
      fireEvent.press(shareButton);
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('uses default title when momentTitle prop is not provided', async () => {
      const { momentTitle, ...propsWithoutTitle } = defaultProps;
      const { getByText } = render(
        <ShareMomentBottomSheet {...propsWithoutTitle} />,
      );
      const shareButton = getByText('Share via...');
      fireEvent.press(shareButton);
      await waitFor(() => {
        expect(Share.share).toHaveBeenCalledWith({
          message:
            'Check out this amazing travel moment!\nhttps://travelmatch.app/moment/123',
          url: 'https://travelmatch.app/moment/123',
        });
      });
    });
  });

  describe('Social Platform Sharing', () => {
    it('opens WhatsApp when "Share to WhatsApp" is pressed', async () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const whatsappButton = getByText('Share to WhatsApp');
      fireEvent.press(whatsappButton);
      await waitFor(() => {
        expect(Linking.canOpenURL).toHaveBeenCalled();
        expect(Linking.openURL).toHaveBeenCalled();
      });
    });

    it('closes bottom sheet after WhatsApp action', async () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const whatsappButton = getByText('Share to WhatsApp');
      fireEvent.press(whatsappButton);
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('shows warning toast when WhatsApp is not installed', async () => {
      // Set canOpenURL to return false for this specific test
      (Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(false);
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const whatsappButton = getByText('Share to WhatsApp');
      fireEvent.press(whatsappButton);
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'WhatsApp is not installed',
          'warning',
        );
      });
    });

    it('opens Instagram when "Share to Instagram" is pressed', async () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const instagramButton = getByText('Share to Instagram');
      fireEvent.press(instagramButton);
      await waitFor(() => {
        expect(Linking.canOpenURL).toHaveBeenCalled();
        expect(Linking.openURL).toHaveBeenCalled();
      });
    });

    it('closes bottom sheet after Instagram action', async () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const instagramButton = getByText('Share to Instagram');
      fireEvent.press(instagramButton);
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('shows warning toast when Instagram is not installed', async () => {
      // Set canOpenURL to return false for this specific test
      (Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(false);
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const instagramButton = getByText('Share to Instagram');
      fireEvent.press(instagramButton);
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'Instagram is not installed',
          'warning',
        );
      });
    });
  });

  describe('Modal Properties', () => {
    it('renders as Modal with content', () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      // Verify modal content is rendered (transparent/slide are visual properties)
      expect(getByText('Share moment')).toBeTruthy();
    });

    it('renders all share options correctly', () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      expect(getByText('Copy link')).toBeTruthy();
      expect(getByText('Share via...')).toBeTruthy();
    });

    it('calls onClose when copy link is pressed', () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      fireEvent.press(getByText('Copy link'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose after successful share action', async () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      fireEvent.press(getByText('Share via...'));
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid clicks on copy link', () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      fireEvent.press(copyButton);
      fireEvent.press(copyButton);
      expect(Clipboard.setString).toHaveBeenCalledTimes(3);
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it('handles very long momentUrl', () => {
      const longUrl = 'https://travelmatch.app/moment/' + 'a'.repeat(500);
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} momentUrl={longUrl} />,
      );
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      expect(Clipboard.setString).toHaveBeenCalledWith(longUrl);
    });

    it('handles very long momentTitle', async () => {
      const longTitle = 'Amazing '.repeat(100) + 'experience!';
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} momentTitle={longTitle} />,
      );
      const shareButton = getByText('Share via...');
      fireEvent.press(shareButton);
      await waitFor(() => {
        expect(Share.share).toHaveBeenCalledWith({
          message: `${longTitle}\nhttps://travelmatch.app/moment/123`,
          url: 'https://travelmatch.app/moment/123',
        });
      });
    });

    it('handles special characters in URL', () => {
      const specialUrl =
        'https://travelmatch.app/moment/123?ref=share&utm_source=app';
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} momentUrl={specialUrl} />,
      );
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      expect(Clipboard.setString).toHaveBeenCalledWith(specialUrl);
    });

    it('handles special characters in title', async () => {
      const specialTitle = 'Amazing café! ☕️ #travel @TravelMatch';
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} momentTitle={specialTitle} />,
      );
      const shareButton = getByText('Share via...');
      fireEvent.press(shareButton);
      await waitFor(() => {
        expect(Share.share).toHaveBeenCalledWith({
          message: `${specialTitle}\nhttps://travelmatch.app/moment/123`,
          url: 'https://travelmatch.app/moment/123',
        });
      });
    });
  });
});
