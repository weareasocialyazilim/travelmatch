/**
 * Keyboard Configuration Utility
 * Centralized keyboard settings and handling for consistent UX
 */

import { Keyboard, Platform, TextInputProps } from 'react-native';
import * as Localization from 'expo-localization';

/**
 * Keyboard types optimized for different input fields
 */
export const KEYBOARD_TYPES = {
  /** Standard text input */
  DEFAULT: 'default' as TextInputProps['keyboardType'],
  /** Email address input - shows @ and . easily */
  EMAIL: 'email-address' as TextInputProps['keyboardType'],
  /** Phone number input - numeric with + and - */
  PHONE: Platform.OS === 'ios' ? 'phone-pad' : 'phone-pad' as TextInputProps['keyboardType'],
  /** Numeric only - for codes, amounts */
  NUMERIC: 'number-pad' as TextInputProps['keyboardType'],
  /** Decimal numbers - for prices */
  DECIMAL: 'decimal-pad' as TextInputProps['keyboardType'],
  /** URL input */
  URL: 'url' as TextInputProps['keyboardType'],
  /** Search input - with search button */
  SEARCH: Platform.OS === 'ios' ? 'web-search' : 'default' as TextInputProps['keyboardType'],
  /** Twitter/Username input - no autocapitalize */
  USERNAME: 'default' as TextInputProps['keyboardType'],
} as const;

/**
 * Return key types for different actions
 */
export const RETURN_KEY_TYPES = {
  /** Default return key */
  DEFAULT: 'default' as TextInputProps['returnKeyType'],
  /** For form submission */
  DONE: 'done' as TextInputProps['returnKeyType'],
  /** Move to next field */
  NEXT: 'next' as TextInputProps['returnKeyType'],
  /** For search actions */
  SEARCH: 'search' as TextInputProps['returnKeyType'],
  /** For sending messages */
  SEND: 'send' as TextInputProps['returnKeyType'],
  /** Generic go action */
  GO: 'go' as TextInputProps['returnKeyType'],
  /** Join action (e.g., chat rooms) */
  JOIN: Platform.OS === 'ios' ? 'join' : 'go' as TextInputProps['returnKeyType'],
} as const;

/**
 * Autocapitalize settings
 */
export const AUTO_CAPITALIZE = {
  /** No auto capitalize - emails, usernames */
  NONE: 'none' as TextInputProps['autoCapitalize'],
  /** First letter of sentence */
  SENTENCES: 'sentences' as TextInputProps['autoCapitalize'],
  /** Every word - names, titles */
  WORDS: 'words' as TextInputProps['autoCapitalize'],
  /** All characters */
  CHARACTERS: 'characters' as TextInputProps['autoCapitalize'],
} as const;

/**
 * Pre-configured input settings for common field types
 */
