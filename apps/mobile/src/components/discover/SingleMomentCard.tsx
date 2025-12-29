// Single Moment Card - Full width card for single column view
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { OptimizedImage } from '../ui/OptimizedImage';
import type { MomentCardProps } from './types';

export const SingleMomentCard: React.FC<MomentCardProps> = memo(
  ({ item, onPress }) => {
    const creatorName = item.user?.name || 'Anonim';
    const locationName = item.location?.city || 'Bilinmiyor';

    return (
      <TouchableOpacity
        style={styles.singleCard}
        onPress={() => onPress(item)}
        activeOpacity={0.95}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${creatorName} tarafından, ${locationName} konumunda, ${item.price} dolar`}
        accessibilityHint="Detayları görmek için dokunun"
      >
        {/* Image - Using OptimizedImage for better performance */}
        <OptimizedImage
          source={{ uri: item.imageUrl }}
          style={styles.singleImage}
          contentFit="cover"
          transition={200}
          priority="high"
          accessibilityLabel={`${item.title} fotoğrafı`}
        />

        {/* Content */}
        <View style={styles.singleContent}>
          {/* Creator Row */}
          <View style={styles.creatorRow}>
            <OptimizedImage
              source={{
                uri: item.user?.avatar || 'https://via.placeholder.com/40',
              }}
              style={styles.creatorAvatar}
              contentFit="cover"
              transition={150}
              accessibilityLabel={`${creatorName} profil fotoğrafı`}
            />
            <View style={styles.creatorInfo}>
              <View style={styles.creatorNameRow}>
                <Text style={styles.creatorName}>{creatorName}</Text>
                {item.user?.isVerified && (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={14}
                    color={COLORS.mint}
                    accessibilityLabel="Doğrulanmış kullanıcı"
                  />
                )}
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.singleTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Story Description */}
          {item.story && (
            <Text style={styles.storyDescription} numberOfLines={2}>
              {item.story}
            </Text>
          )}

          {/* Location & Distance */}
          <View style={styles.locationDistanceRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={14}
              color={COLORS.text.secondary}
            />
            <Text style={styles.locationText}>{locationName}</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.distanceText}>{item.distance || '?'} km uzakta</Text>
          </View>

          {/* Price */}
          <Text style={styles.priceValue}>${item.price}</Text>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => prevProps.item.id === nextProps.item.id,
);

SingleMomentCard.displayName = 'SingleMomentCard';

const styles = StyleSheet.create({
  singleCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  singleImage: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.bg.primary,
  },
  singleContent: {
    padding: 16,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    backgroundColor: COLORS.bg.primary,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  singleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  storyDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 10,
    lineHeight: 20,
  },
  locationDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  dotSeparator: {
    color: COLORS.text.secondary,
    marginHorizontal: 6,
  },
  distanceText: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.mint,
  },
});
