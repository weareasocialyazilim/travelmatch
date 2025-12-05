/**
 * Tests for useNotifications hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useNotifications } from '../useNotifications';
import { notificationService } from '../../services/notificationService';

// Mock the notification service
jest.mock('../../services/notificationService', () => ({
  notificationService: {
    getNotifications: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
    clearAll: jest.fn(),
    getPreferences: jest.fn(),
    updatePreferences: jest.fn(),
  },
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockNotificationService = notificationService as jest.Mocked<
  typeof notificationService
>;

describe('useNotifications', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Default mock implementations
    mockNotificationService.getNotifications.mockResolvedValue({
      notifications: [],
      unreadCount: 0,
    });
    mockNotificationService.getPreferences.mockResolvedValue({
      preferences: null,
    });
  });

  describe('refresh', () => {
    it('should fetch notifications', async () => {
      const mockNotifications = [
        { id: 'n1', type: 'message', message: 'New message', read: false },
        { id: 'n2', type: 'request', message: 'New request', read: true },
      ];

      mockNotificationService.getNotifications.mockResolvedValue({
        notifications: mockNotifications,
        unreadCount: 1,
      });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.notifications).toEqual(mockNotifications);
        expect(result.current.unreadCount).toBe(1);
      });
    });

    it('should handle errors', async () => {
      mockNotificationService.getNotifications.mockImplementation(() => {
        return Promise.reject(new Error('Failed'));
      });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed');
      });
    });
  });

  describe('loadMore', () => {
    it('should load more notifications', async () => {
      const page1 = Array(20)
        .fill(null)
        .map((_, i) => ({
          id: `n${i}`,
          type: 'message',
          message: `Notification ${i}`,
          read: false,
        }));
      const page2 = [
        {
          id: 'n21',
          type: 'message',
          message: 'More notification',
          read: false,
        },
      ];

      mockNotificationService.getNotifications.mockImplementation(
        (params?: { page?: number }) => {
          const pageNum = params?.page || 1;
          if (pageNum === 1)
            return Promise.resolve({ notifications: page1, unreadCount: 21 });
          return Promise.resolve({ notifications: page2, unreadCount: 21 });
        },
      );

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.notifications.length).toBe(20);
        expect(result.current.hasMore).toBe(true);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(result.current.notifications.length).toBe(21);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const mockNotifications = [
        { id: 'n1', type: 'message', message: 'Test', read: false },
      ];

      mockNotificationService.getNotifications.mockResolvedValue({
        notifications: mockNotifications,
        unreadCount: 1,
      });
      mockNotificationService.markAsRead.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.markAsRead('n1');
      });

      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('n1');
      // Check that notification is marked as read in state
      expect(result.current.notifications[0].read).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const mockNotifications = [
        { id: 'n1', type: 'message', message: 'Test 1', read: false },
        { id: 'n2', type: 'message', message: 'Test 2', read: false },
      ];

      mockNotificationService.getNotifications.mockResolvedValue({
        notifications: mockNotifications,
        unreadCount: 2,
      });
      mockNotificationService.markAllAsRead.mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(mockNotificationService.markAllAsRead).toHaveBeenCalled();
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.notifications.every((n) => n.read)).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const mockNotifications = [
        { id: 'n1', type: 'message', message: 'Test', read: false },
        { id: 'n2', type: 'message', message: 'Test 2', read: true },
      ];

      mockNotificationService.getNotifications.mockResolvedValue({
        notifications: mockNotifications,
        unreadCount: 1,
      });
      mockNotificationService.deleteNotification.mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteNotification('n1');
      });

      expect(mockNotificationService.deleteNotification).toHaveBeenCalledWith(
        'n1',
      );
      expect(result.current.notifications.length).toBe(1);
      expect(result.current.notifications[0].id).toBe('n2');
    });
  });

  describe('clearAll', () => {
    it('should clear all notifications', async () => {
      const mockNotifications = [
        { id: 'n1', type: 'message', message: 'Test', read: false },
      ];

      mockNotificationService.getNotifications.mockResolvedValue({
        notifications: mockNotifications,
        unreadCount: 1,
      });
      mockNotificationService.clearAll.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.clearAll();
      });

      expect(mockNotificationService.clearAll).toHaveBeenCalled();
      expect(result.current.notifications.length).toBe(0);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('updatePreferences', () => {
    it('should update notification preferences', async () => {
      const newPrefs = {
        pushEnabled: true,
        emailEnabled: false,
        messageNotifications: true,
      };

      mockNotificationService.updatePreferences.mockResolvedValue({
        preferences: newPrefs,
      });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePreferences(newPrefs);
      });

      expect(mockNotificationService.updatePreferences).toHaveBeenCalledWith(
        newPrefs,
      );
      expect(result.current.preferences).toEqual(newPrefs);
    });
  });

  describe('filterByType', () => {
    it('should filter notifications by type', async () => {
      mockNotificationService.getNotifications.mockResolvedValue({
        notifications: [],
        unreadCount: 0,
      });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.filterByType('message');
      });

      expect(result.current.currentFilter).toBe('message');
    });

    it('should clear filter when null is passed', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.filterByType('message');
      });

      expect(result.current.currentFilter).toBe('message');

      act(() => {
        result.current.filterByType(null);
      });

      expect(result.current.currentFilter).toBeNull();
    });
  });
});
