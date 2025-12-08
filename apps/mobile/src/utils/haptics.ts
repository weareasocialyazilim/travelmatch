/**
 * Haptic Feedback Utilities
 * Provides tactile feedback for user interactions
 * iOS: Uses UIImpactFeedbackGenerator
 * Android: Uses Vibration API
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { logger } from './logger';

/**
 * Haptic feedback types
 */
export enum HapticType {
  // Light impact - for small UI interactions
  LIGHT = 'light',
  // Medium impact - for standard button presses
  MEDIUM = 'medium',
  // Heavy impact - for important actions
  HEAVY = 'heavy',
  // Success notification
  SUCCESS = 'success',
  // Warning notification
  WARNING = 'warning',
  // Error notification
  ERROR = 'error',
  // Selection change (like picker)
  SELECTION = 'selection',
}

/**
 * Trigger haptic feedback
 */
export const triggerHaptic = async (type: HapticType = HapticType.LIGHT) => {
  try {
    switch (type) {
      case HapticType.LIGHT:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;

      case HapticType.MEDIUM:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;

      case HapticType.HEAVY:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;

      case HapticType.SUCCESS:
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
        break;

      case HapticType.WARNING:
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
        break;

      case HapticType.ERROR:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;

      case HapticType.SELECTION:
        await Haptics.selectionAsync();
        break;

      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Haptics may not be available on all devices
    if (__DEV__) {
      // eslint-disable-next-line no-console
      logger.warn('Haptic feedback failed:', error);
    }
  }
};

/**
 * Haptic patterns for common UI interactions
 */
export const hapticPatterns = {
  /**
   * Button press
   */
  buttonPress: () => triggerHaptic(HapticType.LIGHT),

  /**
   * Primary action (save, submit, confirm)
   */
  primaryAction: () => triggerHaptic(HapticType.MEDIUM),

  /**
   * Destructive action (delete, cancel)
   */
  destructiveAction: () => triggerHaptic(HapticType.HEAVY),

  /**
   * Success feedback
   */
  success: () => triggerHaptic(HapticType.SUCCESS),

  /**
   * Error feedback
   */
  error: () => triggerHaptic(HapticType.ERROR),

  /**
   * Warning feedback
   */
  warning: () => triggerHaptic(HapticType.WARNING),

  /**
   * Tab/option selection
   */
  selection: () => triggerHaptic(HapticType.SELECTION),

  /**
   * Pull to refresh
   */
  pullToRefresh: () => triggerHaptic(HapticType.MEDIUM),

  /**
   * Swipe action
   */
  swipeAction: () => triggerHaptic(HapticType.LIGHT),

  /**
   * Toggle switch
   */
  toggle: () => triggerHaptic(HapticType.SELECTION),

  /**
   * Long press
   */
  longPress: () => triggerHaptic(HapticType.MEDIUM),
};

/**
 * Enhanced button press with haptic
 */
export const withHaptic = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  hapticType: HapticType = HapticType.LIGHT,
): ((...args: Parameters<T>) => ReturnType<T>) => {
  return (...args: Parameters<T>): ReturnType<T> => {
    void triggerHaptic(hapticType);
    return callback(...args) as ReturnType<T>;
  };
};

/**
 * Check if haptics are supported
 */
export const isHapticsSupported = (): boolean => {
  // Haptics are generally supported on iOS 10+ and most modern Android devices
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Haptic settings (can be tied to user preferences)
 */
let hapticsEnabled = true;

export const setHapticsEnabled = (enabled: boolean) => {
  hapticsEnabled = enabled;
};

export const getHapticsEnabled = (): boolean => {
  return hapticsEnabled && isHapticsSupported();
};

/**
 * Smart haptic trigger (respects user settings)
 */
export const smartHaptic = (type: HapticType = HapticType.LIGHT) => {
  if (getHapticsEnabled()) {
    return triggerHaptic(type);
  }
  return Promise.resolve();
};

export default {
  trigger: triggerHaptic,
  patterns: hapticPatterns,
  withHaptic,
  isSupported: isHapticsSupported,
  setEnabled: setHapticsEnabled,
  getEnabled: getHapticsEnabled,
  smartTrigger: smartHaptic,
  HapticType,
};
