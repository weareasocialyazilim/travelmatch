import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import type { Moment } from '../../../types';

interface MomentSingleCardProps {
  moment: Moment;
  onPress: (moment: Moment) => void;
}

const MomentSingleCard: React.FC<MomentSingleCardProps> = memo(
  ({ moment, onPress }) => {
    return (
      <TouchableOpacity
        style={styles.singleCard}
        onPress={() => onPress(moment)}
        activeOpacity={0.95}
      >
        <Image source={{ uri: moment.imageUrl }} style={styles.singleImage} />
        <View style={styles.singleContent}>
          <View style={styles.creatorRow}>
            <Image
              source={{
                uri: moment.user?.avatar || 'https://via.placeholder.com/40',
              }}
              style={styles.creatorAvatar}
            />
            <View style={styles.creatorInfo}>
              <View style={styles.creatorNameRow}>
                <Text style={styles.creatorName}>
                  {moment.user?.name || 'Anonymous'}
                </Text>
                {moment.user?.isVerified && (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={14}
                    color={COLORS.mint}
                  />
                )}
              </View>
            </View>
          </View>
          <Text style={styles.singleTitle} numberOfLines={2}>
            {moment.title}
          </Text>
          {moment.story && (
            <Text style={styles.storyDescription} numberOfLines={2}>
              {moment.story}
            </Text>
          )}
          <View style={styles.locationDistanceRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={14}
              color={COLORS.textSecondary}
            />
            <Text style={styles.locationText}>
              {moment.location?.city || 'Unknown'}
            </Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.distanceText}>
              {moment.distance || '?'} km away
            </Text>
          </View>
          <Text style={styles.priceValue}>${moment.price}</Text>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.moment.id === nextProps.moment.id &&
    prevProps.moment.price === nextProps.moment.price &&
    prevProps.moment.distance === nextProps.moment.distance,
);

MomentSingleCard.displayName = 'MomentSingleCard';

const styles = StyleSheet.create({
  singleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  singleImage: {
    width: '100%',
    height: 200,
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
  },
  creatorInfo: {
    flex: 1,
    marginLeft: 10,
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
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  storyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  locationDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: COLORS.textSecondary,
  },
  distanceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.mint,
  },
});

export default MomentSingleCard;
