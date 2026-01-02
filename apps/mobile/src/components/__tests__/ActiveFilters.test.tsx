import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActiveFilters } from '../ActiveFilters';

describe('ActiveFilters', () => {
  const mockFilters = [
    { key: 'category', label: 'Category', value: 'Coffee' },
    { key: 'price', label: 'Price', value: '$5-$50' },
    { key: 'timing', label: 'When', value: 'Today' },
  ];

  const mockOnRemove = jest.fn() as jest.Mock;
  const mockOnClearAll = jest.fn() as jest.Mock;

  const defaultProps = {
    filters: mockFilters,
    onRemove: mockOnRemove,
    onClearAll: mockOnClearAll,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all filters', () => {
      const { getByText } = render(<ActiveFilters {...defaultProps} />);
      expect(getByText('Category: Coffee')).toBeTruthy();
      expect(getByText('Price: $5-$50')).toBeTruthy();
      expect(getByText('When: Today')).toBeTruthy();
    });

    it('renders remove icon for each filter', () => {
      const { getByTestId } = render(<ActiveFilters {...defaultProps} />);
      // Each filter has a remove button with testID
      expect(getByTestId('remove-filter-category')).toBeTruthy();
      expect(getByTestId('remove-filter-price')).toBeTruthy();
      expect(getByTestId('remove-filter-timing')).toBeTruthy();
    });

    it('renders Clear All button when multiple filters', () => {
      const { getByText } = render(<ActiveFilters {...defaultProps} />);
      expect(getByText('Clear All')).toBeTruthy();
    });

    it('does not render Clear All button with single filter', () => {
      const singleFilter = [mockFilters[0]];
      const { queryByText } = render(
        <ActiveFilters {...defaultProps} filters={singleFilter} />
      );
      expect(queryByText('Clear All')).toBeNull();
    });

    it('returns null when no filters', () => {
      const { toJSON } = render(
        <ActiveFilters {...defaultProps} filters={[]} />
      );
      // Component returns null when no filters
      expect(toJSON()).toBeNull();
    });

    it('renders filter with long value', () => {
      const longFilter = [
        {
          key: 'long',
          label: 'Category',
          value: 'Very Long Category Name That Should Truncate',
        },
      ];
      const { getByText } = render(
        <ActiveFilters {...defaultProps} filters={longFilter} />
      );
      expect(getByText('Category: Very Long Category Name That Should Truncate')).toBeTruthy();
    });

    it('renders horizontal ScrollView', () => {
      const { getByTestId } = render(<ActiveFilters {...defaultProps} />);
      const scrollView = getByTestId('active-filters-scroll');
      expect(scrollView.props.horizontal).toBe(true);
      expect(scrollView.props.showsHorizontalScrollIndicator).toBe(false);
    });
  });

  describe('Remove Filter', () => {
    it('calls onRemove with correct key when remove icon pressed', () => {
      const { getByTestId } = render(<ActiveFilters {...defaultProps} />);

      fireEvent.press(getByTestId('remove-filter-category'));
      expect(mockOnRemove).toHaveBeenCalledWith('category');
      expect(mockOnRemove).toHaveBeenCalledTimes(1);
    });

    it('calls onRemove for second filter', () => {
      const { getByTestId } = render(<ActiveFilters {...defaultProps} />);

      fireEvent.press(getByTestId('remove-filter-price'));
      expect(mockOnRemove).toHaveBeenCalledWith('price');
    });

    it('calls onRemove for third filter', () => {
      const { getByTestId } = render(<ActiveFilters {...defaultProps} />);

      fireEvent.press(getByTestId('remove-filter-timing'));
      expect(mockOnRemove).toHaveBeenCalledWith('timing');
    });

    it('does not call onClearAll when removing individual filter', () => {
      const { getByTestId } = render(<ActiveFilters {...defaultProps} />);

      fireEvent.press(getByTestId('remove-filter-category'));
      expect(mockOnClearAll).not.toHaveBeenCalled();
    });
  });

  describe('Clear All', () => {
    it('calls onClearAll when Clear All button pressed', () => {
      const { getByText } = render(<ActiveFilters {...defaultProps} />);
      const clearAllButton = getByText('Clear All');
      fireEvent.press(clearAllButton);
      expect(mockOnClearAll).toHaveBeenCalledTimes(1);
    });

    it('does not call onRemove when Clear All pressed', () => {
      const { getByText } = render(<ActiveFilters {...defaultProps} />);
      const clearAllButton = getByText('Clear All');
      fireEvent.press(clearAllButton);
      expect(mockOnRemove).not.toHaveBeenCalled();
    });

    it('calls onClearAll multiple times', () => {
      const { getByText } = render(<ActiveFilters {...defaultProps} />);
      const clearAllButton = getByText('Clear All');

      fireEvent.press(clearAllButton);
      fireEvent.press(clearAllButton);

      expect(mockOnClearAll).toHaveBeenCalledTimes(2);
    });
  });

  describe('Filter Display', () => {
    it('displays filter label and value together', () => {
      const { getByText } = render(<ActiveFilters {...defaultProps} />);
      expect(getByText('Category: Coffee')).toBeTruthy();
    });

    it('renders filter with special characters', () => {
      const specialFilter = [
        { key: 'special', label: 'Café', value: '€5-€50' },
      ];
      const { getByText } = render(
        <ActiveFilters {...defaultProps} filters={specialFilter} />
      );
      expect(getByText('Café: €5-€50')).toBeTruthy();
    });

    it('renders filter with emoji', () => {
      const emojiFilter = [
        { key: 'emoji', label: 'Mood', value: '😊 Happy' },
      ];
      const { getByText } = render(
        <ActiveFilters {...defaultProps} filters={emojiFilter} />
      );
      expect(getByText('Mood: 😊 Happy')).toBeTruthy();
    });

    it('renders filter with numbers only', () => {
      const numberFilter = [
        { key: 'count', label: 'Guests', value: '4' },
      ];
      const { getByText } = render(
        <ActiveFilters {...defaultProps} filters={numberFilter} />
      );
      expect(getByText('Guests: 4')).toBeTruthy();
    });
  });

  describe('Multiple Filters', () => {
    it('renders two filters correctly', () => {
      const twoFilters = [mockFilters[0], mockFilters[1]];
      const { getByText } = render(
        <ActiveFilters {...defaultProps} filters={twoFilters} />
      );
      expect(getByText('Category: Coffee')).toBeTruthy();
      expect(getByText('Price: $5-$50')).toBeTruthy();
      expect(getByText('Clear All')).toBeTruthy();
    });

    it('renders five filters correctly', () => {
      const fiveFilters = [
        ...mockFilters,
        { key: 'location', label: 'Location', value: 'Paris' },
        { key: 'rating', label: 'Rating', value: '4+ stars' },
      ];
      const { getByText } = render(
        <ActiveFilters {...defaultProps} filters={fiveFilters} />
      );
      expect(getByText('Category: Coffee')).toBeTruthy();
      expect(getByText('Location: Paris')).toBeTruthy();
      expect(getByText('Rating: 4+ stars')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles filter with empty value', () => {
      const emptyValueFilter = [{ key: 'empty', label: 'Test', value: '' }];
      const { getByText } = render(
        <ActiveFilters {...defaultProps} filters={emptyValueFilter} />
      );
      expect(getByText('Test: ')).toBeTruthy();
    });

    it('handles filter with empty label', () => {
      const emptyLabelFilter = [{ key: 'empty', label: '', value: 'Value' }];
      const { getByText } = render(
        <ActiveFilters {...defaultProps} filters={emptyLabelFilter} />
      );
      expect(getByText(': Value')).toBeTruthy();
    });

    it('handles rapid remove clicks', () => {
      const { getByTestId } = render(<ActiveFilters {...defaultProps} />);
      const removeButton = getByTestId('remove-filter-category');

      fireEvent.press(removeButton);
      fireEvent.press(removeButton);
      fireEvent.press(removeButton);

      expect(mockOnRemove).toHaveBeenCalledTimes(3);
      expect(mockOnRemove).toHaveBeenCalledWith('category');
    });

    it('handles rapid Clear All clicks', () => {
      const { getByText } = render(<ActiveFilters {...defaultProps} />);
      const clearAllButton = getByText('Clear All');

      fireEvent.press(clearAllButton);
      fireEvent.press(clearAllButton);
      fireEvent.press(clearAllButton);

      expect(mockOnClearAll).toHaveBeenCalledTimes(3);
    });

    it('re-renders when filters prop changes', () => {
      const { rerender, getByText, queryByText } = render(
        <ActiveFilters {...defaultProps} filters={[mockFilters[0]]} />
      );
      expect(getByText('Category: Coffee')).toBeTruthy();
      expect(queryByText('Price: $5-$50')).toBeNull();

      rerender(<ActiveFilters {...defaultProps} filters={mockFilters} />);
      expect(getByText('Category: Coffee')).toBeTruthy();
      expect(getByText('Price: $5-$50')).toBeTruthy();
    });

    it('handles filters with duplicate keys gracefully', () => {
      const duplicateFilters = [
        { key: 'same', label: 'First', value: 'A' },
        { key: 'same', label: 'Second', value: 'B' },
      ];
      const { getByText } = render(
        <ActiveFilters {...defaultProps} filters={duplicateFilters} />
      );
      // Should still render both (even though keys are same - not recommended but handled)
      expect(getByText('First: A')).toBeTruthy();
    });
  });
});
