import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProfileDetailScreenProps = StackScreenProps<
  RootStackParamList,
  'ProfileDetail'
>;

export const ProfileDetailScreen: React.FC<ProfileDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { userId } = route.params;
  const [activeTab, setActiveTab] = useState<'gestures' | 'moments' | 'proofs'>(
    'gestures',
  );

  // Mock user data - gerçek uygulamada API'den gelecek
  const user = {
    id: userId,
    name: 'Sarah Johnson',
    username: '@sarahtravels',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bio: 'Spreading kindness one gesture at a time ✨ Traveler • Coffee Lover • Kind Human',
    location: 'New York, USA',
    memberSince: 'Jan 2024',
    membershipTier: 'pro',
    isVerified: true,
    stats: {
      trustScore: 95,
      gesturesGiven: 47,
      gesturesReceived: 32,
      momentsCreated: 18,
      proofsVerified: 41,
    },
    interests: ['Travel', 'Coffee', 'Photography', 'Local Culture', 'Food'],
  };

  const recentGestures = [
    {
      id: '1',
      type: 'given',
      title: 'Coffee for a Stranger',
      amount: 5,
      date: '2 days ago',
      icon: 'coffee',
    },
    {
      id: '2',
      type: 'received',
      title: 'Museum Ticket',
      amount: 15,
      date: '5 days ago',
      icon: 'ticket',
    },
    {
      id: '3',
      type: 'given',
      title: 'Local Meal',
      amount: 12,
      date: '1 week ago',
      icon: 'food',
    },
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'vip':
        return COLORS.gold;
      case 'pro':
        return COLORS.purple;
      case 'starter':
        return COLORS.coral;
      default:
        return COLORS.textSecondary;
    }
  };

  const getTierLabel = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const handleChat = () => {
    navigation.navigate('Chat', {
      otherUser: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="dots-vertical" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            {user.isVerified && (
              <View style={styles.verifiedBadge}>
                <Icon name="check-decagram" size={24} color={COLORS.mint} />
              </View>
            )}
          </View>

          {/* User Info */}
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>{user.username}</Text>

          {/* Membership Badge */}
          <View
            style={[
              styles.membershipBadge,
              { backgroundColor: getTierColor(user.membershipTier) },
            ]}
          >
            <Icon name="crown" size={16} color={COLORS.white} />
            <Text style={styles.membershipText}>
              {getTierLabel(user.membershipTier)}
            </Text>
          </View>

          {/* Bio */}
          <Text style={styles.bio}>{user.bio}</Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <Icon name="map-marker" size={16} color={COLORS.textSecondary} />
            <Text style={styles.locationText}>{user.location}</Text>
            <Text style={styles.separator}>•</Text>
            <Icon name="calendar" size={16} color={COLORS.textSecondary} />
            <Text style={styles.locationText}>Joined {user.memberSince}</Text>
          </View>

          {/* Interests */}
          <View style={styles.interestsContainer}>
            {user.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={[COLORS.mint, COLORS.successDark]}
              style={styles.statGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="shield-star" size={32} color={COLORS.white} />
              <Text style={styles.statValue}>{user.stats.trustScore}</Text>
              <Text style={styles.statLabel}>Trust Score</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statBox,
                { backgroundColor: COLORS.coralTransparent },
              ]}
            >
              <Icon name="gift" size={28} color={COLORS.coral} />
              <Text style={[styles.statValue, { color: COLORS.coral }]}>
                {user.stats.gesturesGiven}
              </Text>
              <Text style={styles.statLabel}>Given</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statBox,
                { backgroundColor: COLORS.purpleTransparent },
              ]}
            >
              <Icon name="hand-heart" size={28} color={COLORS.purple} />
              <Text style={[styles.statValue, { color: COLORS.purple }]}>
                {user.stats.gesturesReceived}
              </Text>
              <Text style={styles.statLabel}>Received</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statBox,
                { backgroundColor: COLORS.mintTransparentLight },
              ]}
            >
              <Icon name="check-circle" size={28} color={COLORS.mint} />
              <Text style={[styles.statValue, { color: COLORS.mint }]}>
                {user.stats.proofsVerified}
              </Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'gestures' && styles.activeTab]}
            onPress={() => setActiveTab('gestures')}
          >
            <Icon
              name="gift-outline"
              size={20}
              color={
                activeTab === 'gestures' ? COLORS.mint : COLORS.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'gestures' && styles.activeTabText,
              ]}
            >
              Gestures
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'moments' && styles.activeTab]}
            onPress={() => setActiveTab('moments')}
          >
            <Icon
              name="calendar-star"
              size={20}
              color={
                activeTab === 'moments' ? COLORS.mint : COLORS.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'moments' && styles.activeTabText,
              ]}
            >
              Moments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'proofs' && styles.activeTab]}
            onPress={() => setActiveTab('proofs')}
          >
            <Icon
              name="check-decagram"
              size={20}
              color={
                activeTab === 'proofs' ? COLORS.mint : COLORS.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'proofs' && styles.activeTabText,
              ]}
            >
              Proofs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'gestures' && (
            <View style={styles.gesturesList}>
              {recentGestures.map((gesture) => (
                <View key={gesture.id} style={styles.gestureCard}>
                  <View
                    style={[
                      styles.gestureIcon,
                      {
                        backgroundColor:
                          gesture.type === 'given'
                            ? COLORS.coralTransparent
                            : COLORS.mintTransparentLight,
                      },
                    ]}
                  >
                    <Icon
                      name={gesture.icon}
                      size={24}
                      color={
                        gesture.type === 'given' ? COLORS.coral : COLORS.mint
                      }
                    />
                  </View>
                  <View style={styles.gestureInfo}>
                    <Text style={styles.gestureTitle}>{gesture.title}</Text>
                    <Text style={styles.gestureDate}>{gesture.date}</Text>
                  </View>
                  <View style={styles.gestureAmount}>
                    <Text
                      style={[
                        styles.amountText,
                        {
                          color:
                            gesture.type === 'given'
                              ? COLORS.coral
                              : COLORS.mint,
                        },
                      ]}
                    >
                      {gesture.type === 'given' ? '-' : '+'}${gesture.amount}
                    </Text>
                    <Text style={styles.gestureType}>
                      {gesture.type === 'given' ? 'Given' : 'Received'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'moments' && (
            <View style={styles.emptyState}>
              <Icon name="calendar-star" size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>No moments yet</Text>
            </View>
          )}

          {activeTab === 'proofs' && (
            <View style={styles.emptyState}>
              <Icon name="check-decagram" size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>No proofs to display</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={handleChat}
          activeOpacity={0.8}
        >
          <Icon name="message-text" size={20} color={COLORS.white} />
          <Text style={styles.chatButtonText}>Send Message</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  activeTab: {
    borderBottomColor: COLORS.mint,
  },
  activeTabText: {
    color: COLORS.mint,
  },
  amountText: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  avatar: {
    borderColor: COLORS.white,
    borderRadius: 50,
    borderWidth: 3,
    height: 100,
    width: 100,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  bio: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  bottomActions: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.lightGray,
    borderTopWidth: 1,
    padding: 16,
    paddingBottom: 32,
  },
  chatButton: {
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  chatButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  gestureAmount: {
    alignItems: 'flex-end',
  },
  gestureCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    flexDirection: 'row',
    padding: 16,
    ...VALUES.shadow,
  },
  gestureDate: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  gestureIcon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  gestureInfo: {
    flex: 1,
    marginLeft: 12,
  },
  gestureTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  gestureType: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  gesturesList: {
    gap: 12,
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.lightGray,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  interestTag: {
    backgroundColor: COLORS.gray,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  interestText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  membershipBadge: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  membershipText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  moreButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  name: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 24,
  },
  separator: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  statBox: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
  },
  statCard: {
    width: (SCREEN_WIDTH - 44) / 2,
  },
  statGradient: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
  },
  statLabel: {
    color: COLORS.white,
    fontSize: 13,
    marginTop: 4,
    opacity: 0.9,
  },
  statValue: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
  },
  tab: {
    alignItems: 'center',
    borderBottomColor: COLORS.transparent,
    borderBottomWidth: 2,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  tabs: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  username: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: 12,
  },
  verifiedBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    bottom: 0,
    position: 'absolute',
    right: 0,
  },
});
