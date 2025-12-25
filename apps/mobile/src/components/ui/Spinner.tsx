/**
 * Spinner Component
 * Genel loading indicator
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'large',
  color = COLORS.primary,
  message,
  fullScreen = false,
  style,
}) => {
  const containerStyle = fullScreen
    ? styles.fullScreenContainer
    : styles.container;

  return (
    <View style={[containerStyle, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  fullScreenContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});
