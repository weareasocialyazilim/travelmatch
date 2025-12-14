/**
 * GiftInboxCard Component
 * Displays a single gift item in the inbox
 */

import React from 'react';
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

export const GiftInboxCard: React.FC<GiftInboxCardProps> = ({
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
  const statusColors = {
    pending: COLORS.warning,
    accepted: COLORS.success,
    rejected: COLORS.error,
    expired: COLORS.textSecondary,
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Image
          source={{ uri: senderAvatar || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.senderName}>{senderName}</Text>
          <Text style={styles.date}>{createdAt}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[status] }]}>
          <Text style={styles.statusText}>{status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.momentTitle}>For: {momentTitle}</Text>
        <Text style={styles.amount}>
          {currency} {amount.toFixed(2)}
        </Text>
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
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
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
    color: COLORS.textPrimary,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  momentTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  message: {
    fontSize: 14,
    color: COLORS.textPrimary,
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
    borderColor: COLORS.error,
    alignItems: 'center',
  },
  rejectText: {
    color: COLORS.error,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  acceptText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default GiftInboxCard;
