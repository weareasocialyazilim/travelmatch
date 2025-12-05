import { logger } from './logger';
import { COLORS } from '../constants/colors';
/**
 * WCAG 2.1 Contrast Checker
 * Validates color contrast ratios for accessibility compliance
 */

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    logger.warn('Invalid color format. Use hex colors like #FFFFFF');
    return 1;
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if colors meet WCAG AA standards
 * Normal text: 4.5:1
 * Large text (18pt+/14pt+ bold): 3:1
 * UI components: 3:1
 */
export function meetsWCAG_AA(
  foreground: string,
  background: string,
  isLargeText = false,
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const minRatio = isLargeText ? 3 : 4.5;
  return ratio >= minRatio;
}

/**
 * Check if colors meet WCAG AAA standards
 * Normal text: 7:1
 * Large text: 4.5:1
 */
export function meetsWCAG_AAA(
  foreground: string,
  background: string,
  isLargeText = false,
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const minRatio = isLargeText ? 4.5 : 7;
  return ratio >= minRatio;
}

/**
 * Validate all theme colors for contrast compliance
 */
export function validateThemeContrast(theme: {
  text: string;
  textSecondary: string;
  textTertiary: string;
  background: string;
  surface: string;
  card: string;
  primary: string;
  success: string;
  warning: string;
  error: string;
}): {
  passed: boolean;
  failures: Array<{
    pair: string;
    ratio: number;
    required: number;
  }>;
} {
  const failures: Array<{ pair: string; ratio: number; required: number }> = [];

  // Check text on backgrounds
  const checks = [
    {
      fg: theme.text,
      bg: theme.background,
      name: 'text/background',
      isLarge: false,
    },
    { fg: theme.text, bg: theme.surface, name: 'text/surface', isLarge: false },
    { fg: theme.text, bg: theme.card, name: 'text/card', isLarge: false },
    {
      fg: theme.textSecondary,
      bg: theme.background,
      name: 'textSecondary/background',
      isLarge: false,
    },
    {
      fg: theme.textTertiary,
      bg: theme.background,
      name: 'textTertiary/background',
      isLarge: false,
    },
    {
      fg: COLORS.white,
      bg: theme.primary,
      name: 'white/primary',
      isLarge: false,
    },
    {
      fg: COLORS.white,
      bg: theme.success,
      name: 'white/success',
      isLarge: false,
    },
    { fg: COLORS.white, bg: theme.error, name: 'white/error', isLarge: false },
  ];

  checks.forEach(({ fg, bg, name, isLarge }) => {
    const ratio = getContrastRatio(fg, bg);
    const required = isLarge ? 3 : 4.5;
    if (ratio < required) {
      failures.push({ pair: name, ratio, required });
    }
  });

  return {
    passed: failures.length === 0,
    failures,
  };
}

/**
 * Get contrast ratio grade
 */
export function getContrastGrade(ratio: number): 'AAA' | 'AA' | 'Fail' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'Fail';
}

/**
 * Suggest better contrast color
 * Returns darker or lighter version of foreground color
 */
export function suggestBetterContrast(
  foreground: string,
  background: string,
  _targetRatio = 4.5,
): string {
  const bgRgb = hexToRgb(background);
  if (!bgRgb) return foreground;

  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const shouldDarken = bgLuminance > 0.5;

  // Simple suggestion: make it black or white based on background
  return shouldDarken ? COLORS.black : COLORS.white;
}
