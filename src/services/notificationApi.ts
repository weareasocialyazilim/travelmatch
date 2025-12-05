/**
 * Notification API Service
 * Backend integration for notification preferences
 */
import { logger } from '../utils/logger';

import { api } from '../utils/api';

export interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  channel: 'push' | 'email' | 'sms';
}

export interface NotificationSettings {
  preferences: NotificationPreference[];
  globalEnabled: boolean;
  doNotDisturbStart?: string;
  doNotDisturbEnd?: string;
}

/**
 * Get user notification preferences
 */
export const getNotificationPreferences =
  async (): Promise<NotificationSettings> => {
    try {
      const response = (await api.get('/notifications/preferences')) as {
        data: NotificationSettings;
      };
      return response.data;
    } catch (error) {
      logger.error('[NotificationAPI] Error fetching preferences:', error);
      throw error;
    }
  };

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (
  settings: NotificationSettings,
): Promise<void> => {
  try {
    await api.put('/notifications/preferences', settings);
  } catch (error) {
    logger.error('[NotificationAPI] Error updating preferences:', error);
    throw error;
  }
};

/**
 * Update single preference
 */
export const updatePreference = async (
  preferenceId: string,
  enabled: boolean,
): Promise<void> => {
  try {
    await api.patch(`/notifications/preferences/${preferenceId}`, { enabled });
  } catch (error) {
    logger.error('[NotificationAPI] Error updating preference:', error);
    throw error;
  }
};

/**
 * Toggle global notifications
 */
export const toggleGlobalNotifications = async (
  enabled: boolean,
): Promise<void> => {
  try {
    await api.patch('/notifications/global', { enabled });
  } catch (error) {
    logger.error(
      '[NotificationAPI] Error toggling global notifications:',
      error,
    );
    throw error;
  }
};
