/**
 * Notification Service
 * Push notifications, in-app notifications, and preferences
 */

import { api } from '../utils/api';
import { COLORS } from '../constants/colors';

// Types
export type NotificationType =
  | 'message'
  | 'request_received'
  | 'request_accepted'
  | 'request_declined'
  | 'request_cancelled'
  | 'request_completed'
  | 'review_received'
  | 'new_follower'
  | 'moment_liked'
  | 'moment_saved'
  | 'moment_comment'
  | 'payment_received'
  | 'payment_sent'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'system'
  | 'promo';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;

  // Related entities
  userId?: string;
  userName?: string;
  userAvatar?: string;
  momentId?: string;
  momentImage?: string;
  requestId?: string;
}

export interface NotificationPreferences {
  // Push notifications
  pushEnabled: boolean;

  // Notification types
  messages: boolean;
  requests: boolean;
  reviews: boolean;
  followers: boolean;
  momentActivity: boolean;
  payments: boolean;
  marketing: boolean;

  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string; // HH:mm format
}

export interface NotificationFilters {
  type?: NotificationType;
  read?: boolean;
  page?: number;
  pageSize?: number;
}

// Notification Service
export const notificationService = {
  /**
   * Get notifications list
   */
  getNotifications: async (
    filters?: NotificationFilters,
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }> => {
    return api.get('/notifications', { params: filters });
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    return api.get('/notifications/unread-count');
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
    return api.post(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    return api.post('/notifications/read-all');
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (
    notificationId: string,
  ): Promise<{ success: boolean }> => {
    return api.delete(`/notifications/${notificationId}`);
  },

  /**
   * Clear all notifications
   */
  clearAll: async (): Promise<{ success: boolean }> => {
    return api.delete('/notifications/all');
  },

  /**
   * Get notification preferences
   */
  getPreferences: async (): Promise<{
    preferences: NotificationPreferences;
  }> => {
    return api.get('/notifications/preferences');
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (
    preferences: Partial<NotificationPreferences>,
  ): Promise<{ preferences: NotificationPreferences }> => {
    return api.put('/notifications/preferences', preferences);
  },

  /**
   * Register push token
   */
  registerPushToken: async (
    token: string,
    platform: 'ios' | 'android',
  ): Promise<{ success: boolean }> => {
    return api.post('/notifications/push-token', { token, platform });
  },

  /**
   * Unregister push token
   */
  unregisterPushToken: async (token: string): Promise<{ success: boolean }> => {
    return api.delete('/notifications/push-token', { data: { token } });
  },
};

// Helper functions
export const getNotificationIcon = (type: NotificationType): string => {
  const icons: Record<NotificationType, string> = {
    message: 'chatbubble',
    request_received: 'gift',
    request_accepted: 'checkmark-circle',
    request_declined: 'close-circle',
    request_cancelled: 'close-circle-outline',
    request_completed: 'checkmark-done',
    review_received: 'star',
    new_follower: 'person-add',
    moment_liked: 'heart',
    moment_saved: 'bookmark',
    moment_comment: 'chatbox',
    payment_received: 'cash',
    payment_sent: 'cash-outline',
    kyc_approved: 'shield-checkmark',
    kyc_rejected: 'shield-outline',
    system: 'information-circle',
    promo: 'megaphone',
  };
  return icons[type];
};

export const getNotificationColor = (type: NotificationType): string => {
  const colors: Record<NotificationType, string> = {
    message: COLORS.info,
    request_received: COLORS.emerald,
    request_accepted: COLORS.emerald,
    request_declined: COLORS.error,
    request_cancelled: COLORS.grayMedium,
    request_completed: COLORS.emerald,
    review_received: COLORS.warning,
    new_follower: COLORS.violet,
    moment_liked: COLORS.pink,
    moment_saved: COLORS.warning,
    moment_comment: COLORS.info,
    payment_received: COLORS.emerald,
    payment_sent: COLORS.warning,
    kyc_approved: COLORS.emerald,
    kyc_rejected: COLORS.error,
    system: COLORS.grayMedium,
    promo: COLORS.violet,
  };
  return colors[type];
};

export const getNotificationRoute = (
  notification: Notification,
): { screen: string; params?: Record<string, unknown> } | null => {
  switch (notification.type) {
    case 'message':
      return notification.userId
        ? { screen: 'ChatDetail', params: { recipientId: notification.userId } }
        : null;

    case 'request_received':
    case 'request_accepted':
    case 'request_declined':
    case 'request_cancelled':
    case 'request_completed':
      return notification.requestId
        ? {
            screen: 'RequestDetail',
            params: { requestId: notification.requestId },
          }
        : null;

    case 'review_received':
      return { screen: 'MyReviews' };

    case 'new_follower':
      return notification.userId
        ? { screen: 'UserProfile', params: { userId: notification.userId } }
        : null;

    case 'moment_liked':
    case 'moment_saved':
    case 'moment_comment':
      return notification.momentId
        ? {
            screen: 'MomentDetail',
            params: { momentId: notification.momentId },
          }
        : null;

    case 'payment_received':
    case 'payment_sent':
      return { screen: 'Transactions' };

    case 'kyc_approved':
    case 'kyc_rejected':
      return { screen: 'IdentityVerification' };

    default:
      return null;
  }
};

export default notificationService;
