/**
 * NotificationCard Component
 * Displays a notification item
 */

import React, { memo, useMemo } from 'react';
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

// Type config defined outside component to avoid recreation
const typeConfig: Record<
  NotificationType,
  {
    icon: 'gift' | 'check' | 'close' | 'message' | 'star' | 'bell';
    color: string;
  }
> = {
  gift_received: { icon: 'gift', color: COLORS.brand.primary },
  request_accepted: { icon: 'check', color: COLORS.feedback.success },
  request_rejected: { icon: 'close', color: COLORS.feedback.error },
  new_message: { icon: 'message', color: COLORS.feedback.info },
  new_review: { icon: 'star', color: COLORS.feedback.warning },
  system: { icon: 'bell', color: COLORS.text.secondary },
};

export const NotificationCard: React.FC<NotificationCardProps> = memo(
  ({
    type,
    title,
    message,
    timestamp,
    read,
    avatar,
    onPress,
    onMarkAsRead,
  }) => {
    // Memoize config lookup
    const config = useMemo(() => typeConfig[type], [type]);

    // Memoize card style
    const cardStyle = useMemo(
      () => [styles.card, !read && styles.unread],
      [read],
    );

    // Memoize icon background style
    const iconBgStyle = useMemo(
      () => [styles.iconBg, { backgroundColor: config.color + '15' }],
      [config.color],
    );

    // Memoize avatar source
    const avatarSource = useMemo(
      () => (avatar ? { uri: avatar } : null),
      [avatar],
    );

    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
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
          <TouchableOpacity
            style={styles.markReadButton}
            onPress={onMarkAsRead}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.unreadDot} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
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

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  unread: {
    backgroundColor: COLORS.brand.primary + '08',
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
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  markReadButton: {
    padding: 4,
    justifyContent: 'center',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.brand.primary,
  },
});

export default NotificationCard;
