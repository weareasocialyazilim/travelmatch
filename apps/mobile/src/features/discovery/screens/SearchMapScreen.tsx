import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapboxGL from '@rnmapbox/maps';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import BottomNav from '@/components/BottomNav';
import { COLORS } from '@/constants/colors';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MapLocation {
  latitude: number;
  longitude: number;
}

const SearchMapScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<MapLocation | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Animation
  const searchBarAnim = useRef(new Animated.Value(0)).current;

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
      } catch (error) {
        // Default to a central location if permission denied
        setUserLocation({
          latitude: 41.0082, // Istanbul
          longitude: 28.9784,
        });
      }
    };
    getLocation();
  }, []);

  // Handle search focus animation
  useEffect(() => {
    Animated.spring(searchBarAnim, {
      toValue: isSearchFocused ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 10,
    }).start();
  }, [isSearchFocused, searchBarAnim]);

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

  // Handle search
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // TODO: Implement geocoding search
      setIsSearchFocused(false);
    }
  }, [searchQuery]);

  const searchBarWidth = searchBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH - 32, SCREEN_WIDTH - 80],
  });

  return (
    <View style={styles.container}>
      {/* Map */}
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
          zoomLevel={12}
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
              <View style={styles.userMarkerInner} />
            </View>
          </MapboxGL.PointAnnotation>
        )}
      </MapboxGL.MapView>

      {/* Search Bar Overlay */}
      <SafeAreaView style={styles.searchOverlay} edges={['top']}>
        <View style={styles.searchContainer}>
          <Animated.View style={[styles.searchBar, { width: searchBarWidth }]}>
            <MaterialCommunityIcons
              name="magnify"
              size={22}
              color={COLORS.text.secondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search locations..."
              placeholderTextColor={COLORS.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color={COLORS.text.muted}
                />
              </TouchableOpacity>
            )}
          </Animated.View>

          {isSearchFocused && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsSearchFocused(false);
                setSearchQuery('');
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleCenterOnUser}
          accessibilityLabel="Center on my location"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  map: {
    flex: 1,
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    padding: 0,
  },
  cancelButton: {
    marginLeft: 12,
  },
  cancelText: {
    color: COLORS.brand.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default withErrorBoundary(SearchMapScreen, 'SearchMapScreen');
