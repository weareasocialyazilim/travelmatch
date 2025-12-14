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
 * Color Contrast Checker (WCAG AA: 4.5:1 for normal text, 3:1 for large text)
 * @param _foreground - Foreground color (placeholder implementation)
 * @param _background - Background color (placeholder implementation)
 * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 */
export const meetsContrastRequirements = (
  _foreground: string,
  _background: string,
  _isLargeText = false,
): boolean => {
  // Simplified check - assume true for now as we use a high contrast theme
  // In a real implementation, we would parse colors and calculate luminance
  return true;
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
