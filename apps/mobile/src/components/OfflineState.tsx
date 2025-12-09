/**
 * OfflineState Component
 * Finalized single source for offline UI
 * 
 * Shows a clean offline state with optional retry button
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
import { spacing } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import type { ViewStyle } from 'react-native';

export interface OfflineStateProps {
  /**
   * Custom message to display
   * @default "Bağlantı Yok"
   */
  message?: string;
  
  /**
   * Callback when retry is pressed
   */
  onRetry?: () => void | Promise<void>;
  
  /**
   * Custom retry button text
   * @default "Tekrar Dene"
   */
  retryText?: string;
  
  /**
   * Show as banner instead of full screen
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
 * OfflineState - Single source for offline UI
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
  message = 'Bağlantı Yok',
  onRetry,
  retryText = 'Tekrar Dene',
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

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]} testID={testID}>
        <View style={styles.compactContent}>
          <MaterialCommunityIcons
            name="wifi-off"
            size={18}
            color={COLORS.textSecondary}
          />
          <Text style={styles.compactMessage}>{message}</Text>
        </View>
        
        {onRetry && (
          <TouchableOpacity
            style={styles.compactRetryButton}
            onPress={handleRetry}
            disabled={isRetrying}
            activeOpacity={0.7}
            testID={`${testID}-retry`}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.compactRetryText}>{retryText}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="wifi-off"
            size={64}
            color={COLORS.textSecondary}
          />
        </View>

        <Text style={styles.title}>İnternet Bağlantısı Yok</Text>
        <Text style={styles.message}>{message}</Text>

        {onRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            disabled={isRetrying}
            activeOpacity={0.8}
            testID={`${testID}-retry`}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="refresh"
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.retryButtonText}>{retryText}</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Full screen styles
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    minWidth: 160,
    gap: spacing.xs,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Compact banner styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  compactContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  compactMessage: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    flex: 1,
  },
  compactRetryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    minWidth: 80,
    alignItems: 'center',
  },
  compactRetryText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
