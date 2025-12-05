/**
 * MessagesScreen Tests
 * Testing messages/conversations screen functionality
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MessagesScreen from '../MessagesScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock expo icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

// Mock expo haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
}));

// Mock BottomNav
jest.mock('../../components/BottomNav', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require('react-native');
  const MockBottomNav = () => <View testID="bottom-nav" />;
  MockBottomNav.displayName = 'MockBottomNav';
  return MockBottomNav;
});

// Mock components
jest.mock('../../components', () => ({
  MessagesListSkeleton: () => null,
  ErrorState: ({
    message,
    onRetry,
  }: {
    message: string;
    onRetry?: () => void;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Text, TouchableOpacity, View } = require('react-native');
    return (
      <View testID="error-state">
        <Text>{message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} testID="retry-button">
            <Text>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
}));

// Mock AnimatedComponents
jest.mock('../../components/AnimatedComponents', () => ({
  FadeInView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock messages hook
jest.mock('../../hooks/useMessages', () => ({
  useMessages: () => ({
    conversations: [
      {
        id: 'conv1',
        participantId: 'user1',
        participantName: 'John Doe',
        participantAvatar: 'https://example.com/avatar1.jpg',
        participantVerified: true,
        lastMessage: 'Hey, how are you?',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 2,
      },
      {
        id: 'conv2',
        participantId: 'user2',
        participantName: 'Jane Smith',
        participantAvatar: 'https://example.com/avatar2.jpg',
        participantVerified: false,
        lastMessage: 'See you tomorrow!',
        lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 0,
      },
    ],
    conversationsLoading: false,
    conversationsError: null,
    refreshConversations: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Mock realtime context
const mockIsUserOnline = jest.fn().mockReturnValue(true);
jest.mock('../../context/RealtimeContext', () => ({
  useRealtime: () => ({
    isUserOnline: mockIsUserOnline,
  }),
  useRealtimeEvent: jest.fn(),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock constants
jest.mock('../../constants/colors', () => ({
  COLORS: {
    background: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    primary: '#3B82F6',
    white: '#FFFFFF',
    border: '#E5E5E5',
    mint: '#10B981',
    error: '#EF4444',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
    },
  },
}));

describe('MessagesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly', () => {
      const { getByTestId } = render(<MessagesScreen />);

      expect(getByTestId('bottom-nav')).toBeTruthy();
    });

    it('renders search input', () => {
      const { getByPlaceholderText } = render(<MessagesScreen />);

      expect(getByPlaceholderText('Search conversations...')).toBeTruthy();
    });

    it('renders conversation list', () => {
      const { getByText } = render(<MessagesScreen />);

      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Jane Smith')).toBeTruthy();
    });

    it('shows unread badge for conversations with unread messages', () => {
      const { getByText } = render(<MessagesScreen />);

      expect(getByText('2')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to chat screen when conversation is pressed', () => {
      const { getByText } = render(<MessagesScreen />);

      const conversation = getByText('John Doe');
      fireEvent.press(conversation);

      expect(mockNavigate).toHaveBeenCalledWith(
        'Chat',
        expect.objectContaining({
          conversationId: 'conv1',
        }),
      );
    });
  });

  describe('Search', () => {
    it('renders search input', () => {
      const { getByPlaceholderText } = render(<MessagesScreen />);

      expect(getByPlaceholderText('Search conversations...')).toBeTruthy();
    });

    it('filters conversations when searching', () => {
      const { getByPlaceholderText, queryByText } = render(<MessagesScreen />);

      const searchInput = getByPlaceholderText('Search conversations...');
      fireEvent.changeText(searchInput, 'John');

      // John should still be visible
      expect(queryByText('John Doe')).toBeTruthy();
    });
  });

  describe('Online Status', () => {
    it('shows online indicator for online users', () => {
      mockIsUserOnline.mockReturnValue(true);
      render(<MessagesScreen />);

      // Online indicator should be shown
      expect(mockIsUserOnline).toHaveBeenCalled();
    });
  });
});
