/**
 * NotificationCard Component
 * TravelMatch Design System 2026
 *
 * Displays notification items with:
 * - Clear visual hierarchy (Title: 15px semibold, Message: 14px, Timestamp: 12px)
 * - Type-based icons with semantic colors
 * - Unread indicator with accent color
 * - Smooth interactions
 *
 * Based on notification flow decision tree:
 * - Channel preferences (All, Mentions, DMs, Highlight Words, Never)
 * - User state awareness (DnD, Muted channels, Thread subscriptions)
 */

import React, { memo, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, PALETTE } from '@/constants/colors';

// ============================================
// NOTIFICATION TYPES & PRIORITY
// ============================================
export type NotificationType =
  | 'gift_received'
  | 'gift_sent'
  | 'request_accepted'
  | 'request_rejected'
  | 'request_pending'
  | 'new_message'
  | 'new_review'
  | 'proof_required'
  | 'proof_verified'
  | 'proof_rejected'
  | 'payment_received'
  | 'payment_sent'
  | 'trust_update'
  | 'system'
  | 'promotional';

export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low';

// ============================================
// TYPE CONFIG - Semantic icon & color mapping
// ============================================
interface TypeConfigItem {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  bgColor: string;
  priority: NotificationPriority;
}

const typeConfig: Record<NotificationType, TypeConfigItem> = {
  gift_received: {
    icon: 'gift',
    color: COLORS.secondary,
    bgColor: COLORS.secondaryMuted,
    priority: 'high'
  },
  gift_sent: {
    icon: 'gift-outline',
    color: COLORS.primary,
    bgColor: COLORS.primaryMuted,
    priority: 'normal'
  },
  request_accepted: {
    icon: 'check-circle',
    color: COLORS.success,
    bgColor: COLORS.successMuted,
    priority: 'high'
  },
  request_rejected: {
    icon: 'close-circle',
    color: COLORS.error,
    bgColor: 'rgba(239, 68, 68, 0.12)',
    priority: 'normal'
  },
  request_pending: {
    icon: 'clock-outline',
    color: COLORS.warning,
    bgColor: COLORS.primaryMuted,
    priority: 'normal'
  },
  new_message: {
    icon: 'message-text',
    color: COLORS.accent,
    bgColor: COLORS.accentMuted,
    priority: 'high'
  },
  new_review: {
    icon: 'star',
    color: COLORS.primary,
    bgColor: COLORS.primaryMuted,
    priority: 'normal'
  },
  proof_required: {
    icon: 'camera',
    color: COLORS.warning,
    bgColor: COLORS.primaryMuted,
    priority: 'urgent'
  },
  proof_verified: {
    icon: 'check-decagram',
    color: COLORS.trust.primary,
    bgColor: COLORS.trustMuted,
    priority: 'high'
  },
  proof_rejected: {
    icon: 'alert-circle',
    color: COLORS.error,
    bgColor: 'rgba(239, 68, 68, 0.12)',
    priority: 'high'
  },
  payment_received: {
    icon: 'cash-plus',
    color: COLORS.success,
    bgColor: COLORS.successMuted,
    priority: 'high'
  },
  payment_sent: {
    icon: 'cash-minus',
    color: COLORS.text.secondary,
    bgColor: COLORS.surfaceMuted,
    priority: 'normal'
  },
  trust_update: {
    icon: 'shield-check',
    color: COLORS.trust.primary,
    bgColor: COLORS.trustMuted,
    priority: 'normal'
  },
  system: {
    icon: 'bell',
    color: COLORS.text.secondary,
    bgColor: COLORS.surfaceMuted,
    priority: 'low'
  },
  promotional: {
    icon: 'tag',
    color: COLORS.secondary,
    bgColor: COLORS.secondaryMuted,
    priority: 'low'
  },
};

// ============================================
// COMPONENT PROPS
// ============================================
export interface NotificationCardProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  /** Action URL or deep link */
  actionUrl?: string;
  /** Secondary action label */
  actionLabel?: string;
  onPress?: () => void;
  onMarkAsRead?: () => void;
  onActionPress?: () => void;
}

