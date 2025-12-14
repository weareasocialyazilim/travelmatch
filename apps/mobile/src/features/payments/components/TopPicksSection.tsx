import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { GiftInboxItem } from '@/hooks/useGiftInbox';

interface TopPickCardProps {
  item: GiftInboxItem;
  onPress: () => void;
}

const TopPickCard: React.FC<TopPickCardProps> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.topPickCard} onPress={onPress}>
    <Image source={{ uri: item.sender.avatar }} style={styles.topPickAvatar} />
    {item.sender.isVerified && (
      <View style={styles.verifiedBadge}>
        <MaterialCommunityIcons
          name="check-decagram"
          size={14}
          color={COLORS.primary}
        />
      </View>
    )}
    <Text style={styles.topPickName} numberOfLines={1}>
      {item.sender.name}
    </Text>
    <Text style={styles.topPickAmount}>${item.totalAmount}</Text>
    <View style={styles.topPickRating}>
      <MaterialCommunityIcons
        name="star"
        size={12}
        color={COLORS.softOrange}
      />
      <Text style={styles.topPickRatingText}>{item.sender.rating}</Text>
    </View>
  </TouchableOpacity>
);

interface TopPicksSectionProps {
  topPicks: GiftInboxItem[];
  onItemPress: (item: GiftInboxItem) => void;
}

export const TopPicksSection: React.FC<TopPicksSectionProps> = ({
  topPicks,
  onItemPress,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>⭐ Top Picks</Text>
          <Text style={styles.sectionSubtitle}>
            High rated & meaningful gifts
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topPicksContainer}
      >
        {topPicks.map((item) => (
          <TopPickCard key={item.id} item={item} onPress={() => onItemPress(item)} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  topPicksContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  topPickCard: {
    width: 100,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topPickAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 54,
    right: 22,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 2,
  },
  topPickName: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  topPickAmount: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  topPickRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  topPickRatingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});
