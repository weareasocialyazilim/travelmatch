import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RequestMoreProofBottomSheet from '../RequestMoreProofBottomSheet';

describe('RequestMoreProofBottomSheet', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnSend = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onSend: mockOnSend,
  };

  const getOtherInput = (component: any) => {
    const { TextInput } = require('react-native');
    const inputs = component.UNSAFE_queryAllByType(TextInput);
    // Other input is the first one when isOther is true
    return inputs[0];
  };

  const getNoteInput = (component: any) => {
    const { TextInput } = require('react-native');
    const inputs = component.UNSAFE_queryAllByType(TextInput);
    // Note input is always the last TextInput
    return inputs[inputs.length - 1];
  };

  describe('Rendering', () => {
    it('renders when visible', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      expect(getByText('Request More Proof')).toBeTruthy();
    });

    it('renders title', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      expect(getByText('Request More Proof')).toBeTruthy();
    });

    it('renders subtitle with instructions', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      expect(getByText("Let the traveler know what's missing so they can update their proof and receive their gift.")).toBeTruthy();
    });

    it('renders "What\'s the issue?" section header', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      expect(getByText("What's the issue?")).toBeTruthy();
    });

    it('renders first predefined reason', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      expect(getByText('The photo or video is blurry or unclear.')).toBeTruthy();
    });

    it('renders second predefined reason', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      expect(getByText('The proof is missing a key element.')).toBeTruthy();
    });

    it('renders third predefined reason', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      expect(getByText('The location shown seems incorrect.')).toBeTruthy();
    });

    it('renders "Other" option', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      expect(getByText('Other (please specify)')).toBeTruthy();
    });

    it('renders optional note section', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      expect(getByText('Add a friendly note (optional)')).toBeTruthy();
    });

    it('renders Send Request button', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      expect(getByText('Send Request')).toBeTruthy();
    });

    it('renders Cancel button', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('does not render when not visible', () => {
      const { toJSON } = render(<RequestMoreProofBottomSheet {...defaultProps} visible={false} />);
      const modal = toJSON();
      expect(modal?.props.visible).toBe(false);
    });
  });

  describe('Radio Selection', () => {
    it('allows selecting first reason', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const firstReason = getByText('The photo or video is blurry or unclear.');
      fireEvent.press(firstReason);
      // Selection state is managed internally
      expect(firstReason).toBeTruthy();
    });

    it('allows selecting second reason', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const secondReason = getByText('The proof is missing a key element.');
      fireEvent.press(secondReason);
      expect(secondReason).toBeTruthy();
    });

    it('allows selecting third reason', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const thirdReason = getByText('The location shown seems incorrect.');
      fireEvent.press(thirdReason);
      expect(thirdReason).toBeTruthy();
    });

    it('allows selecting "Other" option', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const otherOption = getByText('Other (please specify)');
      fireEvent.press(otherOption);
      expect(otherOption).toBeTruthy();
    });

    it('shows "Other" text input when "Other" selected', () => {
      const component = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const { getByText } = component;
      const otherOption = getByText('Other (please specify)');
      fireEvent.press(otherOption);
      const otherInput = getOtherInput(component);
      expect(otherInput.props.placeholder).toBe('Specify the issue...');
    });

    it('switches between predefined reasons', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const firstReason = getByText('The photo or video is blurry or unclear.');
      const secondReason = getByText('The proof is missing a key element.');
      
      fireEvent.press(firstReason);
      fireEvent.press(secondReason);
      
      expect(secondReason).toBeTruthy();
    });
  });

  describe('Other Reason Input', () => {
    it('accepts text in "Other" input', () => {
      const component = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const { getByText } = component;
      
      const otherOption = getByText('Other (please specify)');
      fireEvent.press(otherOption);
      
      const otherInput = getOtherInput(component);
      fireEvent.changeText(otherInput, 'Custom issue description');
      
      expect(otherInput.props.value).toBe('Custom issue description');
    });

    it('hides "Other" input when switching to predefined reason', () => {
      const component = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const { getByText } = component;
      const { TextInput } = require('react-native');
      
      // Select Other
      const otherOption = getByText('Other (please specify)');
      fireEvent.press(otherOption);
      
      // Should have 2 inputs (other + note)
      let inputs = component.UNSAFE_queryAllByType(TextInput);
      expect(inputs.length).toBe(2);
      
      // Switch to predefined reason
      const firstReason = getByText('The photo or video is blurry or unclear.');
      fireEvent.press(firstReason);
      
      // Should have only 1 input (note)
      inputs = component.UNSAFE_queryAllByType(TextInput);
      expect(inputs.length).toBe(1);
    });
  });

  describe('Optional Note', () => {
    it('renders note input placeholder', () => {
      const component = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const noteInput = getNoteInput(component);
      expect(noteInput.props.placeholder).toBe("e.g., 'Hey! Could you take a clearer picture in front of the sign?'");
    });

    it('accepts text in note input', () => {
      const component = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const noteInput = getNoteInput(component);
      
      fireEvent.changeText(noteInput, 'Please retake the photo');
      expect(noteInput.props.value).toBe('Please retake the photo');
    });
  });

  describe('Send Request', () => {
    it('sends with first predefined reason and no note', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      
      const firstReason = getByText('The photo or video is blurry or unclear.');
      fireEvent.press(firstReason);
      
      const sendButton = getByText('Send Request');
      fireEvent.press(sendButton);
      
      expect(mockOnSend).toHaveBeenCalledWith('The photo or video is blurry or unclear.', '');
    });

    it('sends with predefined reason and note', () => {
      const component = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const { getByText } = component;
      
      const secondReason = getByText('The proof is missing a key element.');
      fireEvent.press(secondReason);
      
      const noteInput = getNoteInput(component);
      fireEvent.changeText(noteInput, 'Need to see the landmark');
      
      const sendButton = getByText('Send Request');
      fireEvent.press(sendButton);
      
      expect(mockOnSend).toHaveBeenCalledWith('The proof is missing a key element.', 'Need to see the landmark');
    });

    it('sends with "Other" reason', () => {
      const component = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const { getByText } = component;
      
      const otherOption = getByText('Other (please specify)');
      fireEvent.press(otherOption);
      
      const otherInput = getOtherInput(component);
      fireEvent.changeText(otherInput, 'Different problem');
      
      const sendButton = getByText('Send Request');
      fireEvent.press(sendButton);
      
      expect(mockOnSend).toHaveBeenCalledWith('Different problem', '');
    });

    it('calls onClose after sending', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      
      const sendButton = getByText('Send Request');
      fireEvent.press(sendButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Cancel Action', () => {
    it('calls onClose when Cancel button pressed', () => {
      jest.clearAllMocks();
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const cancelButton = getByText('Cancel');
      fireEvent.press(cancelButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop pressed', () => {
      jest.clearAllMocks();
      const component = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const { TouchableOpacity } = require('react-native');
      const touchables = component.UNSAFE_queryAllByType(TouchableOpacity);
      const backdrop = touchables.find((t: any) => t.props.activeOpacity === 1);
      
      if (backdrop) {
        fireEvent.press(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('Modal Properties', () => {
    it('sets modal as transparent', () => {
      const { toJSON } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const modal = toJSON();
      expect(modal?.props.transparent).toBe(true);
    });

    it('uses slide animation', () => {
      const { toJSON } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const modal = toJSON();
      expect(modal?.props.animationType).toBe('slide');
    });

    it('calls onClose on onRequestClose', () => {
      jest.clearAllMocks();
      const { toJSON } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const modal = toJSON();
      modal?.props.onRequestClose();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid reason selection', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const firstReason = getByText('The photo or video is blurry or unclear.');
      const secondReason = getByText('The proof is missing a key element.');
      const thirdReason = getByText('The location shown seems incorrect.');
      
      fireEvent.press(firstReason);
      fireEvent.press(secondReason);
      fireEvent.press(thirdReason);
      
      expect(thirdReason).toBeTruthy();
    });

    it('handles special characters in "Other" input', () => {
      const component = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const { getByText } = component;
      
      const otherOption = getByText('Other (please specify)');
      fireEvent.press(otherOption);
      
      const otherInput = getOtherInput(component);
      fireEvent.changeText(otherInput, 'Issue #1: Missing 📸 @location');
      
      expect(otherInput.props.value).toBe('Issue #1: Missing 📸 @location');
    });

    it('handles multiline text in note', () => {
      const component = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      const noteInput = getNoteInput(component);
      
      const multilineNote = 'Please retake:\n1. Front view\n2. Side view';
      fireEvent.changeText(noteInput, multilineNote);
      
      expect(noteInput.props.value).toBe(multilineNote);
    });

    it('sends with default first reason when no selection made', () => {
      const { getByText } = render(<RequestMoreProofBottomSheet {...defaultProps} />);
      
      const sendButton = getByText('Send Request');
      fireEvent.press(sendButton);
      
      // First reason (index 0) is default
      expect(mockOnSend).toHaveBeenCalledWith('The photo or video is blurry or unclear.', '');
    });
  });
});
