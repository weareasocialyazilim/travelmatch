/**
 * Messaging Eligibility Hook Tests
 */
import { renderHook, act } from '@testing-library/react-native';
import { useMessagingEligibility } from '../useMessagingEligibility';

// Mock supabase at method level to work around useCallback closure issues
jest.mock('../../services/supabase', () => {
  const mockFrom = jest.fn();

  return {
    supabase: {
      auth: {
        getUser: jest.fn(),
        getSession: jest.fn(),
      },
      from: mockFrom,
    },
    // Export mockFrom for test setup
    mockSupabaseFrom: mockFrom,
  };
});

// Import after mock is set up
import { mockSupabaseFrom } from '../../services/supabase';

jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe('useMessagingEligibility', () => {
  beforeEach(() => {
    // Clear mock implementations
    mockSupabaseFrom.mockClear();
  });

  describe('checkEligibility', () => {
    it('should return true when state is active', async () => {
      // P2 FIX: Use jest.spyOn for method-level mocking to avoid useCallback closure issues
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          state: 'active',
          eligibility_type: 'offer_acceptance',
          eligibility_criteria: { lvnd_spent: { meets: true } },
        },
      });

      mockSupabaseFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: mockSingle,
            }),
          }),
        }),
      });

      // Mock getUser
      const { supabase } = require('../../services/supabase');
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const { result } = renderHook(() => useMessagingEligibility());

      await act(async () => {
        const isEligible = await result.current.checkEligibility('conv-123');
        expect(isEligible).toBe(true);
      });

      expect(result.current.eligibility).not.toBe(null);
      expect(result.current.eligibility?.state).toBe('active');
      expect(result.current.isActive).toBe(true);
      expect(result.current.isEligible).toBe(true);
    });

    it('should return false when eligibility record does not exist', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: async () => ({ error: new Error('Not found') }),
            }),
          }),
        }),
      });

      const { supabase } = require('../../services/supabase');
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const { result } = renderHook(() => useMessagingEligibility());

      await act(async () => {
        const isEligible = await result.current.checkEligibility('conv-123');
        expect(isEligible).toBe(false);
      });

      expect(result.current.eligibility).toBe(null);
    });

    it('should return false when state is closed', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: async () => ({
                data: { state: 'closed' },
              }),
            }),
          }),
        }),
      });

      const { supabase } = require('../../services/supabase');
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const { result } = renderHook(() => useMessagingEligibility());

      await act(async () => {
        const isEligible = await result.current.checkEligibility('conv-123');
        expect(isEligible).toBe(false);
      });

      expect(result.current.isActive).toBe(false);
    });
  });

  describe('getEligibilityReasons', () => {
    it('should return empty array when no eligibility data', () => {
      const { result } = renderHook(() => useMessagingEligibility());
      const reasons = result.current.getEligibilityReasons();
      expect(reasons).toEqual([]);
    });
  });
});
