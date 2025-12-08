/**
 * Card Component
 * A flexible container component with multiple visual variants
 * and built-in press handling for interactive cards.
 */

import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet, Pressable } from 'react-native';
import { COLORS } from '../../constants/colors';

/** Card visual style variant */
type CardVariant = 'elevated' | 'outlined' | 'filled';

/** Card internal padding size */
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Visual variant - 'elevated' (shadow), 'outlined' (border), 'filled' (background) */
  variant?: CardVariant;
  /** Internal padding - 'none' (0), 'sm' (8), 'md' (16), 'lg' (24) */
  padding?: CardPadding;
  /** Press handler - makes card interactive when provided */
  onPress?: () => void;
  /** Additional container styles */
  style?: ViewStyle;
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
  ({ children, variant = 'elevated', padding = 'md', onPress, style }) => {
    // Memoize variant styles calculation
    const variantStyles = useMemo((): ViewStyle => {
      switch (variant) {
        case 'elevated':
          return {
            backgroundColor: COLORS.surfaceLight,
            shadowColor: COLORS.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          };
        case 'outlined':
          return {
            backgroundColor: COLORS.surfaceLight,
            borderWidth: 1,
            borderColor: COLORS.gray[200],
          };
        case 'filled':
          return {
            backgroundColor: COLORS.gray[50],
          };
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

    const cardContent = (
      <View style={[styles.base, variantStyles, paddingStyles, style]}>
        {children}
      </View>
    );

    if (onPress) {
      return (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          accessibilityRole="button"
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
});

export default Card;
