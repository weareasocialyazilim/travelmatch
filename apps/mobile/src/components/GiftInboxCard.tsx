/**
 * GiftInboxCard Component
 * Displays a single gift item in the inbox
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '@/constants/colors';

export interface GiftInboxCardProps {
  id: string;
  senderName: string;
  senderAvatar?: string;
  amount: number;
  currency?: string;
  message?: string;
  momentTitle: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  onAccept?: () => void;
  onReject?: () => void;
  onPress?: () => void;
}

// Status colors defined outside component to avoid recreation
const statusColors = {
  pending: COLORS.feedback.warning,
  accepted: COLORS.feedback.success,
  rejected: COLORS.feedback.error,
  expired: COLORS.text.secondary,
};

export const GiftInboxCard: React.FC<GiftInboxCardProps> = memo(
  ({
    senderName,
    senderAvatar,
    amount,
    currency = 'USD',
    message,
    momentTitle,
    status,
    createdAt,
    onAccept,
    onReject,
    onPress,
  }) => {
    // Memoize formatted amount
    const formattedAmount = useMemo(
      () => `${currency} ${amount.toFixed(2)}`,
      [currency, amount],
    );

    // Memoize status badge style
    const statusBadgeStyle = useMemo(
      () => [styles.statusBadge, { backgroundColor: statusColors[status] }],
      [status],
    );

    // Memoize avatar source
    const avatarSource = useMemo(
      () => ({ uri: senderAvatar || '' }),
      [senderAvatar],
    );

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Image source={avatarSource} style={styles.avatar} />
          <View style={styles.headerInfo}>
            <Text style={styles.senderName}>{senderName}</Text>
            <Text style={styles.date}>{createdAt}</Text>
          </View>
          <View style={statusBadgeStyle}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.momentTitle}>For: {momentTitle}</Text>
          <Text style={styles.amount}>{formattedAmount}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
        </View>

        {status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
              <Text style={styles.rejectText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.id === nextProps.id &&
    prevProps.status === nextProps.status &&
    prevProps.amount === nextProps.amount &&
    prevProps.senderName === nextProps.senderName &&
    prevProps.message === nextProps.message,
);

GiftInboxCard.displayName = 'GiftInboxCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  date: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: COLORS.utility.white,
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  momentTitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.brand.primary,
    marginTop: 4,
  },
  message: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.feedback.error,
    alignItems: 'center',
  },
  rejectText: {
    color: COLORS.feedback.error,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
  },
  acceptText: {
    color: COLORS.utility.white,
    fontWeight: '600',
  },
});

export default GiftInboxCard;
