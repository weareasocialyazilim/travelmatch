/**
 * HapticButton Component
 * A TouchableOpacity wrapper with built-in haptic feedback
 *
 * D3-001 Fix: Provides consistent haptic feedback across all buttons
 */

import React, { memo, useCallback } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Text,
  ActivityIndicator,
} from 'react-native';
import { triggerHaptic, HapticType } from '../../utils/haptics';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

/**
 * Button variants for different use cases
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

/**
 * Button sizes
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * HapticButton Props
 */
export interface HapticButtonProps extends Omit<
  TouchableOpacityProps,
  'style'
> {
  /** Button text label */
  label?: string;
  /** Haptic feedback type (default: LIGHT for normal, SUCCESS for primary) */
  hapticType?: HapticType;
  /** Whether haptic feedback is enabled (default: true) */
  hapticEnabled?: boolean;
  /** Button visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Loading state */
  loading?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Left icon component */
  leftIcon?: React.ReactNode;
  /** Right icon component */
  rightIcon?: React.ReactNode;
  /** Children (alternative to label) */
  children?: React.ReactNode;
}

/**
 * Get haptic type based on variant
 */
const getDefaultHapticType = (variant: ButtonVariant): HapticType => {
  switch (variant) {
    case 'primary':
      return HapticType.MEDIUM;
    case 'danger':
      return HapticType.WARNING;
    default:
      return HapticType.LIGHT;
  }
};

/**
 * HapticButton - TouchableOpacity with automatic haptic feedback
 *
 * @example
 * // Basic usage
 * <HapticButton label="Submit" onPress={handleSubmit} />
 *
 * // Primary button with success haptic
 * <HapticButton
 *   label="Confirm Payment"
 *   variant="primary"
 *   hapticType={HapticType.SUCCESS}
 *   onPress={handlePayment}
 * />
 *
 * // Outline button with icon
 * <HapticButton
 *   label="Share"
 *   variant="outline"
 *   leftIcon={<ShareIcon />}
 *   onPress={handleShare}
 * />
 *
 * // Disabled haptics (for specific cases)
 * <HapticButton
 *   label="Silent Action"
 *   hapticEnabled={false}
 *   onPress={handleSilentAction}
 * />
 */
export const HapticButton: React.FC<HapticButtonProps> = memo(
  ({
    label,
    hapticType,
    hapticEnabled = true,
    variant = 'primary',
    size = 'medium',
    loading = false,
    style,
    textStyle,
    leftIcon,
    rightIcon,
    children,
    onPress,
    disabled,
    ...rest
  }) => {
    // Determine haptic type
    const effectiveHapticType = hapticType ?? getDefaultHapticType(variant);

    // Handle press with haptic feedback
    const handlePress = useCallback(
      async (event: any) => {
        if (loading || disabled) return;

        // Trigger haptic feedback
        if (hapticEnabled) {
          await triggerHaptic(effectiveHapticType);
        }

        // Call original onPress
        onPress?.(event);
      },
      [onPress, hapticEnabled, effectiveHapticType, loading, disabled],
    );

    // Get variant styles
    const variantStyles = getVariantStyles(variant, disabled);
    const sizeStyles = getSizeStyles(size);

    return (
      <TouchableOpacity
        style={[
          styles.button,
          variantStyles.container,
          sizeStyles.container,
          disabled && styles.disabled,
          style,
        ]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator size="small" color={variantStyles.textColor} />
        ) : (
          <>
            {leftIcon && <>{leftIcon}</>}
            {label && (
              <Text
                style={[
                  styles.text,
                  { color: variantStyles.textColor },
                  sizeStyles.text,
                  textStyle,
                ]}
              >
                {label}
              </Text>
            )}
            {children}
            {rightIcon && <>{rightIcon}</>}
          </>
        )}
      </TouchableOpacity>
    );
  },
);

HapticButton.displayName = 'HapticButton';

/**
 * Get styles based on variant
 */
const getVariantStyles = (
  variant: ButtonVariant,
  disabled?: boolean | null,
) => {
  const opacity = disabled ? 0.5 : 1;

  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: COLORS.primary,
          opacity,
        } as ViewStyle,
        textColor: COLORS.white,
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: COLORS.secondary || '#6B7280',
          opacity,
        } as ViewStyle,
        textColor: COLORS.white,
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: COLORS.primary,
          opacity,
        } as ViewStyle,
        textColor: COLORS.primary,
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
          opacity,
        } as ViewStyle,
        textColor: COLORS.primary,
      };
    case 'danger':
      return {
        container: {
          backgroundColor: COLORS.error || '#EF4444',
          opacity,
        } as ViewStyle,
        textColor: COLORS.white,
      };
    default:
      return {
        container: {
          backgroundColor: COLORS.primary,
          opacity,
        } as ViewStyle,
        textColor: COLORS.white,
      };
  }
};

/**
 * Get styles based on size
 */
const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'small':
      return {
        container: {
          paddingVertical: SPACING.xs,
          paddingHorizontal: SPACING.sm,
          minHeight: 32,
        } as ViewStyle,
        text: {
          fontSize: 12,
        } as TextStyle,
      };
    case 'large':
      return {
        container: {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.xl,
          minHeight: 56,
        } as ViewStyle,
        text: {
          fontSize: 18,
        } as TextStyle,
      };
    case 'medium':
    default:
      return {
        container: {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.lg,
          minHeight: 44,
        } as ViewStyle,
        text: {
          fontSize: 16,
        } as TextStyle,
      };
  }
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default HapticButton;
