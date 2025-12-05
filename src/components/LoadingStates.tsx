import React from 'react';
import type { ViewStyle } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: ViewStyle;
}

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

/**
 * Centered loading spinner with optional message
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'large',
  color = COLORS.primary,
  style,
}) => (
  <View style={[styles.container, style]}>
    <ActivityIndicator size={size} color={color} />
    {message && <Text style={styles.loadingText}>{message}</Text>}
  </View>
);

/**
 * Error state with retry button
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong',
  onRetry,
  retryText = 'Try Again',
  icon = 'alert-circle-outline',
  style,
}) => (
  <View style={[styles.container, style]}>
    <MaterialCommunityIcons name={icon} size={64} color={COLORS.error} />
    <Text style={styles.errorTitle}>Oops!</Text>
    <Text style={styles.errorMessage}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <MaterialCommunityIcons name="refresh" size={18} color={COLORS.white} />
        <Text style={styles.retryButtonText}>{retryText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

/**
 * Empty state with optional action
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = 'inbox-outline',
  actionText,
  onAction,
  style,
}) => (
  <View style={[styles.container, style]}>
    <MaterialCommunityIcons
      name={icon}
      size={64}
      color={COLORS.textSecondary}
    />
    <Text style={styles.emptyTitle}>{title}</Text>
    {message && <Text style={styles.emptyMessage}>{message}</Text>}
    {actionText && onAction && (
      <TouchableOpacity style={styles.actionButton} onPress={onAction}>
        <Text style={styles.actionButtonText}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

/**
 * Offline state indicator
 */
export const OfflineState: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.container, style]}>
    <MaterialCommunityIcons
      name="wifi-off"
      size={64}
      color={COLORS.textSecondary}
    />
    <Text style={styles.emptyTitle}>You&apos;re Offline</Text>
    <Text style={styles.emptyMessage}>
      Check your internet connection and try again.
    </Text>
  </View>
);

/**
 * Inline loading indicator for buttons/actions
 */
export const InlineLoading: React.FC<{
  size?: number;
  color?: string;
}> = ({ size = 20, color = COLORS.white }) => (
  <ActivityIndicator size={size} color={color} />
);

/**
 * Pull to refresh hint text
 */
export const PullToRefreshHint: React.FC = () => (
  <View style={styles.pullHint}>
    <MaterialCommunityIcons
      name="gesture-swipe-down"
      size={16}
      color={COLORS.textSecondary}
    />
    <Text style={styles.pullHintText}>Pull to refresh</Text>
  </View>
);

/**
 * Loading overlay for full screen loading
 */
export const LoadingOverlay: React.FC<{
  visible: boolean;
  message?: string;
}> = ({ visible, message }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        {message && <Text style={styles.overlayText}>{message}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginTop: 12,
  },
  errorTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  errorMessage: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyMessage: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  pullHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  pullHintText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 150,
  },
  overlayText: {
    color: COLORS.text,
    fontSize: 15,
    marginTop: 12,
  },
});

export default LoadingState;
