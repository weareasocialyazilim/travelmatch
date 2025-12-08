import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface ProfileHeaderSectionProps {
  avatarUrl: string;
  userName: string;
  location: string;
  isVerified: boolean;
  trustScore: number;
  onAvatarPress: () => void;
  onTrustGardenPress: () => void;
}

const ProfileHeaderSection: React.FC<ProfileHeaderSectionProps> = memo(
  ({
    avatarUrl,
    userName,
    location,
    isVerified,
    trustScore,
    onAvatarPress,
    onTrustGardenPress,
  }) => {
    return (
      <View style={styles.profileSection}>
        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={onAvatarPress}
          activeOpacity={0.9}
        >
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
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
        <Text style={styles.userName}>{userName}</Text>
        <View style={styles.locationRow}>
          <MaterialCommunityIcons
            name="map-marker"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.locationText}>{location}</Text>
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
          <Text style={styles.proofScoreText}>ProofScore {trustScore}%</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color={COLORS.mint}
          />
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.avatarUrl === nextProps.avatarUrl &&
    prevProps.userName === nextProps.userName &&
    prevProps.location === nextProps.location &&
    prevProps.isVerified === nextProps.isVerified &&
    prevProps.trustScore === nextProps.trustScore,
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
