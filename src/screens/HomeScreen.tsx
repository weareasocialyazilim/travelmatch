import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
  Image,
  StatusBar,
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
import { Moment } from '../types';
import { MOCK_MOMENTS } from '../mocks';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

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
const USER_LOCATIONS: UserLocation[] = MOCK_MOMENTS.map((moment) => ({
  id: moment.id,
  name: moment.user.name,
  role: moment.user.type,
  avatar: moment.user.avatar,
  isVerified: moment.user.isVerified,
  coordinate: {
    latitude: moment.location.coordinates ? moment.location.coordinates.lat : 0,
    longitude: moment.location.coordinates
      ? moment.location.coordinates.lng
      : 0,
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

  const handleSendGift = useCallback(() => {
    if (selectedUser) {
      // Find the moment associated with this user
      const userMoment = moments.find((m) => m.user.name === selectedUser.name);

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

  const handleGiftOption = useCallback(
    (_paymentMethod: 'apple-pay' | 'google-pay' | 'card') => {
      if (!selectedMoment) return;

      setShowGiftSheet(false);
      setGiftAmount(selectedMoment.price);

      // Show success modal after a short delay
      setTimeout(() => {
        setShowSuccessModal(true);
      }, VALUES.ANIMATION_DURATION);
    },
    [selectedMoment],
  );

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
    return userLocations.filter((user) => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'travelers') return user.role === 'traveler';
      if (selectedFilter === 'locals') return user.role === 'local';
      return true;
    });
  }, [userLocations, selectedFilter]);

  const filteredMoments = useMemo(() => {
    return moments.filter((moment) => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'travelers')
        return moment.user.type === 'traveler';
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

  const FilterPill = ({
    filter,
    isSelected,
  }: {
    filter: Filter;
    isSelected: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.filterPill, isSelected && styles.filterPillActive]}
      onPress={() => setSelectedFilter(filter.id)}
      accessibilityRole="button"
      accessibilityLabel={filter.label}
    >
      <MaterialCommunityIcons
        name={filter.icon as IconName}
        size={16}
        color={isSelected ? COLORS.white : COLORS.textSecondary}
      />
      <Text
        style={[styles.filterText, isSelected && styles.filterTextActive]}
        numberOfLines={1}
      >
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

  const MomentCard = useCallback(
    ({ moment }: { moment: Moment }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('MomentDetail', { moment })}
        activeOpacity={0.95}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: moment.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />

          <View style={styles.userBadge}>
            <Image
              source={{ uri: moment.user.avatar }}
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName} numberOfLines={1}>
                  {moment.user.name}
                </Text>
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
          <Text style={styles.cardLocation}>{moment.location.city}</Text>

          <View style={styles.cardDetails}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.detailText} numberOfLines={1}>
                {moment.location.name}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.detailText} numberOfLines={1}>
                {moment.availability}
              </Text>
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
    ),
    [navigation, handleGiftMoment],
  );

  const renderMomentCard = useCallback(
    ({ item }: { item: Moment }) => <MomentCard moment={item} />,
    [MomentCard],
  );

  const keyExtractor = useCallback((item: Moment) => item.id, []);

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="compass-off-outline"
          size={64}
          color={COLORS.textSecondary}
        />
        <Text style={styles.emptyText}>No moments nearby</Text>
        <Text style={styles.emptySubtext}>Try exploring other locations</Text>
      </View>
    ),
    [],
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
                accessibilityLabel="Switch to Map View"
              >
                <MaterialCommunityIcons
                  name="map-outline"
                  size={22}
                  color={COLORS.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                accessibilityRole="button"
                accessibilityLabel="Filters"
              >
                <MaterialCommunityIcons
                  name="tune-variant"
                  size={22}
                  color={COLORS.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
            style={styles.filterScroll}
            bounces={false}
            scrollEventThrottle={16}
          >
            {FILTERS.map((filter) => (
              <FilterPill
                key={filter.id}
                filter={filter}
                isSelected={selectedFilter === filter.id}
              />
            ))}
          </ScrollView>

          <FlatList
            ref={flatListRef}
            key={`moments-${selectedFilter}`}
            data={filteredMoments}
            extraData={selectedFilter}
            keyExtractor={keyExtractor}
            renderItem={renderMomentCard}
            contentContainerStyle={
              filteredMoments.length === 0
                ? styles.emptyListContent
                : styles.listContent
            }
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
            {mapMarkers.map((user) => (
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
                        backgroundColor:
                          user.role === 'traveler' ? COLORS.mint : COLORS.coral,
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
              <Text style={styles.mapHeaderSubtitle}>
                {filteredUsers.length} kişi yakınınızda
              </Text>
            </View>
            <View style={styles.mapHeaderActions}>
              <TouchableOpacity
                style={styles.mapHeaderButton}
                onPress={() => setViewType('Feed')}
              >
                <MaterialCommunityIcons
                  name="view-list"
                  size={20}
                  color={COLORS.text}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapHeaderButton}>
                <MaterialCommunityIcons
                  name="tune-variant"
                  size={20}
                  color={COLORS.text}
                />
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
                  style={[
                    styles.mapFilterChip,
                    selectedFilter === filter.id && styles.mapFilterChipActive,
                  ]}
                  onPress={() => setSelectedFilter(filter.id)}
                >
                  <MaterialCommunityIcons
                    name={filter.icon as IconName}
                    size={16}
                    color={
                      selectedFilter === filter.id ? COLORS.white : COLORS.text
                    }
                  />
                  <Text
                    style={[
                      styles.mapFilterText,
                      selectedFilter === filter.id &&
                        styles.mapFilterTextActive,
                    ]}
                  >
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
              mapRef.current?.animateToRegion(
                {
                  ...VALUES.MAP_COORDINATES.ISTANBUL,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                },
                1000,
              );
            }}
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>

          {/* Bottom User Card */}
          {selectedUser && (
            <View style={styles.bottomCard}>
              <TouchableOpacity
                style={styles.bottomCardClose}
                onPress={() => setSelectedUser(null)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={COLORS.textSecondary}
                />
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
                      <Text style={styles.bottomCardName}>
                        {selectedUser.name}
                      </Text>
                      {selectedUser.isVerified && (
                        <MaterialCommunityIcons
                          name="check-decagram"
                          size={16}
                          color={COLORS.mint}
                        />
                      )}
                    </View>
                    <Text style={styles.bottomCardRole}>
                      {selectedUser.role === 'traveler'
                        ? '✈️ Gezgin'
                        : '🏠 Yerli'}
                    </Text>
                  </View>
                </View>

                {selectedUser.giftTitle && (
                  <>
                    <Text style={styles.bottomCardTitle}>
                      {selectedUser.giftTitle}
                    </Text>
                    {selectedUser.giftPrice && (
                      <Text style={styles.bottomCardPrice}>
                        ${selectedUser.giftPrice}
                      </Text>
                    )}
                  </>
                )}

                <View style={styles.bottomCardActions}>
                  <TouchableOpacity
                    style={[
                      styles.bottomCardButton,
                      styles.bottomCardButtonPrimary,
                    ]}
                    onPress={handleSendGift}
                  >
                    <MaterialCommunityIcons
                      name="gift-outline"
                      size={20}
                      color="white"
                    />
                    <Text style={styles.bottomCardButtonTextPrimary}>
                      Gift this moment
                    </Text>
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
              emoji: '🎁',
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
              ...(selectedMoment.user.visitingUntil && {
                visitingUntil: selectedMoment.user.visitingUntil,
              }),
            },
            location: {
              name: selectedMoment.location.name,
              city: selectedMoment.location.city,
              country: selectedMoment.location.country,
              ...(selectedMoment.location.coordinates && {
                coordinates: selectedMoment.location.coordinates,
              }),
            },
            story: selectedMoment.story,
            dateRange: selectedMoment.dateRange || {
              start: new Date(),
              end: new Date(),
            },
            price: selectedMoment.price,
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
    backgroundColor: COLORS.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  headerTitle: {
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28,
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
    letterSpacing: -0.5,
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: COLORS.glassBackground,
    borderColor: COLORS.glassBorder,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapHeader: {
    alignItems: 'center',
    backgroundColor: COLORS.mapHeader,
    borderBottomColor: COLORS.blackTransparentDarker,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 16,
    padding: 12,
    position: 'absolute',
    right: 16,
    borderRadius: 16,
    top: 16,
    ...CARD_SHADOW,
  },
  mapHeaderLeft: {
    flex: 1,
  },
  mapHeaderTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  mapHeaderSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  mapHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mapHeaderButton: {
    alignItems: 'center',
    backgroundColor: COLORS.glassBackground,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  myLocationButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 25,
    bottom: 240,
    height: 50,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    width: 50,
    ...CARD_SHADOW,
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerOuter: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  markerInner: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  markerInitial: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifiedDot: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderColor: COLORS.white,
    borderRadius: 7,
    borderWidth: 1.5,
    bottom: -2,
    height: 14,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    width: 14,
  },
  bottomCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    bottom: 0,
    elevation: 10,
    padding: 16,
    position: 'absolute',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    width: '100%',
  },
  bottomCardClose: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  bottomCardContent: {
    alignItems: 'center',
  },
  bottomCardImage: {
    borderRadius: 12,
    height: 120,
    marginBottom: 12,
    width: '100%',
  },
  bottomCardUser: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  bottomCardAvatar: {
    borderRadius: 25,
    height: 50,
    marginRight: 12,
    width: 50,
  },
  bottomCardUserInfo: {
    flex: 1,
  },
  bottomCardNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  bottomCardName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomCardRole: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  bottomCardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  bottomCardPrice: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  bottomCardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  bottomCardButton: {
    alignItems: 'center',
    borderRadius: 25,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bottomCardButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  bottomCardButtonTextPrimary: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContainer: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterPill: {
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderColor: COLORS.glassBorder,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingBottom: 80,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    height: 200,
    width: '100%',
  },
  userBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparent,
    borderRadius: 28,
    bottom: 12,
    flexDirection: 'row',
    left: 12,
    padding: 4,
    position: 'absolute',
  },
  userAvatar: {
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  userInfo: {
    flex: 1,
    marginLeft: 8,
    marginRight: 16,
  },
  userNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  userName: {
    color: COLORS.text,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: 'bold',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  userRole: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardLocation: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 12,
  },
  cardDetails: {
    borderTopColor: COLORS.glassBorder,
    borderTopWidth: 1,
    gap: 8,
    paddingTop: 12,
  },
  detailItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  detailText: {
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: 14,
  },
  priceText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 120,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: -80, // Offset for header
  },
  emptyListContent: {
    flex: 1,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  mapFiltersWrapper: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 90,
  },
  mapFiltersContainer: {
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  mapFilterChip: {
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparentDarker,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...CARD_SHADOW,
  },
  mapFilterChipActive: {
    backgroundColor: COLORS.primary,
  },
  mapFilterText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  mapFilterTextActive: {
    color: COLORS.white,
  },
});

export default HomeScreen;
