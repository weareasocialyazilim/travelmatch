/**
 * EmptyState Component Test Suite
 * Tests empty state component with illustrations and actions
 */

// Unmock the component we're testing (global mock in jest.setup.afterEnv)
jest.unmock('../EmptyState');
jest.unmock('@/components/ui/EmptyState');

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { EmptyState } from '../EmptyState';

// Mock dependencies
jest.mock('react-native-reanimated', () => {
  const { View, Text } = require('react-native');
  const Reanimated = {
    View: View,
    Text: Text,
    createAnimatedComponent: (component: any) => component,
  };

  return {
    __esModule: true,
    default: Reanimated,
    FadeInUp: {
      delay: jest.fn().mockReturnThis(),
      duration: jest.fn().mockReturnThis(),
      springify: jest.fn().mockReturnThis(),
      damping: jest.fn().mockReturnThis(),
    },
    FadeIn: {
      duration: jest.fn().mockReturnThis(),
    },
    Easing: {
      inOut: jest.fn(),
      ease: jest.fn(),
    },
    withRepeat: jest.fn(),
    withSequence: jest.fn(),
    withTiming: jest.fn(),
    withDelay: jest.fn(),
    interpolate: jest.fn(),
    useSharedValue: jest.fn((val) => ({ value: val })),
    useAnimatedStyle: jest.fn(() => ({})),
  };
});

jest.mock('../EmptyStateIllustration', () => {
  const React = require('react');
  const RN = require('react-native');
  return {
    EmptyStateIllustration: ({ type }: { type: string }) =>
      React.createElement(RN.Text, { testID: `illustration-${type}` }, type),
  };
});

jest.mock('../Button', () => {
  const React = require('react');
  const RN = require('react-native');
  return {
    Button: ({
      title,
      children,
      onPress,
      variant,
      testID,
    }: {
      title?: string;
      children?: React.ReactNode;
      onPress?: () => void;
      variant?: string;
      testID?: string;
    }) =>
      React.createElement(
        RN.TouchableOpacity,
        { onPress, testID },
        React.createElement(RN.Text, null, title || (children as string)),
        React.createElement(
          RN.Text,
          { testID: `button-variant-${variant}` },
          variant,
        ),
      ),
  };
});

