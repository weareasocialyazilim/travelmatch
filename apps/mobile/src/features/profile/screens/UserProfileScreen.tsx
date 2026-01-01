import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/SkeletonList';
import { COLORS } from '@/constants/colors';
import { useProfile } from '../hooks/useProfile';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

type UserProfileRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StatItemProps {
  value: number | string;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<UserProfileRouteProp>();
  const [refreshing, setRefreshing] = useState(false);

  const { userId } = route.params;
  const { profile, isLoading, error, refresh } = useProfile(userId);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const handleMessage = useCallback(() => {
    if (!profile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Chat', {
      otherUser: {
        id: profile.id,
        name: profile.name,
        avatarUrl: profile.avatar,
        isOnline: profile.isOnline || false,
      },
    });
  }, [navigation, profile]);

  const handleSendGift = useCallback(() => {
    if (!profile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('UnifiedGiftFlow', {
      recipientId: profile.id,
      recipientName: profile.name,
    });
  }, [navigation, profile]);

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
        </View>
        <SkeletonList count={6} />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
        </View>
        <EmptyState
          icon="account-off-outline"
          title="Profile not found"
          description="This user may no longer exist"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.brand.primary}
          />
        }
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={24}
              color={COLORS.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: profile.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
            {profile.isVerified && (
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={24}
                  color="#3B82F6"
                />
              </View>
            )}
          </View>

          <Text style={styles.userName}>{profile.name}</Text>
          {profile.location && (
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={16}
                color={COLORS.text.secondary}
              />
              <Text style={styles.locationText}>
                {profile.location.city}, {profile.location.country}
              </Text>
            </View>
          )}

          {/* Trust Score */}
          <View style={styles.trustScoreContainer}>
            <MaterialCommunityIcons
              name="shield-check"
              size={18}
              color="#22C55E"
            />
            <Text style={styles.trustScoreText}>
              {profile.trustScore || profile.rating || 0}% Trust Score
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatItem value={profile.momentCount || 0} label="Moments" />
          <View style={styles.statDivider} />
          <StatItem
            value={(profile.giftsSent || 0) + (profile.giftsReceived || 0)}
            label="Exchanges"
          />
          <View style={styles.statDivider} />
          <StatItem value={profile.rating || 0} label="Rating" />
        </View>

        {/* Bio */}
        {profile.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleMessage}
          >
            <MaterialCommunityIcons
              name="chat-outline"
              size={20}
              color={COLORS.brand.primary}
            />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.giftButton} onPress={handleSendGift}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.giftButtonGradient}
            >
              <MaterialCommunityIcons
                name="gift-outline"
                size={20}
                color="#fff"
              />
              <Text style={styles.giftButtonText}>Send Gift</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Moments Preview */}
        <View style={styles.momentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Moments</Text>
            {(profile.moments?.length || 0) > 3 && (
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {!profile.moments || profile.moments.length === 0 ? (
            <View style={styles.emptyMoments}>
              <MaterialCommunityIcons
                name="image-outline"
                size={40}
                color={COLORS.text.muted}
              />
              <Text style={styles.emptyMomentsText}>No moments yet</Text>
            </View>
          ) : (
            <View style={styles.momentsGrid}>
              {profile.moments.slice(0, 6).map((moment, index) => (
                <TouchableOpacity
                  key={moment.id || index}
                  style={styles.momentThumbnail}
                  onPress={() =>
                    navigation.navigate('MomentDetail', {
                      moment,
                      isOwner: false,
                    })
                  }
                >
                  <Image
                    source={{ uri: moment.images?.[0] || moment.thumbnail }}
                    style={styles.momentImage}
                    contentFit="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
          </View>
          <View style={styles.reviewsSummary}>
            <Text style={styles.reviewsAverage}>
              {profile.rating?.toFixed(1) || '0.0'}
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <MaterialCommunityIcons
                  key={star}
                  name={star <= (profile.rating || 0) ? 'star' : 'star-outline'}
                  size={16}
                  color="#FBBF24"
                />
              ))}
            </View>
            <Text style={styles.reviewsCount}>
              {profile.reviewCount || 0} reviews
            </Text>
          </View>
        </View>

        {/* Report/Block Actions */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() =>
              navigation.navigate('ReportUser', { userId: profile.id })
            }
          >
            <MaterialCommunityIcons
              name="flag-outline"
              size={18}
              color={COLORS.text.muted}
            />
            <Text style={styles.reportText}>Report User</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backButton: {
    padding: 4,
  },
  moreButton: {
    padding: 8,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background.secondary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    padding: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  trustScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  trustScoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22C55E',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 16,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.text.muted,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border.default,
  },
  bioSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  bioText: {
    fontSize: 15,
    color: COLORS.text.secondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.brand.primary,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.brand.primary,
  },
  giftButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  giftButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  giftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  momentsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.brand.primary,
    fontWeight: '500',
  },
  emptyMoments: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyMomentsText: {
    fontSize: 14,
    color: COLORS.text.muted,
  },
  momentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  momentThumbnail: {
    width: (SCREEN_WIDTH - 40) / 3,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  momentImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background.secondary,
  },
  reviewsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  reviewsSummary: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
  },
  reviewsAverage: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  reviewsCount: {
    fontSize: 14,
    color: COLORS.text.muted,
  },
  footerActions: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  reportText: {
    fontSize: 14,
    color: COLORS.text.muted,
  },
});

export default withErrorBoundary(UserProfileScreen, 'UserProfileScreen');
