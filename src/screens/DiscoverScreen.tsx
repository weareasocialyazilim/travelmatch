import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  StatusBar,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import BottomNav from '../components/BottomNav';
import { COLORS } from '../constants/colors';
import { MOCK_MOMENTS } from '../mocks';
import type { Moment } from '../types';

// View modes
type ViewMode = 'single' | 'grid';

// Categories for filter modal
const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'food', label: 'Food', emoji: '🍕' },
  { id: 'culture', label: 'Culture', emoji: '🎭' },
  { id: 'tour', label: 'Tours', emoji: '🏛️' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌙' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'gift', label: 'Gifts', emoji: '🎁' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story

// User Stories Data with multiple moments per user
const USER_STORIES = [
  { 
    id: '1', 
    name: 'Anna', 
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg', 
    hasStory: true, 
    isNew: true,
    stories: [
      { id: 's1-1', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', title: 'Best Coffee in Town', description: 'Amazing latte art and cozy atmosphere', location: 'Brooklyn, NY', distance: '0.5 km', price: 15, time: '2h ago' },
      { id: 's1-2', imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', title: 'Vintage Cafe', description: 'Hidden gem with the best pastries', location: 'Brooklyn, NY', distance: '0.8 km', price: 20, time: '3h ago' },
    ]
  },
  { 
    id: '2', 
    name: 'Mike', 
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg', 
    hasStory: true, 
    isNew: true,
    stories: [
      { id: 's2-1', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', title: 'Rooftop Dinner', description: 'Stunning sunset views with amazing food', location: 'Manhattan, NY', distance: '2.1 km', price: 85, time: '1h ago' },
    ]
  },
  { 
    id: '3', 
    name: 'Sara', 
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg', 
    hasStory: true, 
    isNew: false,
    stories: [
      { id: 's3-1', imageUrl: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800', title: 'Street Art Tour', description: 'Discover hidden murals and graffiti art', location: 'Bushwick, NY', distance: '3.2 km', price: 25, time: '5h ago' },
      { id: 's3-2', imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', title: 'Gallery Opening', description: 'Contemporary art exhibition', location: 'Chelsea, NY', distance: '4.0 km', price: 0, time: '6h ago' },
      { id: 's3-3', imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800', title: 'Photography Walk', description: 'Capture the best spots in the city', location: 'SoHo, NY', distance: '1.5 km', price: 30, time: '8h ago' },
    ]
  },
  { 
    id: '4', 
    name: 'John', 
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg', 
    hasStory: true, 
    isNew: false,
    stories: [
      { id: 's4-1', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', title: 'Food Market Tour', description: 'Taste the best local cuisines', location: 'Queens, NY', distance: '5.0 km', price: 45, time: '4h ago' },
    ]
  },
  { 
    id: '5', 
    name: 'Emma', 
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg', 
    hasStory: true, 
    isNew: true,
    stories: [
      { id: 's5-1', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', title: 'Sunrise Yoga', description: 'Start your day with peace and energy', location: 'Central Park, NY', distance: '1.0 km', price: 20, time: '30m ago' },
      { id: 's5-2', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', title: 'Meditation Session', description: 'Find your inner calm', location: 'Bryant Park, NY', distance: '0.7 km', price: 15, time: '1h ago' },
    ]
  },
  { 
    id: '6', 
    name: 'Chris', 
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg', 
    hasStory: true, 
    isNew: false,
    stories: [
      { id: 's6-1', imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800', title: 'Jazz Night', description: 'Live music at the best jazz club', location: 'Harlem, NY', distance: '6.0 km', price: 35, time: '3h ago' },
    ]
  },
  { 
    id: '7', 
    name: 'Lisa', 
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg', 
    hasStory: true, 
    isNew: true,
    stories: [
      { id: 's7-1', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', title: 'Vintage Shopping', description: 'Best thrift stores in the city', location: 'Williamsburg, NY', distance: '2.5 km', price: 0, time: '2h ago' },
      { id: 's7-2', imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800', title: 'Boutique Tour', description: 'Discover unique local designers', location: 'Nolita, NY', distance: '1.8 km', price: 10, time: '4h ago' },
    ]
  },
];

// Sort options
const SORT_OPTIONS = [
  { id: 'nearest', label: 'Nearest', icon: 'map-marker' as const },
  { id: 'newest', label: 'Newest', icon: 'clock-outline' as const },
  { id: 'price_low', label: 'Price ↑', icon: 'arrow-up' as const },
  { id: 'price_high', label: 'Price ↓', icon: 'arrow-down' as const },
];

// Popular cities for location picker
const POPULAR_CITIES = [
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', emoji: '🇹🇷' },
  { id: 'paris', name: 'Paris', country: 'France', emoji: '🇫🇷' },
  { id: 'london', name: 'London', country: 'UK', emoji: '🇬🇧' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', emoji: '🇯🇵' },
  { id: 'newyork', name: 'New York', country: 'USA', emoji: '🇺🇸' },
  { id: 'barcelona', name: 'Barcelona', country: 'Spain', emoji: '🇪🇸' },
];

const DiscoverScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [selectedStoryUser, setSelectedStoryUser] = useState<typeof USER_STORIES[0] | null>(null);
  
  // Story viewer states
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const storyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('nearest');
  const [maxDistance, setMaxDistance] = useState(50);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  
  // Location state - default to current location
  const [selectedLocation, setSelectedLocation] = useState('San Francisco, CA');
  const [recentLocations, setRecentLocations] = useState(['New York, NY', 'Los Angeles, CA', 'Chicago, IL']);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  // Story timer and animation logic
  const startStoryTimer = useCallback(() => {
    if (!selectedStoryUser) return;
    
    progressAnim.setValue(0);
    
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused) {
        goToNextStory();
      }
    });
  }, [selectedStoryUser, isPaused, currentStoryIndex, currentUserIndex]);

  const pauseStory = useCallback(() => {
    setIsPaused(true);
    progressAnim.stopAnimation();
  }, [progressAnim]);

  const resumeStory = useCallback(() => {
    setIsPaused(false);
    const currentValue = (progressAnim as unknown as { _value: number })._value || 0;
    const remainingDuration = STORY_DURATION * (1 - currentValue);
    
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: remainingDuration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused) {
        goToNextStory();
      }
    });
  }, [progressAnim, isPaused]);

  const goToNextStory = useCallback(() => {
    if (!selectedStoryUser) return;
    
    const currentUserStories = selectedStoryUser.stories;
    
    if (currentStoryIndex < currentUserStories.length - 1) {
      // Next story for same user
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      // Go to next user
      const nextUserIndex = currentUserIndex + 1;
      if (nextUserIndex < USER_STORIES.length) {
        setCurrentUserIndex(nextUserIndex);
        setSelectedStoryUser(USER_STORIES[nextUserIndex]);
        setCurrentStoryIndex(0);
      } else {
        // End of all stories
        closeStoryViewer();
      }
    }
  }, [selectedStoryUser, currentStoryIndex, currentUserIndex]);

  const goToPreviousStory = useCallback(() => {
    if (!selectedStoryUser) return;
    
    if (currentStoryIndex > 0) {
      // Previous story for same user
      setCurrentStoryIndex(prev => prev - 1);
    } else {
      // Go to previous user
      const prevUserIndex = currentUserIndex - 1;
      if (prevUserIndex >= 0) {
        const prevUser = USER_STORIES[prevUserIndex];
        setCurrentUserIndex(prevUserIndex);
        setSelectedStoryUser(prevUser);
        setCurrentStoryIndex(prevUser.stories.length - 1);
      }
    }
  }, [selectedStoryUser, currentStoryIndex, currentUserIndex]);

  const closeStoryViewer = useCallback(() => {
    setShowStoryViewer(false);
    setSelectedStoryUser(null);
    setCurrentStoryIndex(0);
    setCurrentUserIndex(0);
    setIsPaused(false);
    progressAnim.setValue(0);
  }, [progressAnim]);

  const handleStoryTap = useCallback((event: GestureResponderEvent) => {
    const { locationX } = event.nativeEvent;
    const screenMiddle = SCREEN_WIDTH / 2;
    
    if (locationX < screenMiddle) {
      goToPreviousStory();
    } else {
      goToNextStory();
    }
  }, [goToPreviousStory, goToNextStory]);

  // Start timer when story changes
  useEffect(() => {
    if (showStoryViewer && selectedStoryUser && !isPaused) {
      startStoryTimer();
    }
    
    return () => {
      progressAnim.stopAnimation();
    };
  }, [showStoryViewer, selectedStoryUser, currentStoryIndex, currentUserIndex]);

  // Filter and sort moments
  const filteredMoments = useMemo(() => {
    let moments = [...MOCK_MOMENTS];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      moments = moments.filter(m => m.category?.id?.toLowerCase() === selectedCategory);
    }
    
    // Filter by price range
    moments = moments.filter(m => {
      const price = m.price || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });
    
    // Sort
    switch (sortBy) {
      case 'nearest':
        moments.sort((a, b) => parseFloat(a.distance || '999') - parseFloat(b.distance || '999'));
        break;
      case 'newest':
        moments.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        break;
      case 'price_low':
        moments.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        moments.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
    }
    
    return moments;
  }, [selectedCategory, sortBy, priceRange]);

  const handleMomentPress = useCallback((moment: Moment) => {
    navigation.navigate('MomentDetail', { moment });
  }, [navigation]);

  const handleStoryPress = useCallback((user: typeof USER_STORIES[0]) => {
    const userIndex = USER_STORIES.findIndex(u => u.id === user.id);
    setCurrentUserIndex(userIndex);
    setSelectedStoryUser(user);
    setCurrentStoryIndex(0);
    setShowStoryViewer(true);
  }, []);

  // Render Story Item
  const renderStoryItem = ({ item }: { item: typeof USER_STORIES[0] }) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => handleStoryPress(item)}
      activeOpacity={0.8}
    >
      <View style={[
        styles.storyCircle,
        item.isNew && styles.storyCircleNew,
        !item.isNew && styles.storyCircleSeen,
      ]}>
        <Image source={{ uri: item.avatar }} style={styles.storyAvatar} />
      </View>
      <Text style={styles.storyName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Single Column Card - Clean design
  const renderSingleCard = (item: Moment) => (
    <TouchableOpacity
      key={item.id}
      style={styles.singleCard}
      onPress={() => handleMomentPress(item)}
      activeOpacity={0.95}
    >
      {/* Image */}
      <Image source={{ uri: item.imageUrl }} style={styles.singleImage} />
      
      {/* Content */}
      <View style={styles.singleContent}>
        {/* Creator Row */}
        <View style={styles.creatorRow}>
          <Image 
            source={{ uri: item.user?.avatar || 'https://via.placeholder.com/40' }} 
            style={styles.creatorAvatar} 
          />
          <View style={styles.creatorInfo}>
            <View style={styles.creatorNameRow}>
              <Text style={styles.creatorName}>{item.user?.name || 'Anonymous'}</Text>
              {item.user?.isVerified && (
                <MaterialCommunityIcons name="check-decagram" size={14} color={COLORS.mint} />
              )}
            </View>
          </View>
        </View>
        
        {/* Title */}
        <Text style={styles.singleTitle} numberOfLines={2}>{item.title}</Text>
        
        {/* Story Description */}
        {item.story && (
          <Text style={styles.storyDescription} numberOfLines={2}>
            {item.story}
          </Text>
        )}
        
        {/* Location & Distance */}
        <View style={styles.locationDistanceRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.locationText}>{item.location?.city || 'Unknown'}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.distanceText}>{item.distance || '?'} km away</Text>
        </View>
        
        {/* Price */}
        <Text style={styles.priceValue}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  // Grid Card - Compact design
  const renderGridCard = (item: Moment, index: number) => (
    <View key={item.id} style={index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight}>
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => handleMomentPress(item)}
        activeOpacity={0.95}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
        
        {/* Content */}
        <View style={styles.gridContent}>
          {/* Creator */}
          <View style={styles.gridCreatorRow}>
            <Image 
              source={{ uri: item.user?.avatar || 'https://via.placeholder.com/24' }} 
              style={styles.gridAvatar} 
            />
            <Text style={styles.gridCreatorName} numberOfLines={1}>
              {item.user?.name?.split(' ')[0] || 'Anon'}
            </Text>
            {item.user?.isVerified && (
              <MaterialCommunityIcons name="check-decagram" size={10} color={COLORS.mint} />
            )}
          </View>
          
          {/* Title */}
          <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
          
          {/* Story */}
          {item.story && (
            <Text style={styles.gridStory} numberOfLines={1}>
              {item.story}
            </Text>
          )}
          
          {/* Footer */}
          <View style={styles.gridFooter}>
            <View style={styles.gridLocationRow}>
              <MaterialCommunityIcons name="map-marker" size={10} color={COLORS.textSecondary} />
              <Text style={styles.gridDistance}>{item.distance || '?'} km</Text>
            </View>
            <Text style={styles.gridPrice}>${item.price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Location selection handler
  const handleLocationSelect = (location: string) => {
    // Add current location to recent if it's different
    if (selectedLocation !== location && !recentLocations.includes(selectedLocation)) {
      setRecentLocations(prev => [selectedLocation, ...prev.slice(0, 2)]);
    }
    setSelectedLocation(location);
    setShowLocationModal(false);
  };

  // Location Modal
  const renderLocationModal = () => (
    <Modal
      visible={showLocationModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowLocationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.locationModal}>
          {/* Header */}
          <View style={styles.locationModalHeader}>
            <Text style={styles.locationModalTitle}>Select Location</Text>
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Current Location */}
            <TouchableOpacity 
              style={styles.locationOptionCurrent}
              onPress={() => handleLocationSelect('San Francisco, CA')}
            >
              <View style={styles.locationOptionIconWrapper}>
                <MaterialCommunityIcons name="crosshairs-gps" size={22} color={COLORS.mint} />
              </View>
              <View style={styles.locationOptionInfo}>
                <Text style={styles.locationOptionTitle}>Use Current Location</Text>
                <Text style={styles.locationOptionSubtitle}>San Francisco, CA (detected)</Text>
              </View>
              {selectedLocation === 'San Francisco, CA' && (
                <MaterialCommunityIcons name="check" size={22} color={COLORS.mint} />
              )}
            </TouchableOpacity>

            {/* Recent Locations */}
            {recentLocations.length > 0 && (
              <View style={styles.locationSection}>
                <Text style={styles.locationSectionTitle}>Recent</Text>
                {recentLocations.map((loc, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.locationOption}
                    onPress={() => handleLocationSelect(loc)}
                  >
                    <View style={styles.locationOptionIconWrapper}>
                      <MaterialCommunityIcons name="history" size={20} color={COLORS.textSecondary} />
                    </View>
                    <Text style={styles.locationOptionText}>{loc}</Text>
                    {selectedLocation === loc && (
                      <MaterialCommunityIcons name="check" size={22} color={COLORS.mint} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Popular Cities */}
            <View style={styles.locationSection}>
              <Text style={styles.locationSectionTitle}>Popular Cities</Text>
              {POPULAR_CITIES.map((city) => (
                <TouchableOpacity 
                  key={city.id}
                  style={styles.locationOption}
                  onPress={() => handleLocationSelect(`${city.name}, ${city.country}`)}
                >
                  <View style={styles.locationOptionIconWrapper}>
                    <Text style={styles.locationEmoji}>{city.emoji}</Text>
                  </View>
                  <Text style={styles.locationOptionText}>{city.name}, {city.country}</Text>
                  {selectedLocation === `${city.name}, ${city.country}` && (
                    <MaterialCommunityIcons name="check" size={22} color={COLORS.mint} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Filter Modal - Categories included here
  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          {/* Header */}
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category.id && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={styles.categoryChipEmoji}>{category.emoji}</Text>
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategory === category.id && styles.categoryChipTextActive,
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Sort By */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort by</Text>
              <View style={styles.sortOptions}>
                {SORT_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.sortOption, sortBy === option.id && styles.sortOptionActive]}
                    onPress={() => setSortBy(option.id)}
                  >
                    <MaterialCommunityIcons 
                      name={option.icon} 
                      size={16} 
                      color={sortBy === option.id ? COLORS.white : COLORS.text} 
                    />
                    <Text style={[styles.sortOptionText, sortBy === option.id && styles.sortOptionTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Distance */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Max Distance: {maxDistance} km</Text>
              <View style={styles.distanceOptions}>
                {[5, 10, 25, 50, 100].map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.distanceChip, maxDistance === d && styles.distanceChipActive]}
                    onPress={() => setMaxDistance(d)}
                  >
                    <Text style={[styles.distanceChipText, maxDistance === d && styles.distanceChipTextActive]}>
                      {d} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range: ${priceRange.min} - ${priceRange.max}</Text>
              <View style={styles.priceOptions}>
                {[
                  { min: 0, max: 50, label: '$0-50' },
                  { min: 50, max: 100, label: '$50-100' },
                  { min: 100, max: 250, label: '$100-250' },
                  { min: 0, max: 500, label: 'All' },
                ].map(range => (
                  <TouchableOpacity
                    key={range.label}
                    style={[
                      styles.priceChip, 
                      priceRange.min === range.min && priceRange.max === range.max && styles.priceChipActive
                    ]}
                    onPress={() => setPriceRange(range)}
                  >
                    <Text style={[
                      styles.priceChipText, 
                      priceRange.min === range.min && priceRange.max === range.max && styles.priceChipTextActive
                    ]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          
          {/* Actions */}
          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setSelectedCategory('all');
                setSortBy('nearest');
                setMaxDistance(50);
                setPriceRange({ min: 0, max: 500 });
              }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Story Viewer Modal - Instagram Style
  const renderStoryViewer = () => {
    if (!selectedStoryUser) return null;
    
    const currentStory = selectedStoryUser.stories[currentStoryIndex];
    const totalStories = selectedStoryUser.stories.length;
    
    return (
      <Modal
        visible={showStoryViewer}
        animationType="fade"
        transparent
        onRequestClose={closeStoryViewer}
      >
        <View style={styles.storyViewerOverlay}>
          <SafeAreaView style={styles.storyViewerContainer}>
            {/* Progress Bars */}
            <View style={styles.storyProgressContainer}>
              {selectedStoryUser.stories.map((_, index) => (
                <View key={index} style={styles.storyProgressBarWrapper}>
                  <View style={styles.storyProgressBarBg} />
                  {index < currentStoryIndex ? (
                    <View style={[styles.storyProgressBarFill, { width: '100%' }]} />
                  ) : index === currentStoryIndex ? (
                    <Animated.View 
                      style={[
                        styles.storyProgressBarFill, 
                        { 
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          })
                        }
                      ]} 
                    />
                  ) : null}
                </View>
              ))}
            </View>
            
            {/* Header - User Info */}
            <View style={styles.storyViewerHeader}>
              <View style={styles.storyViewerUserRow}>
                <TouchableOpacity 
                  style={styles.storyUserTouchable}
                  onPress={() => {
                    closeStoryViewer();
                    // Navigate to profile
                    navigation.navigate('ProfileDetail', { 
                      userId: selectedStoryUser.id
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={{ uri: selectedStoryUser.avatar }} 
                    style={styles.storyViewerAvatar} 
                  />
                  <View style={styles.storyViewerUserInfo}>
                    <Text style={styles.storyViewerName}>{selectedStoryUser.name}</Text>
                    <Text style={styles.storyViewerTime}>{currentStory?.time || '2h ago'}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.storyViewerClose}
                  onPress={closeStoryViewer}
                >
                  <MaterialCommunityIcons name="close" size={26} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Story Content with Touch Areas */}
            <TouchableWithoutFeedback
              onPress={handleStoryTap}
              onPressIn={pauseStory}
              onPressOut={resumeStory}
            >
              <View style={styles.storyViewerContent}>
                <Image 
                  source={{ uri: currentStory?.imageUrl }} 
                  style={styles.storyViewerImage}
                  resizeMode="cover"
                />
                
                {/* Touch indicators (invisible but helpful) */}
                <View style={styles.storyTouchAreas}>
                  <View style={styles.storyTouchLeft} />
                  <View style={styles.storyTouchRight} />
                </View>
              </View>
            </TouchableWithoutFeedback>
            
            {/* Moment Info Card */}
            <View style={styles.storyInfoCard}>
              <View style={styles.storyInfoContent}>
                <Text style={styles.storyInfoTitle} numberOfLines={1}>
                  {currentStory?.title}
                </Text>
                <Text style={styles.storyInfoDescription} numberOfLines={2}>
                  {currentStory?.description}
                </Text>
                <View style={styles.storyInfoMeta}>
                  <View style={styles.storyInfoMetaItem}>
                    <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.white} />
                    <Text style={styles.storyInfoMetaText}>{currentStory?.distance}</Text>
                  </View>
                  <View style={styles.storyInfoMetaItem}>
                    <MaterialCommunityIcons name="currency-usd" size={14} color={COLORS.white} />
                    <Text style={styles.storyInfoMetaText}>
                      {currentStory?.price === 0 ? 'Free' : `$${currentStory?.price}`}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.storyViewMomentBtn}
                onPress={() => {
                  closeStoryViewer();
                  // Navigate with mock moment data
                  navigation.navigate('MomentDetail', { 
                    moment: {
                      id: currentStory?.id || '1',
                      title: currentStory?.title || '',
                      imageUrl: currentStory?.imageUrl || '',
                      price: currentStory?.price || 0,
                      distance: currentStory?.distance || '',
                      story: currentStory?.description || '',
                      location: { city: currentStory?.location || '' },
                      user: { name: selectedStoryUser.name, avatar: selectedStoryUser.avatar },
                    } as Moment
                  });
                }}
              >
                <Text style={styles.storyViewMomentText}>View</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    );
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (sortBy !== 'nearest') count++;
    if (maxDistance !== 50) count++;
    if (priceRange.min !== 0 || priceRange.max !== 500) count++;
    return count;
  }, [selectedCategory, sortBy, maxDistance, priceRange]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.locationButton} 
          activeOpacity={0.7}
          onPress={() => setShowLocationModal(true)}
        >
          <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.mint} />
          <Text style={styles.headerLocationText}>{selectedLocation}</Text>
          <MaterialCommunityIcons name="chevron-down" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <MaterialCommunityIcons name="tune-variant" size={22} color={COLORS.text} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.mint}
          />
        }
      >
        {/* Stories - Only other users */}
        <FlatList
          data={USER_STORIES}
          renderItem={renderStoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesContainer}
          scrollEnabled={true}
        />

        {/* Results Bar */}
        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>
            {filteredMoments.length} moments nearby
          </Text>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === 'single' && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('single')}
            >
              <MaterialCommunityIcons 
                name="square-outline" 
                size={18} 
                color={viewMode === 'single' ? COLORS.white : COLORS.textSecondary} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === 'grid' && styles.viewToggleButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <MaterialCommunityIcons 
                name="view-grid-outline" 
                size={18} 
                color={viewMode === 'grid' ? COLORS.white : COLORS.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Moments List */}
        {viewMode === 'single' ? (
          <View style={styles.singleListContainer}>
            {filteredMoments.map(moment => renderSingleCard(moment))}
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredMoments.map((moment, index) => renderGridCard(moment, index))}
          </View>
        )}
        
        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      {renderLocationModal()}
      {renderFilterModal()}
      {renderStoryViewer()}

      {/* Bottom Navigation */}
      <BottomNav activeTab="Discover" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 6,
    marginRight: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  
  // Stories
  storiesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    width: 70,
  },
  storyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    backgroundColor: COLORS.surface,
  },
  storyCircleNew: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  storyCircleSeen: {
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: 'transparent',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  storyName: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 6,
    textAlign: 'center',
  },
  
  // Results Bar
  resultsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 4,
  },
  viewToggleButton: {
    width: 32,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  
  // Single Card - Clean
  singleListContainer: {
    paddingHorizontal: 16,
  },
  singleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  singleImage: {
    width: '100%',
    height: 200,
  },
  singleContent: {
    padding: 16,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  creatorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  singleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  storyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  locationDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  dotSeparator: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginHorizontal: 6,
  },
  distanceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  
  // Grid Card
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  gridItemLeft: {
    width: '50%',
    paddingRight: 8,
    marginBottom: 16,
  },
  gridItemRight: {
    width: '50%',
    paddingLeft: 8,
    marginBottom: 16,
  },
  gridCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridContent: {
    padding: 10,
  },
  gridCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  gridAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  gridCreatorName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: 4,
  },
  gridStory: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridDistance: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  gridPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.mint,
  },
  
  // Location Modal
  locationModal: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    maxHeight: '70%',
  },
  locationModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  locationModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  locationOptionCurrent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.mintTransparent,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  locationOptionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationOptionInfo: {
    flex: 1,
  },
  locationOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  locationOptionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  locationSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  locationSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  locationOptionText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  locationEmoji: {
    fontSize: 18,
  },
  
  // Filter Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    maxHeight: '85%',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    gap: 6,
  },
  sortOptionActive: {
    backgroundColor: COLORS.primary,
  },
  sortOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  sortOptionTextActive: {
    color: COLORS.white,
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distanceChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
  },
  distanceChipActive: {
    backgroundColor: COLORS.primary,
  },
  distanceChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  distanceChipTextActive: {
    color: COLORS.white,
  },
  priceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
  },
  priceChipActive: {
    backgroundColor: COLORS.primary,
  },
  priceChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  priceChipTextActive: {
    color: COLORS.white,
  },
  filterActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  
  // Story Viewer - Instagram Style
  storyViewerOverlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  storyViewerContainer: {
    flex: 1,
  },
  storyProgressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 4,
  },
  storyProgressBarWrapper: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  storyProgressBarBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  storyProgressBarFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  storyViewerHeader: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  storyViewerUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyUserTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyViewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  storyViewerUserInfo: {
    flex: 1,
    marginLeft: 10,
  },
  storyViewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  storyViewerTime: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  storyViewerClose: {
    padding: 8,
  },
  storyViewerContent: {
    flex: 1,
    position: 'relative',
  },
  storyViewerImage: {
    width: '100%',
    height: '100%',
  },
  storyTouchAreas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  storyTouchLeft: {
    flex: 1,
  },
  storyTouchRight: {
    flex: 1,
  },
  storyInfoCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyInfoContent: {
    flex: 1,
  },
  storyInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  storyInfoDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    lineHeight: 20,
  },
  storyInfoMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  storyInfoMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storyInfoMetaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  storyViewMomentBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 12,
  },
  storyViewMomentText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default DiscoverScreen;
