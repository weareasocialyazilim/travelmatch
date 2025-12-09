import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReportBlockBottomSheet } from '../components/ReportBlockBottomSheet';
import { COLORS } from '../constants/colors';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';

const { width: _SCREEN_WIDTH } = Dimensions.get('window');

type ProfileDetailScreenProps = StackScreenProps<
  RootStackParamList,
  'ProfileDetail'
>;

export const ProfileDetailScreen: React.FC<ProfileDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { userId } = route.params;
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [showReportSheet, setShowReportSheet] = useState(false);

  // Mock user data based on userId - Only PUBLIC info shown
  const getUserData = (id: string) => {
    if (id === 'user-jessica') {
      return {
        id,
        name: 'Jessica Chen',
        role: 'Traveler',
        location: 'Paris, France',
        avatar:
          'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
        headerImage:
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
        isVerified: true,
        proofScore: 9.5,
        successfulExchanges: 12,
        isFastResponder: true,
      };
    }
    // Default user (Alexandra)
    return {
      id,
      name: 'Alexandra Adams',
      role: 'Traveler',
      location: 'San Francisco, CA',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      headerImage:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      isVerified: true,
      proofScore: 9.8,
      successfulExchanges: 18,
      isFastResponder: true,
    };
  };

  const user = getUserData(userId);

  // Mock moments data (simplified for profile view, not full Moment type)
  interface ProfileMoment {
    id: string;
    title: string;
    location: string;
    price: string;
    image: string;
    status: string;
    creator: {
      id: string;
      name: string;
      avatar: string;
      proofScore: number;
    };
  }

  const userMoments: ProfileMoment[] = [
    {
      id: 'moment-1',
      title: 'Sunset at the Beach',
      location: 'Malibu, California',
      price: '$25',
      image:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      status: 'active',
      creator: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        proofScore: user.proofScore,
      },
    },
    {
      id: 'moment-2',
      title: 'Morning Coffee Ritual',
      location: 'Paris, France',
      price: '$15',
      image:
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
      status: 'active',
      creator: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        proofScore: user.proofScore,
      },
    },
  ];

  const pastMoments: ProfileMoment[] = [
    {
      id: 'moment-3',
      title: 'Mountain Hike Adventure',
      location: 'Swiss Alps',
      price: '$40',
      image:
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
      status: 'completed',
      creator: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        proofScore: user.proofScore,
      },
    },
  ];

  const handleMomentPress = (moment: ProfileMoment) => {
    // Navigate to MomentDetail with full moment data
    navigation.navigate('MomentDetail', {
      moment: {
        id: moment.id,
        title: moment.title,
        story: moment.title, // Use title as story for simplified data
        imageUrl: moment.image,
        price: parseInt(moment.price?.replace('$', '') || '0') || 0,
        availability: 'Available',
        location: {
          name: moment.location || 'Unknown Location',
          city: moment.location?.split(', ')[0] || 'Unknown City',
          country: moment.location?.split(', ')[1] || 'Unknown Country',
        },
        user: {
          id: moment.creator?.id || 'unknown',
          name: moment.creator?.name || 'Anonymous',
          avatar: moment.creator?.avatar || 'https://via.placeholder.com/150',
        },
        status:
          (moment.status as 'active' | 'pending' | 'completed') || 'active',
      },
    });
  };

  const handleGift = () => {
    // Navigate to gift flow
  };

  const handleReportAction = (
    action: string,
    reason?: string,
    details?: string,
  ) => {
    if (action === 'report') {
      Alert.alert(
        'Report Submitted',
        `Thank you for reporting. We'll review this profile.\n\nReason: ${
          reason ?? 'Not specified'
        }${details ? `\nDetails: ${details}` : ''}`,
        [{ text: 'OK' }],
      );
    } else if (action === 'block') {
      Alert.alert(
        'User Blocked',
        `You have blocked ${user.name}. You won't see their content anymore.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setShowReportSheet(true)}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image */}
        <View style={styles.headerImageContainer}>
          <Image
            source={{ uri: user.headerImage }}
            style={styles.headerImage}
            resizeMode="cover"
          />
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.role}>
              {user.role} • {user.isVerified ? 'Verified' : 'Not Verified'} •{' '}
              {user.location}
            </Text>
          </View>
          <TouchableOpacity style={styles.proofScoreBadge}>
            <Text style={styles.proofScoreText}>
              ProofScore: {user.proofScore}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Public Badges - Only non-private info */}
        <View style={styles.badgesContainer}>
          <View style={styles.badge}>
            <MaterialCommunityIcons
              name="handshake"
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.badgeText}>
              {user.successfulExchanges} successful exchanges
            </Text>
          </View>
          {user.isFastResponder && (
            <View style={styles.badge}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={16}
                color={COLORS.warning}
              />
              <Text style={styles.badgeText}>Fast responder</Text>
            </View>
          )}
        </View>

        {/* Segmented Buttons */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeTab === 'active' && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveTab('active')}
          >
            <Text
              style={[
                styles.segmentButtonText,
                activeTab === 'active' && styles.segmentButtonTextActive,
              ]}
            >
              Active moments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeTab === 'past' && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveTab('past')}
          >
            <Text
              style={[
                styles.segmentButtonText,
                activeTab === 'past' && styles.segmentButtonTextActive,
              ]}
            >
              Past
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Moments */}
        {activeTab === 'active' && userMoments.length > 0 && (
          <View style={styles.momentsGrid}>
            {userMoments.map((moment) => (
              <TouchableOpacity
                key={moment.id}
                style={styles.momentCard}
                onPress={() => handleMomentPress(moment)}
              >
                <Image
                  source={{ uri: moment.image }}
                  style={styles.momentImage}
                  resizeMode="cover"
                />
                <View style={styles.momentOverlay}>
                  <Text style={styles.momentTitle} numberOfLines={1}>
                    {moment.title}
                  </Text>
                  <Text style={styles.momentLocation} numberOfLines={1}>
                    {moment.location}
                  </Text>
                  <Text style={styles.momentPrice}>{moment.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State for Active */}
        {activeTab === 'active' && userMoments.length === 0 && (
          <EmptyState
            icon="compass-outline"
            title="No active moments yet"
            description={`Check back soon to support ${user.name.split(' ')[0]}'s next adventure!`}
          />
        )}

        {/* Past Moments */}
        {activeTab === 'past' && pastMoments.length > 0 && (
          <View style={styles.momentsGrid}>
            {pastMoments.map((moment) => (
              <TouchableOpacity
                key={moment.id}
                style={styles.momentCard}
                onPress={() => handleMomentPress(moment)}
              >
                <Image
                  source={{ uri: moment.image }}
                  style={styles.momentImage}
                  resizeMode="cover"
                />
                <View style={styles.momentOverlay}>
                  <Text style={styles.momentTitle} numberOfLines={1}>
                    {moment.title}
                  </Text>
                  <Text style={styles.momentLocation} numberOfLines={1}>
                    {moment.location}
                  </Text>
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State for Past */}
        {activeTab === 'past' && pastMoments.length === 0 && (
          <EmptyState
            icon="history"
            title="No past moments"
            description="Completed moments will appear here"
          />
        )}

        {/* Bottom padding for sticky bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.giftButton} onPress={handleGift}>
          <Text style={styles.giftButtonText}>Gift this user</Text>
        </TouchableOpacity>
      </View>

      {/* Report/Block Bottom Sheet */}
      <ReportBlockBottomSheet
        visible={showReportSheet}
        onClose={() => setShowReportSheet(false)}
        onSubmit={handleReportAction}
        targetType="user"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.15,
  },
  moreButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  headerImageContainer: {
    width: '100%',
    height: 218,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: -64,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: COLORS.background,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: -0.15,
  },
  role: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  proofScoreBadge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.mintTransparent,
    borderRadius: 9999,
  },
  proofScoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.15,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 4,
    backgroundColor: COLORS.border,
    borderRadius: 9999,
    height: 40,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    paddingHorizontal: 8,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.background,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  segmentButtonTextActive: {
    color: COLORS.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTextContainer: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  momentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  momentCard: {
    width: '48%',
    aspectRatio: 0.75,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  momentImage: {
    width: '100%',
    height: '100%',
  },
  momentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: COLORS.overlay50,
  },
  momentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 2,
  },
  momentLocation: {
    fontSize: 12,
    color: COLORS.textWhite80,
    marginBottom: 4,
  },
  momentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  completedBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  completedText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  bottomPadding: {
    height: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  giftButton: {
    flex: 1,
    height: 48,
    borderRadius: 9999,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
});
