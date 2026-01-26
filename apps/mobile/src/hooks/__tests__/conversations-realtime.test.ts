/**
 * Unit tests for useConversationsRealtime
 */
import { renderHook, act } from '@testing-library/react-native';
import { useConversationsRealtime } from '../useConversationsRealtime';

// Mock Supabase
jest.mock('@/config/supabase', () => ({
  supabase: {
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useConversationsRealtime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return isConversationArchived function', () => {
    const { result } = renderHook(() =>
      useConversationsRealtime({ userId: undefined })
    );

    expect(typeof result.current.isConversationArchived).toBe('function');
  });

  it('should track archived conversations', () => {
    const { result } = renderHook(() =>
      useConversationsRealtime({ userId: 'user-123', enabled: false })
    );

    // Initially not archived
    expect(result.current.isConversationArchived('conv-1')).toBe(false);

    // Mark as archived
    act(() => {
      result.current.markConversationArchived('conv-1');
    });

    // Now should be archived
    expect(result.current.isConversationArchived('conv-1')).toBe(true);

    // Unarchive
    act(() => {
      result.current.markConversationActive('conv-1');
    });

    // Should not be archived anymore
    expect(result.current.isConversationArchived('conv-1')).toBe(false);
  });

  it('should handle multiple archived conversations', () => {
    const { result } = renderHook(() =>
      useConversationsRealtime({ userId: 'user-123', enabled: false })
    );

    act(() => {
      result.current.markConversationArchived('conv-1');
      result.current.markConversationArchived('conv-2');
      result.current.markConversationArchived('conv-3');
    });

    expect(result.current.isConversationArchived('conv-1')).toBe(true);
    expect(result.current.isConversationArchived('conv-2')).toBe(true);
    expect(result.current.isConversationArchived('conv-3')).toBe(true);
    expect(result.current.isConversationArchived('conv-4')).toBe(false);
  });
});
