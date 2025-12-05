import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import type { MomentCategory, MomentLocation } from './types';

interface MomentInfoProps {
  title: string;
  category?: MomentCategory;
  location?: MomentLocation;
  availability?: string;
  date?: string;
  story?: string;
}

export const MomentInfo: React.FC<MomentInfoProps> = React.memo(
  ({
    title,
    category,
    location,
    availability,
    date,
    story,
  }) => {
    return (
      <>
        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Meta Info */}
        <View style={styles.infoRow}>
          {category && (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryName}>{category.label}</Text>
            </View>
          )}
          <Text style={styles.separator}>•</Text>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color={COLORS.textSecondary}
            />
            <Text style={styles.infoText}>
              {location?.city || location?.name || 'Location'}
            </Text>
          </View>
          <Text style={styles.separator}>•</Text>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color={COLORS.textSecondary}
            />
            <Text style={styles.infoText}>
              {availability || date || 'Flexible'}
            </Text>
          </View>
        </View>

        {/* About Section */}
        {story && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>About this moment</Text>
            <Text style={styles.sectionBody}>{story}</Text>
          </View>
        )}

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Location</Text>
          <View style={styles.placeCard}>
            <View style={styles.placeIcon}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color={COLORS.mint}
              />
            </View>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>
                {location?.name || 'Unknown Location'}
              </Text>
              <Text style={styles.placeAddress}>
                {location?.city || 'Unknown City'},{' '}
                {location?.country || 'Unknown Country'}
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  },
);

MomentInfo.displayName = 'MomentInfo';

const styles = StyleSheet.create({
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
    marginBottom: 16,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryPill: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryEmoji: {
    fontSize: 13,
  },
  categoryName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  separator: {
    color: COLORS.textSecondary,
    fontSize: 14,
    opacity: 0.5,
  },
  infoItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionBody: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  placeCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  placeIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.mintTransparent,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  placeAddress: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
});
