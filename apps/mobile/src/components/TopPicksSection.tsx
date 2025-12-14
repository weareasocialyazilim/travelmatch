/**
 * TopPicksSection Component
 * Displays featured/top picks items
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
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
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <GiftInboxCard
              {...item}
              onPress={() => onItemPress?.(item.id)}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
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
    color: COLORS.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 16,
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
