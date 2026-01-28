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
  TouchableOpacity,
  RefreshControl,
  Share,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LiquidScreenWrapper } from '@/components/layout';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { useParallaxHeader } from '@/hooks/useParallaxHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui';
import { GlassCard } from '@/components/ui/GlassCard';
import { PROFILE_DEFAULTS } from '@/constants/defaultValues';
import {
  ProfileHeaderSection,
  StatsRow,
  QuickLinks,
  ProfileMomentCard,
  MomentsTabs,
} from '../components';
import { CreatorDashboard } from '../components/CreatorDashboard';
import { useAuth } from '@/context/AuthContext';
import { useMoments, type Moment } from '@/hooks/useMoments';
// TODO: Replace with proper subscription hook if needed
// import { useSubscription } from '@/features/payments';
import { userService } from '@/services/userService';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { UserProfile } from '@/services/userService';
import type { NavigationProp } from '@react-navigation/native';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { useNetworkStatus } from '../../../context/NetworkContext';
import { OfflineState } from '../../../components/OfflineState';
import { HapticManager } from '@/services/HapticManager';
import {
  PROFILE_COLORS,
  PROFILE_SPACING,
  PROFILE_TYPOGRAPHY,
  PROFILE_SPRINGS,
} from '../constants/theme';
import { TrustGardenView } from '@/components/TrustGardenView';
import { trustScoreService } from '@/services/TrustScoreService';

