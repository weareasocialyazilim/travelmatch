/**
 * Navigation States Component Library
 * 
 * Reusable components for empty states, offline states, and error states
 * Used across navigation screens for consistent UX
 * 
 * Features:
 * - Empty state variations (no data, no results, no matches)
 * - Offline state with auto-retry
 * - Error state with recovery actions
 * - Loading placeholders
 * - Customizable illustrations and actions
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
// @ts-ignore - Expo vector icons may not have type definitions
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ============================================================================
// TYPES
// ============================================================================

export type NavigationStateType =
  | 'empty'
  | 'offline'
  | 'error'
  | 'loading'
  | 'no-results'
  | 'no-matches'
  | 'no-messages'
  | 'no-trips'
  | 'no-notifications'
  | 'no-favorites';

export interface BaseStateProps {
  style?: ViewStyle;
  testID?: string;
}

export interface EmptyStateConfig {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export interface OfflineStateProps extends BaseStateProps {
  onRetry?: () => void | Promise<void>;
  message?: string;
  showBanner?: boolean;
}

export interface ErrorStateProps extends BaseStateProps {
  error?: Error | string;
  onRetry?: () => void | Promise<void>;
  onReport?: () => void;
  title?: string;
  description?: string;
}

export interface LoadingStateProps extends BaseStateProps {
  message?: string;
  size?: 'small' | 'large';
}

// ============================================================================
// THEME CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#2563eb',
  error: '#dc2626',
  warning: '#f59e0b',
  success: '#10b981',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  white: '#ffffff',
  black: '#000000',
  offline: '#6b7280',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
};

// ============================================================================
// EMPTY STATE CONFIGURATIONS
// ============================================================================

export const EMPTY_STATE_CONFIGS: Record<NavigationStateType, EmptyStateConfig> = {
  empty: {
    icon: 'inbox-outline',
    title: 'Nothing here yet',
    description: 'This section is empty',
  },
  'no-results': {
    icon: 'magnify',
    title: 'No results found',
    description: 'Try adjusting your search or filters',
  },
  'no-matches': {
    icon: 'heart-outline',
    title: 'No matches yet',
    description: 'Keep exploring to find your perfect travel buddy',
    actionLabel: 'Explore',
  },
  'no-messages': {
    icon: 'message-outline',
    title: 'No messages',
    description: 'Start a conversation with your matches',
    actionLabel: 'Find Matches',
  },
  'no-trips': {
    icon: 'airplane-takeoff',
    title: 'No trips planned',
    description: 'Create your first trip and start matching',
    actionLabel: 'Create Trip',
  },
  'no-notifications': {
    icon: 'bell-outline',
    title: 'No notifications',
    description: "You're all caught up!",
  },
  'no-favorites': {
    icon: 'heart-outline',
    title: 'No favorites',
    description: 'Save profiles you like to find them later',
    actionLabel: 'Discover',
  },
  offline: {
    icon: 'wifi-off',
    title: "You're offline",
    description: 'Check your internet connection',
  },
  error: {
    icon: 'alert-circle-outline',
    title: 'Something went wrong',
    description: 'Please try again',
  },
  loading: {
    icon: 'loading',
    title: 'Loading...',
    description: 'Please wait',
  },
};

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

export interface EmptyStateProps extends BaseStateProps {
  type?: NavigationStateType;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  illustration?: React.ReactNode;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'empty',
  icon: customIcon,
  title: customTitle,
  description: customDescription,
  actionLabel: customActionLabel,
  onAction: customOnAction,
  secondaryActionLabel,
  onSecondaryAction,
  illustration,
  compact = false,
  style,
  testID,
}) => {
  const config = EMPTY_STATE_CONFIGS[type];
  const icon = customIcon || config.icon;
  const title = customTitle || config.title;
  const description = customDescription || config.description;
  const actionLabel = customActionLabel || config.actionLabel;
  const onAction = customOnAction || config.onAction;

  return (
    <View
      style={[styles.container, compact && styles.containerCompact, style]}
      testID={testID || `empty-state-${type}`}
    >
      {illustration ? (
        illustration
      ) : (
        <View style={[styles.iconContainer, compact && styles.iconContainerCompact]}>
          <MaterialCommunityIcons
            name={icon}
            size={compact ? 32 : 48}
            color={COLORS.gray[400]}
          />
        </View>
      )}

      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      <Text style={[styles.description, compact && styles.descriptionCompact]}>
        {description}
      </Text>

      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actionsContainer}>
          {actionLabel && onAction && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onAction}
              activeOpacity={0.8}
              testID={`${testID}-primary-action`}
            >
              <Text style={styles.primaryButtonText}>{actionLabel}</Text>
            </TouchableOpacity>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onSecondaryAction}
              activeOpacity={0.8}
              testID={`${testID}-secondary-action`}
            >
              <Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

// ============================================================================
// OFFLINE STATE COMPONENT
// ============================================================================

export const OfflineState: React.FC<OfflineStateProps> = ({
  onRetry,
  message = "You're offline",
  showBanner = false,
  style,
  testID,
}) => {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = useCallback(async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

  if (showBanner) {
    return (
      <View style={[styles.bannerContainer, style]} testID={testID || 'offline-banner'}>
        <View style={styles.bannerContent}>
          <MaterialCommunityIcons name="wifi-off" size={18} color={COLORS.white} />
          <Text style={styles.bannerMessage}>{message}</Text>
        </View>

        {onRetry && (
          <TouchableOpacity
            style={styles.bannerRetryButton}
            onPress={handleRetry}
            disabled={isRetrying}
            activeOpacity={0.7}
            testID={`${testID}-retry`}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.bannerRetryText}>Retry</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]} testID={testID || 'offline-state'}>
      <View style={styles.offlineIconContainer}>
        <MaterialCommunityIcons name="wifi-off" size={48} color={COLORS.offline} />
      </View>

      <Text style={styles.title}>{message}</Text>
      <Text style={styles.description}>Check your internet connection and try again</Text>

      {onRetry && (
        <TouchableOpacity
          style={[styles.primaryButton, isRetrying && styles.buttonDisabled]}
          onPress={handleRetry}
          disabled={isRetrying}
          activeOpacity={0.8}
          testID={`${testID}-retry`}
        >
          {isRetrying ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <MaterialCommunityIcons name="refresh" size={20} color={COLORS.white} />
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============================================================================
// ERROR STATE COMPONENT
// ============================================================================

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onReport,
  title = 'Something went wrong',
  description,
  style,
  testID,
}) => {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = useCallback(async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

  const errorMessage =
    description || (typeof error === 'string' ? error : error?.message || 'Please try again');

  return (
    <View style={[styles.container, style]} testID={testID || 'error-state'}>
      <View style={styles.errorIconContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color={COLORS.error}
        />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{errorMessage}</Text>

      <View style={styles.actionsContainer}>
        {onRetry && (
          <TouchableOpacity
            style={[styles.primaryButton, isRetrying && styles.buttonDisabled]}
            onPress={handleRetry}
            disabled={isRetrying}
            activeOpacity={0.8}
            testID={`${testID}-retry`}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <MaterialCommunityIcons name="refresh" size={20} color={COLORS.white} />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {onReport && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onReport}
            activeOpacity={0.8}
            testID={`${testID}-report`}
          >
            <MaterialCommunityIcons name="bug-outline" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Report Issue</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ============================================================================
// LOADING STATE COMPONENT
// ============================================================================

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'large',
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID || 'loading-state'}>
      <ActivityIndicator size={size} color={COLORS.primary} />
      {message && <Text style={styles.loadingMessage}>{message}</Text>}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  containerCompact: {
    padding: SPACING.lg,
  },

  // Icon containers
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray[100],
    marginBottom: SPACING.lg,
  },
  iconContainerCompact: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: SPACING.md,
  },
  offlineIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray[100],
    marginBottom: SPACING.lg,
  },
  errorIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.error}15`,
    marginBottom: SPACING.lg,
  },

  // Text
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 18,
    marginBottom: SPACING.xs,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.gray[600],
    marginBottom: SPACING.lg,
    textAlign: 'center',
    maxWidth: 280,
  },
  descriptionCompact: {
    fontSize: 14,
    marginBottom: SPACING.md,
  },
  loadingMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.gray[600],
    marginTop: SPACING.md,
    textAlign: 'center',
  },

  // Actions
  actionsContainer: {
    gap: SPACING.sm,
    width: '100%',
    maxWidth: 280,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    minHeight: 48,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    minHeight: 48,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Banner (Offline)
  bannerContainer: {
    backgroundColor: COLORS.offline,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerMessage: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  bannerRetryButton: {
    backgroundColor: `${COLORS.white}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  bannerRetryText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  EmptyState,
  OfflineState,
  ErrorState,
  LoadingState,
};
