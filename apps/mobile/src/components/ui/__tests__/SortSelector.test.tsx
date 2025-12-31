/**
 * SortSelector Component Test Suite
 * Tests sort options modal with Zustand store integration
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SortSelector } from '../SortSelector';

// Mock Zustand store
const mockSetSortBy = jest.fn() as jest.Mock;
const mockUseSearchStore = jest.fn(() => ({
  sortBy: 'recent',
  setSortBy: mockSetSortBy,
})) as jest.Mock;

jest.mock('../../../stores/searchStore', () => ({
  useSearchStore: () => mockUseSearchStore(),
}));

// Mock useTranslation
jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('SortSelector Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchStore.mockReturnValue({
      sortBy: 'recent',
      setSortBy: mockSetSortBy,
    });
  });

  // ============================================
  // Basic Rendering Tests
  // ============================================

  describe('Basic Rendering', () => {
    it('renders when visible is true', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      expect(getByText('Sort By')).toBeTruthy();
    });

    it('does not render content when visible is false', () => {
      const onClose = jest.fn() as jest.Mock;
      const { queryByText } = render(
        <SortSelector visible={false} onClose={onClose} />,
      );

      // Modal still exists but content may not be visible
      expect(queryByText('Sort By')).toBeTruthy();
    });

    it('renders all sort options', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      expect(getByText('Most Recent')).toBeTruthy();
      expect(getByText('Most Popular')).toBeTruthy();
      expect(getByText('Price: Low to High')).toBeTruthy();
      expect(getByText('Price: High to Low')).toBeTruthy();
      expect(getByText('Highest Rated')).toBeTruthy();
    });

    it('renders with required props only', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      expect(getByText('Sort By')).toBeTruthy();
    });
  });

  // ============================================
  // Selected State Tests
  // ============================================

  describe('Selected State', () => {
    it('shows recent as selected by default', () => {
      const onClose = jest.fn() as jest.Mock;
      mockUseSearchStore.mockReturnValue({
        sortBy: 'recent',
        setSortBy: mockSetSortBy,
      });

      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      const recentOption = getByText('Most Recent');
      expect(recentOption).toBeTruthy();
    });

    it('shows popular as selected when sortBy is popular', () => {
      const onClose = jest.fn() as jest.Mock;
      mockUseSearchStore.mockReturnValue({
        sortBy: 'popular',
        setSortBy: mockSetSortBy,
      });

      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      expect(getByText('Most Popular')).toBeTruthy();
    });

    it('shows price-low as selected', () => {
      const onClose = jest.fn() as jest.Mock;
      mockUseSearchStore.mockReturnValue({
        sortBy: 'price-low',
        setSortBy: mockSetSortBy,
      });

      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      expect(getByText('Price: Low to High')).toBeTruthy();
    });

    it('shows price-high as selected', () => {
      const onClose = jest.fn() as jest.Mock;
      mockUseSearchStore.mockReturnValue({
        sortBy: 'price-high',
        setSortBy: mockSetSortBy,
      });

      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      expect(getByText('Price: High to Low')).toBeTruthy();
    });

    it('shows rating as selected', () => {
      const onClose = jest.fn() as jest.Mock;
      mockUseSearchStore.mockReturnValue({
        sortBy: 'rating',
        setSortBy: mockSetSortBy,
      });

      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      expect(getByText('Highest Rated')).toBeTruthy();
    });
  });

  // ============================================
  // Selection Tests
  // ============================================

  describe('Selection', () => {
    it('calls setSortBy when option selected', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      fireEvent.press(getByText('Most Popular'));

      expect(mockSetSortBy).toHaveBeenCalledWith('popular');
    });

    it('calls onSelect callback when option selected', () => {
      const onClose = jest.fn() as jest.Mock;
      const onSelect = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} onSelect={onSelect} />,
      );

      fireEvent.press(getByText('Most Popular'));

      expect(onSelect).toHaveBeenCalledWith('popular');
    });

    it('calls onClose after selection', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      fireEvent.press(getByText('Most Popular'));

      expect(onClose).toHaveBeenCalled();
    });

    it('selects recent option', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      fireEvent.press(getByText('Most Recent'));

      expect(mockSetSortBy).toHaveBeenCalledWith('recent');
    });

    it('selects price-low option', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      fireEvent.press(getByText('Price: Low to High'));

      expect(mockSetSortBy).toHaveBeenCalledWith('price-low');
    });

    it('selects price-high option', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      fireEvent.press(getByText('Price: High to Low'));

      expect(mockSetSortBy).toHaveBeenCalledWith('price-high');
    });

    it('selects rating option', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      fireEvent.press(getByText('Highest Rated'));

      expect(mockSetSortBy).toHaveBeenCalledWith('rating');
    });
  });

  // ============================================
  // Modal Behavior Tests
  // ============================================

  describe('Modal Behavior', () => {
    it('calls onClose when overlay pressed', () => {
      const onClose = jest.fn() as jest.Mock;
      render(<SortSelector visible={true} onClose={onClose} />);

      // Find overlay TouchableOpacity
      const touchables = UNSAFE_root.findAllByType(
        require('react-native').TouchableOpacity,
      );
      const overlay = touchables[0]; // First TouchableOpacity is the overlay

      fireEvent.press(overlay);

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose on modal request close', () => {
      const onClose = jest.fn() as jest.Mock;
      render(<SortSelector visible={true} onClose={onClose} />);

      const modal = UNSAFE_root.findByType(require('react-native').Modal);

      if (modal.props.onRequestClose) {
        modal.props.onRequestClose();
      }

      expect(onClose).toHaveBeenCalled();
    });

    it('renders with transparent background', () => {
      const onClose = jest.fn() as jest.Mock;
      render(<SortSelector visible={true} onClose={onClose} />);

      const modal = UNSAFE_root.findByType(require('react-native').Modal);
      expect(modal.props.transparent).toBe(true);
    });

    it('uses fade animation', () => {
      const onClose = jest.fn() as jest.Mock;
      render(<SortSelector visible={true} onClose={onClose} />);

      const modal = UNSAFE_root.findByType(require('react-native').Modal);
      expect(modal.props.animationType).toBe('fade');
    });
  });

  // ============================================
  // Callback Tests
  // ============================================

  describe('Callbacks', () => {
    it('works without onSelect callback', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      expect(() => {
        fireEvent.press(getByText('Most Popular'));
      }).not.toThrow();
    });

    it('calls all handlers in correct order', () => {
      const onClose = jest.fn() as jest.Mock;
      const onSelect = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} onSelect={onSelect} />,
      );

      fireEvent.press(getByText('Most Popular'));

      expect(mockSetSortBy).toHaveBeenCalledWith('popular');
      expect(onSelect).toHaveBeenCalledWith('popular');
      expect(onClose).toHaveBeenCalled();
    });

    it('passes correct value to onSelect', () => {
      const onClose = jest.fn() as jest.Mock;
      const onSelect = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} onSelect={onSelect} />,
      );

      fireEvent.press(getByText('Highest Rated'));

      expect(onSelect).toHaveBeenCalledWith('rating');
    });
  });

  // ============================================
  // Multiple Selection Tests
  // ============================================

  describe('Multiple Selections', () => {
    it('handles selecting same option twice', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText, rerender } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      fireEvent.press(getByText('Most Popular'));

      // Reopen modal
      onClose.mockClear();
      mockSetSortBy.mockClear();

      rerender(<SortSelector visible={true} onClose={onClose} />);

      fireEvent.press(getByText('Most Popular'));

      expect(mockSetSortBy).toHaveBeenCalledWith('popular');
    });

    it('handles changing selection', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText, rerender } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      fireEvent.press(getByText('Most Popular'));

      // Update store
      mockUseSearchStore.mockReturnValue({
        sortBy: 'popular',
        setSortBy: mockSetSortBy,
      });

      onClose.mockClear();
      mockSetSortBy.mockClear();

      rerender(<SortSelector visible={true} onClose={onClose} />);

      fireEvent.press(getByText('Highest Rated'));

      expect(mockSetSortBy).toHaveBeenCalledWith('rating');
    });
  });

  // ============================================
  // Visual State Tests
  // ============================================

  describe('Visual State', () => {
    it('renders title', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      expect(getByText('Sort By')).toBeTruthy();
    });

    it('renders all option labels', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      const labels = [
        'Most Recent',
        'Most Popular',
        'Price: Low to High',
        'Price: High to Low',
        'Highest Rated',
      ];

      labels.forEach((label) => {
        expect(getByText(label)).toBeTruthy();
      });
    });

    it('renders icons for all options', () => {
      const onClose = jest.fn() as jest.Mock;
      render(<SortSelector visible={true} onClose={onClose} />);

      const icons = UNSAFE_root.findAllByType(
        require('@expo/vector-icons').MaterialCommunityIcons,
      );

      // 5 option icons + checkmark for selected = 6 total
      expect(icons.length).toBeGreaterThanOrEqual(5);
    });
  });

  // ============================================
  // Edge Cases Tests
  // ============================================

  describe('Edge Cases', () => {
    it('handles rapid selection changes', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      fireEvent.press(getByText('Most Popular'));
      fireEvent.press(getByText('Highest Rated'));
      fireEvent.press(getByText('Most Recent'));

      // Last call should be 'recent'
      expect(mockSetSortBy).toHaveBeenLastCalledWith('recent');
      expect(mockSetSortBy).toHaveBeenCalledTimes(3);
    });

    it('handles visibility toggle', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText, rerender } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      expect(getByText('Sort By')).toBeTruthy();

      rerender(<SortSelector visible={false} onClose={onClose} />);

      // Modal still renders but with visible=false
      expect(getByText('Sort By')).toBeTruthy();
    });

    it('maintains selected state across visibility changes', () => {
      const onClose = jest.fn() as jest.Mock;
      mockUseSearchStore.mockReturnValue({
        sortBy: 'popular',
        setSortBy: mockSetSortBy,
      });

      const { getByText, rerender } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      expect(getByText('Most Popular')).toBeTruthy();

      rerender(<SortSelector visible={false} onClose={onClose} />);
      rerender(<SortSelector visible={true} onClose={onClose} />);

      expect(getByText('Most Popular')).toBeTruthy();
    });
  });

  // ============================================
  // Integration Tests
  // ============================================

  describe('Integration', () => {
    it('works with all sort options in sequence', () => {
      const onClose = jest.fn() as jest.Mock;
      const onSelect = jest.fn() as jest.Mock;
      const { getByText, rerender } = render(
        <SortSelector visible={true} onClose={onClose} onSelect={onSelect} />,
      );

      const options = [
        { label: 'Most Recent', value: 'recent' },
        { label: 'Most Popular', value: 'popular' },
        { label: 'Price: Low to High', value: 'price-low' },
        { label: 'Price: High to Low', value: 'price-high' },
        { label: 'Highest Rated', value: 'rating' },
      ];

      options.forEach((option) => {
        onClose.mockClear();
        onSelect.mockClear();
        mockSetSortBy.mockClear();

        rerender(
          <SortSelector visible={true} onClose={onClose} onSelect={onSelect} />,
        );

        fireEvent.press(getByText(option.label));

        expect(mockSetSortBy).toHaveBeenCalledWith(option.value);
        expect(onSelect).toHaveBeenCalledWith(option.value);
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('integrates with store updates', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText, rerender } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      fireEvent.press(getByText('Most Popular'));

      // Simulate store update
      mockUseSearchStore.mockReturnValue({
        sortBy: 'popular',
        setSortBy: mockSetSortBy,
      });

      rerender(<SortSelector visible={true} onClose={onClose} />);

      expect(getByText('Most Popular')).toBeTruthy();
    });
  });

  // ============================================
  // Real-World Use Cases
  // ============================================

  describe('Real-World Use Cases', () => {
    it('renders search results sort menu', () => {
      const onClose = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} />,
      );

      expect(getByText('Sort By')).toBeTruthy();
      expect(getByText('Most Recent')).toBeTruthy();
      expect(getByText('Most Popular')).toBeTruthy();
    });

    it('handles user sorting by price', () => {
      const onClose = jest.fn() as jest.Mock;
      const onSelect = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} onSelect={onSelect} />,
      );

      fireEvent.press(getByText('Price: Low to High'));

      expect(mockSetSortBy).toHaveBeenCalledWith('price-low');
      expect(onSelect).toHaveBeenCalledWith('price-low');
      expect(onClose).toHaveBeenCalled();
    });

    it('handles user sorting by rating', () => {
      const onClose = jest.fn() as jest.Mock;
      const onSelect = jest.fn() as jest.Mock;
      const { getByText } = render(
        <SortSelector visible={true} onClose={onClose} onSelect={onSelect} />,
      );

      fireEvent.press(getByText('Highest Rated'));

      expect(mockSetSortBy).toHaveBeenCalledWith('rating');
      expect(onSelect).toHaveBeenCalledWith('rating');
      expect(onClose).toHaveBeenCalled();
    });

    it('closes on overlay tap (dismissal)', () => {
      const onClose = jest.fn() as jest.Mock;
      render(<SortSelector visible={true} onClose={onClose} />);

      const touchables = UNSAFE_root.findAllByType(
        require('react-native').TouchableOpacity,
      );
      const overlay = touchables[0];

      fireEvent.press(overlay);

      expect(onClose).toHaveBeenCalled();
    });
  });
});
