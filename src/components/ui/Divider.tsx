import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface DividerProps {
  text?: string;
  spacing?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  text,
  spacing = 'md',
  style,
}) => {
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
};

const styles = StyleSheet.create({
  containerWithText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray[200],
  },
  text: {
    paddingHorizontal: 16,
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
});

export default Divider;
