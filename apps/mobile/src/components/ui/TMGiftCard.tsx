/**
 * TMGiftCard - TravelMatch Ultimate Design System 2026
 * Gift card component for chat messages
 *
 * Displays a gift message with:
 * - Amount and currency
 * - Moment title
 * - Sender info
 * - Expiration date
 * - Accept/Decline actions (for pending gifts)
 * - Status indicator
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SHADOWS, primitives } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { SPRING, HAPTIC } from '@/utils/motion';
import { TMAvatar } from './TMAvatar';

export type GiftStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface TMGiftCardProps {
  /** Gift amount */
  amount: number;
  /** Currency code (USD, TRY, EUR, etc.) */
  currency: string;
  /** Title of the moment being gifted */
  momentTitle: string;
  /** Sender's display name */
  senderName: string;
  /** Sender's avatar URL */
  senderAvatar?: string;
  /** Gift expiration date */
  expiresAt?: Date;
  /** Current gift status */
  status: GiftStatus;
  /** Callback when accept button is pressed */
  onAccept?: () => void;
  /** Callback when decline button is pressed */
  onDecline?: () => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

/**
 * Format currency with symbol
 */
const formatCurrency = (amount: number, currency: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    TRY: '₺',
    JPY: '¥',
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString()}`;
};

/**
 * Get status configuration
 */
const getStatusConfig = (
  status: GiftStatus,
): {
  label: string;
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
} => {
  switch (status) {
    case 'accepted':
      return { label: 'Accepted', color: COLORS.success, icon: 'check-circle' };
    case 'declined':
      return { label: 'Declined', color: COLORS.error, icon: 'close-circle' };
    case 'expired':
      return {
        label: 'Expired',
        color: primitives.stone[400],
        icon: 'clock-alert',
      };
    case 'pending':
    default:
      return { label: 'Pending', color: COLORS.warning, icon: 'clock-outline' };
  }
};

/**
 * Format time remaining until expiration
 */
const formatTimeRemaining = (expiresAt: Date): string => {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;

  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes}m left`;
};

export const TMGiftCard: React.FC<TMGiftCardProps> = ({
  amount,
  currency,
  momentTitle,
  senderName,
  senderAvatar,
  expiresAt,
  status,
  onAccept,
  onDecline,
  style,
  testID,
}) => {
  const scale = useSharedValue(1);
  const statusConfig = getStatusConfig(status);
  const isPending = status === 'pending';

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, SPRING.snappy);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING.default);
  }, []);

  const handleAccept = useCallback(() => {
    HAPTIC.success();
    onAccept?.();
  }, [onAccept]);

  const handleDecline = useCallback(() => {
    HAPTIC.warning();
    onDecline?.();
  }, [onDecline]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[styles.container, cardAnimatedStyle, style]}
      testID={testID}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={isPending ? GRADIENTS.gift : ['#f5f5f5', '#e8e8e8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <MaterialCommunityIcons
              name="gift"
              size={24}
              color={isPending ? COLORS.white : primitives.stone[500]}
            />
            <Text
              style={[
                styles.headerTitle,
                !isPending && styles.headerTitleInactive,
              ]}
            >
              Gift Message
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusConfig.color}20` },
            ]}
          >
            <MaterialCommunityIcons
              name={statusConfig.icon}
              size={14}
              color={statusConfig.color}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Sender Info */}
          <View style={styles.senderRow}>
            <TMAvatar source={senderAvatar} name={senderName} size="sm" />
            <View style={styles.senderInfo}>
              <Text style={styles.senderLabel}>From</Text>
              <Text style={styles.senderName}>{senderName}</Text>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Gift Amount</Text>
            <Text style={styles.amount}>
              {formatCurrency(amount, currency)}
            </Text>
          </View>

          {/* Moment Title */}
          <View style={styles.momentContainer}>
            <Text style={styles.momentLabel}>For</Text>
            <Text style={styles.momentTitle} numberOfLines={2}>
              "{momentTitle}"
            </Text>
          </View>

          {/* Expiration */}
          {expiresAt && isPending && (
            <View style={styles.expirationRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color={primitives.stone[400]}
              />
              <Text style={styles.expirationText}>
                {formatTimeRemaining(expiresAt)}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons (only for pending) */}
        {isPending && (onAccept || onDecline) && (
          <View style={styles.actions}>
            {onDecline && (
              <Pressable
                onPress={handleDecline}
                style={styles.declineButton}
                testID={testID ? `${testID}-decline` : undefined}
              >
                <Text style={styles.declineText}>Decline</Text>
              </Pressable>
            )}
            {onAccept && (
              <Pressable
                onPress={handleAccept}
                style={styles.acceptButton}
                testID={testID ? `${testID}-accept` : undefined}
              >
                <LinearGradient
                  colors={GRADIENTS.gift}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.acceptButtonGradient}
                >
                  <MaterialCommunityIcons
                    name="check"
                    size={18}
                    color={COLORS.white}
                  />
                  <Text style={styles.acceptText}>Accept</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 300,
    ...SHADOWS.card,
  },
  card: {
    backgroundColor: COLORS.surface.base,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.white,
  },
  headerTitleInactive: {
    color: primitives.stone[500],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.chip,
  },
  statusText: {
    ...TYPOGRAPHY.captionMedium,
  },
  content: {
    padding: SPACING.base,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  senderInfo: {
    marginLeft: SPACING.md,
  },
  senderLabel: {
    ...TYPOGRAPHY.captionSmall,
    color: primitives.stone[400],
  },
  senderName: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.text.primary,
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.hairline,
    marginBottom: SPACING.md,
  },
  amountLabel: {
    ...TYPOGRAPHY.captionSmall,
    color: primitives.stone[400],
    marginBottom: 4,
  },
  amount: {
    ...TYPOGRAPHY.price,
    color: COLORS.primary,
    fontSize: 28,
  },
  momentContainer: {
    marginBottom: SPACING.sm,
  },
  momentLabel: {
    ...TYPOGRAPHY.captionSmall,
    color: primitives.stone[400],
    marginBottom: 4,
  },
  momentTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.primary,
    fontStyle: 'italic',
  },
  expirationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
  },
  expirationText: {
    ...TYPOGRAPHY.captionSmall,
    color: primitives.stone[400],
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.base,
    paddingTop: 0,
  },
  declineButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.button,
    backgroundColor: primitives.stone[100],
  },
  declineText: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.primary,
  },
  acceptButton: {
    flex: 1,
    borderRadius: RADIUS.button,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
  },
  acceptText: {
    ...TYPOGRAPHY.label,
    color: COLORS.white,
  },
});

export default TMGiftCard;
