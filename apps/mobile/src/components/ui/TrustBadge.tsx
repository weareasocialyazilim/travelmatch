import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface TrustBadgeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
}

export const TrustBadge = ({ score, size = 'medium' }: TrustBadgeProps) => {
  const getLevel = (s: number) => {
    if (s >= 90) return { label: 'PLATINUM', colors: ['#E5E4E2', '#B0B0B0'], icon: 'shield-crown' };
    if (s >= 70) return { label: 'GOLD', colors: ['#FFD700', '#FDB931'], icon: 'shield-star' };
    if (s >= 50) return { label: 'SILVER', colors: ['#C0C0C0', '#E0E0E0'], icon: 'shield-check' };
    return { label: 'MEMBER', colors: ['#CD7F32', '#A0522D'], icon: 'shield-outline' };
  };

  const level = getLevel(score);
  const iconSize = size === 'small' ? 12 : size === 'large' ? 24 : 16;
  const fontSize = size === 'small' ? 10 : size === 'large' ? 16 : 12;

  return (
    <LinearGradient
      colors={level.colors as any}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[styles.container, size === 'small' && styles.smallContainer]}
    >
      <MaterialCommunityIcons name={level.icon as any} size={iconSize} color="#333" />
      <Text style={[styles.text, { fontSize }]}>{level.label} • {score}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    alignSelf: 'flex-start',
  },
  smallContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  text: {
    color: '#333',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

export default TrustBadge;
