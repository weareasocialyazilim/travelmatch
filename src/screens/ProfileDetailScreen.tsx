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
import { LAYOUT } from '../constants/layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ProfileDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { userId } = route.params;
  const [activeTab, setActiveTab] = useState<'gestures' | 'moments' | 'proofs'>('gestures');

  // Mock user data - gerçek uygulamada API'den gelecek
  const user = {
    id: userId,
    name: 'Sarah Johnson',
    username: '@sarahtravels',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
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
        return '#FFD700';
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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
          <View style={[styles.membershipBadge, { backgroundColor: getTierColor(user.membershipTier) }]}>
            <Icon name="crown" size={16} color={COLORS.white} />
            <Text style={styles.membershipText}>{getTierLabel(user.membershipTier)}</Text>
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
              colors={[COLORS.mint, '#00D084']}
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
            <View style={[styles.statBox, { backgroundColor: COLORS.coral + '15' }]}>
              <Icon name="gift" size={28} color={COLORS.coral} />
              <Text style={[styles.statValue, { color: COLORS.coral }]}>
                {user.stats.gesturesGiven}
              </Text>
              <Text style={styles.statLabel}>Given</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statBox, { backgroundColor: COLORS.purple + '15' }]}>
              <Icon name="hand-heart" size={28} color={COLORS.purple} />
              <Text style={[styles.statValue, { color: COLORS.purple }]}>
                {user.stats.gesturesReceived}
              </Text>
              <Text style={styles.statLabel}>Received</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statBox, { backgroundColor: COLORS.mint + '15' }]}>
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
              color={activeTab === 'gestures' ? COLORS.mint : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'gestures' && styles.activeTabText]}>
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
              color={activeTab === 'moments' ? COLORS.mint : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'moments' && styles.activeTabText]}>
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
              color={activeTab === 'proofs' ? COLORS.mint : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'proofs' && styles.activeTabText]}>
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
                          gesture.type === 'given' ? COLORS.coral + '15' : COLORS.mint + '15',
                      },
                    ]}
                  >
                    <Icon
                      name={gesture.icon}
                      size={24}
                      color={gesture.type === 'given' ? COLORS.coral : COLORS.mint}
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
                        { color: gesture.type === 'given' ? COLORS.coral : COLORS.mint },
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
        <TouchableOpacity style={styles.chatButton} onPress={handleChat} activeOpacity={0.8}>
          <Icon name="message-text" size={20} color={COLORS.white} />
          <Text style={styles.chatButtonText}>Send Message</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.white,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  membershipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  bio: {
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  separator: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  interestTag: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: (SCREEN_WIDTH - 44) / 2,
  },
  statGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statBox: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.white,
    marginTop: 4,
    opacity: 0.9,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.mint,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.mint,
  },
  content: {
    padding: 16,
  },
  gesturesList: {
    gap: 12,
  },
  gestureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    ...VALUES.shadow,
  },
  gestureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gestureInfo: {
    flex: 1,
    marginLeft: 12,
  },
  gestureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  gestureDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  gestureAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  gestureType: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  bottomActions: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.mint,
    paddingVertical: 16,
    borderRadius: 12,
  },
  chatButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
});
