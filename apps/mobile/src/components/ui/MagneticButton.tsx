/**
 * MagneticButton - Button with Magnetic Interaction
 *
 * Extends TMButton with Apple Vision Pro-style magnetic pull effect.
 * The button subtly moves toward the user's finger as it approaches,
 * creating a premium, tactile interaction.
 *
 * Features:
 * - Magnetic pull (2-3px) within attraction radius
 * - Glow effect on proximity
 * - Haptic feedback
 * - All TMButton props supported
 *
 * Usage:
 * <MagneticButton
 *   variant="primary"
 *   onPress={handlePress}
 *   attractionRadius={60}
 * >
 *   Create Moment
 * </MagneticButton>
 */

import React, { useCallback, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { TMButton, type TMButtonProps } from './TMButton';
import { useMagneticEffect } from '@/hooks/useMagneticEffect';

interface MagneticButtonProps extends TMButtonProps {
  /** Radius in pixels where magnetic effect activates (default: 60) */
  attractionRadius?: number;
  /** Maximum pull distance in pixels (default: 3) */
  maxPull?: number;
  /** Enable glow effect on proximity (default: true) */
  enableGlow?: boolean;
  /** Disable magnetic effect (default: false) */
  disableMagnetic?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  attractionRadius = 60,
  maxPull = 3,
  enableGlow = true,
  disableMagnetic = false,
  children,
  style,
  ...buttonProps
}) => {
  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const { magneticStyle, glowStyle, panGestureHandler, setButtonCenter } =
    useMagneticEffect({
      attractionRadius,
      maxPull,
      enableGlow,
      enableHaptics: true,
      springDamping: 15,
      springStiffness: 150,
    });

  /**
   * Handle layout to calculate button center position
   */
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      setButtonLayout({ x, y, width, height });

      // Set center position for magnetic calculation
      setButtonCenter(x + width / 2, y + height / 2);
    },
    [setButtonCenter],
  );

  if (disableMagnetic) {
    return (
      <TMButton {...buttonProps} style={style}>
        {children}
      </TMButton>
    );
  }

  return (
    <GestureDetector gesture={panGestureHandler}>
      <View style={styles.container} onLayout={handleLayout}>
        {/* Magnetic glow layer */}
        {enableGlow && (
          <Animated.View
            style={[styles.glowContainer, glowStyle]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={[
                'rgba(190, 255, 85, 0.3)',
                'rgba(190, 255, 85, 0.1)',
                'transparent',
              ]}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={styles.glow}
            />
          </Animated.View>
        )}

        {/* Button with magnetic pull */}
        <Animated.View style={[magneticStyle]}>
          <TMButton {...buttonProps} style={style}>
            {children}
          </TMButton>
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    zIndex: 0,
  },
  glow: {
    flex: 1,
    borderRadius: 100,
  },
});
