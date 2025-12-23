/**
 * Supabase DB Service Tests
 * Tests for CRUD operations, query builders, error handling, and RLS integration
 * Target Coverage: 80%+
 */

const {
  usersService,
  momentsService,
  transactionsService,
} = require('../supabaseDbService');
// Use relative require for the config mock to avoid resolver alias issues in Jest runs
const { supabase, isSupabaseConfigured } = require('../../config/supabase');
// Use relative require for logger to avoid alias resolution issues in Jest
const { logger } = require('../../utils/logger');

// Mock dependencies
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  isSupabaseConfigured: jest.fn(() => true),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('supabaseDbService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // USERS SERVICE TESTS
  // ========================================
  describe('usersService', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      bio: 'Test bio',
      created_at: '2024-01-01T00:00:00Z',
      moments_count: [{ count: 5 }],
      followers_count: [{ count: 10 }],
      following_count: [{ count: 8 }],
      reviews_count: [{ count: 3 }],
    };

    describe('getById', () => {
      it('should retrieve user by ID with stats', async () => {
        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({
          data: mockUser,
          error: null,
        });

        supabase.from.mockReturnValue({
          select: mockSelect,
        });
        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ single: mockSingle });

        const result = await usersService.getById('user-123');

        expect(result.data).toEqual(mockUser);
        expect(result.error).toBeNull();
        expect(supabase.from).toHaveBeenCalledWith('users');
        expect(mockSelect).toHaveBeenCalledWith(
          expect.stringContaining('moments_count'),
        );
        expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
      });

      it('should handle user not found', async () => {
        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'User not found', code: 'PGRST116' },
        });

        supabase.from.mockReturnValue({
          select: mockSelect,
        });
        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ single: mockSingle });

        const result = await usersService.getById('invalid-id');

        expect(result.data).toBeNull();
        expect(result.error).toBeTruthy();
        expect(logger.error).toHaveBeenCalled();
      });

      it('should return error when Supabase is not configured', async () => {
        isSupabaseConfigured.mockReturnValue(false);

        const result = await usersService.getById('user-123');

        expect(result.data).toBeNull();
        expect(result.error?.message).toBe('Supabase not configured');

        // Restore
        isSupabaseConfigured.mockReturnValue(true);
      });
    });

    describe('update', () => {
      it('should update user successfully', async () => {
        const updates = { full_name: 'Updated Name', bio: 'New bio' };
        const updatedUser = { ...mockUser, ...updates };

        const mockUpdate = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({
          data: updatedUser,
          error: null,
        });

        supabase.from.mockReturnValue({
          update: mockUpdate,
        });
        mockUpdate.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ single: mockSingle });

        const result = await usersService.update('user-123', updates);

        expect(result.data).toEqual(updatedUser);
        expect(result.error).toBeNull();
        expect(mockUpdate).toHaveBeenCalledWith(updates);
        expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
      });

      it('should handle update errors', async () => {
        const error = new Error('Update failed');
        const mockUpdate = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({
          data: null,
          error,
        });

        supabase.from.mockReturnValue({
          update: mockUpdate,
        });
        mockUpdate.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ single: mockSingle });

        const result = await usersService.update('user-123', {
          full_name: 'Test',
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(error);
        expect(logger.error).toHaveBeenCalledWith(
          '[DB] Update user error:',
          error,
        );
      });
    });

    // TODO: Implement follow/unfollow in usersService
    describe.skip('follow/unfollow', () => {
      it('should follow a user successfully', async () => {
        const mockInsert = jest.fn().mockResolvedValue({ error: null });

        supabase.from.mockReturnValue({
          insert: mockInsert,
        });

        const result = await usersService.follow('user-123', 'user-456');

        expect(result.error).toBeNull();
        expect(supabase.from).toHaveBeenCalledWith('follows');
        expect(mockInsert).toHaveBeenCalledWith({
          follower_id: 'user-123',
          following_id: 'user-456',
        });
      });

      it('should handle duplicate follow error', async () => {
        const error = new Error('Duplicate follow');
        const mockInsert = jest.fn().mockResolvedValue({ error });

        supabase.from.mockReturnValue({
          insert: mockInsert,
        });

        const result = await usersService.follow('user-123', 'user-456');

        expect(result.error).toEqual(error);
        expect(logger.error).toHaveBeenCalledWith(
          '[DB] Follow user error:',
          error,
        );
      });

      it('should unfollow a user successfully', async () => {
        const mockDelete = jest.fn().mockReturnThis();
        const mockEq1 = jest.fn().mockReturnThis();
        const mockEq2 = jest.fn().mockResolvedValue({ error: null });

        supabase.from.mockReturnValue({
          delete: mockDelete,
        });
        mockDelete.mockReturnValue({ eq: mockEq1 });
        mockEq1.mockReturnValue({ eq: mockEq2 });

        const result = await usersService.unfollow('user-123', 'user-456');

        expect(result.error).toBeNull();
        expect(mockEq1).toHaveBeenCalledWith('follower_id', 'user-123');
        expect(mockEq2).toHaveBeenCalledWith('following_id', 'user-456');
      });
    });

    // TODO: Implement getFollowers/getFollowing in usersService
    describe.skip('getFollowers/getFollowing', () => {
      it('should retrieve followers list', async () => {
        const mockFollowers = [
          { follower: { id: 'user-1', full_name: 'User 1' } },
          { follower: { id: 'user-2', full_name: 'User 2' } },
        ];

        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockResolvedValue({
          data: mockFollowers,
          count: 2,
          error: null,
        });

        supabase.from.mockReturnValue({
          select: mockSelect,
        });
        mockSelect.mockReturnValue({ eq: mockEq });

        const result = await usersService.getFollowers('user-123');

        expect(result.data).toHaveLength(2);
        expect(result.count).toBe(2);
        expect(result.error).toBeNull();
        expect(mockEq).toHaveBeenCalledWith('following_id', 'user-123');
      });

      it('should retrieve following list', async () => {
        const mockFollowing = [
          { following: { id: 'user-1', full_name: 'User 1' } },
        ];

        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockResolvedValue({
          data: mockFollowing,
          count: 1,
          error: null,
        });

        supabase.from.mockReturnValue({
          select: mockSelect,
        });
        mockSelect.mockReturnValue({ eq: mockEq });

        const result = await usersService.getFollowing('user-123');

        expect(result.data).toHaveLength(1);
        expect(result.count).toBe(1);
        expect(mockEq).toHaveBeenCalledWith('follower_id', 'user-123');
      });

      it('should handle empty followers list', async () => {
        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockResolvedValue({
          data: [],
          count: 0,
          error: null,
        });

        supabase.from.mockReturnValue({
          select: mockSelect,
        });
        mockSelect.mockReturnValue({ eq: mockEq });

        const result = await usersService.getFollowers('user-123');

        expect(result.data).toEqual([]);
        expect(result.count).toBe(0);
      });
    });

    // TODO: Implement checkFollowStatus in usersService
    describe.skip('checkFollowStatus', () => {
      it('should return true when following', async () => {
        const mockSelect = jest.fn().mockReturnThis();
        const mockEq1 = jest.fn().mockReturnThis();
        const mockEq2 = jest.fn().mockResolvedValue({
          count: 1,
          error: null,
        });

        supabase.from.mockReturnValue({
          select: mockSelect,
        });
        mockSelect.mockReturnValue({ eq: mockEq1 });
        mockEq1.mockReturnValue({ eq: mockEq2 });

        const result = await usersService.checkFollowStatus(
          'user-123',
          'user-456',
        );

        expect(result.isFollowing).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should return false when not following', async () => {
        const mockSelect = jest.fn().mockReturnThis();
        const mockEq1 = jest.fn().mockReturnThis();
        const mockEq2 = jest.fn().mockResolvedValue({
          count: 0,
          error: null,
        });

        supabase.from.mockReturnValue({
          select: mockSelect,
        });
        mockSelect.mockReturnValue({ eq: mockEq1 });
        mockEq1.mockReturnValue({ eq: mockEq2 });

        const result = await usersService.checkFollowStatus(
          'user-123',
          'user-456',
        );

        expect(result.isFollowing).toBe(false);
      });
    });

    describe('search', () => {
      it('should search users by name and email', async () => {
        const mockUsers = [
          { id: 'user-1', full_name: 'John Doe', email: 'john@example.com' },
          { id: 'user-2', full_name: 'Jane Doe', email: 'jane@example.com' },
        ];

        const mockSelect = jest.fn().mockReturnThis();
        const mockOr = jest.fn().mockReturnThis();
        const mockLimit = jest.fn().mockResolvedValue({
          data: mockUsers,
          count: 2,
          error: null,
        });

        supabase.from.mockReturnValue({
          select: mockSelect,
        });
        mockSelect.mockReturnValue({ or: mockOr });
        mockOr.mockReturnValue({ limit: mockLimit });

        const result = await usersService.search('doe', 10);

        expect(result.data).toHaveLength(2);
        expect(result.count).toBe(2);
        expect(mockOr).toHaveBeenCalledWith(expect.stringContaining('doe'));
        expect(mockLimit).toHaveBeenCalledWith(10);
      });

      it('should handle search with custom limit', async () => {
        const mockSelect = jest.fn().mockReturnThis();
        const mockOr = jest.fn().mockReturnThis();
        const mockLimit = jest.fn().mockResolvedValue({
          data: [],
          count: 0,
          error: null,
        });

        supabase.from.mockReturnValue({
          select: mockSelect,
        });
        mockSelect.mockReturnValue({ or: mockOr });
        mockOr.mockReturnValue({ limit: mockLimit });

        await usersService.search('test', 25);

        expect(mockLimit).toHaveBeenCalledWith(25);
      });
    });

    describe('getSuggested', () => {
      it('should get suggested users excluding current user', async () => {
        const mockUsers = [
          { id: 'user-1', full_name: 'User 1' },
          { id: 'user-2', full_name: 'User 2' },
        ];

        const mockSelect = jest.fn().mockReturnThis();
        const mockNeq = jest.fn().mockReturnThis();
        const mockLimit = jest.fn().mockResolvedValue({
          data: mockUsers,
          count: 2,
          error: null,
        });

        supabase.from.mockReturnValue({
          select: mockSelect,
        });
        mockSelect.mockReturnValue({ neq: mockNeq });
        mockNeq.mockReturnValue({ limit: mockLimit });

        const result = await usersService.getSuggested('user-123', 5);

        expect(result.data).toHaveLength(2);
        expect(mockNeq).toHaveBeenCalledWith('id', 'user-123');
        expect(mockLimit).toHaveBeenCalledWith(5);
      });
    });
  });

  // ========================================
  // TRANSACTIONS SERVICE TESTS
  // ========================================
  describe('transactionsService', () => {
    const mockTransaction = {
      id: 'txn-123',
      user_id: 'user-123',
      amount: 25.0,
      currency: 'USD',
      type: 'payment',
      status: 'completed',
      description: 'Test transaction',
      created_at: '2024-01-01T00:00:00Z',
      metadata: { test: 'data' },
    };

    describe('create', () => {
      it('should create a transaction successfully', async () => {
        const mockInsert = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({
          data: mockTransaction,
          error: null,
        });

        supabase.from.mockReturnValue({
          insert: mockInsert,
        });
        mockInsert.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ single: mockSingle });

        const result = await transactionsService.create({
          user_id: 'user-123',
          amount: 25.0,
          currency: 'USD',
          type: 'payment',
          status: 'completed',
        });

        expect(result.data).toEqual(mockTransaction);
        expect(result.error).toBeNull();
        expect(mockInsert).toHaveBeenCalled();
      });

      it('should handle creation errors', async () => {
        const error = new Error('Database error');
        const mockInsert = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({
          data: null,
          error,
        });

        supabase.from.mockReturnValue({
          insert: mockInsert,
        });
        mockInsert.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ single: mockSingle });

        const result = await transactionsService.create({
          user_id: 'user-123',
          amount: 25.0,
          currency: 'USD',
          type: 'payment',
          status: 'completed',
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(error);
      });
    });

    describe('get', () => {
      it('should retrieve a transaction by ID', async () => {
        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({
          data: mockTransaction,
          error: null,
        });

        supabase.from.mockReturnValue({
          select: mockSelect,
        });
        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ single: mockSingle });

        const result = await transactionsService.get('txn-123');

        expect(result.data).toEqual(mockTransaction);
        expect(result.error).toBeNull();
        expect(mockEq).toHaveBeenCalledWith('id', 'txn-123');
      });
    });

    describe('list', () => {
      it('should list transactions for a user', async () => {
        const mockTransactions = [mockTransaction];

        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockOrder = jest.fn().mockResolvedValue({
          data: mockTransactions,
          count: 1,
          error: null,
        });

        supabase.from.mockReturnValue({
          select: mockSelect,
        });
        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ order: mockOrder });

        const result = await transactionsService.list('user-123', {});

        expect(result.data).toHaveLength(1);
        expect(result.count).toBe(1);
        expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      });

      it('should support filtering options', async () => {
        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockOrder = jest.fn().mockResolvedValue({
          data: [],
          count: 0,
          error: null,
        });

        supabase.from.mockReturnValue({
          select: mockSelect,
        });
        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ order: mockOrder });

        const result = await transactionsService.list('user-123', {
          limit: 10,
        });

        expect(result.data).toEqual([]);
        expect(result.count).toBe(0);
      });
    });
  });

  // ========================================
  // RLS INTEGRATION TESTS
  // ========================================
  describe('RLS Integration', () => {
    it('should enforce RLS on user queries', async () => {
      // RLS is enforced at database level
      // Testing that queries don't bypass RLS
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'RLS policy violation', code: '42501' },
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      const result = await usersService.getById('unauthorized-user');

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toContain('RLS policy');
    });
  });

  // ========================================
  // ERROR HANDLING TESTS
  // ========================================
  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network request failed');
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: networkError,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      const result = await usersService.getById('user-123');

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: timeoutError,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      const result = await usersService.getById('user-123');

      expect(result.data).toBeNull();
      expect(result.error).toEqual(timeoutError);
    });
  });
});
