/**
 * useThemedStyles Hook
 * Creates theme-aware StyleSheets with automatic dark mode support
 */
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useTheme, type ThemeColors } from '../context/ThemeContext';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };
type StyleFactory<T> = (colors: ThemeColors, isDark: boolean) => T;

/**
 * Hook to create theme-aware styles
 * @param styleFactory Function that receives theme colors and returns styles
 * @returns Memoized StyleSheet that updates with theme changes
 *
 * @example
 * const styles = useThemedStyles((colors) => ({
 *   container: {
 *     backgroundColor: colors.background,
 *   },
 *   text: {
 *     color: colors.text,
 *   },
 * }));
 */
export function useThemedStyles<T extends NamedStyles<T>>(
  styleFactory: StyleFactory<T>,
): T {
  const { colors, isDark } = useTheme();

  return useMemo(() => {
    const rawStyles = styleFactory(colors, isDark);
    return StyleSheet.create(rawStyles) as T;
  }, [colors, isDark, styleFactory]);
}

/**
 * Hook for simple themed values (not styles)
 * Useful for icon colors, status bar style, etc.
 */
export function useThemedValue<T>(
  factory: (colors: ThemeColors, isDark: boolean) => T,
): T {
  const { colors, isDark } = useTheme();
  return useMemo(() => factory(colors, isDark), [colors, isDark, factory]);
}

export default useThemedStyles;
