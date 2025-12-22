/**
 * i18n Configuration
 * Multi-language support with i18next
 */

import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import en from '../locales/en.json';
import tr from '../locales/tr.json';
import formsEn from '../i18n/en/forms.json';
import formsTr from '../i18n/tr/forms.json';

// Get device language
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  tr: { name: 'Turkish', nativeName: 'Türkçe' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// i18n configuration
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { ...en, ...formsEn } },
    tr: { translation: { ...tr, ...formsTr } },
  },
  lng: deviceLanguage,
  fallbackLng: 'en',
  compatibilityJSON: 'v4', // React Native compatibility
  interpolation: {
    escapeValue: false, // React already escapes
  },
  react: {
    useSuspense: false, // Disable suspense for React Native
  },
});

export default i18n;
