/**
 * Tests for useMessages hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useMessages } from '../useMessages';
import { messageService } from '../../services/messageService';

// Mock the message service
jest.mock('../../services/messageService', () => ({
  messageService: {
    getConversations: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    markAsRead: jest.fn(),
    archiveConversation: jest.fn(),
  },
}));

const mockMessageService = messageService as jest.Mocked<typeof messageService>;

describe('useMessages', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('fetchConversations', () => {
    it('should fetch conversations and update state', async () => {
      const mockConversations = [
        { id: '1', participantId: 'u1', participantName: 'John' },
        { id: '2', participantId: 'u2', participantName: 'Jane' },
      ];

      mockMessageService.getConversations.mockResolvedValueOnce({
        conversations: mockConversations,
      } as any);

      const { result } = renderHook(() => useMessages());

      expect(result.current.conversationsLoading).toBe(true);
      expect(result.current.conversations).toEqual([]);

      await act(async () => {
        await result.current.refreshConversations();
      });

      await waitFor(() => {
        expect(result.current.conversations).toEqual(mockConversations);
        expect(result.current.conversationsLoading).toBe(false);
      });
    });

    it('should handle errors when fetching conversations', async () => {
      mockMessageService.getConversations.mockImplementation(() => {
        return Promise.reject(new Error('Network error'));
      });

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        await result.current.refreshConversations();
      });

      await waitFor(() => {
        expect(result.current.conversationsError).toBe('Network error');
        expect(result.current.conversationsLoading).toBe(false);
      });
    });
  });

  describe('loadMessages', () => {
    it('should fetch messages for a conversation', async () => {
      const mockMessages = [
        { id: 'm1', content: 'Hello', senderId: 'u1' },
        { id: 'm2', content: 'Hi', senderId: 'u2' },
      ];

      mockMessageService.getMessages.mockResolvedValueOnce({
        messages: mockMessages,
        hasMore: false,
      } as any);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        await result.current.loadMessages('conv-1');
      });

      await waitFor(() => {
        expect(result.current.messages).toEqual(mockMessages);
        expect(mockMessageService.getMessages).toHaveBeenCalledWith('conv-1', {
          page: 1,
        });
      });
    });
  });

  describe('sendMessage', () => {
    it('should send a message and add to state', async () => {
      const newMessage = { id: 'm3', content: 'New message', senderId: 'me' };

      mockMessageService.sendMessage.mockResolvedValueOnce({
        message: newMessage,
      } as any);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        await result.current.sendMessage({
          conversationId: 'conv-1',
          content: 'New message',
          type: 'text',
        });
      });

      expect(mockMessageService.sendMessage).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        content: 'New message',
        type: 'text',
      });
    });

    it('should handle send message errors', async () => {
      mockMessageService.sendMessage.mockImplementation(() => {
        return Promise.reject(new Error('Send failed'));
      });

      const { result } = renderHook(() => useMessages());

      let sentMessage = 'not-null';
      await act(async () => {
        sentMessage = await result.current.sendMessage({
          conversationId: 'conv-1',
          content: 'Test',
          type: 'text',
        });
      });

      // sendMessage returns null on error (no messagesError set)
      expect(sentMessage).toBeNull();
    });
  });

  describe('markAsRead', () => {
    it('should mark conversation as read', async () => {
      mockMessageService.markAsRead.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        await result.current.markAsRead('conv-1');
      });

      expect(mockMessageService.markAsRead).toHaveBeenCalledWith('conv-1');
    });
  });

  describe('archiveConversation', () => {
    it('should archive a conversation', async () => {
      const mockConversations = [
        { id: 'conv-1', participantId: 'u1', participantName: 'John' },
        { id: 'conv-2', participantId: 'u2', participantName: 'Jane' },
      ];

      mockMessageService.getConversations.mockResolvedValueOnce({
        conversations: mockConversations,
      } as any);
      mockMessageService.archiveConversation.mockResolvedValueOnce({
        success: true,
      });

      const { result } = renderHook(() => useMessages());

      // First fetch conversations
      await act(async () => {
        await result.current.refreshConversations();
      });

      // Then archive one
      await act(async () => {
        await result.current.archiveConversation('conv-1');
      });

      expect(mockMessageService.archiveConversation).toHaveBeenCalledWith(
        'conv-1',
      );
    });
  });
});
