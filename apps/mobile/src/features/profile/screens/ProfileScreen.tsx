// @ts-nocheck - TODO: Fix type errors
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui/EmptyState';
import BottomNav from '@/components/BottomNav';
import {
  ProfileHeaderSection,
  StatsRow,
  WalletCard,
  QuickLinks,
  ProfileMomentCard,
  MomentsTabs,
} from '@/components/profile';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { useMoments } from '@/hooks/useMoments';
import { userService } from '@/services/userService';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { UserProfile } from '@/services/userService';
import type { Moment } from '../types';
import type { NavigationProp } from '@react-navigation/native';
import { withErrorBoundary } from '../../../components/withErrorBoundary';
import { useNetworkStatus } from '../../../context/NetworkContext';
import { OfflineState } from '../../../components/OfflineState';

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
        momentsCount: myMoments.length || userProfile?.momentCount || 0,
        exchangesCount:
          (userProfile?.giftsSent || 0) + (userProfile?.giftsReceived || 0),
        responseRate: 100, // TODO: Calculate response rate
        activeMoments: myMoments.filter((m) =>
          ['active', 'paused', 'draft'].includes(m.status),
        ).length,
        completedMoments: myMoments.filter((m) => m.status === 'completed')
          .length,
        walletBalance: 0, // TODO: Fetch wallet balance
        giftsSentCount: userProfile?.giftsSent || 0,
        savedCount: 0, // TODO: Fetch saved count
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

  // Navigation handlers - wrapped in useCallback to prevent re-renders
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
  const handleWallet = useCallback(() => navigation.navigate('Wallet'), [navigation]);
  const handleMyGifts = useCallback(
    () => navigation.navigate('MyGifts'),
    [navigation],
  );
  const handleSavedMoments = useCallback(
    () => navigation.navigate('SavedMoments'),
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
        color: COLORS.softOrange,
        label: 'Gifts Sent',
        count: userData.giftsSentCount,
        onPress: handleMyGifts,
      },
      {
        icon: 'bookmark-outline',
        color: COLORS.coral,
        label: 'Saved Moments',
        count: userData.savedCount,
        onPress: handleSavedMoments,
      },
    ],
    [userData.giftsSentCount, userData.savedCount, handleMyGifts, handleSavedMoments],
  );

  const handleMomentPress = useCallback(
    (moment: Moment) => {
      const locationStr =
        typeof moment.location === 'string'
          ? moment.location
          : `${moment.location?.city || ''}, ${moment.location?.country || ''}`;

      navigation.navigate('MomentDetail', {
        moment: {
          ...moment,
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
          category: {
            id: moment.category,
            label: moment.category,
            emoji: '✨',
          },
        },
        isOwner: true,
      });
    },
    [navigation, userData],
  );

  const renderMomentCard = useCallback(
    ({ item }: { item: Moment }) => (
      <ProfileMomentCard moment={item} onPress={() => handleMomentPress(item)} />
    ),
    [handleMomentPress],
  );

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
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleEditProfile}
              accessibilityLabel="Edit profile"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={22}
                color={COLORS.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleSettings}
              accessibilityLabel="Settings"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="cog-outline"
                size={22}
                color={COLORS.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={myMomentsLoading}
              onRefresh={loadMyMoments}
              tintColor={COLORS.coral}
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
            onAvatarPress={handleEditProfile}
            onTrustGardenPress={handleTrustGarden}
          />

          {/* Stats Row */}
          <View style={styles.profileSection}>
            <StatsRow
              momentsCount={userData.momentsCount}
              exchangesCount={userData.exchangesCount}
              responseRate={userData.responseRate}
              onMomentsPress={handleMyMoments}
              onExchangesPress={handleMyGifts}
            />
          </View>

          {/* Wallet Card */}
          <WalletCard balance={userData.walletBalance} onPress={handleWallet} />

          {/* Quick Links */}
          <QuickLinks links={quickLinksData} />

          {/* Moments Tabs */}
          <MomentsTabs
            activeTab={activeTab}
            activeMomentsCount={userData.activeMoments}
            pastMomentsCount={userData.completedMoments}
            onTabChange={setActiveTab}
          />

          {/* Moments Grid */}
          <View style={styles.momentsGrid}>
            {myMomentsLoading && myMoments.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.coral} />
              </View>
            ) : displayedMoments.length > 0 ? (
              <FlatList
                data={displayedMoments}
                renderItem={renderMomentCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={styles.momentRow}
                contentContainerStyle={styles.momentsContent}
              />
            ) : (
              <EmptyState
                icon={activeTab === 'active' ? 'map-marker-plus' : 'history'}
                title={
                  activeTab === 'active'
                    ? 'No active moments yet'
                    : 'No past moments'
                }
                description={
                  activeTab === 'active'
                    ? 'Create your first moment to start your journey'
                    : 'Completed moments will appear here'
                }
                actionLabel={
                  activeTab === 'active' && isConnected ? 'Create Moment' : undefined
                }
                onAction={
                  activeTab === 'active' && isConnected
                    ? () => navigation.navigate('CreateMoment')
                    : undefined
                }
              />
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
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  headerSpacer: {
    width: 80,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },

  // Profile Section - Reused for stats row wrapper
  profileSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  // Moments Grid
  momentsGrid: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  momentsContent: {
    gap: 12,
  },
  momentRow: {
    gap: 12,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 16,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.mint,
    borderRadius: 20,
  },
  createButtonDisabled: {
    backgroundColor: COLORS.softGray,
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },

  bottomSpacer: {
    height: 100,
  },
});

// Wrap with ErrorBoundary for profile screen
export default withErrorBoundary(ProfileScreen, { 
  fallbackType: 'generic',
  displayName: 'ProfileScreen' 
});
