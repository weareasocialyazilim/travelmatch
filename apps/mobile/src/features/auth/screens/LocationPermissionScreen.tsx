import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const LocationPermissionScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleEnable = () => {
    // Request permission logic here
    navigation.replace('Discover');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[COLORS.brand.primary, 'rgba(204, 255, 0, 0.2)']}
            style={styles.iconGradient}
          >
            <MaterialCommunityIcons name="map-marker-radius" size={80} color="black" />
          </LinearGradient>
          {/* Decorative Rings */}
          <View style={[styles.ring, { width: 160, height: 160, opacity: 0.3 }]} />
          <View style={[styles.ring, { width: 220, height: 220, opacity: 0.1 }]} />
        </View>

        <Text style={styles.title}>Find Vibes Near You</Text>
        <Text style={styles.desc}>
          TravelMatch needs your location to show you exclusive moments and local travelers in your area.
        </Text>

        <View style={styles.features}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="check" size={20} color={COLORS.brand.primary} />
            <Text style={styles.featureText}>See moments happening now nearby</Text>
          </View>
          <View style={styles.row}>
            <MaterialCommunityIcons name="check" size={20} color={COLORS.brand.primary} />
            <Text style={styles.featureText}>Verify you are at the meeting point</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.primaryBtn} onPress={handleEnable}>
          <Text style={styles.primaryText}>Enable Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.replace('Discover')}>
          <Text style={styles.secondaryText}>Maybe Later</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + 20 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  content: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  iconContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 40, marginTop: 60 },
  iconGradient: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: COLORS.brand.primary },
  title: { fontSize: 32, fontWeight: '900', color: 'white', textAlign: 'center', marginBottom: 16 },
  desc: { color: COLORS.text.secondary, textAlign: 'center', fontSize: 16, lineHeight: 24, marginBottom: 40 },
  features: { alignSelf: 'flex-start', marginLeft: 20, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { color: 'white', fontSize: 16 },
  primaryBtn: { width: '100%', backgroundColor: COLORS.brand.primary, padding: 18, borderRadius: 20, alignItems: 'center', marginBottom: 16 },
  primaryText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
  secondaryBtn: { padding: 10 },
  secondaryText: { color: '#666', fontWeight: '600' },
});

export default LocationPermissionScreen;
