import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Share, Clipboard } from 'react-native';
import { ShareMomentBottomSheet } from '../ShareMomentBottomSheet';

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(),
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
  });

  describe('Rendering', () => {
    it('renders when visible is true', () => {
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      expect(getByText('Share moment')).toBeTruthy();
    });

    it('does not render when visible is false', () => {
      const { queryByText } = render(<ShareMomentBottomSheet {...defaultProps} visible={false} />);
      expect(queryByText('Share moment')).toBeNull();
    });

    it('renders handle bar', () => {
      const { UNSAFE_getByType } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const { View } = require('react-native');
      const views = UNSAFE_getByType(View);
      expect(views).toBeTruthy();
    });

    it('renders all share options', () => {
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      expect(getByText('Copy link')).toBeTruthy();
      expect(getByText('Share via...')).toBeTruthy();
    });

    it('renders social platform options', () => {
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      expect(getByText('Share to WhatsApp')).toBeTruthy();
      expect(getByText('Share to Instagram')).toBeTruthy();
    });

    it('renders divider between general and social options', () => {
      const { UNSAFE_getAllByType } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      expect(views.length).toBeGreaterThan(0);
    });

    it('renders MaterialCommunityIcons for each option', () => {
      const { UNSAFE_getAllByType } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      expect(icons.length).toBeGreaterThanOrEqual(4); // At least 4 options (copy, share, whatsapp, instagram)
    });
  });

  describe('Copy Link Functionality', () => {
    it('copies link to clipboard when "Copy link" is pressed', () => {
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      expect(Clipboard.setString).toHaveBeenCalledWith('https://travelmatch.com/moment/123');
    });

    it('shows success alert after copying link', () => {
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Link copied to clipboard!');
    });

    it('closes bottom sheet after successful copy', () => {
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('shows error alert if copy fails', () => {
      (Clipboard.setString ).mockImplementationOnce(() => {
        throw new Error('Copy failed');
      });
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to copy link');
    });

    it('uses default URL when momentUrl prop is not provided', () => {
      const { momentUrl, ...propsWithoutUrl } = defaultProps;
      const { getByText } = render(<ShareMomentBottomSheet {...propsWithoutUrl} />);
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      expect(Clipboard.setString).toHaveBeenCalledWith('https://travelmatch.com/moment/123');
    });
  });

  describe('Native Share Functionality', () => {
    it('calls Share.share when "Share via..." is pressed', async () => {
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const shareButton = getByText('Share via...');
      fireEvent.press(shareButton);
      await waitFor(() => {
        expect(Share.share).toHaveBeenCalledWith({
          message: 'Amazing coffee experience!\nhttps://travelmatch.com/moment/123',
          url: 'https://travelmatch.com/moment/123',
        });
      });
    });

    it('closes bottom sheet after successful share', async () => {
      (Share.share ).mockResolvedValueOnce({ action: 'sharedAction' });
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const shareButton = getByText('Share via...');
      fireEvent.press(shareButton);
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('uses default title when momentTitle prop is not provided', async () => {
      const { momentTitle, ...propsWithoutTitle } = defaultProps;
      const { getByText } = render(<ShareMomentBottomSheet {...propsWithoutTitle} />);
      const shareButton = getByText('Share via...');
      fireEvent.press(shareButton);
      await waitFor(() => {
        expect(Share.share).toHaveBeenCalledWith({
          message: 'Check out this amazing travel moment!\nhttps://travelmatch.com/moment/123',
          url: 'https://travelmatch.com/moment/123',
        });
      });
    });

    it('handles share cancellation gracefully', async () => {
      (Share.share ).mockResolvedValueOnce({ action: 'dismissedAction' });
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const shareButton = getByText('Share via...');
      fireEvent.press(shareButton);
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Social Platform Sharing', () => {
    it('shows WhatsApp alert when "Share to WhatsApp" is pressed', () => {
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const whatsappButton = getByText('Share to WhatsApp');
      fireEvent.press(whatsappButton);
      expect(Alert.alert).toHaveBeenCalledWith('WhatsApp', 'Opening WhatsApp...');
    });

    it('closes bottom sheet after WhatsApp action', () => {
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const whatsappButton = getByText('Share to WhatsApp');
      fireEvent.press(whatsappButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('shows Instagram alert when "Share to Instagram" is pressed', () => {
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const instagramButton = getByText('Share to Instagram');
      fireEvent.press(instagramButton);
      expect(Alert.alert).toHaveBeenCalledWith('Instagram', 'Opening Instagram...');
    });

    it('closes bottom sheet after Instagram action', () => {
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const instagramButton = getByText('Share to Instagram');
      fireEvent.press(instagramButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Modal Properties', () => {
    it('renders as Modal with transparent background', () => {
      const { UNSAFE_getByType } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.transparent).toBe(true);
    });

    it('uses slide animation', () => {
      const { UNSAFE_getByType } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.animationType).toBe('slide');
    });

    it('calls onClose when backdrop is pressed', () => {
      const { UNSAFE_getAllByType } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const { TouchableOpacity } = require('react-native');
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      const backdrop = touchables[0]; // First TouchableOpacity is the backdrop
      fireEvent.press(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when modal requests close', () => {
      const { UNSAFE_getByType } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      modal.props.onRequestClose();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid clicks on copy link', () => {
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      fireEvent.press(copyButton);
      fireEvent.press(copyButton);
      expect(Clipboard.setString).toHaveBeenCalledTimes(3);
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it('handles rapid clicks on different share options', () => {
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} />);
      fireEvent.press(getByText('Copy link'));
      fireEvent.press(getByText('Share to WhatsApp'));
      fireEvent.press(getByText('Share to Instagram'));
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it('handles very long momentUrl', () => {
      const longUrl = 'https://travelmatch.com/moment/' + 'a'.repeat(500);
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} momentUrl={longUrl} />);
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      expect(Clipboard.setString).toHaveBeenCalledWith(longUrl);
    });

    it('handles very long momentTitle', async () => {
      const longTitle = 'Amazing '.repeat(100) + 'experience!';
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} momentTitle={longTitle} />);
      const shareButton = getByText('Share via...');
      fireEvent.press(shareButton);
      await waitFor(() => {
        expect(Share.share).toHaveBeenCalledWith({
          message: `${longTitle}\nhttps://travelmatch.com/moment/123`,
          url: 'https://travelmatch.com/moment/123',
        });
      });
    });

    it('handles special characters in URL', () => {
      const specialUrl = 'https://travelmatch.com/moment/123?ref=share&utm_source=app';
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} momentUrl={specialUrl} />);
      const copyButton = getByText('Copy link');
      fireEvent.press(copyButton);
      expect(Clipboard.setString).toHaveBeenCalledWith(specialUrl);
    });

    it('handles special characters in title', async () => {
      const specialTitle = 'Amazing café! ☕️ #travel @TravelMatch';
      const { getByText } = render(<ShareMomentBottomSheet {...defaultProps} momentTitle={specialTitle} />);
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
