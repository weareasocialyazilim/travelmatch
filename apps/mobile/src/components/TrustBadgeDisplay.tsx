/**
 * TrustBadgeDisplay Component
 *
 * Displays a compact trust badge with score and level indicator.
 * Part of iOS 26.3 design system for TravelMatch.
 *
 * Trust Levels:
 * - Bronze: Score 0-49
 * - Silver: Score 50-69
 * - Gold: Score 70-89
 * - Platinum: Score 90-100
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export type TrustBadgeLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

interface TrustBadgeProps {
  /** Trust level badge type */
  level: TrustBadgeLevel;
  /** Trust score (0-100) */
  score: number;
  /** Custom container style */
  style?: ViewStyle;
}

const BADGE_CONFIG = {
  bronze: {
    bg: COLORS.kycBronze,
    text: COLORS.utility.white,
    icon: 'shield-outline' as const,
    label: 'Bronz',
  },
  silver: {
    bg: COLORS.kycSilver,
    text: '#333333',
    icon: 'shield-check' as const,
    label: 'Gümüş',
  },
  gold: {
    bg: COLORS.kycGold,
    text: '#333333',
    icon: 'shield-star' as const,
    label: 'Altın',
  },
  platinum: {
    bg: COLORS.kycPlatinum,
    text: '#333333',
    icon: 'shield-crown' as const,
    label: 'Platin',
  },
};

/**
 * Get trust badge level based on score
 */
export const getTrustBadgeLevel = (score: number): TrustBadgeLevel => {
  if (score >= 90) return 'platinum';
  if (score >= 70) return 'gold';
  if (score >= 50) return 'silver';
  return 'bronze';
};

/**
 * Get trust badge label
 */
export const getTrustBadgeLabel = (level: TrustBadgeLevel): string => {
  return BADGE_CONFIG[level].label;
};

export const TrustBadgeDisplay: React.FC<TrustBadgeProps> = ({
  level,
  score,
  style,
}) => {
  const config = BADGE_CONFIG[level];

  return (
    <View style={[styles.container, { borderColor: config.bg }, style]}>
      <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
        <MaterialCommunityIcons
          name={config.icon}
          size={16}
          color={config.text}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.scoreText}>{score}</Text>
        <Text style={styles.labelText}>Trust Score</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingRight: 10,
    backgroundColor: COLORS.overlay.light,
    overflow: 'hidden',
  },
  iconContainer: {
    padding: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  textContainer: {
    justifyContent: 'center',
  },
  scoreText: {
    color: COLORS.utility.white,
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  labelText: {
    color: COLORS.textOnDarkMuted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
});

export default TrustBadgeDisplay;