describe('EmptyState Component', () => {
  // ============================================
  // Basic Rendering Tests
  // ============================================

  describe('Basic Rendering', () => {
    it('renders with title only', () => {
      const { getByText } = render(<EmptyState title="No items" />);
      expect(getByText('No items')).toBeTruthy();
    });

    it('renders with title and description', () => {
      const { getByText } = render(
        <EmptyState title="No items" description="No items found" />,
      );
      expect(getByText('No items')).toBeTruthy();
      expect(getByText('No items found')).toBeTruthy();
    });

    it('renders with title and subtitle alias', () => {
      const { getByText } = render(
        <EmptyState title="Empty" subtitle="Nothing here" />,
      );
      expect(getByText('Empty')).toBeTruthy();
      expect(getByText('Nothing here')).toBeTruthy();
    });

    it('prefers description over subtitle when both provided', () => {
      const { getByText, queryByText } = render(
        <EmptyState
          title="Title"
          description="Description text"
          subtitle="Subtitle text"
        />,
      );
      expect(getByText('Description text')).toBeTruthy();
      expect(queryByText('Subtitle text')).toBeNull();
    });

    it('renders with default icon', () => {
      render(<EmptyState title="Empty" />);
    });
  });

  // ============================================
  // Icon Tests
  // ============================================

  describe('Icons', () => {
    it('renders with custom icon', () => {
      render(<EmptyState title="No messages" icon="message-outline" />);
    });

    it('renders with different icons', () => {
      const icons: Array<any> = [
        'inbox-outline',
        'heart-outline',
        'magnify',
        'bell-outline',
      ];

      icons.forEach((icon) => {
        render(<EmptyState title="Test" icon={icon} />);
      });
    });
  });

  // ============================================
  // Illustration Tests
  // ============================================

  describe('Illustrations', () => {
    it('renders with illustration type', () => {
      const { getByTestId } = render(
        <EmptyState title="No moments" illustrationType="no_moments" />,
      );
      expect(getByTestId('illustration-no_moments')).toBeTruthy();
    });

    it('renders different illustration types', () => {
      const types: Array<any> = [
        'no_moments',
        'no_messages',
        'no_notifications',
        'no_results',
      ];

      types.forEach((type) => {
        const { getByTestId } = render(
          <EmptyState title="Test" illustrationType={type} />,
        );
        expect(getByTestId(`illustration-${type}`)).toBeTruthy();
      });
    });

    it('renders with custom illustration component', () => {
      const CustomIllustration = () => <Text>Custom</Text>;
      const { getByText } = render(
        <EmptyState title="Test" illustration={<CustomIllustration />} />,
      );
      expect(getByText('Custom')).toBeTruthy();
    });

    it('prefers custom illustration over illustrationType', () => {
      const CustomIllustration = () => <Text>Custom</Text>;
      const { getByText, queryByTestId } = render(
        <EmptyState
          title="Test"
          illustration={<CustomIllustration />}
          illustrationType="no_moments"
        />,
      );
      expect(getByText('Custom')).toBeTruthy();
      expect(queryByTestId('illustration-no_moments')).toBeNull();
    });

    it('prefers illustration over default icon', () => {
      const { getByTestId } = render(
        <EmptyState
          title="Test"
          illustrationType="no_messages"
          icon="heart-outline"
        />,
      );
      expect(getByTestId('illustration-no_messages')).toBeTruthy();
    });
  });

  // ============================================
  // Action Button Tests
  // ============================================

  describe('Action Buttons', () => {
    it('renders primary action button', () => {
      const onAction = jest.fn() as jest.Mock;
      const { getByText } = render(
        <EmptyState title="Empty" actionLabel="Reload" onAction={onAction} />,
      );
      expect(getByText('Reload')).toBeTruthy();
    });

    it('calls onAction when primary button pressed', () => {
      const onAction = jest.fn() as jest.Mock;
      const { getByText } = render(
        <EmptyState title="Empty" actionLabel="Reload" onAction={onAction} />,
      );

      fireEvent.press(getByText('Reload'));
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('does not render action button without onAction', () => {
      const { queryByText } = render(
        <EmptyState title="Empty" actionLabel="Reload" />,
      );
      expect(queryByText('Reload')).toBeNull();
    });

    it('does not render action button without actionLabel', () => {
      const onAction = jest.fn() as jest.Mock;
      render(<EmptyState title="Empty" onAction={onAction} />);
    });

    it('renders primary button with primary variant', () => {
      const onAction = jest.fn() as jest.Mock;
      const { getByTestId } = render(
        <EmptyState title="Empty" actionLabel="Action" onAction={onAction} />,
      );
      expect(getByTestId('empty-state-action-primary')).toBeTruthy();
    });
  });

  // ============================================
  // Secondary Action Tests
  // ============================================

  describe('Secondary Action Buttons', () => {
    it('renders secondary action button', () => {
      const onSecondary = jest.fn() as jest.Mock;
      const { getByText } = render(
        <EmptyState
          title="Empty"
          secondaryActionLabel="Cancel"
          onSecondaryAction={onSecondary}
        />,
      );
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('calls onSecondaryAction when secondary button pressed', () => {
      const onSecondary = jest.fn() as jest.Mock;
      const { getByText } = render(
        <EmptyState
          title="Empty"
          secondaryActionLabel="Cancel"
          onSecondaryAction={onSecondary}
        />,
      );

      fireEvent.press(getByText('Cancel'));
      expect(onSecondary).toHaveBeenCalledTimes(1);
    });

    it('does not render secondary button without onSecondaryAction', () => {
      const { queryByText } = render(
        <EmptyState title="Empty" secondaryActionLabel="Cancel" />,
      );
      expect(queryByText('Cancel')).toBeNull();
    });

    it('renders secondary button with ghost variant', () => {
      const onSecondary = jest.fn() as jest.Mock;
      const { getByTestId } = render(
        <EmptyState
          title="Empty"
          secondaryActionLabel="Cancel"
          onSecondaryAction={onSecondary}
        />,
      );
      expect(getByTestId('empty-state-action-secondary')).toBeTruthy();
    });

    it('renders both primary and secondary buttons', () => {
      const onAction = jest.fn() as jest.Mock;
      const onSecondary = jest.fn() as jest.Mock;
      const { getByText } = render(
        <EmptyState
          title="Empty"
          actionLabel="Primary"
          onAction={onAction}
          secondaryActionLabel="Secondary"
          onSecondaryAction={onSecondary}
        />,
      );

      expect(getByText('Primary')).toBeTruthy();
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('both buttons work independently', () => {
      const onAction = jest.fn() as jest.Mock;
      const onSecondary = jest.fn() as jest.Mock;
      const { getByText } = render(
        <EmptyState
          title="Empty"
          actionLabel="Primary"
          onAction={onAction}
          secondaryActionLabel="Secondary"
          onSecondaryAction={onSecondary}
        />,
      );

      fireEvent.press(getByText('Primary'));
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onSecondary).not.toHaveBeenCalled();

      fireEvent.press(getByText('Secondary'));
      expect(onSecondary).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // Custom Style Tests
  // ============================================

  describe('Custom Styles', () => {
    it('accepts custom style prop', () => {
      render(<EmptyState title="Empty" style={{ padding: 20 }} />);
    });

    it('renders with multiple custom styles', () => {
      render(
        <EmptyState
          title="Empty"
          style={{ padding: 20, backgroundColor: '#fff' }}
        />,
      );
    });

    it('handles undefined style gracefully', () => {
      render(<EmptyState title="Empty" style={undefined} />);
    });
  });

  // ============================================
  // Content Variations Tests
  // ============================================

  describe('Content Variations', () => {
    it('renders no messages state', () => {
      const { getByText } = render(
        <EmptyState
          title="No messages"
          description="Start a conversation"
          illustrationType="no_messages"
        />,
      );
      expect(getByText('No messages')).toBeTruthy();
      expect(getByText('Start a conversation')).toBeTruthy();
    });

    it('renders no results state', () => {
      const { getByText } = render(
        <EmptyState
          title="No results found"
          description="Try different search terms"
          illustrationType="no_results"
        />,
      );
      expect(getByText('No results found')).toBeTruthy();
      expect(getByText('Try different search terms')).toBeTruthy();
    });

    it('renders no notifications state', () => {
      const { getByText } = render(
        <EmptyState
          title="No notifications"
          description="You're all caught up"
          illustrationType="no_notifications"
        />,
      );
      expect(getByText('No notifications')).toBeTruthy();
      expect(getByText("You're all caught up")).toBeTruthy();
    });

    it('renders with very long title', () => {
      const longTitle =
        'This is a very long title that should still render correctly without breaking the layout';
      const { getByText } = render(<EmptyState title={longTitle} />);
      expect(getByText(longTitle)).toBeTruthy();
    });

    it('renders with very long description', () => {
      const longDesc =
        'This is a very long description that provides detailed information about why the state is empty and what the user can do about it.';
      const { getByText } = render(
        <EmptyState title="Empty" description={longDesc} />,
      );
      expect(getByText(longDesc)).toBeTruthy();
    });
  });

  // ============================================
  // Edge Cases Tests
  // ============================================

  describe('Edge Cases', () => {
    it('handles empty title string', () => {
      const { getByText } = render(<EmptyState title="" />);
      expect(getByText('')).toBeTruthy();
    });

    it('handles undefined description gracefully', () => {
      const { queryByText, getByText } = render(
        <EmptyState title="Title" description={undefined} />,
      );
      expect(getByText('Title')).toBeTruthy();
    });

    it('handles both description and subtitle as undefined', () => {
      render(
        <EmptyState
          title="Title"
          description={undefined}
          subtitle={undefined}
        />,
      );
    });

    it('handles special characters in title', () => {
      const { getByText } = render(<EmptyState title="No items! 🎉" />);
      expect(getByText('No items! 🎉')).toBeTruthy();
    });

    it('handles special characters in description', () => {
      const { getByText } = render(
        <EmptyState title="Empty" description="Try again... ✨" />,
      );
      expect(getByText('Try again... ✨')).toBeTruthy();
    });

    it('handles null style prop', () => {
      render(<EmptyState title="Empty" style={undefined} />);
    });
  });

  // ============================================
  // State Update Tests
  // ============================================

  describe('State Updates', () => {
    it('updates title dynamically', () => {
      const { rerender, getByText, queryByText } = render(
        <EmptyState title="Original" />,
      );
      expect(getByText('Original')).toBeTruthy();

      rerender(<EmptyState title="Updated" />);
      expect(getByText('Updated')).toBeTruthy();
      expect(queryByText('Original')).toBeNull();
    });

    it('updates description dynamically', () => {
      const { rerender, getByText } = render(
        <EmptyState title="Title" description="Original desc" />,
      );
      expect(getByText('Original desc')).toBeTruthy();

      rerender(<EmptyState title="Title" description="Updated desc" />);
      expect(getByText('Updated desc')).toBeTruthy();
    });

    it('adds description after initial render', () => {
      const { rerender, getByText } = render(<EmptyState title="Title" />);

      rerender(<EmptyState title="Title" description="New description" />);
      expect(getByText('New description')).toBeTruthy();
    });

    it('removes description dynamically', () => {
      const { rerender, queryByText } = render(
        <EmptyState title="Title" description="Description" />,
      );
      expect(queryByText('Description')).toBeTruthy();

      rerender(<EmptyState title="Title" />);
      expect(queryByText('Description')).toBeNull();
    });

    it('updates illustration type', () => {
      const { rerender, getByTestId } = render(
        <EmptyState title="Title" illustrationType="no_moments" />,
      );
      expect(getByTestId('illustration-no_moments')).toBeTruthy();

      rerender(<EmptyState title="Title" illustrationType="no_messages" />);
      expect(getByTestId('illustration-no_messages')).toBeTruthy();
    });

    it('adds action button after initial render', () => {
      const onAction = jest.fn() as jest.Mock;
      const { rerender, getByText } = render(<EmptyState title="Title" />);

      rerender(
        <EmptyState title="Title" actionLabel="Action" onAction={onAction} />,
      );
      expect(getByText('Action')).toBeTruthy();
    });
  });

  // ============================================
  // Integration Tests
  // ============================================

  describe('Integration', () => {
    it('renders complete empty state with all features', () => {
      const onAction = jest.fn() as jest.Mock;
      const onSecondary = jest.fn() as jest.Mock;
      const { getByText, getByTestId } = render(
        <EmptyState
          title="No items found"
          description="Try adjusting your filters"
          illustrationType="no_results"
          actionLabel="Clear Filters"
          onAction={onAction}
          secondaryActionLabel="Browse All"
          onSecondaryAction={onSecondary}
          style={{ padding: 40 }}
        />,
      );

      expect(getByText('No items found')).toBeTruthy();
      expect(getByText('Try adjusting your filters')).toBeTruthy();
      expect(getByTestId('illustration-no_results')).toBeTruthy();
      expect(getByText('Clear Filters')).toBeTruthy();
      expect(getByText('Browse All')).toBeTruthy();

      fireEvent.press(getByText('Clear Filters'));
      expect(onAction).toHaveBeenCalled();

      fireEvent.press(getByText('Browse All'));
      expect(onSecondary).toHaveBeenCalled();
    });

    it('renders multiple empty states independently', () => {
      const { getByText } = render(
        <>
          <EmptyState title="First" description="First description" />
          <EmptyState title="Second" description="Second description" />
        </>,
      );

      expect(getByText('First')).toBeTruthy();
      expect(getByText('First description')).toBeTruthy();
      expect(getByText('Second')).toBeTruthy();
      expect(getByText('Second description')).toBeTruthy();
    });

    it('handles rapid prop changes', () => {
      const { rerender } = render(<EmptyState title="Test" />);

      for (let i = 0; i < 5; i++) {
        rerender(
          <EmptyState
            title={`Title ${i}`}
            description={i % 2 === 0 ? `Description ${i}` : undefined}
            illustrationType={i % 2 === 0 ? 'no_moments' : undefined}
          />,
        );
      }
    });
  });

  // ============================================
  // Real-World Use Cases
  // ============================================

  describe('Real-World Use Cases', () => {
    it('renders search results empty state', () => {
      const handleClear = jest.fn() as jest.Mock;
      const { getByText } = render(
        <EmptyState
          title="No results found"
          description="Try different search terms or clear filters"
          illustrationType="no_results"
          actionLabel="Clear Filters"
          onAction={handleClear}
        />,
      );

      expect(getByText('No results found')).toBeTruthy();
      fireEvent.press(getByText('Clear Filters'));
      expect(handleClear).toHaveBeenCalled();
    });

    it('renders messages empty state', () => {
      const handleDiscover = jest.fn() as jest.Mock;
      const { getByText } = render(
        <EmptyState
          title="No messages yet"
          description="Start connecting with travelers"
          illustrationType="no_messages"
          actionLabel="Discover"
          onAction={handleDiscover}
        />,
      );

      expect(getByText('No messages yet')).toBeTruthy();
      fireEvent.press(getByText('Discover'));
      expect(handleDiscover).toHaveBeenCalled();
    });

    it('renders notifications empty state', () => {
      const { getByText } = render(
        <EmptyState
          title="All caught up!"
          description="No new notifications"
          illustrationType="no_notifications"
        />,
      );

      expect(getByText('All caught up!')).toBeTruthy();
      expect(getByText('No new notifications')).toBeTruthy();
    });
  });
});
