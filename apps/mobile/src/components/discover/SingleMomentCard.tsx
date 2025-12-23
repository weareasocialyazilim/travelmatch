// Single Moment Card - Full width card for single column view
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import type { MomentCardProps } from './types';

export const SingleMomentCard: React.FC<MomentCardProps> = ({
  item,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.singleCard}
    onPress={() => onPress(item)}
    activeOpacity={0.95}
  >
    {/* Image */}
    <Image source={{ uri: item.imageUrl }} style={styles.singleImage} />

    {/* Content */}
    <View style={styles.singleContent}>
      {/* Creator Row */}
      <View style={styles.creatorRow}>
        <Image
          source={{
            uri: item.user?.avatar || 'https://via.placeholder.com/40',
          }}
          style={styles.creatorAvatar}
        />
        <View style={styles.creatorInfo}>
          <View style={styles.creatorNameRow}>
            <Text style={styles.creatorName}>
              {item.user?.name || 'Anonymous'}
            </Text>
            {item.user?.isVerified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={14}
                color={COLORS.mint}
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
          color={COLORS.textSecondary}
        />
        <Text style={styles.locationText}>
          {item.location?.city || 'Unknown'}
        </Text>
        <Text style={styles.dotSeparator}>•</Text>
        <Text style={styles.distanceText}>{item.distance || '?'} km away</Text>
      </View>

      {/* Price */}
      <Text style={styles.priceValue}>${item.price}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  singleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  singleImage: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.background,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: COLORS.background,
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
    color: COLORS.text,
  },
  singleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  storyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  dotSeparator: {
    color: COLORS.textSecondary,
    marginHorizontal: 6,
  },
  distanceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.mint,
  },
});
