/**
 * SearchMapScreen - Immersive Map Experience
 *
 * Awwwards-standard map view with:
 * - Dark mode optimized theme
 * - Liquid Glass overlays
 * - Neon pulse markers
 * - Smooth animations and transitions
 *
 * "The map is art, the moments are destinations."
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

import { COLORS } from '@/constants/colors';
import { FONT_SIZES_V2, FONTS } from '@/constants/typography';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { GlassCard } from '@/components/ui/GlassCard';
import { EnhancedSearchBar } from '@/components/discover/EnhancedSearchBar';
import { NeonPulseMarker } from '../components/NeonPulseMarker';
import BottomNav from '@/components/BottomNav';

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

interface MapLocation {
  latitude: number;
  longitude: number;
}

interface MomentMarker {
  id: string;
  lat: number;
  lng: number;
  price: string;
  title: string;
  category?: string;
  hostName?: string;
  imageUrl?: string;
}

// Mock data for demonstration
const MOCK_MARKERS: MomentMarker[] = [
  {
    id: '1',
    lat: 41.0082,
    lng: 28.9784,
    price: '$45',
    title: 'Istanbul Sunset Tour',
    category: 'culture',
    hostName: 'Ahmet',
  },
  {
    id: '2',
    lat: 41.015,
    lng: 28.985,
    price: '$20',
    title: 'Bosphorus Coffee',
    category: 'food',
    hostName: 'Elif',
  },
  {
    id: '3',
    lat: 41.005,
    lng: 28.965,
    price: '$65',
    title: 'Night Photography',
    category: 'nightlife',
    hostName: 'Can',
  },
];

const SearchMapScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cameraRef = useRef<any>(null);

  // State
  const [userLocation, setUserLocation] = useState<MapLocation | null>(null);
  const [selectedMoment, setSelectedMoment] = useState<MomentMarker | null>(
    null,
  );
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [_mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Animations
  const locationButtonScale = useSharedValue(1);

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

  // Handle marker selection
  const handleMarkerPress = useCallback((marker: MomentMarker) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedMoment(marker);

    // Animate camera to marker
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [marker.lng, marker.lat],
        zoomLevel: 15,
        animationDuration: 500,
      });
    }
  }, []);

  // Close preview card
  const handleClosePreview = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMoment(null);
  }, []);

  // Navigate to moment detail
  const handleViewDetails = useCallback(() => {
    if (selectedMoment) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigation.navigate('MomentDetail', {
        momentId: selectedMoment.id,
        title: selectedMoment.title,
      });
    }
  }, [navigation, selectedMoment]);

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

        {/* Moment Markers */}
        {MOCK_MARKERS.map((marker) => (
          <MapboxGL.PointAnnotation
            key={marker.id}
            id={`marker-${marker.id}`}
            coordinate={[marker.lng, marker.lat]}
            onSelected={() => handleMarkerPress(marker)}
          >
            <NeonPulseMarker
              price={marker.price}
              isSelected={selectedMoment?.id === marker.id}
              size="medium"
            />
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>

      {/* Top Overlay - Enhanced Search Bar */}
      <View style={[styles.topOverlay, { top: insets.top + 8 }]}>
        <EnhancedSearchBar
          placeholder="Nereye gitmek istersin?"
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

              {/* Host info */}
              {selectedMoment.hostName && (
                <Text style={styles.hostText}>
                  Hosted by {selectedMoment.hostName}
                </Text>
              )}

              {/* Action */}
              <TouchableOpacity
                style={styles.detailsAction}
                onPress={handleViewDetails}
                activeOpacity={0.7}
              >
                <Text style={styles.detailsText}>Detayları Gör</Text>
                <Ionicons
                  name="arrow-forward"
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
  hostText: {
    fontSize: FONT_SIZES_V2.bodySmall,
    fontFamily: FONTS.body.regular,
    color: COLORS.textOnDarkSecondary,
    marginTop: 8,
  },
  detailsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
    alignSelf: 'flex-start',
  },
  detailsText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES_V2.body,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
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
});

export default withErrorBoundary(SearchMapScreen, {
  displayName: 'SearchMapScreen',
});
