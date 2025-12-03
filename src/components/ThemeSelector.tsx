/**
 * Theme Selector Component
 * Allows users to change app theme
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ThemeMode } from '../hooks/useTheme';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { SPACING } from '../constants/spacing';
import { RADII } from '../constants/radii';
import { TYPOGRAPHY } from '../constants/typography';

const THEME_OPTIONS: { value: ThemeMode; icon: string }[] = [
  { value: 'light', icon: '☀️' },
  { value: 'dark', icon: '🌙' },
  { value: 'system', icon: '⚙️' },
];

export const ThemeSelector: React.FC = () => {
  const { colors, theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const getThemeLabel = (mode: ThemeMode): string => {
    switch (mode) {
      case 'light':
        return t('settings.lightMode');
      case 'dark':
        return t('settings.darkMode');
      case 'system':
        return t('settings.systemDefault');
    }
  };

  return (
    <View style={styles.container}>
      {THEME_OPTIONS.map(({ value, icon }) => {
        const isSelected = theme === value;

        return (
          <TouchableOpacity
            key={value}
            style={[
              styles.option,
              {
                backgroundColor: colors.background,
                borderColor: isSelected ? colors.primary : colors.border,
              },
              isSelected && { backgroundColor: `${colors.primary}10` },
            ]}
            onPress={() => setTheme(value)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{icon}</Text>
            <Text
              style={[
                styles.label,
                { color: isSelected ? colors.primary : colors.text },
              ]}
            >
              {getThemeLabel(value)}
            </Text>
            {isSelected && (
              <View
                style={[styles.checkmark, { backgroundColor: colors.primary }]}
              />
            )}
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
    padding: SPACING.md,
    borderWidth: 2,
    borderRadius: RADII.md,
    gap: SPACING.sm,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    ...TYPOGRAPHY.body,
    flex: 1,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
