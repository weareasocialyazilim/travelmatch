/**
 * useLiquidStretch - Viscous Modal Drag Effect
 *
 * Adds liquid-like stretching to draggable modals and sheets.
 * Creates viscous material feel during interaction.
 *
 * Features:
 * - ScaleY + TranslateY combination
 * - Rubber band physics
 * - Smooth interpolation
 * - Drag gesture integration
 *
 * @example
 * ```tsx
 * const { animatedStyle, gestureHandler } = useLiquidStretch();
 *
 * <PanGestureHandler onGestureEvent={gestureHandler}>
 *   <Animated.View style={[styles.modal, animatedStyle]}>
 *     <ModalContent />
 *   </Animated.View>
 * </PanGestureHandler>
 * ```
 */

import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';

interface UseLiquidStretchOptions {
  /** Dismiss threshold in pixels (default: 150) */
  dismissThreshold?: number;
  /** Maximum stretch factor (default: 1.1) */
  maxStretch?: number;
  /** Callback when modal should dismiss */
  onDismiss?: () => void;
}

export const useLiquidStretch = (options?: UseLiquidStretchOptions) => {
  const { dismissThreshold = 150, maxStretch = 1.1, onDismiss } = options || {};

  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Only allow downward dragging
      const newTranslateY = startY.value + event.translationY;
      translateY.value = Math.max(0, newTranslateY);
    })
    .onEnd(() => {
      if (translateY.value > dismissThreshold) {
        // Dismiss modal
        if (onDismiss) {
          runOnJS(onDismiss)();
        }
      } else {
        // Snap back
        translateY.value = withSpring(0, {
          damping: 25,
          stiffness: 200,
          mass: 0.5,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    // Liquid stretch effect
    const scaleY = interpolate(
      translateY.value,
      [0, dismissThreshold],
      [1, maxStretch],
      Extrapolation.CLAMP,
    );

    // Opacity fade
    const opacity = interpolate(
      translateY.value,
      [0, dismissThreshold],
      [1, 0.7],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY: translateY.value }, { scaleY }],
      opacity,
    };
  });

  const reset = useCallback(() => {
    translateY.value = withSpring(0, {
      damping: 25,
      stiffness: 200,
      mass: 0.5,
    });
  }, [translateY]);

  return {
    animatedStyle,
    gesture,
    reset,
  };
};
