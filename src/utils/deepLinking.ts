/**
 * Deep Linking Configuration
 * Handle app deep links and universal links
 */

import { Linking } from 'react-native';
import type { NavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';

export const DEEP_LINK_CONFIG = {
  prefixes: ['travelmatch://', 'https://travelmatch.app'],
  config: {
    screens: {
      // Auth
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',
      ResetPassword: 'reset-password/:token',

      // Main
      Home: 'home',
      Explore: 'explore',

      // Moments
      MomentDetail: 'moment/:momentId',
      CreateMoment: 'create-moment',
      EditMoment: 'edit-moment/:momentId',

      // Profile
      Profile: 'profile/:userId',
      EditProfile: 'edit-profile',

      // Booking
      BookingRequest: 'booking/:momentId',
      BookingDetail: 'booking/:bookingId',

      // Chat
      Messages: 'messages',
      Chat: 'chat/:conversationId',

      // Payment
      Payment: 'payment/:bookingId',

      // Settings
      Settings: 'settings',
      Notifications: 'notifications',

      // Not Found
      NotFound: '*',
    },
  },
};

/**
 * Deep link params type
 */
type DeepLinkParams = Record<string, string | number | boolean>;

/**
 * Parse deep link URL
 */
export function parseDeepLink(url: string): {
  screen?: keyof RootStackParamList;
  params?: DeepLinkParams;
} {
  // Remove protocol and domain
  const path = url.replace(
    /^(travelmatch:\/\/|https:\/\/travelmatch\.app\/)/,
    '',
  );
  const [screen, ...pathParts] = path.split('/');

  // Map URL to screen
  const screenMap: Record<string, keyof RootStackParamList> = {
    moment: 'MomentDetail',
    profile: 'Profile',
    booking: 'BookingDetail',
    chat: 'Chat',
    // Add more mappings
  };

  const screenName = screenMap[screen];
  if (!screenName) return {};

  // Extract params
  const params: Record<string, string> = {};
  if (screen === 'moment' && pathParts[0]) {
    params.momentId = pathParts[0];
  } else if (screen === 'profile' && pathParts[0]) {
    params.userId = pathParts[0];
  } else if (screen === 'booking' && pathParts[0]) {
    params.bookingId = pathParts[0];
  } else if (screen === 'chat' && pathParts[0]) {
    params.conversationId = pathParts[0];
  }

  return { screen: screenName, params };
}

/**
 * Handle deep link
 */
export function handleDeepLink(
  url: string,
  navigation: NavigationContainerRef<RootStackParamList>,
) {
  const { screen, params } = parseDeepLink(url);

  if (screen && navigation.isReady()) {
    // Type assertion needed for dynamic navigation with parsed params
    // @ts-expect-error - Navigation params are validated by parseDeepLink
    navigation.navigate(screen, params);
  }
}

/**
 * Get initial deep link URL
 */
export async function getInitialURL(): Promise<string | null> {
  try {
    return await Linking.getInitialURL();
  } catch (error) {
    console.error('Error getting initial URL:', error);
    return null;
  }
}

/**
 * Subscribe to deep link events
 */
export function subscribeToDeepLinks(
  callback: (url: string) => void,
): () => void {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    callback(url);
  });

  return () => subscription.remove();
}

/**
 * Generate deep link URL
 */
export function generateDeepLink(
  screen: keyof RootStackParamList,
  params?: DeepLinkParams,
): string {
  const baseUrl = 'https://travelmatch.app';

  switch (screen) {
    case 'MomentDetail':
      return `${baseUrl}/moment/${params?.momentId || ''}`;
    case 'Profile':
      return `${baseUrl}/profile/${params?.userId || ''}`;
    case 'BookingDetail':
      return `${baseUrl}/booking/${params?.bookingId || ''}`;
    case 'Chat':
      return `${baseUrl}/chat/${params?.conversationId || ''}`;
    default:
      return baseUrl;
  }
}
