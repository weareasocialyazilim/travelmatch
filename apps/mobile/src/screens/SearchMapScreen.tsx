import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Text,
} from 'react-native';
import Mapbox, { Camera, MapView, PointAnnotation } from '@rnmapbox/maps';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import type { RootStackParamList } from '../navigation/routeParams';

// Initialize Mapbox
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');

// Mapbox Dark Style URL
const MAP_STYLE_URL = 'mapbox://styles/mapbox/dark-v11';

interface Hotspot {
  id: number;
  lat: number;
  lng: number;
  image: string;
  title: string;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 1,
    lat: 41.0082,
    lng: 28.9784,
    image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=100',
    title: 'Galata',
  },
  {
    id: 2,
    lat: 41.0369,
    lng: 28.985,
    image: 'https://images.unsplash.com/photo-1545959958-69cb91012354?q=80&w=100',
    title: 'Taksim',
  },
];

const FILTERS = ['Coffee ☕️', 'Dining 🍽️', 'Adventure 🧗', 'Nightlife 🍸'];

export const SearchMapScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleMarkerPress = (spot: Hotspot) => {
    // Navigate to relevant screen or show detail
    console.log('Marker pressed:', spot.title);
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} styleURL={MAP_STYLE_URL}>
        <Camera
          zoomLevel={12}
          centerCoordinate={[28.9784, 41.0082]} // Istanbul center [lng, lat]
        />
        {HOTSPOTS.map((spot) => (
          <PointAnnotation
            key={spot.id.toString()}
            id={`hotspot-${spot.id}`}
            coordinate={[spot.lng, spot.lat]}
            onSelected={() => handleMarkerPress(spot)}
          >
            <View style={styles.markerContainer}>
              <Image source={{ uri: spot.image }} style={styles.markerImage} />
              <View style={styles.markerArrow} />
            </View>
          </PointAnnotation>
        ))}
      </MapView>

      {/* Search Bar Floating */}
      <View style={[styles.searchContainer, { top: insets.top + 10 }]}>
        <BlurView intensity={80} tint="dark" style={styles.searchBlur}>
          <Ionicons name="search" size={20} color={COLORS.text.secondary} />
          <TextInput
            placeholder="Search vibes, cities, or people..."
            placeholderTextColor={COLORS.text.secondary}
            style={styles.searchInput}
          />
        </BlurView>

        {/* Quick Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterRowContent}
        >
          {FILTERS.map((filter, index) => (
            <TouchableOpacity key={index} style={styles.filterChip}>
              <Text style={styles.filterText}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Floating Dock / Bottom Navigation */}
      <View style={[styles.floatingDock, { bottom: insets.bottom + 20 }]}>
        <BlurView intensity={80} tint="dark" style={styles.dockBlur}>
          <TouchableOpacity
            style={styles.dockItem}
            onPress={() => navigation.navigate('Discover')}
          >
            <Ionicons name="home-outline" size={24} color={COLORS.textOnDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.dockItem}>
            <Ionicons name="map" size={24} color={COLORS.brand.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dockItem}
            onPress={() => navigation.navigate('Messages')}
          >
            <Ionicons name="chatbubble-outline" size={24} color={COLORS.textOnDark} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dockItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-outline" size={24} color={COLORS.textOnDark} />
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.brand.primary,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.brand.primary,
    marginTop: -2,
  },
  searchContainer: {
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 16,
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.utility.white,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterRowContent: {
    paddingRight: 16,
  },
  filterChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterText: {
    color: COLORS.utility.white,
    fontWeight: '600',
  },
  floatingDock: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  dockBlur: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  dockItem: {
    padding: 8,
  },
});

export default SearchMapScreen;
