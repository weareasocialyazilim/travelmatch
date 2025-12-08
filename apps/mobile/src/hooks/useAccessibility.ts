/**
 * Accessibility Hooks and Utilities
 * Provides consistent accessibility support across the app
 */

import { useCallback, useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Hook to track screen reader status
 */
export const useScreenReader = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  useEffect(() => {
    const checkScreenReader = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(enabled);
    };

    void checkScreenReader();

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return isScreenReaderEnabled;
};

/**
 * Hook to track reduce motion preference
 */
export const useReduceMotion = () => {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    const checkReduceMotion = async () => {
      const enabled = await AccessibilityInfo.isReduceMotionEnabled();
      setReduceMotionEnabled(enabled);
    };

    void checkReduceMotion();

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotionEnabled,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return reduceMotionEnabled;
};

/**
 * Hook to announce messages to screen reader
 */
export const useAccessibilityAnnounce = () => {
  const announce = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  return announce;
};

/**
 * Generate accessibility props for common UI patterns
 */
export const accessibilityProps = {
  /**
   * Props for button elements
   */
  button: (label: string, hint?: string, disabled?: boolean) => ({
    accessible: true,
    accessibilityRole: 'button' as const,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: { disabled },
  }),

  /**
   * Props for link elements
   */
  link: (label: string) => ({
    accessible: true,
    accessibilityRole: 'link' as const,
    accessibilityLabel: label,
  }),

  /**
   * Props for header elements
   */
  header: (label: string) => ({
    accessible: true,
    accessibilityRole: 'header' as const,
    accessibilityLabel: label,
  }),

  /**
   * Props for image elements
   */
  image: (label: string) => ({
    accessible: true,
    accessibilityRole: 'image' as const,
    accessibilityLabel: label,
  }),

  /**
   * Props for text input elements
   */
  textInput: (label: string, hint?: string, value?: string) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityValue: value ? { text: value } : undefined,
  }),

  /**
   * Props for tab elements
   */
  tab: (label: string, selected: boolean) => ({
    accessible: true,
    accessibilityRole: 'tab' as const,
    accessibilityLabel: label,
    accessibilityState: { selected },
  }),

  /**
   * Props for checkbox elements
   */
  checkbox: (label: string, checked: boolean) => ({
    accessible: true,
    accessibilityRole: 'checkbox' as const,
    accessibilityLabel: label,
    accessibilityState: { checked },
  }),

  /**
   * Props for switch elements
   */
  switch: (label: string, enabled: boolean) => ({
    accessible: true,
    accessibilityRole: 'switch' as const,
    accessibilityLabel: label,
    accessibilityState: { checked: enabled },
  }),

  /**
   * Props for progress bar elements
   */
  progressBar: (label: string, value: number, max = 100) => ({
    accessible: true,
    accessibilityRole: 'progressbar' as const,
    accessibilityLabel: label,
    accessibilityValue: {
      min: 0,
      max,
      now: value,
      text: `${Math.round((value / max) * 100)}%`,
    },
  }),

  /**
   * Props for list items
   */
  listItem: (label: string, index: number, total: number) => ({
    accessible: true,
    accessibilityLabel: `${label}, item ${index + 1} of ${total}`,
  }),

  /**
   * Props for alert dialogs
   */
  alert: (message: string) => ({
    accessible: true,
    accessibilityRole: 'alert' as const,
    accessibilityLabel: message,
    accessibilityLiveRegion: 'assertive' as const,
  }),
};

/**
 * Minimum touch target size (44x44 per Apple HIG)
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Check if touch target meets accessibility requirements
 */
export const isValidTouchTarget = (width: number, height: number): boolean => {
  return width >= MIN_TOUCH_TARGET && height >= MIN_TOUCH_TARGET;
};

/**
 * Format currency for screen readers
 */
export const formatCurrencyForScreenReader = (
  amount: number,
  currency = 'USD',
): string => {
  return `${amount} ${currency === 'USD' ? 'dollars' : currency}`;
};

/**
 * Format date for screen readers
 */
export const formatDateForScreenReader = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time for screen readers
 */
export const formatTimeForScreenReader = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export default {
  useScreenReader,
  useReduceMotion,
  useAccessibilityAnnounce,
  accessibilityProps,
  MIN_TOUCH_TARGET,
  isValidTouchTarget,
  formatCurrencyForScreenReader,
  formatDateForScreenReader,
  formatTimeForScreenReader,
};
