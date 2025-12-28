// Grid Moment Card - Compact card for 2-column grid view
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import type { GridCardProps } from './types';

export const GridMomentCard: React.FC<GridCardProps> = ({
  item,
  index,
  onPress,
}) => (
  <View style={index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight}>
    <TouchableOpacity
      style={styles.gridCard}
      onPress={() => onPress(item)}
      activeOpacity={0.95}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />

      {/* Content */}
      <View style={styles.gridContent}>
        {/* Creator */}
        <View style={styles.gridCreatorRow}>
          <Image
            source={{
              uri: item.user?.avatar || 'https://via.placeholder.com/24',
            }}
            style={styles.gridAvatar}
          />
          <Text style={styles.gridCreatorName} numberOfLines={1}>
            {item.user?.name?.split(' ')[0] || 'Anon'}
          </Text>
          {item.user?.isVerified && (
            <MaterialCommunityIcons
              name="check-decagram"
              size={10}
              color={COLORS.mint}
            />
          )}
        </View>

        {/* Title */}
        <Text style={styles.gridTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Story */}
        {item.story && (
          <Text style={styles.gridStory} numberOfLines={1}>
            {item.story}
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
            <Text style={styles.gridDistance}>{item.distance || '?'} km</Text>
          </View>
          <Text style={styles.gridPrice}>${item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  </View>
);

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
