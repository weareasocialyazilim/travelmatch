/**
 * Card Component
 * A flexible container component with multiple visual variants
 * and built-in press handling for interactive cards.
 *
 * Includes glass variant for frosted glass effect (consolidates GlassCard).
 *
 * @example
 * ```tsx
 * // Glass effect card
 * <Card variant="glass" intensity={40}>
 *   <Text>Frosted glass content</Text>
 * </Card>
 * ```
 */

import React, { memo, useMemo } from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, primitives } from '../../constants/colors';
import { RADII, RADIUS } from '../../constants/radii';

/** Card visual style variant */
export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'glass';

/** Card internal padding size - can be preset string or custom number */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | number;

/** Blur tint for glass variant */
export type GlassTint = 'light' | 'dark' | 'default';

interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Visual variant - 'elevated' (shadow), 'outlined' (border), 'filled' (background), 'glass' (blur) */
  variant?: CardVariant;
  /** Internal padding - 'none' (0), 'sm' (12), 'md' (16), 'lg' (24) */
  padding?: CardPadding;
  /** Press handler - makes card interactive when provided */
  onPress?: () => void;
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
  /** Disable card interaction */
  disabled?: boolean;
  /** Accessibility label for the card */
  accessibilityLabel?: string;
  /** Test ID for testing */
  testID?: string;
  /** Blur intensity for glass variant (0-100, default 40) */
  intensity?: number;
  /** Blur tint for glass variant */
  tint?: GlassTint;
  /** Show border on glass variant */
  hasBorder?: boolean;
  /** Show border (alias for hasBorder) */
  showBorder?: boolean;
  /** Custom border radius override */
  borderRadius?: number;
}

/**
 * Card - Reusable container component
 *
 * @example
 * ```tsx
 * // Basic elevated card
 * <Card>
 *   <Text>Card content</Text>
 * </Card>
 *
 * // Interactive outlined card
 * <Card variant="outlined" onPress={() => console.log('pressed')}>
 *   <Text>Clickable card</Text>
 * </Card>
 *
 * // Filled card with large padding
 * <Card variant="filled" padding="lg">
 *   <Text>Large padding</Text>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = memo(
  ({
    children,
    variant = 'elevated',
    padding = 'md',
    onPress,
    style,
    disabled,
    accessibilityLabel,
    testID,
    intensity = 40,
    tint = 'dark',
    hasBorder = true,
    showBorder,
    borderRadius,
  }) => {
    // Use showBorder as alias for hasBorder
    const shouldShowBorder = showBorder ?? hasBorder;

    // Custom border radius or default
    const resolvedBorderRadius = borderRadius ?? RADIUS.lg;
    // Memoize variant styles calculation
    const variantStyles = useMemo((): ViewStyle => {
      switch (variant) {
        case 'elevated':
          return {
            backgroundColor: COLORS.surface.baseLight,
            shadowColor: COLORS.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          };
        case 'outlined':
          return {
            backgroundColor: COLORS.surface.baseLight,
            borderWidth: 1,
            borderColor: primitives.stone[200],
          };
        case 'filled':
          return {
            backgroundColor: primitives.stone[50],
          };
        case 'glass':
          // Glass styles handled separately for platform-specific rendering
          return {};
        default:
          return {};
      }
    }, [variant]);

    // Memoize padding styles calculation
    const paddingStyles = useMemo((): ViewStyle => {
      switch (padding) {
        case 'none':
          return { padding: 0 };
        case 'sm':
          return { padding: 12 };
        case 'md':
          return { padding: 16 };
        case 'lg':
          return { padding: 24 };
        default:
          return { padding: 16 };
      }
    }, [padding]);

    // Glass variant rendering (platform-specific)
    const renderGlassContent = () => {
      const glassContentStyle = [
        styles.base,
        styles.glass,
        { borderRadius: resolvedBorderRadius },
        shouldShowBorder && styles.glassBorder,
        paddingStyles,
        style,
        disabled && styles.disabled,
      ];

      // On Android, BlurView doesn't work well, use semi-transparent fallback
      if (Platform.OS === 'android') {
        return (
          <View
            testID={!onPress ? testID : undefined}
            style={[...glassContentStyle, styles.glassAndroid]}
          >
            {children}
          </View>
        );
      }

      // iOS with BlurView
      return (
        <BlurView
          intensity={intensity}
          tint={tint}
          testID={!onPress ? testID : undefined}
          style={glassContentStyle}
        >
          {children}
        </BlurView>
      );
    };

    // Standard variant rendering
    const renderStandardContent = () => (
      <View
        testID={!onPress ? testID : undefined}
        style={[
          styles.base,
          { borderRadius: resolvedBorderRadius },
          variantStyles,
          paddingStyles,
          style,
          disabled && styles.disabled,
        ]}
      >
        {children}
      </View>
    );

    const cardContent =
      variant === 'glass' ? renderGlassContent() : renderStandardContent();

    if (onPress) {
      const handlePress = () => {
        if (!disabled) {
          onPress();
        }
      };

      return (
        <Pressable
          testID={testID}
          onPress={handlePress}
          disabled={disabled}
          style={({ pressed }) => [{ opacity: pressed && !disabled ? 0.9 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled }}
          accessible={true}
        >
          {cardContent}
        </Pressable>
      );
    }

    return cardContent;
  },
);

Card.displayName = 'Card';

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  // Glass variant styles
  glass: {
    borderRadius: RADII.xl, // Apple-style xl radii (24)
    backgroundColor: COLORS.background.glass,
  },
  glassBorder: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  glassAndroid: {
    backgroundColor: COLORS.surface.glassBackground,
  },
});

/**
 * GlassCard - Backward-compatible alias for Card with glass variant
 * @deprecated Use <Card variant="glass" /> instead
 */
export const GlassCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="glass" />
);

/**
 * GlassView - Simple glass effect container without card styling
 */
interface GlassViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: GlassTint;
}

export const GlassView: React.FC<GlassViewProps> = ({
  children,
  style,
  intensity = 60,
  tint = 'light',
}) => {
  if (Platform.OS === 'android') {
    return (
      <View
        style={[{ backgroundColor: COLORS.surface.glassBackground }, style]}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[glassViewStyles.container, style]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </View>
  );
};

/**
 * GlassButton - Button with glass effect background
 */
interface GlassButtonProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: GlassTint;
  borderRadius?: number;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  style,
  intensity = 60,
  tint = 'light',
  borderRadius = RADII.lg,
}) => {
  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          glassButtonStyles.container,
          { borderRadius, backgroundColor: COLORS.surface.glassBackground },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[glassButtonStyles.container, { borderRadius }, style]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[StyleSheet.absoluteFillObject, { borderRadius }]}
      />
      {children}
    </View>
  );
};

const glassViewStyles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

const glassButtonStyles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Card;
