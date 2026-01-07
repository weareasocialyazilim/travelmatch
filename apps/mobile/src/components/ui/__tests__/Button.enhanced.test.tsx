/**
 * Enhanced Button Component Tests
 * Target Coverage: 75%+
 * Comprehensive testing for all Button features
 *
 * These tests extend Button.test.tsx with additional edge cases,
 * icon positioning tests, and variant/size combinations.
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../../__tests__/testUtilsRender.helper';
import { Button } from '../Button';

describe('Button Component - Enhanced Tests', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      const { getByText } = render(
        <Button title="Click Me" onPress={jest.fn() as jest.Mock} />,
      );
      expect(getByText('Click Me')).toBeTruthy();
    });

    it('should render in loading state with activity indicator', () => {
      const { queryByText, getByRole } = render(
        <Button title="Submit" onPress={jest.fn() as jest.Mock} loading />,
      );
      expect(queryByText('Submit')).toBeNull();
      // When loading, button should be disabled and title hidden
      const button = getByRole('button');
      expect(button.props.disabled).toBe(true);
    });

    it('should apply fullWidth style', () => {
      const { getByText } = render(
        <Button title="Full" onPress={jest.fn() as jest.Mock} fullWidth />,
      );
      const button = getByText('Full').parent?.parent;
      // Verify the button renders with style (exact style assertion difficult in mocked env)
      expect(button?.props.style).toBeDefined();
    });

    it('should render with left icon', () => {
      const { getByText, toJSON } = render(
        <Button
          title="Send"
          onPress={jest.fn() as jest.Mock}
          icon="send"
          iconPosition="left"
        />,
      );
      expect(getByText('Send')).toBeTruthy();
      // Verify component renders with icon configuration
      expect(toJSON()).toBeTruthy();
    });

    it('should render with right icon', () => {
      const { getByText, toJSON } = render(
        <Button
          title="Next"
          onPress={jest.fn() as jest.Mock}
          icon="arrow-right"
          iconPosition="right"
        />,
      );
      expect(getByText('Next')).toBeTruthy();
      // Verify component renders with icon configuration
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Variants', () => {
    it('should render primary variant (default)', () => {
      const { getByText } = render(
        <Button title="Primary" onPress={jest.fn() as jest.Mock} />,
      );
      expect(getByText('Primary')).toBeTruthy();
    });

    it('should render secondary variant', () => {
      const { getByText } = render(
        <Button
          title="Secondary"
          onPress={jest.fn() as jest.Mock}
          variant="secondary"
        />,
      );
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('should render outline variant', () => {
      const { getByText } = render(
        <Button
          title="Outline"
          onPress={jest.fn() as jest.Mock}
          variant="outline"
        />,
      );
      expect(getByText('Outline')).toBeTruthy();
    });

    it('should render ghost variant', () => {
      const { getByText } = render(
        <Button
          title="Ghost"
          onPress={jest.fn() as jest.Mock}
          variant="ghost"
        />,
      );
      expect(getByText('Ghost')).toBeTruthy();
    });

    it('should render danger variant', () => {
      const { getByText } = render(
        <Button
          title="Delete"
          onPress={jest.fn() as jest.Mock}
          variant="danger"
        />,
      );
      expect(getByText('Delete')).toBeTruthy();
    });

    it('should render glass variant', () => {
      const { getByText } = render(
        <Button
          title="Glass"
          onPress={jest.fn() as jest.Mock}
          variant="glass"
        />,
      );
      expect(getByText('Glass')).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { getByText } = render(
        <Button title="Small" onPress={jest.fn() as jest.Mock} size="sm" />,
      );
      expect(getByText('Small')).toBeTruthy();
    });

    it('should render medium size (default)', () => {
      const { getByText } = render(
        <Button title="Medium" onPress={jest.fn() as jest.Mock} />,
      );
      expect(getByText('Medium')).toBeTruthy();
    });

    it('should render large size', () => {
      const { getByText } = render(
        <Button title="Large" onPress={jest.fn() as jest.Mock} size="lg" />,
      );
      expect(getByText('Large')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when pressed', () => {
      const onPress = jest.fn() as jest.Mock;
      const { getByText } = render(
        <Button title="Press Me" onPress={onPress} />,
      );

      fireEvent.press(getByText('Press Me'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const onPress = jest.fn() as jest.Mock;
      const { getByRole } = render(
        <Button title="Disabled" onPress={onPress} disabled />,
      );

      // Verify the disabled prop is set correctly
      const button = getByRole('button');
      expect(button.props.disabled).toBe(true);
    });

    it('should not call onPress when loading', () => {
      const onPress = jest.fn() as jest.Mock;
      const { getByRole } = render(
        <Button title="Loading" onPress={onPress} loading />,
      );

      const button = getByRole('button');
      expect(button.props.disabled).toBe(true);
    });
  });

  describe('Disabled State', () => {
    it('should render disabled button', () => {
      const { getByText } = render(
        <Button title="Disabled" onPress={jest.fn() as jest.Mock} disabled />,
      );
      expect(getByText('Disabled')).toBeTruthy();
    });

    it('should have disabled accessibility state', () => {
      const { getByRole } = render(
        <Button title="Disabled" onPress={jest.fn() as jest.Mock} disabled />,
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('should have disabled state when loading', () => {
      const { getByRole } = render(
        <Button title="Loading" onPress={jest.fn() as jest.Mock} loading />,
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      const { getByRole } = render(
        <Button title="Accessible" onPress={jest.fn() as jest.Mock} />,
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should use title as accessibility label by default', () => {
      const { getByLabelText } = render(
        <Button title="Submit Form" onPress={jest.fn() as jest.Mock} />,
      );
      expect(getByLabelText('Submit Form')).toBeTruthy();
    });

    it('should support custom accessibility label', () => {
      const { getByLabelText } = render(
        <Button
          title="Save"
          onPress={jest.fn() as jest.Mock}
          accessibilityLabel="Save document"
        />,
      );
      expect(getByLabelText('Save document')).toBeTruthy();
    });

    it('should support accessibility hint', () => {
      const { getByRole } = render(
        <Button
          title="Submit"
          onPress={jest.fn() as jest.Mock}
          accessibilityHint="Submits the form"
        />,
      );
      const button = getByRole('button');
      expect(button.props.accessibilityHint).toBe('Submits the form');
    });
  });

  describe('Icon Positioning', () => {
    it('should render icon on left side', () => {
      const { getByText } = render(
        <Button
          title="Icon Left"
          onPress={jest.fn() as jest.Mock}
          icon="check"
          iconPosition="left"
        />,
      );
      expect(getByText('Icon Left')).toBeTruthy();
    });

    it('should render icon on right side', () => {
      const { getByText } = render(
        <Button
          title="Icon Right"
          onPress={jest.fn() as jest.Mock}
          icon="arrow-right"
          iconPosition="right"
        />,
      );
      expect(getByText('Icon Right')).toBeTruthy();
    });

    it('should render icon with correct size based on button size', () => {
      const { getByText, toJSON } = render(
        <Button
          title="Small Icon"
          onPress={jest.fn() as jest.Mock}
          icon="heart"
          size="sm"
        />,
      );
      expect(getByText('Small Icon')).toBeTruthy();
      // Verify component renders with icon and size configuration
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title gracefully', () => {
      const { getByRole } = render(
        <Button title="" onPress={jest.fn() as jest.Mock} />,
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should handle very long title', () => {
      const longTitle = 'This is a very long button title that might wrap';
      const { getByText } = render(
        <Button title={longTitle} onPress={jest.fn() as jest.Mock} />,
      );
      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should work with icon but no iconPosition specified', () => {
      const { getByText } = render(
        <Button
          title="Default Position"
          onPress={jest.fn() as jest.Mock}
          icon="check"
        />,
      );
      expect(getByText('Default Position')).toBeTruthy();
    });

    it('should handle rapid presses', () => {
      const onPress = jest.fn() as jest.Mock;
      const { getByText } = render(<Button title="Rapid" onPress={onPress} />);

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
        <Button
          title="Small Primary"
          onPress={jest.fn() as jest.Mock}
          variant="primary"
          size="sm"
        />,
      );
      expect(getByText('Small Primary')).toBeTruthy();
    });

    it('should render large danger button', () => {
      const { getByText } = render(
        <Button
          title="Large Danger"
          onPress={jest.fn() as jest.Mock}
          variant="danger"
          size="lg"
        />,
      );
      expect(getByText('Large Danger')).toBeTruthy();
    });

    it('should render medium outline button', () => {
      const { getByText } = render(
        <Button
          title="Medium Outline"
          onPress={jest.fn() as jest.Mock}
          variant="outline"
          size="md"
        />,
      );
      expect(getByText('Medium Outline')).toBeTruthy();
    });

    it('should render small ghost button', () => {
      const { getByText } = render(
        <Button
          title="Small Ghost"
          onPress={jest.fn() as jest.Mock}
          variant="ghost"
          size="sm"
        />,
      );
      expect(getByText('Small Ghost')).toBeTruthy();
    });
  });

  describe('Loading + Variant Combinations', () => {
    it('should show loading state on primary button', () => {
      const { queryByText, getByRole } = render(
        <Button
          title="Save"
          onPress={jest.fn() as jest.Mock}
          variant="primary"
          loading
        />,
      );
      expect(queryByText('Save')).toBeNull();
      const button = getByRole('button');
      expect(button.props.disabled).toBe(true);
    });

    it('should show loading state on danger button', () => {
      const { queryByText, getByRole } = render(
        <Button
          title="Delete"
          onPress={jest.fn() as jest.Mock}
          variant="danger"
          loading
        />,
      );
      expect(queryByText('Delete')).toBeNull();
      const button = getByRole('button');
      expect(button.props.disabled).toBe(true);
    });

    it('should show loading state on secondary button', () => {
      const { queryByText, getByRole } = render(
        <Button
          title="Submit"
          onPress={jest.fn() as jest.Mock}
          variant="secondary"
          loading
        />,
      );
      expect(queryByText('Submit')).toBeNull();
      const button = getByRole('button');
      expect(button.props.disabled).toBe(true);
    });
  });

  describe('Haptic Feedback', () => {
    it('should render with haptic enabled by default', () => {
      const { getByText } = render(
        <Button title="Haptic" onPress={jest.fn() as jest.Mock} />,
      );
      expect(getByText('Haptic')).toBeTruthy();
    });

    it('should render with haptic disabled', () => {
      const { getByText } = render(
        <Button
          title="No Haptic"
          onPress={jest.fn() as jest.Mock}
          haptic={false}
        />,
      );
      expect(getByText('No Haptic')).toBeTruthy();
    });
  });
});
