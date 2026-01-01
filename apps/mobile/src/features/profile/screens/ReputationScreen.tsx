/**
 * ReputationScreen - Trust Score Dashboard
 *
 * Design inspired by DailyLoop's minimal aesthetic:
 * - Soft shadows and floating cards
 * - Stacked card preview effect
 * - Premium "jewelry" trust visualization
 * - 60-30-10 color rule compliance
 *
 * Using TravelMatch "Sunset Proof Palette":
 * - Primary: Amber (#F59E0B)
 * - Secondary: Magenta (#EC4899)
 * - Trust: Emerald (#10B981)
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives, SHADOWS } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════
interface TrustCategory {
  id: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: number;
  maxValue: number;
  status: 'completed' | 'in_progress' | 'pending';
}

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  momentTitle: string;
  emoji: string;
}

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════
const TRUST_SCORE = 78;
const TRUST_LEVEL = 'Blooming';

const TRUST_CATEGORIES: TrustCategory[] = [
  { id: '1', icon: 'shield-check', label: 'Kimlik Doğrulama', value: 25, maxValue: 30, status: 'completed' },
  { id: '2', icon: 'check-decagram', label: 'Tamamlanan Anlar', value: 22, maxValue: 30, status: 'in_progress' },
  { id: '3', icon: 'link-variant', label: 'Sosyal Bağlantı', value: 12, maxValue: 15, status: 'completed' },
  { id: '4', icon: 'message-reply', label: 'Yanıt Hızı', value: 11, maxValue: 15, status: 'in_progress' },
  { id: '5', icon: 'star', label: 'Ortalama Puan', value: 8, maxValue: 10, status: 'completed' },
];

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    quote: 'Kyoto fotoğrafları muhteşemdi! Katkıda bulunduğum için çok mutluyum.',
    author: 'Sarah J.',
    momentTitle: 'Kyoto\'da Kahve',
    emoji: '☕',
  },
  {
    id: '2',
    quote: 'Machu Picchu güncellemeleri ile oradaymış gibi hissettim!',
    author: 'Mike R.',
    momentTitle: 'Machu Picchu Gündoğumu',
    emoji: '🏔️',
  },
];

import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type ReputationScreenProps = StackScreenProps<RootStackParamList, 'Reputation'>;

// ═══════════════════════════════════════════════════════════════════
// ANIMATED COMPONENTS
// ═══════════════════════════════════════════════════════════════════

/**
 * Floating Trust Score Card with stacked preview effect
 * Inspired by DailyLoop's "Today's Overview" card
 */
