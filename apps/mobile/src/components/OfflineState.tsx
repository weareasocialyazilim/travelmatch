/**
 * OfflineState Component
 * Space-themed offline UI for TravelMatch
 *
 * Shows a creative "drifting in space" metaphor when offline
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import type { ViewStyle } from 'react-native';

export interface OfflineStateProps {
  /**
   * Custom message to display
   * @default "It seems you've lost connection to the TravelMatch network. Check your signal."
   */
  message?: string;

  /**
   * Callback when retry is pressed
   */
  onRetry?: () => void | Promise<void>;

  /**
   * Custom retry button text
   * @default "Reconnect Mission"
   */
  retryText?: string;

  /**
   * Show as compact banner instead of full screen
   * @default false
   */
  compact?: boolean;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Test ID
   */
  testID?: string;
}

/**
 * OfflineState - Space-themed offline UI
 *
 * @example
 * // Full screen
 * <OfflineState onRetry={handleRetry} />
 *
 * @example
 * // Compact banner
 * <OfflineState compact onRetry={handleRetry} />
 */
export const OfflineState: React.FC<OfflineStateProps> = ({
  message,
  onRetry,
  retryText = 'Reconnect Mission',
  compact = false,
  style,
  testID = 'offline-state',
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

  // Compact banner mode
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={handleRetry}
        disabled={isRetrying || !onRetry}
        activeOpacity={0.8}
        testID={testID}
      >
        {isRetrying ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <MaterialCommunityIcons name="wifi-off" size={16} color={COLORS.white} />
        )}
        <Text style={styles.compactText}>
          {message || 'No connection. Tap to retry.'}
        </Text>
      </TouchableOpacity>
    );
  }

  // Full screen mode - Space themed
  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons
          name="rocket-launch-outline"
          size={60}
          color={COLORS.brand.primary}
        />
      </View>

      <Text style={styles.title}>You're drifting in space</Text>
      <Text style={styles.desc}>
        {message ||
          "It seems you've lost connection to the TravelMatch network. Check your signal."}
      </Text>

      {onRetry && (
        <TouchableOpacity
          style={styles.btn}
          onPress={handleRetry}
          disabled={isRetrying}
          activeOpacity={0.8}
          testID={`${testID}-retry`}
        >
          {isRetrying ? (
            <ActivityIndicator size="small" color={COLORS.black} />
          ) : (
            <Text style={styles.btnText}>{retryText}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Full screen styles - Space themed
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    backgroundColor: COLORS.backgroundDark,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  desc: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: SPACING.xxl,
    maxWidth: 300,
  },
  btn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.brand.primary,
    borderRadius: 30,
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Compact banner styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.error,
  },
  compactText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
