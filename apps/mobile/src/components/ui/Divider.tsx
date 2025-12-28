/**
 * Divider Component
 * A horizontal line separator with optional centered text.
 * Used to visually separate content sections.
 */

import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, primitives } from '../../constants/colors';

interface DividerProps {
  /** Optional centered text (creates OR-style divider) */
  text?: string;
  /** Vertical spacing around divider - sm(8), md(16), lg(24) */
  spacing?: 'sm' | 'md' | 'lg';
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * Divider - Horizontal separator line
 *
 * @example
 * ```tsx
 * // Simple divider
 * <Divider />
 *
 * // With text (OR separator)
 * <Divider text="OR" />
 *
 * // With custom spacing
 * <Divider spacing="lg" />
 * ```
 */
export const Divider = memo<DividerProps>(function Divider({
  text,
  spacing = 'md',
  style,
}) {
  const getSpacing = (): number => {
    switch (spacing) {
      case 'sm':
        return 8;
      case 'md':
        return 16;
      case 'lg':
        return 24;
      default:
        return 16;
    }
  };

  const spacingValue = getSpacing();

  if (text) {
    return (
      <View
        style={[
          styles.containerWithText,
          { marginVertical: spacingValue },
          style,
        ]}
      >
        <View style={styles.line} />
        <Text style={styles.text}>{text}</Text>
        <View style={styles.line} />
      </View>
    );
  }

  return (
    <View style={[styles.line, { marginVertical: spacingValue }, style]} />
  );
});

const styles = StyleSheet.create({
  containerWithText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: primitives.stone[200],
  },
  text: {
    paddingHorizontal: 16,
    fontSize: 12,
    color: COLORS.text.tertiary,
    fontWeight: '500',
  },
});

export default Divider;
