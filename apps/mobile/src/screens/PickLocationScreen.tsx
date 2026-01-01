import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import MapView from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export const PickLocationScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
  });

  const handleConfirm = () => {
    // Return selected location to previous screen
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 41.0082,
          longitude: 28.9784,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onRegionChangeComplete={(region) => setSelectedLocation(region)}
      >
        {/* Center Marker is static in UI, map moves underneath */}
      </MapView>

      <View style={styles.centerMarker}>
        <Ionicons name="location" size={40} color={COLORS.brand.primary} />
      </View>

      {/* Top Bar */}
      <View style={[styles.header, { top: insets.top }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
        <BlurView intensity={80} style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <Text style={styles.searchText}>Search nearby places...</Text>
        </BlurView>
      </View>

      {/* Bottom Card */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>Selected Location</Text>
          <Text style={styles.coords}>
            {selectedLocation.latitude.toFixed(4)},{' '}
            {selectedLocation.longitude.toFixed(4)}
          </Text>
        </View>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  map: { width, height },
  centerMarker: {
    position: 'absolute',
    top: height / 2 - 20,
    left: width / 2 - 20,
    zIndex: 10,
  },
  header: {
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  searchBar: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  searchText: { color: '#666', fontSize: 14 },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  locationInfo: { marginBottom: 20 },
  locationTitle: { fontSize: 16, fontWeight: 'bold', color: 'black' },
  coords: { fontSize: 12, color: '#666', marginTop: 4 },
  confirmBtn: {
    backgroundColor: COLORS.brand.primary,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});

export default PickLocationScreen;
