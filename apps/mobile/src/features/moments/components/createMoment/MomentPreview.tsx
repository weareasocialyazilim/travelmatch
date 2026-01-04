/**
 * MomentPreview Component
 * Live preview card for CreateMoment screen
 */

import React, { memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, CARD_SHADOW } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { VALUES } from '@/constants/values';
import type { Place } from './DetailsSection';

interface MomentPreviewProps {
  photo: string;
  title: string;
  story: string;
  place: Place | null;
  selectedDate: Date;
  amount: string;
}

const MomentPreview: React.FC<MomentPreviewProps> = memo(
  ({ photo, title, story, place, selectedDate, amount }) => {
    const showPreview = photo || title || amount;

    if (!showPreview) return null;

    return (
      <View style={styles.previewSection}>
        <Text style={styles.previewLabel}>PREVIEW</Text>
        <View style={styles.previewCard}>
          {/* Preview Image */}
          {photo && (
            <View style={styles.previewImageContainer}>
              <Image source={{ uri: photo }} style={styles.previewImage} />
              {/* User Badge */}
              <View style={styles.userBadge}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>Y</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>Your Name</Text>
                  <Text style={styles.userRole}>Traveler</Text>
                </View>
              </View>
            </View>
          )}

          {/* Preview Content */}
          <View style={styles.previewContent}>
            <Text style={styles.previewTitle} numberOfLines={2}>
              {title || 'Your moment title'}
            </Text>
            {story ? (
              <Text style={styles.previewStory} numberOfLines={3}>
                {story}
              </Text>
            ) : null}

            <View style={styles.previewDetails}>
              {place && (
                <View style={styles.previewDetailItem}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={16}
                    color={COLORS.text.secondary}
                  />
                  <Text style={styles.previewDetailText}>{place.name}</Text>
                </View>
              )}
              <View style={styles.previewDetailItem}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={16}
                  color={COLORS.text.secondary}
                />
                <Text style={styles.previewDetailText}>
                  {selectedDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              {amount && (
                <View style={styles.previewDetailItem}>
                  <MaterialCommunityIcons
                    name="currency-usd"
                    size={16}
                    color={COLORS.text.secondary}
                  />
                  <Text style={[styles.previewDetailText, styles.previewPrice]}>
                    {amount}
                  </Text>
                </View>
              )}
            </View>

            {parseFloat(amount) >= VALUES.ESCROW_OPTIONAL_MAX && (
              <View style={styles.previewProofBadge}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={14}
                  color={COLORS.feedback.success}
                />
                <Text style={styles.previewProofText}>ProofLoop Protected</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  },
);

MomentPreview.displayName = 'MomentPreview';

const styles = StyleSheet.create({
  previewSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  previewLabel: {
    color: COLORS.text.secondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: LAYOUT.borderRadius.lg,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  previewImageContainer: {
    aspectRatio: 16 / 9,
    position: 'relative',
    width: '100%',
  },
  previewImage: {
    height: '100%',
    width: '100%',
  },
  userBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: LAYOUT.borderRadius.full,
    flexDirection: 'row',
    gap: 8,
    left: 12,
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 6,
    position: 'absolute',
    top: 12,
    ...CARD_SHADOW,
  },
  userAvatar: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  userAvatarText: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    gap: 2,
  },
  userName: {
    color: COLORS.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  userRole: {
    color: COLORS.text.secondary,
    fontSize: 11,
  },
  previewContent: {
    padding: 16,
  },
  previewTitle: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    marginBottom: 8,
  },
  previewStory: {
    color: COLORS.text.primary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  previewDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  previewDetailItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  previewDetailText: {
    color: COLORS.text.secondary,
    fontSize: 13,
  },
  previewPrice: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  previewProofBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.successLight,
    borderRadius: LAYOUT.borderRadius.sm,
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewProofText: {
    color: COLORS.feedback.success,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MomentPreview;
