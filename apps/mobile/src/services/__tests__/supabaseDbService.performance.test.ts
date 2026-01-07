/**
 * Supabase Query Performance Tests
 * Tests for optimized joins and query efficiency
 */

import { momentsService, usersService } from '../../services/supabaseDbService';
import { supabase } from '../../config/supabase';

// Mock Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
  isSupabaseConfigured: jest.fn(() => true),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Supabase Query Performance Optimization', () => {
  const mockSupabaseFrom = supabase.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('momentsService.list', () => {
    it('should use optimized join syntax with selective fields', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          count: 0,
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockQuery);

      await momentsService.list({ limit: 10, offset: 0 });

      // Verify optimized select was called with joins
      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('users:user_id'),
        expect.objectContaining({ count: 'exact' }),
      );

      // Verify join includes only necessary fields (not *)
      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('id,'),
        expect.anything(),
      );
      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('full_name,'),
        expect.anything(),
      );
      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('avatar_url,'),
        expect.anything(),
      );
    });

    it('should fetch user and category data in a single query', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [
            {
              id: '1',
              title: 'Test Moment',
              users: {
                id: 'user-1',
                full_name: 'John',
                avatar_url: 'avatar.jpg',
              },
            },
          ],
          count: 1,
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockQuery);

      const result = await momentsService.list({ limit: 10 });

      // Should only call Supabase once
      expect(mockSupabaseFrom).toHaveBeenCalledTimes(1);
      expect(mockSupabaseFrom).toHaveBeenCalledWith('moments');

      // Should return data with joined user info
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('users');
    });

    it('should prevent N+1 queries by fetching all relationships at once', async () => {
      const mockData = Array.from({ length: 10 }, (_, i) => ({
        id: `moment-${i}`,
        title: `Moment ${i}`,
        users: { id: `user-${i}`, full_name: `User ${i}` },
      }));

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockData,
          count: 10,
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockQuery);

      await momentsService.list({ limit: 10 });

      // Should make only 1 query, not 1 + 10 (for each user) + 10 (for each category)
      expect(mockSupabaseFrom).toHaveBeenCalledTimes(1);
      expect(mockQuery.select).toHaveBeenCalledTimes(1);
    });
  });

  describe('momentsService.getById', () => {
    it('should fetch moment with user and request data in single query', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: '1',
            title: 'Test',
            users: { id: 'user-1', full_name: 'John' },
            moment_requests: [{ id: 'req-1', status: 'pending' }],
          },
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockQuery);

      await momentsService.getById('1');

      // Verify join syntax includes all relationships
      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('users:user_id'),
      );
      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('moment_requests'),
      );

      // Should only make 1 query
      expect(mockSupabaseFrom).toHaveBeenCalledTimes(1);
    });
  });

  describe('momentsService.getSaved', () => {
    it('should use nested joins to fetch moments with user data', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [
            {
              moments: {
                id: '1',
                title: 'Saved Moment',
                users: { id: 'host-1', full_name: 'Host' },
              },
            },
          ],
          count: 1,
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockQuery);

      await momentsService.getSaved('user-1');

      // Verify nested join syntax
      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('moments:moment_id'),
        expect.objectContaining({ count: 'exact' }),
      );
      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('users:user_id'),
        expect.anything(),
      );

      // Should only make 1 query for favorites with nested moments
      expect(mockSupabaseFrom).toHaveBeenCalledTimes(1);
    });

    it('should order saved moments by created_at', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          count: 0,
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockQuery);

      await momentsService.getSaved('user-1');

      expect(mockQuery.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
    });
  });

  describe('usersService.getById', () => {
    it('should fetch user with explicit column selection', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'user-1',
            full_name: 'John',
            email: 'john@example.com',
            avatar_url: null,
            location: 'Test',
            public_key: null,
            kyc_status: 'none',
            verified: false,
            rating: 0,
            review_count: 0,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockQuery);

      await usersService.getById('user-1');

      // Verify basic user fields are fetched with explicit column selection
      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('id'),
      );
      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('email'),
      );
      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('full_name'),
      );

      // Should only make 1 query for user data
      expect(mockSupabaseFrom).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should complete list query in reasonable time', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: Array.from({ length: 20 }, (_, i) => ({
            id: `${i}`,
            users: { id: `u${i}` },
          })),
          count: 20,
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockQuery);

      const startTime = Date.now();
      await momentsService.list({ limit: 20 });
      const endTime = Date.now();

      // Should complete in less than 100ms (mocked, but demonstrates expectation)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle large result sets efficiently', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: Array.from({ length: 100 }, (_, i) => ({
            id: `${i}`,
            users: { id: `u${i}`, name: `User ${i}` },
            categories: { id: `c${i}`, name: `Cat ${i}` },
          })),
          count: 100,
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockQuery);

      const result = await momentsService.list({ limit: 100 });

      // Should handle 100 items without additional queries
      expect(mockSupabaseFrom).toHaveBeenCalledTimes(1);
      expect(result.data).toHaveLength(100);
    });
  });

  describe('Query Optimization Edge Cases', () => {
    it('should handle moments without user data gracefully', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [
            {
              id: '1',
              title: 'Orphaned Moment',
              users: null, // User deleted or missing
            },
          ],
          count: 1,
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockQuery);

      const result = await momentsService.list({ limit: 10 });

      // Should not crash
      expect(result.data).toHaveLength(1);
      expect(result.error).toBeNull();
    });

    it('should filter null moments from saved list', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [
            { moments: { id: '1', title: 'Valid' } },
            { moments: null }, // Deleted moment
            { moments: { id: '2', title: 'Also Valid' } },
          ],
          count: 3,
          error: null,
        }),
      };

      mockSupabaseFrom.mockReturnValue(mockQuery);

      const result = await momentsService.getSaved('user-1');

      // Should filter out null moments
      expect(result.data).toHaveLength(2);
      expect(result.data.every((m) => m !== null)).toBe(true);
    });
  });
});
