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

interface MomentGridCardProps {
  moment: Moment;
  index: number;
  onPress: (moment: Moment) => void;
}

const MomentGridCard: React.FC<MomentGridCardProps> = memo(
  ({ moment, index, onPress }) => {
    return (
      <View style={index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight}>
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => onPress(moment)}
          activeOpacity={0.95}
        >
          <Image source={{ uri: moment.imageUrl }} style={styles.gridImage} />
          <View style={styles.gridContent}>
            <View style={styles.gridCreatorRow}>
              <Image
                source={{
                  uri: moment.user?.avatar || 'https://via.placeholder.com/24',
                }}
                style={styles.gridAvatar}
              />
              <Text style={styles.gridCreatorName} numberOfLines={1}>
                {moment.user?.name?.split(' ')[0] || 'Anon'}
              </Text>
              {moment.user?.isVerified && (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={10}
                  color={COLORS.mint}
                />
              )}
            </View>
            <Text style={styles.gridTitle} numberOfLines={2}>
              {moment.title}
            </Text>
            {moment.story && (
              <Text style={styles.gridStory} numberOfLines={1}>
                {moment.story}
              </Text>
            )}
            <View style={styles.gridFooter}>
              <View style={styles.gridLocationRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={10}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.gridDistance}>
                  {moment.distance || '?'} km
                </Text>
              </View>
              <Text style={styles.gridPrice}>${moment.price}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.moment.id === nextProps.moment.id &&
    prevProps.moment.price === nextProps.moment.price &&
    prevProps.moment.distance === nextProps.moment.distance &&
    prevProps.index === nextProps.index,
);

MomentGridCard.displayName = 'MomentGridCard';

const styles = StyleSheet.create({
  gridItemLeft: {
    width: '50%',
    paddingRight: 6,
    marginBottom: 12,
  },
  gridItemRight: {
    width: '50%',
    paddingLeft: 6,
    marginBottom: 12,
  },
  gridCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridContent: {
    padding: 10,
  },
  gridCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  gridAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  gridCreatorName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 17,
    marginBottom: 4,
  },
  gridStory: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridDistance: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  gridPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.mint,
  },
});

export default MomentGridCard;
