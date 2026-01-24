// components/ui/Button.tsx
// Lovendo Ultimate Design System 2026
// Standardında Buton Sistemi
// Neon parlaması, haptik geri bildirim ve ipeksi geçişler içerir.
//
// CONSOLIDATED: Replaces Button.tsx, HapticButton.tsx, AnimatedButton.tsx
// All button variants now unified in this single master component.

import React, { useCallback, useEffect } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, PALETTE } from '@/constants/colors';
import { SHADOWS } from '@/constants/shadows';
import { TYPOGRAPHY } from '@/theme/typography';
import { RADIUS, SIZES, SPACING } from '@/constants/spacing';
import { SPRING, HAPTIC } from '@/hooks/useMotion';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'danger'
  | 'neon'
  | 'glass';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AnimationMode = 'none' | 'pulse' | 'shimmer';
type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'none';

interface ButtonProps {
  /** Button text - use either children or title */
  children?: string;
  /** Button text - alias for children (backward compat) */
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Generic icon slot (renders before text) */
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  testID?: string;
  /** Enable/disable haptic feedback (default: true) */
  hapticEnabled?: boolean;
  /** Type of haptic feedback (default: 'light') */
  hapticType?: HapticType;
  /** Animation mode for attention-grabbing buttons */
  animationMode?: AnimationMode;
  /** Accessibility label override */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
}

export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  AnimationMode,
  HapticType,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Haptic helper function
const triggerHaptic = (type: HapticType) => {
  if (type === 'none') return;

  switch (type) {
    case 'light':
      HAPTIC.light();
      break;
    case 'medium':
      HAPTIC.medium();
      break;
    case 'heavy':
      HAPTIC.heavy();
      break;
    case 'success':
      HAPTIC.success();
      break;
    case 'warning':
      HAPTIC.warning();
      break;
    case 'error':
      HAPTIC.error();
      break;
  }
};

