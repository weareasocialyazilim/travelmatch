/**
 * Push Notifications Setup
 * expo-notifications configuration and utilities
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { COLORS } from '../constants/colors';
import { logger } from './logger';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
});

/**
 * Register for push notifications
 * Returns push token or null if failed
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    logger.warn('Push notifications only work on physical devices');
    return null;
  }

  try {
    // Check existing permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      logger.warn('Push notification permission denied');
      return null;
    }

    // Get push token

    const projectId = Constants.expoConfig?.extra?.eas?.projectId as
      | string
      | undefined;

    if (!projectId) {
      logger.warn('No Expo project ID found. Add to app.json');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    // Android-specific configuration
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: COLORS.brand.secondary,
      });
    }

    return token.data;
  } catch (error) {
    logger.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  trigger?: Notifications.NotificationTriggerInput,
) {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: trigger ?? null, // null = immediate
    });
    return id;
  } catch (error) {
    logger.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    logger.error('Error canceling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    logger.error('Error canceling all notifications:', error);
  }
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    logger.error('Error getting badge count:', error);
    return 0;
  }
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number) {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    logger.error('Error setting badge count:', error);
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications() {
  try {
    await Notifications.dismissAllNotificationsAsync();
    await setBadgeCount(0);
  } catch (error) {
    logger.error('Error clearing notifications:', error);
  }
}

/**
 * Add notification listener
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void,
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (user tapped notification)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Remove notification listener
 */
export function removeNotificationSubscription(
  subscription: Notifications.Subscription,
) {
  subscription.remove();
}
