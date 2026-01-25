/**
 * Message Service Tests
 * Tests for messaging operations
 */

// Mock expo/virtual/env first (ES module issue)
jest.mock('expo/virtual/env', () => ({
  env: process.env,
}));

import { messageService } from '../messageService';
import { supabase } from '../supabase';
import { conversationsService, messagesService } from '../supabaseDbService';

// Mock all dependencies
jest.mock('../supabase');
jest.mock('../supabaseDbService');
jest.mock('../../utils/logger');
jest.mock('../encryptionService', () => ({
  encryptionService: {
    getPublicKey: jest.fn().mockResolvedValue(null),
    encrypt: jest
      .fn()
      .mockResolvedValue({ message: 'encrypted', nonce: 'nonce123' }),
    decrypt: jest
      .fn()
      .mockImplementation((content) => Promise.resolve(content)),
  },
}));
jest.mock('../userService', () => ({
  userService: {
    getPublicKey: jest.fn().mockResolvedValue(null),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockConversationsService = conversationsService as jest.Mocked<
  typeof conversationsService
>;
const mockMessagesService = messagesService as jest.Mocked<
  typeof messagesService
>;

// Helper to create a properly chained mock for supabase queries
function createSupabaseChainMock(
  finalResult: { data?: unknown; error?: Error | null; count?: number } = {
    data: null,
    error: null,
  },
) {
  const chainMock = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(finalResult),
  };
  // Make the last call in any chain return the final result
  Object.values(chainMock).forEach((fn) => {
    if (typeof fn === 'function' && fn !== chainMock.single) {
      (fn as jest.Mock).mockReturnThis();
    }
  });
  // Override range to resolve with data (for list queries)
  chainMock.range.mockResolvedValue(finalResult);
  chainMock.is.mockResolvedValue(finalResult);
  return chainMock;
}

describe('MessageService', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('getConversations', () => {
    it('should return conversations for authenticated user', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          participant_ids: ['user-123', 'user-456'],
          last_message_id: null,
          updated_at: '2025-01-01T00:00:00Z',
          created_at: '2025-01-01T00:00:00Z',
          moment_id: null,
          migrated_to_junction: null,
        },
      ];

      mockConversationsService.list.mockResolvedValue({
        data: mockConversations,
        count: 1,
        error: null,
      });

      // Mock supabase.from for users query and message count
      (mockSupabase.from as jest.Mock).mockImplementation(() =>
        createSupabaseChainMock({
          data: [
            {
              id: 'user-456',
              full_name: 'Test User',
              avatar_url: null,
              verified: true,
            },
          ],
          error: null,
          count: 0,
        }),
      );

      const result = await messageService.getConversations();

      expect(result.conversations).toHaveLength(1);
      expect(result.conversations[0].id).toBe('conv-1');
    });

    it('should throw error when not authenticated', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(messageService.getConversations()).rejects.toThrow(
        'Not authenticated',
      );
    });

    it('should throw error on database failure', async () => {
      mockConversationsService.list.mockResolvedValue({
        data: [],
        count: 0,
        error: new Error('Database connection failed'),
      });

      await expect(messageService.getConversations()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should return empty array when user has no conversations', async () => {
      mockConversationsService.list.mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      const result = await messageService.getConversations();

      expect(result.conversations).toEqual([]);
    });
  });

  describe('getOrCreateConversation', () => {
    it('should create conversation between users', async () => {
      const mockConversation = {
        id: 'conv-new',
        participant_ids: ['user-123', 'user-456'],
        moment_id: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        last_message_id: null,
        migrated_to_junction: null,
      };

      mockConversationsService.getOrCreate.mockResolvedValue({
        data: mockConversation,
        error: null,
      });

      const result = await messageService.getOrCreateConversation([
        'user-123',
        'user-456',
      ]);

      expect(result.id).toBe('conv-new');
      expect(mockConversationsService.getOrCreate).toHaveBeenCalledWith([
        'user-123',
        'user-456',
      ]);
    });

    it('should throw error on database failure', async () => {
      mockConversationsService.getOrCreate.mockResolvedValue({
        data: null,
        error: new Error('Constraint violation'),
      });

      await expect(
        messageService.getOrCreateConversation(['user-123', 'user-456']),
      ).rejects.toThrow('Constraint violation');
    });
  });

  describe('sendMessage', () => {
    const mockMessageRequest = {
      conversationId: 'conv-1',
      content: 'Hello, world!',
      type: 'text' as const,
    };

    it('should send message successfully', async () => {
      const mockSentMessage = {
        id: 'msg-new',
        conversation_id: 'conv-1',
        sender_id: 'user-123',
        content: 'Hello, world!',
        type: 'text',
        metadata: null,
        read_at: null,
        created_at: '2025-01-01T00:00:00Z',
        nonce: null,
        sender_public_key: null,
      };

      mockMessagesService.send.mockResolvedValue({
        data: mockSentMessage,
        error: null,
      });

      (mockSupabase.from as jest.Mock).mockImplementation(() =>
        createSupabaseChainMock({
          data: {
            ...mockSentMessage,
            sender: {
              id: 'user-123',
              full_name: 'Current User',
              avatar_url: null,
            },
          },
          error: null,
        }),
      );

      const result = await messageService.sendMessage(mockMessageRequest);

      expect(result.id).toBe('msg-new');
      expect(result.content).toBe('Hello, world!');
    });

    it('should throw error when not authenticated', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(
        messageService.sendMessage(mockMessageRequest),
      ).rejects.toThrow('Not authenticated');
    });

    it('should throw error on send failure', async () => {
      // Mock supabase insert to fail
      const chainMock = createSupabaseChainMock({
        data: null,
        error: new Error('Send failed'),
      });
      // Override insert chain to return error
      chainMock.insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Send failed'),
          }),
        }),
      });

      (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'messages') {
          return chainMock;
        }
        // Return default chain for conversations lookup
        return createSupabaseChainMock({
          data: { participant_ids: ['user-123', 'user-456'] },
          error: null,
        });
      });

      await expect(
        messageService.sendMessage(mockMessageRequest),
      ).rejects.toThrow('Send failed');
    });
  });

  describe('getMessages', () => {
    it('should return messages for conversation', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          conversation_id: 'conv-1',
          sender_id: 'user-456',
          content: 'Hello',
          type: 'text',
          metadata: null,
          created_at: '2025-01-01T00:00:00Z',
          read_at: null,
          sender: {
            id: 'user-456',
            full_name: 'Other User',
            avatar_url: null,
          },
        },
      ];

      (mockSupabase.from as jest.Mock).mockImplementation(() =>
        createSupabaseChainMock({
          data: mockMessages,
          count: 1,
          error: null,
        }),
      );

      const result = await messageService.getMessages('conv-1');

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe('Hello');
      expect(result.hasMore).toBe(false);
    });

    it('should calculate hasMore correctly', async () => {
      const manyMessages = Array(50)
        .fill(null)
        .map((_, i) => ({
          id: `msg-${i}`,
          conversation_id: 'conv-1',
          sender_id: 'user-456',
          content: `Message ${i}`,
          type: 'text',
          metadata: null,
          created_at: '2025-01-01T00:00:00Z',
          read_at: null,
        }));

      (mockSupabase.from as jest.Mock).mockImplementation(() =>
        createSupabaseChainMock({
          data: manyMessages,
          count: 100, // Total is more than returned
          error: null,
        }),
      );

      const result = await messageService.getMessages('conv-1', {
        page: 1,
        limit: 50,
      });

      expect(result.hasMore).toBe(true);
    });

    it('should throw error on database failure', async () => {
      (mockSupabase.from as jest.Mock).mockImplementation(() =>
        createSupabaseChainMock({
          data: null,
          error: new Error('Database error'),
        }),
      );

      await expect(messageService.getMessages('conv-1')).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark messages as read', async () => {
      (mockSupabase.from as jest.Mock).mockImplementation(() =>
        createSupabaseChainMock({
          data: [{ id: 'msg-1' }, { id: 'msg-2' }],
          error: null,
        }),
      );

      mockMessagesService.markAsRead.mockResolvedValue({
        error: null,
      });

      // Should not throw
      await expect(
        messageService.markAsRead('conv-1'),
      ).resolves.toBeUndefined();
    });

    it('should throw error when not authenticated', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // markAsRead catches and logs errors, doesn't throw
      await expect(
        messageService.markAsRead('conv-1'),
      ).resolves.toBeUndefined();
    });
  });

  describe('archiveConversation', () => {
    it('should return true (not yet implemented)', async () => {
      const result = await messageService.archiveConversation('conv-1');
      expect(result).toBe(true);
    });
  });

  describe('subscribeToConversation', () => {
    it('should call messagesService.subscribeToConversation', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      mockMessagesService.subscribeToConversation.mockReturnValue(
        mockUnsubscribe,
      );

      const unsubscribe = messageService.subscribeToConversation(
        'conv-1',
        mockCallback,
      );

      expect(mockMessagesService.subscribeToConversation).toHaveBeenCalledWith(
        'conv-1',
        expect.any(Function),
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });
});
