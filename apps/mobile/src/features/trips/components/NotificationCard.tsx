import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { NotificationItem } from '../types/requests.types';

interface NotificationCardProps {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
}

export const NotificationCard = ({ item, onPress }: NotificationCardProps) => {
  const getIcon = () => {
    switch (item.type) {
      case 'completed':
        return 'check-circle';
      case 'review':
        return 'star';
      case 'payment':
        return 'cash';
      case 'new_request':
        return 'account-plus';
      default:
        return 'bell';
    }
  };

  const getIconColor = () => {
    switch (item.type) {
      case 'completed':
        return COLORS.success;
      case 'review':
        return COLORS.gold;
      case 'payment':
        return COLORS.primary;
      case 'new_request':
        return COLORS.info;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.notificationUnread]}
      onPress={() => onPress(item)}
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.notificationAvatar} />
      ) : (
        <View style={[styles.notificationIcon, { backgroundColor: `${getIconColor()}20` }]}>
          <MaterialCommunityIcons name={getIcon()} size={20} color={getIconColor()} />
        </View>
      )}

      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.notificationBody} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.notificationTime}>{item.timeAgo}</Text>
      </View>

      {!item.isRead && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationUnread: {
    backgroundColor: `${COLORS.primary}05`,
  },
  notificationAvatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  notificationIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  unreadIndicator: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
});
