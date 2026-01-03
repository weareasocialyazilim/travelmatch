/**
 * TransactionListItem Component
 *
 * Awwwards-standard transaction list item with glass effects and status indicators.
 * Used in the wallet screen to display transaction history.
 *
 * Features:
 * - Glass morphism background
 * - Color-coded amount (green for income, default for expense)
 * - Status indicators with neon glow
 * - Smooth press animations
 */
import React, { useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZES_V2 } from '@/constants/typography';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type TransactionType = 'sale' | 'gift_sent' | 'gift_received' | 'withdrawal' | 'deposit';

export interface Transaction {
  id: string;
  title: string;
  desc: string;
  amount: string;
  status: TransactionStatus;
  time: string;
  type?: TransactionType;
}

interface TransactionListItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

/**
 * Get icon name based on transaction type
 */
const getTransactionIcon = (
  title: string,
  amount: string,
): keyof typeof Ionicons.glyphMap => {
  if (title.toLowerCase().includes('satış') || title.toLowerCase().includes('sale')) {
    return 'arrow-down-circle';
  }
  if (title.toLowerCase().includes('hediye') || title.toLowerCase().includes('gift')) {
    return 'gift';
  }
  if (title.toLowerCase().includes('çekme') || title.toLowerCase().includes('withdraw')) {
    return 'arrow-up-circle';
  }
  if (title.toLowerCase().includes('yükle') || title.toLowerCase().includes('deposit')) {
    return 'wallet';
  }
  // Fallback: positive amount = incoming, negative = outgoing
  if (amount.startsWith('+')) {
    return 'arrow-down-circle';
  }
  return 'arrow-up-circle';
};

/**
 * Get status color
 */
const getStatusColor = (status: TransactionStatus): string => {
  switch (status) {
    case 'completed':
      return COLORS.trust.primary;
    case 'pending':
      return COLORS.warning;
    case 'failed':
      return COLORS.error;
    default:
      return COLORS.text.muted;
  }
};

/**
 * Get status label in Turkish
 */
const getStatusLabel = (status: TransactionStatus): string => {
  switch (status) {
    case 'completed':
      return 'Tamamlandı';
    case 'pending':
      return 'Beklemede';
    case 'failed':
      return 'Başarısız';
    default:
      return status;
  }
};

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
  transaction,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const isPositive = transaction.amount.startsWith('+');
  const icon = getTransactionIcon(transaction.title, transaction.amount);
  const statusColor = getStatusColor(transaction.status);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(transaction);
  }, [onPress, transaction]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[styles.container, animatedStyle]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          isPositive ? styles.iconContainerPositive : styles.iconContainerNegative,
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={isPositive ? COLORS.primary : COLORS.text.secondary}
        />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.title}
        </Text>
        <Text style={styles.desc} numberOfLines={1}>
          {transaction.desc}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.time}>{transaction.time}</Text>
          <View style={styles.statusBadge}>
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(transaction.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            isPositive ? styles.amountPositive : styles.amountNegative,
          ]}
        >
          {transaction.amount}
        </Text>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  // Icon
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainerPositive: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  iconContainerNegative: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  // Info
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES_V2.body,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text.onDark,
    fontWeight: '600',
    marginBottom: 2,
  },
  desc: {
    fontSize: FONT_SIZES_V2.caption,
    fontFamily: FONTS.body.regular,
    color: COLORS.textOnDarkSecondary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  time: {
    fontSize: FONT_SIZES_V2.tiny,
    fontFamily: FONTS.mono.regular,
    color: COLORS.textOnDarkMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: FONT_SIZES_V2.tiny,
    fontFamily: FONTS.body.regular,
    fontWeight: '500',
  },
  // Amount
  amountContainer: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: FONT_SIZES_V2.body,
    fontFamily: FONTS.mono.medium,
    fontWeight: '700',
  },
  amountPositive: {
    color: COLORS.primary,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  amountNegative: {
    color: COLORS.text.onDark,
  },
});

export default TransactionListItem;
