/**
 * Notification Service
 * Push notifications, in-app notifications, and preferences
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { notificationsService as dbNotificationsService } from './supabaseDbService';
import { toRecord } from '../utils/jsonHelper';
import type { Database, Json } from '../types/database.types';

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

export interface NotificationFilters {
  unreadOnly?: boolean;
  type?: NotificationType;
  page?: number;
  pageSize?: number;
}

export interface NotificationPreferences {
  // Push notifications
  pushEnabled: boolean;
  messages: boolean;
  requests: boolean;
  reviews: boolean;
  followers: boolean;
  momentActivity: boolean;
  payments: boolean;
  marketing: boolean;

  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string; // HH:mm
}

// Notification Service
export const notificationService = {
  /**
   * Get notifications
   */
  getNotifications: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, count, error } = await dbNotificationsService.list(
        user.id,
        {
          limit: params?.pageSize,
        },
      );

      if (error) throw error;

      // Get unread count separately or assume we can get it from list if we didn't filter
      // For now, let's do a quick count query
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      const notifications: Notification[] = data.map(
        (row: Database['public']['Tables']['notifications']['Row']) => ({
          id: row.id,
          type: (row.type as NotificationType) || 'system',
          title: row.title,
          body: row.body || '',
          data: row.data as Record<string, unknown> | undefined,
          read: row.read || false,
          createdAt: row.created_at || new Date().toISOString(),
          // We might need to fetch related entities if they are not in the row
          // For now, we'll leave them undefined or extract from data if available
        }),
      );

      return { notifications, total: count, unreadCount: unreadCount || 0 };
    } catch (error) {
      logger.error('Get notifications error:', error);
      return { notifications: [], total: 0, unreadCount: 0 };
    }
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
    try {
      const { error } = await dbNotificationsService.markAsRead([
        notificationId,
      ]);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Mark notification read error:', error);
      return { success: false };
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await dbNotificationsService.markAllAsRead(user.id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Mark all notifications read error:', error);
      return { success: false };
    }
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (
    notificationId: string,
  ): Promise<{ success: boolean }> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Delete notification error:', error);
      return { success: false };
    }
  },

  /**
   * Clear all notifications
   */
  clearAll: async (): Promise<{ success: boolean }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Clear all notifications error:', error);
      return { success: false };
    }
  },

  /**
   * Get notification preferences
   */
  getPreferences: async (): Promise<{
    preferences: NotificationPreferences;
  }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const prefsRecord = toRecord(data.notification_preferences) ?? {};

      return {
        preferences: {
          pushEnabled: true,
          messages: prefsRecord.messages ?? true,
          requests: prefsRecord.requests ?? true,
          reviews: prefsRecord.reviews ?? true,
          followers: prefsRecord.followers ?? true,
          momentActivity: prefsRecord.momentActivity ?? true,
          payments: prefsRecord.payments ?? true,
          marketing: prefsRecord.marketing ?? false,
          quietHoursEnabled: prefsRecord.quietHoursEnabled ?? false,
          quietHoursStart: prefsRecord.quietHoursStart,
          quietHoursEnd: prefsRecord.quietHoursEnd,
        },
      };
    } catch (error) {
      logger.error('Get notification preferences error:', error);
      // Return defaults
      return {
        preferences: {
          pushEnabled: true,
          messages: true,
          requests: true,
          reviews: true,
          followers: true,
          momentActivity: true,
          payments: true,
          marketing: false,
          quietHoursEnabled: false,
        },
      };
    }
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (
    preferences: Partial<NotificationPreferences>,
  ): Promise<{ success: boolean }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch current prefs first to merge
      const { data: currentData } = await supabase
        .from('users')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      const currentPrefs =
        toRecord(currentData?.notification_preferences) ?? {};
      const newPrefs = { ...currentPrefs, ...preferences } as Record<
        string,
        unknown
      >;

      const { error } = await supabase
        .from('users')
        .update({ notification_preferences: newPrefs as unknown as Json })
        .eq('id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Update notification preferences error:', error);
      return { success: false };
    }
  },
};

export default notificationService;

// Helper functions
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'message':
      return 'chatbox-outline';
    case 'request_received':
      return 'gift-outline';
    case 'request_accepted':
      return 'checkmark-circle-outline';
    case 'request_declined':
      return 'close-circle-outline';
    case 'review_received':
      return 'star-outline';
    case 'new_follower':
      return 'person-add-outline';
    case 'moment_liked':
      return 'heart-outline';
    case 'payment_received':
      return 'cash-outline';
    default:
      return 'notifications-outline';
  }
};

export const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'request_accepted':
    case 'payment_received':
      return '#4CAF50'; // Green
    case 'request_declined':
    case 'kyc_rejected':
      return '#F44336'; // Red
    case 'message':
    case 'new_follower':
      return '#2196F3'; // Blue
    case 'moment_liked':
      return '#E91E63'; // Pink
    case 'request_received':
      return '#FFC107'; // Amber
    default:
      return '#757575'; // Grey
  }
};

export const getNotificationRoute = (
  notification: Notification,
): { name: string; params?: Record<string, unknown> } | null => {
  switch (notification.type) {
    case 'message':
      return {
        name: 'Chat',
        params: { conversationId: notification.data?.conversationId },
      };
    case 'request_received':
    case 'request_accepted':
      return {
        name: 'RequestDetails',
        params: { requestId: notification.requestId },
      };
    case 'review_received':
      return {
        name: 'Profile',
        params: { userId: notification.userId },
      };
    case 'new_follower':
      return {
        name: 'Profile',
        params: { userId: notification.userId },
      };
    case 'moment_liked':
    case 'moment_comment':
      return {
        name: 'MomentDetails',
        params: { momentId: notification.momentId },
      };
    default:
      return null;
  }
};
