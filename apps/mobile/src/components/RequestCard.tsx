/**
 * RequestCard Component
 * Displays a request item in the requests list
 * Memoized for optimal list performance
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export type RequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export interface RequestCardProps {
  id: string;
  userAvatar?: string;
  userName: string;
  momentTitle: string;
  status: RequestStatus;
  date: string;
  message?: string;
  onAccept?: () => void;
  onReject?: () => void;
  onPress?: () => void;
}

const statusConfig = {
  pending: {
    color: COLORS.feedback.warning,
    label: 'Pending',
    icon: 'clock-outline' as const,
  },
  accepted: {
    color: COLORS.feedback.success,
    label: 'Accepted',
    icon: 'check-circle' as const,
  },
  rejected: {
    color: COLORS.feedback.error,
    label: 'Rejected',
    icon: 'close-circle' as const,
  },
  completed: {
    color: COLORS.feedback.info,
    label: 'Completed',
    icon: 'check-all' as const,
  },
  cancelled: {
    color: COLORS.text.secondary,
    label: 'Cancelled',
    icon: 'cancel' as const,
  },
};

export const RequestCard: React.FC<RequestCardProps> = memo(
  ({
    userAvatar,
    userName,
    momentTitle,
    status,
    date,
    message,
    onAccept,
    onReject,
    onPress,
  }) => {
    const config = statusConfig[status];

    const handleAccept = useCallback(() => {
      onAccept?.();
    }, [onAccept]);

    const handleReject = useCallback(() => {
      onReject?.();
    }, [onReject]);

    const handlePress = useCallback(() => {
      onPress?.();
    }, [onPress]);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Image
            source={{ uri: userAvatar || 'https://via.placeholder.com/48' }}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.momentTitle} numberOfLines={1}>
              {momentTitle}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: config.color + '20' },
            ]}
          >
            <MaterialCommunityIcons
              name={config.icon}
              size={14}
              color={config.color}
            />
            <Text style={[styles.statusText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        {message && (
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.date}>{date}</Text>
          {status === 'pending' && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={handleReject}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={18}
                  color={COLORS.feedback.error}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleAccept}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={18}
                  color={COLORS.utility.white}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.id === nextProps.id &&
    prevProps.status === nextProps.status &&
    prevProps.userName === nextProps.userName &&
    prevProps.momentTitle === nextProps.momentTitle &&
    prevProps.date === nextProps.date &&
    prevProps.message === nextProps.message &&
    prevProps.userAvatar === nextProps.userAvatar,
);

RequestCard.displayName = 'RequestCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  momentTitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginTop: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  date: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.feedback.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.feedback.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RequestCard;