export const Button: React.FC<ButtonProps> = ({
  children,
  title,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  style,
  textStyle,
  testID,
  hapticEnabled = true,
  hapticType = 'light',
  animationMode = 'none',
  accessibilityLabel,
  accessibilityHint,
}) => {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const shimmerTranslateX = useSharedValue(-100);

  // Support both children and title props
  const buttonText = children || title || '';

  // Pulse animation effect
  useEffect(() => {
    if (animationMode === 'pulse' && !disabled) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, {
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = 1;
    }

    return () => {
      cancelAnimation(pulseScale);
    };
  }, [animationMode, disabled, pulseScale]);

  // Shimmer animation effect
  useEffect(() => {
    if (animationMode === 'shimmer' && !disabled) {
      shimmerTranslateX.value = withRepeat(
        withTiming(200, { duration: 2000, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      cancelAnimation(shimmerTranslateX);
      shimmerTranslateX.value = -100;
    }

    return () => {
      cancelAnimation(shimmerTranslateX);
    };
  }, [animationMode, disabled, shimmerTranslateX]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, SPRING.snappy);
    if (hapticEnabled) {
      runOnJS(triggerHaptic)(hapticType);
    }
  }, [hapticEnabled, hapticType]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING.default);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { scale: pulseScale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value }],
  }));

  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    xs: { height: SIZES.buttonXS, paddingHorizontal: SPACING.sm },
    sm: { height: SIZES.buttonSmall, paddingHorizontal: SPACING.base },
    md: { height: SIZES.button, paddingHorizontal: SPACING.lg },
    lg: { height: SIZES.buttonLarge, paddingHorizontal: SPACING.xl },
    xl: { height: SIZES.buttonXL, paddingHorizontal: SPACING['2xl'] },
  };

  const textSizeStyles: Record<ButtonSize, TextStyle> = {
    xs: TYPOGRAPHY.labelXSmall,
    sm: TYPOGRAPHY.labelSmall,
    md: TYPOGRAPHY.label,
    lg: TYPOGRAPHY.labelLarge,
    xl: TYPOGRAPHY.labelLarge,
  };

  const radiusBySize: Record<ButtonSize, number> = {
    xs: RADIUS.buttonSmall,
    sm: RADIUS.buttonSmall,
    md: RADIUS.button,
    lg: RADIUS.button,
    xl: RADIUS.buttonLarge,
  };

  const iconSize =
    size === 'xl'
      ? 24
      : size === 'lg'
        ? 22
        : size === 'md'
          ? 20
          : size === 'sm'
            ? 18
            : 16;

  const getTextColor = (): string => {
    if (disabled) return COLORS.textDisabled;
    switch (variant) {
      case 'primary':
      case 'neon':
        return '#0A0A0A'; // Dark text on neon for WCAG contrast
      case 'danger':
      case 'glass':
        return PALETTE.white;
      case 'secondary':
      case 'outline':
      case 'ghost':
        return COLORS.primary;
      default:
        return PALETTE.white;
    }
  };

  const getIconColor = (): string => {
    if (disabled) return COLORS.textDisabled;
    switch (variant) {
      case 'primary':
      case 'neon':
        return '#0A0A0A'; // Dark icons on neon for contrast
      case 'danger':
      case 'glass':
        return PALETTE.white;
      default:
        return COLORS.primary;
    }
  };

  // Accessibility props computed
  const a11yProps = {
    accessible: true,
    accessibilityRole: 'button' as const,
    accessibilityLabel: accessibilityLabel || buttonText,
    accessibilityHint,
    accessibilityState: { disabled: disabled || loading },
  };

  const renderContent = () => (
    <>
      {/* Shimmer overlay for shimmer animation mode */}
      {animationMode === 'shimmer' && !disabled && (
        <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />
      )}

      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary' ||
            variant === 'neon' ||
            variant === 'danger' ||
            variant === 'glass'
              ? '#FFF'
              : COLORS.primary
          }
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {/* Generic icon slot */}
          {icon && <View style={styles.iconGap}>{icon}</View>}

          {/* Left icon from icon library */}
          {leftIcon && !icon && (
            <MaterialCommunityIcons
              name={leftIcon}
              size={iconSize}
              color={getIconColor()}
              style={styles.leftIcon}
            />
          )}

          <Text
            style={[
              styles.text,
              textSizeStyles[size],
              { color: getTextColor() },
              variant === 'neon' && styles.neonText,
              textStyle,
            ]}
          >
            {buttonText}
          </Text>

          {rightIcon && (
            <MaterialCommunityIcons
              name={rightIcon}
              size={iconSize}
              color={getIconColor()}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </>
  );

  // Primary variant with gradient
  if (variant === 'primary') {
    return (
      <Animated.View
        style={[fullWidth && styles.fullWidth, animatedStyle, style]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          testID={testID}
          {...a11yProps}
          style={[
            styles.button,
            sizeStyles[size],
            { borderRadius: radiusBySize[size] },
            disabled && styles.disabled,
          ]}
        >
          <LinearGradient
            colors={disabled ? GRADIENTS.disabled : GRADIENTS.gift}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.gradient,
              { borderRadius: radiusBySize[size] },
              !disabled && SHADOWS.md,
            ]}
          >
            {renderContent()}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  // Neon variant with glow effect
  // Android: Uses a colored backdrop for glow since elevation is gray-only
  if (variant === 'neon') {
    const neonRadius = radiusBySize[size];

    return (
      <Animated.View
        style={[fullWidth && styles.fullWidth, animatedStyle, style]}
      >
        {/* Android: Colored glow backdrop layer */}
        {Platform.OS === 'android' && !disabled && (
          <View
            style={[
              styles.androidNeonGlowBackdrop,
              { borderRadius: neonRadius + 4 },
            ]}
          />
        )}
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          testID={testID}
          {...a11yProps}
          style={[
            styles.button,
            sizeStyles[size],
            { borderRadius: neonRadius },
            disabled && styles.disabled,
          ]}
        >
          <LinearGradient
            colors={disabled ? GRADIENTS.disabled : GRADIENTS.gift}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.gradient,
              Platform.OS === 'ios' && styles.neonGlow,
              { borderRadius: neonRadius },
            ]}
          >
            {renderContent()}
            {/* Neon Glow Overlay */}
            <View style={styles.glowOverlay} />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  // Danger variant
  if (variant === 'danger') {
    return (
      <Animated.View
        style={[fullWidth && styles.fullWidth, animatedStyle, style]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          testID={testID}
          {...a11yProps}
          style={[
            styles.button,
            sizeStyles[size],
            { borderRadius: radiusBySize[size] },
            styles.danger,
            disabled && styles.disabled,
          ]}
        >
          {renderContent()}
        </Pressable>
      </Animated.View>
    );
  }

  // Glass variant with blur effect
  // Android fallback: Use opaque semi-transparent background instead of blur
  // for better performance on low-end devices
  if (variant === 'glass') {
    const glassContentStyle = [
      styles.glassFill,
      { borderRadius: radiusBySize[size] },
    ];

    return (
      <Animated.View
        style={[fullWidth && styles.fullWidth, animatedStyle, style]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          testID={testID}
          {...a11yProps}
          style={[
            styles.button,
            sizeStyles[size],
            { borderRadius: radiusBySize[size] },
            disabled && styles.disabled,
          ]}
        >
          {Platform.OS === 'android' ? (
            // Android: Opaque fallback for performance on low-end devices
            <View style={[glassContentStyle, styles.glassAndroidFallback]}>
              {renderContent()}
            </View>
          ) : (
            // iOS: Full blur effect
            <BlurView intensity={20} tint="light" style={glassContentStyle}>
              {renderContent()}
            </BlurView>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  // Other variants (secondary, ghost, outline)
  return (
    <Animated.View
      style={[fullWidth && styles.fullWidth, animatedStyle, style]}
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        testID={testID}
        {...a11yProps}
        style={[
          styles.button,
          sizeStyles[size],
          { borderRadius: radiusBySize[size] },
          variant === 'secondary' && styles.secondary,
          variant === 'outline' && [
            styles.outline,
            { borderRadius: radiusBySize[size] },
          ],
          variant === 'ghost' && styles.ghost,
          disabled && styles.disabled,
        ]}
      >
        {renderContent()}
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  neonText: {
    fontWeight: '900',
  },
  iconGap: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: SPACING.xs,
  },
  rightIcon: {
    marginLeft: SPACING.xs,
  },
  secondary: {
    backgroundColor: COLORS.primaryMuted,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: COLORS.error,
  },
  neonGlow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  // Android: Colored glow backdrop since elevation only renders gray shadows
  androidNeonGlowBackdrop: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 215, 0, 0.25)', // Gold/neon color at 25% opacity
    // Blur effect simulation using multiple semi-transparent layers
    elevation: 0,
    // Position slightly larger behind the button
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: -1,
  },
  disabled: {
    opacity: 0.5,
  },
  glassFill: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  // Android opaque fallback for performance on low-end devices
  glassAndroidFallback: {
    backgroundColor: 'rgba(30, 30, 32, 0.85)', // Matches COLORS.surface.glassBackground
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 50,
    zIndex: 10,
  },
});

export default Button;
