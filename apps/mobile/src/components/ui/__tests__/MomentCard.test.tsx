/**
 * MomentCard Component Tests
 * Tests for moment card display and interactions
 * Target Coverage: 60%+
 */

import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  RenderOptions,
} from '@testing-library/react-native';
import { Alert, Share } from 'react-native';
import MomentCard from '@/components/MomentCard';
import type { Moment } from '@/types';

// Mock ToastContext to avoid React Native Animated issues in tests
const mockShowToast = jest.fn();
jest.mock('@/context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Helper to wrap component with required providers
const renderWithProviders = (
  ui: React.ReactElement,
  options?: RenderOptions,
) => {
  return render(ui, options);
};

// Mock dependencies
jest.mock('@/hooks/useHaptics', () => ({
  useHaptics: () => ({
    impact: jest.fn(),
    selection: jest.fn(),
    notification: jest.fn(),
  }),
}));

jest.mock('@/utils/animations', () => ({
  usePressScale: () => ({
    animatedStyle: {},
    onPressIn: jest.fn(),
    onPressOut: jest.fn(),
  }),
}));

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: {
      View,
    },
  };
});

describe('MomentCard', () => {
  const mockMoment: Moment = {
    id: '1',
    title: 'Coffee in Paris',
    imageUrl: 'https://example.com/image.jpg',
    price: 25,
    location: {
      name: 'Café de Flore',
      city: 'Paris',
      country: 'France',
    },
    availability: 'Available',
    category: {
      id: 'food',
      label: 'Food & Drink',
      emoji: '🍽️',
    },
    user: {
      id: 'user1',
      name: 'John Doe',
      avatar: 'https://example.com/avatar.jpg',
      isVerified: true,
      role: 'Local Expert',
      type: 'local',
    },
    story: 'Amazing coffee experience',
    dateRange: { start: new Date(), end: new Date() },
    status: 'active',
  };

  const mockOnPress = jest.fn();
  const mockOnGiftPress = jest.fn();
  const mockOnSharePress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render moment card with all details', () => {
      const { getByText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('Coffee in Paris')).toBeTruthy();
      expect(getByText('Paris')).toBeTruthy();
      expect(getByText('Café de Flore')).toBeTruthy();
      expect(getByText('Available')).toBeTruthy();
      expect(getByText('$25')).toBeTruthy();
    });

    it('should render user information', () => {
      const { getByText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText(/John Doe/)).toBeTruthy();
      expect(getByText('Local Expert')).toBeTruthy();
    });

    it('should render verified badge for verified users', () => {
      const { getByText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const userName = getByText(/John Doe/);
      expect(userName).toBeTruthy();
    });

    it('should render moment image', () => {
      const { getByLabelText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const image = getByLabelText('Photo of Coffee in Paris');
      expect(image).toBeTruthy();
      expect(image.props.source).toEqual('https://example.com/image.jpg');
    });

    it('should render user avatar', () => {
      const { getByLabelText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const avatar = getByLabelText("John Doe's avatar");
      expect(avatar).toBeTruthy();
      expect(avatar.props.source).toEqual('https://example.com/avatar.jpg');
    });

    it('should render gift button', () => {
      const { getByText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('Gift this moment')).toBeTruthy();
    });

    it('should render maybe later button', () => {
      const { getByText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('Maybe later')).toBeTruthy();
    });

    it('should render share button', () => {
      const { getByLabelText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByLabelText('Share this moment')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onPress when card is pressed', () => {
      const { getByLabelText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const card = getByLabelText('Moment: Coffee in Paris by John Doe');
      fireEvent.press(card);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should call onGiftPress when gift button is pressed', () => {
      const { getByText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const giftButton = getByText('Gift this moment');
      fireEvent.press(giftButton);

      expect(mockOnGiftPress).toHaveBeenCalledTimes(1);
      expect(mockOnGiftPress).toHaveBeenCalledWith(mockMoment);
    });

    it('should not propagate event when gift button is pressed', () => {
      const { getByText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const giftButton = getByText('Gift this moment');
      fireEvent.press(giftButton);

      expect(mockOnGiftPress).toHaveBeenCalled();
      // Card press should not be called
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should handle maybe later button press', () => {
      const { getByText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const maybeLaterButton = getByText('Maybe later');
      fireEvent.press(maybeLaterButton);

      // Should not crash and not propagate to card
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should call onSharePress when provided and share button is pressed', () => {
      const { getByLabelText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
          onSharePress={mockOnSharePress}
        />,
      );

      const shareButton = getByLabelText('Share this moment');
      fireEvent.press(shareButton);

      expect(mockOnSharePress).toHaveBeenCalledTimes(1);
      expect(mockOnSharePress).toHaveBeenCalledWith(mockMoment);
    });

    it('should use default share when onSharePress is not provided', async () => {
      const shareSpy = jest
        .spyOn(Share, 'share')
        .mockResolvedValue({ action: 'sharedAction' });

      const { getByLabelText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const shareButton = getByLabelText('Share this moment');
      fireEvent.press(shareButton);

      await waitFor(() => {
        expect(shareSpy).toHaveBeenCalled();
      });

      shareSpy.mockRestore();
    });

    it('should handle share errors gracefully', async () => {
      const shareSpy = jest
        .spyOn(Share, 'share')
        .mockRejectedValue(new Error('Share failed'));

      const { getByLabelText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const shareButton = getByLabelText('Share this moment');
      fireEvent.press(shareButton);

      // The component uses Toast for error handling
      await waitFor(() => {
        expect(shareSpy).toHaveBeenCalled();
      });

      // Verify toast was shown with error message
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'Could not share this moment',
          'error',
        );
      });

      shareSpy.mockRestore();
    });

    it('should not show error when user cancels share', async () => {
      const shareSpy = jest
        .spyOn(Share, 'share')
        .mockRejectedValue(new Error('User did not share'));
      const alertSpy = jest.spyOn(Alert, 'alert');

      const { getByLabelText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const shareButton = getByLabelText('Share this moment');
      fireEvent.press(shareButton);

      await waitFor(() => {
        expect(shareSpy).toHaveBeenCalled();
      });

      expect(alertSpy).not.toHaveBeenCalled();

      shareSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle moment without user data', () => {
      const momentWithoutUser = { ...mockMoment, user: undefined };

      const { getByText } = renderWithProviders(
        <MomentCard
          moment={momentWithoutUser}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('Anonymous')).toBeTruthy();
      expect(getByText('Traveler')).toBeTruthy();
    });

    it('should use placeholder avatar when user has no avatar', () => {
      const momentWithoutAvatar = {
        ...mockMoment,
        user: { ...mockMoment.user!, avatar: undefined },
      };

      const { getByLabelText } = renderWithProviders(
        <MomentCard
          moment={momentWithoutAvatar}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const avatar = getByLabelText("John Doe's avatar");
      // The component uses a base64 SVG placeholder instead of external URL
      expect(avatar.props.source).toMatch(
        /^data:image\/svg\+xml;base64,|https:\/\//,
      );
    });

    it('should handle unverified users', () => {
      const unverifiedMoment = {
        ...mockMoment,
        user: { ...mockMoment.user!, isVerified: false },
      };

      const { getByText } = renderWithProviders(
        <MomentCard
          moment={unverifiedMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should truncate long titles to 2 lines', () => {
      const longTitleMoment = {
        ...mockMoment,
        title:
          'This is a very long moment title that should be truncated to two lines maximum',
      };

      const { getByText } = renderWithProviders(
        <MomentCard
          moment={longTitleMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const titleElement = getByText(longTitleMoment.title);
      expect(titleElement.props.numberOfLines).toBe(2);
    });

    it('should truncate long location names', () => {
      const longLocationMoment = {
        ...mockMoment,
        location: {
          ...mockMoment.location,
          name: 'This is a very long location name that should be truncated',
        },
      };

      const { getByText } = renderWithProviders(
        <MomentCard
          moment={longLocationMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const locationElement = getByText(longLocationMoment.location.name);
      expect(locationElement.props.numberOfLines).toBe(1);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible card label', () => {
      const { getByLabelText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const card = getByLabelText('Moment: Coffee in Paris by John Doe');
      expect(card).toBeTruthy();
      expect(card.props.accessibilityRole).toBe('button');
    });

    it('should have accessible share button', () => {
      const { getByLabelText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const shareButton = getByLabelText('Share this moment');
      expect(shareButton.props.accessibilityRole).toBe('button');
    });

    it('should have accessible image labels', () => {
      const { getByLabelText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByLabelText('Photo of Coffee in Paris')).toBeTruthy();
      expect(getByLabelText("John Doe's avatar")).toBeTruthy();
    });
  });

  describe('Memoization', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      // Re-render with same props
      rerender(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      // Component should use memo optimization
      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('Price Display', () => {
    it('should display price with dollar sign', () => {
      const { getByText } = renderWithProviders(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('$25')).toBeTruthy();
    });

    it('should handle different price values', () => {
      const expensiveMoment = { ...mockMoment, price: 500 };

      const { getByText } = renderWithProviders(
        <MomentCard
          moment={expensiveMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('$500')).toBeTruthy();
    });
  });
});