export const INPUT_CONFIGS = {
  /** Email field configuration */
  email: {
    keyboardType: KEYBOARD_TYPES.EMAIL,
    autoCapitalize: AUTO_CAPITALIZE.NONE,
    autoCorrect: false,
    autoComplete: 'email' as TextInputProps['autoComplete'],
    textContentType: 'emailAddress' as TextInputProps['textContentType'],
  },

  /** Password field configuration */
  password: {
    keyboardType: KEYBOARD_TYPES.DEFAULT,
    autoCapitalize: AUTO_CAPITALIZE.NONE,
    autoCorrect: false,
    autoComplete: 'password' as TextInputProps['autoComplete'],
    textContentType: 'password' as TextInputProps['textContentType'],
    secureTextEntry: true,
  },

  /** New password field configuration */
  newPassword: {
    keyboardType: KEYBOARD_TYPES.DEFAULT,
    autoCapitalize: AUTO_CAPITALIZE.NONE,
    autoCorrect: false,
    autoComplete: 'password-new' as TextInputProps['autoComplete'],
    textContentType: 'newPassword' as TextInputProps['textContentType'],
    secureTextEntry: true,
  },

  /** Phone number field */
  phone: {
    keyboardType: KEYBOARD_TYPES.PHONE,
    autoCapitalize: AUTO_CAPITALIZE.NONE,
    autoCorrect: false,
    autoComplete: 'tel' as TextInputProps['autoComplete'],
    textContentType: 'telephoneNumber' as TextInputProps['textContentType'],
  },

  /** Full name field */
  name: {
    keyboardType: KEYBOARD_TYPES.DEFAULT,
    autoCapitalize: AUTO_CAPITALIZE.WORDS,
    autoCorrect: false,
    autoComplete: 'name' as TextInputProps['autoComplete'],
    textContentType: 'name' as TextInputProps['textContentType'],
  },

  /** Username/handle field */
  username: {
    keyboardType: KEYBOARD_TYPES.USERNAME,
    autoCapitalize: AUTO_CAPITALIZE.NONE,
    autoCorrect: false,
    autoComplete: 'username' as TextInputProps['autoComplete'],
    textContentType: 'username' as TextInputProps['textContentType'],
  },

  /** Search field */
  search: {
    keyboardType: KEYBOARD_TYPES.SEARCH,
    autoCapitalize: AUTO_CAPITALIZE.NONE,
    autoCorrect: true,
    returnKeyType: RETURN_KEY_TYPES.SEARCH,
  },

  /** Price/amount field */
  price: {
    keyboardType: KEYBOARD_TYPES.DECIMAL,
    autoCapitalize: AUTO_CAPITALIZE.NONE,
    autoCorrect: false,
  },

  /** Verification code field */
  code: {
    keyboardType: KEYBOARD_TYPES.NUMERIC,
    autoCapitalize: AUTO_CAPITALIZE.NONE,
    autoCorrect: false,
    textContentType: 'oneTimeCode' as TextInputProps['textContentType'],
  },

  /** Message/chat field */
  message: {
    keyboardType: KEYBOARD_TYPES.DEFAULT,
    autoCapitalize: AUTO_CAPITALIZE.SENTENCES,
    autoCorrect: true,
    returnKeyType: RETURN_KEY_TYPES.SEND,
  },

  /** Bio/description field */
  multiline: {
    keyboardType: KEYBOARD_TYPES.DEFAULT,
    autoCapitalize: AUTO_CAPITALIZE.SENTENCES,
    autoCorrect: true,
    multiline: true,
  },

  /** URL input */
  url: {
    keyboardType: KEYBOARD_TYPES.URL,
    autoCapitalize: AUTO_CAPITALIZE.NONE,
    autoCorrect: false,
    autoComplete: 'url' as TextInputProps['autoComplete'],
    textContentType: 'URL' as TextInputProps['textContentType'],
  },

  /** City/location field */
  location: {
    keyboardType: KEYBOARD_TYPES.DEFAULT,
    autoCapitalize: AUTO_CAPITALIZE.WORDS,
    autoCorrect: true,
    autoComplete: 'address-line1' as TextInputProps['autoComplete'],
  },
} as const;

/**
 * Get locale-aware keyboard settings
 */
export function getLocaleKeyboardSettings() {
  const locales = Localization.getLocales();
  const primaryLocale = locales[0];

  return {
    locale: primaryLocale?.languageTag || 'en-US',
    isRTL: primaryLocale?.textDirection === 'rtl',
    decimalSeparator: primaryLocale?.decimalSeparator || '.',
    digitGroupingSeparator: primaryLocale?.digitGroupingSeparator || ',',
  };
}

/**
 * Dismiss keyboard
 */
export function dismissKeyboard() {
  Keyboard.dismiss();
}

/**
 * Add keyboard listener
 */
export function addKeyboardListener(
  event: 'keyboardWillShow' | 'keyboardDidShow' | 'keyboardWillHide' | 'keyboardDidHide',
  callback: (e: { endCoordinates: { height: number } }) => void
) {
  const eventName = Platform.OS === 'ios'
    ? event
    : event.replace('Will', 'Did') as typeof event;

  return Keyboard.addListener(eventName, callback);
}

/**
 * Get keyboard avoiding view behavior based on platform
 */
export function getKeyboardAvoidingBehavior(): 'height' | 'padding' | 'position' | undefined {
  return Platform.OS === 'ios' ? 'padding' : undefined;
}

/**
 * Get keyboard vertical offset for KeyboardAvoidingView
 */
export function getKeyboardVerticalOffset(hasHeader = true): number {
  if (Platform.OS === 'ios') {
    return hasHeader ? 90 : 0;
  }
  return 0;
}

export default {
  KEYBOARD_TYPES,
  RETURN_KEY_TYPES,
  AUTO_CAPITALIZE,
  INPUT_CONFIGS,
  getLocaleKeyboardSettings,
  dismissKeyboard,
  addKeyboardListener,
  getKeyboardAvoidingBehavior,
  getKeyboardVerticalOffset,
};
