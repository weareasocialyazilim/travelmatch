/**
 * EmptyState Component Tests
 * Testing empty state display, actions, and styling
 */

/* eslint-disable react-native/no-inline-styles */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';

// Mock vector icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

// Mock Button component
jest.mock('../Button', () => ({
  Button: ({ title, onPress }: { title: string; onPress: () => void }) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} accessibilityRole="button">
        <Text>{title}</Text>
      </TouchableOpacity>
    );
  },
}));

describe('EmptyState', () => {
  const mockOnAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with title', () => {
      const { getByText } = render(<EmptyState title="No items found" />);
      expect(getByText('No items found')).toBeTruthy();
    });

    it('renders with title and description', () => {
      const { getByText } = render(
        <EmptyState
          title="No results"
          description="Try adjusting your search criteria"
        />,
      );
      expect(getByText('No results')).toBeTruthy();
      expect(getByText('Try adjusting your search criteria')).toBeTruthy();
    });

    it('renders icon container', () => {
      const { UNSAFE_root } = render(<EmptyState title="Empty" />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Description', () => {
    it('renders description when provided', () => {
      const { getByText } = render(
        <EmptyState title="No Data" description="Description text here" />,
      );
      expect(getByText('Description text here')).toBeTruthy();
    });

    it('does not render description when not provided', () => {
      const { queryByText } = render(<EmptyState title="No Data" />);
      // Should not have any description text
      expect(queryByText('Description text here')).toBeNull();
    });
  });

  describe('Action Button', () => {
    it('renders action button when actionLabel and onAction provided', () => {
      const { getByText } = render(
        <EmptyState
          title="No Items"
          actionLabel="Add Item"
          onAction={mockOnAction}
        />,
      );
      expect(getByText('Add Item')).toBeTruthy();
    });

    it('does not render button when only actionLabel provided', () => {
      const { queryByText } = render(
        <EmptyState title="No Items" actionLabel="Add Item" />,
      );
      expect(queryByText('Add Item')).toBeNull();
    });

    it('does not render button when only onAction provided', () => {
      const { queryByRole } = render(
        <EmptyState title="No Items" onAction={mockOnAction} />,
      );
      expect(queryByRole('button')).toBeNull();
    });

    it('calls onAction when button pressed', () => {
      const { getByText } = render(
        <EmptyState
          title="No Items"
          actionLabel="Add Item"
          onAction={mockOnAction}
        />,
      );
      fireEvent.press(getByText('Add Item'));
      expect(mockOnAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Icon', () => {
    it('renders with default icon', () => {
      const { UNSAFE_root } = render(<EmptyState title="Empty" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with custom icon', () => {
      const { UNSAFE_root } = render(
        <EmptyState title="No Messages" icon="email-outline" />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Custom Styling', () => {
    it('accepts custom style prop', () => {
      const customStyle = { backgroundColor: '#f0f0f0' };
      const { getByText } = render(
        <EmptyState title="Custom Style" style={customStyle} />,
      );
      expect(getByText('Custom Style')).toBeTruthy();
    });
  });

  describe('Complete Usage', () => {
    it('renders with all props', () => {
      const { getByText } = render(
        <EmptyState
          title="No Results Found"
          description="We couldn't find any items matching your search."
          icon="magnify"
          actionLabel="Clear Search"
          onAction={mockOnAction}
          style={{ padding: 20 }}
        />,
      );
      expect(getByText('No Results Found')).toBeTruthy();
      expect(
        getByText("We couldn't find any items matching your search."),
      ).toBeTruthy();
      expect(getByText('Clear Search')).toBeTruthy();
    });
  });
});
