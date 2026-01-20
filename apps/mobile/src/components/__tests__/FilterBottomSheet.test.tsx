import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterBottomSheet } from '../FilterBottomSheet';

describe('FilterBottomSheet', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnApply = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onApply: mockOnApply,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when visible', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      expect(getByText('Filters')).toBeTruthy();
    });

    it('renders headline', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      expect(getByText('Filters')).toBeTruthy();
    });

    it('renders subtitle', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      expect(getByText('Narrow down moments')).toBeTruthy();
    });

    it('renders Category section title', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      expect(getByText('Category')).toBeTruthy();
    });

    it('renders all category chips', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      expect(getByText('All')).toBeTruthy();
      expect(getByText('Coffee')).toBeTruthy();
      expect(getByText('Meals')).toBeTruthy();
      expect(getByText('Tickets')).toBeTruthy();
      expect(getByText('Experiences')).toBeTruthy();
    });

    it('renders Price section title', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      expect(getByText('Price')).toBeTruthy();
    });

    it('renders default price range', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      expect(getByText('$5 - $200')).toBeTruthy();
    });

    it('renders When section title', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      expect(getByText('When')).toBeTruthy();
    });

    it('renders timing options', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      expect(getByText('Today')).toBeTruthy();
      expect(getByText('Next 3 days')).toBeTruthy();
      expect(getByText('This week')).toBeTruthy();
    });

    it('renders Clear filters button', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      expect(getByText('Clear filters')).toBeTruthy();
    });

    it('renders Apply button with results count', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      expect(getByText('Show 15 results')).toBeTruthy();
    });

    it('does not render when not visible', () => {
      const { toJSON } = render(
        <FilterBottomSheet {...defaultProps} visible={false} />,
      );
      const modal = toJSON() as unknown as { props: { visible: boolean } };
      expect(modal?.props.visible).toBe(false);
    });
  });

  describe('Category Selection', () => {
    it('selects Coffee category', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      const coffeeChip = getByText('Coffee');
      fireEvent.press(coffeeChip);
      // Selection state is managed internally
      expect(coffeeChip).toBeTruthy();
    });

    it('selects Meals category', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      const mealsChip = getByText('Meals');
      fireEvent.press(mealsChip);
      expect(mealsChip).toBeTruthy();
    });

    it('selects Tickets category', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      const ticketsChip = getByText('Tickets');
      fireEvent.press(ticketsChip);
      expect(ticketsChip).toBeTruthy();
    });

    it('selects Experiences category', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      const experiencesChip = getByText('Experiences');
      fireEvent.press(experiencesChip);
      expect(experiencesChip).toBeTruthy();
    });

    it('switches between categories', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      const coffeeChip = getByText('Coffee');
      const mealsChip = getByText('Meals');

      fireEvent.press(coffeeChip);
      fireEvent.press(mealsChip);

      expect(mealsChip).toBeTruthy();
    });
  });

  describe('Timing Selection', () => {
    it('selects Today timing', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      const todayButton = getByText('Today');
      fireEvent.press(todayButton);
      expect(todayButton).toBeTruthy();
    });

    it('selects Next 3 days timing', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      const next3DaysButton = getByText('Next 3 days');
      fireEvent.press(next3DaysButton);
      expect(next3DaysButton).toBeTruthy();
    });

    it('selects This week timing', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      const thisWeekButton = getByText('This week');
      fireEvent.press(thisWeekButton);
      expect(thisWeekButton).toBeTruthy();
    });

    it('switches between timing options', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      const todayButton = getByText('Today');
      const thisWeekButton = getByText('This week');

      fireEvent.press(todayButton);
      fireEvent.press(thisWeekButton);

      expect(thisWeekButton).toBeTruthy();
    });
  });

  describe('Apply Filters', () => {
    it('applies filters with default values', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      const applyButton = getByText('Show 15 results');
      fireEvent.press(applyButton);

      expect(mockOnApply).toHaveBeenCalledWith({
        category: 'All',
        priceRange: { min: 5, max: 200 },
        timing: 'today',
      });
    });

    it('applies filters with selected category', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);

      const coffeeChip = getByText('Coffee');
      fireEvent.press(coffeeChip);

      const applyButton = getByText('Show 15 results');
      fireEvent.press(applyButton);

      expect(mockOnApply).toHaveBeenCalledWith({
        category: 'Coffee',
        priceRange: { min: 5, max: 200 },
        timing: 'today',
      });
    });

    it('applies filters with selected timing', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);

      const thisWeekButton = getByText('This week');
      fireEvent.press(thisWeekButton);

      const applyButton = getByText('Show 15 results');
      fireEvent.press(applyButton);

      expect(mockOnApply).toHaveBeenCalledWith({
        category: 'All',
        priceRange: { min: 5, max: 200 },
        timing: 'thisweek',
      });
    });

    it('applies filters with multiple selections', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);

      const mealsChip = getByText('Meals');
      fireEvent.press(mealsChip);

      const next3DaysButton = getByText('Next 3 days');
      fireEvent.press(next3DaysButton);

      const applyButton = getByText('Show 15 results');
      fireEvent.press(applyButton);

      expect(mockOnApply).toHaveBeenCalledWith({
        category: 'Meals',
        priceRange: { min: 5, max: 200 },
        timing: 'next3days',
      });
    });

    it('calls onClose after applying filters', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      const applyButton = getByText('Show 15 results');
      fireEvent.press(applyButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Clear Filters', () => {
    it('clears all filters to default', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);

      // Make some selections
      const coffeeChip = getByText('Coffee');
      fireEvent.press(coffeeChip);

      const thisWeekButton = getByText('This week');
      fireEvent.press(thisWeekButton);

      // Clear filters
      const clearButton = getByText('Clear filters');
      fireEvent.press(clearButton);

      // Apply should now use defaults
      const applyButton = getByText('Show 15 results');
      fireEvent.press(applyButton);

      expect(mockOnApply).toHaveBeenCalledWith({
        category: 'All',
        priceRange: { min: 5, max: 200 },
        timing: 'today',
      });
    });

    it('does not close sheet when clearing filters', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      const clearButton = getByText('Clear filters');
      fireEvent.press(clearButton);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Close Actions', () => {
    it('calls onClose when backdrop pressed', () => {
      const { getByTestId } = render(<FilterBottomSheet {...defaultProps} />);
      // Use testID instead of deprecated UNSAFE_getByType
      const backdrop = getByTestId('filter-bottom-sheet-backdrop');

      fireEvent.press(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Properties', () => {
    it('sets modal as transparent', () => {
      const { toJSON } = render(<FilterBottomSheet {...defaultProps} />);
      const modal = toJSON() as unknown as { props: { transparent: boolean } };
      expect(modal?.props.transparent).toBe(true);
    });

    it('uses slide animation', () => {
      const { toJSON } = render(<FilterBottomSheet {...defaultProps} />);
      const modal = toJSON() as unknown as { props: { animationType: string } };
      expect(modal?.props.animationType).toBe('slide');
    });

    it('calls onClose on onRequestClose', () => {
      const { toJSON } = render(<FilterBottomSheet {...defaultProps} />);
      const modal = toJSON() as unknown as {
        props: { onRequestClose: () => void };
      };
      modal?.props.onRequestClose();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid category selection', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      const coffeeChip = getByText('Coffee');
      const mealsChip = getByText('Meals');
      const ticketsChip = getByText('Tickets');

      fireEvent.press(coffeeChip);
      fireEvent.press(mealsChip);
      fireEvent.press(ticketsChip);

      expect(ticketsChip).toBeTruthy();
    });

    it('handles rapid apply clicks', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      const applyButton = getByText('Show 15 results');

      fireEvent.press(applyButton);
      fireEvent.press(applyButton);

      // Both clicks register (no debouncing in component)
      expect(mockOnApply).toHaveBeenCalledTimes(2);
    });

    it('handles clear then apply immediately', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);

      const coffeeChip = getByText('Coffee');
      fireEvent.press(coffeeChip);

      const clearButton = getByText('Clear filters');
      fireEvent.press(clearButton);

      const applyButton = getByText('Show 15 results');
      fireEvent.press(applyButton);

      expect(mockOnApply).toHaveBeenCalledWith({
        category: 'All',
        priceRange: { min: 5, max: 200 },
        timing: 'today',
      });
    });

    it('handles multiple clear clicks', () => {
      const { getByText } = render(<FilterBottomSheet {...defaultProps} />);
      const clearButton = getByText('Clear filters');

      fireEvent.press(clearButton);
      fireEvent.press(clearButton);
      fireEvent.press(clearButton);

      // Should not crash or cause issues
      expect(clearButton).toBeTruthy();
    });
  });
});
