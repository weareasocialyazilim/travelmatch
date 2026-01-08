/**
 * i18n Configuration
 * Multi-language support with i18next
 * Language persistence with AsyncStorage
 */

import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/utils/logger';

// Import translations
import en from '../locales/en.json';
import tr from '../locales/tr.json';

// Storage key for language persistence
const LANGUAGE_STORAGE_KEY = '@travelmatch/language';

// Get device language
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  tr: { name: 'Turkish', nativeName: 'Türkçe' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Language detector for AsyncStorage persistence
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'tr')) {
        callback(savedLanguage);
        return;
      }
    } catch (error) {
      logger.warn('[i18n] Failed to load saved language:', error);
    }
    // Fallback to device language
    callback(deviceLanguage === 'tr' ? 'tr' : 'en');
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    } catch (error) {
      logger.warn('[i18n] Failed to save language:', error);
    }
  },
};

// i18n configuration with persistence
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      tr: { translation: tr },
    },
    fallbackLng: 'en',
    compatibilityJSON: 'v4', // React Native compatibility
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

// Helper to change language and persist
export const changeLanguageAndPersist = async (
  lng: SupportedLanguage,
): Promise<void> => {
  await i18n.changeLanguage(lng);
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch (error) {
    logger.warn('[i18n] Failed to persist language:', error);
  }
};

// Get current stored language (for initial load)
export const getStoredLanguage =
  async (): Promise<SupportedLanguage | null> => {
    try {
      const lng = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (lng === 'en' || lng === 'tr') return lng;
    } catch (error) {
      logger.warn('[i18n] Failed to get stored language:', error);
    }
    return null;
  };

export default i18n;
