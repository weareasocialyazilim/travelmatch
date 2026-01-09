/**
 * LiquidTextInput - Premium Liquid Glass Form Input
 *
 * Features:
 * - Dynamic blur intensity on focus
 * - Neon breathing animation for active state
 * - Smooth scale transitions
 * - Premium glass morphism
 *
 * @example
 * ```tsx
 * <LiquidTextInput
 *   placeholder="Enter message..."
 *   value={text}
 *   onChangeText={setText}
 *   breathingColor="#DFFF00"
 * />
 * ```
 */

import React, { useState, useEffect } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  Platform,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';

interface LiquidTextInputProps extends TextInputProps {
  /** Neon breathing border color when focused */
  breathingColor?: string;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Blur intensity when unfocused (iOS only) */
  blurIntensity?: number;
  /** Blur intensity when focused (iOS only) */
  focusedBlurIntensity?: number;
}

export const LiquidTextInput: React.FC<LiquidTextInputProps> = ({
  breathingColor = COLORS.primary,
  containerStyle,
  blurIntensity = 20,
  focusedBlurIntensity = 50,
  style,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Animated values
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(0);
  const blurValue = useSharedValue(blurIntensity);

  useEffect(() => {
    if (isFocused) {
      // Scale up on focus
      scale.value = withSpring(1.02, {
        damping: 15,
        stiffness: 150,
      });

      // Breathing border animation
      borderOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, {
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.3, {
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      );

      // Increase blur intensity
      blurValue.value = withTiming(focusedBlurIntensity, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    } else {
      // Scale back to normal
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });

      // Cancel breathing animation
      cancelAnimation(borderOpacity);
      borderOpacity.value = withTiming(0, { duration: 200 });

      // Reset blur intensity
      blurValue.value = withTiming(blurIntensity, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    }

    return () => {
      cancelAnimation(borderOpacity);
    };
  }, [
    isFocused,
    blurIntensity,
    focusedBlurIntensity,
    scale,
    borderOpacity,
    blurValue,
  ]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
    borderColor: breathingColor,
  }));

  return (
    <Animated.View
      style={[styles.container, containerStyle, containerAnimatedStyle]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={blurValue.value} tint="dark" style={styles.blur}>
          <Animated.View style={[styles.borderLayer, borderAnimatedStyle]} />
          <TextInput
            {...textInputProps}
            style={[styles.input, style]}
            onFocus={(e) => {
              setIsFocused(true);
              textInputProps.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              textInputProps.onBlur?.(e);
            }}
            placeholderTextColor={COLORS.text.secondary}
          />
        </BlurView>
      ) : (
        <View style={styles.androidContainer}>
          <Animated.View style={[styles.borderLayer, borderAnimatedStyle]} />
          <TextInput
            {...textInputProps}
            style={[styles.input, styles.androidInput, style]}
            onFocus={(e) => {
              setIsFocused(true);
              textInputProps.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              textInputProps.onBlur?.(e);
            }}
            placeholderTextColor={COLORS.text.secondary}
          />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  blur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  androidContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  borderLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text.primary,
    minHeight: 50,
  },
  androidInput: {
    backgroundColor: 'transparent',
  },
});
