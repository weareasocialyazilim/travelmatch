/**
 * Push Notifications Hook
 * Manage notification permissions, listeners, and badge count
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { logger } from '@/utils/logger';
import { addBreadcrumb } from '../config/sentry';
import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  removeNotificationSubscription,
  getBadgeCount,
  setBadgeCount,
} from '../utils/notifications';
import type { NavigationProp } from '@react-navigation/native';
import type * as Notifications from 'expo-notifications';

export function usePushNotifications() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [badgeCount, setBadgeCountState] = useState(0);

  const notificationListener = useRef<Notifications.Subscription | undefined>(
    undefined,
  );
  const responseListener = useRef<Notifications.Subscription | undefined>(
    undefined,
  );

  const handleNotificationNavigation = useCallback(
    (data: Record<string, unknown>) => {
      if (!data) return;

      try {
        // Navigate based on notification type
        // Using type assertions for dynamic navigation from push notifications
        if (data.type === 'booking' && data.bookingId) {
          (
            navigation as {
              navigate: (screen: string, params?: unknown) => void;
            }
          ).navigate('BookingDetail', {
            bookingId: data.bookingId as string,
          });
        } else if (data.type === 'message' && data.userId) {
          // Chat requires otherUser object - create minimal user for navigation
          (
            navigation as {
              navigate: (screen: string, params?: unknown) => void;
            }
          ).navigate('Chat', {
            otherUser: {
              id: data.userId as string,
              name: (data.userName as string) || 'User',
              avatar: '',
            },
          });
        } else if (data.type === 'moment' && data.momentId) {
          // MomentDetail requires full moment - navigate to a loading screen
          // that fetches the moment by ID
          (
            navigation as {
              navigate: (screen: string, params?: unknown) => void;
            }
          ).navigate('MomentPreview', {
            momentId: data.momentId as string,
          });
        } else if (data.screen) {
          (
            navigation as {
              navigate: (screen: string, params?: unknown) => void;
            }
          ).navigate(data.screen as string);
        }
      } catch (error) {
        logger.error('Error navigating from notification', error as Error);
      }
    },
    [navigation],
  );

  useEffect(() => {
    // Only set up listeners, do NOT request permissions automatically
    // Permissions should be requested when the user enables notifications in settings

    // Load initial badge count
    void getBadgeCount().then(setBadgeCountState);

    // Listen for notifications while app is foregrounded
    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
        addBreadcrumb('Notification received', 'notification', 'info', {
          title: notification.request.content.title,
        });

        // Increment badge count
        setBadgeCountState((prev) => {
          const newCount = prev + 1;
          void setBadgeCount(newCount);
          return newCount;
        });
      },
    );

    // Listen for user interaction with notifications
    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;

      addBreadcrumb('Notification tapped', 'notification', 'info', { data });

      // Handle deep linking from notification
      void handleNotificationNavigation(data);

      // Decrement badge count
      setBadgeCountState((prev) => {
        const newCount = Math.max(0, prev - 1);
        void setBadgeCount(newCount);
        return newCount;
      });
    });

    return () => {
      if (notificationListener.current) {
        removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        removeNotificationSubscription(responseListener.current);
      }
    };
  }, [handleNotificationNavigation]);

  const requestPermissions = async () => {
    const token = await registerForPushNotifications();
    if (token) {
      setExpoPushToken(token);
      addBreadcrumb('Push token registered', 'notification', 'info', {
        token,
      });
      // Send token to backend
      try {
        const { registerPushToken } = await import(
          '../services/pushTokenService'
        );
        await registerPushToken(token, {
          enabled: true,
          channels: {
            messages: true,
            moments: true,
            gifts: true,
            trustNotes: true,
            matches: true,
            recommendations: true,
            marketing: false,
          },
        });
        logger.info('[Push] Token sent to backend');
      } catch (error) {
        logger.error('[Push] Failed to send token to backend', error as Error);
      }
    }
    return token;
  };

  return {
    expoPushToken,
    notification,
    badgeCount,
    clearBadge,
    requestPermissions,
  };
}
