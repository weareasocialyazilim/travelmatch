import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { GiftInboxItem } from '../hooks/useGiftInbox';

interface GiftInboxCardProps {
  item: GiftInboxItem;
  onPress: () => void;
  getStatusIcon: (item: GiftInboxItem) => {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
    text: string;
  };
}

export const GiftInboxCard: React.FC<GiftInboxCardProps> = ({
  item,
  onPress,
  getStatusIcon,
}) => {
  const status = getStatusIcon(item);

  return (
    <TouchableOpacity style={styles.inboxItem} onPress={onPress}>
      <View style={styles.inboxItemLeft}>
        <Image source={{ uri: item.sender.avatar }} style={styles.inboxAvatar} />
        {item.sender.isVerified && (
          <View style={styles.inboxVerifiedBadge}>
            <MaterialCommunityIcons
              name="check-decagram"
              size={12}
              color={COLORS.primary}
            />
          </View>
        )}
      </View>

      <View style={styles.inboxItemContent}>
        <View style={styles.inboxItemHeader}>
          <Text style={styles.inboxName}>
            {item.sender.name}, {item.sender.age}
          </Text>
          <View style={styles.inboxRating}>
            <MaterialCommunityIcons
              name="star"
              size={12}
              color={COLORS.softOrange}
            />
            <Text style={styles.inboxRatingText}>{item.sender.rating}</Text>
          </View>
        </View>

        <Text style={styles.inboxGiftCount}>
          {item.gifts.length} gift{item.gifts.length > 1 ? 's' : ''} · $
          {item.totalAmount} total
        </Text>

        <Text style={styles.inboxMessage} numberOfLines={1}>
          &quot;{item.latestMessage}&quot;
        </Text>

        <View style={styles.inboxStatus}>
          <MaterialCommunityIcons
            name={status.icon}
            size={14}
            color={status.color}
          />
          <Text style={[styles.inboxStatusText, { color: status.color }]}>
            {status.text}
          </Text>
        </View>
      </View>

      <View style={styles.inboxItemRight}>
        <Text style={styles.inboxTime}>{item.latestGiftAt}</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={COLORS.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  inboxItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inboxItemLeft: {
    marginRight: 12,
  },
  inboxAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  inboxVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 2,
  },
  inboxItemContent: {
    flex: 1,
  },
  inboxItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  inboxName: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
  },
  inboxRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  inboxRatingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  inboxGiftCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  inboxMessage: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  inboxStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inboxStatusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
  },
  inboxItemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  inboxTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});
