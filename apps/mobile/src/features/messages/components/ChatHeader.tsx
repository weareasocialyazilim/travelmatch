import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export interface LinkedMoment {
  id: string;
  title: string;
  image?: string;
  price?: number;
  currency?: string;
  status?: 'negotiating' | 'accepted' | 'paid' | 'completed';
  isGiftedByMe?: boolean;
}

interface ChatHeaderProps {
  otherUser: {
    id: string;
    name: string;
    avatar?: string | null;
    type?: string;
    isVerified?: boolean | null;
  };
  linkedMoment?: LinkedMoment;
  onBack: () => void;
  onUserPress: () => void;
  onMomentPress: () => void;
  onMorePress: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  otherUser,
  linkedMoment,
  onBack,
  onUserPress,
  onMomentPress,
  onMorePress,
}) => {
  const getMomentSubtitle = () => {
    if (!linkedMoment) return '';
    if (linkedMoment.status === 'paid' || linkedMoment.status === 'completed') {
      return linkedMoment.isGiftedByMe ? 'Gifted by you' : 'Gift received';
    }
    if (linkedMoment.status === 'accepted') {
      return 'Offer accepted';
    }
    const currencySymbol = linkedMoment.currency === 'TRY' ? '₺' : linkedMoment.currency === 'EUR' ? '€' : '$';
    return linkedMoment.price ? `${currencySymbol}${linkedMoment.price}` : 'Negotiating';
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerUserInfo}
          onPress={onUserPress}
          activeOpacity={0.7}
          accessibilityLabel={`View ${otherUser.name}'s profile`}
          accessibilityRole="button"
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  otherUser.avatar ||
                  'https://images.unsplash.com/photo-1544025162-d76694265947?w=100',
              }}
              style={styles.headerAvatar}
            />
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons
                name="check"
                size={10}
                color={COLORS.utility.white}
              />
            </View>
          </View>
          <View style={styles.headerTextInfo}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName}>{otherUser.name}</Text>
              <MaterialCommunityIcons
                name="check-decagram"
                size={18}
                color={COLORS.brand.primary}
              />
            </View>
            <Text style={styles.headerRole}>Traveler</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={onMorePress}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="More chat options"
          accessibilityRole="button"
          accessibilityHint="Opens menu for blocking, reporting, or archiving"
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Linked Moment Card */}
      {linkedMoment && (
        <TouchableOpacity
          style={styles.linkedMomentCard}
          onPress={onMomentPress}
          activeOpacity={0.7}
          accessibilityLabel={`View linked moment: ${linkedMoment.title}`}
          accessibilityRole="button"
          accessibilityHint="Opens the moment details"
        >
          <Image
            source={{
              uri: linkedMoment.image || 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=200',
            }}
            style={styles.momentThumbnail}
          />
          <View style={styles.momentInfo}>
            <Text style={styles.momentTitle} numberOfLines={1}>
              {linkedMoment.title}
            </Text>
            <Text style={styles.momentSubtitle}>{getMomentSubtitle()}</Text>
          </View>
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.bg.primary,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.feedback.success,
    borderWidth: 2,
    borderColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginRight: 4,
  },
  headerRole: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkedMomentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    padding: 12,
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  momentThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  momentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  momentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  momentSubtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.mintTransparent,
    borderRadius: 9999,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.brand.primary,
  },
});
