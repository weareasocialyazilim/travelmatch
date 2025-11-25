import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
  Platform,
  StatusBar,
  Image,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import BottomNav from '../components/BottomNav';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { GiftMomentBottomSheet } from '../components/GiftMomentBottomSheet';
import { GiftSuccessModal } from '../components/GiftSuccessModal';
import { COLORS, CARD_SHADOW } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';
import { Moment } from '../types';
import { MOCK_MOMENTS } from '../mocks';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Types
type ViewType = 'Feed' | 'Map';
type FilterType = 'all' | 'travelers' | 'locals';

interface Filter {
  id: FilterType;
  label: string;
  icon: string;
}

interface UserLocation {
  id: string;
  name: string;
  role: 'traveler' | 'local';
  avatar: string;
  isVerified: boolean;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  giftTitle?: string;
  giftImage?: string;
  giftPrice?: number;
  location?: string;
  distance?: string;
}

// Map Style - Minimal Pastel
const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f8f6f3' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e9e9e9' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#c8e6f5' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
];

// Sample Data
const FILTERS: Filter[] = [
  { id: 'all', label: 'Tümü', icon: 'map-marker-radius' },
  { id: 'travelers', label: 'Gezginler', icon: 'airplane' },
  { id: 'locals', label: 'Yerliler', icon: 'home-heart' },
];

