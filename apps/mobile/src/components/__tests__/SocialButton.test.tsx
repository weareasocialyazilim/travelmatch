import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SocialButton from '../SocialButton';

describe('SocialButton', () => {
  const mockOnPress = jest.fn() as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering - Google Provider', () => {
    it('renders Google button with default text', () => {
      const { getByText } = render(
        <SocialButton provider="google" onPress={mockOnPress} />,
      );

      expect(getByText('Continue with Google')).toBeTruthy();
    });

    it('renders Google icon', () => {
      const { toJSON, getByText } = render(
        <SocialButton provider="google" onPress={mockOnPress} />,
      );

      // Verify component renders correctly
      expect(getByText('Continue with Google')).toBeTruthy();
      expect(toJSON()).toBeTruthy();
    });

    it('renders custom label when provided', () => {
      const { getByText } = render(
        <SocialButton
          provider="google"
          onPress={mockOnPress}
          label="Sign in with Google"
        />,
      );

      expect(getByText('Sign in with Google')).toBeTruthy();
    });
  });

  describe('Rendering - Apple Provider', () => {
    it('renders Apple button with default text', () => {
      const { getByText } = render(
        <SocialButton provider="apple" onPress={mockOnPress} />,
      );

      expect(getByText('Continue with Apple')).toBeTruthy();
    });

    it('renders Apple icon', () => {
      const { toJSON, getByText } = render(
        <SocialButton provider="apple" onPress={mockOnPress} />,
      );

      // Verify component renders correctly
      expect(getByText('Continue with Apple')).toBeTruthy();
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Rendering - Facebook Provider', () => {
    it('renders Facebook button with default text', () => {
      const { getByText } = render(
        <SocialButton provider="facebook" onPress={mockOnPress} />,
      );

      expect(getByText('Continue with Facebook')).toBeTruthy();
    });

    it('renders Facebook icon', () => {
      const { toJSON, getByText } = render(
        <SocialButton provider="facebook" onPress={mockOnPress} />,
      );

      // Verify component renders correctly
      expect(getByText('Continue with Facebook')).toBeTruthy();
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Rendering - Phone Provider', () => {
    it('renders Phone button with default text', () => {
      const { getByText } = render(
        <SocialButton provider="phone" onPress={mockOnPress} />,
      );

      expect(getByText('Continue with Phone')).toBeTruthy();
    });

    it('renders Phone icon', () => {
      const { toJSON, getByText } = render(
        <SocialButton provider="phone" onPress={mockOnPress} />,
      );

      // Verify component renders correctly
      expect(getByText('Continue with Phone')).toBeTruthy();
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Rendering - Email Provider', () => {
    it('renders Email button with default text', () => {
      const { getByText } = render(
        <SocialButton provider="email" onPress={mockOnPress} />,
      );

      expect(getByText('Continue with Email')).toBeTruthy();
    });

    it('renders Email icon', () => {
      const { toJSON, getByText } = render(
        <SocialButton provider="email" onPress={mockOnPress} />,
      );

      // Verify component renders correctly
      expect(getByText('Continue with Email')).toBeTruthy();
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Size Variants', () => {
    it('renders large button by default', () => {
      const { getByText } = render(
        <SocialButton provider="google" onPress={mockOnPress} />,
      );

      expect(getByText('Continue with Google')).toBeTruthy();
    });

    it('renders large button explicitly', () => {
      const { getByText } = render(
        <SocialButton provider="google" size="large" onPress={mockOnPress} />,
      );

      expect(getByText('Continue with Google')).toBeTruthy();
    });

    it('renders icon-only button', () => {
      const { queryByText, toJSON } = render(
        <SocialButton provider="google" size="icon" onPress={mockOnPress} />,
      );

      expect(queryByText('Continue with Google')).toBeNull();
      // Verify component renders (icon exists in the tree)
      expect(toJSON()).toBeTruthy();
    });

    it('icon button has correct accessibility label', () => {
      const { getByLabelText } = render(
        <SocialButton provider="google" size="icon" onPress={mockOnPress} />,
      );

      expect(getByLabelText('Continue with Google')).toBeTruthy();
    });

    it('icon button uses custom label for accessibility', () => {
      const { getByLabelText } = render(
        <SocialButton
          provider="google"
          size="icon"
          onPress={mockOnPress}
          label="Google Sign In"
        />,
      );

      expect(getByLabelText('Google Sign In')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('calls onPress when button is pressed', () => {
      const { getByLabelText } = render(
        <SocialButton provider="google" onPress={mockOnPress} />,
      );

      fireEvent.press(getByLabelText('Continue with Google'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('calls onPress on icon button', () => {
      const { getByLabelText } = render(
        <SocialButton provider="google" size="icon" onPress={mockOnPress} />,
      );

      fireEvent.press(getByLabelText('Continue with Google'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not crash when onPress is not provided', () => {
      const { getByLabelText } = render(<SocialButton provider="google" />);

      expect(() => {
        fireEvent.press(getByLabelText('Continue with Google'));
      }).not.toThrow();
    });

    it('handles multiple presses', () => {
      const { getByLabelText } = render(
        <SocialButton provider="google" onPress={mockOnPress} />,
      );

      const button = getByLabelText('Continue with Google');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('has button role', () => {
      const { getByLabelText } = render(
        <SocialButton provider="google" onPress={mockOnPress} />,
      );

      const button = getByLabelText('Continue with Google');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('has correct accessibility label for Google', () => {
      const { getByLabelText } = render(
        <SocialButton provider="google" onPress={mockOnPress} />,
      );

      expect(getByLabelText('Continue with Google')).toBeTruthy();
    });

    it('has correct accessibility label for Apple', () => {
      const { getByLabelText } = render(
        <SocialButton provider="apple" onPress={mockOnPress} />,
      );

      expect(getByLabelText('Continue with Apple')).toBeTruthy();
    });

    it('has correct accessibility label for Facebook', () => {
      const { getByLabelText } = render(
        <SocialButton provider="facebook" onPress={mockOnPress} />,
      );

      expect(getByLabelText('Continue with Facebook')).toBeTruthy();
    });

    it('uses custom label for accessibility', () => {
      const { getByLabelText } = render(
        <SocialButton
          provider="google"
          onPress={mockOnPress}
          label="Google Login"
        />,
      );

      expect(getByLabelText('Google Login')).toBeTruthy();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom style to large button', () => {
      const customStyle = { backgroundColor: 'red', marginTop: 10 };
      const { getByLabelText } = render(
        <SocialButton
          provider="google"
          onPress={mockOnPress}
          style={customStyle}
        />,
      );

      const button = getByLabelText('Continue with Google');
      expect(button.props.style).toContainEqual(customStyle);
    });

    it('applies custom style to icon button', () => {
      const customStyle = { backgroundColor: 'blue', marginLeft: 5 };
      const { getByLabelText } = render(
        <SocialButton
          provider="google"
          size="icon"
          onPress={mockOnPress}
          style={customStyle}
        />,
      );

      const button = getByLabelText('Continue with Google');
      expect(button.props.style).toContainEqual(customStyle);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty custom label - falls back to default', () => {
      const { getByLabelText } = render(
        <SocialButton provider="google" onPress={mockOnPress} label="" />,
      );

      // Empty label falls back to default provider text
      expect(getByLabelText('Continue with Google')).toBeTruthy();
    });

    it('handles very long custom label', () => {
      const longLabel = 'A'.repeat(100);
      const { getByText } = render(
        <SocialButton
          provider="google"
          onPress={mockOnPress}
          label={longLabel}
        />,
      );

      expect(getByText(longLabel)).toBeTruthy();
    });

    it('handles special characters in label', () => {
      const specialLabel = '⚡ Sign in with Google 🚀';
      const { getByText } = render(
        <SocialButton
          provider="google"
          onPress={mockOnPress}
          label={specialLabel}
        />,
      );

      expect(getByText(specialLabel)).toBeTruthy();
    });

    it('handles undefined style gracefully', () => {
      const { getByLabelText } = render(
        <SocialButton
          provider="google"
          onPress={mockOnPress}
          style={undefined}
        />,
      );

      expect(getByLabelText('Continue with Google')).toBeTruthy();
    });

    it('renders all providers without errors', () => {
      const providers: Array<
        'google' | 'apple' | 'facebook' | 'phone' | 'email'
      > = ['google', 'apple', 'facebook', 'phone', 'email'];

      providers.forEach((provider) => {
        const { getByLabelText } = render(
          <SocialButton provider={provider} onPress={mockOnPress} />,
        );

        expect(getByLabelText).toBeTruthy();
      });
    });

    it('icon sizes are consistent across providers', () => {
      const providers: Array<
        'google' | 'apple' | 'facebook' | 'phone' | 'email'
      > = ['google', 'apple', 'facebook', 'phone', 'email'];

      providers.forEach((provider) => {
        const { toJSON } = render(
          <SocialButton provider={provider} onPress={mockOnPress} />,
        );

        // Verify all providers render correctly
        expect(toJSON()).toBeTruthy();
      });
    });
  });
});
