/**
 * SearchMapScreen - Immersive Map Experience
 *
 * Awwwards-standard map view with:
 * - Dark mode optimized theme
 * - Liquid Glass overlays
 * - Neon pulse markers with Platinum shimmer
 * - Subscription-based visibility layers
 * - Real-time price sync via Supabase Realtime
 * - Supercluster marker grouping for 50+ moments
 * - Location privacy with jitter for non-premium users
 *
 * "The map is art, the moments are destinations."
 */
import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  SlideInDown,
  SlideOutDown,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import Supercluster from 'supercluster';

import { COLORS } from '@/constants/colors';
import { FONT_SIZES_V2, FONTS } from '@/constants/typography';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { GlassCard } from '@/components/ui/GlassCard';
import { EnhancedSearchBar, NeonPulseMarker } from '../components';
import BottomNav from '@/components/BottomNav';
// Using useDiscoverMoments for PostGIS-based location discovery
import { useDiscoverMoments } from '@/hooks/useDiscoverMoments';
import { useMoments } from '@/hooks/useMoments';
import { useSubscription } from '@/features/payments/hooks/usePayments';
import { supabase } from '@/config/supabase';
import { TrustBadge } from '@/components/ui/TMBadge';
import {
  applyLocationJitter,
  type LocationJitterLevel,
} from '@/utils/security';

// Initialize Mapbox access token
const MAPBOX_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN ||
  process.env.EXPO_PUBLIC_MAPBOX_TOKEN ||
  '';

// Check if Mapbox is properly configured
const isMapboxConfigured = Boolean(MAPBOX_TOKEN);

