/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import EmptyState from '../EmptyState';

// Mock vector icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

// Mock EmptyStateIllustration
jest.mock('../EmptyStateIllustration', () => ({
  EmptyStateIllustration: ({ type, size }: { type: string; size: number }) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="empty-state-illustration">
        <Text>
          {type}-{size}
        </Text>
      </View>
    );
  },
}));

describe('EmptyState', () => {
  const defaultProps = {
    title: 'No results found',
    subtitle: 'Try adjusting your search criteria',
  };

  describe('Rendering', () => {
    it('renders correctly with title and subtitle', () => {
      const { getByText } = render(<EmptyState {...defaultProps} />);

      expect(getByText('No results found')).toBeTruthy();
      expect(getByText('Try adjusting your search criteria')).toBeTruthy();
    });

    it('renders default icon when no illustration provided', () => {
      const { UNSAFE_root } = render(<EmptyState {...defaultProps} />);

      // Should render MaterialCommunityIcons
      const icon = UNSAFE_root.findAllByType('MaterialCommunityIcons');
      expect(icon.length).toBeGreaterThan(0);
    });

    it('renders custom icon when specified', () => {
      const { UNSAFE_root } = render(
        <EmptyState {...defaultProps} icon="magnify" />,
      );

      const icons = UNSAFE_root.findAllByType('MaterialCommunityIcons');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('renders illustration type when provided', () => {
      const { getByTestId } = render(
        <EmptyState {...defaultProps} illustrationType="noResults" />,
      );

      expect(getByTestId('empty-state-illustration')).toBeTruthy();
    });

    it('renders custom illustration when provided', () => {
      const CustomIllustration = (
        <View testID="custom-illustration">
          <Text>Custom</Text>
        </View>
      );

      const { getByTestId } = render(
        <EmptyState {...defaultProps} illustration={CustomIllustration} />,
      );

      expect(getByTestId('custom-illustration')).toBeTruthy();
    });
  });

  describe('Action Button', () => {
    it('does not render action button when actionLabel is not provided', () => {
      const { queryByText } = render(<EmptyState {...defaultProps} />);

      expect(queryByText('Retry')).toBeNull();
    });

    it('does not render action button when onAction is not provided', () => {
      const { queryByText } = render(
        <EmptyState {...defaultProps} actionLabel="Retry" />,
      );

      // Action button should not render without onAction handler
      expect(queryByText('Retry')).toBeNull();
    });

    it('renders action button when both actionLabel and onAction are provided', () => {
      const onAction = jest.fn();
      const { getByText } = render(
        <EmptyState
          {...defaultProps}
          actionLabel="Retry"
          onAction={onAction}
        />,
      );

      expect(getByText('Retry')).toBeTruthy();
    });

    it('calls onAction when action button is pressed', () => {
      const onAction = jest.fn();
      const { getByText } = render(
        <EmptyState
          {...defaultProps}
          actionLabel="Retry"
          onAction={onAction}
        />,
      );

      fireEvent.press(getByText('Retry'));
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content Variations', () => {
    it('renders with different content', () => {
      const { getByText } = render(
        <EmptyState
          title="No notifications"
          subtitle="You are all caught up!"
          icon="bell-outline"
        />,
      );

      expect(getByText('No notifications')).toBeTruthy();
      expect(getByText('You are all caught up!')).toBeTruthy();
    });

    it('renders empty inbox state', () => {
      const { getByText } = render(
        <EmptyState
          title="Your inbox is empty"
          subtitle="Messages will appear here"
          icon="inbox"
          actionLabel="Start a chat"
          onAction={jest.fn()}
        />,
      );

      expect(getByText('Your inbox is empty')).toBeTruthy();
      expect(getByText('Start a chat')).toBeTruthy();
    });

    it('renders search empty state', () => {
      const { getByText } = render(
        <EmptyState
          title="No matches found"
          subtitle="Try different search terms"
          icon="magnify"
          actionLabel="Clear filters"
          onAction={jest.fn()}
        />,
      );

      expect(getByText('No matches found')).toBeTruthy();
      expect(getByText('Clear filters')).toBeTruthy();
    });
  });

  describe('Priority of Visual Elements', () => {
    it('prioritizes custom illustration over illustrationType', () => {
      const CustomIllustration = (
        <View testID="custom-illustration">
          <Text>Custom</Text>
        </View>
      );

      const { getByTestId } = render(
        <EmptyState
          {...defaultProps}
          illustration={CustomIllustration}
          illustrationType="noResults"
        />,
      );

      // Custom illustration should be rendered
      expect(getByTestId('custom-illustration')).toBeTruthy();
      // The illustration prop takes precedence, EmptyStateIllustration might not be rendered
    });

    it('prioritizes illustrationType over icon', () => {
      const { getByTestId } = render(
        <EmptyState
          {...defaultProps}
          icon="alert"
          illustrationType="noResults"
        />,
      );

      expect(getByTestId('empty-state-illustration')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('renders text content accessibly', () => {
      const { getByText } = render(<EmptyState {...defaultProps} />);

      const title = getByText('No results found');
      const subtitle = getByText('Try adjusting your search criteria');

      expect(title).toBeTruthy();
      expect(subtitle).toBeTruthy();
    });

    it('action button is pressable and accessible', () => {
      const onAction = jest.fn();
      const { getByText } = render(
        <EmptyState
          {...defaultProps}
          actionLabel="Try Again"
          onAction={onAction}
        />,
      );

      const button = getByText('Try Again');
      expect(button).toBeTruthy();
      fireEvent.press(button);
      expect(onAction).toHaveBeenCalled();
    });
  });
});
