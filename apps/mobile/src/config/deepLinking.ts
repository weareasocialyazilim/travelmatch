/**
 * Deep Linking Configuration
 * Handles app links for moments, profiles, chats etc.
 */

import { Linking } from 'react-native';
import { logger } from '../utils/logger';

// App URL scheme
const APP_SCHEME = 'lovendo://';
const WEB_URL = 'https://www.lovendo.xyz';

// Deep link patterns
export const DEEP_LINK_PATTERNS = {
  MOMENT: 'moment/:momentId',
  PROFILE: 'profile/:userId',
  CHAT: 'chat/:conversationId',
  REQUEST: 'request/:requestId',
  NOTIFICATION: 'notifications',
  SETTINGS: 'settings',
  WALLET: 'wallet',
  DISCOVER: 'discover',
  CREATE_MOMENT: 'create',
};

// Type for linking config - using any to avoid strict type checks with react-navigation
type LinkingConfig = {
  prefixes: string[];
  config: {
    screens: Record<
      string,
      | string
      | { path: string; parse?: Record<string, (value: string) => string> }
    >;
  };
  getInitialURL: () => Promise<string | null>;
  subscribe: (listener: (url: string) => void) => () => void;
};

/**
 * Navigation linking configuration
 */
export const linkingConfig: LinkingConfig = {
  // Keep legacy prefixes for backward compatibility with existing installs/links.
  prefixes: [APP_SCHEME, WEB_URL, 'lovendo://', 'https://lovendo.app'],

  config: {
    screens: {
      // Auth screens
      Welcome: 'welcome',
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',

      // Main screens
      Discover: 'discover',
      Messages: 'messages',
      Requests: 'requests',
      Profile: 'profile',

      // Detail screens
      MomentDetail: {
        path: 'moment/:momentId',
        parse: {
          momentId: (momentId: string) => momentId,
        },
      },
      ProfileDetail: {
        path: 'profile/:userId',
        parse: {
          userId: (userId: string) => userId,
        },
      },
      Chat: {
        path: 'chat/:conversationId',
        parse: {
          conversationId: (conversationId: string) => conversationId,
        },
      },

      // Other screens
      CreateMoment: 'create',
      Wallet: 'wallet',
      Settings: 'settings',
      EditProfile: 'edit-profile',
      MyMoments: 'my-moments',
      SavedMoments: 'saved',
    },
  },

  // Handle initial URL
  async getInitialURL() {
    // Check if app was opened from a deep link
    const url = await Linking.getInitialURL();
    if (url != null) {
      return url;
    }
    return null;
  },

  // Listen for incoming links
  subscribe(listener) {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });

    return () => {
      subscription.remove();
    };
  },
};

/**
 * Generate deep link URL
 */
export const generateDeepLink = (
  type: 'moment' | 'profile' | 'chat' | 'request',
  id: string,
): string => {
  switch (type) {
    case 'moment':
      return `${APP_SCHEME}moment/${id}`;
    case 'profile':
      return `${APP_SCHEME}profile/${id}`;
    case 'chat':
      return `${APP_SCHEME}chat/${id}`;
    case 'request':
      return `${APP_SCHEME}request/${id}`;
    default:
      return APP_SCHEME;
  }
};

/**
 * Generate shareable web URL
 */
export const generateWebLink = (
  type: 'moment' | 'profile',
  id: string,
): string => {
  switch (type) {
    case 'moment':
      return `${WEB_URL}/moment/${id}`;
    case 'profile':
      return `${WEB_URL}/profile/${id}`;
    default:
      return WEB_URL;
  }
};

/**
 * Open URL with fallback
 */
export const openURL = async (url: string): Promise<boolean> => {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Failed to open URL:', error);
    return false;
  }
};

/**
 * Open email client
 */
export const openEmail = async (
  email: string,
  subject?: string,
  body?: string,
): Promise<boolean> => {
  let url = `mailto:${email}`;

  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  return openURL(url);
};

/**
 * Open phone dialer
 */
export const openPhone = async (phone: string): Promise<boolean> => {
  return openURL(`tel:${phone}`);
};

/**
 * Open SMS
 */
export const openSMS = async (
  phone: string,
  message?: string,
): Promise<boolean> => {
  let url = `sms:${phone}`;
  if (message) {
    url += `?body=${encodeURIComponent(message)}`;
  }
  return openURL(url);
};

/**
 * Open maps with location
 */
export const openMaps = async (
  latitude: number,
  longitude: number,
  label?: string,
): Promise<boolean> => {
  const encodedLabel = label ? encodeURIComponent(label) : '';

  // Try Apple Maps on iOS, Google Maps on Android
  const iosUrl = `maps:0,0?q=${encodedLabel}@${latitude},${longitude}`;
  const androidUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`;
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  // Try platform-specific URL first, fallback to web
  const canOpenIOS = await Linking.canOpenURL(iosUrl);
  if (canOpenIOS) return openURL(iosUrl);

  const canOpenAndroid = await Linking.canOpenURL(androidUrl);
  if (canOpenAndroid) return openURL(androidUrl);

  return openURL(webUrl);
};

export default {
  linkingConfig,
  generateDeepLink,
  generateWebLink,
  openURL,
  openEmail,
  openPhone,
  openSMS,
  openMaps,
};
