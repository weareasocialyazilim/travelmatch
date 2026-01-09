/**
 * useProximityBlur - Contextual Blur Intensity
 *
 * Dynamically adjusts blur intensity based on scroll position.
 * Creates depth perception and focus hierarchy.
 *
 * Features:
 * - Scroll-position based blur
 * - Smooth intensity transitions
 * - Top/bottom proximity zones
 * - Performance optimized
 *
 * @example
 * ```tsx
 * const { blurIntensity, onScroll } = useProximityBlur({
 *   baseIntensity: 20,
 *   maxIntensity: 35,
 * });
 *
 * <ScrollView onScroll={onScroll} scrollEventThrottle={16}>
 *   <BlurView intensity={blurIntensity.value} />
 * </ScrollView>
 * ```
 */

import {
  useSharedValue,
  useAnimatedScrollHandler,
  useDerivedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

interface UseProximityBlurOptions {
  /** Base blur intensity (default: 20) */
  baseIntensity?: number;
  /** Maximum blur intensity (default: 35) */
  maxIntensity?: number;
  /** Top proximity zone height (default: 100) */
  topZone?: number;
  /** Bottom proximity zone height (default: 100) */
  bottomZone?: number;
}

export const useProximityBlur = (options?: UseProximityBlurOptions) => {
  const {
    baseIntensity = 20,
    maxIntensity = 35,
    topZone = 100,
    bottomZone = 100,
  } = options || {};

  const scrollY = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const containerHeight = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      contentHeight.value = event.contentSize.height;
      containerHeight.value = event.layoutMeasurement.height;
    },
  });

  // Top blur intensity (increases near top)
  const topBlurIntensity = useDerivedValue(() => {
    return interpolate(
      scrollY.value,
      [0, topZone],
      [maxIntensity, baseIntensity],
      Extrapolation.CLAMP,
    );
  });

  // Bottom blur intensity (increases near bottom)
  const bottomBlurIntensity = useDerivedValue(() => {
    const maxScroll = contentHeight.value - containerHeight.value;
    const distanceFromBottom = maxScroll - scrollY.value;

    return interpolate(
      distanceFromBottom,
      [0, bottomZone],
      [maxIntensity, baseIntensity],
      Extrapolation.CLAMP,
    );
  });

  // Combined blur intensity (uses max of top/bottom)
  const blurIntensity = useDerivedValue(() => {
    return Math.max(topBlurIntensity.value, bottomBlurIntensity.value);
  });

  return {
    blurIntensity,
    topBlurIntensity,
    bottomBlurIntensity,
    onScroll,
  };
};

/**
 * Simple variant for input focus areas
 */
export const useInputProximityBlur = (isFocused: boolean) => {
  const blurIntensity = useDerivedValue(() => {
    return isFocused ? 35 : 20;
  });

  return { blurIntensity };
};
