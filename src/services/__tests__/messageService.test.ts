/**
 * Tests for messageService
 * Verifies conversation and message operations
 */

import { messageService } from '../messageService';
import { api } from '../../utils/api';

// Mock the api module
jest.mock('../../utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('messageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should fetch conversations', async () => {
      const mockConversations = {
        conversations: [
          {
            id: 'conv-1',
            participantId: 'user-1',
            participantName: 'John',
            lastMessage: 'Hello!',
            unreadCount: 2,
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      };

      mockApi.get.mockResolvedValueOnce(mockConversations);

      const result = await messageService.getConversations();

      expect(mockApi.get).toHaveBeenCalledWith('/conversations', {
        params: undefined,
      });
      expect(result.conversations).toHaveLength(1);
      expect(result.conversations[0].participantName).toBe('John');
    });

    it('should support pagination', async () => {
      const mockConversations = {
        conversations: [],
        total: 0,
        page: 2,
        pageSize: 20,
      };

      mockApi.get.mockResolvedValueOnce(mockConversations);

      await messageService.getConversations({ page: 2, pageSize: 20 });

      expect(mockApi.get).toHaveBeenCalledWith('/conversations', {
        params: { page: 2, pageSize: 20 },
      });
    });
  });

  describe('getOrCreateConversation', () => {
    it('should create or get a conversation', async () => {
      const mockConversation = {
        conversation: {
          id: 'conv-1',
          participantId: 'user-1',
          participantName: 'John',
        },
      };

      mockApi.post.mockResolvedValueOnce(mockConversation);

      const result = await messageService.getOrCreateConversation(
        'user-1',
        'moment-1',
      );

      expect(mockApi.post).toHaveBeenCalledWith('/conversations', {
        participantId: 'user-1',
        momentId: 'moment-1',
      });
      expect(result.conversation.id).toBe('conv-1');
    });
  });

  describe('getMessages', () => {
    it('should fetch messages for a conversation', async () => {
      const mockMessages = {
        messages: [
          { id: 'msg-1', content: 'Hello!', senderId: 'user-1', type: 'text' },
          {
            id: 'msg-2',
            content: 'Hi there!',
            senderId: 'user-2',
            type: 'text',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 50,
        hasMore: false,
      };

      mockApi.get.mockResolvedValueOnce(mockMessages);

      const result = await messageService.getMessages('conv-1');

      expect(mockApi.get).toHaveBeenCalledWith(
        '/conversations/conv-1/messages',
        { params: undefined },
      );
      expect(result.messages).toHaveLength(2);
    });

    it('should support pagination', async () => {
      const mockMessages = {
        messages: [],
        total: 0,
        page: 2,
        pageSize: 50,
        hasMore: false,
      };

      mockApi.get.mockResolvedValueOnce(mockMessages);

      await messageService.getMessages('conv-1', { page: 2, before: 'msg-10' });

      expect(mockApi.get).toHaveBeenCalledWith(
        '/conversations/conv-1/messages',
        {
          params: { page: 2, before: 'msg-10' },
        },
      );
    });
  });

  describe('sendMessage', () => {
    it('should send a text message', async () => {
      const mockMessage = {
        message: {
          id: 'msg-1',
          conversationId: 'conv-1',
          content: 'Hello!',
          type: 'text',
          status: 'sent',
        },
      };

      mockApi.post.mockResolvedValueOnce(mockMessage);

      const result = await messageService.sendMessage({
        conversationId: 'conv-1',
        content: 'Hello!',
        type: 'text',
      });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/conversations/conv-1/messages',
        expect.objectContaining({
          content: 'Hello!',
          type: 'text',
        }),
      );
      expect(result.message.content).toBe('Hello!');
    });
  });

  describe('markAsRead', () => {
    it('should mark conversation as read', async () => {
      mockApi.post.mockResolvedValueOnce({ success: true });

      await messageService.markAsRead('conv-1');

      expect(mockApi.post).toHaveBeenCalledWith('/conversations/conv-1/read');
    });
  });

  describe('archiveConversation', () => {
    it('should archive a conversation', async () => {
      mockApi.post.mockResolvedValueOnce({ success: true });

      await messageService.archiveConversation('conv-1');

      expect(mockApi.post).toHaveBeenCalledWith(
        '/conversations/conv-1/archive',
      );
    });
  });
});
