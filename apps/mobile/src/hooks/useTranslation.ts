/**
 * Translation Hook
 * Wrapper around useTranslation with type safety
 */

import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { SupportedLanguage } from '../config/i18n';

/**
 * Type-safe translation hook
 *
 * @example
 * const { t, language, changeLanguage } = useTranslation();
 *
 * <Text>{t('auth.login')}</Text>
 * <Text>{t('validation.maxLength', { max: 100 })}</Text>
 */
export function useTranslation() {
  const { t, i18n } = useI18nTranslation();

  return {
    t,
    language: i18n.language as SupportedLanguage,
    changeLanguage: (lang: SupportedLanguage) => i18n.changeLanguage(lang),
    languages: i18n.languages,
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
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useI18nTranslation();
  return t(key, options);
}
