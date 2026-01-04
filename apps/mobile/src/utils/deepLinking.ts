/**
 * Deep Linking Configuration
 * Handle app deep links and universal links
 */

import { Linking } from 'react-native';
import { logger } from './logger';
import type { RootStackParamList } from '../navigation/types';
import type {
  NavigationContainerRef,
  NavigationProp,
} from '@react-navigation/native';

// Type that works with both NavigationContainerRef and NavigationProp
type NavigationRefLike =
  | NavigationContainerRef<RootStackParamList>
  | (NavigationProp<RootStackParamList> & { isReady?: () => boolean });

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

      // Chat
      Messages: 'messages',
      Chat: 'chat/:conversationId',

      // Payment
      Payment: 'payment/:momentId',

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

  // Handle OAuth callback
  if (screen === 'auth' && pathParts[0] === 'callback') {
    // OAuth callback is handled separately
    // Extract params from URL hash/query
    return { screen: undefined, params: undefined };
  }

  // Map URL to screen
  const screenMap: Record<string, keyof RootStackParamList> = {
    moment: 'MomentDetail',
    profile: 'Profile',
    chat: 'Chat',
    // Add more mappings
  };

  const screenName = screen ? screenMap[screen] : undefined;
  if (!screenName) return {};

  // Extract params
  const params: Record<string, string> = {};
  if (screen === 'moment' && pathParts[0]) {
    params.momentId = pathParts[0];
  } else if (screen === 'profile' && pathParts[0]) {
    params.userId = pathParts[0];
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
  navigation: NavigationRefLike,
  onOAuthCallback?: (url: string) => void,
) {
  // Check if this is an OAuth callback
  if (url.includes('/auth/callback')) {
    logger.info('Deep link: OAuth callback detected');
    if (onOAuthCallback) {
      onOAuthCallback(url);
    }
    return;
  }

  const { screen, params } = parseDeepLink(url);

  // Check if navigation is ready (if method exists) or assume ready
  const isReady =
    'isReady' in navigation && typeof navigation.isReady === 'function'
      ? navigation.isReady()
      : true;

  if (screen && isReady) {
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
    logger.error('Error getting initial URL:', error);
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
      return `${baseUrl}/moment/${String(params?.momentId ?? '')}`;
    case 'Profile':
      return `${baseUrl}/profile/${String(params?.userId ?? '')}`;
    case 'Chat':
      return `${baseUrl}/chat/${String(params?.conversationId ?? '')}`;
    default:
      return baseUrl;
  }
}
