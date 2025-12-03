import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/colors';
import type { Moment as MomentType } from '../types';

type TabType = 'active' | 'completed';

interface MyMoment {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  status: 'active' | 'pending' | 'completed';
  requestCount?: number;
  completedDate?: string;
  rating?: number;
}

const MyMomentsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabType>('active');

  // Mock data
  const activeMoments: MyMoment[] = [
    {
      id: '1',
      title: 'Best Croissant in Paris',
      location: 'Paris, France',
      price: 15,
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
      status: 'active',
      requestCount: 3,
    },
    {
      id: '2',
      title: 'Hidden Cafe in Tokyo',
      location: 'Tokyo, Japan',
      price: 20,
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
      status: 'pending',
      requestCount: 1,
    },
    {
      id: '3',
      title: 'Street Art Tour Barcelona',
      location: 'Barcelona, Spain',
      price: 25,
      image: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3',
      status: 'active',
      requestCount: 0,
    },
  ];

  const completedMoments: MyMoment[] = [
    {
      id: '4',
      title: 'Sunset at Santorini',
      location: 'Santorini, Greece',
      price: 30,
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
      status: 'completed',
      completedDate: 'Nov 28, 2024',
      rating: 5,
    },
    {
      id: '5',
      title: 'Local Food Market',
      location: 'Bangkok, Thailand',
      price: 12,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
      status: 'completed',
      completedDate: 'Nov 15, 2024',
      rating: 4,
    },
  ];

  const moments = activeTab === 'active' ? activeMoments : completedMoments;

  // Convert MyMoment to full Moment type for navigation
  const convertToMoment = (myMoment: MyMoment): MomentType & { status?: string } => {
    const [city, country] = myMoment.location.split(', ');
    return {
      id: myMoment.id,
      title: myMoment.title,
      story: `Experience ${myMoment.title} in ${myMoment.location}`,
      imageUrl: myMoment.image,
      image: myMoment.image,
      price: myMoment.price,
      status: myMoment.status, // Pass status for owner view conditional rendering
      location: {
        city: city || myMoment.location,
        country: country || '',
      },
      availability: myMoment.status === 'active' ? 'Available' : 'Completed',
      user: {
        id: 'current-user',
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        type: 'traveler',
        isVerified: true,
        location: myMoment.location,
        travelDays: 0,
      },
      giftCount: myMoment.requestCount || 0,
      category: {
        id: 'experience',
        label: 'Experience',
        emoji: '✨',
      },
    };
  };

  const getStatusBadge = (status: MyMoment['status'], requestCount?: number) => {
    switch (status) {
      case 'active':
        return (
          <View style={[styles.statusBadge, styles.activeBadge]}>
            <Text style={styles.activeBadgeText}>
              {requestCount && requestCount > 0 ? `${requestCount} requests` : 'Live'}
            </Text>
          </View>
        );
      case 'pending':
        return (
          <View style={[styles.statusBadge, styles.pendingBadge]}>
            <Text style={styles.pendingBadgeText}>Pending</Text>
          </View>
        );
      case 'completed':
        return (
          <View style={[styles.statusBadge, styles.completedBadge]}>
            <MaterialCommunityIcons name="check" size={12} color={COLORS.mint} />
            <Text style={styles.completedBadgeText}>Completed</Text>
          </View>
        );
    }
  };

  const handleMomentPress = (myMoment: MyMoment) => {
    const fullMoment = convertToMoment(myMoment);
    navigation.navigate('MomentDetail', { 
      moment: fullMoment,
      isOwner: true,
      pendingRequests: myMoment.requestCount || 0,
    });
  };

  const handleCreateMoment = () => {
    navigation.navigate('CreateMoment' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Moments</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateMoment}>
          <MaterialCommunityIcons name="plus" size={24} color={COLORS.coral} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active ({activeMoments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed ({completedMoments.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {moments.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name={activeTab === 'active' ? 'map-marker-star' : 'check-circle'}
                size={48}
                color={COLORS.softGray}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'active' ? 'No active moments' : 'No completed moments yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'active'
                ? 'Create your first moment to start receiving requests'
                : 'Complete your first moment to see it here'}
            </Text>
            {activeTab === 'active' && (
              <TouchableOpacity style={styles.createButton} onPress={handleCreateMoment}>
                <MaterialCommunityIcons name="plus" size={18} color={COLORS.white} />
                <Text style={styles.createButtonText}>Create Moment</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          moments.map((moment) => (
            <TouchableOpacity
              key={moment.id}
              style={styles.momentCard}
              onPress={() => handleMomentPress(moment)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: moment.image }} style={styles.momentImage} />
              <View style={styles.momentContent}>
                <View style={styles.momentHeader}>
                  <Text style={styles.momentTitle} numberOfLines={1}>
                    {moment.title}
                  </Text>
                  {getStatusBadge(moment.status, moment.requestCount)}
                </View>
                <View style={styles.momentLocation}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={14}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.momentLocationText}>{moment.location}</Text>
                </View>
                <View style={styles.momentFooter}>
                  <Text style={styles.momentPrice}>${moment.price}</Text>
                  {moment.status === 'completed' && moment.rating && (
                    <View style={styles.ratingContainer}>
                      <MaterialCommunityIcons name="star" size={14} color={COLORS.softOrange} />
                      <Text style={styles.ratingText}>{moment.rating}.0</Text>
                    </View>
                  )}
                  {moment.status === 'completed' && moment.completedDate && (
                    <Text style={styles.completedDate}>{moment.completedDate}</Text>
                  )}
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>
          ))
        )}

        {/* Summary Card for Completed */}
        {activeTab === 'completed' && completedMoments.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total completed</Text>
              <Text style={styles.summaryValue}>{completedMoments.length} moments</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total earned</Text>
              <Text style={styles.summaryValueHighlight}>
                ${completedMoments.reduce((sum, m) => sum + m.price, 0)}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: COLORS.coral,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Moment Card
  momentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  momentImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  momentContent: {
    flex: 1,
    marginLeft: 12,
  },
  momentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  momentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  momentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  momentLocationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  momentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  momentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.coral,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  completedDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Status Badges
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: COLORS.coralTransparent,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.coral,
  },
  pendingBadge: {
    backgroundColor: COLORS.softOrangeTransparent,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.softOrange,
  },
  completedBadge: {
    backgroundColor: COLORS.mintTransparent,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.mint,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.coral,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  summaryValueHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.mint,
  },

  bottomSpacer: {
    height: 40,
  },
});

export default MyMomentsScreen;
