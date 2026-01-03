// AchievementCard Component - Neon Badge Design
// Digital collection style achievement card with glow effects
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { SPACING, RADIUS } from '@/constants/spacing';
import { GlassCard } from '@/components/ui/GlassCard';

// Achievement rarity levels
type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number; // 0-100
  isEarned: boolean;
  xp?: number;
  rarity?: AchievementRarity;
  earnedDate?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  index?: number;
  onPress?: () => void;
}

// Rarity color mapping
const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: COLORS.text.secondary,
  rare: COLORS.primary,
  epic: COLORS.secondary,
  legendary: COLORS.accent,
};

const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: 'Yaygın',
  rare: 'Nadir',
  epic: 'Destansı',
  legendary: 'Efsanevi',
};

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  index = 0,
  onPress,
}) => {
  const {
    title,
    description,
    icon,
    progress,
    isEarned,
    xp = 100,
    rarity = 'common',
  } = achievement;

  // Animation values
  const glowPulse = useSharedValue(0);
  const shimmer = useSharedValue(0);

  // Glow animation for earned badges
  useEffect(() => {
    if (isEarned) {
      glowPulse.value = withDelay(
        index * 100,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        )
      );
    }
  }, [isEarned, index, glowPulse]);

  // Shimmer animation for locked badges
  useEffect(() => {
    if (!isEarned && progress > 0) {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [isEarned, progress, shimmer]);

  const rarityColor = RARITY_COLORS[rarity];

  // Animated glow style
  const glowStyle = useAnimatedStyle(() => {
    if (!isEarned) return {};

    const opacity = interpolate(glowPulse.value, [0, 1], [0.3, 0.7]);
    const scale = interpolate(glowPulse.value, [0, 1], [1, 1.1]);

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Animated badge style
  const badgeStyle = useAnimatedStyle(() => {
    if (!isEarned) return { opacity: 0.4 };

    const scale = interpolate(glowPulse.value, [0, 1], [1, 1.02]);

    return {
      opacity: 1,
      transform: [{ scale }],
    };
  });

  return (
    <GlassCard
      intensity={isEarned ? 25 : 10}
      tint="dark"
      style={styles.card}
      borderRadius={RADIUS.xl}
      padding={0}
      showBorder={isEarned}
    >
      <View style={styles.cardContent}>
        {/* Badge Icon Container */}
        <View style={styles.badgeContainer}>
          {/* Glow ring for earned badges */}
          {isEarned && (
            <Animated.View
              style={[
                styles.glowRing,
                { backgroundColor: rarityColor },
                glowStyle,
              ]}
            />
          )}

          {/* Badge circle */}
          <Animated.View
            style={[
              styles.badgeCircle,
              isEarned && { borderColor: rarityColor },
              !isEarned && styles.badgeCircleLocked,
              badgeStyle,
            ]}
          >
            <MaterialCommunityIcons
              name={icon as any}
              size={28}
              color={isEarned ? rarityColor : COLORS.text.tertiary}
            />
          </Animated.View>

          {/* Earned checkmark */}
          {isEarned && (
            <View style={[styles.earnedBadge, { backgroundColor: rarityColor }]}>
              <MaterialCommunityIcons
                name="check"
                size={10}
                color={COLORS.white}
              />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Rarity tag */}
          {isEarned && rarity !== 'common' && (
            <View style={[styles.rarityTag, { backgroundColor: `${rarityColor}20` }]}>
              <Text style={[styles.rarityText, { color: rarityColor }]}>
                {RARITY_LABELS[rarity]}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text
            style={[styles.title, !isEarned && styles.titleLocked]}
            numberOfLines={1}
          >
            {title}
          </Text>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>

          {/* Progress bar or XP */}
          {isEarned ? (
            <View style={styles.xpContainer}>
              <MaterialCommunityIcons
                name="star-four-points"
                size={12}
                color={COLORS.accent}
              />
              <Text style={styles.xpText}>+{xp} XP</Text>
            </View>
          ) : (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%`, backgroundColor: rarityColor },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          )}
        </View>

        {/* Lock icon for unearned */}
        {!isEarned && (
          <View style={styles.lockContainer}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={18}
              color={COLORS.text.tertiary}
            />
          </View>
        )}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: SPACING.base,
  },
  cardContent: {
    padding: SPACING.base,
    alignItems: 'center',
    position: 'relative',
    minHeight: 180,
  },
  badgeContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  glowRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    top: -4,
    left: -4,
  },
  badgeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface.base,
    borderWidth: 3,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  badgeCircleLocked: {
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.surface.muted,
    shadowOpacity: 0,
  },
  earnedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface.base,
  },
  content: {
    alignItems: 'center',
    flex: 1,
  },
  rarityTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  titleLocked: {
    color: COLORS.text.tertiary,
  },
  description: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.accent,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    width: '100%',
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border.default,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    fontWeight: '600',
    width: 32,
    textAlign: 'right',
  },
  lockContainer: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
});

export default AchievementCard;
