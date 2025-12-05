/**
 * MomentCard Component Tests
 * Tests for the MomentCard display component
 */
/* eslint-disable @typescript-eslint/no-var-requires */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock dependencies
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const Animated = {
    View,
    createAnimatedComponent: (component: React.ComponentType) => component,
  };
  return {
    __esModule: true,
    default: Animated,
    useSharedValue: () => ({ value: 1 }),
    useAnimatedStyle: () => ({}),
    withSpring: (val: number) => val,
    withTiming: (val: number) => val,
  };
});

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

jest.mock('../../hooks/useHaptics', () => ({
  useHaptics: () => ({
    impact: jest.fn(),
    notification: jest.fn(),
    selection: jest.fn(),
  }),
}));

jest.mock('../../utils/animations', () => ({
  usePressScale: () => ({
    animatedStyle: {},
    onPressIn: jest.fn(),
    onPressOut: jest.fn(),
  }),
}));

jest.mock('../../constants/colors', () => ({
  COLORS: {
    white: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    primary: '#3B82F6',
    background: '#FFFFFF',
    border: '#E5E5E5',
  },
}));

jest.mock('../../constants/radii', () => ({
  radii: { md: 8, lg: 12, xl: 16 },
}));

jest.mock('../../constants/spacing', () => ({
  spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
}));

jest.mock('../../constants/typography', () => ({
  TYPOGRAPHY: {
    fontSize: { sm: 12, md: 14, lg: 16 },
    fontWeight: { regular: '400', medium: '500', bold: '700' },
  },
}));

jest.mock('../../constants/shadows', () => ({
  SHADOWS: { sm: {}, md: {}, lg: {} },
}));

import MomentCard from '../MomentCard';
import type { Moment } from '../../types';

const mockMoment: Moment = {
  id: 'moment-1',
  title: 'Amazing Coffee Experience',
  description: 'Best coffee in town',
  imageUrl: 'https://example.com/coffee.jpg',
  price: 25,
  category: 'coffee',
  availability: 'Available now',
  location: {
    name: 'Local Cafe',
    city: 'New York',
    lat: 40.7128,
    lng: -74.006,
  },
  user: {
    id: 'user-1',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    isVerified: true,
    role: 'Local Guide',
  },
  createdAt: '2024-01-15T10:00:00Z',
};

describe('MomentCard', () => {
  const mockOnPress = jest.fn();
  const mockOnGiftPress = jest.fn();
  const mockOnSharePress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with moment data', () => {
      const { getByText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('Amazing Coffee Experience')).toBeTruthy();
      expect(getByText('New York')).toBeTruthy();
      expect(getByText('$25')).toBeTruthy();
    });

    it('renders user name', () => {
      const { getByText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText(/John Doe/)).toBeTruthy();
    });

    it('renders location name', () => {
      const { getByText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('Local Cafe')).toBeTruthy();
    });

    it('renders availability', () => {
      const { getByText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('Available now')).toBeTruthy();
    });

    it('renders gift button', () => {
      const { getByText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('Gift this moment')).toBeTruthy();
    });

    it('renders maybe later button', () => {
      const { getByText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('Maybe later')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when card is pressed', () => {
      const { getByLabelText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      const card = getByLabelText(/Moment: Amazing Coffee Experience/);
      fireEvent.press(card);

      expect(mockOnPress).toHaveBeenCalled();
    });

    it('calls onGiftPress when gift button is pressed', () => {
      const { getByText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      fireEvent.press(getByText('Gift this moment'));

      expect(mockOnGiftPress).toHaveBeenCalledWith(mockMoment);
    });

    it('calls onSharePress when share button is pressed', () => {
      const { getByLabelText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
          onSharePress={mockOnSharePress}
        />,
      );

      fireEvent.press(getByLabelText('Share this moment'));

      expect(mockOnSharePress).toHaveBeenCalledWith(mockMoment);
    });
  });

  describe('Fallback Values', () => {
    it('renders Anonymous for missing user name', () => {
      const momentWithoutUser = {
        ...mockMoment,
        user: undefined,
      };

      const { getByText } = render(
        <MomentCard
          moment={momentWithoutUser as Moment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByText('Anonymous')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has accessible card label', () => {
      const { getByLabelText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(
        getByLabelText('Moment: Amazing Coffee Experience by John Doe'),
      ).toBeTruthy();
    });

    it('has accessible share button', () => {
      const { getByLabelText } = render(
        <MomentCard
          moment={mockMoment}
          onPress={mockOnPress}
          onGiftPress={mockOnGiftPress}
        />,
      );

      expect(getByLabelText('Share this moment')).toBeTruthy();
    });
  });
});
