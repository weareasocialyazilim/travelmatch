import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface UserShape {
  id?: string;
  name?: string;
  avatar?: string;
  location?: { city?: string; country?: string } | string;
  kyc?: boolean;
  trust_score?: number;
}

interface ProfileHeaderSectionProps {
  // Backwards-compatible API: either pass individual fields or a `user` object
  user?: UserShape;
  avatarUrl?: string;
  userName?: string;
  location?: string | { city?: string; country?: string };
  isVerified?: boolean;
  trustScore?: number;
  // onEditPress is used by tests; map to onAvatarPress/onTrustGardenPress when present
  onEditPress?: () => void;
  onAvatarPress?: () => void;
  onTrustGardenPress?: () => void;
}

const ProfileHeaderSection: React.FC<ProfileHeaderSectionProps> = memo(
  ({
    user,
    avatarUrl,
    userName,
    location,
    isVerified,
    trustScore,
    onEditPress,
    onAvatarPress,
    onTrustGardenPress,
  }) => {
    // Normalize values to support both `user` shape and individual props
    const resolvedAvatar = avatarUrl || user?.avatar || '';
    const resolvedName = userName || user?.name || '';
    const resolvedLocation =
      typeof location === 'string'
        ? location
        : (location && (location as any).city) || (user && typeof user.location === 'string' ? user.location : (user && (user.location as any)?.city)) || '';
    const resolvedVerified = typeof isVerified === 'boolean' ? isVerified : !!user?.kyc;
    const resolvedTrust = typeof trustScore === 'number' ? trustScore : (user?.trust_score ?? undefined);
    const handleEditPress = onEditPress || onAvatarPress || onTrustGardenPress || (() => {});
    return (
      <View style={styles.profileSection}>
        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={onAvatarPress}
          activeOpacity={0.9}
        >
          <Image testID="profile-avatar" source={{ uri: resolvedAvatar }} style={styles.avatar} />
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={22}
                color={COLORS.mint}
              />
            </View>
          )}
        </TouchableOpacity>

        {/* Name & Location */}
        <Text style={styles.userName}>{resolvedName}</Text>
        <View style={styles.locationRow}>
          <MaterialCommunityIcons
            name="map-marker"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.locationText}>{resolvedLocation}</Text>
        </View>

        {/* ProofScore Badge */}
        <TouchableOpacity
          style={styles.proofScoreBadge}
          onPress={onTrustGardenPress}
          accessibilityLabel={`ProofScore ${trustScore} percent. Tap to view Trust Garden`}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="shield-check"
            size={16}
            color={COLORS.mint}
          />
          <Text style={styles.proofScoreText}>ProofScore {resolvedTrust ?? ''}%</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color={COLORS.mint}
          />
        </TouchableOpacity>
        {/* Edit button used in tests */}
        {onEditPress && (
          <TouchableOpacity testID="edit-button" onPress={handleEditPress} accessibilityRole="button">
            <Text>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    // If user object is used, compare key fields inside it
    if (prevProps.user || nextProps.user) {
      const pUser = prevProps.user || {};
      const nUser = nextProps.user || {};
      return (
        pUser.avatar === nUser.avatar &&
        pUser.name === nUser.name &&
        JSON.stringify(pUser.location) === JSON.stringify(nUser.location) &&
        (pUser.kyc ?? false) === (nUser.kyc ?? false) &&
        (pUser.trust_score ?? undefined) === (nUser.trust_score ?? undefined)
      );
    }

    return (
      prevProps.avatarUrl === nextProps.avatarUrl &&
      prevProps.userName === nextProps.userName &&
      prevProps.location === nextProps.location &&
      prevProps.isVerified === nextProps.isVerified &&
      prevProps.trustScore === nextProps.trustScore
    );
  },
);

ProfileHeaderSection.displayName = 'ProfileHeaderSection';

const AVATAR_SIZE = 90;

const styles = StyleSheet.create({
  profileSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  proofScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.mintTransparent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  proofScoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mint,
  },
});

export default ProfileHeaderSection;
// Named export for tests that import { ProfileHeaderSection }
export { ProfileHeaderSection };
