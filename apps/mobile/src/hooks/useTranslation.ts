/**
 * Translation Hook
 * Wrapper around useTranslation with type safety and persistence
 */

import { useTranslation as useI18nTranslation } from 'react-i18next';
import i18n, { changeLanguageAndPersist } from '../config/i18n';
import type { SupportedLanguage } from '../config/i18n';

/**
 * Type-safe translation hook with language persistence
 *
 * @example
 * const { t, language, changeLanguage } = useTranslation();
 *
 * <Text>{t('auth.login')}</Text>
 * <Text>{t('validation.maxLength', { max: 100 })}</Text>
 */
export function useTranslation() {
  const { t, i18n: i18nInstance } = useI18nTranslation();

  return {
    t,
    language: i18nInstance.language as SupportedLanguage,
    changeLanguage: async (lang: SupportedLanguage) => {
      await changeLanguageAndPersist(lang);
    },
    languages: i18nInstance.languages,
  };
}

/**
 * Direct translation function (outside components)
 * Note: This is a convenience function but should be used sparingly.
 * Prefer using the useTranslation hook within components.
 *
 * @example
 * import { translate } from './hooks/useTranslation';
 * const message = translate('auth.loginSuccess');
 */
export function translate(
  key: string,
  options?: Record<string, unknown>,
): string {
  return i18n.t(key, options);
}
