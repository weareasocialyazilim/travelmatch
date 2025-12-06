/**
 * Theme Hook
 * Access current theme colors and toggle theme
 */

import { useColorScheme } from 'react-native';
import { useUIStore } from '../stores/uiStore';
import { LIGHT_COLORS, DARK_COLORS } from '../theme/colors';
import type { ColorPalette } from '../theme/colors';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Get theme colors based on mode
 */
export function useTheme() {
  const systemColorScheme = useColorScheme();
  const { theme: themeMode, setTheme } = useUIStore();

  // Determine actual theme
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemColorScheme === 'dark');

  const colors: ColorPalette = isDark ? DARK_COLORS : LIGHT_COLORS;

  return {
    colors,
    isDark,
    isLight: !isDark,
    theme: themeMode,
    setTheme,
    toggleTheme: () => {
      setTheme(isDark ? 'light' : 'dark');
    },
  };
}

/**
 * Get colors without hook (for utils/helpers)
 */
export function getColors(isDark: boolean): ColorPalette {
  return isDark ? DARK_COLORS : LIGHT_COLORS;
}
