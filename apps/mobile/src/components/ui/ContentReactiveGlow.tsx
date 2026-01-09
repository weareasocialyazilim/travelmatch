/**
 * ContentReactiveGlow - Ambient Background Glow Component
 *
 * Renders corner glows that react to the dominant color of visible content.
 * Works with useContentReactiveGlow hook to create immersive atmosphere.
 *
 * Features:
 * - 4 corner glows (top-left, top-right, bottom-left, bottom-right)
 * - Smooth color transitions
 * - Blur effect for soft diffusion
 * - Absolute positioning (doesn't affect layout)
 *
 * Usage:
 * <ContentReactiveGlow colors={glowColors} opacity={glowOpacity} />
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { SharedValue } from 'react-native-reanimated';

interface GlowColors {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}

interface ContentReactiveGlowProps {
  /** Corner glow colors */
  colors: GlowColors;
  /** Animated opacity value */
  opacity?: SharedValue<number>;
  /** Glow size in pixels (default: 300) */
  glowSize?: number;
  /** Enable blur effect (default: true) */
  enableBlur?: boolean;
}

export const ContentReactiveGlow: React.FC<ContentReactiveGlowProps> = ({
  colors,
  opacity,
  glowSize = 300,
  enableBlur: _enableBlur = true,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    if (!opacity) return {};

    return {
      opacity: opacity.value,
    };
  });

  const glowStyle = {
    width: glowSize,
    height: glowSize,
    borderRadius: glowSize / 2,
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top-left glow */}
      <Animated.View
        style={[styles.glow, styles.topLeft, glowStyle, animatedStyle]}
      >
        <LinearGradient
          colors={[colors.topLeft, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Top-right glow */}
      <Animated.View
        style={[styles.glow, styles.topRight, glowStyle, animatedStyle]}
      >
        <LinearGradient
          colors={[colors.topRight, 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Bottom-left glow */}
      <Animated.View
        style={[styles.glow, styles.bottomLeft, glowStyle, animatedStyle]}
      >
        <LinearGradient
          colors={[colors.bottomLeft, 'transparent']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Bottom-right glow */}
      <Animated.View
        style={[styles.glow, styles.bottomRight, glowStyle, animatedStyle]}
      >
        <LinearGradient
          colors={[colors.bottomRight, 'transparent']}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
  },
  topLeft: {
    top: -150,
    left: -150,
  },
  topRight: {
    top: -150,
    right: -150,
  },
  bottomLeft: {
    bottom: -150,
    left: -150,
  },
  bottomRight: {
    bottom: -150,
    right: -150,
  },
});
