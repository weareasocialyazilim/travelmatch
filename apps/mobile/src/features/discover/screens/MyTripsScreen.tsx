import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

const TRIPS = [
  { id: '1', title: 'Dinner at Hotel Costes', date: 'Tonight, 20:00', status: 'upcoming', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=200', host: 'Selin Y.' },
  { id: '2', title: 'Louvre Private Tour', date: 'Feb 14, 2026', status: 'upcoming', image: 'https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?q=80&w=200', host: 'Marc B.' },
  { id: '3', title: 'Coffee at Petra', date: 'Jan 10, 2026', status: 'completed', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=200', host: 'John D.' },
];

export const MyTripsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  const renderItem = ({ item }: { item: typeof TRIPS[0] }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TripDetails', { tripId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, item.status === 'upcoming' ? styles.badgeUpcoming : styles.badgePast]}>
            <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.hostRow}>
          <MaterialCommunityIcons name="account-circle-outline" size={16} color="#888" />
          <Text style={styles.host}>Hosted by {item.host}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>My Trips</Text>
        <TouchableOpacity><Ionicons name="calendar-outline" size={24} color="white" /></TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setFilter('upcoming')} style={[styles.tab, filter === 'upcoming' && styles.activeTab]}>
          <Text style={[styles.tabText, filter === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('past')} style={[styles.tab, filter === 'past' && styles.activeTab]}>
          <Text style={[styles.tabText, filter === 'past' && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={TRIPS.filter(t => filter === 'upcoming' ? t.status === 'upcoming' : t.status === 'completed')}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="bag-suitcase-off" size={48} color="#333" />
            <Text style={styles.emptyText}>No trips found.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: 'rgba(255,255,255,0.1)' },
  tabText: { color: '#666', fontWeight: '600' },
  activeTabText: { color: 'white' },
  list: { padding: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 16, marginBottom: 12 },
  image: { width: 70, height: 70, borderRadius: 12, marginRight: 16 },
  info: { flex: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, marginRight: 10 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeUpcoming: { backgroundColor: 'rgba(0, 255, 0, 0.1)' },
  badgePast: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: 'white' },
  date: { fontSize: 10, color: '#888' },
  title: { color: 'white', fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  host: { color: '#888', fontSize: 12 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#666', marginTop: 10 },
});
