import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import AnimatedReanimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { LucideIcon, Sprout, Flower2, TreeDeciduous, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { COLORS as THEME } from '@/constants/colors';

interface TrustGardenViewProps {
  score: number;
  isVerified: boolean;
  tier: 'Free' | 'Pro' | 'Elite';
}

export const TrustGardenView: React.FC<TrustGardenViewProps> = ({ score, isVerified, tier }) => {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.1),
      withSpring(1)
    );
  }, [score]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getStage = () => {
    if (score >= 500 && isVerified) return {
      icon: TreeDeciduous,
      color: THEME.success,
      label: 'Güven Ağacı (Elite)',
      desc: 'Platformun en güvenilir üyelerinden birisiniz.'
    };
    if (score >= 100 || isVerified) return {
      icon: Flower2,
      color: THEME.primary,
      label: 'Çiçeklenen Bahçe',
      desc: 'Güveniniz çiçek açıyor, limitleriniz artıyor.'
    };
    return {
      icon: Sprout,
      color: THEME.warning,
      label: 'Yeni Fidan',
      desc: 'Bahçenizi büyütmek için kimliğinizi doğrulayın.'
    };
  };

  const stage = getStage();
  const Icon = stage.icon;

  return (
    <View style={styles.container}>
      <AnimatedReanimated.View style={[styles.gardenCircle, { borderColor: stage.color }, animatedStyle]}>
        <Icon size={48} color={stage.color} />
      </AnimatedReanimated.View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.label, { color: stage.color }]}>{stage.label}</Text>
        <Text style={styles.scoreText}>{score} TrustScore</Text>
        <Text style={styles.descText}>{stage.desc}</Text>
      </View>

      <View style={styles.badgeRow}>
        {isVerified ? (
          <View style={[styles.badge, styles.verifiedBadge]}>
            <ShieldCheck size={14} color="#FFF" />
            <Text style={styles.badgeText}>Verified</Text>
          </View>
        ) : (
          <View style={[styles.badge, styles.unverifiedBadge]}>
            <AlertCircle size={14} color="#FFF" />
            <Text style={styles.badgeText}>Unverified</Text>
          </View>
        )}
        <View style={[styles.badge, styles.tierBadge]}>
          <Text style={styles.badgeText}>{tier}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginVertical: 10,
  },
  gardenCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '600',
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedBadge: {
    backgroundColor: THEME.success,
  },
  unverifiedBadge: {
    backgroundColor: THEME.error,
  },
  tierBadge: {
    backgroundColor: THEME.primary,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
