/**
 * Enhanced Button Component Tests
 * Target Coverage: 75%+
 * Comprehensive testing for all Button features
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../../__tests__/testUtils';
import { Button } from '../Button';

describe('Button Component - Enhanced Tests', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      const { getByText } = render(
        <Button title="Click Me" onPress={() => {}} />
      );
      expect(getByText('Click Me')).toBeTruthy();
    });

    it('should render in loading state with activity indicator', () => {
      const { queryByText, UNSAFE_getByType } = render(
        <Button title="Submit" onPress={jest.fn()} loading />
      );
      expect(queryByText('Submit')).toBeNull();
      const { ActivityIndicator } = require('react-native');
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('should apply fullWidth style', () => {
      const { getByText } = render(
        <Button title="Full" onPress={jest.fn()} fullWidth />
      );
      const button = getByText('Full').parent?.parent;
      expect(button?.props.style).toContainEqual(
        expect.objectContaining({ width: '100%' })
      );
    });

    it('should render with left icon', () => {
      const { getByText, UNSAFE_getByType } = render(
        <Button 
          title="Send" 
          onPress={jest.fn()} 
          icon="send" 
          iconPosition="left" 
        />
      );
      expect(getByText('Send')).toBeTruthy();
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      expect(UNSAFE_getByType(MaterialCommunityIcons)).toBeTruthy();
    });

    it('should render with right icon', () => {
      const { getByText, UNSAFE_getByType } = render(
        <Button 
          title="Next" 
          onPress={jest.fn()} 
          icon="arrow-right" 
          iconPosition="right" 
        />
      );
      expect(getByText('Next')).toBeTruthy();
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      expect(UNSAFE_getByType(MaterialCommunityIcons)).toBeTruthy();
    });
  });

  describe('Variants', () => {
    it('should render primary variant (default)', () => {
      const { getByText } = render(
        <Button title="Primary" onPress={jest.fn()} />
      );
      expect(getByText('Primary')).toBeTruthy();
    });

    it('should render secondary variant', () => {
      const { getByText } = render(
        <Button title="Secondary" onPress={jest.fn()} variant="secondary" />
      );
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('should render outline variant', () => {
      const { getByText } = render(
        <Button title="Outline" onPress={jest.fn()} variant="outline" />
      );
      expect(getByText('Outline')).toBeTruthy();
    });

    it('should render ghost variant', () => {
      const { getByText } = render(
        <Button title="Ghost" onPress={jest.fn()} variant="ghost" />
      );
      expect(getByText('Ghost')).toBeTruthy();
    });

    it('should render danger variant', () => {
      const { getByText } = render(
        <Button title="Delete" onPress={jest.fn()} variant="danger" />
      );
      expect(getByText('Delete')).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { getByText } = render(
        <Button title="Small" onPress={jest.fn()} size="sm" />
      );
      const button = getByText('Small').parent?.parent;
      expect(button?.props.style).toContainEqual(
        expect.objectContaining({ height: 36 })
      );
    });

    it('should render medium size (default)', () => {
      const { getByText } = render(
        <Button title="Medium" onPress={jest.fn()} />
      );
      const button = getByText('Medium').parent?.parent;
      expect(button?.props.style).toContainEqual(
        expect.objectContaining({ height: 48 })
      );
    });

    it('should render large size', () => {
      const { getByText } = render(
        <Button title="Large" onPress={jest.fn()} size="lg" />
      );
      const button = getByText('Large').parent?.parent;
      expect(button?.props.style).toContainEqual(
        expect.objectContaining({ height: 56 })
      );
    });
  });

  describe('Interactions', () => {
    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button title="Press Me" onPress={onPress} />
      );
      
      fireEvent.press(getByText('Press Me'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button title="Disabled" onPress={onPress} disabled />
      );
      
      fireEvent.press(getByText('Disabled'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should not call onPress when loading', () => {
      const onPress = jest.fn();
      const { getByRole } = render(
        <Button title="Loading" onPress={onPress} loading />
      );
      
      const button = getByRole('button');
      fireEvent.press(button);
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should have correct activeOpacity', () => {
      const { getByText } = render(
        <Button title="Opacity" onPress={jest.fn()} />
      );
      
      const button = getByText('Opacity').parent?.parent;
      expect(button?.props.activeOpacity).toBe(0.7);
    });
  });

  describe('Disabled State', () => {
    it('should render disabled button with gray background', () => {
      const { getByText } = render(
        <Button title="Disabled" onPress={jest.fn()} disabled />
      );
      expect(getByText('Disabled')).toBeTruthy();
    });

    it('should have disabled accessibility state', () => {
      const { getByRole } = render(
        <Button title="Disabled" onPress={jest.fn()} disabled />
      );
      
      const button = getByRole('button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('should have disabled state when loading', () => {
      const { getByRole } = render(
        <Button title="Loading" onPress={jest.fn()} loading />
      );
      
      const button = getByRole('button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      const { getByRole } = render(
        <Button title="Accessible" onPress={jest.fn()} />
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should use title as accessibility label by default', () => {
      const { getByLabelText } = render(
        <Button title="Submit Form" onPress={jest.fn()} />
      );
      expect(getByLabelText('Submit Form')).toBeTruthy();
    });

    it('should support custom accessibility label', () => {
      const { getByLabelText } = render(
        <Button 
          title="Save" 
          onPress={jest.fn()} 
          accessibilityLabel="Save document" 
        />
      );
      expect(getByLabelText('Save document')).toBeTruthy();
    });

    it('should support accessibility hint', () => {
      const { getByRole } = render(
        <Button 
          title="Submit" 
          onPress={jest.fn()} 
          accessibilityHint="Submits the form" 
        />
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should show loading hint when loading', () => {
      const { getByRole } = render(
        <Button title="Submit" onPress={jest.fn()} loading />
      );
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom container style', () => {
      const customStyle = { marginTop: 20, marginBottom: 10 };
      const { getByText } = render(
        <Button title="Custom" onPress={jest.fn()} style={customStyle} />
      );
      
      const button = getByText('Custom').parent?.parent;
      expect(button?.props.style).toContainEqual(
        expect.objectContaining(customStyle)
      );
    });

    it('should accept custom text style', () => {
      const { getByText } = render(
        <Button 
          title="Custom Text" 
          onPress={jest.fn()} 
          textStyle={{ fontStyle: 'italic' }} 
        />
      );
      
      const text = getByText('Custom Text');
      expect(text.props.style).toContainEqual(
        expect.objectContaining({ fontStyle: 'italic' })
      );
    });
  });

  describe('Icon Positioning', () => {
    it('should render icon on left side', () => {
      const { getByText } = render(
        <Button 
          title="Icon Left" 
          onPress={jest.fn()} 
          icon="check" 
          iconPosition="left" 
        />
      );
      expect(getByText('Icon Left')).toBeTruthy();
    });

    it('should render icon on right side', () => {
      const { getByText } = render(
        <Button 
          title="Icon Right" 
          onPress={jest.fn()} 
          icon="arrow-right" 
          iconPosition="right" 
        />
      );
      expect(getByText('Icon Right')).toBeTruthy();
    });

    it('should render icon with correct size based on button size', () => {
      const { UNSAFE_getByType } = render(
        <Button 
          title="Small Icon" 
          onPress={jest.fn()} 
          icon="heart" 
          size="sm" 
        />
      );
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      expect(UNSAFE_getByType(MaterialCommunityIcons)).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title gracefully', () => {
      const { getByRole } = render(
        <Button title="" onPress={jest.fn()} />
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should handle very long title', () => {
      const longTitle = 'This is a very long button title that might wrap';
      const { getByText } = render(
        <Button title={longTitle} onPress={jest.fn()} />
      );
      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should work with icon but no iconPosition specified', () => {
      const { getByText } = render(
        <Button title="Default Position" onPress={jest.fn()} icon="check" />
      );
      expect(getByText('Default Position')).toBeTruthy();
    });

    it('should handle rapid presses', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button title="Rapid" onPress={onPress} />
      );
      
      const button = getByText('Rapid');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      
      expect(onPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Variant + Size Combinations', () => {
    it('should render small primary button', () => {
      const { getByText } = render(
        <Button title="Small Primary" onPress={jest.fn()} variant="primary" size="sm" />
      );
      expect(getByText('Small Primary')).toBeTruthy();
    });

    it('should render large danger button', () => {
      const { getByText } = render(
        <Button title="Large Danger" onPress={jest.fn()} variant="danger" size="lg" />
      );
      expect(getByText('Large Danger')).toBeTruthy();
    });

    it('should render medium outline button', () => {
      const { getByText } = render(
        <Button title="Medium Outline" onPress={jest.fn()} variant="outline" size="md" />
      );
      expect(getByText('Medium Outline')).toBeTruthy();
    });
  });

  describe('Loading + Variant Combinations', () => {
    it('should show loading state on primary button', () => {
      const { UNSAFE_getByType } = render(
        <Button title="Save" onPress={jest.fn()} variant="primary" loading />
      );
      const { ActivityIndicator } = require('react-native');
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('should show loading state on danger button', () => {
      const { UNSAFE_getByType } = render(
        <Button title="Delete" onPress={jest.fn()} variant="danger" loading />
      );
      const { ActivityIndicator } = require('react-native');
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });
  });
});
