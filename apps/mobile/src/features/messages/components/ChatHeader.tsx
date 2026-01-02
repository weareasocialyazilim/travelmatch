/**
 * ChatHeader - Immersive Liquid Glass Header
 *
 * Premium chat header with:
 * - BlurView glass effect for immersive feel
 * - Neon status indicator
 * - Linked moment card with glass styling
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZES_V2 } from '@/constants/typography';

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
  isOnline?: boolean;
  onBack: () => void;
  onUserPress: () => void;
  onMomentPress: () => void;
  onMorePress: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  otherUser,
  linkedMoment,
  isOnline = true,
  onBack,
  onUserPress,
  onMomentPress,
  onMorePress,
}) => {
  const insets = useSafeAreaInsets();

  const getMomentSubtitle = () => {
    if (!linkedMoment) return '';
    if (linkedMoment.status === 'paid' || linkedMoment.status === 'completed') {
      return linkedMoment.isGiftedByMe ? 'Gifted by you' : 'Gift received';
    }
    if (linkedMoment.status === 'accepted') {
      return 'Offer accepted';
    }
    const currencySymbol =
      linkedMoment.currency === 'TRY'
        ? '₺'
        : linkedMoment.currency === 'EUR'
          ? '€'
          : '$';
    return linkedMoment.price ? `${currencySymbol}${linkedMoment.price}` : 'Negotiating';
  };

  const HeaderContent = () => (
    <>
      <View style={[styles.headerTop, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.text.primary} />
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
            {otherUser.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={10} color={COLORS.white} />
              </View>
            )}
          </View>

          <View style={styles.headerTextInfo}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName}>{otherUser.name}</Text>
              {otherUser.isVerified && (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={16}
                  color={COLORS.primary}
                />
              )}
            </View>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? COLORS.success : COLORS.text.muted },
                ]}
              />
              <Text style={styles.statusText}>
                {isOnline ? 'Şu an aktif' : 'Çevrimdışı'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={onMorePress}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="More chat options"
          accessibilityRole="button"
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Linked Moment Card - Glass Style */}
      {linkedMoment && (
        <TouchableOpacity
          style={styles.linkedMomentCard}
          onPress={onMomentPress}
          activeOpacity={0.7}
          accessibilityLabel={`View linked moment: ${linkedMoment.title}`}
          accessibilityRole="button"
        >
          <Image
            source={{
              uri:
                linkedMoment.image ||
                'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=200',
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
    </>
  );

  // Use BlurView on iOS, fallback on Android
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={40} tint="light" style={styles.header}>
        <HeaderContent />
      </BlurView>
    );
  }

  return (
    <View style={[styles.header, styles.headerAndroid]}>
      <HeaderContent />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerAndroid: {
    backgroundColor: COLORS.bg.primary,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    marginLeft: 4,
  },
  avatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
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
    gap: 4,
  },
  headerName: {
    fontSize: FONT_SIZES_V2.bodyLarge,
    fontFamily: FONTS.display.bold,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    // Neon glow for online status
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZES_V2.tiny,
    color: COLORS.text.secondary,
    fontFamily: FONTS.body.regular,
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Linked Moment Card
  linkedMomentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.surface.base,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  momentThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  momentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  momentTitle: {
    fontSize: FONT_SIZES_V2.bodySmall,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  momentSubtitle: {
    fontSize: FONT_SIZES_V2.caption,
    fontFamily: FONTS.body.regular,
    color: COLORS.text.secondary,
  },
  viewButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 20,
  },
  viewButtonText: {
    fontSize: FONT_SIZES_V2.caption,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
