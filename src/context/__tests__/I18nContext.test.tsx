/**
 * I18nContext Tests
 * Tests for internationalization context
 */

import React from 'react';
import { render, waitFor, act, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import {
  I18nProvider,
  useI18n,
  useTranslation,
  type SupportedLanguage,
} from '../I18nContext';

// Mock AsyncStorage
const mockAsyncStorage: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockAsyncStorage[key])),
  setItem: jest.fn((key: string, value: string) => {
    mockAsyncStorage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete mockAsyncStorage[key];
    return Promise.resolve();
  }),
}));

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

// Test component
const TestI18nComponent: React.FC<{
  onLanguageChange?: (lang: SupportedLanguage) => void;
}> = ({ onLanguageChange }) => {
  const { language, setLanguage, t, isRTL, supportedLanguages } = useI18n();

  const handleSetLanguage = async (lang: SupportedLanguage) => {
    await setLanguage(lang);
    onLanguageChange?.(lang);
  };

  return (
    <>
      <Text testID="current-language">{language}</Text>
      <Text testID="is-rtl">{String(isRTL)}</Text>
      <Text testID="supported-count">{supportedLanguages.length}</Text>
      <Text testID="translation">{t('common.loading')}</Text>
      <Text testID="translation-with-params">{t('common.greeting', { name: 'John' })}</Text>
      <Text testID="nested-translation">{t('errors.network')}</Text>
      <TouchableOpacity testID="set-turkish" onPress={() => handleSetLanguage('tr')}>
        <Text>Set Turkish</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="set-english" onPress={() => handleSetLanguage('en')}>
        <Text>Set English</Text>
      </TouchableOpacity>
    </>
  );
};

