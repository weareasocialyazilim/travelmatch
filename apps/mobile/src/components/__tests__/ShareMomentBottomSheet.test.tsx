import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Share, Linking, Modal, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ShareMomentBottomSheet } from '../ShareMomentBottomSheet';

// Mock useToast
const mockShowToast = jest.fn();
jest.mock('../../context/ToastContext', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock expo-clipboard
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(undefined),
}));

describe('ShareMomentBottomSheet', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    momentUrl: 'https://travelmatch.com/moment/123',
    momentTitle: 'Amazing coffee experience!',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to default behavior
    (Clipboard.setStringAsync as jest.Mock).mockResolvedValue(undefined);
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValue(undefined as unknown as void);
    jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: 'sharedAction', activityType: undefined });
  });

  describe('Rendering', () => {
    it('renders when visible is true', () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
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

    it('renders multiple Views for layout', () => {
      const { UNSAFE_getAllByType } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const views = UNSAFE_getAllByType(View);
      expect(views.length).toBeGreaterThan(0);
    });
  });

  describe('Copy Link Functionality', () => {
    it('copies link to clipboard when "Copy link" is pressed', async () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      await waitFor(() => {
        expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
          'https://travelmatch.com/moment/123',
        );
      });
    });

    it('shows success toast after copying link', async () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'Link copied to clipboard!',
          'success',
        );
      });
    });

    it('closes bottom sheet after successful copy', async () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('shows error toast if copy fails', async () => {
      (Clipboard.setStringAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Copy failed'),
      );
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'Link kopyalanamadı',
          'error',
        );
      });
    });

    it('uses default URL when momentUrl prop is not provided', async () => {
      const { momentUrl, ...propsWithoutUrl } = defaultProps;
      const { getByText } = render(
        <ShareMomentBottomSheet {...propsWithoutUrl} />,
      );
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      await waitFor(() => {
        // Default URL in component is 'https://travelmatch.com/moment/123'
        expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
          'https://travelmatch.com/moment/123',
        );
      });
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
            'Amazing coffee experience!\nhttps://travelmatch.com/moment/123',
          url: 'https://travelmatch.com/moment/123',
        });
      });
    });

    it('closes bottom sheet after successful share', async () => {
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
            'Check out this amazing travel moment!\nhttps://travelmatch.com/moment/123',
          url: 'https://travelmatch.com/moment/123',
        });
      });
    });

    it('handles share error gracefully', async () => {
      (Share.share as jest.Mock).mockRejectedValueOnce(
        new Error('Share failed'),
      );
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const shareButton = getByText('Share via...');
      fireEvent.press(shareButton);
      // Should not throw - errors are caught
      await waitFor(() => {
        expect(Share.share).toHaveBeenCalled();
      });
    });
  });

  describe('WhatsApp Sharing', () => {
    it('opens WhatsApp URL when "Share to WhatsApp" is pressed', async () => {
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

    it('shows warning toast if WhatsApp is not installed', async () => {
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
  });

  describe('Instagram Sharing', () => {
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

    it('shows info toast when Instagram opens', async () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const instagramButton = getByText('Share to Instagram');
      fireEvent.press(instagramButton);
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'Please paste the link in Instagram',
          'info',
        );
      });
    });

    it('shows warning toast if Instagram is not installed', async () => {
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
  });

  describe('Modal Properties', () => {
    it('renders as Modal with transparent background', () => {
      const { UNSAFE_getByType } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.transparent).toBe(true);
    });

    it('uses slide animation', () => {
      const { UNSAFE_getByType } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.animationType).toBe('slide');
    });

    it('calls onClose when modal requests close', () => {
      const { UNSAFE_getByType } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const modal = UNSAFE_getByType(Modal);
      modal.props.onRequestClose();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple copy link clicks', async () => {
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} />,
      );
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      fireEvent.press(copyButton);
      fireEvent.press(copyButton);
      await waitFor(() => {
        expect(Clipboard.setStringAsync).toHaveBeenCalledTimes(3);
        expect(mockOnClose).toHaveBeenCalledTimes(3);
      });
    });

    it('handles very long momentUrl', async () => {
      const longUrl = 'https://travelmatch.com/moment/' + 'a'.repeat(500);
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} momentUrl={longUrl} />,
      );
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      await waitFor(() => {
        expect(Clipboard.setStringAsync).toHaveBeenCalledWith(longUrl);
      });
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
          message: `${longTitle}\nhttps://travelmatch.com/moment/123`,
          url: 'https://travelmatch.com/moment/123',
        });
      });
    });

    it('handles special characters in URL', async () => {
      const specialUrl =
        'https://travelmatch.com/moment/123?ref=share&utm_source=app';
      const { getByText } = render(
        <ShareMomentBottomSheet {...defaultProps} momentUrl={specialUrl} />,
      );
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      await waitFor(() => {
        expect(Clipboard.setStringAsync).toHaveBeenCalledWith(specialUrl);
      });
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
          message: `${specialTitle}\nhttps://travelmatch.com/moment/123`,
          url: 'https://travelmatch.com/moment/123',
        });
      });
    });
  });
});
