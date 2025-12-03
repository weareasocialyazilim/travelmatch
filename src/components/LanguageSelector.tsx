/**
 * Language Selector Component
 * Allows users to change app language
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from '../hooks/useTranslation';
import type { SupportedLanguage } from '../config/i18n';
import { SUPPORTED_LANGUAGES } from '../config/i18n';
import { useUIStore } from '../stores/uiStore';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { RADII } from '../constants/radii';
import { TYPOGRAPHY } from '../constants/typography';

interface LanguageSelectorProps {
  onLanguageChange?: (language: SupportedLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageChange,
}) => {
  const { language, changeLanguage } = useTranslation();
  const setLanguage = useUIStore((state) => state.setLanguage);

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    await changeLanguage(lang);
    setLanguage(lang);
    onLanguageChange?.(lang);
  };

  return (
    <View style={styles.container}>
      {Object.entries(SUPPORTED_LANGUAGES).map(([code, { nativeName }]) => {
        const isSelected = language === code;

        return (
          <TouchableOpacity
            key={code}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => handleLanguageChange(code as SupportedLanguage)}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, isSelected && styles.textSelected]}>
              {nativeName}
            </Text>
            {isSelected && <View style={styles.checkmark} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  text: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  textSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
});
