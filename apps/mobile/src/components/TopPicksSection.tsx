/**
 * TopPicksSection Component
 * Displays featured/top picks items
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { COLORS } from '@/constants/colors';
import { GiftInboxCard, type GiftInboxCardProps } from './GiftInboxCard';

export interface TopPicksSectionProps {
  title?: string;
  items: Omit<GiftInboxCardProps, 'onPress'>[];
  onItemPress?: (id: string) => void;
}

export const TopPicksSection: React.FC<TopPicksSectionProps> = ({
  title = 'Top Picks',
  items,
  onItemPress,
}) => {
  const renderItem = useCallback(
    ({ item }: { item: Omit<GiftInboxCardProps, 'onPress'> }) => (
      <View style={styles.cardWrapper}>
        <GiftInboxCard {...item} onPress={() => onItemPress?.(item.id)} />
      </View>
    ),
    [onItemPress],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.listContainer}>
        <FlashList
          data={items}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContainer: {
    height: 200,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  cardWrapper: {
    width: 280,
    marginRight: 12,
  },
});

export default TopPicksSection;
