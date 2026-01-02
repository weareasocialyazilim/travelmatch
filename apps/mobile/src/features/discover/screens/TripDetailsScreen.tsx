import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TripDetailsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Itinerary</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Status Card */}
        <LinearGradient
          colors={[COLORS.brand.primary, '#2ecc71']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.statusCard}
        >
          <View>
            <Text style={styles.statusTitle}>Confirmed</Text>
            <Text style={styles.statusSub}>You're all set for tonight!</Text>
          </View>
          <MaterialCommunityIcons name="check-decagram" size={40} color="black" />
        </LinearGradient>

        <Text style={styles.momentTitle}>Dinner at Hotel Costes</Text>
        <Text style={styles.time}>Today, 20:00 - 22:00</Text>

        {/* Weather Widget */}
        <View style={styles.weatherRow}>
          <MaterialCommunityIcons name="weather-night" size={24} color="#FFD700" />
          <Text style={styles.weatherText}>18°C, Clear Sky</Text>
        </View>

        {/* Host Info */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Meeting With</Text>
          <TouchableOpacity style={styles.hostCard} onPress={() => navigation.navigate('UserProfile')}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100' }} style={styles.avatar} />
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>Selin Yılmaz</Text>
              <Text style={styles.hostRole}>Verified Host</Text>
            </View>
            <View style={styles.chatBtn}>
              <Ionicons name="chatbubble-outline" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Location</Text>
          <View style={styles.mapCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600' }} style={styles.mapImage} />
            <View style={styles.mapOverlay}>
              <Text style={styles.address}>239 Rue Saint-Honoré, Paris</Text>
              <TouchableOpacity style={styles.directionsBtn}>
                <Text style={styles.directionsText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.ticketBtn} onPress={() => navigation.navigate('Ticket')}>
          <MaterialCommunityIcons name="ticket-confirmation-outline" size={24} color="black" />
          <Text style={styles.ticketBtnText}>View Entry Ticket</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { padding: 20 },
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 16, marginBottom: 24 },
  statusTitle: { fontSize: 20, fontWeight: '900', color: 'black' },
  statusSub: { fontSize: 14, color: 'black', fontWeight: '500' },
  momentTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  time: { fontSize: 16, color: COLORS.brand.primary, fontWeight: '600', marginBottom: 12 },
  weatherRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 30 },
  weatherText: { color: 'white', fontWeight: '500' },
  section: { marginBottom: 30 },
  sectionHeader: { color: '#888', fontSize: 12, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  hostCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 16, gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  hostName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  hostRole: { color: COLORS.brand.primary, fontSize: 12 },
  chatBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  mapCard: { height: 180, borderRadius: 16, overflow: 'hidden', backgroundColor: '#222' },
  mapImage: { width: '100%', height: '100%', opacity: 0.6 },
  mapOverlay: { position: 'absolute', bottom: 0, width: '100%', padding: 16, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  address: { color: 'white', fontSize: 14, width: '60%' },
  directionsBtn: { backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  directionsText: { color: 'black', fontWeight: 'bold', fontSize: 12 },
  ticketBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.brand.primary, padding: 18, borderRadius: 16, marginBottom: 40 },
  ticketBtnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
  headerSpacer: { width: 24 },
  hostInfo: { flex: 1 },
});
