import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/colors';

interface GlassViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export const GlassView: React.FC<GlassViewProps> = ({ children, style }) => {
  return <View style={[styles.glassContainer, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  glassContainer: {
    backgroundColor: COLORS.glassBackground,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
});
