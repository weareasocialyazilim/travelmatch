import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FadeInView } from './AnimatedComponents';

interface EmptyStateConfig {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

// Predefined empty states for common scenarios
export const EMPTY_STATES = {
  MOMENTS: {
    icon: 'compass-off-outline' as const,
    title: 'No moments found',
    subtitle: 'Be the first to share a moment in this area',
    actionLabel: 'Create Moment',
  },
  MESSAGES: {
    icon: 'message-off-outline' as const,
    title: 'No conversations yet',
    subtitle: 'Start a conversation by gifting a moment',
    actionLabel: 'Discover Moments',
  },
  REQUESTS: {
    icon: 'gift-off-outline' as const,
    title: 'No requests yet',
    subtitle: 'Gift requests will appear here',
  },
  NOTIFICATIONS: {
    icon: 'bell-off-outline' as const,
    title: 'No notifications',
    subtitle: "You're all caught up!",
  },
  SAVED: {
    icon: 'bookmark-off-outline' as const,
    title: 'No saved moments',
    subtitle: 'Save moments you want to revisit later',
    actionLabel: 'Discover Moments',
  },
  MY_MOMENTS: {
    icon: 'image-off-outline' as const,
    title: 'No moments yet',
    subtitle: 'Share your travel experiences with the world',
    actionLabel: 'Create Your First Moment',
  },
  SEARCH: {
    icon: 'magnify-close' as const,
    title: 'No results found',
    subtitle: 'Try adjusting your search or filters',
    actionLabel: 'Clear Filters',
  },
  TRANSACTIONS: {
    icon: 'wallet-outline' as const,
    title: 'No transactions yet',
    subtitle: 'Your transaction history will appear here',
  },
  REVIEWS: {
    icon: 'star-off-outline' as const,
    title: 'No reviews yet',
    subtitle: 'Reviews from your experiences will appear here',
  },
  BLOCKED_USERS: {
    icon: 'account-off-outline' as const,
    title: 'No blocked users',
    subtitle: 'Users you block will appear here',
  },
  OFFLINE: {
    icon: 'wifi-off' as const,
    title: "You're offline",
    subtitle: 'Check your internet connection and try again',
    actionLabel: 'Retry',
  },
  ERROR: {
    icon: 'alert-circle-outline' as const,
    title: 'Something went wrong',
    subtitle: 'Please try again later',
    actionLabel: 'Retry',
  },
};

interface UnifiedEmptyStateProps {
  type?: keyof typeof EMPTY_STATES;
  config?: EmptyStateConfig;
  style?: ViewStyle;
  compact?: boolean;
  animated?: boolean;
}

/**
 * Unified Empty State Component
 * Use predefined types or custom config
 */
const UnifiedEmptyState: React.FC<UnifiedEmptyStateProps> = ({
  type,
  config,
  style,
  compact = false,
  animated = true,
}) => {
  // Get config from type or use custom config
  const stateConfig = type ? EMPTY_STATES[type] : config;

  if (!stateConfig) {
    return null;
  }

  const { icon, title, subtitle, actionLabel, onAction } = {
    ...stateConfig,
    ...config, // Allow overriding predefined config
  };

  const content = (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      <View
        style={[styles.iconContainer, compact && styles.iconContainerCompact]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={compact ? 40 : 64}
          color={COLORS.gray[300]}
        />
      </View>

      <Text style={[styles.title, compact && styles.titleCompact]}>
        {title}
      </Text>

      {subtitle && (
        <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
          {subtitle}
        </Text>
      )}

      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, compact && styles.actionButtonCompact]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (animated) {
    return <FadeInView delay={100}>{content}</FadeInView>;
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  containerCompact: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconContainerCompact: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  titleCompact: {
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  subtitleCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  actionButtonCompact: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default UnifiedEmptyState;
