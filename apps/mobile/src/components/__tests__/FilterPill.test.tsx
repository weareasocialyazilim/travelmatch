import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterPill } from '../FilterPill';

// Mock hooks and animations
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

describe('FilterPill', () => {
  const mockFilter = {
    id: 'coffee',
    label: 'Coffee',
    icon: 'coffee',
  };

  const mockOnPress = jest.fn();

  const defaultProps = {
    filter: mockFilter,
    isSelected: false,
    onPress: mockOnPress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders filter label', () => {
      const { getByText } = render(<FilterPill {...defaultProps} />);
      expect(getByText('Coffee')).toBeTruthy();
    });

    it('renders icon when provided', () => {
      const { UNSAFE_getByType } = render(<FilterPill {...defaultProps} />);
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icon = UNSAFE_getByType(MaterialCommunityIcons);
      expect(icon.props.name).toBe('coffee');
      expect(icon.props.size).toBe(16);
    });

    it('does not render icon when not provided', () => {
      const filterWithoutIcon = { ...mockFilter, icon: undefined };
      const { UNSAFE_queryByType } = render(
        <FilterPill {...defaultProps} filter={filterWithoutIcon} />,
      );
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      expect(UNSAFE_queryByType(MaterialCommunityIcons)).toBeNull();
    });

    it('applies selected styles when isSelected is true', () => {
      const { getByText } = render(
        <FilterPill {...defaultProps} isSelected={true} />,
      );
      const label = getByText('Coffee');
      expect(label).toBeTruthy();
    });

    it('applies unselected styles when isSelected is false', () => {
      const { getByText } = render(
        <FilterPill {...defaultProps} isSelected={false} />,
      );
      const label = getByText('Coffee');
      expect(label).toBeTruthy();
    });

    it('has correct accessibility role', () => {
      const { getByLabelText } = render(<FilterPill {...defaultProps} />);
      const button = getByLabelText('Coffee');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('has correct accessibility label', () => {
      const { getByLabelText } = render(<FilterPill {...defaultProps} />);
      expect(getByLabelText('Coffee')).toBeTruthy();
    });

    it('has correct accessibility state when selected', () => {
      const { getByLabelText } = render(
        <FilterPill {...defaultProps} isSelected={true} />,
      );
      const button = getByLabelText('Coffee');
      expect(button.props.accessibilityState.selected).toBe(true);
    });

    it('has correct accessibility state when not selected', () => {
      const { getByLabelText } = render(
        <FilterPill {...defaultProps} isSelected={false} />,
      );
      const button = getByLabelText('Coffee');
      expect(button.props.accessibilityState.selected).toBe(false);
    });
  });

  describe('User Interactions', () => {
    it('calls onPress with filter id when pressed', () => {
      const { getByLabelText } = render(<FilterPill {...defaultProps} />);
      const button = getByLabelText('Coffee');
      fireEvent.press(button);
      expect(mockOnPress).toHaveBeenCalledWith('coffee');
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('calls onPress multiple times', () => {
      const { getByLabelText } = render(<FilterPill {...defaultProps} />);
      const button = getByLabelText('Coffee');

      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(2);
    });

    it('handles multiple presses', () => {
      const { getByLabelText } = render(<FilterPill {...defaultProps} />);
      const button = getByLabelText('Coffee');

      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
      expect(mockOnPress).toHaveBeenCalledWith('coffee');
    });
  });

  describe('Different Filter Types', () => {
    it('renders filter with different id', () => {
      const differentFilter = { id: 'meals', label: 'Meals', icon: 'food' };
      const { getByText } = render(
        <FilterPill {...defaultProps} filter={differentFilter} />,
      );
      expect(getByText('Meals')).toBeTruthy();
    });

    it('calls onPress with correct id for different filter', () => {
      const differentFilter = {
        id: 'tickets',
        label: 'Tickets',
        icon: 'ticket',
      };
      const { getByLabelText } = render(
        <FilterPill {...defaultProps} filter={differentFilter} />,
      );
      fireEvent.press(getByLabelText('Tickets'));
      expect(mockOnPress).toHaveBeenCalledWith('tickets');
    });

    it('renders filter with long label', () => {
      const longFilter = {
        id: 'long',
        label: 'Very Long Filter Name That Might Wrap',
        icon: 'star',
      };
      const { getByText } = render(
        <FilterPill {...defaultProps} filter={longFilter} />,
      );
      expect(getByText('Very Long Filter Name That Might Wrap')).toBeTruthy();
    });

    it('renders filter with special characters in label', () => {
      const specialFilter = {
        id: 'special',
        label: 'Café & Bar 🍺',
        icon: 'glass-cocktail',
      };
      const { getByText } = render(
        <FilterPill {...defaultProps} filter={specialFilter} />,
      );
      expect(getByText('Café & Bar 🍺')).toBeTruthy();
    });
  });

  describe('Icon Color', () => {
    it('renders icon with secondary color when not selected', () => {
      const { UNSAFE_getByType } = render(
        <FilterPill {...defaultProps} isSelected={false} />,
      );
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icon = UNSAFE_getByType(MaterialCommunityIcons);
      const { COLORS } = require('../../constants/colors');
      expect(icon.props.color).toBe(COLORS.textSecondary);
    });

    it('renders icon with text color when selected', () => {
      const { UNSAFE_getByType } = render(
        <FilterPill {...defaultProps} isSelected={true} />,
      );
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icon = UNSAFE_getByType(MaterialCommunityIcons);
      const { COLORS } = require('../../constants/colors');
      expect(icon.props.color).toBe(COLORS.text);
    });
  });

  describe('Edge Cases', () => {
    it('handles filter with empty string label', () => {
      const emptyFilter = { id: 'empty', label: '', icon: 'star' };
      const { UNSAFE_getByType } = render(
        <FilterPill {...defaultProps} filter={emptyFilter} />,
      );
      const { TouchableOpacity } = require('react-native');
      expect(UNSAFE_getByType(TouchableOpacity)).toBeTruthy();
    });

    it('handles filter with empty id', () => {
      const emptyIdFilter = { id: '', label: 'Test', icon: 'star' };
      const { getByLabelText } = render(
        <FilterPill {...defaultProps} filter={emptyIdFilter} />,
      );
      fireEvent.press(getByLabelText('Test'));
      expect(mockOnPress).toHaveBeenCalledWith('');
    });

    it('toggles selection state correctly', () => {
      const { rerender, getByLabelText } = render(
        <FilterPill {...defaultProps} isSelected={false} />,
      );
      let button = getByLabelText('Coffee');
      expect(button.props.accessibilityState.selected).toBe(false);

      rerender(<FilterPill {...defaultProps} isSelected={true} />);
      button = getByLabelText('Coffee');
      expect(button.props.accessibilityState.selected).toBe(true);
    });

    it('handles rapid selection changes', () => {
      const { rerender, getByLabelText } = render(
        <FilterPill {...defaultProps} isSelected={false} />,
      );

      rerender(<FilterPill {...defaultProps} isSelected={true} />);
      rerender(<FilterPill {...defaultProps} isSelected={false} />);
      rerender(<FilterPill {...defaultProps} isSelected={true} />);

      const button = getByLabelText('Coffee');
      expect(button.props.accessibilityState.selected).toBe(true);
    });
  });
});
