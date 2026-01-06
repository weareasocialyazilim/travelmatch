/**
 * ProfileScreen - Awwwards Edition
 *
 * Premium profile experience with Twilight Zinc dark theme.
 * Features:
 * - Liquid Glass card effects
 * - Trust Constellation visualization
 * - Neon accent colors
 * - Smooth spring animations
 */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui';
import { GlassCard } from '@/components/ui/GlassCard';
import { PROFILE_DEFAULTS } from '@/constants/defaultValues';
import BottomNav from '@/components/BottomNav';
import {
  ProfileHeaderSection,
  StatsRow,
  WalletCard,
  QuickLinks,
  ProfileMomentCard,
  MomentsTabs,
} from '../components';
import { useAuth } from '@/context/AuthContext';
import { useMoments, type Moment } from '@/hooks/useMoments';
import { userService } from '@/services/userService';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { UserProfile } from '@/services/userService';
import type { NavigationProp } from '@react-navigation/native';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { useNetworkStatus } from '../../../context/NetworkContext';
import { OfflineState } from '../../../components/OfflineState';
import { TrustConstellation } from '@/features/verifications/components';
import {
  PROFILE_COLORS,
  PROFILE_SPACING,
  PROFILE_TYPOGRAPHY,
  PROFILE_SPRINGS,
} from '../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isConnected, refresh: refreshNetwork } = useNetworkStatus();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  // Get user from auth context
  const { user: authUser, isLoading: _authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { user } = await userService.getCurrentUser();
        setUserProfile(user);
      } catch (error) {
        logger.error('Failed to fetch user profile', error);
      }
    };
    if (authUser) {
      fetchProfile();
    }
  }, [authUser]);

  // Get moments
  const { myMoments, myMomentsLoading, loadMyMoments } = useMoments();

  useEffect(() => {
    loadMyMoments();
  }, [loadMyMoments]);

  // User data - merge auth user with profile data
  const userData = useMemo(() => {
    if (authUser) {
      // Use auth user data with fallbacks from profile
      const authUserAny = authUser as unknown as Record<string, unknown>;
      return {
        name: authUser.name || userProfile?.name || 'User',
        avatarUrl:
          (authUserAny.profilePhoto as string) ||
          (authUserAny.avatarUrl as string) ||
          userProfile?.avatar ||
          'https://ui-avatars.com/api/?name=User',
        isVerified:
          authUser.kyc === 'Verified' || userProfile?.isVerified || false,
        location:
          typeof authUser.location === 'string'
            ? authUser.location
            : (authUser.location as { city?: string })?.city ||
              userProfile?.location?.city ||
              'Unknown Location',
        trustScore: authUser.trustScore || userProfile?.rating || 0,
        momentsCount:
          myMoments.length ||
          userProfile?.momentCount ||
          PROFILE_DEFAULTS.MOMENTS_COUNT,
        exchangesCount:
          (userProfile?.giftsSent || 0) + (userProfile?.giftsReceived || 0),
        responseRate: PROFILE_DEFAULTS.RESPONSE_RATE,
        activeMoments: myMoments.filter((m) =>
          ['active', 'paused', 'draft'].includes(m.status),
        ).length,
        completedMoments: myMoments.filter((m) => m.status === 'completed')
          .length,
        walletBalance: PROFILE_DEFAULTS.WALLET_BALANCE,
        giftsSentCount: userProfile?.giftsSent || 0,
        savedCount: PROFILE_DEFAULTS.SAVED_COUNT,
      };
    }

    // Fallback for guest/loading
    return {
      name: 'Guest',
      avatarUrl: 'https://ui-avatars.com/api/?name=User',
      isVerified: false,
      location: '',
      trustScore: 0,
      momentsCount: 0,
      exchangesCount: 0,
      responseRate: 0,
      activeMoments: 0,
      completedMoments: 0,
      walletBalance: 0,
      giftsSentCount: 0,
      savedCount: 0,
    };
  }, [authUser, myMoments, userProfile]);

  // Navigation handlers
  const handleEditProfile = useCallback(
    () => navigation.navigate('EditProfile'),
    [navigation],
  );
  const handleMyMoments = useCallback(
    () => navigation.navigate('MyMoments'),
    [navigation],
  );
  const handleTrustGarden = useCallback(
    () => navigation.navigate('TrustGardenDetail'),
    [navigation],
  );
  const handleSettings = useCallback(
    () => navigation.navigate('AppSettings'),
    [navigation],
  );
  const handleWallet = useCallback(
    () => navigation.navigate('Wallet'),
    [navigation],
  );
  const handleMyGifts = useCallback(
    () => navigation.navigate('MyGifts'),
    [navigation],
  );
  const handleSavedMoments = useCallback(
    () => navigation.navigate('SavedMoments'),
    [navigation],
  );
  const handleShare = useCallback(
    () => navigation.navigate('SharePreview'),
    [navigation],
  );

  const activeMomentsList = useMemo(
    () =>
      myMoments.filter((m) => ['active', 'paused', 'draft'].includes(m.status)),
    [myMoments],
  );

  const pastMomentsList = useMemo(
    () => myMoments.filter((m) => m.status === 'completed'),
    [myMoments],
  );

  const displayedMoments =
    activeTab === 'active' ? activeMomentsList : pastMomentsList;

  // QuickLinks configuration
  const quickLinksData = useMemo(
    () => [
      {
        icon: 'gift-outline',
        color: PROFILE_COLORS.neon.lime,
        label: 'Hediyeler',
        count: userData.giftsSentCount,
        onPress: handleMyGifts,
      },
      {
        icon: 'bookmark-outline',
        color: PROFILE_COLORS.neon.violet,
        label: 'Kaydedilenler',
        count: userData.savedCount,
        onPress: handleSavedMoments,
      },
    ],
    [
      userData.giftsSentCount,
      userData.savedCount,
      handleMyGifts,
      handleSavedMoments,
    ],
  );

  const handleMomentPress = useCallback(
    (moment: Moment) => {
      const locationObj =
        typeof moment.location === 'string'
          ? { city: moment.location, country: '' }
          : moment.location;

      const categoryObj =
        typeof moment.category === 'string'
          ? { id: moment.category, label: moment.category, emoji: '✨' }
          : moment.category;

      navigation.navigate('MomentDetail', {
        moment: {
          ...moment,
          location: locationObj,
          story: moment.description || `Experience ${moment.title}`,
          imageUrl:
            moment.images?.[0] || 'https://ui-avatars.com/api/?name=Moment',
          image:
            moment.images?.[0] || 'https://ui-avatars.com/api/?name=Moment',
          price: moment.pricePerGuest,
          availability: moment.status === 'active' ? 'Available' : 'Completed',
          user: {
            id: 'current-user',
            name: userData.name,
            avatar: userData.avatarUrl,
            isVerified: userData.isVerified,
            location: userData.location,
            type: 'traveler',
            travelDays: 0,
          },
          giftCount: 0,
          category: categoryObj,
        },
        isOwner: true,
      });
    },
    [navigation, userData],
  );

  const renderMomentCard = useCallback(
    ({ item }: { item: Moment }) => (
      <ProfileMomentCard
        moment={item}
        onPress={() => handleMomentPress(item)}
      />
    ),
    [handleMomentPress],
  );

  // Header button animation
  const settingsScale = useSharedValue(1);
  const shareScale = useSharedValue(1);

  const settingsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: settingsScale.value }],
  }));

  const shareAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shareScale.value }],
  }));

  const handleSettingsPress = () => {
    settingsScale.value = withSpring(0.9, PROFILE_SPRINGS.snappy);
    setTimeout(() => {
      settingsScale.value = withSpring(1, PROFILE_SPRINGS.bouncy);
    }, 100);
    handleSettings();
  };

  const handleSharePress = () => {
    shareScale.value = withSpring(0.9, PROFILE_SPRINGS.snappy);
    setTimeout(() => {
      shareScale.value = withSpring(1, PROFILE_SPRINGS.bouncy);
    }, 100);
    handleShare();
  };

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Offline Banner */}
        {!isConnected && (
          <OfflineState
            compact
            onRetry={refreshNetwork}
            message="İnternet bağlantısı yok"
          />
        )}

        {/* Premium Dark Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
          <View style={styles.headerActions}>
            <AnimatedTouchable
              testID="share-button"
              style={[styles.headerButton, shareAnimatedStyle]}
              onPress={handleSharePress}
              accessibilityLabel="Profili paylaş"
              accessibilityRole="button"
            >
              <Ionicons
                name="share-outline"
                size={22}
                color={PROFILE_COLORS.text.primary}
              />
            </AnimatedTouchable>
            <AnimatedTouchable
              testID="settings-button"
              style={[styles.headerButton, settingsAnimatedStyle]}
              onPress={handleSettingsPress}
              accessibilityLabel="Ayarlar"
              accessibilityRole="button"
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={PROFILE_COLORS.text.primary}
              />
            </AnimatedTouchable>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={myMomentsLoading}
              onRefresh={loadMyMoments}
              tintColor={PROFILE_COLORS.neon.lime}
              progressBackgroundColor={PROFILE_COLORS.background.secondary}
            />
          }
        >
          {/* Profile Info Section */}
          <ProfileHeaderSection
            avatarUrl={userData.avatarUrl}
            userName={userData.name}
            location={userData.location}
            isVerified={userData.isVerified}
            trustScore={userData.trustScore}
            onEditPress={handleEditProfile}
            onTrustGardenPress={handleTrustGarden}
          />

          {/* Stats Row */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.statsSection}
          >
            <GlassCard intensity={20} style={styles.statsCard} padding={0}>
              <StatsRow
                momentsCount={userData.momentsCount}
                exchangesCount={userData.exchangesCount}
                responseRate={userData.responseRate}
                onMomentsPress={handleMyMoments}
                onExchangesPress={handleMyGifts}
              />
            </GlassCard>
          </Animated.View>

          {/* Trust Constellation - WOW Factor */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>GÜVEN TAKIMYILDIZI</Text>
              <TouchableOpacity onPress={handleTrustGarden}>
                <Text style={styles.seeAllText}>Detaylar</Text>
              </TouchableOpacity>
            </View>
            <GlassCard intensity={15} style={styles.constellationCard}>
              <View style={styles.constellationContainer}>
                <TrustConstellation
                  score={userData.trustScore || 80}
                  milestones={[]}
                  size="lg"
                />
              </View>
              <View style={styles.trustLegend}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: PROFILE_COLORS.neon.lime },
                    ]}
                  />
                  <Text style={styles.legendText}>Yüksek</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: PROFILE_COLORS.neon.cyan },
                    ]}
                  />
                  <Text style={styles.legendText}>Orta</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: PROFILE_COLORS.neon.rose },
                    ]}
                  />
                  <Text style={styles.legendText}>Düşük</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Wallet Card */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <WalletCard
              balance={userData.walletBalance}
              onPress={handleWallet}
            />
          </Animated.View>

          {/* Quick Links */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <QuickLinks links={quickLinksData} />
          </Animated.View>

          {/* Moments Tabs */}
          <Animated.View
            entering={FadeInDown.delay(500).springify()}
            style={styles.momentsTabs}
          >
            <MomentsTabs
              activeTab={activeTab}
              activeMomentsCount={userData.activeMoments}
              pastMomentsCount={userData.completedMoments}
              onTabChange={setActiveTab}
            />
          </Animated.View>

          {/* Moments Grid */}
          <View style={styles.momentsGrid}>
            {myMomentsLoading && myMoments.length === 0 ? (
              <SkeletonList type="moment" count={4} />
            ) : displayedMoments.length > 0 ? (
              <FlashList
                data={displayedMoments}
                renderItem={renderMomentCard}
                numColumns={2}
                scrollEnabled={false}
                estimatedItemSize={180}
                ItemSeparatorComponent={() => (
                  <View style={styles.itemSeparator} />
                )}
              />
            ) : (
              <GlassCard intensity={10} style={styles.emptyCard}>
                <EmptyState
                  icon={activeTab === 'active' ? 'map-marker-plus' : 'history'}
                  title={
                    activeTab === 'active'
                      ? 'Henüz aktif moment yok'
                      : 'Geçmiş moment yok'
                  }
                  description={
                    activeTab === 'active'
                      ? 'İlk momentini oluşturarak yolculuğuna başla'
                      : 'Tamamlanan momentler burada görünecek'
                  }
                  actionLabel={
                    activeTab === 'active' && isConnected
                      ? 'Moment Oluştur'
                      : undefined
                  }
                  onAction={
                    activeTab === 'active' && isConnected
                      ? () => navigation.navigate('CreateMoment')
                      : undefined
                  }
                />
              </GlassCard>
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>

      <BottomNav activeTab="Profile" />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background.primary,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PROFILE_SPACING.screenPadding,
    paddingVertical: 12,
    backgroundColor: PROFILE_COLORS.background.primary,
  },
  headerTitle: {
    ...PROFILE_TYPOGRAPHY.pageTitle,
    color: PROFILE_COLORS.text.primary,
    fontSize: 28,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: PROFILE_COLORS.glass.backgroundMedium,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.glass.border,
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    marginHorizontal: PROFILE_SPACING.screenPadding,
    marginTop: 16,
  },
  statsCard: {
    borderColor: PROFILE_COLORS.glass.border,
  },

  // Section styling
  section: {
    marginHorizontal: PROFILE_SPACING.screenPadding,
    marginTop: PROFILE_SPACING.sectionGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...PROFILE_TYPOGRAPHY.sectionTitle,
    color: PROFILE_COLORS.text.secondary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: PROFILE_COLORS.neon.lime,
  },

  // Trust Constellation
  constellationCard: {
    alignItems: 'center',
    paddingVertical: 24,
    borderColor: PROFILE_COLORS.glass.border,
    ...Platform.select({
      ios: {
        shadowColor: PROFILE_COLORS.neon.lime,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {},
    }),
  },
  constellationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  trustLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: PROFILE_COLORS.glass.borderLight,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...PROFILE_TYPOGRAPHY.caption,
    color: PROFILE_COLORS.text.tertiary,
  },

  // Moments
  momentsTabs: {
    marginTop: PROFILE_SPACING.sectionGap,
  },
  momentsGrid: {
    paddingHorizontal: PROFILE_SPACING.screenPadding,
    paddingTop: 16,
  },
  itemSeparator: {
    height: 12,
  },
  emptyCard: {
    paddingVertical: 32,
    borderColor: PROFILE_COLORS.glass.border,
  },

  bottomSpacer: {
    height: 100,
  },
});

// Wrap with ErrorBoundary for profile screen
export default withErrorBoundary(ProfileScreen, {
  fallbackType: 'generic',
  displayName: 'ProfileScreen',
});