const TrustScoreCard: React.FC<{ score: number; level: string }> = ({ score, level }) => {
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    cardOpacity.value = withTiming(1, { duration: 600 });
    progressWidth.value = withDelay(
      400,
      withTiming(score / 100, { duration: 1200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
  }, [score, cardScale, cardOpacity, progressWidth]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  // Get level color based on score
  const getLevelColor = () => {
    if (score >= 90) return primitives.purple[500];
    if (score >= 70) return primitives.emerald[500];
    if (score >= 40) return primitives.amber[500];
    return primitives.magenta[500];
  };

  const getLevelIcon = (): keyof typeof MaterialCommunityIcons.glyphMap => {
    if (score >= 90) return 'crown';
    if (score >= 70) return 'flower';
    if (score >= 40) return 'leaf';
    return 'sprout';
  };

  const levelColor = getLevelColor();

  return (
    <View style={styles.cardStackContainer}>
      {/* Background stacked cards (DailyLoop effect) */}
      <View style={[styles.stackedCardBack, styles.stackedCard2]} />
      <View style={[styles.stackedCardBack, styles.stackedCard1]} />

      {/* Main card */}
      <Animated.View style={[styles.trustScoreCard, cardAnimatedStyle]}>
        {/* Header with emoji */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Trust Score</Text>
          <View style={[styles.levelBadge, { backgroundColor: `${levelColor}15` }]}>
            <MaterialCommunityIcons name={getLevelIcon()} size={16} color={levelColor} />
          </View>
        </View>

        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreNumber}>{score}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>

        {/* Level Badge */}
        <Text style={[styles.levelText, { color: levelColor }]}>{level}</Text>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View style={[styles.progressBarFill, progressAnimatedStyle]} />
          </View>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStat}>
            <MaterialCommunityIcons name="account-group" size={16} color={primitives.stone[400]} />
            <Text style={styles.quickStatValue}>14</Text>
            <Text style={styles.quickStatLabel}>Destekçi</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <MaterialCommunityIcons name="check-circle" size={16} color={primitives.emerald[500]} />
            <Text style={styles.quickStatValue}>28</Text>
            <Text style={styles.quickStatLabel}>Doğrulanan</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <MaterialCommunityIcons name="repeat" size={16} color={primitives.amber[500]} />
            <Text style={styles.quickStatValue}>3</Text>
            <Text style={styles.quickStatLabel}>Tekrar</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

/**
 * Trust Category Item with status indicator
 */
const TrustCategoryItem: React.FC<{ category: TrustCategory; index: number }> = ({ category, index }) => {
  const itemOpacity = useSharedValue(0);
  const itemTranslateX = useSharedValue(-20);

  useEffect(() => {
    itemOpacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
    itemTranslateX.value = withDelay(index * 100, withSpring(0, { damping: 15 }));
  }, [index, itemOpacity, itemTranslateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: itemOpacity.value,
    transform: [{ translateX: itemTranslateX.value }],
  }));

  const getStatusColor = () => {
    switch (category.status) {
      case 'completed': return primitives.emerald[500];
      case 'in_progress': return primitives.amber[500];
      default: return primitives.stone[300];
    }
  };

  const getStatusIcon = (): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (category.status) {
      case 'completed': return 'check-circle';
      case 'in_progress': return 'clock-outline';
      default: return 'circle-outline';
    }
  };

  const percentage = (category.value / category.maxValue) * 100;
  const statusColor = getStatusColor();

  return (
    <Animated.View style={[styles.categoryItem, animatedStyle]}>
      <View style={[styles.categoryIcon, { backgroundColor: `${statusColor}12` }]}>
        <MaterialCommunityIcons name={category.icon} size={20} color={statusColor} />
      </View>

      <View style={styles.categoryContent}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryLabel}>{category.label}</Text>
          <MaterialCommunityIcons name={getStatusIcon()} size={14} color={statusColor} />
        </View>

        <View style={styles.categoryProgressContainer}>
          <View style={styles.categoryProgressBg}>
            <View
              style={[
                styles.categoryProgressFill,
                { width: `${percentage}%`, backgroundColor: statusColor }
              ]}
            />
          </View>
          <Text style={styles.categoryValue}>{category.value}/{category.maxValue}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

/**
 * Testimonial Card with soft shadow
 */
const TestimonialCard: React.FC<{ testimonial: Testimonial; index: number }> = ({ testimonial, index }) => {
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.95);

  useEffect(() => {
    cardOpacity.value = withDelay(600 + index * 150, withTiming(1, { duration: 400 }));
    cardScale.value = withDelay(600 + index * 150, withSpring(1, { damping: 15 }));
  }, [index, cardOpacity, cardScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <Animated.View style={[styles.testimonialCard, animatedStyle]}>
      <View style={styles.testimonialEmoji}>
        <Text style={styles.emojiText}>{testimonial.emoji}</Text>
      </View>
      <Text style={styles.testimonialQuote}>"{testimonial.quote}"</Text>
      <View style={styles.testimonialFooter}>
        <Text style={styles.testimonialAuthor}>{testimonial.author}</Text>
        <Text style={styles.testimonialMoment}>{testimonial.momentTitle}</Text>
      </View>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function ReputationScreen({ navigation }: ReputationScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Minimal Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={primitives.stone[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trust Garden</Text>
        <TouchableOpacity style={styles.infoButton}>
          <MaterialCommunityIcons name="information-outline" size={20} color={primitives.stone[400]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Trust Score Card */}
        <TrustScoreCard score={TRUST_SCORE} level={TRUST_LEVEL} />

        {/* Trust Breakdown Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trust Breakdown</Text>
          <View style={styles.categoriesContainer}>
            {TRUST_CATEGORIES.map((category, index) => (
              <TrustCategoryItem key={category.id} category={category} index={index} />
            ))}
          </View>
        </View>

        {/* Testimonials Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What People Say</Text>
          <View style={styles.testimonialsContainer}>
            {TESTIMONIALS.map((testimonial, index) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
            ))}
          </View>
        </View>

        {/* CTA Button - 10% accent rule */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
          <Text style={styles.ctaText}>Boost Your Trust Score</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES - Following 60-30-10 Rule
// 60% Background/Primary surfaces
// 30% Text/Secondary elements
// 10% Accent/CTA
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  // Container - 60% Primary (Light background)
  container: {
    flex: 1,
    backgroundColor: primitives.stone[50], // Warm neutral background
  },

  // Header - Minimal, clean
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: primitives.stone[50],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: primitives.white,
    ...SHADOWS.subtle,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: primitives.stone[900],
    letterSpacing: -0.3,
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Card Stack Container (DailyLoop effect)
  cardStackContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 16,
  },
  stackedCardBack: {
    position: 'absolute',
    width: SCREEN_WIDTH - 72,
    height: 260,
    backgroundColor: primitives.white,
    borderRadius: 24,
  },
  stackedCard2: {
    top: 8,
    opacity: 0.3,
    transform: [{ scale: 0.92 }],
  },
  stackedCard1: {
    top: 4,
    opacity: 0.6,
    transform: [{ scale: 0.96 }],
  },

  // Main Trust Score Card
  trustScoreCard: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: primitives.white,
    borderRadius: 24,
    padding: 24,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: primitives.stone[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  levelBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Score Display
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 4,
  },
  scoreNumber: {
    fontSize: 64,
    fontWeight: '800',
    color: primitives.stone[900],
    letterSpacing: -3,
  },
  scoreMax: {
    fontSize: 20,
    fontWeight: '500',
    color: primitives.stone[400],
    marginLeft: 4,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 20,
  },

  // Progress Bar
  progressBarContainer: {
    marginBottom: 24,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: primitives.stone[100],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: primitives.amber[500],
  },

  // Quick Stats Row
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: primitives.stone[900],
  },
  quickStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: primitives.stone[400],
  },
  quickStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: primitives.stone[100],
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: primitives.stone[900],
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // Categories Container
  categoriesContainer: {
    backgroundColor: primitives.white,
    borderRadius: 20,
    padding: 4,
    ...SHADOWS.subtle,
  },

  // Category Item
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryContent: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: primitives.stone[700],
  },
  categoryProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryProgressBg: {
    flex: 1,
    height: 6,
    backgroundColor: primitives.stone[100],
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: primitives.stone[400],
    minWidth: 36,
    textAlign: 'right',
  },

  // Testimonials
  testimonialsContainer: {
    gap: 12,
  },
  testimonialCard: {
    backgroundColor: primitives.white,
    borderRadius: 20,
    padding: 18,
    ...SHADOWS.subtle,
  },
  testimonialEmoji: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: primitives.amber[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emojiText: {
    fontSize: 18,
  },
  testimonialQuote: {
    fontSize: 14,
    fontWeight: '500',
    color: primitives.stone[700],
    lineHeight: 22,
    marginBottom: 12,
  },
  testimonialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testimonialAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: primitives.stone[900],
  },
  testimonialMoment: {
    fontSize: 12,
    fontWeight: '500',
    color: primitives.stone[400],
  },

  // CTA Button - 10% Accent (Primary Amber)
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: primitives.stone[900],
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 8,
    ...SHADOWS.button,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: primitives.white,
  },

  bottomSpacer: {
    height: 40,
  },
});
