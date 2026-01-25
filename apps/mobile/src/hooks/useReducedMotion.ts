/**
 * useReducedMotion Hook
 * Lovendo Ultimate Design System 2026
 *
 * Respects system accessibility settings for reduced motion.
 * Use this hook to disable or reduce animations for users who
 * have enabled "Reduce Motion" in their device settings.
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * // Use with animation values
 * const animatedStyle = useAnimatedStyle(() => ({
 *   transform: [{
 *     scale: prefersReducedMotion ? 1 : withSpring(scale.value)
 *   }]
 * }));
 *
 * // Use with duration helpers from motion.ts
 * import { getAccessibleDuration, DURATION } from '@/constants/motion';
 * const duration = getAccessibleDuration(DURATION.normal, prefersReducedMotion);
 * ```
 */

import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useReducedMotion as useReanimatedReducedMotion } from 'react-native-reanimated';

/**
 * Hook to detect if user prefers reduced motion
 *
 * Uses react-native-reanimated's built-in hook when available,
 * with fallback to AccessibilityInfo for older versions.
 *
 * @returns boolean - true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  // Try reanimated's hook first (more efficient, runs on UI thread)
  const reanimatedReducedMotion = useReanimatedReducedMotion();

  // Fallback state for older reanimated versions
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setIsReducedMotionEnabled(enabled);
    });

    // Subscribe to changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        setIsReducedMotionEnabled(enabled);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Prefer reanimated's hook if it returns a valid value
  // (it returns false by default, so we use JS fallback as backup)
  return reanimatedReducedMotion || isReducedMotionEnabled;
}

/**
 * Get animation duration respecting reduced motion preference
 *
 * @param duration - Original duration in ms
 * @param reducedMotion - Whether reduced motion is preferred
 * @param minDuration - Minimum duration for reduced motion (default: 0)
 * @returns Adjusted duration
 */
export function getReducedMotionDuration(
  duration: number,
  reducedMotion: boolean,
  minDuration = 0
): number {
  if (reducedMotion) {
    return minDuration;
  }
  return duration;
}

/**
 * Get animation config that respects reduced motion
 *
 * @param config - Animation config object
 * @param reducedMotion - Whether reduced motion is preferred
 * @returns Modified config with reduced/instant animations
 */
export function getReducedMotionConfig<T extends { duration?: number }>(
  config: T,
  reducedMotion: boolean
): T {
  if (reducedMotion && config.duration) {
    return {
      ...config,
      duration: 0,
    };
  }
  return config;
}

export default useReducedMotion;
