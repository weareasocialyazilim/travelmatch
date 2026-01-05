import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import type { Moment } from '@/hooks/useMoments';

interface ProfileMomentCardProps {
  moment: Moment;
  onPress: () => void;
}

const ProfileMomentCard: React.FC<ProfileMomentCardProps> = memo(
  ({ moment, onPress }) => {
    // Support both price and pricePerGuest properties
    const price = moment.pricePerGuest ?? moment.price ?? 0;
    const imageUrl =
      moment.images?.[0] ?? 'https://ui-avatars.com/api/?name=Moment';

    return (
      <TouchableOpacity
        style={styles.momentCard}
        activeOpacity={0.8}
        accessibilityLabel={`${moment.title}, $${price}`}
        accessibilityRole="button"
        accessibilityHint="Opens moment details"
        onPress={onPress}
      >
        <Image source={{ uri: imageUrl }} style={styles.momentImage} />
        <View style={styles.momentInfo}>
          <Text style={styles.momentTitle} numberOfLines={1}>
            {moment.title}
          </Text>
          <Text style={styles.momentPrice}>${price}</Text>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    const prevPrice = prevProps.moment.pricePerGuest ?? prevProps.moment.price;
    const nextPrice = nextProps.moment.pricePerGuest ?? nextProps.moment.price;
    return (
      prevProps.moment.id === nextProps.moment.id && prevPrice === nextPrice
    );
  },
);

ProfileMomentCard.displayName = 'ProfileMomentCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MOMENT_CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const styles = StyleSheet.create({
  momentCard: {
    width: MOMENT_CARD_WIDTH,
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  momentImage: {
    width: '100%',
    height: 120,
  },
  momentInfo: {
    padding: 12,
  },
  momentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  momentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.mint,
  },
});

export default ProfileMomentCard;
