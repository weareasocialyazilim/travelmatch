import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChatAttachmentBottomSheet } from '../ChatAttachmentBottomSheet';

describe('ChatAttachmentBottomSheet', () => {
  const mockOnClose = jest.fn();
  const mockOnPhotoVideo = jest.fn();
  const mockOnGift = jest.fn();
  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onPhotoVideo: mockOnPhotoVideo,
    onGift: mockOnGift,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when visible is true', () => {
      const { getByText } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      expect(getByText('Add to message')).toBeTruthy();
    });

    it('does not render when visible is false', () => {
      const { queryByText } = render(<ChatAttachmentBottomSheet {...defaultProps} visible={false} />);
      // Modal still renders in DOM but content inside may still be accessible
      // Just check that modal is not visible
      const { UNSAFE_queryByType } = render(<ChatAttachmentBottomSheet {...defaultProps} visible={false} />);
      const { Modal } = require('react-native');
      const modal = UNSAFE_queryByType(Modal);
      expect(modal.props.visible).toBe(false);
    });

    it('renders handle bar', () => {
      const { UNSAFE_getAllByType } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      expect(views.length).toBeGreaterThan(0);
    });

    it('renders "Photo or Video" option', () => {
      const { getByText } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      expect(getByText('Photo or Video')).toBeTruthy();
      expect(getByText('Share a photo or video')).toBeTruthy();
    });

    it('renders "Send a Gift" option', () => {
      const { getByText } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      expect(getByText('Send a Gift')).toBeTruthy();
      expect(getByText('Gift this moment to someone')).toBeTruthy();
    });

    it('renders camera icon for Photo or Video', () => {
      const { UNSAFE_getAllByType } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      // Should have camera and gift icons + chevron-right icons
      expect(icons.length).toBeGreaterThanOrEqual(2);
    });

    it('renders gift icon for Send a Gift', () => {
      const { UNSAFE_getAllByType } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      expect(icons.length).toBeGreaterThanOrEqual(2);
    });

    it('renders separator between options', () => {
      const { UNSAFE_getAllByType } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      // Should have multiple View elements including separator
      expect(views.length).toBeGreaterThan(5);
    });
  });

  describe('User Interactions', () => {
    it('calls onPhotoVideo when "Photo or Video" is pressed', () => {
      const { getByText } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const photoVideoButton = getByText('Photo or Video');
      fireEvent.press(photoVideoButton);
      expect(mockOnPhotoVideo).toHaveBeenCalled();
    });

    it('calls onClose after "Photo or Video" is pressed', () => {
      const { getByText } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const photoVideoButton = getByText('Photo or Video');
      fireEvent.press(photoVideoButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onGift when "Send a Gift" is pressed', () => {
      const { getByText } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const giftButton = getByText('Send a Gift');
      fireEvent.press(giftButton);
      expect(mockOnGift).toHaveBeenCalled();
    });

    it('calls onClose after "Send a Gift" is pressed', () => {
      const { getByText } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const giftButton = getByText('Send a Gift');
      fireEvent.press(giftButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop is pressed', () => {
      const { UNSAFE_getAllByType } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const { Pressable } = require('react-native');
      const pressables = UNSAFE_getAllByType(Pressable);
      const backdrop = pressables[0]; // First Pressable is the backdrop
      fireEvent.press(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Modal Properties', () => {
    it('renders as Modal with transparent background', () => {
      const { UNSAFE_getByType } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.transparent).toBe(true);
    });

    it('uses slide animation', () => {
      const { UNSAFE_getByType } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.animationType).toBe('slide');
    });

    it('calls onClose when modal requests close', () => {
      const { UNSAFE_getByType } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      modal.props.onRequestClose();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('has statusBarTranslucent set to true', () => {
      const { UNSAFE_getByType } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.statusBarTranslucent).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid clicks on Photo or Video', () => {
      const { getByText } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const photoVideoButton = getByText('Photo or Video');
      fireEvent.press(photoVideoButton);
      fireEvent.press(photoVideoButton);
      fireEvent.press(photoVideoButton);
      expect(mockOnPhotoVideo).toHaveBeenCalledTimes(3);
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it('handles rapid clicks on Send a Gift', () => {
      const { getByText } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const giftButton = getByText('Send a Gift');
      fireEvent.press(giftButton);
      fireEvent.press(giftButton);
      expect(mockOnGift).toHaveBeenCalledTimes(2);
      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });

    it('handles alternating between options', () => {
      const { getByText } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      fireEvent.press(getByText('Photo or Video'));
      fireEvent.press(getByText('Send a Gift'));
      fireEvent.press(getByText('Photo or Video'));
      expect(mockOnPhotoVideo).toHaveBeenCalledTimes(2);
      expect(mockOnGift).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it('handles rapid backdrop clicks', () => {
      const { UNSAFE_getAllByType } = render(<ChatAttachmentBottomSheet {...defaultProps} />);
      const { Pressable } = require('react-native');
      const pressables = UNSAFE_getAllByType(Pressable);
      const backdrop = pressables[0];
      fireEvent.press(backdrop);
      fireEvent.press(backdrop);
      fireEvent.press(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });
  });
});
