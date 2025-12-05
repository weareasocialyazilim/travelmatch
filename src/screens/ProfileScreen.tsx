import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import BottomNav from '../components/BottomNav';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import {
  CURRENT_USER,
  isVerified as checkIsVerified,
  getProofScore,
} from '../mocks/currentUser';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AVATAR_SIZE = 90;
const MOMENT_CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// Mock moments data - user's own moments
const MOCK_MOMENTS = [
  {
    id: '1',
    title: 'Coffee Tour',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    price: 25,
    isActive: true,
    location: 'Istanbul, Turkey',
  },
  {
    id: '2',
    title: 'Street Food Walk',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    price: 40,
    isActive: true,
    location: 'Bangkok, Thailand',
  },
  {
    id: '3',
    title: 'Art Gallery Visit',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    price: 30,
    isActive: true,
    location: 'Paris, France',
  },
  {
    id: '4',
    title: 'Jazz Night',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    price: 35,
    isActive: false,
    location: 'New Orleans, USA',
  },
  {
    id: '5',
    title: 'Wine Tasting',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
    price: 55,
    isActive: false,
    location: 'Napa Valley, USA',
  },
];

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  // Get user from auth context, fallback to mock
  const { user: authUser, isLoading: _authLoading } = useAuth();

  // User data - merge auth user with mock data for complete profile
  const userData = useMemo(() => {
    if (authUser) {
      // Use auth user data with fallbacks from mock
      const authUserAny = authUser as unknown as Record<string, unknown>;
      return {
        name: authUser.name || CURRENT_USER.name,
        avatarUrl:
          (authUserAny.profilePhoto as string) ||
          (authUserAny.avatarUrl as string) ||
          CURRENT_USER.avatarUrl,
        isVerified:
          authUser.kyc === 'Verified' || checkIsVerified(CURRENT_USER),
        location:
          typeof authUser.location === 'string'
            ? authUser.location
            : (authUser.location as { city?: string })?.city ||
              CURRENT_USER.location,
        trustScore: getProofScore(CURRENT_USER), // Will be from API later
        momentsCount: CURRENT_USER.momentsCount,
        exchangesCount: CURRENT_USER.exchangesCount,
        responseRate: CURRENT_USER.responseRate,
        activeMoments: CURRENT_USER.activeMoments,
        completedMoments: CURRENT_USER.completedMoments,
        walletBalance: CURRENT_USER.walletBalance,
        giftsSentCount: CURRENT_USER.giftsSentCount,
        savedCount: CURRENT_USER.savedCount,
      };
    }

    // Fallback to mock data
    return {
      name: CURRENT_USER.name,
      avatarUrl: CURRENT_USER.avatarUrl,
      isVerified: checkIsVerified(CURRENT_USER),
      location: CURRENT_USER.location,
      trustScore: getProofScore(CURRENT_USER),
      momentsCount: CURRENT_USER.momentsCount,
      exchangesCount: CURRENT_USER.exchangesCount,
      responseRate: CURRENT_USER.responseRate,
      activeMoments: CURRENT_USER.activeMoments,
      completedMoments: CURRENT_USER.completedMoments,
      walletBalance: CURRENT_USER.walletBalance,
      giftsSentCount: CURRENT_USER.giftsSentCount,
      savedCount: CURRENT_USER.savedCount,
    };
  }, [authUser]);

  // Navigation handlers
  const handleEditProfile = () => navigation.navigate('EditProfile');
  const handleMyMoments = () => navigation.navigate('MyMoments');
  const handleTrustGarden = () => navigation.navigate('TrustGardenDetail');
  const handleSettings = () => navigation.navigate('AppSettings');
  const handleWallet = () => navigation.navigate('Wallet');
  const handleMyGifts = () => navigation.navigate('MyGifts');
  const handleSavedMoments = () => navigation.navigate('SavedMoments');

  const activeMoments = MOCK_MOMENTS.filter((m) => m.isActive);
  const pastMoments = MOCK_MOMENTS.filter((m) => !m.isActive);
  const displayedMoments = activeTab === 'active' ? activeMoments : pastMoments;

  const renderMomentCard = ({ item }: { item: (typeof MOCK_MOMENTS)[0] }) => (
    <TouchableOpacity
      style={styles.momentCard}
      activeOpacity={0.8}
      accessibilityLabel={`${item.title}, $${item.price}`}
      accessibilityRole="button"
      accessibilityHint="Opens moment details"
      onPress={() =>
        navigation.navigate('MomentDetail', {
          moment: {
            id: item.id,
            title: item.title,
            imageUrl: item.image,
            image: item.image,
            price: item.price,
            story: `Experience ${item.title} - a unique local moment curated by you.`,
            availability: item.isActive ? 'Available' : 'Completed',
            status: item.isActive ? 'active' : 'completed',
            location: {
              name: item.location,
              city: item.location.split(', ')[0],
              country: item.location.split(', ')[1] || '',
            },
            user: {
              id: 'current-user',
              name: userData.name,
              avatar: userData.avatarUrl,
              isVerified: userData.isVerified,
              location: userData.location,
            },
          },
          isOwner: true, // This is the user's own moment
        })
      }
    >
      <Image source={{ uri: item.image }} style={styles.momentImage} />
      <View style={styles.momentInfo}>
        <Text style={styles.momentTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.momentPrice}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={['top']}>
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
        >
          {/* Profile Info Section */}
          <View style={styles.profileSection}>
            {/* Avatar */}
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={handleEditProfile}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: userData.avatarUrl }}
                style={styles.avatar}
              />
              {userData.isVerified && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={22}
                    color={COLORS.mint}
                  />
                </View>
              )}
            </TouchableOpacity>

            {/* Name & Location */}
            <Text style={styles.userName}>{userData.name}</Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.locationText}>{userData.location}</Text>
            </View>

            {/* ProofScore Badge */}
            <TouchableOpacity
              style={styles.proofScoreBadge}
              onPress={handleTrustGarden}
              accessibilityLabel={`ProofScore ${userData.trustScore} percent. Tap to view Trust Garden`}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="shield-check"
                size={16}
                color={COLORS.mint}
              />
              <Text style={styles.proofScoreText}>
                ProofScore {userData.trustScore}%
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={COLORS.mint}
              />
            </TouchableOpacity>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={handleMyMoments}
                accessibilityLabel={`${userData.momentsCount} Moments. Tap to view`}
                accessibilityRole="button"
              >
                <Text style={styles.statNumber}>{userData.momentsCount}</Text>
                <Text style={styles.statLabel}>Moments</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity
                style={styles.statItem}
                onPress={handleMyGifts}
                accessibilityLabel={`${userData.exchangesCount} Exchanges. Tap to view`}
                accessibilityRole="button"
              >
                <Text style={styles.statNumber}>{userData.exchangesCount}</Text>
                <Text style={styles.statLabel}>Exchanges</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData.responseRate}%</Text>
                <Text style={styles.statLabel}>Response</Text>
              </View>
            </View>
          </View>

          {/* Wallet Card */}
          <TouchableOpacity
            style={styles.walletCard}
            onPress={handleWallet}
            accessibilityLabel={`Wallet balance $${userData.walletBalance.toFixed(
              2,
            )}. Tap to manage`}
            accessibilityRole="button"
          >
            <View style={styles.walletLeft}>
              <View style={styles.walletIconWrapper}>
                <MaterialCommunityIcons
                  name="wallet"
                  size={24}
                  color={COLORS.mint}
                />
              </View>
              <View>
                <Text style={styles.walletLabel}>Wallet</Text>
                <Text style={styles.walletBalance}>
                  ${userData.walletBalance.toFixed(2)}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>

          {/* Quick Links */}
          <View style={styles.quickLinks}>
            <TouchableOpacity
              style={styles.quickLink}
              onPress={handleMyGifts}
              accessibilityLabel={`Gifts Sent: ${userData.giftsSentCount}. Tap to view`}
              accessibilityRole="button"
            >
              <View style={styles.quickLinkLeft}>
                <MaterialCommunityIcons
                  name="gift-outline"
                  size={22}
                  color={COLORS.softOrange}
                />
                <Text style={styles.quickLinkText}>Gifts Sent</Text>
              </View>
              <View style={styles.quickLinkRight}>
                <Text style={styles.quickLinkCount}>
                  {userData.giftsSentCount}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </View>
            </TouchableOpacity>
            <View style={styles.quickLinkDivider} />
            <TouchableOpacity
              style={styles.quickLink}
              onPress={handleSavedMoments}
              accessibilityLabel={`Saved Moments: ${userData.savedCount}. Tap to view`}
              accessibilityRole="button"
            >
              <View style={styles.quickLinkLeft}>
                <MaterialCommunityIcons
                  name="bookmark-outline"
                  size={22}
                  color={COLORS.coral}
                />
                <Text style={styles.quickLinkText}>Saved Moments</Text>
              </View>
              <View style={styles.quickLinkRight}>
                <Text style={styles.quickLinkCount}>{userData.savedCount}</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Moments Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'active' && styles.tabActive]}
              onPress={() => setActiveTab('active')}
              accessibilityLabel="Active Moments tab"
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'active' }}
            >
              <MaterialCommunityIcons
                name="map-marker-star"
                size={18}
                color={
                  activeTab === 'active' ? COLORS.mint : COLORS.textSecondary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'active' && styles.tabTextActive,
                ]}
              >
                Active ({userData.activeMoments})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'past' && styles.tabActive]}
              onPress={() => setActiveTab('past')}
              accessibilityLabel="Past Moments tab"
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'past' }}
            >
              <MaterialCommunityIcons
                name="history"
                size={18}
                color={
                  activeTab === 'past' ? COLORS.mint : COLORS.textSecondary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'past' && styles.tabTextActive,
                ]}
              >
                Past ({userData.completedMoments})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Moments Grid */}
          <View style={styles.momentsGrid}>
            {displayedMoments.length > 0 ? (
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
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name={activeTab === 'active' ? 'map-marker-plus' : 'history'}
                  size={48}
                  color={COLORS.softGray}
                />
                <Text style={styles.emptyText}>
                  {activeTab === 'active'
                    ? 'No active moments yet'
                    : 'No past moments'}
                </Text>
                {activeTab === 'active' && (
                  <TouchableOpacity style={styles.createButton}>
                    <Text style={styles.createButtonText}>Create Moment</Text>
                  </TouchableOpacity>
                )}
              </View>
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

  // Profile Section
  profileSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  proofScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.mintTransparent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  proofScoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mint,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },

  // Wallet Card
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.mintTransparent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  walletBalance: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Quick Links
  quickLinks: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  quickLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickLinkText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  quickLinkRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickLinkCount: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  quickLinkDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 50,
  }, // Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.mint,
    fontWeight: '600',
  },

  // Moments Grid
  momentsGrid: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  momentsContent: {
    gap: 12,
  },
  momentRow: {
    gap: 12,
  },
  momentCard: {
    width: MOMENT_CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  momentImage: {
    width: '100%',
    height: 120,
  },
  momentInfo: {
    padding: 12,
  },
  momentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  momentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.mint,
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
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },

  bottomSpacer: {
    height: 100,
  },
});

export default ProfileScreen;
