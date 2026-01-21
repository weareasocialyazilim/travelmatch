// AchievementsScreen - Digital Badge Collection
// Awwwards standard achievements display with neon glow and collection aesthetics
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { SPACING, RADIUS } from '@/constants/spacing';
import { GlassCard } from '@/components/ui/GlassCard';
import { AchievementCard } from '../components/AchievementCard';

// Achievement type definition
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  isEarned: boolean;
  xp: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'social' | 'explorer' | 'host' | 'trust';
}

// Sample achievements data
const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'İlk Adım',
    description: 'İlk Momentini başarıyla paylaştın.',
    icon: 'rocket-launch',
    progress: 100,
    isEarned: true,
    xp: 100,
    rarity: 'common',
    category: 'host',
  },
  {
    id: '2',
    title: 'Güven Elçisi',
    description: '10 kullanıcıdan tam puan aldın.',
    icon: 'shield-check',
    progress: 80,
    isEarned: false,
    xp: 250,
    rarity: 'rare',
    category: 'trust',
  },
  {
    id: '3',
    title: 'Kültür Kaşifi',
    description: '3 farklı kültürden Moment paylaştın.',
    icon: 'earth',
    progress: 33,
    isEarned: false,
    xp: 500,
    rarity: 'epic',
    category: 'explorer',
  },
  {
    id: '4',
    title: 'Cömert Verici',
    description: '5 farklı kişiye hediye gönderdin.',
    icon: 'gift',
    progress: 100,
    isEarned: true,
    xp: 150,
    rarity: 'common',
    category: 'social',
  },
  {
    id: '5',
    title: 'Süper Host',
    description: '50 başarılı Moment düzenledin.',
    icon: 'star-shooting',
    progress: 24,
    isEarned: false,
    xp: 1000,
    rarity: 'legendary',
    category: 'host',
  },
  {
    id: '6',
    title: 'Topluluk Yıldızı',
    description: '100 takipçiye ulaştın.',
    icon: 'account-group',
    progress: 67,
    isEarned: false,
    xp: 300,
    rarity: 'rare',
    category: 'social',
  },
];

// Category configuration
const CATEGORIES = [
  { id: 'all', label: 'Tümü', icon: 'view-grid' },
  { id: 'host', label: 'Host', icon: 'home-heart' },
  { id: 'explorer', label: 'Kaşif', icon: 'compass' },
  { id: 'social', label: 'Sosyal', icon: 'account-heart' },
  { id: 'trust', label: 'Güven', icon: 'shield-star' },
];

export const AchievementsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = React.useState('all');

  // Animation values
  const headerGlow = useSharedValue(0);

  useEffect(() => {
    headerGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [headerGlow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(headerGlow.value, [0, 1], [0.3, 0.6]),
  }));

  // Filter achievements by category
  const filteredAchievements =
    selectedCategory === 'all'
      ? ACHIEVEMENTS
      : ACHIEVEMENTS.filter((a) => a.category === selectedCategory);

  // Calculate stats
  const earnedCount = ACHIEVEMENTS.filter((a) => a.isEarned).length;
  const totalXP = ACHIEVEMENTS.filter((a) => a.isEarned).reduce(
    (sum, a) => sum + a.xp,
    0,
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Başarımlarım</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Summary Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <GlassCard
            intensity={25}
            tint="light"
            style={styles.summaryCard}
            borderRadius={RADIUS['2xl']}
            padding={0}
          >
            {/* Glow effect */}
            <Animated.View style={[styles.summaryGlow, glowStyle]} />

            <View style={styles.summaryContent}>
              {/* Trophy icon */}
              <View style={styles.trophyContainer}>
                <MaterialCommunityIcons
                  name="trophy"
                  size={32}
                  color={COLORS.accent.primary}
                />
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{earnedCount}</Text>
                  <Text style={styles.statLabel}>KAZANILAN</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{ACHIEVEMENTS.length}</Text>
                  <Text style={styles.statLabel}>TOPLAM</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text
                    style={[styles.statValue, { color: COLORS.accent.primary }]}
                  >
                    {totalXP}
                  </Text>
                  <Text style={styles.statLabel}>TOPLAM XP</Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.overallProgress}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    Koleksiyon İlerlemesi
                  </Text>
                  <Text style={styles.progressPercent}>
                    {Math.round((earnedCount / ACHIEVEMENTS.length) * 100)}%
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(earnedCount / ACHIEVEMENTS.length) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
            style={styles.categoryContainer}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={16}
                  color={
                    selectedCategory === cat.id
                      ? COLORS.white
                      : COLORS.text.secondary
                  }
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === cat.id && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Section Title */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.sectionTitle}>ROZET KOLEKSİYONU</Text>
        </Animated.View>

        {/* Achievement Grid */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.grid}
        >
          {filteredAchievements.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              index={index}
            />
          ))}
        </Animated.View>

        {/* Empty state */}
        {filteredAchievements.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="trophy-outline"
              size={48}
              color={COLORS.text.tertiary}
            />
            <Text style={styles.emptyText}>
              Bu kategoride henüz başarım yok
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.base,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING['3xl'],
  },
  summaryCard: {
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  summaryGlow: {
    position: 'absolute',
    top: -50,
    left: '50%',
    marginLeft: -100,
    width: 200,
    height: 100,
    backgroundColor: COLORS.accent.primary,
    borderRadius: 100,
  },
  summaryContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  trophyContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.accent.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text.tertiary,
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border.light,
  },
  overallProgress: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  progressPercent: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.border.default,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  categoryContainer: {
    marginBottom: SPACING.lg,
    marginHorizontal: -SPACING.screenPadding,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface.muted,
    borderRadius: RADIUS.full,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  categoryLabelActive: {
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text.tertiary,
    letterSpacing: 2,
    marginBottom: SPACING.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
    gap: SPACING.md,
  },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.tertiary,
  },
});

export default AchievementsScreen;
