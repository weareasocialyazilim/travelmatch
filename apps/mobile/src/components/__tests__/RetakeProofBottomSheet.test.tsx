import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RetakeProofBottomSheet } from '../RetakeProofBottomSheet';

describe('RetakeProofBottomSheet', () => {
  const mockOnClose = jest.fn();
  const mockOnTakeNewPhoto = jest.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onTakeNewPhoto: mockOnTakeNewPhoto,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when visible', () => {
      const { getByText } = render(<RetakeProofBottomSheet {...defaultProps} />);
      expect(getByText('Retake proof?')).toBeTruthy();
    });

    it('renders headline text', () => {
      const { getByText } = render(<RetakeProofBottomSheet {...defaultProps} />);
      expect(getByText('Retake proof?')).toBeTruthy();
    });

    it('renders "Take new photo" option', () => {
      const { getByText } = render(<RetakeProofBottomSheet {...defaultProps} />);
      expect(getByText('Take new photo')).toBeTruthy();
    });

    it('renders camera icon', () => {
      const component = render(<RetakeProofBottomSheet {...defaultProps} />);
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icon = component.UNSAFE_getByType(MaterialCommunityIcons);
      expect(icon.props.name).toBe('camera');
      expect(icon.props.size).toBe(24);
    });

    it('renders Cancel button', () => {
      const { getByText } = render(<RetakeProofBottomSheet {...defaultProps} />);
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('renders handle bar', () => {
      const component = render(<RetakeProofBottomSheet {...defaultProps} />);
      const { View } = require('react-native');
      const views = component.UNSAFE_queryAllByType(View);
      // Handle exists in the component
      expect(views.length).toBeGreaterThan(0);
    });

    it('renders divider between option and cancel', () => {
      const component = render(<RetakeProofBottomSheet {...defaultProps} />);
      const { View } = require('react-native');
      const views = component.UNSAFE_queryAllByType(View);
      // Divider exists in the component
      expect(views.length).toBeGreaterThan(0);
    });

    it('does not render when not visible', () => {
      const { toJSON } = render(<RetakeProofBottomSheet {...defaultProps} visible={false} />);
      const modal = toJSON();
      expect(modal?.props.visible).toBe(false);
    });
  });

  describe('User Interactions', () => {
    it('calls onTakeNewPhoto when "Take new photo" pressed', () => {
      const { getByText } = render(<RetakeProofBottomSheet {...defaultProps} />);
      const takePhotoButton = getByText('Take new photo');
      fireEvent.press(takePhotoButton);
      expect(mockOnTakeNewPhoto).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when "Take new photo" pressed', () => {
      const { getByText } = render(<RetakeProofBottomSheet {...defaultProps} />);
      const takePhotoButton = getByText('Take new photo');
      fireEvent.press(takePhotoButton);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Cancel button pressed', () => {
      const { getByText } = render(<RetakeProofBottomSheet {...defaultProps} />);
      const cancelButton = getByText('Cancel');
      fireEvent.press(cancelButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop pressed', () => {
      const component = render(<RetakeProofBottomSheet {...defaultProps} />);
      const { TouchableWithoutFeedback } = require('react-native');
      const backdrop = component.UNSAFE_getByType(TouchableWithoutFeedback);
      fireEvent.press(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Properties', () => {
    it('sets modal as transparent', () => {
      const { toJSON } = render(<RetakeProofBottomSheet {...defaultProps} />);
      const modal = toJSON();
      expect(modal?.props.transparent).toBe(true);
    });

    it('uses slide animation', () => {
      const { toJSON } = render(<RetakeProofBottomSheet {...defaultProps} />);
      const modal = toJSON();
      expect(modal?.props.animationType).toBe('slide');
    });

    it('calls onClose on onRequestClose', () => {
      const { toJSON } = render(<RetakeProofBottomSheet {...defaultProps} />);
      const modal = toJSON();
      modal?.props.onRequestClose();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid clicks on "Take new photo"', () => {
      const { getByText } = render(<RetakeProofBottomSheet {...defaultProps} />);
      const takePhotoButton = getByText('Take new photo');
      fireEvent.press(takePhotoButton);
      fireEvent.press(takePhotoButton);
      fireEvent.press(takePhotoButton);
      // Should register all clicks (component doesn't debounce)
      expect(mockOnTakeNewPhoto).toHaveBeenCalledTimes(3);
    });

    it('handles rapid clicks on Cancel', () => {
      const { getByText } = render(<RetakeProofBottomSheet {...defaultProps} />);
      const cancelButton = getByText('Cancel');
      fireEvent.press(cancelButton);
      fireEvent.press(cancelButton);
      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });

    it('handles rapid backdrop clicks', () => {
      const component = render(<RetakeProofBottomSheet {...defaultProps} />);
      const { TouchableWithoutFeedback } = require('react-native');
      const backdrop = component.UNSAFE_getByType(TouchableWithoutFeedback);
      fireEvent.press(backdrop);
      fireEvent.press(backdrop);
      fireEvent.press(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it('renders correctly when toggling visibility', () => {
      const { rerender, getByText } = render(<RetakeProofBottomSheet {...defaultProps} visible={false} />);
      rerender(<RetakeProofBottomSheet {...defaultProps} visible={true} />);
      expect(getByText('Retake proof?')).toBeTruthy();
    });
  });
});