type UserTier = 'Free' | 'Pro' | 'Elite';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isConnected, refresh: refreshNetwork } = useNetworkStatus();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  // Parallax header configuration
  const {
    scrollHandler,
    headerStyle: _parallaxHeaderStyle,
    avatarStyle: parallaxAvatarStyle,
    titleStyle: parallaxTitleStyle,
    subtitleStyle: parallaxSubtitleStyle,
    contentStyle: parallaxContentStyle,
  } = useParallaxHeader({
    maxScroll: 200,
    avatarStartSize: 104,
    avatarEndSize: 32,
    headerMinHeight: 60,
    headerMaxHeight: 280,
  });

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

  // Get subscription tier (placeholder - implement proper subscription hook if needed)
  // const { subscription } = useSubscription();
  const subscriptionTier = 'free' as const;

  const [realTrustScore, setRealTrustScore] = useState(0);
  const [userTier, setUserTier] = useState<UserTier>('Free');
  const [balances, setBalances] = useState({ coins: 0, pending: 0 });

  const fetchBalances = useCallback(async () => {
    if (authUser?.id) {
      const { user: data } = await userService.getCurrentUser();
      if (data) {
        setBalances({
          coins: data.coinsBalance || 0,
          pending: data.pendingBalance || 0,
        });
      }
    }
  }, [authUser?.id]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  useEffect(() => {
    const fetchTrustInfo = async () => {
      if (authUser?.id) {
        const trustData = await trustScoreService.getTrustScore(authUser.id);
        if (trustData) {
          setRealTrustScore(trustData.totalScore);
          // Map trust level to UserTier
          const level = trustData.level;
          if (level === 'Ambassador' || level === 'Voyager') {
            setUserTier('Elite');
          } else if (level === 'Explorer' || level === 'Adventurer') {
            setUserTier('Pro');
          } else {
            setUserTier('Free');
          }
        }
      }
    };
    fetchTrustInfo();
  }, [authUser?.id]);

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
        activeMoments: myMoments.filter((m) =>
          ['active', 'paused', 'draft'].includes(m.status),
        ).length,
        completedMoments: myMoments.filter((m) => m.status === 'completed')
          .length,
        walletBalance: PROFILE_DEFAULTS.WALLET_BALANCE,
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
      activeMoments: 0,
      completedMoments: 0,
      walletBalance: 0,
      savedCount: 0,
    };
  }, [authUser, myMoments, userProfile]);

  // Navigation handlers with haptic feedback
  const handleEditProfile = useCallback(() => {
    HapticManager.buttonPress();
    navigation.navigate('EditProfile');
  }, [navigation]);

  const handleMyMoments = useCallback(() => {
    HapticManager.buttonPress();
    navigation.navigate('MyMoments');
  }, [navigation]);

  const handleTrustGarden = useCallback(() => {
    HapticManager.buttonPress();
    navigation.navigate('TrustGardenDetail');
  }, [navigation]);

  const handleSettings = useCallback(() => {
    HapticManager.buttonPress();
    navigation.navigate('AppSettings');
  }, [navigation]);

  const handleWallet = useCallback(() => {
    HapticManager.buttonPress();
    navigation.navigate('Wallet');
  }, [navigation]);

  const handleSavedMoments = useCallback(() => {
    HapticManager.buttonPress();
    navigation.navigate('SavedMoments');
  }, [navigation]);

  const handleSubscriptionPress = useCallback(() => {
    HapticManager.buttonPress();
    navigation.navigate('Subscription');
  }, [navigation]);

  const handleShare = useCallback(async () => {
    HapticManager.buttonPress();
    try {
      await Share.share({
        message: t('profile.shareMessage'),
        url: `https://www.lovendo.xyz/profile/${authUser?.id}`,
      });
    } catch (_error) {
      // User cancelled or share failed
    }
  }, [authUser?.id, t]);

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
        icon: 'bookmark-outline',
        color: PROFILE_COLORS.neon.violet,
        label: t('profile.savedMoments'),
        count: userData.savedCount,
        onPress: handleSavedMoments,
      },
    ],
    [userData.savedCount, handleSavedMoments, t],
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
            type: 'host',
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
    <LiquidScreenWrapper variant="twilight" safeAreaTop>
      <View style={styles.container}>
        {/* Offline Banner */}
        {!isConnected && (
          <OfflineState
            compact
            onRetry={refreshNetwork}
            message={t('profile.offlineTitle')}
          />
        )}

        {/* Premium Dark Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          <View style={styles.headerActions}>
            <AnimatedTouchable
              testID="share-button"
              style={[styles.headerButton, shareAnimatedStyle]}
              onPress={handleSharePress}
              accessibilityLabel={t('profile.shareProfile')}
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
              accessibilityLabel={t('settings.title')}
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

        <Animated.ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
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
            subscriptionTier={subscriptionTier}
            onEditPress={handleEditProfile}
            onTrustGardenPress={handleTrustGarden}
            onSubscriptionPress={handleSubscriptionPress}
            parallaxAvatarStyle={parallaxAvatarStyle}
            parallaxTitleStyle={parallaxTitleStyle}
            parallaxSubtitleStyle={parallaxSubtitleStyle}
            parallaxContentStyle={parallaxContentStyle}
          />

          {/* Unified Dashboard - Stats, Trust, Wallet */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.dashboardSection}
          >
            <GlassCard style={styles.dashboardCard} hasBorder>
              {/* Stats Row */}
              <StatsRow
                momentsCount={userData.momentsCount}
                activeMoments={userData.activeMoments}
                onMomentsPress={handleMyMoments}
              />

              {/* Creator Dashboard (Visible if user has earnings or is verified) */}
              {(balances.coins > 0 ||
                balances.pending > 0 ||
                userData.isVerified) && (
                <>
                  <View style={styles.dashboardDivider} />
                  <CreatorDashboard
                    balance={balances.coins}
                    pendingBalance={balances.pending}
                    onWithdraw={handleWallet}
                  />
                </>
              )}

              {/* Divider */}
              <View style={styles.dashboardDivider} />

              {/* Trust Garden */}
              <TrustGardenView
                score={realTrustScore}
                isVerified={userData.isVerified}
                tier={userTier}
              />

              {/* Divider */}
              <View style={styles.dashboardDivider} />

              {/* Wallet */}
              <TouchableOpacity
                onPress={handleWallet}
                activeOpacity={0.8}
                style={styles.dashboardItem}
              >
                <View style={styles.dashboardIconContainer}>
                  <Ionicons
                    name="wallet-outline"
                    size={20}
                    color={PROFILE_COLORS.neon.lime}
                  />
                </View>
                <View style={styles.dashboardItemText}>
                  <Text style={styles.dashboardItemTitle}>
                    {t('wallet.title')}
                  </Text>
                  <Text style={styles.dashboardItemSubtitle}>
                    {userData.walletBalance.toLocaleString('tr-TR')} TL
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={PROFILE_COLORS.text.tertiary}
                />
              </TouchableOpacity>
            </GlassCard>
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
                      ? t('profile.moments.noActive')
                      : t('profile.moments.noPast')
                  }
                  description={
                    activeTab === 'active'
                      ? t('profile.moments.createFirstDescription')
                      : t('profile.moments.completedDescription')
                  }
                  actionLabel={
                    activeTab === 'active' && isConnected
                      ? t('moments.createMoment')
                      : undefined
                  }
                  actionSize="xl"
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
        </Animated.ScrollView>
      </View>
    </LiquidScreenWrapper>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 20,
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

  // Unified Dashboard
  dashboardSection: {
    marginHorizontal: PROFILE_SPACING.screenPadding,
    marginTop: 10,
  },
  dashboardCard: {
    paddingVertical: 8,
  },
  dashboardDivider: {
    height: 1,
    backgroundColor: PROFILE_COLORS.glass.border,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  dashboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  dashboardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(223, 255, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardItemText: {
    flex: 1,
  },
  dashboardItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PROFILE_COLORS.text.primary,
    marginBottom: 2,
  },
  dashboardItemSubtitle: {
    fontSize: 12,
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
