/**
 * Reduce Motion Hook
 * Respects user's accessibility preferences for motion
 *
 * DEFCON 3.2 FIX: Implements reduce motion accessibility support
 * for users with vestibular disorders or motion sensitivity
 */

import { useEffect, useState, useCallback } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { logger } from '../utils/logger';

interface ReduceMotionResult {
  /** Whether reduce motion is enabled */
  reduceMotionEnabled: boolean;
  /** Whether the setting is still loading */
  isLoading: boolean;
  /** Get animation duration based on reduce motion preference */
  getAnimationDuration: (normalDuration: number) => number;
  /** Get animation config for Animated API */
  getSpringConfig: (normalConfig: SpringConfig) => SpringConfig;
}

export interface SpringConfig {
  tension?: number;
  friction?: number;
  speed?: number;
  bounciness?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
  duration?: number;
  useNativeDriver?: boolean;
}

/**
 * Hook to detect and respect user's reduce motion preference
 *
 * @example
 * ```tsx
 * function AnimatedComponent() {
 *   const { reduceMotionEnabled, getAnimationDuration } = useReduceMotion();
 *
 *   const animatedValue = useRef(new Animated.Value(0)).current;
 *
 *   const animate = () => {
 *     Animated.timing(animatedValue, {
 *       toValue: 1,
 *       duration: getAnimationDuration(300), // Returns 0 if reduce motion enabled
 *       useNativeDriver: true,
 *     }).start();
 *   };
 *
 *   return (
 *     <Animated.View style={{ opacity: animatedValue }}>
 *       <Text>Animated content</Text>
 *     </Animated.View>
 *   );
 * }
 * ```
 */
export const useReduceMotion = (): ReduceMotionResult => {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkReduceMotion = async () => {
      try {
        const isReduceMotionEnabled =
          await AccessibilityInfo.isReduceMotionEnabled();

        if (isMounted) {
          setReduceMotionEnabled(isReduceMotionEnabled);
          setIsLoading(false);

          if (isReduceMotionEnabled) {
            logger.info(
              '[Accessibility] Reduce motion is enabled - animations will be minimized'
            );
          }
        }
      } catch (error) {
        logger.warn('[Accessibility] Failed to check reduce motion setting', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void checkReduceMotion();

    // Listen for changes to reduce motion setting
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled: boolean) => {
        if (isMounted) {
          setReduceMotionEnabled(isEnabled);
          logger.info(
            `[Accessibility] Reduce motion changed to: ${isEnabled ? 'enabled' : 'disabled'}`
          );
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  /**
   * Get animation duration respecting reduce motion preference
   * Returns 0 for instant transitions when reduce motion is enabled
   */
  const getAnimationDuration = useCallback(
    (normalDuration: number): number => {
      if (reduceMotionEnabled) {
        // Return minimal duration (instant or very fast)
        return Platform.OS === 'ios' ? 0 : 1;
      }
      return normalDuration;
    },
    [reduceMotionEnabled]
  );

  /**
   * Get spring config respecting reduce motion preference
   * Returns high damping config for reduced/no bounce
   */
  const getSpringConfig = useCallback(
    (normalConfig: SpringConfig): SpringConfig => {
      if (reduceMotionEnabled) {
        return {
          ...normalConfig,
          // High damping = no bounce
          tension: 300,
          friction: 30,
          speed: 20,
          bounciness: 0,
          // For Reanimated
          stiffness: 1000,
          damping: 500,
          duration: 1,
        };
      }
      return normalConfig;
    },
    [reduceMotionEnabled]
  );

  return {
    reduceMotionEnabled,
    isLoading,
    getAnimationDuration,
    getSpringConfig,
  };
};

/**
 * HOC to inject reduce motion props into animated components
 */
export const withReduceMotion = <P extends object>(
  WrappedComponent: React.ComponentType<P & ReduceMotionResult>
): React.FC<P> => {
  const WithReduceMotion: React.FC<P> = (props) => {
    const reduceMotionProps = useReduceMotion();
    return <WrappedComponent {...props} {...reduceMotionProps} />;
  };

  WithReduceMotion.displayName = `WithReduceMotion(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithReduceMotion;
};

export default useReduceMotion;
