/**
 * useEnterAnimation Hook
 *
 * Provides enter/appear animations for components (fade + scale + translate).
 * Part of iOS 26.3 design system for TravelMatch.
 */
import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface UseEnterAnimationOptions {
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation duration for timing animations (ms) */
  duration?: number;
  /** Initial scale (default: 0.95) */
  initialScale?: number;
  /** Initial translateY (default: 20) */
  initialTranslateY?: number;
  /** Spring damping (default: 12) */
  damping?: number;
  /** Whether to use spring or timing animation (default: 'spring') */
  type?: 'spring' | 'timing';
  /** Whether to auto-start animation (default: true) */
  autoStart?: boolean;
}

interface UseEnterAnimationReturn {
  /** Animated style to apply to the component */
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  /** Function to trigger animation manually */
  enter: () => void;
  /** Function to reset to initial state */
  reset: () => void;
  /** Whether animation has completed */
  isVisible: boolean;
}

export const useEnterAnimation = (
  options: UseEnterAnimationOptions = {},
): UseEnterAnimationReturn => {
  const {
    delay = 0,
    duration = 300,
    initialScale = 0.95,
    initialTranslateY = 20,
    damping = 12,
    type = 'spring',
    autoStart = true,
  } = options;

  const opacity = useSharedValue(0);
  const scale = useSharedValue(initialScale);
  const translateY = useSharedValue(initialTranslateY);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const enter = () => {
    if (type === 'spring') {
      opacity.value = withDelay(delay, withSpring(1));
      scale.value = withDelay(delay, withSpring(1, { damping }));
      translateY.value = withDelay(delay, withSpring(0, { damping }));
    } else {
      opacity.value = withDelay(
        delay,
        withTiming(1, { duration, easing: Easing.out(Easing.cubic) }),
      );
      scale.value = withDelay(
        delay,
        withTiming(1, { duration, easing: Easing.out(Easing.cubic) }),
      );
      translateY.value = withDelay(
        delay,
        withTiming(0, { duration, easing: Easing.out(Easing.cubic) }),
      );
    }
  };

  const reset = () => {
    opacity.value = 0;
    scale.value = initialScale;
    translateY.value = initialTranslateY;
  };

  useEffect(() => {
    if (autoStart) {
      enter();
    }
  }, [autoStart]);

  return {
    animatedStyle,
    enter,
    reset,
    isVisible: opacity.value === 1,
  };
};

/**
 * useStaggeredAnimation Hook
 *
 * Provides staggered enter animations for list items.
 */
interface UseStaggeredAnimationOptions {
  /** Index of the item in the list */
  index: number;
  /** Delay between each item (ms) */
  staggerDelay?: number;
  /** Base delay before first item (ms) */
  baseDelay?: number;
  /** Maximum items to animate (after this, no delay) */
  maxAnimatedItems?: number;
}

export const useStaggeredAnimation = (
  options: UseStaggeredAnimationOptions,
) => {
  const {
    index,
    staggerDelay = 50,
    baseDelay = 0,
    maxAnimatedItems = 10,
  } = options;

  const effectiveDelay =
    index < maxAnimatedItems ? baseDelay + index * staggerDelay : 0;

  return useEnterAnimation({
    delay: effectiveDelay,
    initialScale: 0.9,
    initialTranslateY: 30,
  });
};

/**
 * useFadeAnimation Hook
 *
 * Simple fade in/out animation.
 */
export const useFadeAnimation = (
  options: {
    delay?: number;
    duration?: number;
    autoStart?: boolean;
  } = {},
) => {
  const { delay = 0, duration = 300, autoStart = true } = options;

  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const fadeIn = () => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) }),
    );
  };

  const fadeOut = () => {
    opacity.value = withTiming(0, {
      duration: duration / 2,
      easing: Easing.in(Easing.cubic),
    });
  };

  useEffect(() => {
    if (autoStart) {
      fadeIn();
    }
  }, [autoStart]);

  return {
    animatedStyle,
    fadeIn,
    fadeOut,
    opacity,
  };
};

/**
 * useSlideAnimation Hook
 *
 * Slide in from direction animation.
 */
export const useSlideAnimation = (
  options: {
    direction?: 'left' | 'right' | 'up' | 'down';
    distance?: number;
    delay?: number;
    duration?: number;
    autoStart?: boolean;
  } = {},
) => {
  const {
    direction = 'up',
    distance = 50,
    delay = 0,
    duration = 300,
    autoStart = true,
  } = options;

  const opacity = useSharedValue(0);
  const translate = useSharedValue(
    direction === 'up' || direction === 'left' ? distance : -distance,
  );

  const isHorizontal = direction === 'left' || direction === 'right';

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: isHorizontal
      ? [{ translateX: translate.value }]
      : [{ translateY: translate.value }],
  }));

  const slideIn = () => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) }),
    );
    translate.value = withDelay(
      delay,
      withSpring(0, { damping: 15, stiffness: 150 }),
    );
  };

  const slideOut = () => {
    opacity.value = withTiming(0, { duration: duration / 2 });
    translate.value = withTiming(
      direction === 'up' || direction === 'left' ? -distance : distance,
      { duration: duration / 2 },
    );
  };

  useEffect(() => {
    if (autoStart) {
      slideIn();
    }
  }, [autoStart]);

  return {
    animatedStyle,
    slideIn,
    slideOut,
  };
};

export default useEnterAnimation;
