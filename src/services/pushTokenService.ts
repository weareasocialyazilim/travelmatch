/**
 * Push Token Sync Service
 * Synchronize device push tokens with notification preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { logger } from '../utils/logger';

const PUSH_TOKEN_KEY = '@push_token';
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.travelmatch.com';

export interface PushTokenPreferences {
  channels: {
    messages?: boolean;
    moments?: boolean;
    gifts?: boolean;
    trustNotes?: boolean;
    matches?: boolean;
    recommendations?: boolean;
    marketing?: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
  };
  enabled: boolean;
}

/**
 * Get current push token
 */
export const getPushToken = async (): Promise<string | null> => {
  try {
    // First check AsyncStorage
    const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (storedToken) {
      return storedToken;
    }

    // Request new token
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      logger.warn('[PushToken] Permission not granted');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PROJECT_ID,
    });

    const token = tokenData.data;
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

    logger.info('[PushToken] Token obtained:', token.substring(0, 20) + '...');
    return token;
  } catch (error) {
    logger.error('[PushToken] Error getting token:', error);
    return null;
  }
};

/**
 * Register push token with backend
 */
export const registerPushToken = async (
  token: string,
  preferences: PushTokenPreferences,
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/push-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        platform: 'expo',
        preferences,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    logger.info('[PushToken] Registered successfully');
  } catch (error) {
    logger.error('[PushToken] Registration failed:', error);
    throw error;
  }
};

/**
 * Update push token preferences
 */
export const updatePushTokenPreferences = async (
  token: string,
  preferences: PushTokenPreferences,
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/push-tokens/${token}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preferences,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    logger.info('[PushToken] Preferences updated');
  } catch (error) {
    logger.error('[PushToken] Update failed:', error);
    throw error;
  }
};

/**
 * Unregister push token
 */
export const unregisterPushToken = async (token: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/push-tokens/${token}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
    logger.info('[PushToken] Unregistered successfully');
  } catch (error) {
    logger.error('[PushToken] Unregister failed:', error);
    throw error;
  }
};

/**
 * Send test notification to verify push token is working
 */
export const sendTestNotification = async (): Promise<void> => {
  try {
    const token = await getPushToken();

    if (!token) {
      throw new Error('No push token available');
    }

    const response = await fetch(`${API_BASE_URL}/user/notifications/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        title: 'Test Notification',
        body: 'Your notifications are working! 🎉',
        data: {
          type: 'test',
          timestamp: Date.now(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    logger.info('[PushToken] Test notification sent successfully');
  } catch (error) {
    logger.error('[PushToken] Test notification failed:', error);
    throw error;
  }
};

/**
 * Sync notification preferences with push token
 */
export const syncNotificationPreferences = async (
  preferences: PushTokenPreferences,
): Promise<void> => {
  try {
    const token = await getPushToken();

    if (!token) {
      logger.warn('[PushToken] No token available, skipping sync');
      return;
    }

    // If notifications disabled globally, unregister
    if (!preferences.enabled) {
      await unregisterPushToken(token);
      return;
    }

    // Update preferences
    await updatePushTokenPreferences(token, preferences);

    logger.info('[PushToken] Preferences synced successfully');
  } catch (error) {
    logger.error('[PushToken] Sync failed:', error);
    // Don't throw - this is a background operation
  }
};

export default {
  getPushToken,
  registerPushToken,
  updatePushTokenPreferences,
  unregisterPushToken,
  sendTestNotification,
  syncNotificationPreferences,
};
