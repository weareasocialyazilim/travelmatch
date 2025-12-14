/**
 * NotificationCard Component
 * Displays a notification item
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export type NotificationType =
  | 'gift_received'
  | 'request_accepted'
  | 'request_rejected'
  | 'new_message'
  | 'new_review'
  | 'system';

export interface NotificationCardProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  onPress?: () => void;
  onMarkAsRead?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  type,
  title,
  message,
  timestamp,
  read,
  avatar,
  onPress,
  onMarkAsRead,
}) => {
  const typeConfig: Record<NotificationType, { icon: 'gift' | 'check' | 'close' | 'message' | 'star' | 'bell'; color: string }> = {
    gift_received: { icon: 'gift', color: COLORS.primary },
    request_accepted: { icon: 'check', color: COLORS.success },
    request_rejected: { icon: 'close', color: COLORS.error },
    new_message: { icon: 'message', color: COLORS.info },
    new_review: { icon: 'star', color: COLORS.warning },
    system: { icon: 'bell', color: COLORS.textSecondary },
  };

  const config = typeConfig[type];

  return (
    <TouchableOpacity
      style={[styles.card, !read && styles.unread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.iconBg, { backgroundColor: config.color + '15' }]}>
            <MaterialCommunityIcons name={config.icon} size={20} color={config.color} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>

      {!read && (
        <TouchableOpacity style={styles.markReadButton} onPress={onMarkAsRead}>
          <View style={styles.unreadDot} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  unread: {
    backgroundColor: COLORS.primary + '08',
  },
  iconContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  markReadButton: {
    padding: 4,
    justifyContent: 'center',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
});

export default NotificationCard;
