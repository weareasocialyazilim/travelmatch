/**
 * NotificationCard Component
 * TravelMatch Design System 2026
 *
 * Displays notification items with:
 * - Clear visual hierarchy (Title: 15px semibold, Message: 14px, Timestamp: 12px)
 * - Type-based icons with semantic colors
 * - Unread indicator with accent color
 * - Smooth interactions
 * - Liquid Platinum shimmer for high-value subscriber offers
 *
 * Based on notification flow decision tree:
 * - Channel preferences (All, Mentions, DMs, Highlight Words, Never)
 * - User state awareness (DnD, Muted channels, Thread subscriptions)
 *
 * Haptic Patterns:
 * - Gift received: Haptics.notificationAsync(Success)
 * - Trust note: Haptics.impactAsync(Soft)
 * - High-value offer: Haptics.notificationAsync(Success) + Impact(Heavy)
 */

import React, { memo, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { HapticManager } from '@/services/HapticManager';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { COLORS, GRADIENTS } from '@/constants/colors';

// ============================================
// NOTIFICATION TYPES & PRIORITY
// ============================================
export type NotificationType =
  | 'gift_received'
  | 'gift_sent'
  | 'high_value_offer' // NEW: Premium subscriber offer
  | 'subscriber_offer' // NEW: PayTR-backed offer
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
  | 'milestone_reached' // NEW: Trust Garden milestone
  | 'achievement_unlocked' // NEW: Badge earned
  | 'system'
  | 'promotional';

export type NotificationPriority =
  | 'critical'
  | 'urgent'
  | 'high'
  | 'normal'
  | 'low';

// ============================================
// TYPE CONFIG - Semantic icon & color mapping
// ============================================
interface TypeConfigItem {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  bgColor: string;
  priority: NotificationPriority;
  /** Haptic pattern for this notification type */
  hapticPattern?: 'success' | 'warning' | 'error' | 'soft' | 'heavy';
}

const typeConfig: Record<NotificationType, TypeConfigItem> = {
  gift_received: {
    icon: 'gift',
    color: COLORS.secondary,
    bgColor: COLORS.secondaryMuted,
    priority: 'high',
    hapticPattern: 'success',
  },
  gift_sent: {
    icon: 'gift-outline',
    color: COLORS.primary,
    bgColor: COLORS.primaryMuted,
    priority: 'normal',
  },
  high_value_offer: {
    icon: 'diamond',
    color: '#FFB800', // Gold
    bgColor: 'rgba(255, 184, 0, 0.15)',
    priority: 'critical',
    hapticPattern: 'heavy',
  },
  subscriber_offer: {
    icon: 'star',
    color: COLORS.secondary,
    bgColor: COLORS.secondaryMuted,
    priority: 'high',
    hapticPattern: 'success',
  },
  request_accepted: {
    icon: 'check-circle',
    color: COLORS.success,
    bgColor: COLORS.successMuted,
    priority: 'high',
  },
  request_rejected: {
    icon: 'close-circle',
    color: COLORS.error,
    bgColor: 'rgba(239, 68, 68, 0.12)',
    priority: 'normal',
  },
  request_pending: {
    icon: 'clock-outline',
    color: COLORS.warning,
    bgColor: COLORS.primaryMuted,
    priority: 'normal',
  },
  new_message: {
    icon: 'message-text',
    color: COLORS.accent.primary,
    bgColor: COLORS.accentMuted,
    priority: 'high',
  },
  new_review: {
    icon: 'star',
    color: COLORS.primary,
    bgColor: COLORS.primaryMuted,
    priority: 'normal',
  },
  proof_required: {
    icon: 'camera',
    color: COLORS.warning,
    bgColor: COLORS.primaryMuted,
    priority: 'urgent',
    hapticPattern: 'warning',
  },
  proof_verified: {
    icon: 'check-decagram',
    color: COLORS.trust.primary,
    bgColor: COLORS.trustMuted,
    priority: 'high',
    hapticPattern: 'success',
  },
  proof_rejected: {
    icon: 'alert-circle',
    color: COLORS.error,
    bgColor: 'rgba(239, 68, 68, 0.12)',
    priority: 'high',
    hapticPattern: 'error',
  },
  payment_received: {
    icon: 'cash-plus',
    color: COLORS.success,
    bgColor: COLORS.successMuted,
    priority: 'high',
    hapticPattern: 'success',
  },
  payment_sent: {
    icon: 'cash-minus',
    color: COLORS.text.secondary,
    bgColor: COLORS.surfaceMuted,
    priority: 'normal',
  },
  trust_update: {
    icon: 'shield-check',
    color: COLORS.trust.primary,
    bgColor: COLORS.trustMuted,
    priority: 'normal',
    hapticPattern: 'soft',
  },
  milestone_reached: {
    icon: 'flag-checkered',
    color: '#7B61FF', // Purple
    bgColor: 'rgba(123, 97, 255, 0.12)',
    priority: 'high',
    hapticPattern: 'success',
  },
  achievement_unlocked: {
    icon: 'trophy',
    color: '#FFB800', // Gold
    bgColor: 'rgba(255, 184, 0, 0.15)',
    priority: 'high',
    hapticPattern: 'success',
  },
  system: {
    icon: 'bell',
    color: COLORS.text.secondary,
    bgColor: COLORS.surfaceMuted,
    priority: 'low',
  },
  promotional: {
    icon: 'tag',
    color: COLORS.secondary,
    bgColor: COLORS.secondaryMuted,
    priority: 'low',
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
  /** Is this a high-value subscriber offer? Shows Liquid Platinum shimmer */
  isHighValueOffer?: boolean;
  /** Override priority for special styling */
  priority?: NotificationPriority;
  onPress?: () => void;
  onMarkAsRead?: () => void;
  onActionPress?: () => void;
}

// ============================================
// LIQUID PLATINUM SHIMMER - For high-value offers
// ============================================
const LiquidPlatinumShimmer: React.FC<{ isActive: boolean }> = memo(
  ({ isActive }) => {
    const shimmerProgress = useSharedValue(0);

    useEffect(() => {
      if (isActive) {
        shimmerProgress.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 2000 }),
            withTiming(0, { duration: 2000 }),
          ),
          -1,
          false,
        );
      }
    }, [isActive, shimmerProgress]);

    const shimmerStyle = useAnimatedStyle(() => {
      if (!isActive) return { opacity: 0 };

      return {
        opacity: interpolate(
          shimmerProgress.value,
          [0, 0.5, 1],
          [0.2, 0.5, 0.2],
        ),
        transform: [
          {
            translateX: interpolate(shimmerProgress.value, [0, 1], [-100, 100]),
          },
        ],
      };
    });

    if (!isActive) return null;

    return (
      <Animated.View style={[styles.liquidShimmer, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255, 215, 0, 0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    );
  },
);

