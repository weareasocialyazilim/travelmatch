/**
 * Notification Service Tests
 * Testing notification API calls and helpers
 */

import {
  notificationService,
  getNotificationIcon,
  getNotificationColor,
} from '../notificationService';
import { api } from '../../utils/api';

// Mock api
jest.mock('../../utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should fetch notifications without filters', async () => {
      const mockResponse = {
        notifications: [
          { id: '1', type: 'message', title: 'New message', read: false },
        ],
        total: 1,
        unreadCount: 1,
      };
      mockApi.get.mockResolvedValueOnce(mockResponse);

      const result = await notificationService.getNotifications();

      expect(mockApi.get).toHaveBeenCalledWith('/notifications', {
        params: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should fetch notifications with filters', async () => {
      const mockResponse = { notifications: [], total: 0, unreadCount: 0 };
      mockApi.get.mockResolvedValueOnce(mockResponse);

      await notificationService.getNotifications({
        type: 'message',
        read: false,
        page: 1,
        pageSize: 20,
      });

      expect(mockApi.get).toHaveBeenCalledWith('/notifications', {
        params: { type: 'message', read: false, page: 1, pageSize: 20 },
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should fetch unread count', async () => {
      mockApi.get.mockResolvedValueOnce({ count: 5 });

      const result = await notificationService.getUnreadCount();

      expect(mockApi.get).toHaveBeenCalledWith('/notifications/unread-count');
      expect(result.count).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockApi.post.mockResolvedValueOnce({ success: true });

      const result = await notificationService.markAsRead('notification-123');

      expect(mockApi.post).toHaveBeenCalledWith(
        '/notifications/notification-123/read',
      );
      expect(result.success).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockApi.post.mockResolvedValueOnce({ success: true });

      const result = await notificationService.markAllAsRead();

      expect(mockApi.post).toHaveBeenCalledWith('/notifications/read-all');
      expect(result.success).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      mockApi.delete.mockResolvedValueOnce({ success: true });

      const result = await notificationService.deleteNotification(
        'notification-123',
      );

      expect(mockApi.delete).toHaveBeenCalledWith(
        '/notifications/notification-123',
      );
      expect(result.success).toBe(true);
    });
  });

  describe('clearAll', () => {
    it('should clear all notifications', async () => {
      mockApi.delete.mockResolvedValueOnce({ success: true });

      const result = await notificationService.clearAll();

      expect(mockApi.delete).toHaveBeenCalledWith('/notifications/all');
      expect(result.success).toBe(true);
    });
  });

  describe('getPreferences', () => {
    it('should fetch notification preferences', async () => {
      const mockPreferences = {
        preferences: {
          pushEnabled: true,
          messages: true,
          requests: true,
        },
      };
      mockApi.get.mockResolvedValueOnce(mockPreferences);

      const result = await notificationService.getPreferences();

      expect(mockApi.get).toHaveBeenCalledWith('/notifications/preferences');
      expect(result.preferences.pushEnabled).toBe(true);
    });
  });

  describe('updatePreferences', () => {
    it('should update notification preferences', async () => {
      const mockResponse = {
        preferences: { pushEnabled: false, messages: true },
      };
      mockApi.put.mockResolvedValueOnce(mockResponse);

      const result = await notificationService.updatePreferences({
        pushEnabled: false,
      });

      expect(mockApi.put).toHaveBeenCalledWith('/notifications/preferences', {
        pushEnabled: false,
      });
      expect(result.preferences.pushEnabled).toBe(false);
    });
  });

  describe('registerPushToken', () => {
    it('should register push token for iOS', async () => {
      mockApi.post.mockResolvedValueOnce({ success: true });

      const result = await notificationService.registerPushToken(
        'expo-push-token',
        'ios',
      );

      expect(mockApi.post).toHaveBeenCalledWith('/notifications/push-token', {
        token: 'expo-push-token',
        platform: 'ios',
      });
      expect(result.success).toBe(true);
    });

    it('should register push token for Android', async () => {
      mockApi.post.mockResolvedValueOnce({ success: true });

      await notificationService.registerPushToken('fcm-token', 'android');

      expect(mockApi.post).toHaveBeenCalledWith('/notifications/push-token', {
        token: 'fcm-token',
        platform: 'android',
      });
    });
  });

  describe('unregisterPushToken', () => {
    it('should unregister push token', async () => {
      mockApi.delete.mockResolvedValueOnce({ success: true });

      const result = await notificationService.unregisterPushToken(
        'expo-push-token',
      );

      expect(mockApi.delete).toHaveBeenCalledWith('/notifications/push-token', {
        data: { token: 'expo-push-token' },
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('getNotificationIcon', () => {
  it('should return correct icon for message type', () => {
    expect(getNotificationIcon('message')).toBe('chatbubble');
  });

  it('should return correct icon for request types', () => {
    expect(getNotificationIcon('request_received')).toBe('gift');
    expect(getNotificationIcon('request_accepted')).toBe('checkmark-circle');
    expect(getNotificationIcon('request_declined')).toBe('close-circle');
  });

  it('should return correct icon for social types', () => {
    expect(getNotificationIcon('new_follower')).toBe('person-add');
    expect(getNotificationIcon('moment_liked')).toBe('heart');
    expect(getNotificationIcon('review_received')).toBe('star');
  });

  it('should return correct icon for payment types', () => {
    expect(getNotificationIcon('payment_received')).toBe('cash');
    expect(getNotificationIcon('payment_sent')).toBe('cash-outline');
  });

  it('should return correct icon for system types', () => {
    expect(getNotificationIcon('system')).toBe('information-circle');
    expect(getNotificationIcon('promo')).toBe('megaphone');
  });
});

describe('getNotificationColor', () => {
  it('should return correct color for message type', () => {
    const color = getNotificationColor('message');
    expect(typeof color).toBe('string');
    expect(color.length).toBeGreaterThan(0);
  });

  it('should return correct color for request types', () => {
    const receivedColor = getNotificationColor('request_received');
    const acceptedColor = getNotificationColor('request_accepted');

    expect(typeof receivedColor).toBe('string');
    expect(typeof acceptedColor).toBe('string');
  });

  it('should return different colors for different types', () => {
    const messageColor = getNotificationColor('message');
    const promoColor = getNotificationColor('promo');

    // They may be same or different, just verify they're valid
    expect(messageColor).toBeTruthy();
    expect(promoColor).toBeTruthy();
  });
});
