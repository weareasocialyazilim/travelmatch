import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, Platform, StatusBar, Image, Dimensions,
  FlatList, Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, CARD_SHADOW } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface StoryMoment {
  id: string;
  user: { 
    name: string; 
    avatar: string; 
    role: 'Traveler' | 'Local';
    isVerified: boolean;
  };
  giftedBy: {
    name: string;
    avatar: string;
  };
  media: string;
  thumbnail: string;
  title: string;
  location: string;
  place: string;
  distance: string;
  price: number;
  gestureCount: number;
  category: string;
  completedAt: string;
  availability: string;
}

const STORY_MOMENTS: StoryMoment[] = [
  { 
    id:'1', 
    user: { 
      name:'Jessica Lane', 
      avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 
      role:'Traveler',
      isVerified: true
    },
    giftedBy: {
      name: 'Michael K.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
    },
    media:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200',
    thumbnail:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    title: "Discovering the best coffee in Montmartre",
    location:'Paris',
    place: 'Café Kitsuné Palais Royal',
    distance: '2km away',
    price: 5,
    gestureCount: 234,
    category: 'Coffee',
    completedAt: '2 hours ago',
    availability: 'Completed'
  },
  { 
    id:'2', 
    user: { 
      name:'Kenji Tanaka', 
      avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 
      role:'Local',
      isVerified: false
    },
    giftedBy: {
      name: 'Sarah W.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
    },
    media:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200',
    thumbnail:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    title: "Tokyo street food adventure",
    location:'Tokyo',
    place: 'Naniwa Taiyaki, Shibuya',
    distance: '8km away',
    price: 8,
    gestureCount: 89,
    category: 'Food',
    completedAt: 'Yesterday',
    availability: 'Completed'
  },
  { 
    id:'3', 
    user: { 
      name:'Maria Garcia', 
      avatar:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 
      role:'Traveler',
      isVerified: true
    },
    giftedBy: {
      name: 'David L.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
    },
    media:'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1200',
    thumbnail:'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400',
    title: "Sunset moment at Barcelona beach",
    location:'Barcelona',
    place: 'Barceloneta Beach',
    distance: '5km away',
    price: 12,
    gestureCount: 167,
    category: 'Experience',
    completedAt: '5 hours ago',
    availability: 'Completed'
  },
  { 
    id:'4', 
    user: { 
      name:'Alex Chen', 
      avatar:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 
      role:'Local',
      isVerified: true
    },
    giftedBy: {
      name: 'Emma R.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
    },
    media:'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1200',
    thumbnail:'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400',
    title: "Hidden museum gem in London",
    location:'London',
    place: 'Sir John Soane\'s Museum',
    distance: '3km away',
    price: 15,
    gestureCount: 203,
    category: 'Museum',
    completedAt: '1 day ago',
    availability: 'Completed'
  },
];

const SocialScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [stories] = useState<StoryMoment[]>(STORY_MOMENTS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryMoment | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Filter handler'ı optimize et - her render'da yeni fonksiyon oluşturmaz
  const handleFilterPress = useCallback((filterId: string) => {
    setSelectedFilter(filterId);
  }, []);

  const filters = [
    { id: 'all', label: 'All', icon: 'view-grid-outline' },
    { id: 'nearMe', label: 'Near Me', icon: 'map-marker-outline' },
    { id: 'trending', label: 'Trending', icon: 'fire' },
    { id: 'recent', label: 'Recent', icon: 'clock-outline' }
  ];

  // Filter stories based on selected filter
  const filteredStories = useMemo(() => {
    switch (selectedFilter) {
      case 'nearMe':
        // Extract number from "2km away" format
        return stories.filter(story => {
          const distanceMatch = story.distance.match(/(\d+)/);
          const distance = distanceMatch ? parseInt(distanceMatch[1]) : 999;
          return distance <= 5; // Show moments within 5km
        });
      case 'trending':
        return stories.filter(story => story.gestureCount > 100);
      case 'recent':
        return [...stories].sort((a, b) => {
          const timeA = a.completedAt === 'Yesterday' ? 1 : a.completedAt === '2 hours ago' ? 0 : 2;
          const timeB = b.completedAt === 'Yesterday' ? 1 : b.completedAt === '2 hours ago' ? 0 : 2;
          return timeA - timeB;
        });
      default:
        return stories;
    }
  }, [stories, selectedFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const StoryCard = useCallback(({ item }: { item: StoryMoment }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => setSelectedStory(item)}
      activeOpacity={0.95}
    >
      {/* User Badge */}
      <View style={styles.cardHeader}>
        <View style={styles.userBadge}>
          <Image source={{uri: item.user.avatar}} style={styles.userAvatar} />
          <Text style={styles.userName}>{item.user.name}</Text>
          {item.user.isVerified && (
            <MaterialCommunityIcons name="check-decagram" size={14} color={COLORS.primary} />
          )}
        </View>
        <Text style={styles.userRole}>{item.user.role}</Text>
      </View>

      {/* Main Image */}
      <Image source={{uri: item.thumbnail}} style={styles.cardImage} />

      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>{item.category}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardLocation}>
          {item.location}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.cardInfo}>
            <MaterialCommunityIcons name="map-marker" size={12} color={COLORS.textSecondary} />
            <Text style={styles.cardPlace} numberOfLines={1}>{item.place}</Text>
          </View>
          <Text style={styles.cardPrice}>${item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), []);

  const renderStory = useCallback(({item}: {item: StoryMoment}) => (
    <StoryCard item={item} />
  ), []);

  const keyExtractor = useCallback((item: StoryMoment) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Discover</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons name="tune" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[styles.filterPill, selectedFilter === filter.id && styles.filterActive]}
            onPress={() => handleFilterPress(filter.id)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name={filter.icon as IconName} 
              size={16} 
              color={selectedFilter === filter.id ? COLORS.white : COLORS.textSecondary} 
            />
            <Text style={[styles.filterText, selectedFilter === filter.id && styles.filterTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <FlatList
        key={`grid-${selectedFilter}`}
        data={filteredStories}
        renderItem={renderStory}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={COLORS.primary}
          />
        }
      />

      {/* Story Detail Modal */}
      <Modal
        visible={selectedStory !== null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedStory(null)}
      >
        {selectedStory && (
          <View style={styles.modalContainer}>
            <StatusBar barStyle="light-content" />
            
            {/* Hero Image with Gradient */}
            <View style={styles.heroImageContainer}>
              <Image source={{uri: selectedStory.media}} style={styles.heroImage} />
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.6)']}
                style={styles.heroGradient}
              />
              
              {/* Floating Buttons */}
              <View style={styles.floatingButtons}>
                <TouchableOpacity 
                  style={styles.floatingButton}
                  onPress={() => setSelectedStory(null)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.white} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.floatingButton}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="share-variant" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              
              {/* User Floating Card */}
              <View style={styles.userFloatingCard}>
                <Image source={{uri: selectedStory.user.avatar}} style={styles.floatingAvatar} />
                <View style={styles.floatingUserInfo}>
                  <View style={styles.floatingNameRow}>
                    <Text style={styles.floatingUserName}>{selectedStory.user.name}</Text>
                    {selectedStory.user.isVerified && (
                      <MaterialCommunityIcons name="check-decagram" size={16} color={COLORS.primary} />
                    )}
                  </View>
                  <Text style={styles.floatingUserRole}>{selectedStory.user.role}</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{selectedStory.category}</Text>
                </View>
              </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView 
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.modalContent}>
                {/* Story Title */}
                <Text style={styles.storyTitle}>{selectedStory.title}</Text>
                
                {/* Location */}
                <View style={styles.storyMeta}>
                  <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.storyMetaText}>{selectedStory.place}</Text>
                </View>

                {/* Price Card */}
                <View style={styles.priceCard}>
                  <Text style={styles.priceAmount}>${selectedStory.price}</Text>
                </View>

                {/* Proof Badge */}
                <View style={styles.proofVerified}>
                  <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.primary} />
                  <Text style={styles.proofText}>Proof verified with photo</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.primaryActionButton}
                    onPress={() => {
                      setSelectedStory(null);
                      navigation.navigate('Home');
                    }}
                  >
                    <MaterialCommunityIcons name="gift-outline" size={20} color={COLORS.white} />
                    <Text style={styles.primaryActionText}>Gift a moment to someone</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.secondaryActionButton}
                    onPress={() => {
                      setSelectedStory(null);
                      navigation.navigate('CreateMoment');
                    }}
                  >
                    <MaterialCommunityIcons name="plus-circle-outline" size={20} color={COLORS.coral} />
                    <Text style={styles.secondaryActionText}>Request your own moment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      <BottomNav activeTab="Social" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Filters
  // Filters
  filterContainer: {
    marginBottom: 12,
    flexGrow: 0,
    flexShrink: 0,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexGrow: 0,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    minHeight: 36,
    flexShrink: 0,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
  },

  // Grid
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  gridRow: {
    justifyContent: 'space-between',
  },

  // Card
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: LAYOUT.shadowOffset.md,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  userRole: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH * 0.8,
    resizeMode: 'cover',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 12,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'capitalize',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  cardLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'column',
    gap: 6,
    marginBottom: 8,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardPlace: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  availability: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  gestureCount: {
    fontSize: 11,
    color: COLORS.coral,
    fontWeight: '600',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroImageContainer: {
    height: 380,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingButtons: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userFloatingCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: LAYOUT.shadowOffset.xl,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  floatingAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  floatingUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  floatingNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  floatingUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  floatingUserRole: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  modalScrollContent: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
    backgroundColor: COLORS.white,
  },
  storyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 28,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  metaDot: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  priceCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginVertical: 20,
    backgroundColor: COLORS.background,
    borderRadius: 16,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -1,
  },
  proofVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
    marginBottom: 24,
  },
  proofText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 28,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.coral,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.coral,
  },

  // Bottom Nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  navTextActive: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
});

export default SocialScreen;
