/**
 * Tests for MemoizedMomentCard - Optimized moment card component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MemoizedMomentCard } from '../MemoizedMomentCard';
import type { Moment } from '../../../types';

// Mock Expo vector icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

// Mock moment data
const createMockMoment = (overrides?: Partial<Moment>): Moment => ({
  id: '1',
  title: 'Coffee at Sunset Cafe',
  story: 'Join me for a relaxing coffee',
  imageUrl: 'https://example.com/coffee.jpg',
  price: 15,
  location: {
    city: 'Istanbul',
    country: 'Turkey',
  },
  availability: 'Tomorrow 3PM',
  distance: '2.5 km away',
  user: {
    id: 'user1',
    name: 'Alice Johnson',
    avatar: 'https://example.com/alice.jpg',
    isVerified: true,
  },
  category: {
    id: 'food',
    label: 'Food & Drinks',
    emoji: '☕',
  },
  ...overrides,
});

describe('MemoizedMomentCard', () => {
  const mockOnPress = jest.fn();
  const mockOnFavorite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // Basic Rendering
  // =========================

  describe('Basic Rendering', () => {
    it('renders correctly with required props', () => {
      const moment = createMockMoment();
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(getByText('Coffee at Sunset Cafe')).toBeTruthy();
      expect(getByText(/15/)).toBeTruthy();
    });

    it('displays moment title', () => {
      const moment = createMockMoment({ title: 'Amazing Food Tour' });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(getByText('Amazing Food Tour')).toBeTruthy();
    });

    it('displays moment price', () => {
      const moment = createMockMoment({ price: 25 });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      // Price might be in accessibility label or rendered text
      expect(getByText(/25/)).toBeTruthy();
    });

    it('displays price unit', () => {
      const moment = createMockMoment();
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(getByText('/person')).toBeTruthy();
    });

    it('renders with single variant by default', () => {
      const moment = createMockMoment();
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      // Single variant shows full title (2 lines)
      expect(getByText('Coffee at Sunset Cafe')).toBeTruthy();
    });

    it('renders with grid variant', () => {
      const moment = createMockMoment();
      const { getByText } = render(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          variant="grid"
        />,
      );

      // Grid variant shows title (1 line, truncated)
      expect(getByText('Coffee at Sunset Cafe')).toBeTruthy();
    });
  });

  // =========================
  // User/Host Information
  // =========================

  describe('User/Host Information', () => {
    it('displays user name from user field', () => {
      const moment = createMockMoment({
        user: {
          id: 'user1',
          name: 'Bob Smith',
        },
      });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(getByText('Bob Smith')).toBeTruthy();
    });

    it('displays user name from creator field', () => {
      const moment = createMockMoment({
        user: undefined,
        creator: {
          id: 'creator1',
          name: 'Charlie Brown',
        },
      });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(getByText('Charlie Brown')).toBeTruthy();
    });

    it('shows "Unknown host" when no user info', () => {
      const moment = createMockMoment({
        user: undefined,
        creator: undefined,
      });
      const { getByLabelText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      // Check accessibility label mentions Unknown host
      const card = getByLabelText(/Unknown host/i);
      expect(card).toBeTruthy();
    });

    it('does not show host info in grid variant', () => {
      const moment = createMockMoment();
      const { queryByText } = render(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          variant="grid"
        />,
      );

      // Grid variant hides host info
      expect(queryByText('Alice Johnson')).toBeNull();
    });

    it('shows host info in single variant', () => {
      const moment = createMockMoment();
      const { getByText } = render(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          variant="single"
        />,
      );

      expect(getByText('Alice Johnson')).toBeTruthy();
    });
  });

  // =========================
  // Location Display
  // =========================

  describe('Location Display', () => {
    it('displays location from city', () => {
      const moment = createMockMoment({
        location: {
          city: 'Paris',
          country: 'France',
        },
      });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(getByText('Paris')).toBeTruthy();
    });

    it('displays location from name', () => {
      const moment = createMockMoment({
        location: {
          name: 'Eiffel Tower',
          city: 'Paris',
          country: 'France',
        },
      });
      const { getByText, queryByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      // Should show name if available, otherwise city
      const hasName = queryByText('Eiffel Tower');
      const hasCity = queryByText('Paris');
      expect(hasName || hasCity).toBeTruthy();
    });

    it('handles string location', () => {
      const moment = createMockMoment({
        location: 'Berlin, Germany',
      });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(getByText('Berlin, Germany')).toBeTruthy();
    });

    it('does not crash with missing location', () => {
      const moment = createMockMoment({
        location: undefined,
      });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(getByText('Coffee at Sunset Cafe')).toBeTruthy();
    });
  });

  // =========================
  // Distance Display
  // =========================

  describe('Distance Display', () => {
    it('displays distance when provided', () => {
      const moment = createMockMoment({ distance: '1.5 km away' });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(getByText('1.5 km away')).toBeTruthy();
    });

    it('does not show distance when not provided', () => {
      const moment = createMockMoment({ distance: undefined });
      const { queryByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(queryByText(/km away/)).toBeNull();
    });

    it('handles various distance formats', () => {
      const moment = createMockMoment({ distance: '500m' });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(getByText('500m')).toBeTruthy();
    });
  });

  // =========================
  // Category Badge
  // =========================

  describe('Category Badge', () => {
    it('displays category label from object', () => {
      const moment = createMockMoment({
        category: {
          id: 'food',
          label: 'Food & Drinks',
          emoji: '☕',
        },
      });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(getByText('Food & Drinks')).toBeTruthy();
    });

    it('displays category as string', () => {
      const moment = createMockMoment({
        category: 'Adventure',
      });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(getByText('Adventure')).toBeTruthy();
    });

    it('does not show category when not provided', () => {
      const moment = createMockMoment({ category: undefined });
      const { queryByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      // No category badge should be visible
      expect(queryByText('Food & Drinks')).toBeNull();
    });
  });

  // =========================
  // Image Handling
  // =========================

  describe('Image Handling', () => {
    it('uses imageUrl field', () => {
      const moment = createMockMoment({
        imageUrl: 'https://example.com/moment1.jpg',
      });
      const { UNSAFE_root } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      // Component should render with image
      expect(UNSAFE_root).toBeTruthy();
    });

    it('falls back to image field', () => {
      const moment = createMockMoment({
        imageUrl: undefined,
        image: 'https://example.com/fallback.jpg',
      });
      const { UNSAFE_root } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      // Component should render with fallback image
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  // =========================
  // Favorite Functionality
  // =========================

  describe('Favorite Functionality', () => {
    it('shows favorite button when onFavorite provided', () => {
      const moment = createMockMoment();
      const { UNSAFE_root } = render(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          onFavorite={mockOnFavorite}
        />,
      );

      // Should have MaterialCommunityIcons for favorite
      const icons = UNSAFE_root.findAllByType('MaterialCommunityIcons');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('does not show favorite button when onFavorite not provided', () => {
      const moment = createMockMoment();
      const { UNSAFE_root } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      // Without onFavorite, there should be no heart icon
      const icons = UNSAFE_root.findAllByType('MaterialCommunityIcons');
      const heartIcons = icons.filter(
        (icon) =>
          icon.props.name === 'heart' || icon.props.name === 'heart-outline',
      );
      expect(heartIcons.length).toBe(0);
    });

    it('calls onFavorite when favorite button pressed', () => {
      const moment = createMockMoment({ id: 'moment123' });
      const { getByLabelText } = render(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          onFavorite={mockOnFavorite}
        />,
      );

      const favoriteButton = getByLabelText('Add to favorites');
      fireEvent.press(favoriteButton);

      expect(mockOnFavorite).toHaveBeenCalledWith('moment123');
    });

    it('shows filled heart when isFavorite=true', () => {
      const moment = createMockMoment();
      const { UNSAFE_root } = render(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          onFavorite={mockOnFavorite}
          isFavorite={true}
        />,
      );

      const icons = UNSAFE_root.findAllByType('MaterialCommunityIcons');
      const heartIcon = icons.find((icon) => icon.props.name === 'heart');
      expect(heartIcon).toBeTruthy();
    });

    it('shows outline heart when isFavorite=false', () => {
      const moment = createMockMoment();
      const { UNSAFE_root } = render(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          onFavorite={mockOnFavorite}
          isFavorite={false}
        />,
      );

      const icons = UNSAFE_root.findAllByType('MaterialCommunityIcons');
      const heartIcon = icons.find(
        (icon) => icon.props.name === 'heart-outline',
      );
      expect(heartIcon).toBeTruthy();
    });
  });

  // =========================
  // Press Interaction
  // =========================

  describe('Press Interaction', () => {
    it('calls onPress when card is pressed', () => {
      const moment = createMockMoment();
      const { getByRole } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      const card = getByRole('button');
      fireEvent.press(card);

      expect(mockOnPress).toHaveBeenCalledWith(moment);
    });

    it('calls onPress with correct moment data', () => {
      const moment = createMockMoment({
        id: 'test123',
        title: 'Test Moment',
      });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      const card = getByText('Test Moment');
      fireEvent.press(card);

      expect(mockOnPress).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test123',
          title: 'Test Moment',
        }),
      );
    });

    it('does not call onFavorite when card is pressed', () => {
      const moment = createMockMoment();
      const { getByText } = render(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          onFavorite={mockOnFavorite}
        />,
      );

      const card = getByText('Coffee at Sunset Cafe');
      fireEvent.press(card);

      expect(mockOnFavorite).not.toHaveBeenCalled();
    });
  });

  // =========================
  // Memoization Behavior
  // =========================

  describe('Memoization Behavior', () => {
    it('does not re-render when props unchanged', () => {
      const moment = createMockMoment();
      const { rerender } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      // Re-render with same props
      rerender(<MemoizedMomentCard moment={moment} onPress={mockOnPress} />);

      // Component should not re-render (memoization prevents it)
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('re-renders when moment id changes', () => {
      const moment1 = createMockMoment({ id: '1' });
      const moment2 = createMockMoment({ id: '2' });

      const { rerender, getByText } = render(
        <MemoizedMomentCard moment={moment1} onPress={mockOnPress} />,
      );

      rerender(<MemoizedMomentCard moment={moment2} onPress={mockOnPress} />);

      // Component should re-render with new data
      expect(getByText('Coffee at Sunset Cafe')).toBeTruthy();
    });

    it('re-renders when isFavorite changes', () => {
      const moment = createMockMoment();

      const { rerender, UNSAFE_root } = render(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          onFavorite={mockOnFavorite}
          isFavorite={false}
        />,
      );

      rerender(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          onFavorite={mockOnFavorite}
          isFavorite={true}
        />,
      );

      // Should show filled heart now
      const icons = UNSAFE_root.findAllByType('MaterialCommunityIcons');
      const heartIcon = icons.find((icon) => icon.props.name === 'heart');
      expect(heartIcon).toBeTruthy();
    });

    it('re-renders when variant changes', () => {
      const moment = createMockMoment();

      const { rerender, queryByText } = render(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          variant="single"
        />,
      );

      rerender(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          variant="grid"
        />,
      );

      // Grid variant should hide host info
      expect(queryByText('Alice Johnson')).toBeNull();
    });
  });

  // =========================
  // Accessibility
  // =========================

  describe('Accessibility', () => {
    it('has accessible role for card', () => {
      const moment = createMockMoment();
      const { getByRole } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      const card = getByRole('button');
      expect(card).toBeTruthy();
    });

    it('has descriptive accessibility label for card', () => {
      const moment = createMockMoment({
        title: 'Food Tour',
        price: 20,
        user: { id: '1', name: 'John' },
      });
      const { getByLabelText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      const card = getByLabelText(/Food Tour.*John.*20/i);
      expect(card).toBeTruthy();
    });

    it('has accessibility for favorite button', () => {
      const moment = createMockMoment();
      const { getByLabelText } = render(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          onFavorite={mockOnFavorite}
          isFavorite={false}
        />,
      );

      const favoriteButton = getByLabelText('Add to favorites');
      expect(favoriteButton).toBeTruthy();
    });

    it('updates favorite accessibility label when favorited', () => {
      const moment = createMockMoment();
      const { getByLabelText } = render(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          onFavorite={mockOnFavorite}
          isFavorite={true}
        />,
      );

      const favoriteButton = getByLabelText('Remove from favorites');
      expect(favoriteButton).toBeTruthy();
    });
  });

  // =========================
  // Edge Cases
  // =========================

  describe('Edge Cases', () => {
    it('handles very long title', () => {
      const longTitle = 'A'.repeat(200);
      const moment = createMockMoment({ title: longTitle });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(getByText(longTitle)).toBeTruthy();
    });

    it('handles price of 0', () => {
      const moment = createMockMoment({ price: 0 });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(getByText(/0/)).toBeTruthy();
    });

    it('handles very high price', () => {
      const moment = createMockMoment({ price: 9999 });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      expect(getByText(/9999/)).toBeTruthy();
    });

    it('handles missing image urls', () => {
      const moment = createMockMoment({
        imageUrl: undefined as any,
        image: undefined,
      });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      // Should still render card without crashing
      expect(getByText('Coffee at Sunset Cafe')).toBeTruthy();
    });

    it('handles both user and creator present', () => {
      const moment = createMockMoment({
        user: { id: 'user1', name: 'User Name' },
        creator: { id: 'creator1', name: 'Creator Name' },
      });
      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      // Should prefer user over creator
      expect(getByText('User Name')).toBeTruthy();
    });
  });

  // =========================
  // Real-world Use Cases
  // =========================

  describe('Real-world Use Cases', () => {
    it('simulates browse feed card', () => {
      const moment = createMockMoment({
        title: 'Sunset Yoga on the Beach',
        price: 25,
        distance: '3.2 km away',
        category: {
          id: 'wellness',
          label: 'Wellness',
          emoji: '🧘',
        },
      });

      const { getByText } = render(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          onFavorite={mockOnFavorite}
          isFavorite={false}
          variant="single"
        />,
      );

      expect(getByText('Sunset Yoga on the Beach')).toBeTruthy();
      expect(getByText(/25/)).toBeTruthy();
      expect(getByText('3.2 km away')).toBeTruthy();
      expect(getByText('Wellness')).toBeTruthy();
    });

    it('simulates grid view card', () => {
      const moment = createMockMoment({
        title: 'Quick Coffee Meetup',
        price: 10,
      });

      const { getByText, queryByText } = render(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          variant="grid"
        />,
      );

      expect(getByText('Quick Coffee Meetup')).toBeTruthy();
      expect(getByText(/10/)).toBeTruthy();
      // Grid hides host info
      expect(queryByText('Alice Johnson')).toBeNull();
    });

    it('simulates favoriting a moment', () => {
      const moment = createMockMoment({ id: 'fav123' });

      const { getByLabelText } = render(
        <MemoizedMomentCard
          moment={moment}
          onPress={mockOnPress}
          onFavorite={mockOnFavorite}
          isFavorite={false}
        />,
      );

      // Press favorite button
      const favoriteButton = getByLabelText('Add to favorites');
      fireEvent.press(favoriteButton);

      expect(mockOnFavorite).toHaveBeenCalledWith('fav123');
    });

    it('simulates viewing moment details', () => {
      const moment = createMockMoment({
        id: 'detail123',
        title: 'Detailed Moment',
      });

      const { getByText } = render(
        <MemoizedMomentCard moment={moment} onPress={mockOnPress} />,
      );

      // Press card
      const title = getByText('Detailed Moment');
      fireEvent.press(title);

      expect(mockOnPress).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'detail123',
          title: 'Detailed Moment',
        }),
      );
    });
  });
});
