// Neon Story Item Component - "The Energy Component"
// GenZ-approved story cards with glowing Neon Ring effect
import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import {
  getAvatarImageProps,
  IMAGE_VARIANTS_BY_CONTEXT,
} from '@/utils/cloudflareImageHelpers';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZES_V2 } from '@/constants/typography';
import type { StoryItemProps, UserStory } from './types';

/**
 * Neon Glow etkili Story bileşeni.
 * Awwwards kalitesinde gradient ve border kullanımı.
 *
 * - isNew = true → Neon gradient ring (primary → secondary)
 * - isNew = false → Subtle border (görülmüş story)
 */
export const StoryItem: React.FC<StoryItemProps> = memo(
  ({ item, onPress }) => {
    // Memoize user object to prevent recreating on every render
    const user = useMemo(() => {
      const it = item as unknown as {
        avatarCloudflareId?: string;
        avatarBlurHash?: string;
      };
      return {
        avatar: item.avatar,
        avatarCloudflareId: it.avatarCloudflareId,
        avatarBlurHash: it.avatarBlurHash,
      };
    }, [item]);

    // Memoize press handler to prevent recreating on every render
    const handlePress = useCallback(() => {
      onPress(item);
    }, [item, onPress]);

    // Gradient colors based on story state
    const gradientColors = useMemo(
      () =>
        item.isNew
          ? ([COLORS.primary, COLORS.secondary] as const)
          : ([COLORS.border.default, COLORS.border.default] as const),
      [item.isNew],
    );

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.ringContainer}>
          {/* Neon Glow Ring */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientRing, item.isNew && styles.gradientRingGlow]}
          >
            <View style={styles.innerGap}>
              <OptimizedImage
                {...getAvatarImageProps(
                  user,
                  IMAGE_VARIANTS_BY_CONTEXT.STORY_AVATAR,
                )}
                contentFit="cover"
                style={styles.avatar}
                transition={150}
                priority="normal"
                accessibilityLabel={`${item.name}'s story`}
              />
            </View>
          </LinearGradient>

          {/* Live Badge (optional - for future use) */}
          {item.hasStory && item.isNew && (
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>NEW</Text>
            </View>
          )}
        </View>

        <Text style={styles.username} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.isNew === nextProps.item.isNew &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.avatar === nextProps.item.avatar &&
    prevProps.item.hasStory === nextProps.item.hasStory,
);

StoryItem.displayName = 'StoryItem';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  ringContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  gradientRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 2, // Ring thickness
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientRingGlow: {
    // Neon Glow Effect
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  innerGap: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
    borderWidth: 2,
    borderColor: COLORS.bg.primary,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surface.base,
  },
  liveBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.bg.primary,
  },
  liveText: {
    fontSize: 8,
    fontFamily: FONTS.mono.medium,
    fontWeight: '900',
    color: COLORS.text.inverse,
  },
  username: {
    fontSize: FONT_SIZES_V2.caption,
    fontFamily: FONTS.body.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});
