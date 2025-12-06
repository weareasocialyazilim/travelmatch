/**
 * Accessibility Utilities
 * WCAG 2.1 AA uyumlu accessibility helpers
 */

import type { AccessibilityRole } from 'react-native';
import { Platform } from 'react-native';

/**
 * Accessibility Props Generator
 */
export const a11yProps = {
  /**
   * Button accessibility props
   */
  button: (label: string, hint?: string, disabled?: boolean) => ({
    accessible: true,
    accessibilityRole: 'button' as AccessibilityRole,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: { disabled: disabled ?? false },
  }),

  /**
   * Link accessibility props
   */
  link: (label: string, hint?: string) => ({
    accessible: true,
    accessibilityRole: 'link' as AccessibilityRole,
    accessibilityLabel: label,
    accessibilityHint: hint,
  }),

  /**
   * Image accessibility props
   */
  image: (alt: string, decorative = false) => ({
    accessible: !decorative,
    accessibilityRole: 'image' as AccessibilityRole,
    accessibilityLabel: decorative ? undefined : alt,
  }),

  /**
   * Text input accessibility props
   */
  textInput: (label: string, error?: string, required?: boolean) => ({
    accessible: true,
    accessibilityLabel: label + (required ? ' (required)' : ''),
    accessibilityHint: error || 'Double tap to edit',
    accessibilityState: {
      disabled: false,
      ...(error && { invalid: true }),
    },
  }),

  /**
   * Header accessibility props
   */
  header: (level: 1 | 2 | 3 | 4 | 5 | 6, text: string) => ({
    accessible: true,
    accessibilityRole: 'header' as AccessibilityRole,
    accessibilityLevel: level,
    accessibilityLabel: text,
  }),

  /**
   * Checkbox/Switch accessibility props
   */
  checkbox: (label: string, checked: boolean, hint?: string) => ({
    accessible: true,
    accessibilityRole: 'checkbox' as AccessibilityRole,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: { checked },
  }),

  /**
   * Radio button accessibility props
   */
  radio: (label: string, selected: boolean, hint?: string) => ({
    accessible: true,
    accessibilityRole: 'radio' as AccessibilityRole,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: { selected },
  }),

  /**
   * Tab accessibility props
   */
  tab: (label: string, selected: boolean, index: number, total: number) => ({
    accessible: true,
    accessibilityRole: 'tab' as AccessibilityRole,
    accessibilityLabel: `${label}, tab ${index + 1} of ${total}`,
    accessibilityState: { selected },
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
 * @param _message - Message to announce (placeholder implementation)
 * @param _priority - Priority level for announcement
 */
export const announce = (
  _message: string,
  _priority: 'polite' | 'assertive' = 'polite',
) => {
  // TODO: Implement with AccessibilityInfo.announceForAccessibility
  // if (Platform.OS === 'ios' || Platform.OS === 'android') {
  //   AccessibilityInfo.announceForAccessibility(message);
  // }
};

/**
 * Check if screen reader is enabled
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  // TODO: Implement with AccessibilityInfo.isScreenReaderEnabled()
  return false;
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
  isLargeText = false,
): boolean => {
  // TODO: Implement contrast ratio calculation
  const minRatio = isLargeText ? 3 : 4.5;
  void minRatio; // Will be used when calculation is implemented
  return true; // Placeholder - assume compliance until implemented
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
export const setAccessibilityFocus = (ref: React.RefObject<unknown>) => {
  if (ref && ref.current) {
    // TODO: Implement with AccessibilityInfo.setAccessibilityFocus
  }
};

/**
 * Color Contrast Validation
 * WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

export const meetsContrastRequirement = (
  foreground: string,
  background: string,
  isLargeText = false,
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 3 : 4.5;
  return ratio >= requiredRatio;
};

/**
 * Dynamic Type Support
 * Scales font size based on device accessibility settings
 */
export const getAccessibleFontSize = (
  baseSize: number,
  maxScale = 2.0,
): number => {
  // In a real app, you'd get this from AccessibilityInfo
  // For now, just return the base size
  // const scale = AccessibilityInfo.fontScale;
  const scale = 1.0;
  return Math.min(baseSize * scale, baseSize * maxScale);
};

/**
 * Touch Target Validation with Auto-Adjustment
 */
export const ensureMinimumTouchTarget = (size: number): number => {
  return Math.max(size, MIN_TOUCH_TARGET);
};

export const getTouchTargetPadding = (
  currentSize: number,
): { horizontal: number; vertical: number } => {
  if (currentSize >= MIN_TOUCH_TARGET) {
    return { horizontal: 0, vertical: 0 };
  }

  const deficit = MIN_TOUCH_TARGET - currentSize;
  const padding = Math.ceil(deficit / 2);

  return { horizontal: padding, vertical: padding };
};

/**
 * Accessibility Labels for Common UI
 */
export const commonLabels = {
  close: 'Close',
  back: 'Go back',
  next: 'Next',
  previous: 'Previous',
  submit: 'Submit',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  search: 'Search',
  filter: 'Filter',
  refresh: 'Refresh',
  loading: 'Loading',
  error: 'Error occurred',
  success: 'Success',
};
