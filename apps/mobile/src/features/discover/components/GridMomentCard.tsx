// Grid Moment Card - Compact card for 2-column grid view
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import type { GridCardProps } from './types';

export const GridMomentCard: React.FC<GridCardProps> = memo(
  ({ item, index, onPress }) => {
    const creatorName = item.user?.name?.split(' ')[0] || 'Anonim';

    return (
      <View
        style={index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight}
      >
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => onPress(item)}
          activeOpacity={0.95}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}, ${creatorName} tarafından, ${item.price} dolar`}
          accessibilityHint="Detayları görmek için dokunun"
        >
          {/* Image - Using OptimizedImage for better performance */}
          <OptimizedImage
            source={{ uri: item.imageUrl }}
            style={styles.gridImage}
            contentFit="cover"
            transition={200}
            priority="normal"
            accessibilityLabel={`${item.title} fotoğrafı`}
          />

          {/* Content */}
          <View style={styles.gridContent}>
            {/* Creator */}
            <View style={styles.gridCreatorRow}>
              <OptimizedImage
                source={{
                  uri: item.user?.avatar || '',
                }}
                style={styles.gridAvatar}
                contentFit="cover"
                transition={150}
                accessibilityLabel={`${creatorName} profil fotoğrafı`}
              />
              <Text style={styles.gridCreatorName} numberOfLines={1}>
                {creatorName}
              </Text>
              {item.user?.verified && (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={10}
                  color={COLORS.mint}
                  accessibilityLabel="Doğrulanmış kullanıcı"
                />
              )}
            </View>

            {/* Title */}
            <Text style={styles.gridTitle} numberOfLines={2}>
              {item.title}
            </Text>

            {/* Story */}
            {item.story?.excerpt && (
              <Text style={styles.gridStory} numberOfLines={1}>
                {item.story.excerpt}
              </Text>
            )}

            {/* Footer */}
            <View style={styles.gridFooter}>
              <View style={styles.gridLocationRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={10}
                  color={COLORS.text.secondary}
                />
                <Text style={styles.gridDistance}>
                  {item.distance || '?'} km
                </Text>
              </View>
              <Text style={styles.gridPrice}>{item.price} LVND</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.item.id === nextProps.item.id &&
    prevProps.index === nextProps.index,
);

GridMomentCard.displayName = 'GridMomentCard';

const styles = StyleSheet.create({
  gridItemLeft: {
    flex: 1,
    paddingRight: 6,
    paddingLeft: 16,
    marginBottom: 12,
  },
  gridItemRight: {
    flex: 1,
    paddingLeft: 6,
    paddingRight: 16,
    marginBottom: 12,
  },
  gridCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.bg.primary,
  },
  gridContent: {
    padding: 10,
  },
  gridCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  gridAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.bg.primary,
  },
  gridCreatorName: {
    fontSize: 11,
    color: COLORS.text.secondary,
    flex: 1,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
    lineHeight: 17,
  },
  gridStory: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginBottom: 6,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  gridDistance: {
    fontSize: 10,
    color: COLORS.text.secondary,
  },
  gridPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.mint,
  },
});