// Lazy import Mapbox only if token is available
let MapboxGL: typeof import('@rnmapbox/maps').default | null = null;
if (isMapboxConfigured) {
  try {
    MapboxGL = require('@rnmapbox/maps').default;
    MapboxGL.setAccessToken(MAPBOX_TOKEN);
  } catch (error) {
    console.warn('[SearchMapScreen] Failed to load Mapbox:', error);
  }
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sunset Proof Palette - Neon renkleri
const SUNSET_PALETTE = {
  amber: '#F59E0B',
  magenta: '#EC4899',
  emerald: '#10B981',
  platinum: '#E5E7EB', // Platinum Gümüş
  platinumShimmer: '#F3F4F6',
};

// Subscription tier zoom limits
const TIER_ZOOM_LIMITS = {
  free: 14,
  starter: 15,
  pro: 17,
  vip: 19, // Platinum - en detaylı zoom
};

interface MapLocation {
  latitude: number;
  longitude: number;
}

interface MomentMarker {
  id: string;
  lat: number;
  lng: number;
  price: string;
  numericPrice: number;
  title: string;
  category?: string;
  hostName?: string;
  hostAvatar?: string;
  hostTrustScore?: number;
  hostTier?: 'free' | 'premium' | 'platinum';
  imageUrl?: string;
  isExclusive?: boolean; // Premium/Platinum only
  hasPlatinumOffer?: boolean; // Platinum abone teklif verdi
  isPopular?: boolean; // Çok popüler moment
}

// GeoJSON Feature type for Supercluster
interface PointFeature {
  type: 'Feature';
  properties: MomentMarker & { cluster?: boolean; point_count?: number };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

const SearchMapScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cameraRef = useRef<any>(null);

  // Hooks - Real data & subscription
  // Using PostGIS-based discovery for location-aware moments
  const {
    moments: discoveryMoments,
    loading: momentsLoading,
    userLocation: discoveryLocation,
  } = useDiscoverMoments();
  const moments = discoveryMoments;
  const { subscription } = useSubscription();
  const userTier = subscription?.tier || 'free';

  // State
  const [userLocation, setUserLocation] = useState<MapLocation | null>(null);
  const [selectedMoment, setSelectedMoment] = useState<MomentMarker | null>(
    null,
  );
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [_mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(13);

  // Animations
  const locationButtonScale = useSharedValue(1);
  const priceAnimations = useRef<Map<string, Animated.SharedValue<number>>>(
    new Map(),
  );

  // Determine location jitter level based on user tier
  // Privacy protection: non-premium users see approximate locations
  const getJitterLevel = (tier: string): LocationJitterLevel => {
    switch (tier) {
      case 'platinum':
        return 'none'; // Premium users see exact locations
      case 'pro':
      case 'premium':
        return 'light'; // ~100m jitter
      case 'starter':
        return 'medium'; // ~500m jitter
      default:
        return 'heavy'; // ~1.5km jitter for free users
    }
  };

  const jitterLevel = getJitterLevel(userTier);

  // Transform moments to markers with privacy jitter
  const mapMarkers = useMemo((): MomentMarker[] => {
    if (!moments) return [];

    return moments
      .filter((m: any) => {
        // Filter exclusive moments based on user tier
        if (m.isExclusive && !['premium', 'platinum'].includes(userTier)) {
          return false;
        }
        return m.location?.coordinates?.lat && m.location?.coordinates?.lng;
      })
      .map((m: any) => {
        // Apply location jitter for privacy
        const { latitude: jitteredLat, longitude: jitteredLng } =
          applyLocationJitter(
            m.location.coordinates.lat,
            m.location.coordinates.lng,
            jitterLevel,
          );

        return {
          id: m.id,
          lat: jitteredLat,
          lng: jitteredLng,
          price: `₺${m.pricePerGuest || m.price || 0}`,
          numericPrice: m.pricePerGuest || m.price || 0,
          title: m.title,
          category:
            typeof m.category === 'string' ? m.category : m.category?.id,
          hostName: m.hostName,
          hostAvatar: m.hostAvatar,
          hostTrustScore: m.hostTrustScore || 0,
          hostTier: m.hostSubscriptionTier || 'free',
          imageUrl: m.images?.[0] || m.image,
          isExclusive: m.isExclusive,
          hasPlatinumOffer: m.hasPlatinumOffer,
          isPopular: (m.saves || 0) > 50 || (m.requestCount || 0) > 10,
        };
      });
  }, [moments, userTier, jitterLevel]);

  // Supercluster for marker grouping (50+ markers)
  const supercluster = useMemo(() => {
    const cluster = new Supercluster({
      radius: 60,
      maxZoom: 16,
      minZoom: 0,
    });

    const points: PointFeature[] = mapMarkers.map((marker) => ({
      type: 'Feature',
      properties: marker,
      geometry: {
        type: 'Point',
        coordinates: [marker.lng, marker.lat],
      },
    }));

    cluster.load(points);
    return cluster;
  }, [mapMarkers]);

  // Get clustered markers based on current zoom
  const clusteredMarkers = useMemo(() => {
    if (!userLocation)
      return mapMarkers.map((m) => ({ ...m, cluster: false, point_count: 1 }));

    const bounds: [number, number, number, number] = [
      userLocation.longitude - 1,
      userLocation.latitude - 1,
      userLocation.longitude + 1,
      userLocation.latitude + 1,
    ];

    try {
      return supercluster.getClusters(bounds, Math.floor(currentZoom));
    } catch {
      return mapMarkers.map((m) => ({ ...m, cluster: false, point_count: 1 }));
    }
  }, [supercluster, userLocation, currentZoom, mapMarkers]);

  // Real-time price sync via Supabase
  useEffect(() => {
    const channel = supabase
      .channel('moment-prices')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'moments',
          filter: 'price_per_guest=neq.null',
        },
        (payload) => {
          // Trigger price animation on update
          const momentId = payload.new?.id;
          if (momentId && priceAnimations.current.has(momentId)) {
            const anim = priceAnimations.current.get(momentId);
            if (anim) {
              anim.value = withSpring(1.2, { damping: 10 });
              setTimeout(() => {
                anim.value = withSpring(1, { damping: 15 });
              }, 300);
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Request location permission and get current location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch {
        // Default to Istanbul if permission denied
        setUserLocation({
          latitude: 41.0082,
          longitude: 28.9784,
        });
      }
    };
    getLocation();
  }, []);

  // Handle marker selection - Subscription-based zoom
  const handleMarkerPress = useCallback(
    (marker: MomentMarker) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedMoment(marker);

      // Dynamic zoom based on subscription tier
      const maxZoom =
        TIER_ZOOM_LIMITS[userTier as keyof typeof TIER_ZOOM_LIMITS] || 14;
      const targetZoom = Math.min(15, maxZoom);

      // Animate camera to marker
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [marker.lng, marker.lat],
          zoomLevel: targetZoom,
          animationDuration: 500,
        });
      }
    },
    [userTier],
  );

  // Close preview card
  const handleClosePreview = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMoment(null);
  }, []);

  // Navigate to moment detail or subscriber offer flow
  const handleViewDetails = useCallback(() => {
    if (selectedMoment) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // If user is subscriber (premium/platinum), open offer flow directly
      if (['premium', 'platinum'].includes(userTier)) {
        navigation.navigate('SubscriberOffer', {
          momentId: selectedMoment.id,
          momentTitle: selectedMoment.title,
          hostName: selectedMoment.hostName,
          currentPrice: selectedMoment.numericPrice,
        });
      } else {
        // Regular navigation to moment detail
        navigation.navigate('MomentDetail', {
          momentId: selectedMoment.id,
          title: selectedMoment.title,
        });
      }
    }
  }, [navigation, selectedMoment, userTier]);

  // Center on user location
  const handleCenterOnUser = useCallback(() => {
    if (userLocation && cameraRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      cameraRef.current.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: 14,
        animationDuration: 500,
      });
    }
  }, [userLocation]);

  // Handle filter press
  const handleFilterPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('FilterPanel');
  }, [navigation]);

  // Location button animations
  const handleLocationPressIn = useCallback(() => {
    locationButtonScale.value = withSpring(0.9, { damping: 15 });
  }, [locationButtonScale]);

  const handleLocationPressOut = useCallback(() => {
    locationButtonScale.value = withSpring(1, { damping: 15 });
  }, [locationButtonScale]);

  const locationButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: locationButtonScale.value }],
  }));

  // Show fallback UI if Mapbox is not configured or has error
  if (!isMapboxConfigured || !MapboxGL || mapError) {
    return (
      <View style={styles.container}>
        <View style={styles.fallbackContainer}>
          <MaterialCommunityIcons
            name="map-marker-off"
            size={64}
            color={COLORS.text.muted}
          />
          <Text style={styles.fallbackTitle}>Map Unavailable</Text>
          <Text style={styles.fallbackSubtitle}>
            {mapError ||
              'Map service is not configured. Please add your Mapbox token to .env file.'}
          </Text>
        </View>
        <BottomNav activeTab="Discover" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mapbox Map */}
      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Dark}
        onDidFinishLoadingMap={() => setMapLoaded(true)}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={false}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={13}
          centerCoordinate={
            userLocation
              ? [userLocation.longitude, userLocation.latitude]
              : [28.9784, 41.0082]
          }
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* User Location Marker */}
        {userLocation && (
          <MapboxGL.PointAnnotation
            id="user-location"
            coordinate={[userLocation.longitude, userLocation.latitude]}
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerPulse} />
              <View style={styles.userMarkerInner} />
            </View>
          </MapboxGL.PointAnnotation>
        )}

        {/* Moment Markers - Clustered with Supercluster */}
        {momentsLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          clusteredMarkers.map((feature: any) => {
            const isCluster = feature.properties?.cluster;
            const coordinates = feature.geometry?.coordinates || [
              feature.lng,
              feature.lat,
            ];
            const marker = isCluster ? null : feature.properties || feature;

            if (isCluster) {
              // Render cluster marker
              const pointCount = feature.properties.point_count;
              return (
                <MapboxGL.PointAnnotation
                  key={`cluster-${feature.id}`}
                  id={`cluster-${feature.id}`}
                  coordinate={coordinates}
                >
                  <View style={styles.clusterMarker}>
                    <Text style={styles.clusterText}>{pointCount}</Text>
                  </View>
                </MapboxGL.PointAnnotation>
              );
            }

            // Determine marker color based on status
            const isPlatinumShimmer =
              marker?.hasPlatinumOffer || marker?.hostTier === 'platinum';
            const isPopular = marker?.isPopular;
            const accentColor = isPlatinumShimmer
              ? SUNSET_PALETTE.platinum
              : isPopular
                ? SUNSET_PALETTE.magenta
                : undefined;

            return (
              <MapboxGL.PointAnnotation
                key={marker?.id}
                id={`marker-${marker?.id}`}
                coordinate={coordinates}
                onSelected={() => marker && handleMarkerPress(marker)}
              >
                <NeonPulseMarker
                  price={marker?.price || '₺0'}
                  isSelected={selectedMoment?.id === marker?.id}
                  size="medium"
                  accentColor={accentColor}
                  isPlatinumShimmer={isPlatinumShimmer}
                  isPopular={isPopular}
                />
              </MapboxGL.PointAnnotation>
            );
          })
        )}
      </MapboxGL.MapView>

      {/* Empty State Overlay - When no moments found */}
      {!momentsLoading && clusteredMarkers.length === 0 && (
        <Animated.View
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(300)}
          style={styles.emptyOverlay}
        >
          <GlassCard
            intensity={50}
            tint="dark"
            padding={24}
            borderRadius={24}
            style={styles.emptyCard}
          >
            <MaterialCommunityIcons
              name="map-search-outline"
              size={48}
              color={COLORS.text.muted}
            />
            <Text style={styles.emptyTitle}>Bu kriterlerde an yok 🗺️</Text>
            <Text style={styles.emptySubtitle}>
              Mesafe filtresini artırmayı dene{'\n'}veya farklı kategorilere
              bak!
            </Text>
            <TouchableOpacity
              style={styles.emptyCTAButton}
              onPress={handleFilterPress}
            >
              <Text style={styles.emptyCTAText}>Filtreleri Düzenle</Text>
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>
      )}

      {/* Top Overlay - Enhanced Search Bar */}
      <View style={[styles.topOverlay, { top: insets.top + 8 }]}>
        <EnhancedSearchBar
          placeholder="Hangi anıya ortak olmak istersin?"
          onFilterPress={handleFilterPress}
          hasActiveFilters={hasActiveFilters}
        />
      </View>

      {/* Right Side - Location Button */}
      <Animated.View
        style={[
          styles.locationButtonContainer,
          { top: insets.top + 80 },
          locationButtonStyle,
        ]}
      >
        <TouchableOpacity
          onPress={handleCenterOnUser}
          onPressIn={handleLocationPressIn}
          onPressOut={handleLocationPressOut}
          activeOpacity={0.9}
        >
          <GlassCard
            intensity={40}
            tint="dark"
            padding={0}
            borderRadius={25}
            style={styles.iconCircle}
          >
            <Ionicons name="navigate" size={22} color={COLORS.primary} />
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Overlay - Selected Moment Preview */}
      {selectedMoment && (
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.springify().damping(15)}
          style={[styles.bottomOverlay, { paddingBottom: insets.bottom + 100 }]}
        >
          <GlassCard
            intensity={50}
            tint="dark"
            padding={0}
            borderRadius={24}
            style={styles.previewCard}
          >
            <View style={styles.previewContent}>
              {/* Header */}
              <View style={styles.previewHeader}>
                <View style={styles.previewTitleContainer}>
                  <Text style={styles.previewTitle} numberOfLines={1}>
                    {selectedMoment.title}
                  </Text>
                  <Text style={styles.previewPrice}>
                    {selectedMoment.price}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClosePreview}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={28}
                    color={COLORS.text.muted}
                  />
                </TouchableOpacity>
              </View>

              {/* Host info with Trust Score */}
              {selectedMoment.hostName && (
                <View style={styles.hostContainer}>
                  <Text style={styles.hostText}>
                    Hosted by {selectedMoment.hostName}
                  </Text>
                  {selectedMoment.hostTrustScore !== undefined && (
                    <TrustBadge
                      type="trust"
                      trustScore={selectedMoment.hostTrustScore}
                      size="sm"
                    />
                  )}
                </View>
              )}

              {/* Subscriber action button */}
              <TouchableOpacity
                style={[
                  styles.detailsAction,
                  ['premium', 'platinum'].includes(userTier) &&
                    styles.subscriberAction,
                ]}
                onPress={handleViewDetails}
                activeOpacity={0.7}
              >
                <Text style={styles.detailsText}>
                  {['premium', 'platinum'].includes(userTier)
                    ? 'Teklif Ver'
                    : 'Detayları Gör'}
                </Text>
                <Ionicons
                  name={
                    ['premium', 'platinum'].includes(userTier)
                      ? 'gift'
                      : 'arrow-forward'
                  }
                  size={16}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab="Discover" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // Top overlay
  topOverlay: {
    position: 'absolute',
    width: '100%',
    zIndex: 10,
  },
  // Location button
  locationButtonContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  iconCircle: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Bottom overlay
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  previewCard: {
    backgroundColor: 'rgba(20, 20, 22, 0.85)',
  },
  previewContent: {
    padding: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  previewTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  previewTitle: {
    fontSize: FONT_SIZES_V2.h4,
    fontFamily: FONTS.display.bold,
    color: COLORS.text.onDark,
    fontWeight: '700',
    marginBottom: 4,
  },
  previewPrice: {
    fontSize: FONT_SIZES_V2.bodyLarge,
    fontFamily: FONTS.mono.medium,
    color: COLORS.primary,
    fontWeight: '600',
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  hostText: {
    fontSize: FONT_SIZES_V2.bodySmall,
    fontFamily: FONTS.body.regular,
    color: COLORS.textOnDarkSecondary,
  },
  detailsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
    alignSelf: 'flex-start',
  },
  subscriberAction: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)', // Magenta tint
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detailsText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES_V2.body,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
  },
  // Cluster marker styles
  clusterMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  clusterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  // User marker
  userMarker: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
  },
  userMarkerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
  },
  fallbackSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  // Empty state overlay
  emptyOverlay: {
    position: 'absolute',
    top: '40%',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyCTAButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  emptyCTAText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default withErrorBoundary(SearchMapScreen, {
  displayName: 'SearchMapScreen',
});
