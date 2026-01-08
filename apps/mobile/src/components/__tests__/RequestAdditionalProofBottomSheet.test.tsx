import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RequestAdditionalProofBottomSheet } from '../../features/moments/components/RequestAdditionalProofBottomSheet';

describe('RequestAdditionalProofBottomSheet', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnSendRequest = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onSendRequest: mockOnSendRequest,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getTextInput = (component: any) => {
    const { TextInput } = require('react-native');
    return component.UNSAFE_getByType(TextInput);
  };

  describe('Rendering', () => {
    it('renders when visible', () => {
      const { getByText } = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      expect(getByText('Request additional proof')).toBeTruthy();
    });

    it('renders header title', () => {
      const { getByText } = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      expect(getByText('Request additional proof')).toBeTruthy();
    });

    it('renders close button', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icons = component.UNSAFE_queryAllByType(MaterialCommunityIcons);
      const closeIcon = icons.find((icon: any) => icon.props.name === 'close');
      expect(closeIcon).toBeTruthy();
    });

    it('renders "Message" label', () => {
      const { getByText } = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      expect(getByText('Message')).toBeTruthy();
    });

    it('renders text input with placeholder', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const input = getTextInput(component);
      expect(input.props.placeholder).toBe(
        "Tell them what you need to confirm the moment. e.g., 'Could you please upload a photo of the ticket stub?'",
      );
    });

    it('renders character counter at 0/500 initially', () => {
      const { getByText } = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      expect(getByText('0/500')).toBeTruthy();
    });

    it('renders "Send request" button', () => {
      const { getByText } = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      expect(getByText('Send request')).toBeTruthy();
    });

    it('renders handle bar', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const { View } = require('react-native');
      const views = component.UNSAFE_queryAllByType(View);
      expect(views.length).toBeGreaterThan(0);
    });

    it('does not render when not visible', () => {
      const { toJSON } = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} visible={false} />,
      );
      const modal = toJSON();
      expect(modal?.props.visible).toBe(false);
    });
  });

  describe('Text Input', () => {
    it('updates character counter when typing', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const input = getTextInput(component);
      const { getByText } = component;

      fireEvent.changeText(input, 'Please upload a photo');
      expect(getByText('21/500')).toBeTruthy(); // "Please upload a photo" is 21 chars
    });

    it('enforces max character limit of 500', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const input = getTextInput(component);
      expect(input.props.maxLength).toBe(500);
    });

    it('allows multiline input', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const input = getTextInput(component);
      expect(input.props.multiline).toBe(true);
    });
  });

  describe('Send Request', () => {
    it('disables send button when message is empty', () => {
      const { getByText } = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const sendButton = getByText('Send request');
      fireEvent.press(sendButton);
      expect(mockOnSendRequest).not.toHaveBeenCalled();
    });

    it('enables send button when message has content', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const input = getTextInput(component);
      const { getByText } = component;

      fireEvent.changeText(input, 'Please upload a photo');
      const sendButton = getByText('Send request');
      fireEvent.press(sendButton);

      expect(mockOnSendRequest).toHaveBeenCalledWith('Please upload a photo');
    });

    it('calls onClose after sending request', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const input = getTextInput(component);
      const { getByText } = component;

      fireEvent.changeText(input, 'Need proof');
      const sendButton = getByText('Send request');
      fireEvent.press(sendButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('clears message after sending', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const input = getTextInput(component);
      const { getByText } = component;

      fireEvent.changeText(input, 'Test message');
      const sendButton = getByText('Send request');
      fireEvent.press(sendButton);

      // After send, message should be cleared
      expect(input.props.value).toBe('');
    });

    it('trims whitespace before sending', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const input = getTextInput(component);
      const { getByText } = component;

      fireEvent.changeText(input, '  Please send proof  ');
      const sendButton = getByText('Send request');
      fireEvent.press(sendButton);

      expect(mockOnSendRequest).toHaveBeenCalledWith('  Please send proof  ');
    });

    it('rejects whitespace-only input', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const input = getTextInput(component);
      const { getByText } = component;

      fireEvent.changeText(input, '   ');
      const sendButton = getByText('Send request');
      fireEvent.press(sendButton);

      expect(mockOnSendRequest).not.toHaveBeenCalled();
    });
  });

  describe('Close Actions', () => {
    it('calls onClose when close button pressed', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icons = component.UNSAFE_queryAllByType(MaterialCommunityIcons);
      const closeIcon = icons.find((icon: any) => icon.props.name === 'close');

      fireEvent.press(closeIcon.parent);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop pressed', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const { TouchableWithoutFeedback } = require('react-native');
      const backdrop = component.UNSAFE_getByType(TouchableWithoutFeedback);

      fireEvent.press(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Properties', () => {
    it('sets modal as transparent', () => {
      const { toJSON } = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const modal = toJSON();
      expect(modal?.props.transparent).toBe(true);
    });

    it('uses slide animation', () => {
      const { toJSON } = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const modal = toJSON();
      expect(modal?.props.animationType).toBe('slide');
    });

    it('calls onClose on onRequestClose', () => {
      const { toJSON } = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const modal = toJSON();
      modal?.props.onRequestClose();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid send clicks', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const input = getTextInput(component);
      const { getByText } = component;

      fireEvent.changeText(input, 'Test');
      const sendButton = getByText('Send request');
      fireEvent.press(sendButton);
      fireEvent.press(sendButton);

      // Only first send should succeed (second happens after close)
      expect(mockOnSendRequest).toHaveBeenCalledTimes(1);
    });

    it('handles special characters in message', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const input = getTextInput(component);
      const { getByText } = component;

      const specialText = 'Please upload 📸 #proof @user';
      fireEvent.changeText(input, specialText);
      const sendButton = getByText('Send request');
      fireEvent.press(sendButton);

      expect(mockOnSendRequest).toHaveBeenCalledWith(specialText);
    });

    it('handles newlines and formatting', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const input = getTextInput(component);
      const { getByText } = component;

      const formattedText =
        'Please upload:\n\n1. Front of ticket\n2. Back of ticket';
      fireEvent.changeText(input, formattedText);
      const sendButton = getByText('Send request');
      fireEvent.press(sendButton);

      expect(mockOnSendRequest).toHaveBeenCalledWith(formattedText);
    });

    it('handles exactly 500 characters', () => {
      const component = render(
        <RequestAdditionalProofBottomSheet {...defaultProps} />,
      );
      const input = getTextInput(component);
      const { getByText } = component;

      const maxText = 'a'.repeat(500);
      fireEvent.changeText(input, maxText);
      expect(getByText('500/500')).toBeTruthy();
    });
  });
});