LiquidPlatinumShimmer.displayName = 'LiquidPlatinumShimmer';

// ============================================
// PRIORITY INDICATOR COMPONENT
// ============================================
const PriorityIndicator: React.FC<{ priority: NotificationPriority }> = memo(
  ({ priority }) => {
    if (priority === 'low' || priority === 'normal') return null;

    const isUrgent = priority === 'urgent';

    return (
      <View
        style={[styles.priorityIndicator, isUrgent && styles.priorityUrgent]}
      >
        {isUrgent ? (
          <LinearGradient
            colors={GRADIENTS.gift}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.priorityGradient}
          />
        ) : (
          <View
            style={[styles.priorityDot, { backgroundColor: COLORS.primary }]}
          />
        )}
      </View>
    );
  },
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
    isHighValueOffer = false,
    priority: overridePriority,
    onPress,
    onMarkAsRead,
    onActionPress,
  }) => {
    // Memoize config lookup
    const config = useMemo(() => typeConfig[type], [type]);
    const effectivePriority = overridePriority || config.priority;
    const showLiquidShimmer = isHighValueOffer || type === 'high_value_offer';

    // Memoize card style
    const cardStyle = useMemo(
      () => [
        styles.card,
        !read && styles.unread,
        effectivePriority === 'critical' && styles.cardCritical,
        effectivePriority === 'urgent' && styles.cardUrgent,
        showLiquidShimmer && styles.cardPlatinum,
      ],
      [read, effectivePriority, showLiquidShimmer],
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

    /**
     * Trigger haptic feedback based on notification type
     */
    const triggerHaptic = useCallback((pattern?: string) => {
      switch (pattern) {
        case 'success':
          HapticManager.success();
          break;
        case 'warning':
          HapticManager.warning();
          break;
        case 'error':
          HapticManager.error();
          break;
        case 'soft':
          HapticManager.buttonPress();
          break;
        case 'heavy':
          HapticManager.destructiveAction();
          break;
        default:
          HapticManager.buttonPress();
      }
    }, []);

    const handlePress = useCallback(() => {
      triggerHaptic(config.hapticPattern);
      onPress?.();
    }, [onPress, config.hapticPattern, triggerHaptic]);

    const handleMarkAsRead = useCallback(() => {
      HapticManager.buttonPress();
      onMarkAsRead?.();
    }, [onMarkAsRead]);

    const handleActionPress = useCallback(() => {
      HapticManager.primaryAction();
      onActionPress?.();
    }, [onActionPress]);

    return (
      <Pressable
        style={cardStyle}
        onPress={handlePress}
        android_ripple={{ color: COLORS.primaryMuted }}
      >
        {/* Liquid Platinum Shimmer for high-value offers */}
        <LiquidPlatinumShimmer isActive={showLiquidShimmer && !read} />

        {/* Priority Indicator - Left border for urgent items */}
        <PriorityIndicator priority={effectivePriority} />

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
    prevProps.message === nextProps.message &&
    prevProps.isHighValueOffer === nextProps.isHighValueOffer,
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
  cardCritical: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800', // Gold for critical
    backgroundColor: 'rgba(255, 184, 0, 0.05)',
  },
  cardPlatinum: {
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },

  // Liquid Platinum shimmer
  liquidShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  shimmerGradient: {
    flex: 1,
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
