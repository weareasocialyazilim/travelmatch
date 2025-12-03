import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet, Pressable } from 'react-native';
import { COLORS } from '../../constants/colors';

type CardVariant = 'elevated' | 'outlined' | 'filled';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  style?: ViewStyle;
}

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
