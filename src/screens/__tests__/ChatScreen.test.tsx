/**
 * ChatScreen Tests
 * Testing chat/messaging functionality
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import ChatScreen from '../ChatScreen';

// Mock route params
const mockRoute = {
  params: {
    otherUser: {
      id: 'user1',
      name: 'John Doe',
      avatar: 'https://example.com/avatar.jpg',
    },
    conversationId: 'conv1',
  },
};

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useRoute: () => mockRoute,
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    setOptions: jest.fn(),
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

// Mock performance hook
jest.mock('../../hooks/useScreenPerformance', () => ({
  useScreenPerformance: () => ({
    trackMount: jest.fn(),
    trackInteraction: jest.fn(),
  }),
}));

// Mock messages hook
const mockSendMessage = jest.fn();
const mockLoadMessages = jest.fn();
jest.mock('../../hooks/useMessages', () => ({
  useMessages: () => ({
    messages: [
      {
        id: 'msg1',
        type: 'text',
        text: 'Hello!',
        user: 'other',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'msg2',
        type: 'text',
        text: 'Hi there!',
        user: 'me',
        timestamp: new Date().toISOString(),
      },
    ],
    messagesLoading: false,
    sendMessage: mockSendMessage,
    loadMessages: mockLoadMessages,
  }),
}));

// Mock realtime context
jest.mock('../../context/RealtimeContext', () => ({
  useTypingIndicator: () => ({
    typingUserIds: [],
    isAnyoneTyping: false,
    startTyping: jest.fn(),
    stopTyping: jest.fn(),
  }),
}));

// Mock bottom sheets
jest.mock('../../components/ChatAttachmentBottomSheet', () => ({
  ChatAttachmentBottomSheet: () => null,
}));

jest.mock('../../components/ReportBlockBottomSheet', () => ({
  ReportBlockBottomSheet: () => null,
}));

// Mock list optimization
jest.mock('../../utils/listOptimization', () => ({
  CHAT_LIST_CONFIG: {
    initialNumToRender: 15,
    maxToRenderPerBatch: 10,
    windowSize: 10,
  },
  ITEM_HEIGHTS: { chatMessage: 60 },
  createGetItemLayout: jest.fn(() => () => ({
    length: 60,
    offset: 0,
    index: 0,
  })),
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
    overlay30: 'rgba(0,0,0,0.3)',
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

describe('ChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly', () => {
      const { getByText } = render(<ChatScreen />);

      expect(getByText('John Doe')).toBeTruthy();
    });

    it('displays chat content', () => {
      const { getByText } = render(<ChatScreen />);

      // Check for actual content in the screen
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Traveler')).toBeTruthy();
    });

    it('renders message input', () => {
      const { getByPlaceholderText } = render(<ChatScreen />);

      expect(
        getByPlaceholderText('Thank them or ask a question...'),
      ).toBeTruthy();
    });
  });

  describe('Messaging', () => {
    it('loads messages on mount', () => {
      render(<ChatScreen />);

      expect(mockLoadMessages).toHaveBeenCalledWith('conv1');
    });
  });
});
