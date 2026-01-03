/**
 * StoryActionBar - Reels-style vertical action bar
 *
 * Implements UX patterns from Instagram Reels:
 * - Vertical layout on right side
 * - Heart with animated floating hearts
 * - Comment, Share, Bookmark buttons
 * - Count displays
 * - Turkish localization
 */

import React, { memo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, primitives } from '@/constants/colors';

interface StoryActionBarProps {
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onMore?: () => void;
}

// Format count for display (1.2k, 2.5M, etc.)
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

export const StoryActionBar = memo<StoryActionBarProps>(function StoryActionBar({
  likeCount,
  commentCount,
  shareCount,
  isLiked = false,
  isSaved = false,
  onLike,
  onComment,
  onShare,
  onSave,
  onMore,
}) {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);

  // Animation values
  const heartScale = useSharedValue(1);
  const saveScale = useSharedValue(1);

  // Animated styles
  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const saveAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  // Handle like with animation
  const handleLike = useCallback(() => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLocalLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    // Animate heart
    heartScale.value = withSequence(
      withSpring(1.3, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    onLike();
  }, [liked, onLike, heartScale]);

  // Handle save with animation
  const handleSave = useCallback(() => {
    const newSaved = !saved;
    setSaved(newSaved);

    saveScale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    onSave();
  }, [saved, onSave, saveScale]);

  return (
    <View style={styles.container}>
      {/* Like Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleLike}
        activeOpacity={0.7}
        accessibilityLabel={liked ? 'Beğeniyi kaldır' : 'Beğen'}
        accessibilityRole="button"
      >
        <Animated.View style={heartAnimatedStyle}>
          <MaterialCommunityIcons
            name={liked ? 'heart' : 'heart-outline'}
            size={28}
            color={liked ? primitives.magenta[500] : COLORS.white}
          />
        </Animated.View>
        <Text style={styles.actionCount}>{formatCount(localLikeCount)}</Text>
      </TouchableOpacity>

      {/* Comment Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onComment}
        activeOpacity={0.7}
        accessibilityLabel={`${commentCount} yorum`}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons
          name="comment-outline"
          size={28}
          color={COLORS.white}
        />
        <Text style={styles.actionCount}>{formatCount(commentCount)}</Text>
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onShare}
        activeOpacity={0.7}
        accessibilityLabel="Paylaş"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons
          name="send"
          size={26}
          color={COLORS.white}
          style={styles.shareIcon}
        />
        {shareCount !== undefined && shareCount > 0 && (
          <Text style={styles.actionCount}>{formatCount(shareCount)}</Text>
        )}
      </TouchableOpacity>

      {/* Save/Bookmark Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleSave}
        activeOpacity={0.7}
        accessibilityLabel={saved ? 'Kaydedildi' : 'Kaydet'}
        accessibilityRole="button"
      >
        <Animated.View style={saveAnimatedStyle}>
          <MaterialCommunityIcons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={28}
            color={saved ? primitives.amber[400] : COLORS.white}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* More Options */}
      {onMore && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onMore}
          activeOpacity={0.7}
          accessibilityLabel="Daha fazla"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="dots-horizontal"
            size={28}
            color={COLORS.white}
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

/**
 * FloatingHearts - Animated hearts that float up when liked
 */
interface FloatingHeartsProps {
  count: number;
  onComplete?: () => void;
}

export const FloatingHearts = memo<FloatingHeartsProps>(function FloatingHearts() {
  // For a full implementation, this would render multiple animated hearts
  // that float up and fade out. Simplified version here.
  return null; // Placeholder for now - would need more complex animation
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shareIcon: {
    transform: [{ rotate: '-30deg' }],
  },
});

export default StoryActionBar;
