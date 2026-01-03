import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { GlassCard } from '../../../components/ui/GlassCard';

interface Achievement {
  title: string;
  desc: string;
  icon: string;
  progress: number;
  isEarned: boolean;
}

interface AchievementCardProps {
  achievement: Achievement;
  style?: ViewStyle;
}

/**
 * Tekil Basarim Karti.
 * Neon rozet estetigi ve ilerleme durumu.
 */
export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  style,
}) => {
  return (
    <GlassCard
      intensity={achievement.isEarned ? 25 : 10}
      style={[styles.container, !achievement.isEarned && styles.locked, style] as ViewStyle[]}
    >
      <View style={[styles.iconBox, achievement.isEarned && styles.earnedIcon]}>
        <Ionicons
          name={achievement.icon as any}
          size={32}
          color={achievement.isEarned ? COLORS.primary : COLORS.text.muted}
        />
        {achievement.isEarned && <View style={styles.glow} />}
      </View>

      <Text style={[styles.title, !achievement.isEarned && styles.mutedText]}>
        {achievement.title}
      </Text>

      {/* Ilerleme Cubugu */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${achievement.progress}%` }]} />
      </View>

      <Text style={styles.desc} numberOfLines={2}>
        {achievement.desc}
      </Text>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '47%',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  locked: {
    opacity: 0.6,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  earnedIcon: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  glow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryMuted,
    zIndex: -1,
    opacity: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  mutedText: {
    color: COLORS.text.secondary,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.surface.subtle,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  desc: {
    fontSize: 10,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default AchievementCard;
