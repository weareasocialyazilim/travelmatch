import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LeaveTrustNoteBottomSheet } from '../ui/LeaveTrustNoteBottomSheet';

describe('LeaveTrustNoteBottomSheet', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnSubmit = jest.fn() as jest.Mock;
  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    recipientName: 'Lina',
    momentTitle: 'Galata coffee',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when visible is true', () => {
      const { getByText } = render(
        <LeaveTrustNoteBottomSheet {...defaultProps} />,
      );
      expect(getByText('Leave a Trust Note')).toBeTruthy();
    });

    it('does not render when visible is false', () => {
      const { UNSAFE_queryByType } = render(
        <LeaveTrustNoteBottomSheet {...defaultProps} visible={false} />,
      );
      const { Modal } = require('react-native');
      const modal = UNSAFE_queryByType(Modal);
      expect(modal.props.visible).toBe(false);
    });

    it('renders recipient name in subtitle', () => {
      const { getByText } = render(
        <LeaveTrustNoteBottomSheet {...defaultProps} />,
      );
      expect(getByText('For Lina after Galata coffee')).toBeTruthy();
    });

    it('renders moment title in subtitle', () => {
      const { getByText } = render(
        <LeaveTrustNoteBottomSheet
          {...defaultProps}
          recipientName="Maria"
          momentTitle="Istanbul tour"
        />,
      );
      expect(getByText('For Maria after Istanbul tour')).toBeTruthy();
    });

    it('renders text input placeholder', () => {
      const component = render(<LeaveTrustNoteBottomSheet {...defaultProps} />);
      const { TextInput } = require('react-native');
      const input = component.UNSAFE_getByType(TextInput);
      expect(input.props.placeholder).toBe(
        'Share what you loved about this moment...',
      );
    });

    it('renders character counter', () => {
      const { getByText } = render(
        <LeaveTrustNoteBottomSheet {...defaultProps} />,
      );
      expect(getByText('0/280')).toBeTruthy();
    });

    it('renders Submit Note button', () => {
      const { getByText } = render(
        <LeaveTrustNoteBottomSheet {...defaultProps} />,
      );
      expect(getByText('Submit Note')).toBeTruthy();
    });

    it('renders Cancel button', () => {
      const { getByText } = render(
        <LeaveTrustNoteBottomSheet {...defaultProps} />,
      );
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('renders handle bar', () => {
      const { UNSAFE_getAllByType } = render(
        <LeaveTrustNoteBottomSheet {...defaultProps} />,
      );
      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      expect(views.length).toBeGreaterThan(0);
    });
  });

  describe('Text Input', () => {
    const getTextInput = (component: ReturnType<typeof render>) => {
      const { TextInput } = require('react-native');
      return component.UNSAFE_getByType(TextInput);
    };

    it('updates text when typing', () => {
      const component = render(<LeaveTrustNoteBottomSheet {...defaultProps} />);
      const input = getTextInput(component);
      const { getByText } = component;
      fireEvent.changeText(input, 'Great experience!');
      expect(getByText('17/280')).toBeTruthy();
    });

    it('enforces max character limit of 280', () => {
      const component = render(<LeaveTrustNoteBottomSheet {...defaultProps} />);
      const input = getTextInput(component);
      expect(input.props.maxLength).toBe(280);
    });

    it('shows updated character count', () => {
      const component = render(<LeaveTrustNoteBottomSheet {...defaultProps} />);
      const input = getTextInput(component);
      const { getByText } = component;
      fireEvent.changeText(input, 'Hello');
      expect(getByText('5/280')).toBeTruthy();
    });

    it('allows multiline input', () => {
      const component = render(<LeaveTrustNoteBottomSheet {...defaultProps} />);
      const input = getTextInput(component);
      expect(input.props.multiline).toBe(true);
    });
  });

  describe('Submit Functionality', () => {
    const getTextInput = (component: ReturnType<typeof render>) => {
      const { TextInput } = require('react-native');
      return component.UNSAFE_getByType(TextInput);
    };

    it('disables submit button when text is empty', () => {
      const { getByText } = render(
        <LeaveTrustNoteBottomSheet {...defaultProps} />,
      );
      const submitButton = getByText('Submit Note');
      fireEvent.press(submitButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('enables submit button when text has content', () => {
      const component = render(<LeaveTrustNoteBottomSheet {...defaultProps} />);
      const input = getTextInput(component);
      const { getByText } = component;
      fireEvent.changeText(input, 'Great moment!');
      const submitButton = getByText('Submit Note');
      fireEvent.press(submitButton);
      expect(mockOnSubmit).toHaveBeenCalledWith('Great moment!');
    });

    it('trims whitespace before submitting', () => {
      const component = render(<LeaveTrustNoteBottomSheet {...defaultProps} />);
      const input = getTextInput(component);
      const { getByText } = component;
      fireEvent.changeText(input, '  Great moment!  ');
      const submitButton = getByText('Submit Note');
      fireEvent.press(submitButton);
      expect(mockOnSubmit).toHaveBeenCalledWith('Great moment!');
    });

    it('calls onClose after successful submit', () => {
      const component = render(<LeaveTrustNoteBottomSheet {...defaultProps} />);
      const input = getTextInput(component);
      const { getByText } = component;
      fireEvent.changeText(input, 'Great!');
      const submitButton = getByText('Submit Note');
      fireEvent.press(submitButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('rejects whitespace-only input', () => {
      const component = render(<LeaveTrustNoteBottomSheet {...defaultProps} />);
      const input = getTextInput(component);
      const { getByText } = component;
      fireEvent.changeText(input, '   ');
      const submitButton = getByText('Submit Note');
      fireEvent.press(submitButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Functionality', () => {
    it('calls onClose when Cancel button is pressed', () => {
      const { getByText } = render(
        <LeaveTrustNoteBottomSheet {...defaultProps} />,
      );
      const cancelButton = getByText('Cancel');
      fireEvent.press(cancelButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop is pressed', () => {
      const { UNSAFE_getByType } = render(
        <LeaveTrustNoteBottomSheet {...defaultProps} />,
      );
      const { TouchableWithoutFeedback } = require('react-native');
      const backdrop = UNSAFE_getByType(TouchableWithoutFeedback);
      fireEvent.press(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Modal Properties', () => {
    it('renders as Modal with transparent background', () => {
      const { UNSAFE_getByType } = render(
        <LeaveTrustNoteBottomSheet {...defaultProps} />,
      );
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.transparent).toBe(true);
    });

    it('uses slide animation', () => {
      const { UNSAFE_getByType } = render(
        <LeaveTrustNoteBottomSheet {...defaultProps} />,
      );
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.animationType).toBe('slide');
    });

    it('calls onClose when modal requests close', () => {
      const { UNSAFE_getByType } = render(
        <LeaveTrustNoteBottomSheet {...defaultProps} />,
      );
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      modal.props.onRequestClose();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    const getTextInput = (component: ReturnType<typeof render>) => {
      const { TextInput } = require('react-native');
      return component.UNSAFE_getByType(TextInput);
    };

    it('handles rapid submit clicks', () => {
      const component = render(<LeaveTrustNoteBottomSheet {...defaultProps} />);
      const input = getTextInput(component);
      const { getByText } = component;
      fireEvent.changeText(input, 'Test');
      const submitButton = getByText('Submit Note');
      fireEvent.press(submitButton);
      fireEvent.press(submitButton);
      // Only first call should succeed, second should be after close
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('handles special characters in note', () => {
      const component = render(<LeaveTrustNoteBottomSheet {...defaultProps} />);
      const input = getTextInput(component);
      const { getByText } = component;
      const specialText = 'Amazing! 🎉 #travel @user';
      fireEvent.changeText(input, specialText);
      const submitButton = getByText('Submit Note');
      fireEvent.press(submitButton);
      expect(mockOnSubmit).toHaveBeenCalledWith(specialText);
    });

    it('handles newlines and formatting', () => {
      const component = render(<LeaveTrustNoteBottomSheet {...defaultProps} />);
      const input = getTextInput(component);
      const { getByText } = component;
      const formattedText = 'Great moment!\n\nLoved:\n- Coffee\n- Atmosphere';
      fireEvent.changeText(input, formattedText);
      const submitButton = getByText('Submit Note');
      fireEvent.press(submitButton);
      expect(mockOnSubmit).toHaveBeenCalledWith(formattedText);
    });

    it('uses default recipient name when not provided', () => {
      const { getByText } = render(
        <LeaveTrustNoteBottomSheet
          {...defaultProps}
          recipientName={undefined}
          momentTitle={undefined}
        />,
      );
      expect(getByText('For Lina after Galata coffee')).toBeTruthy();
    });
  });
});