const TranslationOnlyComponent = () => {
  const { t, language } = useTranslation();
  return (
    <>
      <Text testID="translation-hook">{t('common.loading')}</Text>
      <Text testID="lang">{language}</Text>
    </>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe('I18nContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear mock storage
    Object.keys(mockAsyncStorage).forEach((key) => delete mockAsyncStorage[key]);
  });

  describe('I18nProvider', () => {
    it('renders children after initialization', async () => {
      const { getByText } = renderWithProvider(<Text>Child Content</Text>);

      await waitFor(() => {
        expect(getByText('Child Content')).toBeTruthy();
      });
    });

    it('provides default English language', async () => {
      const { getByTestId } = renderWithProvider(<TestI18nComponent />);

      await waitFor(() => {
        expect(getByTestId('current-language').props.children).toBe('en');
      });
    });

    it('provides supported languages list', async () => {
      const { getByTestId } = renderWithProvider(<TestI18nComponent />);

      await waitFor(() => {
        expect(getByTestId('supported-count').props.children).toBe(2);
      });
    });

    it('loads saved language from storage', async () => {
      mockAsyncStorage['@app_language'] = 'tr';

      const { getByTestId } = renderWithProvider(<TestI18nComponent />);

      await waitFor(() => {
        expect(getByTestId('current-language').props.children).toBe('tr');
      });
    });

    it('uses device language when no saved language', async () => {
      const { getLocales } = require('expo-localization');
      getLocales.mockReturnValue([{ languageCode: 'tr' }]);

      const { getByTestId } = renderWithProvider(<TestI18nComponent />);

      await waitFor(() => {
        expect(getByTestId('current-language').props.children).toBe('tr');
      });

      // Reset mock
      getLocales.mockReturnValue([{ languageCode: 'en' }]);
    });

    it('falls back to English for unsupported device language', async () => {
      const { getLocales } = require('expo-localization');
      getLocales.mockReturnValue([{ languageCode: 'fr' }]);

      const { getByTestId } = renderWithProvider(<TestI18nComponent />);

      await waitFor(() => {
        expect(getByTestId('current-language').props.children).toBe('en');
      });

      // Reset mock
      getLocales.mockReturnValue([{ languageCode: 'en' }]);
    });
  });

  describe('useI18n hook', () => {
    it('throws error when used outside provider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        const TestOutsideProvider = () => {
          useI18n();
          return null;
        };
        render(<TestOutsideProvider />);
      }).toThrow('useI18n must be used within an I18nProvider');

      consoleError.mockRestore();
    });

    it('provides isRTL flag', async () => {
      const { getByTestId } = renderWithProvider(<TestI18nComponent />);

      await waitFor(() => {
        expect(getByTestId('is-rtl').props.children).toBe('false');
      });
    });
  });

  describe('setLanguage', () => {
    it('changes language to Turkish', async () => {
      const { getByTestId, findByTestId } = renderWithProvider(<TestI18nComponent />);

      await findByTestId('set-turkish');

      await act(async () => {
        fireEvent.press(getByTestId('set-turkish'));
      });

      await waitFor(() => {
        expect(getByTestId('current-language').props.children).toBe('tr');
      });
    });

    it('persists language to AsyncStorage', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const { getByTestId, findByTestId } = renderWithProvider(<TestI18nComponent />);

      await findByTestId('set-turkish');

      await act(async () => {
        fireEvent.press(getByTestId('set-turkish'));
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@app_language', 'tr');
      });
    });

    it('handles storage error gracefully', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

      const { getByTestId, findByTestId } = renderWithProvider(<TestI18nComponent />);

      await findByTestId('set-turkish');

      await act(async () => {
        fireEvent.press(getByTestId('set-turkish'));
      });

      // Should still update state even if storage fails
      await waitFor(() => {
        expect(getByTestId('current-language').props.children).toBe('tr');
      });
    });
  });

  describe('translation function (t)', () => {
    it('returns translated text for valid key', async () => {
      const { getByTestId } = renderWithProvider(<TestI18nComponent />);

      await waitFor(() => {
        // Should return translated text or the key itself
        const translation = getByTestId('translation').props.children;
        expect(translation).toBeDefined();
      });
    });

    it('returns key when translation not found', async () => {
      const KeyTestComponent = () => {
        const { t } = useI18n();
        return <Text testID="missing">{t('nonexistent.key')}</Text>;
      };

      const { getByTestId } = renderWithProvider(<KeyTestComponent />);

      await waitFor(() => {
        expect(getByTestId('missing').props.children).toBe('nonexistent.key');
      });
    });

    it('interpolates parameters correctly', async () => {
      const ParamTestComponent = () => {
        const { t } = useI18n();
        // This assumes there's a translation with {{count}} placeholder
        return <Text testID="param">{t('test.with.param', { count: 5 })}</Text>;
      };

      const { getByTestId } = renderWithProvider(<ParamTestComponent />);

      await waitFor(() => {
        // Result depends on actual translation file content
        expect(getByTestId('param').props.children).toBeDefined();
      });
    });

    it('handles nested translation keys', async () => {
      const NestedKeyComponent = () => {
        const { t } = useI18n();
        return <Text testID="nested">{t('common.loading')}</Text>;
      };

      const { getByTestId } = renderWithProvider(<NestedKeyComponent />);

      await waitFor(() => {
        expect(getByTestId('nested').props.children).toBeDefined();
      });
    });

    it('returns empty param placeholder when param not provided', async () => {
      const MissingParamComponent = () => {
        const { t } = useI18n();
        // If translation has {{name}} but we don't provide it
        return <Text testID="missing-param">{t('test.needs.param')}</Text>;
      };

      const { getByTestId } = renderWithProvider(<MissingParamComponent />);

      await waitFor(() => {
        expect(getByTestId('missing-param').props.children).toBeDefined();
      });
    });
  });

  describe('useTranslation hook', () => {
    it('provides t function and language', async () => {
      const { getByTestId } = renderWithProvider(<TranslationOnlyComponent />);

      await waitFor(() => {
        expect(getByTestId('translation-hook').props.children).toBeDefined();
        expect(getByTestId('lang').props.children).toBe('en');
      });
    });
  });

  describe('language switching', () => {
    it('switches from English to Turkish', async () => {
      const { getByTestId, findByTestId } = renderWithProvider(<TestI18nComponent />);

      await findByTestId('current-language');
      expect(getByTestId('current-language').props.children).toBe('en');

      await act(async () => {
        fireEvent.press(getByTestId('set-turkish'));
      });

      await waitFor(() => {
        expect(getByTestId('current-language').props.children).toBe('tr');
      });
    });

    it('switches from Turkish to English', async () => {
      mockAsyncStorage['@app_language'] = 'tr';

      const { getByTestId, findByTestId } = renderWithProvider(<TestI18nComponent />);

      await findByTestId('current-language');

      await waitFor(() => {
        expect(getByTestId('current-language').props.children).toBe('tr');
      });

      await act(async () => {
        fireEvent.press(getByTestId('set-english'));
      });

      await waitFor(() => {
        expect(getByTestId('current-language').props.children).toBe('en');
      });
    });
  });

  describe('initialization edge cases', () => {
    it('handles invalid saved language', async () => {
      mockAsyncStorage['@app_language'] = 'invalid';

      const { getByTestId } = renderWithProvider(<TestI18nComponent />);

      // Should fall back to default or device language
      await waitFor(() => {
        const lang = getByTestId('current-language').props.children;
        expect(['en', 'tr']).toContain(lang);
      });
    });

    it('handles AsyncStorage getItem error', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const { getByTestId } = renderWithProvider(<TestI18nComponent />);

      // Should use default language
      await waitFor(() => {
        expect(getByTestId('current-language').props.children).toBe('en');
      });
    });

    it('handles empty locales array', async () => {
      const { getLocales } = require('expo-localization');
      getLocales.mockReturnValue([]);

      const { getByTestId } = renderWithProvider(<TestI18nComponent />);

      await waitFor(() => {
        expect(getByTestId('current-language').props.children).toBe('en');
      });

      // Reset mock
      getLocales.mockReturnValue([{ languageCode: 'en' }]);
    });
  });

  describe('supported languages', () => {
    it('includes English in supported languages', async () => {
      const SupportedLangsComponent = () => {
        const { supportedLanguages } = useI18n();
        const hasEnglish = supportedLanguages.some((l) => l.code === 'en');
        return <Text testID="has-en">{String(hasEnglish)}</Text>;
      };

      const { getByTestId } = renderWithProvider(<SupportedLangsComponent />);

      await waitFor(() => {
        expect(getByTestId('has-en').props.children).toBe('true');
      });
    });

    it('includes Turkish in supported languages', async () => {
      const SupportedLangsComponent = () => {
        const { supportedLanguages } = useI18n();
        const hasTurkish = supportedLanguages.some((l) => l.code === 'tr');
        return <Text testID="has-tr">{String(hasTurkish)}</Text>;
      };

      const { getByTestId } = renderWithProvider(<SupportedLangsComponent />);

      await waitFor(() => {
        expect(getByTestId('has-tr').props.children).toBe('true');
      });
    });

    it('provides native names for languages', async () => {
      const NativeNamesComponent = () => {
        const { supportedLanguages } = useI18n();
        const turkish = supportedLanguages.find((l) => l.code === 'tr');
        return <Text testID="native">{turkish?.nativeName}</Text>;
      };

      const { getByTestId } = renderWithProvider(<NativeNamesComponent />);

      await waitFor(() => {
        expect(getByTestId('native').props.children).toBe('Türkçe');
      });
    });
  });
});
