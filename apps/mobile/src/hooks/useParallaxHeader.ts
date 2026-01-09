/**
 * useParallaxHeader - Parallax Sticky Header Hook
 *
 * Creates a sticky header with parallax effect where avatar/content
 * shrinks and transforms into a mini navigation bar as user scrolls.
 *
 * Features:
 * - Smooth scale transitions for avatar
 * - Parallax text sizing
 * - Dynamic blur intensity
 * - Context preservation (no jarring header disappearance)
 *
 * Usage:
 * const { scrollHandler, headerStyle, avatarStyle, titleStyle } = useParallaxHeader({
 *   maxScroll: 200,
 *   avatarStartSize: 104,
 *   avatarEndSize: 32,
 * });
 */

import {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ParallaxHeaderConfig {
  /** Maximum scroll distance for full transformation (default: 200) */
  maxScroll?: number;
  /** Starting avatar size in pixels (default: 104) */
  avatarStartSize?: number;
  /** Ending avatar size in pixels (default: 32) */
  avatarEndSize?: number;
  /** Header minimum height (default: 60) */
  headerMinHeight?: number;
  /** Header maximum height (default: 280) */
  headerMaxHeight?: number;
  /** Enable blur effect (default: true) */
  enableBlur?: boolean;
}

export const useParallaxHeader = ({
  maxScroll = 200,
  avatarStartSize = 104,
  avatarEndSize = 32,
  headerMinHeight = 60,
  headerMaxHeight = 280,
  enableBlur = true,
}: ParallaxHeaderConfig = {}) => {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Header container style - shrinks height
  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, maxScroll],
      [headerMaxHeight, headerMinHeight + insets.top],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      scrollY.value,
      [0, maxScroll * 0.5, maxScroll],
      [1, 0.95, 0.9],
      Extrapolation.CLAMP,
    );

    return {
      height,
      opacity,
    };
  });

  // Avatar style - shrinks and moves to left
  const avatarStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, maxScroll],
      [1, avatarEndSize / avatarStartSize],
      Extrapolation.CLAMP,
    );

    // Move avatar to left edge when scrolled
    const translateX = interpolate(
      scrollY.value,
      [0, maxScroll * 0.6, maxScroll],
      [0, -40, -80],
      Extrapolation.CLAMP,
    );

    // Move avatar up slightly
    const translateY = interpolate(
      scrollY.value,
      [0, maxScroll * 0.6, maxScroll],
      [0, -20, -40],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }, { translateX }, { translateY }],
    };
  });

  // Title/Name style - shrinks and changes position
  const titleStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(
      scrollY.value,
      [0, maxScroll],
      [20, 16],
      Extrapolation.CLAMP,
    );

    const translateX = interpolate(
      scrollY.value,
      [0, maxScroll * 0.6, maxScroll],
      [0, 20, 40],
      Extrapolation.CLAMP,
    );

    const translateY = interpolate(
      scrollY.value,
      [0, maxScroll * 0.6, maxScroll],
      [0, -10, -20],
      Extrapolation.CLAMP,
    );

    return {
      fontSize,
      transform: [{ translateX }, { translateY }],
    };
  });

  // Subtitle/Location style - fades out
  const subtitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, maxScroll * 0.4, maxScroll * 0.7],
      [1, 0.5, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
    };
  });

  // Stats/Content style - fades out faster
  const contentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, maxScroll * 0.3, maxScroll * 0.6],
      [1, 0.3, 0],
      Extrapolation.CLAMP,
    );

    const translateY = interpolate(
      scrollY.value,
      [0, maxScroll * 0.5],
      [0, -20],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Blur intensity for header background
  const blurIntensity = useAnimatedStyle(() => {
    if (!enableBlur) return { opacity: 0 };

    const _intensity = interpolate(
      scrollY.value,
      [0, maxScroll * 0.5, maxScroll],
      [0, 15, 25],
      Extrapolation.CLAMP,
    );

    return {
      // Can't directly animate BlurView intensity, so use this for conditional rendering
      opacity: interpolate(
        scrollY.value,
        [0, maxScroll * 0.3],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  // Background gradient opacity - increases as header shrinks
  const gradientStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, maxScroll * 0.5, maxScroll],
      [0.3, 0.6, 0.9],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
    };
  });

  return {
    scrollY,
    scrollHandler,
    headerStyle,
    avatarStyle,
    titleStyle,
    subtitleStyle,
    contentStyle,
    blurIntensity,
    gradientStyle,
  };
};
