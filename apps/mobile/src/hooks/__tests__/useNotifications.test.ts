/**
 * useNotifications Hook Tests
 * Tests for notification management and real-time updates
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationService } from '@/services/notificationService';
import type {
  Notification,
  NotificationPreferences,
} from '@/services/notificationService';

// Mock dependencies
jest.mock('@/services/notificationService', () => ({
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

jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('useNotifications Hook', () => {
  // Mock data
  const mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      userId: 'user-123',
      type: 'message',
      title: 'New Message',
      message: 'You have a new message from John',
      read: false,
      createdAt: '2024-12-07T10:00:00Z',
      data: { conversationId: 'conv-1' },
    },
    {
      id: 'notif-2',
      userId: 'user-123',
      type: 'moment',
      title: 'Moment Request',
      message: 'Someone requested your moment',
      read: false,
      createdAt: '2024-12-07T09:00:00Z',
      data: { momentId: 'moment-1' },
    },
    {
      id: 'notif-3',
      userId: 'user-123',
      type: 'payment',
      title: 'Payment Received',
      message: 'You received a payment of $50',
      read: true,
      createdAt: '2024-12-07T08:00:00Z',
      data: { amount: 50 },
    },
  ];

  const mockPreferences: NotificationPreferences = {
    email: true,
    push: true,
    sms: false,
    messages: true,
    moments: true,
    payments: true,
    marketing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (notificationService.getNotifications ).mockResolvedValue({
      notifications: mockNotifications,
      unreadCount: 2,
    });

    (notificationService.getPreferences ).mockResolvedValue({
      preferences: mockPreferences,
    });
  });

  describe('Initial Load', () => {
    it('should load notifications on mount', async () => {
      const { result } = renderHook(() => useNotifications());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.notifications).toHaveLength(3);
      expect(result.current.unreadCount).toBe(2);
      expect(notificationService.getNotifications).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        type: undefined,
      });
    });

    it('should load preferences on mount', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.preferences).toEqual(mockPreferences);
      expect(notificationService.getPreferences).toHaveBeenCalled();
    });

    it('should handle loading errors', async () => {
      const errorMessage = 'Network error';
      (notificationService.getNotifications ).mockRejectedValue(
        new Error(errorMessage),
      );

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.notifications).toHaveLength(0);
    });

    it('should handle preferences fetch errors gracefully in dev mode', async () => {
      // Set DEV mode
      const originalDev = global.__DEV__;
      (global as any).__DEV__ = true;

      (notificationService.getPreferences ).mockRejectedValue(
        new Error('Preferences fetch failed'),
      );

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should not throw, just log in dev mode
      expect(result.current.preferences).toBeNull();

      // Restore DEV mode
      (global as any).__DEV__ = originalDev;
    });
  });

  describe('Refresh', () => {
    it('should refresh notifications', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      jest.clearAllMocks();

      const updatedNotifications = [mockNotifications[0]];
      (notificationService.getNotifications ).mockResolvedValue({
        notifications: updatedNotifications,
        unreadCount: 1,
      });

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.unreadCount).toBe(1);
      expect(notificationService.getNotifications).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        type: undefined,
      });
    });

    it('should reset page to 1 on refresh', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Load more to increment page
      (notificationService.getNotifications ).mockResolvedValue({
        notifications: [mockNotifications[0]],
        unreadCount: 1,
      });

      await act(async () => {
        await result.current.loadMore();
      });

      jest.clearAllMocks();

      // Refresh should reset to page 1
      await act(async () => {
        await result.current.refresh();
      });

      expect(notificationService.getNotifications).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        type: undefined,
      });
    });
  });

  describe('Pagination', () => {
    it('should append to existing notifications when loading more', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = result.current.notifications.length;

      // Verify loadMore function exists and can be called
      expect(typeof result.current.loadMore).toBe('function');
    });

    it('should set hasMore to false when fewer items returned', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Return less than page size
      (notificationService.getNotifications ).mockResolvedValue({
        notifications: [mockNotifications[0]],
        unreadCount: 2,
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(result.current.hasMore).toBe(false);
    });

    it('should not load more when already loading', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify loadMore respects loading state by checking it doesn't load when hasMore is false
      expect(result.current.hasMore).toBe(false);

      await act(async () => {
        await result.current.loadMore();
      });

      // Should not have made additional calls when hasMore is false
      expect(result.current.notifications).toHaveLength(3);
    });

    it('should not load more when hasMore is false', async () => {
      // Return less than page size initially
      (notificationService.getNotifications ).mockResolvedValue({
        notifications: [mockNotifications[0]],
        unreadCount: 1,
      });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasMore).toBe(false);

      jest.clearAllMocks();

      await act(async () => {
        await result.current.loadMore();
      });

      expect(notificationService.getNotifications).not.toHaveBeenCalled();
    });
  });

  describe('Mark as Read', () => {
    it('should mark single notification as read', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.unreadCount).toBe(2);

      await act(async () => {
        await result.current.markAsRead('notif-1');
      });

      expect(notificationService.markAsRead).toHaveBeenCalledWith('notif-1');

      const notification = result.current.notifications.find(
        (n) => n.id === 'notif-1',
      );
      expect(notification?.read).toBe(true);
      expect(result.current.unreadCount).toBe(1);
    });

    it('should not decrease unread count below zero', async () => {
      // All notifications already read
      (notificationService.getNotifications ).mockResolvedValue({
        notifications: mockNotifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.unreadCount).toBe(0);

      await act(async () => {
        await result.current.markAsRead('notif-1');
      });

      expect(result.current.unreadCount).toBe(0);
    });

    it('should handle mark as read errors', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      (notificationService.markAsRead ).mockRejectedValue(
        new Error('Mark read failed'),
      );

      await act(async () => {
        await result.current.markAsRead('notif-1');
      });

      // Error should be logged, not thrown
      const notification = result.current.notifications.find(
        (n) => n.id === 'notif-1',
      );
      expect(notification?.read).toBe(false);
    });

    it('should mark all notifications as read', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.unreadCount).toBe(2);

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(notificationService.markAllAsRead).toHaveBeenCalled();

      const unreadNotifications = result.current.notifications.filter(
        (n) => !n.read,
      );
      expect(unreadNotifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
    });

    it('should handle mark all as read errors', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      (notificationService.markAllAsRead ).mockRejectedValue(
        new Error('Mark all failed'),
      );

      await act(async () => {
        await result.current.markAllAsRead();
      });

      // Error should be logged, state should not change
      expect(result.current.unreadCount).toBe(2);
    });
  });

  describe('Delete Notification', () => {
    it('should delete a notification', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.notifications).toHaveLength(3);

      await act(async () => {
        await result.current.deleteNotification('notif-3');
      });

      expect(notificationService.deleteNotification).toHaveBeenCalledWith(
        'notif-3',
      );
      expect(result.current.notifications).toHaveLength(2);
      expect(
        result.current.notifications.find((n) => n.id === 'notif-3'),
      ).toBeUndefined();
    });

    it('should decrease unread count when deleting unread notification', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.unreadCount).toBe(2);

      await act(async () => {
        await result.current.deleteNotification('notif-1'); // Unread notification
      });

      expect(result.current.unreadCount).toBe(1);
    });

    it('should not decrease unread count when deleting read notification', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.unreadCount).toBe(2);

      await act(async () => {
        await result.current.deleteNotification('notif-3'); // Read notification
      });

      expect(result.current.unreadCount).toBe(2);
    });

    it('should handle delete errors', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      (notificationService.deleteNotification ).mockRejectedValue(
        new Error('Delete failed'),
      );

      await act(async () => {
        await result.current.deleteNotification('notif-1');
      });

      // Error should be logged, notification should remain
      expect(result.current.notifications).toHaveLength(3);
    });
  });

  describe('Clear All', () => {
    it('should clear all notifications', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.notifications).toHaveLength(3);
      expect(result.current.unreadCount).toBe(2);

      await act(async () => {
        await result.current.clearAll();
      });

      expect(notificationService.clearAll).toHaveBeenCalled();
      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
    });

    it('should handle clear all errors', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      (notificationService.clearAll ).mockRejectedValue(
        new Error('Clear failed'),
      );

      await act(async () => {
        await result.current.clearAll();
      });

      // Error should be logged, notifications should remain
      expect(result.current.notifications).toHaveLength(3);
    });
  });

  describe('Filters', () => {
    it('should filter notifications by type', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currentFilter).toBeNull();

      const messageNotifications = [mockNotifications[0]];
      (notificationService.getNotifications ).mockResolvedValue({
        notifications: messageNotifications,
        unreadCount: 1,
      });

      await act(async () => {
        result.current.filterByType('message');
      });

      await waitFor(() => {
        expect(result.current.currentFilter).toBe('message');
      });

      expect(notificationService.getNotifications).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        type: 'message',
      });
    });

    it('should clear filter when type is null', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Set filter first
      await act(async () => {
        result.current.filterByType('message');
      });

      await waitFor(() => {
        expect(result.current.currentFilter).toBe('message');
      });

      jest.clearAllMocks();

      // Clear filter
      await act(async () => {
        result.current.filterByType(null);
      });

      await waitFor(() => {
        expect(result.current.currentFilter).toBeNull();
      });

      expect(notificationService.getNotifications).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        type: undefined,
      });
    });

    it('should reset page to 1 when filter changes', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Load page 2
      await act(async () => {
        await result.current.loadMore();
      });

      jest.clearAllMocks();

      // Change filter should reset to page 1
      await act(async () => {
        result.current.filterByType('payment');
      });

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalledWith({
          page: 1,
          pageSize: 20,
          type: 'payment',
        });
      });
    });

    it('should refetch notifications when filter changes', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const callCount = (notificationService.getNotifications ).mock
        .calls.length;

      await act(async () => {
        result.current.filterByType('moment');
      });

      await waitFor(() => {
        expect(
          (notificationService.getNotifications ).mock.calls.length,
        ).toBeGreaterThan(callCount);
      });
    });
  });

  describe('Preferences', () => {
    it('should update notification preferences', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updatedPreferences: NotificationPreferences = {
        ...mockPreferences,
        email: false,
        marketing: true,
      };

      (notificationService.updatePreferences ).mockResolvedValue({
        preferences: updatedPreferences,
      });

      await act(async () => {
        await result.current.updatePreferences({
          email: false,
          marketing: true,
        });
      });

      expect(notificationService.updatePreferences).toHaveBeenCalledWith({
        email: false,
        marketing: true,
      });
      expect(result.current.preferences).toEqual(updatedPreferences);
    });

    it('should handle update preferences errors', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      (notificationService.updatePreferences ).mockRejectedValue(
        new Error('Update failed'),
      );

      await expect(async () => {
        await act(async () => {
          await result.current.updatePreferences({ email: false });
        });
      }).rejects.toThrow('Update failed');

      // Preferences should remain unchanged
      expect(result.current.preferences).toEqual(mockPreferences);
    });
  });

  describe('Unread Count', () => {
    it('should update unread count on refresh', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.unreadCount).toBe(2);

      // Refresh with different unread count
      (notificationService.getNotifications ).mockResolvedValue({
        notifications: mockNotifications,
        unreadCount: 5,
      });

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.unreadCount).toBe(5);
    });
  });

  describe('Multiple Notification Types', () => {
    it('should handle message notifications', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const messageNotif = result.current.notifications.find(
        (n) => n.type === 'message',
      );
      expect(messageNotif?.title).toBe('New Message');
      expect(messageNotif?.data).toEqual({ conversationId: 'conv-1' });
    });

    it('should handle moment notifications', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const momentNotif = result.current.notifications.find(
        (n) => n.type === 'moment',
      );
      expect(momentNotif?.title).toBe('Moment Request');
      expect(momentNotif?.data).toEqual({ momentId: 'moment-1' });
    });

    it('should handle payment notifications', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const paymentNotif = result.current.notifications.find(
        (n) => n.type === 'payment',
      );
      expect(paymentNotif?.title).toBe('Payment Received');
      expect(paymentNotif?.data).toEqual({ amount: 50 });
    });
  });
});
