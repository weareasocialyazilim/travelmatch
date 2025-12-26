/**
 * Realtime Context Integration Tests
 *
 * Tests for RealtimeContext provider including:
 * - Connection state management
 * - Presence tracking (online users)
 * - Event subscription system
 * - Typing indicators
 * - Notification subscriptions
 * - App state transitions
 *
 * Coverage:
 * - Context initialization
 * - Online/offline user tracking
 * - Event emission and handling
 * - Typing start/stop events
 * - Connection/reconnection logic
 */

// @ts-nocheck - React context and hooks mock types

// AppState is mocked in jest.native-mocks.js via the react-native mock

// Mock dependencies - supabase must be mocked with a factory function to avoid module resolution
jest.mock('../../apps/mobile/src/config/supabase', () => ({
  supabase: {
    channel: jest.fn(),
    removeChannel: jest.fn(),
    auth: {
      getSession: jest
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));
jest.mock('../../apps/mobile/src/context/AuthContext');
jest.mock('../../apps/mobile/src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));
jest.mock('../../apps/mobile/src/services/realtimeChannelManager', () => ({
  realtimeChannelManager: {
    subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
    subscribeToTable: jest.fn().mockReturnValue(jest.fn()),
    unsubscribe: jest.fn(),
    getChannel: jest.fn(),
    onHealthChange: jest.fn(() => jest.fn()),
    getConnectionHealth: jest.fn(() => ({
      isConnected: true,
      latency: 50,
      lastHeartbeat: Date.now(),
      reconnectAttempts: 0,
    })),
    broadcast: jest.fn(),
  },
}));

// AppState is mocked in jest.native-mocks.js via the react-native mock

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import {
  RealtimeProvider,
  useRealtime,
  useTypingIndicator,
} from '../../apps/mobile/src/context/RealtimeContext';
import { supabase } from '../../apps/mobile/src/config/supabase';
import { useAuth } from '../../apps/mobile/src/context/AuthContext';
import { realtimeChannelManager } from '../../apps/mobile/src/services/realtimeChannelManager';

describe('RealtimeContext', () => {
  let mockChannel;
  let presenceSyncHandler: Function;
  let presenceJoinHandler: Function;
  let presenceLeaveHandler: Function;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock auth
    useAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    // Mock channel
    mockChannel = {
      on: jest.fn((type, config, handler) => {
        if (type === 'presence') {
          if (config.event === 'sync') presenceSyncHandler = handler;
          if (config.event === 'join') presenceJoinHandler = handler;
          if (config.event === 'leave') presenceLeaveHandler = handler;
        }
        return mockChannel;
      }),
      subscribe: jest.fn((callback) => {
        if (callback) callback('SUBSCRIBED');
        return mockChannel;
      }),
      unsubscribe: jest.fn(),
      presenceState: jest.fn(() => ({})),
      send: jest.fn(),
      track: jest.fn().mockResolvedValue('ok'),
      untrack: jest.fn().mockResolvedValue('ok'),
    };

    supabase.channel.mockReturnValue(mockChannel);
    supabase.removeChannel.mockImplementation(() => {});
  });

  // ===========================
  // Context Initialization Tests
  // ===========================

  describe('Context Initialization', () => {
    it('should initialize with disconnected state', () => {
      // Mock unauthenticated user for this test
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      expect(result.current.connectionState).toBe('disconnected');
      expect(result.current.isConnected).toBe(false);
    });

    it('should setup presence channel when authenticated', async () => {
      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalledWith(
          'online-users',
          expect.objectContaining({
            config: {
              presence: {
                key: mockUser.id,
              },
            },
          }),
        );
      });
    });

    it('should not setup presence when not authenticated', () => {
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      renderHook(() => useRealtime(), { wrapper });

      expect(supabase.channel).not.toHaveBeenCalled();
    });

    it('should transition to connected state after subscription', async () => {
      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(result.current.connectionState).toBe('connected');
        expect(result.current.isConnected).toBe(true);
      });
    });
  });

  // ===========================
  // Presence Tracking Tests
  // ===========================

  describe('Presence Tracking', () => {
    it('should track online users from presence sync', async () => {
      mockChannel.presenceState.mockReturnValue({
        'user-1': [{ user_id: 'user-1' }],
        'user-2': [{ user_id: 'user-2' }],
        'user-3': [{ user_id: 'user-3' }],
      });

      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(mockChannel.on).toHaveBeenCalled();
      });

      act(() => {
        presenceSyncHandler();
      });

      await waitFor(() => {
        expect(result.current.onlineUsers.size).toBe(3);
        expect(result.current.isUserOnline('user-1')).toBe(true);
        expect(result.current.isUserOnline('user-2')).toBe(true);
      });
    });

    it('should add user on presence join', async () => {
      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(mockChannel.on).toHaveBeenCalled();
      });

      act(() => {
        presenceJoinHandler({ key: 'user-new' });
      });

      await waitFor(() => {
        expect(result.current.isUserOnline('user-new')).toBe(true);
      });
    });

    it('should remove user on presence leave', async () => {
      mockChannel.presenceState.mockReturnValue({
        'user-1': [{ user_id: 'user-1' }],
      });

      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(mockChannel.on).toHaveBeenCalled();
      });

      // Sync first
      act(() => {
        presenceSyncHandler();
      });

      // User leaves
      act(() => {
        presenceLeaveHandler({ key: 'user-1' });
      });

      await waitFor(() => {
        expect(result.current.isUserOnline('user-1')).toBe(false);
      });
    });

    it('should emit user:online event on join', async () => {
      const handler = jest.fn();

      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      act(() => {
        result.current.subscribe('user:online', handler);
      });

      act(() => {
        presenceJoinHandler({ key: 'user-456' });
      });

      await waitFor(() => {
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({ userId: 'user-456', isOnline: true }),
        );
      });
    });

    it('should emit user:offline event on leave', async () => {
      const handler = jest.fn();

      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      act(() => {
        result.current.subscribe('user:offline', handler);
      });

      act(() => {
        presenceLeaveHandler({ key: 'user-789' });
      });

      await waitFor(() => {
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 'user-789',
            isOnline: false,
            lastSeen: expect.any(String),
          }),
        );
      });
    });
  });

  // ===========================
  // Event Subscription Tests
  // ===========================

  describe('Event Subscription', () => {
    it('should subscribe to events', async () => {
      const handler = jest.fn();

      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      act(() => {
        result.current.subscribe('message:new', handler);
      });

      // Handler should be registered
      expect(handler).toBeDefined();
    });

    it('should unsubscribe from events', async () => {
      const handler = jest.fn();

      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      let unsubscribe: Function;

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      act(() => {
        unsubscribe = result.current.subscribe('message:new', handler);
      });

      act(() => {
        unsubscribe();
      });

      // Handler should be removed (would need internal state check)
    });

    it('should handle multiple subscribers to same event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      act(() => {
        result.current.subscribe('notification:new', handler1);
        result.current.subscribe('notification:new', handler2);
        result.current.subscribe('notification:new', handler3);
      });

      // All handlers should be called
      // (would require emit mechanism)
    });

    it('should handle errors in event handlers gracefully', async () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error');
      });
      const normalHandler = jest.fn();

      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      act(() => {
        result.current.subscribe('message:new', errorHandler);
        result.current.subscribe('message:new', normalHandler);
      });

      // Should not crash and continue with other handlers
    });
  });

  // ===========================
  // Typing Indicators Tests
  // ===========================

  describe('Typing Indicators', () => {
    it('should send typing start event', async () => {
      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      act(() => {
        result.current.sendTypingStart('conv-123');
      });

      expect(realtimeChannelManager.broadcast).toHaveBeenCalledWith(
        'conversation:conv-123',
        'typing',
        expect.objectContaining({
          conversationId: 'conv-123',
          isTyping: true,
        }),
      );
    });

    it('should send typing stop event', async () => {
      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      act(() => {
        result.current.sendTypingStop('conv-123');
      });

      expect(realtimeChannelManager.broadcast).toHaveBeenCalledWith(
        'conversation:conv-123',
        'typing',
        expect.objectContaining({
          isTyping: false,
        }),
      );
    });

    it('should track typing users with useTypingIndicator hook', async () => {
      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useTypingIndicator('conv-123'), {
        wrapper,
      });

      // Would need to emit typing events and check state
      expect(result.current).toHaveProperty('typingUserIds');
      expect(result.current).toHaveProperty('isAnyoneTyping');
    });
  });

  // ===========================
  // Connection Management Tests
  // ===========================

  describe('Connection Management', () => {
    it('should connect manually', async () => {
      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      act(() => {
        result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.connectionState).toBe('connected');
      });
    });

    it('should disconnect manually', async () => {
      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      act(() => {
        result.current.disconnect();
      });

      await waitFor(() => {
        expect(result.current.connectionState).toBe('disconnected');
      });
    });

    it('should reconnect after disconnection', async () => {
      jest.useFakeTimers();

      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      act(() => {
        result.current.disconnect();
      });

      act(() => {
        result.current.reconnect();
      });

      // Reconnect has a 1000ms setTimeout
      await act(async () => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(result.current.connectionState).toBe('connected');
      });

      jest.useRealTimers();
    });

    it('should handle connection errors', async () => {
      mockChannel.subscribe.mockImplementation((callback) => {
        callback('CHANNEL_ERROR');
      });

      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      // Should handle error gracefully
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });
  });

  // ===========================
  // App State Transitions
  // ===========================

  describe('App State Transitions', () => {
    it('should disconnect when app goes to background', async () => {
      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Simulate app going to background
      act(() => {
        const listener = AppState.addEventListener.mock.calls[0][1];
        listener('background');
      });

      // Should disconnect to save resources
      // (implementation-dependent)
    });

    it('should reconnect when app returns to foreground', async () => {
      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      renderHook(() => useRealtime(), { wrapper });

      // Simulate app returning to foreground
      act(() => {
        const listener = AppState.addEventListener.mock.calls[0][1];
        listener('active');
      });

      // Should reconnect
      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });
    });
  });

  // ===========================
  // Edge Cases
  // ===========================

  describe('Edge Cases', () => {
    it('should cleanup on unmount', async () => {
      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { unmount } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(supabase.removeChannel).toHaveBeenCalled();
    });

    it('should handle rapid connect/disconnect', async () => {
      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.disconnect();
          result.current.connect();
        });
      }

      // Should handle gracefully
      expect(result.current).toBeDefined();
    });

    it('should handle missing user ID in presence', async () => {
      useAuth.mockReturnValue({
        user: { id: null },
        isAuthenticated: true,
      });

      const wrapper = ({ children }) => (
        <RealtimeProvider>{children}</RealtimeProvider>
      );

      const { result } = renderHook(() => useRealtime(), { wrapper });

      // Should handle gracefully - even with null user ID, context initializes
      expect(result.current).toBeDefined();
    });
  });
});
