/**
 * Haptic Feedback Utilities - Backward Compatibility Layer
 *
 * This module re-exports from HapticManager for backward compatibility.
 * All haptic logic has been consolidated into services/HapticManager.ts
 *
 * @deprecated Import directly from '@/services/HapticManager' for new code
 *
 * Migration:
 * - OLD: import { triggerHaptic, HapticType } from '@/utils/haptics';
 * - NEW: import { HapticManager } from '@/services/HapticManager';
 */

import { HapticManager } from '../services/HapticManager';

// Legacy HapticType enum for backward compatibility
export enum HapticType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SELECTION = 'selection',
}

/**
 * @deprecated Use HapticManager methods directly
 */
export const triggerHaptic = async (type: HapticType = HapticType.LIGHT) => {
  switch (type) {
    case HapticType.LIGHT:
      return HapticManager.buttonPress();
    case HapticType.MEDIUM:
      return HapticManager.primaryAction();
    case HapticType.HEAVY:
      return HapticManager.destructiveAction();
    case HapticType.SUCCESS:
      return HapticManager.success();
    case HapticType.WARNING:
      return HapticManager.warning();
    case HapticType.ERROR:
      return HapticManager.error();
    case HapticType.SELECTION:
      return HapticManager.selectionChange();
    default:
      return HapticManager.buttonPress();
  }
};

/**
 * @deprecated Use HapticManager methods directly
 */
export const hapticPatterns = {
  buttonPress: () => HapticManager.buttonPress(),
  primaryAction: () => HapticManager.primaryAction(),
  destructiveAction: () => HapticManager.destructiveAction(),
  success: () => HapticManager.success(),
  error: () => HapticManager.error(),
  warning: () => HapticManager.warning(),
  selection: () => HapticManager.selectionChange(),
  pullToRefresh: () => HapticManager.pullToRefresh(),
  swipeAction: () => HapticManager.swipe(),
  toggle: () => HapticManager.toggle(),
  longPress: () => HapticManager.longPress(),
};

/**
 * @deprecated Use HapticManager.isAvailable()
 */
export const isHapticsSupported = (): boolean => {
  return HapticManager.isAvailable();
};

/**
 * @deprecated Use HapticManager.setEnabled()
 */
export const setHapticsEnabled = (enabled: boolean) => {
  HapticManager.setEnabled(enabled);
};

/**
 * @deprecated Use HapticManager.getConfig().enabled
 */
export const getHapticsEnabled = (): boolean => {
  return HapticManager.getConfig().enabled;
};

/**
 * @deprecated Use HapticManager methods directly
 */
export const smartHaptic = (type: HapticType = HapticType.LIGHT) => {
  return triggerHaptic(type);
};

/**
 * @deprecated Use HapticManager methods with callbacks
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

// Default export for backward compatibility
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
