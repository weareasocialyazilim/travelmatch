/**
 * TravelMatch Design System - Button Component
 *
 * @deprecated This component is deprecated. Use TMButton instead.
 * TMButton is the consolidated master button with all features:
 * - All variants: primary, secondary, ghost, outline, danger, neon, glass
 * - All sizes: xs, sm, md, lg, xl
 * - Animation modes: none, pulse, shimmer
 * - Haptic feedback with configurable types
 * - Full accessibility support
 *
 * Migration:
 * - Replace: import { Button } from '@/components/ui/Button'
 * - With: import { TMButton } from '@/components/ui/TMButton'
 *
 * @example
 * // Old usage:
 * <Button title="Click" onPress={fn} variant="primary" />
 *
 * // New usage:
 * <TMButton title="Click" onPress={fn} variant="primary" />
 */

import React, { memo, useMemo, useCallback } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { COLORS, GRADIENTS, PALETTE } from '../../constants/colors';
import { TYPE_SCALE } from '../../theme/typography';
import { SPRINGS } from '../../hooks/useAnimations';
import { a11yProps } from '../../utils/accessibility';

// Re-export TMButton for easier migration
export { TMButton } from './TMButton';
export type { TMButtonProps, ButtonVariant as TMButtonVariant, ButtonSize as TMButtonSize } from './TMButton';

// ============================================
// TYPES
// ============================================
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityHint?: string;
  accessibilityLabel?: string;
  haptic?: boolean;
}

// ============================================
// SIZE CONFIGS
// ============================================
const SIZE_CONFIG = {
  sm: {
    height: 40,
    paddingHorizontal: 16,
    fontSize: 14,
    iconSize: 16,
    borderRadius: 20,
  },
  md: {
    height: 52,
    paddingHorizontal: 24,
    fontSize: 16,
    iconSize: 20,
    borderRadius: 26,
  },
  lg: {
    height: 60,
    paddingHorizontal: 32,
    fontSize: 18,
    iconSize: 24,
    borderRadius: 30,
  },
} as const;

// ============================================
// ANIMATED PRESSABLE
// ============================================
const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

// ============================================
// MAIN COMPONENT
// ============================================
export const Button: React.FC<ButtonProps> = memo(
  ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    style,
    textStyle,
    accessibilityHint,
    accessibilityLabel,
    haptic = true,
  }) => {
    const scale = useSharedValue(1);
    const sizeConfig = SIZE_CONFIG[size];

    // Animated style for press feedback
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    // Press handlers
    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.97, SPRINGS.snappy);
    }, []);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, SPRINGS.bouncy);
    }, []);

    const handlePress = useCallback(() => {
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    }, [onPress, haptic]);

    // Get text color
    const textColor = useMemo((): string => {
      if (disabled) return COLORS.text.muted;

      switch (variant) {
        case 'primary':
        case 'danger':
          return PALETTE.white;
        case 'secondary':
          return COLORS.text.primary;
        case 'outline':
        case 'ghost':
          return COLORS.brand.primary;
        case 'glass':
          return PALETTE.white;
        default:
          return COLORS.text.primary;
      }
    }, [variant, disabled]);

    // Get button styles
    const buttonStyles = useMemo((): ViewStyle => {
      const base: ViewStyle = {
        height: sizeConfig.height,
        paddingHorizontal: sizeConfig.paddingHorizontal,
        borderRadius: sizeConfig.borderRadius,
      };

      if (disabled) {
        return {
          ...base,
          backgroundColor: COLORS.bg.tertiary,
          opacity: 0.6,
        };
      }

      switch (variant) {
        case 'primary':
          return {
            ...base,
            overflow: 'hidden',
          };
        case 'secondary':
          return {
            ...base,
            backgroundColor: COLORS.bg.secondary,
          };
        case 'outline':
          return {
            ...base,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: COLORS.brand.primary,
          };
        case 'ghost':
          return {
            ...base,
            backgroundColor: 'transparent',
          };
        case 'danger':
          return {
            ...base,
            backgroundColor: COLORS.feedback.error,
          };
        case 'glass':
          return {
            ...base,
            overflow: 'hidden',
          };
        default:
          return base;
      }
    }, [variant, disabled, sizeConfig]);

    // Accessibility props
    const a11y = useMemo(
      () =>
        a11yProps.button(
          accessibilityLabel || title,
          accessibilityHint || (loading ? 'Loading' : undefined),
          disabled || loading,
        ),
      [accessibilityLabel, title, accessibilityHint, loading, disabled],
    );

    // Render content
    const renderContent = () => (
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <MaterialCommunityIcons
                name={icon}
                size={sizeConfig.iconSize}
                color={textColor}
                style={styles.iconLeft}
              />
            )}
            <Text
              style={[
                styles.text,
                {
                  color: textColor,
                  fontSize: sizeConfig.fontSize,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <MaterialCommunityIcons
                name={icon}
                size={sizeConfig.iconSize}
                color={textColor}
                style={styles.iconRight}
              />
            )}
          </>
        )}
      </View>
    );

    // Render with gradient for primary
    if (variant === 'primary' && !disabled) {
      return (
        <AnimatedPressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          {...a11y}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || title}
          accessibilityState={{ disabled: disabled || loading }}
          style={[
            animatedStyle,
            buttonStyles,
            fullWidth && styles.fullWidth,
            style,
          ]}
        >
          <LinearGradient
            colors={GRADIENTS.gift}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientFill}
          >
            {renderContent()}
          </LinearGradient>
        </AnimatedPressable>
      );
    }

    // Render with glass effect
    if (variant === 'glass' && !disabled) {
      return (
        <AnimatedPressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          {...a11y}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || title}
          accessibilityState={{ disabled: disabled || loading }}
          style={[
            animatedStyle,
            buttonStyles,
            fullWidth && styles.fullWidth,
            style,
          ]}
        >
          <BlurView
            intensity={Platform.OS === 'ios' ? 20 : 80}
            tint="light"
            style={styles.glassFill}
          >
            {renderContent()}
          </BlurView>
        </AnimatedPressable>
      );
    }

    // Default render
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        {...a11y}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{ disabled: disabled || loading }}
        style={[
          animatedStyle,
          styles.base,
          buttonStyles,
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {renderContent()}
      </AnimatedPressable>
    );
  },
  (prevProps, nextProps) =>
    prevProps.title === nextProps.title &&
    prevProps.variant === nextProps.variant &&
    prevProps.size === nextProps.size &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.loading === nextProps.loading &&
    prevProps.fullWidth === nextProps.fullWidth &&
    prevProps.icon === nextProps.icon &&
    prevProps.iconPosition === nextProps.iconPosition,
);

Button.displayName = 'Button';

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  base: {
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
    ...TYPE_SCALE.label.large,
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  gradientFill: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});

export default Button;