// ============================================
// PRIORITY INDICATOR COMPONENT
// ============================================
const PriorityIndicator: React.FC<{ priority: NotificationPriority }> = memo(
  ({ priority }) => {
    if (priority === 'low' || priority === 'normal') return null;

    const isUrgent = priority === 'urgent';

    return (
      <View style={[
        styles.priorityIndicator,
        isUrgent && styles.priorityUrgent
      ]}>
        {isUrgent ? (
          <LinearGradient
            colors={GRADIENTS.gift}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.priorityGradient}
          />
        ) : (
          <View style={[styles.priorityDot, { backgroundColor: COLORS.primary }]} />
        )}
      </View>
    );
  }
);

PriorityIndicator.displayName = 'PriorityIndicator';

// ============================================
// MAIN COMPONENT
// ============================================
export const NotificationCard: React.FC<NotificationCardProps> = memo(
  ({
    type,
    title,
    message,
    timestamp,
    read,
    avatar,
    actionLabel,
    onPress,
    onMarkAsRead,
    onActionPress,
  }) => {
    // Memoize config lookup
    const config = useMemo(() => typeConfig[type], [type]);

    // Memoize card style
    const cardStyle = useMemo(
      () => [
        styles.card,
        !read && styles.unread,
        config.priority === 'urgent' && styles.cardUrgent
      ],
      [read, config.priority],
    );

    // Memoize icon background style
    const iconBgStyle = useMemo(
      () => [styles.iconBg, { backgroundColor: config.bgColor }],
      [config.bgColor],
    );

    // Memoize avatar source
    const avatarSource = useMemo(
      () => (avatar ? { uri: avatar } : null),
      [avatar],
    );

    const handlePress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.();
    }, [onPress]);

    const handleMarkAsRead = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onMarkAsRead?.();
    }, [onMarkAsRead]);

    const handleActionPress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onActionPress?.();
    }, [onActionPress]);

    return (
      <Pressable
        style={cardStyle}
        onPress={handlePress}
        android_ripple={{ color: COLORS.primaryMuted }}
      >
        {/* Priority Indicator - Left border for urgent items */}
        <PriorityIndicator priority={config.priority} />

        {/* Icon/Avatar Container */}
        <View style={styles.iconContainer}>
          {avatarSource ? (
            <Image source={avatarSource} style={styles.avatar} />
          ) : (
            <View style={iconBgStyle}>
              <MaterialCommunityIcons
                name={config.icon}
                size={20}
                color={config.color}
              />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title - 15px semibold */}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          {/* Message - 14px regular */}
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>

          {/* Footer Row */}
          <View style={styles.footerRow}>
            {/* Timestamp - 12px */}
            <Text style={styles.timestamp}>{timestamp}</Text>

            {/* Action Button */}
            {actionLabel && onActionPress && (
              <Pressable
                style={styles.actionButton}
                onPress={handleActionPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.actionButtonText}>{actionLabel}</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Unread Indicator */}
        {!read && (
          <Pressable
            style={styles.markReadButton}
            onPress={handleMarkAsRead}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Mark as read"
            accessibilityRole="button"
          >
            <View style={styles.unreadDot} />
          </Pressable>
        )}
      </Pressable>
    );
  },
  (prevProps, nextProps) =>
    prevProps.id === nextProps.id &&
    prevProps.type === nextProps.type &&
    prevProps.read === nextProps.read &&
    prevProps.title === nextProps.title &&
    prevProps.message === nextProps.message,
);

NotificationCard.displayName = 'NotificationCard';

// ============================================
// STYLES - Following typography hierarchy
// ============================================
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.utility.white,
    borderRadius: 16, // Consistent rounded corners
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  unread: {
    backgroundColor: COLORS.primarySurface,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  cardUrgent: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },

  // Priority indicator
  priorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  priorityUrgent: {
    width: 4,
  },
  priorityGradient: {
    flex: 1,
  },
  priorityDot: {
    width: 4,
    height: '100%',
  },

  // Icon/Avatar
  iconContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.border.light,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
  },

  // Title - 15px semibold (reference: 16px scaled for mobile)
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
    letterSpacing: -0.1,
  },

  // Message - 14px regular
  message: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 6,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Timestamp - 12px
  timestamp: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.text.tertiary,
  },

  // Action Button
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Unread indicator
  markReadButton: {
    padding: 4,
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
});

export default NotificationCard;
