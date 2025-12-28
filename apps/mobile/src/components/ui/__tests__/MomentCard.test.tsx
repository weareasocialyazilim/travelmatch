/**
 * MomentCard Component Tests
 * Tests for moment card display and interactions
 * Target Coverage: 60%+
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Share } from 'react-native';

// Mock expo/virtual/env first (ES module issue)
jest.mock('expo/virtual/env', () => ({
  env: process.env,
}));

// Mock analytics service (uses Sentry which has JSI issues in tests)
jest.mock('../../../services/analytics', () => ({
  analytics: {
    trackEvent: jest.fn(),
    trackError: jest.fn(),
    setUserId: jest.fn(),
    setUserProperties: jest.fn(),
    logScreenView: jest.fn(),
    startPerformanceTrace: jest.fn(() => ({
      stop: jest.fn(),
      putAttribute: jest.fn(),
      putMetric: jest.fn(),
    })),
  },
}));

// Mock ToastContext
const mockShowToast = jest.fn();
jest.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock dependencies
jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => ({
    impact: jest.fn(),
    selection: jest.fn(),
    notification: jest.fn(),
  }),
}));

jest.mock('../../../utils/animations', () => ({
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
      createAnimatedComponent: (component: any) => component,
    },
    useAnimatedStyle: () => ({}),
    useSharedValue: (value: any) => ({ value }),
    withTiming: (value: any) => value,
    withSpring: (value: any) => value,
  };
});

// Mock OptimizedImage
jest.mock('../OptimizedImage', () => ({
  OptimizedImage: ({ testID, accessibilityLabel, ...props }: any) => {
    const { Image } = require('react-native');
    return (
      <Image
        testID={testID || 'optimized-image'}
        accessibilityLabel={accessibilityLabel}
        {...props}
      />
    );
  },
}));

// Mock expo-image
jest.mock('expo-image', () => ({
  Image: ({ testID, ...props }: any) => {
    const { Image } = require('react-native');
    return <Image testID={testID || 'expo-image'} {...props} />;
  },
}));

// Mock logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock constants
jest.mock('../../../constants/colors', () => ({
  COLORS: {
    primary: '#007AFF',
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E0E0E0',
    error: '#FF3B30',
    success: '#34C759',
    card: '#FFFFFF',
    shadow: '#000000',
    white: '#FFFFFF',
  },
}));

jest.mock('../../../constants/radii', () => ({
  radii: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
}));

jest.mock('../../../constants/shadows', () => ({
  SHADOWS: {
    small: {},
    medium: {},
    large: {},
  },
}));

jest.mock('../../../constants/spacing', () => ({
  SPACING: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
}));

jest.mock('../../../constants/typography', () => ({
  TYPOGRAPHY: {
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 20,
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
  },
}));

// Mock cloudflareImageHelpers
jest.mock('../../../utils/cloudflareImageHelpers', () => ({
  getMomentImageProps: (moment: any) => ({
    source: { uri: moment.imageUrl || 'https://example.com/image.jpg' },
  }),
  getAvatarImageProps: () => ({
    source: { uri: 'https://example.com/avatar.jpg' },
  }),
  IMAGE_VARIANTS_BY_CONTEXT: {
    CARD_SINGLE: 'card-single',
    AVATAR_SMALL: 'avatar-small',
  },
}));

// Import component after all mocks
import MomentCard from '../../../components/MomentCard';
import type { Moment } from '../../../types';

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
      icon: 'coffee',
    },
    user: {
      id: 'user-1',
      name: 'John Doe',
      avatar: 'https://example.com/avatar.jpg',
      role: 'Host',
      isVerified: true,
    },
  };

  const mockOnPress = jest.fn();
  const mockOnGiftPress = jest.fn();
  const mockOnSharePress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
  });

  describe('Rendering', () => {
    it('should render moment title', () => {
      const { getByText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('Coffee in Paris')).toBeTruthy();
    });

    it('should render city location', () => {
      const { getByText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('Paris')).toBeTruthy();
    });

    it('should render location name', () => {
      const { getByText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('Café de Flore')).toBeTruthy();
    });

    it('should render user name', () => {
      const { getByText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText(/John Doe/)).toBeTruthy();
    });

    it('should render availability', () => {
      const { getByText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('Available')).toBeTruthy();
    });

    it('should render Anonymous for missing user', () => {
      const momentWithoutUser = { ...mockMoment, user: undefined };
      const { getByText } = render(
        <MomentCard
          moment={momentWithoutUser}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('Anonymous')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when card is pressed', () => {
      const { getByLabelText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const card = getByLabelText(`Moment: Coffee in Paris by John Doe`);
      fireEvent.press(card);
      expect(mockOnPress).toHaveBeenCalled();
    });

    it('should call onSharePress when share button is pressed and custom handler provided', () => {
      const { getByLabelText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
          onSharePress={mockOnSharePress}
        />,
      );

      const shareButton = getByLabelText('Share this moment');
      fireEvent.press(shareButton);
      expect(mockOnSharePress).toHaveBeenCalledWith(mockMoment);
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label', () => {
      const { getByLabelText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(
        getByLabelText('Moment: Coffee in Paris by John Doe'),
      ).toBeTruthy();
    });

    it('should have accessible share button', () => {
      const { getByLabelText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByLabelText('Share this moment')).toBeTruthy();
    });

    it('should have image with accessibility label', () => {
      const { getByLabelText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByLabelText('Photo of Coffee in Paris')).toBeTruthy();
    });
  });
});
