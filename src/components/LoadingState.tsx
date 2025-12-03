/**
 * Unified Loading State Component
 * Provides consistent loading experience across all screens
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';

/**
 * Loading Type
 */
export type LoadingType = 'skeleton' | 'spinner' | 'overlay';

/**
 * Loading State Props
 */
interface LoadingStateProps {
  type: LoadingType;
  count?: number; // For skeleton
  message?: string; // For overlay
  color?: string;
  size?: 'small' | 'large';
}

/**
 * Skeleton Item
 */
const SkeletonItem: React.FC<{ style?: object }> = ({ style }) => {
  return (
    <View style={[styles.skeletonItem, style]}>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
    </View>
  );
};

/**
 * Loading State Component
 *
 * @example
 * // Skeleton loading
 * <LoadingState type="skeleton" count={5} />
 *
 * // Spinner loading
 * <LoadingState type="spinner" />
 *
 * // Overlay loading with message
 * <LoadingState type="overlay" message="Loading your trips..." />
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  count = 3,
  message,
  color = COLORS.primary,
  size = 'large',
}) => {
  switch (type) {
    case 'skeleton':
      return (
        <View style={styles.skeletonContainer}>
          {Array.from({ length: count }).map((_, index) => (
            <SkeletonItem key={index} />
          ))}
        </View>
      );

    case 'spinner':
      return (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size={size} color={color} />
        </View>
      );

    case 'overlay':
      return (
        <Modal transparent visible animationType="fade">
          <View style={styles.overlayContainer}>
            <View style={styles.overlayContent}>
              <ActivityIndicator size="large" color={color} />
              {message && <Text style={styles.overlayMessage}>{message}</Text>}
            </View>
          </View>
        </Modal>
      );

    default:
      return null;
  }
};

const styles = StyleSheet.create({
  // Skeleton Styles
  skeletonContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  skeletonItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: COLORS.border,
    borderRadius: 4,
  },
  skeletonLineShort: {
    width: '60%',
  },

  // Spinner Styles
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },

  // Overlay Styles
  overlayContainer: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  overlayMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});