// Convert MOCK_MOMENTS to UserLocations for map markers
const USER_LOCATIONS: UserLocation[] = MOCK_MOMENTS.map(moment => ({
  id: moment.id,
  name: moment.user.name,
  role: moment.user.type,
  avatar: moment.user.avatar,
  isVerified: moment.user.isVerified,
  coordinate: {
    latitude: moment.location.coordinates!.lat,
    longitude: moment.location.coordinates!.lng,
  },
  giftTitle: moment.title,
  giftImage: moment.imageUrl,
  giftPrice: moment.price,
  location: `${moment.location.city}, ${moment.location.country}`,
  distance: moment.distance,
}));

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [viewType, setViewType] = useState<ViewType>('Feed');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [moments, setMoments] = useState<Moment[]>(MOCK_MOMENTS);
  const [userLocations] = useState<UserLocation[]>(USER_LOCATIONS);
  const [selectedUser, setSelectedUser] = useState<UserLocation | null>(null);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showGiftSheet, setShowGiftSheet] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [giftAmount, setGiftAmount] = useState(0);
  const mapRef = useRef<MapView>(null);
  const flatListRef = useRef<FlatList>(null);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    const timeoutId = setTimeout(() => {
      setMoments([...MOCK_MOMENTS]);
      setRefreshing(false);
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, []);

  const handlePinPress = useCallback((user: UserLocation) => {
    setSelectedUser(user);
  }, []);

  const handleSupportMoment = useCallback(() => {
    // Handle support action - placeholder for future implementation
  }, []);

  const handleSendGift = useCallback(() => {
    if (selectedUser) {
      // Find the moment associated with this user
      const userMoment = moments.find(m => m.user.name === selectedUser.name);
      
      if (userMoment) {
        // Navigate to moment detail
        navigation.navigate('MomentDetail', { moment: userMoment });
        setSelectedUser(null);
      }
    }
  }, [selectedUser, moments, navigation]);

  const handleGiftMoment = useCallback((moment: Moment) => {
    // Convert Moment to MomentData format for bottom sheet
    setSelectedMoment(moment);
    setShowGiftSheet(true);
  }, []);

  const handleGiftOption = useCallback((paymentMethod: 'apple-pay' | 'google-pay' | 'card') => {
    if (!selectedMoment) return;
    
    setShowGiftSheet(false);
    setGiftAmount(selectedMoment.price);
    
    // Show success modal after a short delay
    setTimeout(() => {
      setShowSuccessModal(true);
    }, VALUES.ANIMATION_DURATION);
  }, [selectedMoment]);

  const handleViewApprovals = useCallback(() => {
    if (!selectedMoment) return;
    
    setShowSuccessModal(false);
    
    // Navigate to ReceiverApprovalV2 with moment details
    navigation.navigate('ReceiverApprovalV2', {
      momentTitle: selectedMoment.title,
      totalAmount: selectedMoment.price,
    });
  }, [selectedMoment, navigation]);

  const filteredUsers = useMemo(() => {
    return userLocations.filter(user => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'travelers') return user.role === 'traveler';
      if (selectedFilter === 'locals') return user.role === 'local';
      return true;
    });
  }, [userLocations, selectedFilter]);

  const filteredMoments = useMemo(() => {
    return moments.filter(moment => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'travelers') return moment.user.type === 'traveler';
      if (selectedFilter === 'locals') return moment.user.type === 'local';
      return true;
    });
  }, [moments, selectedFilter]);

  // Reset scroll position when filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
      }
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [selectedFilter]);

  const FilterPill = ({ filter, isSelected }: { filter: Filter; isSelected: boolean }) => (
    <TouchableOpacity
      style={[styles.filterPill, isSelected && styles.filterPillActive]}
      onPress={() => setSelectedFilter(filter.id)}
      accessibilityRole="button"
      accessibilityLabel={filter.label}>
      <MaterialCommunityIcons 
        name={filter.icon as IconName} 
        size={16} 
        color={isSelected ? COLORS.white : COLORS.textSecondary} 
      />
      <Text style={[styles.filterText, isSelected && styles.filterTextActive]} numberOfLines={1}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  const mapMarkers = useMemo(() => {
    return filteredUsers;
  }, [filteredUsers]);

  const handleMarkerPress = useCallback((user: UserLocation) => {
    setSelectedUser(user);
  }, []);

  const MomentCard = useCallback(({ moment }: { moment: Moment }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('MomentDetail', { moment })}
      activeOpacity={0.95}
    >
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: moment.imageUrl }} style={styles.cardImage} resizeMode="cover" />
        
        <View style={styles.userBadge}>
          <Image source={{ uri: moment.user.avatar }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName} numberOfLines={1}>{moment.user.name}</Text>
              {moment.user.isVerified && (
                <MaterialCommunityIcons 
                  name="check-decagram" 
                  size={14} 
                  color={COLORS.primary} 
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            <Text style={styles.userRole}>{moment.user.role}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {moment.title}
        </Text>
        <Text style={styles.cardLocation}>
          {moment.location.city}
        </Text>

        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>{moment.location.name}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>{moment.availability}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.priceText}>${moment.price}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              handleGiftMoment(moment);
            }}
          >
            <Text style={styles.primaryButtonText}>Gift this moment</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            activeOpacity={0.8}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.secondaryButtonText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  ), [navigation, handleGiftMoment]);

  const renderMomentCard = useCallback(
    ({ item }: { item: Moment }) => <MomentCard moment={item} />,
    []
  );

  const keyExtractor = useCallback((item: Moment) => item.id, []);

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="compass-off-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.emptyText}>No moments nearby</Text>
        <Text style={styles.emptySubtext}>Try exploring other locations</Text>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {viewType === 'Feed' ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Discover</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setViewType('Map')}
                accessibilityRole="button"
                accessibilityLabel="Switch to Map View">
                <MaterialCommunityIcons 
                  name="map-outline" 
                  size={22} 
                  color={COLORS.text} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} accessibilityRole="button" accessibilityLabel="Filters">
                <MaterialCommunityIcons name="tune-variant" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
            style={styles.filterScroll}
            bounces={false}
            scrollEventThrottle={16}>
            {FILTERS.map((filter) => (
              <FilterPill key={filter.id} filter={filter} isSelected={selectedFilter === filter.id} />
            ))}
          </ScrollView>

          <FlatList
            ref={flatListRef}
            key={`moments-${selectedFilter}`}
            data={filteredMoments}
            extraData={selectedFilter}
            keyExtractor={keyExtractor}
            renderItem={renderMomentCard}
            contentContainerStyle={filteredMoments.length === 0 ? styles.emptyListContent : styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            getItemLayout={(data, index) => ({
              length: 420,
              offset: 420 * index,
              index,
            })}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              // Load more moments - placeholder for pagination
            }}
            ListEmptyComponent={ListEmptyComponent}
          />
        </>
      ) : (
        <View style={styles.mapContainer}>
          {/* Map - Full Screen */}
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            customMapStyle={mapStyle}
            initialRegion={{
              ...VALUES.MAP_COORDINATES.PARIS,
              latitudeDelta: 50,
              longitudeDelta: 50,
            }}
          >
            {mapMarkers.map(user => (
              <Marker
                key={user.id}
                coordinate={user.coordinate}
                onPress={() => handleMarkerPress(user)}
                tracksViewChanges={false}
              >
                <View style={styles.customMarker}>
                  <View
                    style={[
                      styles.markerOuter,
                      {
                        backgroundColor: user.role === 'traveler' ? COLORS.mint : COLORS.coral,
                      },
                    ]}
                  >
                    <View style={styles.markerInner}>
                      <Text style={styles.markerInitial}>
                        {user.name.charAt(0)}
                      </Text>
                    </View>
                    {user.isVerified && (
                      <View style={styles.verifiedDot}>
                        <MaterialCommunityIcons 
                          name="check" 
                          size={8} 
                          color="white" 
                        />
                      </View>
                    )}
                  </View>
                </View>
              </Marker>
            ))}
          </MapView>

          {/* Floating Header on Map */}
          <View style={styles.mapHeader}>
            <View style={styles.mapHeaderLeft}>
              <Text style={styles.mapHeaderTitle}>Keşfet</Text>
              <Text style={styles.mapHeaderSubtitle}>{filteredUsers.length} kişi yakınınızda</Text>
            </View>
            <View style={styles.mapHeaderActions}>
              <TouchableOpacity 
                style={styles.mapHeaderButton}
                onPress={() => setViewType('Feed')}
              >
                <MaterialCommunityIcons name="view-list" size={20} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapHeaderButton}>
                <MaterialCommunityIcons name="tune-variant" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Floating Filters - Centered */}
          <View style={styles.mapFiltersWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mapFiltersContainer}
            >
              {FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[styles.mapFilterChip, selectedFilter === filter.id && styles.mapFilterChipActive]}
                  onPress={() => setSelectedFilter(filter.id)}
                >
                  <MaterialCommunityIcons 
                    name={filter.icon as IconName} 
                    size={16} 
                    color={selectedFilter === filter.id ? COLORS.white : COLORS.text} 
                  />
                  <Text style={[styles.mapFilterText, selectedFilter === filter.id && styles.mapFilterTextActive]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* My Location Button */}
          <TouchableOpacity 
            style={styles.myLocationButton}
            onPress={() => {
              mapRef.current?.animateToRegion({
                ...VALUES.MAP_COORDINATES.ISTANBUL,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }, 1000);
            }}
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color={COLORS.text} />
          </TouchableOpacity>

          {/* Bottom User Card */}
          {selectedUser && (
            <View style={styles.bottomCard}>
              <TouchableOpacity 
                style={styles.bottomCardClose}
                onPress={() => setSelectedUser(null)}
              >
                <MaterialCommunityIcons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
              
              <View style={styles.bottomCardContent}>
                {/* Moment Image */}
                {selectedUser.giftImage && (
                  <Image 
                    source={{ uri: selectedUser.giftImage }} 
                    style={styles.bottomCardImage}
                  />
                )}

                <View style={styles.bottomCardUser}>
                  <Image 
                    source={{ uri: selectedUser.avatar }} 
                    style={styles.bottomCardAvatar}
                  />
                  <View style={styles.bottomCardUserInfo}>
                    <View style={styles.bottomCardNameRow}>
                      <Text style={styles.bottomCardName}>{selectedUser.name}</Text>
                      {selectedUser.isVerified && (
                        <MaterialCommunityIcons 
                          name="check-decagram" 
                          size={16} 
                          color={COLORS.mint} 
                        />
                      )}
                    </View>
                    <Text style={styles.bottomCardRole}>
                      {selectedUser.role === 'traveler' ? '✈️ Gezgin' : '🏠 Yerli'}
                    </Text>
                  </View>
                </View>

                {selectedUser.giftTitle && (
                  <>
                    <Text style={styles.bottomCardTitle}>{selectedUser.giftTitle}</Text>
                    {selectedUser.giftPrice && (
                      <Text style={styles.bottomCardPrice}>${selectedUser.giftPrice}</Text>
                    )}
                  </>
                )}

                <View style={styles.bottomCardActions}>
                  <TouchableOpacity
                    style={[styles.bottomCardButton, styles.bottomCardButtonPrimary]}
                    onPress={handleSendGift}
                  >
                    <MaterialCommunityIcons name="gift-outline" size={20} color="white" />
                    <Text style={styles.bottomCardButtonTextPrimary}>Gift this moment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      <BottomNav activeTab="Home" />

      {/* Gift Moment Bottom Sheet */}
      {selectedMoment && (
        <GiftMomentBottomSheet
          visible={showGiftSheet}
          moment={{
            id: selectedMoment.id,
            category: selectedMoment.category || {
              id: 'other',
              label: 'Other',
              emoji: '🎁'
            },
            title: selectedMoment.title,
            imageUrl: selectedMoment.imageUrl,
            user: {
              name: selectedMoment.user.name,
              avatar: selectedMoment.user.avatar,
              type: selectedMoment.user.type,
              location: selectedMoment.user.location,
              travelDays: selectedMoment.user.travelDays,
              isVerified: selectedMoment.user.isVerified,
              ...(selectedMoment.user.visitingUntil && { visitingUntil: selectedMoment.user.visitingUntil })
            },
            location: {
              name: selectedMoment.location.name,
              city: selectedMoment.location.city,
              country: selectedMoment.location.country,
              ...(selectedMoment.location.coordinates && { coordinates: selectedMoment.location.coordinates })
            },
            story: selectedMoment.story,
            dateRange: selectedMoment.dateRange || {
              start: new Date(),
              end: new Date()
            },
            price: selectedMoment.price
          }}
          onClose={() => setShowGiftSheet(false)}
          onGift={handleGiftOption}
        />
      )}

      {/* Gift Success Modal */}
      <GiftSuccessModal
        visible={showSuccessModal}
        amount={giftAmount}
        momentTitle={selectedMoment?.title}
        onViewApprovals={handleViewApprovals}
        onClose={() => setShowSuccessModal(false)}
      />
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
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.glassBackground,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  mapButtonActive: {
    backgroundColor: 'rgba(166, 229, 193, 0.2)',
    borderColor: COLORS.primary,
  },
  filterScroll: {
    marginBottom: 12,
    paddingVertical: 4,
    flexGrow: 0,
    flexShrink: 0,
  },
  filterContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    minHeight: 42,
    justifyContent: 'center',
    flexShrink: 0,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: LAYOUT.shadowOffset.xl,
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  userBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    paddingVertical: 4,
    paddingLeft: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    maxWidth: '70%',
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  userInfo: {
    marginLeft: 8,
    flexShrink: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    flexShrink: 1,
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  userRole: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 28,
  },
  cardLocation: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '45%',
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flexShrink: 1,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  socialProof: {
    fontSize: 12,
    color: COLORS.accent,
    marginBottom: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  primaryButton: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  // Map View Styles
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(246, 242, 236, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  mapHeaderLeft: {
    flex: 1,
  },
  mapHeaderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  mapHeaderSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  mapHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mapHeaderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: LAYOUT.shadowOffset.sm,
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  mapFiltersScroll: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 90 : 100,
    left: 0,
    right: 0,
  },
  mapFiltersWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 90 : 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mapFiltersContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  mapFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: LAYOUT.shadowOffset.md,
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  mapFilterChipActive: {
    backgroundColor: COLORS.mint,
  },
  mapFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  mapFilterTextActive: {
    color: 'white',
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: LAYOUT.shadowOffset.lg,
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  // Bottom Card Styles
  bottomCard: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: LAYOUT.shadowOffset.xl,
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomCardClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  bottomCardContent: {
    gap: 16,
  },
  bottomCardImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  bottomCardUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bottomCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: 'cover',
  },
  bottomCardUserInfo: {
    flex: 1,
  },
  bottomCardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  bottomCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  bottomCardRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  bottomCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 22,
  },
  bottomCardPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  bottomCardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    minHeight: 48,
  },
  bottomCardButtonPrimary: {
    flex: 1,
    backgroundColor: COLORS.mint,
  },
  bottomCardButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  bottomCardButtonSecondary: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.coral,
  },
  mapFullContainer: {
    flex: 1,
    position: 'relative',
  },
  mapSearchContainer: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: LAYOUT.shadowOffset.md,
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  // Map Marker Styles
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  markerInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: LAYOUT.shadowOffset.sm,
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  markerInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: LAYOUT.shadowOffset.md,
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedCheckmark: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  // Bottom Sheet Styles
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: LAYOUT.shadowOffset.bottomSheet,
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.disabled,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  momentCard: {
    paddingHorizontal: 20,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  userNameLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  rolePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftInfoSection: {
    marginBottom: 20,
  },
  giftTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 44,
  },
  supportButton: {
    backgroundColor: COLORS.mint,
  },
  supportButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  giftButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.coral,
  },
  giftButtonText: {
    color: COLORS.coral,
    fontSize: 16,
    fontWeight: '700',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    zIndex: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
  },
  navText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  navTextActive: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
});

export default HomeScreen;
