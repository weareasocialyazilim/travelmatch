/**
 * StoriesRow Component
 *
 * Keşfet ekranı yatay Story şeridi.
 * "Enerji bandı" gibi görünecek şekilde tasarlandı.
 *
 * Features:
 * - Soft Dark tema ile uyumlu spacing ve hiyerarşi
 * - Canlı deneyimler için özel styling
 * - Premium spacing (20px horizontal padding)
 *
 * Part of Lovendo "Cinematic Trust Jewelry" Design System.
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LovendoAvatar } from '@/components/ui/LovendoAvatar';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY_SYSTEM } from '@/constants/typography';
import type { UserStory, SubscriptionTierType } from './types';

// Subscription tier ring colors
const TIER_RING_COLORS: Record<SubscriptionTierType, string> = {
  free: COLORS.brand.primary,
  premium: '#FFD700', // Gold
  platinum: '#E5E4E2', // Platinum/Silver
};

interface StoriesRowProps {
  stories: UserStory[];
  onStoryPress: (story: UserStory, index: number) => void;
  onCreatePress: () => void;
  /** Section title (default: "Canlı Deneyimler") */
  sectionTitle?: string;
  /** Hide section title */
  hideTitle?: boolean;
}

const StoriesRow: React.FC<StoriesRowProps> = memo(
  ({
    stories,
    onStoryPress,
    onCreatePress,
    sectionTitle = 'Canlı Deneyimler',
    hideTitle = false,
  }) => {
    return (
      <View style={styles.storiesSection}>
        {/* Section Title - Energy Band Label */}
        {!hideTitle && <Text style={styles.sectionTitle}>{sectionTitle}</Text>}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesScroll}
        >
          {/* Create Story Button */}
          <TouchableOpacity
            style={styles.storyItem}
            onPress={onCreatePress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Create new moment"
          >
            <View style={styles.createStoryRing}>
              <View style={styles.createStoryInner}>
                <MaterialCommunityIcons
                  name="plus"
                  size={24}
                  color={COLORS.brand.primary}
                />
              </View>
            </View>
            <Text style={styles.storyName}>Create</Text>
          </TouchableOpacity>

          {/* User Stories */}
          {stories.map((user, index) => {
            // Determine ring color based on subscription tier
            const tierColor = user.subscriptionTier
              ? TIER_RING_COLORS[user.subscriptionTier]
              : COLORS.brand.primary;

            return (
              <TouchableOpacity
                key={user.id}
                style={styles.storyItem}
                onPress={() => onStoryPress(user, index)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`View ${user.name}'s story`}
              >
                <View
                  style={[
                    styles.storyRing,
                    user.isNew && { borderColor: tierColor },
                    !user.isNew && styles.storyRingViewed,
                  ]}
                >
                  <LovendoAvatar
                    source={user.avatar}
                    name={user.name}
                    size="lg"
                    style={styles.storyAvatar}
                  />
                </View>
                <Text style={styles.storyName} numberOfLines={1}>
                  {user.name}
                </Text>
                {user.isNew && (
                  <View
                    style={[
                      styles.newIndicator,
                      { backgroundColor: tierColor },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  },
);

StoriesRow.displayName = 'StoriesRow';

const styles = StyleSheet.create({
  // Container - "Enerji bandı" background
  storiesSection: {
    backgroundColor: COLORS.bg.primary,
    paddingVertical: 8,
  },

  // Section Title - Uppercase label
  sectionTitle: {
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyS,
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    color: COLORS.text.secondary,
    paddingHorizontal: 20,
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Horizontal scroll content
  storiesScroll: {
    gap: 16,
    paddingHorizontal: 20,
  },

  // Individual story item
  storyItem: {
    alignItems: 'center',
    width: 72,
  },

  // Create button - dashed border
  createStoryRing: {
    alignItems: 'center',
    backgroundColor: COLORS.bg.primary,
    borderColor: COLORS.border.default,
    borderRadius: 36,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  createStoryInner: {
    alignItems: 'center',
    backgroundColor: COLORS.surface.base,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },

  // Story ring - gradient border for new stories
  storyRing: {
    alignItems: 'center',
    borderRadius: 36,
    borderWidth: 3,
    height: 72,
    justifyContent: 'center',
    padding: 3,
    width: 72,
  },
  storyRingNew: {
    borderColor: COLORS.brand.primary,
  },
  storyRingLive: {
    borderColor: COLORS.success,
  },
  storyRingViewed: {
    borderColor: COLORS.border.default,
  },

  // Avatar
  storyAvatar: {
    borderRadius: 30,
    height: 60,
    width: 60,
  },

  // Name - using typography system
  storyName: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.caption,
    marginTop: 6,
    textAlign: 'center',
  },

  // Live/New indicator dot
  newIndicator: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.bg.primary,
    borderRadius: 6,
    borderWidth: 2,
    height: 12,
    position: 'absolute',
    right: 12,
    top: 0,
    width: 12,
  },
  liveIndicator: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.bg.primary,
    borderRadius: 6,
    borderWidth: 2,
    height: 12,
    position: 'absolute',
    right: 12,
    top: 0,
    width: 12,
  },
});

export default StoriesRow;
