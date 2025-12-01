import { useNavigation, NavigationProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useCallback, useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { RootStackParamList } from '../navigation/AppNavigator';

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
    id: '1',
    user: {
      name: 'Jessica Lane',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      role: 'Traveler',
      isVerified: true,
    },
    giftedBy: {
      name: 'Michael K.',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    },
    media:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200',
    thumbnail:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    title: 'Discovering the best coffee in Montmartre',
    location: 'Paris',
    place: 'Café Kitsuné Palais Royal',
    distance: '2km away',
    price: 5,
    gestureCount: 234,
    category: 'Coffee',
    completedAt: '2 hours ago',
    availability: 'Completed',
  },
  {
    id: '2',
    user: {
      name: 'Kenji Tanaka',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      role: 'Local',
      isVerified: false,
    },
    giftedBy: {
      name: 'Sarah W.',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    },
    media:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200',
    thumbnail:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    title: 'Tokyo street food adventure',
    location: 'Tokyo',
    place: 'Naniwa Taiyaki, Shibuya',
    distance: '8km away',
    price: 8,
    gestureCount: 89,
    category: 'Food',
    completedAt: 'Yesterday',
    availability: 'Completed',
  },
  {
    id: '3',
    user: {
      name: 'Maria Garcia',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      role: 'Traveler',
      isVerified: true,
    },
    giftedBy: {
      name: 'David L.',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    },
    media:
      'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1200',
    thumbnail:
      'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400',
    title: 'Sunset moment at Barcelona beach',
    location: 'Barcelona',
    place: 'Barceloneta Beach',
    distance: '5km away',
    price: 12,
    gestureCount: 167,
    category: 'Experience',
    completedAt: '5 hours ago',
    availability: 'Completed',
  },
  {
    id: '4',
    user: {
      name: 'Alex Chen',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      role: 'Local',
      isVerified: true,
    },
    giftedBy: {
      name: 'Emma R.',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    },
    media: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1200',
    thumbnail:
      'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400',
    title: 'Hidden museum gem in London',
    location: 'London',
    place: "Sir John Soane's Museum",
    distance: '3km away',
    price: 15,
    gestureCount: 203,
    category: 'Museum',
    completedAt: '1 day ago',
    availability: 'Completed',
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
    { id: 'recent', label: 'Recent', icon: 'clock-outline' },
  ];

  // Filter stories based on selected filter
  const filteredStories = useMemo(() => {
    switch (selectedFilter) {
      case 'nearMe':
        // Extract number from "2km away" format
        return stories.filter((story) => {
          const distanceMatch = story.distance.match(/(\d+)/);
          const distance = distanceMatch ? parseInt(distanceMatch[1]) : 999;
          return distance <= 5; // Show moments within 5km
        });
      case 'trending':
        return stories.filter((story) => story.gestureCount > 100);
      case 'recent':
        return [...stories].sort((a, b) => {
          const timeA =
            a.completedAt === 'Yesterday'
              ? 1
              : a.completedAt === '2 hours ago'
              ? 0
              : 2;
          const timeB =
            b.completedAt === 'Yesterday'
              ? 1
              : b.completedAt === '2 hours ago'
              ? 0
              : 2;
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

  const StoryCard = useCallback(
    ({ item }: { item: StoryMoment }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelectedStory(item)}
        activeOpacity={0.95}
      >
        {/* User Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.userBadge}>
            <Image
              source={{ uri: item.user.avatar }}
              style={styles.userAvatar}
            />
            <Text style={styles.userName}>{item.user.name}</Text>
            {item.user.isVerified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={14}
                color={COLORS.primary}
              />
            )}
          </View>
          <Text style={styles.userRole}>{item.user.role}</Text>
        </View>

        {/* Main Image */}
        <Image source={{ uri: item.thumbnail }} style={styles.cardImage} />

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{item.category}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.cardLocation}>{item.location}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.cardInfo}>
              <MaterialCommunityIcons
                name="map-marker"
                size={12}
                color={COLORS.textSecondary}
              />
              <Text style={styles.cardPlace} numberOfLines={1}>
                {item.place}
              </Text>
            </View>
            <Text style={styles.cardPrice}>${item.price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [],
  );

  const renderStory = useCallback(
    ({ item }: { item: StoryMoment }) => <StoryCard item={item} />,
    [StoryCard],
  );

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
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterPill,
              selectedFilter === filter.id && styles.filterActive,
            ]}
            onPress={() => handleFilterPress(filter.id)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={filter.icon as IconName}
              size={16}
              color={
                selectedFilter === filter.id
                  ? COLORS.white
                  : COLORS.textSecondary
              }
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive,
              ]}
            >
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
              <Image
                source={{ uri: selectedStory.media }}
                style={styles.heroImage}
              />
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
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={24}
                    color={COLORS.white}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.floatingButton}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="share-variant"
                    size={24}
                    color={COLORS.white}
                  />
                </TouchableOpacity>
              </View>

              {/* User Floating Card */}
              <View style={styles.userFloatingCard}>
                <Image
                  source={{ uri: selectedStory.user.avatar }}
                  style={styles.floatingAvatar}
                />
                <View style={styles.floatingUserInfo}>
                  <View style={styles.floatingNameRow}>
                    <Text style={styles.floatingUserName}>
                      {selectedStory.user.name}
                    </Text>
                    {selectedStory.user.isVerified && (
                      <MaterialCommunityIcons
                        name="check-decagram"
                        size={16}
                        color={COLORS.primary}
                      />
                    )}
                  </View>
                  <Text style={styles.floatingUserRole}>
                    {selectedStory.user.role}
                  </Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {selectedStory.category}
                  </Text>
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
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={16}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.storyMetaText}>
                    {selectedStory.place}
                  </Text>
                </View>

                {/* Price Card */}
                <View style={styles.priceCard}>
                  <Text style={styles.priceAmount}>${selectedStory.price}</Text>
                </View>

                {/* Proof Badge */}
                <View style={styles.proofVerified}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={styles.proofText}>
                    Proof verified with photo
                  </Text>
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
                    <MaterialCommunityIcons
                      name="gift-outline"
                      size={20}
                      color={COLORS.white}
                    />
                    <Text style={styles.primaryActionText}>
                      Gift a moment to someone
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryActionButton}
                    onPress={() => {
                      setSelectedStory(null);
                      navigation.navigate('CreateMoment');
                    }}
                  >
                    <MaterialCommunityIcons
                      name="plus-circle-outline"
                      size={20}
                      color={COLORS.coral}
                    />
                    <Text style={styles.secondaryActionText}>
                      Request your own moment
                    </Text>
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
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: LAYOUT.shadowOffset.md,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: CARD_WIDTH,
  },
  cardContent: {
    padding: 12,
  },
  cardFooter: {
    flexDirection: 'column',
    gap: 6,
    marginBottom: 8,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  cardImage: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    height: CARD_WIDTH * 0.8,
    resizeMode: 'cover',
    width: '100%',
  },
  cardInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  cardLocation: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  cardPlace: {
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: 11,
  },
  cardPrice: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryTagText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  filterContainer: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 12,
  },
  filterContent: {
    flexGrow: 0,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  filterPill: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    flexShrink: 0,
    gap: 6,
    marginRight: 8,
    minHeight: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  floatingAvatar: {
    borderRadius: 22,
    height: 44,
    width: 44,
  },
  floatingButton: {
    alignItems: 'center',
    backgroundColor: COLORS.transparentWhite,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  floatingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: 20,
    position: 'absolute',
    right: 0,
    top: 50,
  },
  floatingNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  floatingUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  floatingUserName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  floatingUserRole: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  gridContainer: {
    paddingBottom: 80,
    paddingHorizontal: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
  },
  heroGradient: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  heroImage: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  heroImageContainer: {
    height: 380,
    position: 'relative',
    width: '100%',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
  },
  modalScrollContent: {
    flex: 1,
  },
  priceAmount: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
  },
  priceCard: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginVertical: 20,
    paddingVertical: 24,
  },
  primaryActionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  primaryActionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  proofText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  proofVerified: {
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 24,
    paddingVertical: 12,
  },
  secondaryActionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.coral,
    borderRadius: 28,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  secondaryActionText: {
    color: COLORS.coral,
    fontSize: 16,
    fontWeight: '600',
  },
  storyMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  storyMetaText: {
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: 14,
  },
  storyTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 12,
  },
  userAvatar: {
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  userBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  userFloatingCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    bottom: 20,
    elevation: 4,
    flexDirection: 'row',
    left: 20,
    padding: 12,
    position: 'absolute',
    right: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: LAYOUT.shadowOffset.xl,
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  userName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  userRole: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
});

export default SocialScreen;
