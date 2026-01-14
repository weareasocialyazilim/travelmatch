import { AccessibilityInfo, Platform, findNodeHandle } from 'react-native';

/**
 * Accessibility Utilities
 * Helper functions for WCAG compliance and screen reader support
 */

/**
 * Accessibility Roles
 */
export const ROLES = {
  button: 'button',
  link: 'link',
  header: 'header',
  search: 'search',
  image: 'image',
  text: 'text',
  none: 'none',
  adjustable: 'adjustable',
  alert: 'alert',
  checkbox: 'checkbox',
  combobox: 'combobox',
  menu: 'menu',
  menubar: 'menubar',
  menuitem: 'menuitem',
  progressbar: 'progressbar',
  radio: 'radio',
  radiogroup: 'radiogroup',
  scrollbar: 'scrollbar',
  spinbutton: 'spinbutton',
  switch: 'switch',
  tab: 'tab',
  tablist: 'tablist',
  timer: 'timer',
  toolbar: 'toolbar',
} as const;

/**
 * Common Accessibility Props Generator
 */
export const a11yProps = {
  /**
   * Button accessibility props
   */
  button: (label: string, hint?: string, disabled = false) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: ROLES.button,
    accessibilityState: { disabled },
  }),

  /**
   * Header accessibility props
   */
  header: (level: 1 | 2 | 3 = 1, _label?: string) => ({
    accessible: true,
    accessibilityRole: ROLES.header,
    // Note: React Native doesn't fully support aria-level yet,
    // but we can include it for future compatibility
    'aria-level': level,
  }),

  /**
   * Image accessibility props
   */
  image: (description: string) => ({
    accessible: true,
    accessibilityLabel: description,
    accessibilityRole: ROLES.image,
  }),

  /**
   * List item accessibility props
   */
  listItem: (label: string, position: number, total: number) => ({
    accessible: true,
    accessibilityLabel: `${label}, item ${position} of ${total}`,
  }),
};

/**
 * Announce to screen reader
 * @param message - Message to announce
 */
export const announce = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

/**
 * Check if screen reader is enabled
 */
export const isScreenReaderEnabled = (): Promise<boolean> => {
  return AccessibilityInfo.isScreenReaderEnabled();
};

/**
 * Parse a hex color to RGB values
 * Supports #RGB, #RRGGBB formats
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');

  let r: number, g: number, b: number;

  if (cleanHex.length === 3) {
    // #RGB format
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    // #RRGGBB format
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    return null;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }

  return { r, g, b };
}

/**
 * Calculate relative luminance per WCAG 2.1 spec
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a ratio between 1:1 and 21:1
 */
export function getContrastRatio(
  foreground: string,
  background: string,
): number | null {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    return null;
  }

  const fgLum = getRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLum = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Color Contrast Checker (WCAG AA: 4.5:1 for normal text, 3:1 for large text)
 * @param foreground - Foreground color in hex format (#RGB or #RRGGBB)
 * @param background - Background color in hex format (#RGB or #RRGGBB)
 * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns true if contrast meets WCAG AA requirements
 */
export const meetsContrastRequirements = (
  foreground: string,
  background: string,
  isLargeText = false,
): boolean => {
  const ratio = getContrastRatio(foreground, background);

  if (ratio === null) {
    // If we can't parse colors, return true to avoid false negatives
    return true;
  }

  // WCAG AA requirements:
  // - Normal text: 4.5:1 minimum
  // - Large text (18pt+ or 14pt+ bold): 3:1 minimum
  const minRatio = isLargeText ? 3 : 4.5;

  return ratio >= minRatio;
};

/**
 * Touch Target Size Helper
 * Minimum 44x44 points (iOS) / 48x48 dp (Android)
 */
export const MIN_TOUCH_TARGET = Platform.select({
  ios: 44,
  android: 48,
  default: 44,
});

export const isTouchTargetSufficient = (
  width: number,
  height: number,
): boolean => {
  return width >= MIN_TOUCH_TARGET && height >= MIN_TOUCH_TARGET;
};

/**
 * Focus Management
 */
export const setAccessibilityFocus = (ref: React.RefObject<any>) => {
  if (ref && ref.current) {
    const reactTag = findNodeHandle(ref.current);
    if (reactTag) {
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  }
};
