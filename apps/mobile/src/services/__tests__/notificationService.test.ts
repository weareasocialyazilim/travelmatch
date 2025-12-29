/**
 * Notification Service Tests
 * Tests for notifications, preferences, and helper functions
 * Target Coverage: 90%+
 */

import {
  notificationService,
  getNotificationIcon,
  getNotificationColor,
  getNotificationRoute,
  Notification,
  NotificationType,
  NotificationPreferences,
} from '../notificationService';

// Mock dependencies
jest.mock('@/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock('../supabaseDbService', () => ({
  notificationsService: {
    list: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  },
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('@/utils/jsonHelper', () => ({
  toRecord: jest.fn((data) => data),
}));

// Import mocked modules
import { supabase } from '@/config/supabase';
import { notificationsService as dbNotificationsService } from '../supabaseDbService';
import { logger } from '@/utils/logger';
import { toRecord } from '@/utils/jsonHelper';

describe('notificationService', () => {
  // Mock data
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockNotificationRow = {
    id: 'notif-1',
    type: 'message',
    title: 'New Message',
    body: 'You have a new message from John',
    data: { conversationId: 'conv-123' },
    read: false,
    created_at: '2024-01-01T12:00:00Z',
    user_id: mockUser.id,
  };

  const mockNotification: Notification = {
    id: 'notif-1',
    type: 'message',
    title: 'New Message',
    body: 'You have a new message from John',
    data: { conversationId: 'conv-123' },
    read: false,
    createdAt: '2024-01-01T12:00:00Z',
  };

  const mockPreferences: NotificationPreferences = {
    pushEnabled: true,
    messages: true,
    requests: true,
    reviews: true,
    followers: true,
    momentActivity: true,
    payments: true,
    marketing: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default: authenticated user
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  // ========================================
  // GET NOTIFICATIONS TESTS
  // ========================================
  describe('getNotifications', () => {
    it('should return notifications successfully', async () => {
      (dbNotificationsService.list as jest.Mock).mockResolvedValue({
        data: [mockNotificationRow],
        count: 1,
        error: null,
      });

      // Mock unread count query
      const mockSelectUnread = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 3 }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelectUnread,
      });

      const result = await notificationService.getNotifications({ page: 1, pageSize: 20 });

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0]).toMatchObject({
        id: 'notif-1',
        type: 'message',
        title: 'New Message',
      });
      expect(result.total).toBe(1);
      expect(result.unreadCount).toBe(3);
    });

    it('should return empty array when not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await notificationService.getNotifications();

      expect(result.notifications).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.unreadCount).toBe(0);
      expect(logger.error).toHaveBeenCalledWith('Get notifications error:', expect.any(Error));
    });

    it('should handle database error', async () => {
      (dbNotificationsService.list as jest.Mock).mockResolvedValue({
        data: null,
        count: 0,
        error: new Error('Database error'),
      });

      const result = await notificationService.getNotifications();

      expect(result.notifications).toEqual([]);
      expect(logger.error).toHaveBeenCalledWith('Get notifications error:', expect.any(Error));
    });

    it('should handle missing notification type', async () => {
      const rowWithoutType = { ...mockNotificationRow, type: null };
      (dbNotificationsService.list as jest.Mock).mockResolvedValue({
        data: [rowWithoutType],
        count: 1,
        error: null,
      });

      const mockSelectUnread = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 0 }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelectUnread,
      });

      const result = await notificationService.getNotifications();

      expect(result.notifications[0].type).toBe('system');
    });
  });

  // ========================================
  // MARK AS READ TESTS
  // ========================================
  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      (dbNotificationsService.markAsRead as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await notificationService.markAsRead('notif-1');

      expect(result.success).toBe(true);
      expect(dbNotificationsService.markAsRead).toHaveBeenCalledWith(['notif-1']);
    });

    it('should return false on error', async () => {
      (dbNotificationsService.markAsRead as jest.Mock).mockResolvedValue({
        error: new Error('Failed to mark as read'),
      });

      const result = await notificationService.markAsRead('notif-1');

      expect(result.success).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Mark notification read error:', expect.any(Error));
    });
  });

  // ========================================
  // MARK ALL AS READ TESTS
  // ========================================
  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      (dbNotificationsService.markAllAsRead as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await notificationService.markAllAsRead();

      expect(result.success).toBe(true);
      expect(dbNotificationsService.markAllAsRead).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return false when not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await notificationService.markAllAsRead();

      expect(result.success).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Mark all notifications read error:', expect.any(Error));
    });

    it('should return false on database error', async () => {
      (dbNotificationsService.markAllAsRead as jest.Mock).mockResolvedValue({
        error: new Error('Database error'),
      });

      const result = await notificationService.markAllAsRead();

      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // DELETE NOTIFICATION TESTS
  // ========================================
  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      });

      const result = await notificationService.deleteNotification('notif-1');

      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('notifications');
    });

    it('should return false on error', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: new Error('Delete failed') }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      });

      const result = await notificationService.deleteNotification('notif-1');

      expect(result.success).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Delete notification error:', expect.any(Error));
    });
  });

  // ========================================
  // CLEAR ALL TESTS
  // ========================================
  describe('clearAll', () => {
    it('should clear all notifications successfully', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      });

      const result = await notificationService.clearAll();

      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('notifications');
    });

    it('should return false when not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await notificationService.clearAll();

      expect(result.success).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Clear all notifications error:', expect.any(Error));
    });

    it('should return false on database error', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: new Error('Clear failed') }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      });

      const result = await notificationService.clearAll();

      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // GET PREFERENCES TESTS
  // ========================================
  describe('getPreferences', () => {
    it('should return preferences successfully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { notification_preferences: mockPreferences },
            error: null,
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      (toRecord as jest.Mock).mockReturnValue(mockPreferences);

      const result = await notificationService.getPreferences();

      expect(result.preferences).toMatchObject({
        pushEnabled: true,
        messages: true,
        requests: true,
        quietHoursEnabled: false,
      });
    });

    it('should return default preferences when not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await notificationService.getPreferences();

      expect(result.preferences.pushEnabled).toBe(true);
      expect(result.preferences.marketing).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Get notification preferences error:', expect.any(Error));
    });

    it('should return default preferences on database error', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await notificationService.getPreferences();

      expect(result.preferences.pushEnabled).toBe(true);
      expect(result.preferences.messages).toBe(true);
    });

    it('should use defaults for missing preference fields', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { notification_preferences: {} },
            error: null,
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      (toRecord as jest.Mock).mockReturnValue({});

      const result = await notificationService.getPreferences();

      expect(result.preferences.messages).toBe(true);
      expect(result.preferences.marketing).toBe(false);
    });
  });

  // ========================================
  // UPDATE PREFERENCES TESTS
  // ========================================
  describe('updatePreferences', () => {
    it('should update preferences successfully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { notification_preferences: mockPreferences },
            error: null,
          }),
        }),
      });
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ update: mockUpdate });
      (toRecord as jest.Mock).mockReturnValue(mockPreferences);

      const result = await notificationService.updatePreferences({ marketing: true });

      expect(result.success).toBe(true);
    });

    it('should return false when not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await notificationService.updatePreferences({ marketing: true });

      expect(result.success).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Update notification preferences error:', expect.any(Error));
    });

    it('should merge with existing preferences', async () => {
      const existingPrefs = { messages: true, requests: false };
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { notification_preferences: existingPrefs },
            error: null,
          }),
        }),
      });
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ update: mockUpdate });
      (toRecord as jest.Mock).mockReturnValue(existingPrefs);

      await notificationService.updatePreferences({ marketing: true });

      expect(mockUpdate).toHaveBeenCalledWith({
        notification_preferences: expect.objectContaining({
          messages: true,
          requests: false,
          marketing: true,
        }),
      });
    });

    it('should return false on update error', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { notification_preferences: {} },
            error: null,
          }),
        }),
      });
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: new Error('Update failed') }),
      });
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ update: mockUpdate });
      (toRecord as jest.Mock).mockReturnValue({});

      const result = await notificationService.updatePreferences({ marketing: true });

      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // HELPER FUNCTION TESTS
  // ========================================
  describe('getNotificationIcon', () => {
    it('should return correct icon for message type', () => {
      expect(getNotificationIcon('message')).toBe('chatbox-outline');
    });

    it('should return correct icon for request_received type', () => {
      expect(getNotificationIcon('request_received')).toBe('gift-outline');
    });

    it('should return correct icon for request_accepted type', () => {
      expect(getNotificationIcon('request_accepted')).toBe('checkmark-circle-outline');
    });

    it('should return correct icon for request_declined type', () => {
      expect(getNotificationIcon('request_declined')).toBe('close-circle-outline');
    });

    it('should return correct icon for review_received type', () => {
      expect(getNotificationIcon('review_received')).toBe('star-outline');
    });

    it('should return correct icon for new_follower type', () => {
      expect(getNotificationIcon('new_follower')).toBe('person-add-outline');
    });

    it('should return correct icon for moment_liked type', () => {
      expect(getNotificationIcon('moment_liked')).toBe('heart-outline');
    });

    it('should return correct icon for payment_received type', () => {
      expect(getNotificationIcon('payment_received')).toBe('cash-outline');
    });

    it('should return default icon for unknown type', () => {
      expect(getNotificationIcon('system' as NotificationType)).toBe('notifications-outline');
      expect(getNotificationIcon('promo' as NotificationType)).toBe('notifications-outline');
    });
  });

  describe('getNotificationColor', () => {
    it('should return green for positive types', () => {
      expect(getNotificationColor('request_accepted')).toBe('#4CAF50');
      expect(getNotificationColor('payment_received')).toBe('#4CAF50');
    });

    it('should return red for negative types', () => {
      expect(getNotificationColor('request_declined')).toBe('#F44336');
      expect(getNotificationColor('kyc_rejected')).toBe('#F44336');
    });

    it('should return blue for communication types', () => {
      expect(getNotificationColor('message')).toBe('#2196F3');
      expect(getNotificationColor('new_follower')).toBe('#2196F3');
    });

    it('should return pink for moment_liked', () => {
      expect(getNotificationColor('moment_liked')).toBe('#E91E63');
    });

    it('should return amber for request_received', () => {
      expect(getNotificationColor('request_received')).toBe('#FFC107');
    });

    it('should return grey for default types', () => {
      expect(getNotificationColor('system' as NotificationType)).toBe('#757575');
      expect(getNotificationColor('promo' as NotificationType)).toBe('#757575');
    });
  });

  describe('getNotificationRoute', () => {
    it('should return Chat route for message type', () => {
      const notification: Notification = {
        ...mockNotification,
        type: 'message',
        data: { conversationId: 'conv-123' },
      };

      const route = getNotificationRoute(notification);

      expect(route).toEqual({
        name: 'Chat',
        params: { conversationId: 'conv-123' },
      });
    });

    it('should return RequestDetails route for request types', () => {
      const notification: Notification = {
        ...mockNotification,
        type: 'request_received',
        requestId: 'req-123',
      };

      const route = getNotificationRoute(notification);

      expect(route).toEqual({
        name: 'RequestDetails',
        params: { requestId: 'req-123' },
      });
    });

    it('should return Profile route for review_received', () => {
      const notification: Notification = {
        ...mockNotification,
        type: 'review_received',
        userId: 'reviewer-123',
      };

      const route = getNotificationRoute(notification);

      expect(route).toEqual({
        name: 'Profile',
        params: { userId: 'reviewer-123' },
      });
    });

    it('should return Profile route for new_follower', () => {
      const notification: Notification = {
        ...mockNotification,
        type: 'new_follower',
        userId: 'follower-123',
      };

      const route = getNotificationRoute(notification);

      expect(route).toEqual({
        name: 'Profile',
        params: { userId: 'follower-123' },
      });
    });

    it('should return MomentDetails route for moment_liked', () => {
      const notification: Notification = {
        ...mockNotification,
        type: 'moment_liked',
        momentId: 'moment-123',
      };

      const route = getNotificationRoute(notification);

      expect(route).toEqual({
        name: 'MomentDetails',
        params: { momentId: 'moment-123' },
      });
    });

    it('should return MomentDetails route for moment_comment', () => {
      const notification: Notification = {
        ...mockNotification,
        type: 'moment_comment',
        momentId: 'moment-456',
      };

      const route = getNotificationRoute(notification);

      expect(route).toEqual({
        name: 'MomentDetails',
        params: { momentId: 'moment-456' },
      });
    });

    it('should return null for system notifications', () => {
      const notification: Notification = {
        ...mockNotification,
        type: 'system',
      };

      const route = getNotificationRoute(notification);

      expect(route).toBeNull();
    });

    it('should return null for promo notifications', () => {
      const notification: Notification = {
        ...mockNotification,
        type: 'promo',
      };

      const route = getNotificationRoute(notification);

      expect(route).toBeNull();
    });
  });
});
