/**
 * Animation Utilities
 * Reusable animation hooks and utilities using react-native-reanimated
 */

import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

/**
 * Spring Animation Config
 */
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

/**
 * Timing Animation Config
 */
const _TIMING_CONFIG = {
  duration: 200,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

/**
 * Press Scale Animation Hook
 * Scales down element on press, scales back on release
 *
 * @example
 * const { animatedStyle, handlePressIn, handlePressOut } = usePressScale();
 *
 * <Animated.View style={animatedStyle}>
 *   <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
 *     <Text>Press Me</Text>
 *   </Pressable>
 * </Animated.View>
 */
export const usePressScale = (scaleValue = 0.95) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleValue, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  return {
    animatedStyle,
    handlePressIn,
    handlePressOut,
    // Aliases for convenience
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
  };
};

/**
 * Fade Animation Hook
 * Fades element in/out
 *
 * @example
 * const { animatedStyle, fadeIn, fadeOut } = useFade();
 *
 * <Animated.View style={animatedStyle}>
 *   <Text>Content</Text>
 * </Animated.View>
 */
export const useFade = (initialOpacity = 0) => {
  const opacity = useSharedValue(initialOpacity);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const fadeIn = (duration = 300) => {
    opacity.value = withTiming(1, { duration });
  };

  const fadeOut = (duration = 300) => {
    opacity.value = withTiming(0, { duration });
  };

  return {
    animatedStyle,
    fadeIn,
    fadeOut,
  };
};

/**
 * Slide Animation Hook
 * Slides element from specified direction
 *
 * @example
 * const { animatedStyle, slideIn, slideOut } = useSlide('left');
 */
export const useSlide = (
  direction: 'left' | 'right' | 'up' | 'down' = 'left',
  distance = 300,
) => {
  const translateX = useSharedValue(
    direction === 'left' ? -distance : direction === 'right' ? distance : 0,
  );
  const translateY = useSharedValue(
    direction === 'up' ? -distance : direction === 'down' ? distance : 0,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const slideIn = () => {
    translateX.value = withSpring(0, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
  };

  const slideOut = () => {
    if (direction === 'left') {
      translateX.value = withSpring(-distance, SPRING_CONFIG);
    } else if (direction === 'right') {
      translateX.value = withSpring(distance, SPRING_CONFIG);
    } else if (direction === 'up') {
      translateY.value = withSpring(-distance, SPRING_CONFIG);
    } else {
      translateY.value = withSpring(distance, SPRING_CONFIG);
    }
  };

  return {
    animatedStyle,
    slideIn,
    slideOut,
  };
};

/**
 * Bounce Animation Hook
 * Bounces element (useful for attention-grabbing)
 */
export const useBounce = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bounce = () => {
    scale.value = withSpring(1.1, SPRING_CONFIG, () => {
      scale.value = withSpring(1, SPRING_CONFIG);
    });
  };

  return {
    animatedStyle,
    bounce,
  };
};

/**
 * Shake Animation Hook
 * Shakes element horizontally (useful for error states)
 */
export const useShake = () => {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const shake = () => {
    const shakeSequence = [10, -10, 8, -8, 6, -6, 4, -4, 0];

    shakeSequence.forEach((value, index) => {
      setTimeout(() => {
        translateX.value = withTiming(value, { duration: 50 });
      }, index * 50);
    });
  };

  return {
    animatedStyle,
    shake,
  };
};

/**
 * Rotate Animation Hook
 * Rotates element
 */
export const useRotate = () => {
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const rotate = (degrees: number, duration = 300) => {
    rotation.value = withTiming(degrees, { duration });
  };

  const resetRotation = (duration = 300) => {
    rotation.value = withTiming(0, { duration });
  };

  return {
    animatedStyle,
    rotate,
    resetRotation,
  };
};
