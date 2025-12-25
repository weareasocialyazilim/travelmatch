/**
 * Push Token Sync Service
 * Synchronize device push tokens with notification preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import type { Json } from '../types/database.types';

const PUSH_TOKEN_KEY = '@push_token';

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

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    return token;
  } catch (error) {
    logger.error('[PushToken] Get token failed:', error);
    return null;
  }
};

/**
 * Register push token with backend
 */
export const registerPushToken = async (token: string): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.warn('[PushToken] User not authenticated, skipping registration');
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ push_token: token })
      .eq('id', user.id);

    if (error) throw error;

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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.warn(
        '[PushToken] User not authenticated, skipping preference update',
      );
      return;
    }

    // Map preferences to DB structure if needed
    // For now, we assume notification_preferences column handles this
    const { error } = await supabase
      .from('users')
      .update({ notification_preferences: preferences as unknown as Json })
      .eq('id', user.id);

    if (error) throw error;

    logger.info('[PushToken] Preferences updated');
  } catch (error) {
    logger.error('[PushToken] Update failed:', error);
    throw error;
  }
};

/**
 * Unregister push token
 */
export const unregisterPushToken = async (_token: string): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from('users')
        .update({ push_token: null })
        .eq('id', user.id);
    }

    await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
    logger.info('[PushToken] Unregistered successfully');
  } catch (error) {
    logger.error('[PushToken] Unregister failed:', error);
    throw error;
  }
};
