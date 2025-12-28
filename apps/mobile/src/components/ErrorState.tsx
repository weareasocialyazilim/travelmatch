import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: ViewStyle;
}

/**
 * Error state with retry button
 */
export const ErrorState: React.FC<ErrorStateProps> = memo(
  ({
    message = 'Something went wrong',
    onRetry,
    retryText = 'Try Again',
    icon = 'alert-circle-outline',
    style,
  }) => {
    // Memoize container style
    const containerStyle = useMemo(() => [styles.container, style], [style]);

    return (
      <View style={containerStyle}>
        <MaterialCommunityIcons name={icon} size={64} color={COLORS.feedback.error} />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorMessage}>{message}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <MaterialCommunityIcons name="refresh" size={18} color={COLORS.utility.white} />
            <Text style={styles.retryButtonText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.message === nextProps.message &&
    prevProps.retryText === nextProps.retryText &&
    prevProps.icon === nextProps.icon,
);

ErrorState.displayName = 'ErrorState';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  errorMessage: {
    color: COLORS.text.secondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.brand.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  retryButtonText: {
    color: COLORS.utility.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
