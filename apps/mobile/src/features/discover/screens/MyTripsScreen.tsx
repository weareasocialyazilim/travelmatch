// screens/MyTripsScreen.tsx
// TravelMatch Ultimate Design System 2026
// "Deneyimlerim" - Premium trips listing with Liquid Glass aesthetic

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, primitives } from '@/constants/colors';
import { SPACING, RADIUS } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/theme/typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LiquidScreenWrapper } from '@/components/layout/LiquidScreenWrapper';

// Trip data type
interface Trip {
  id: string;
  title: string;
  date: string;
  status: 'upcoming' | 'completed';
  image: string;
  host: string;
  type: 'gifted' | 'purchased';
}

const TRIPS: Trip[] = [
  {
    id: '1',
    title: 'Bali Sanctuary Walk',
    date: '24 Şub 2026',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=200',
    host: 'Caner Öz',
    type: 'gifted',
  },
  {
    id: '2',
    title: 'Tokyo Neon Night',
    date: '12 Oca 2026',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?q=80&w=200',
    host: 'Zeynep Ak',
    type: 'purchased',
  },
  {
    id: '3',
    title: 'Louvre Private Tour',
    date: '14 Şub 2026',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=200',
    host: 'Marc B.',
    type: 'purchased',
  },
];

/**
 * MyTripsScreen - Awwwards Standardında Deneyimlerim Ekranı
 * Features:
 * - Liquid Glass cards with blur effect
 * - Premium StatusBadge for trip status
 * - Animated empty state with neon particles
 * - Tab filter with glass morphism
 */
export const MyTripsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  const filteredTrips = TRIPS.filter((t) =>
    filter === 'upcoming' ? t.status === 'upcoming' : t.status === 'completed'
  );

  const handleTripPress = useCallback(
    (tripId: string) => {
      navigation.navigate('TripDetails', { tripId });
    },
    [navigation]
  );

  const handleExplorePress = useCallback(() => {
    navigation.navigate('Discover');
  }, [navigation]);

  const renderItem = useCallback(
    ({ item, index }: { item: Trip; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleTripPress(item.id)}
          style={styles.cardWrapper}
        >
          <GlassCard intensity={15} padding={0} borderRadius={24}>
            <View style={styles.cardContent}>
              {/* Trip Image */}
              <Image source={{ uri: item.image }} style={styles.tripImage} />

              {/* Trip Info */}
              <View style={styles.tripInfo}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <StatusBadge
                    label={item.status === 'upcoming' ? 'Yaklaşan' : 'Tamamlandı'}
                    type={item.status === 'upcoming' ? 'info' : 'success'}
                    size="sm"
                  />
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>

                {/* Title */}
                <Text style={styles.tripTitle} numberOfLines={1}>
                  {item.title}
                </Text>

                {/* Host */}
                <View style={styles.hostRow}>
                  <MaterialCommunityIcons
                    name="account-circle-outline"
                    size={14}
                    color={primitives.stone[400]}
                  />
                  <Text style={styles.hostText}>{item.host} ile Deneyim</Text>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.typeBadge}>
                    <Ionicons
                      name={item.type === 'gifted' ? 'gift' : 'card'}
                      size={12}
                      color={primitives.stone[400]}
                    />
                    <Text style={styles.typeText}>
                      {item.type === 'gifted' ? 'HEDİYE' : 'SATIN ALINDI'}
                    </Text>
                  </View>
                  <View style={styles.actionRow}>
                    <Text style={styles.actionText}>Bileti Gör</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color={COLORS.primary}
                    />
                  </View>
                </View>
              </View>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>
    ),
    [handleTripPress]
  );

  const renderEmptyState = useCallback(
    () => (
      <EmptyState
        icon="bag-suitcase-off-outline"
        title={
          filter === 'upcoming'
            ? 'Yaklaşan deneyim yok'
            : 'Geçmiş deneyim yok'
        }
        description={
          filter === 'upcoming'
            ? 'Yeni deneyimler keşfet ve anılar biriktirmeye başla!'
            : 'Tamamlanan deneyimlerin burada görünecek.'
        }
        actionLabel={filter === 'upcoming' ? 'Keşfet' : undefined}
        onAction={filter === 'upcoming' ? handleExplorePress : undefined}
        variant="default"
        glowColor={COLORS.primary}
      />
    ),
    [filter, handleExplorePress]
  );

  return (
    <LiquidScreenWrapper variant="dark" safeAreaTop>
      {/* Header */}
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deneyimlerim</Text>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="calendar-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </Animated.View>

      {/* Tabs */}
      <Animated.View
        entering={FadeInUp.delay(100).duration(400)}
        style={styles.tabsContainer}
      >
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setFilter('upcoming')}
            style={[styles.tab, filter === 'upcoming' && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                filter === 'upcoming' && styles.activeTabText,
              ]}
            >
              Yaklaşan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('past')}
            style={[styles.tab, filter === 'past' && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                filter === 'past' && styles.activeTabText,
              ]}
            >
              Geçmiş
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Trip List */}
      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          filteredTrips.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </LiquidScreenWrapper>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.base,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  tabsContainer: {
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.base,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: RADIUS.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabText: {
    ...TYPOGRAPHY.label,
    color: primitives.stone[500],
  },
  activeTabText: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.screenPadding,
    paddingBottom: SPACING['4xl'],
  },
  emptyListContent: {
    flex: 1,
  },
  cardWrapper: {
    marginBottom: SPACING.base,
  },
  cardContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  tripImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
  },
  tripInfo: {
    flex: 1,
    marginLeft: SPACING.base,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dateText: {
    fontSize: 11,
    color: primitives.stone[500],
    letterSpacing: 0.5,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  hostText: {
    fontSize: 12,
    color: primitives.stone[400],
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '700',
    color: primitives.stone[400],
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default MyTripsScreen;
