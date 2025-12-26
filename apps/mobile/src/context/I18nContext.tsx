/**
 * Internationalization (i18n) Context
 * Manages language selection and translations
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Import translations
import en from '../locales/en.json';
import tr from '../locales/tr.json';

// Types
export type SupportedLanguage = 'en' | 'tr';

type TranslationKeys = typeof en;

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
  supportedLanguages: {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
  }[];
}

// Translations map
const translations: Record<SupportedLanguage, TranslationKeys> = {
  en,
  tr,
};

// Supported languages
const SUPPORTED_LANGUAGES = [
  { code: 'en' as SupportedLanguage, name: 'English', nativeName: 'English' },
  { code: 'tr' as SupportedLanguage, name: 'Turkish', nativeName: 'Türkçe' },
];

// Storage key
const LANGUAGE_STORAGE_KEY = '@app_language';

// Context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Get nested value from object by dot notation
const getNestedValue = (
  obj: Record<string, unknown>,
  path: string,
): string | undefined => {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : undefined;
};

// Provider
interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

        if (
          savedLanguage &&
          (savedLanguage === 'en' || savedLanguage === 'tr')
        ) {
          setLanguageState(savedLanguage);
        } else {
          // Use device language if available
          const locales = Localization.getLocales();
          const deviceLocale = locales[0]?.languageCode || 'en';
          if (deviceLocale === 'tr') {
            setLanguageState('tr');
          }
        }
      } catch {
        // Use default language on error
      } finally {
        setIsInitialized(true);
      }
    };

    loadLanguage();
  }, []);

  // Set language and persist
  const setLanguage = useCallback(async (lang: SupportedLanguage) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
    } catch {
      // Silent fail, still update state
      setLanguageState(lang);
    }
  }, []);

  // Translation function
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const translation = getNestedValue(translations[language], key);

      if (!translation) {
        // Fallback to English
        const fallback = getNestedValue(translations.en, key);
        if (!fallback) {
          // Return key if no translation found
          return key;
        }
        return interpolate(fallback, params);
      }

      return interpolate(translation, params);
    },
    [language],
  );

  // Interpolate params into translation string
  const interpolate = (
    text: string,
    params?: Record<string, string | number>,
  ): string => {
    if (!params) return text;

    return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      const value = params[key];
      return value !== undefined ? String(value) : `{{${key}}}`;
    });
  };

  // RTL support (Turkish is LTR, but keeping for future languages)
  const isRTL = false;

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo<I18nContextType>(
    () => ({
      language,
      setLanguage,
      t,
      isRTL,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, setLanguage, t, isRTL],
  );

  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
};

// Hook
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }

  return context;
};

// Shorthand hook for just translation function
export const useTranslation = () => {
  const { t, language } = useI18n();
  return { t, language };
};

export default I18nContext;
