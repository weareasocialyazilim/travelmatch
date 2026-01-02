import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

export const HostMomentDetailScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const handleDelete = () => {
    Alert.alert(
      "Delete Moment?",
      "This action cannot be undone. Current applicants will be notified.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=600' }}
        style={styles.headerImage}
      >
        <LinearGradient colors={['rgba(0,0,0,0.3)', COLORS.background.primary]} style={styles.gradient} />

        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('EditMoment')}>
            <MaterialCommunityIcons name="pencil" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <View style={styles.statusBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.statusText}>LIVE NOW</Text>
          </View>
          <Text style={styles.title}>Dinner at Hotel Costes</Text>
          <Text style={styles.price}>Ask: $150</Text>
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <BlurView intensity={20} style={styles.statBox}>
            <Text style={styles.statVal}>1.2k</Text>
            <Text style={styles.statLabel}>Views</Text>
          </BlurView>
          <BlurView intensity={20} style={styles.statBox}>
            <Text style={styles.statVal}>8</Text>
            <Text style={styles.statLabel}>Requests</Text>
          </BlurView>
          <BlurView intensity={20} style={styles.statBox}>
            <Text style={styles.statVal}>24</Text>
            <Text style={styles.statLabel}>Saves</Text>
          </BlurView>
        </View>

        {/* Actions */}
        <Text style={styles.sectionTitle}>Manage</Text>

        <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('RequestManager')}>
          <View style={[styles.iconBox, { backgroundColor: COLORS.brand.primary }]}>
            <MaterialCommunityIcons name="account-group" size={24} color="black" />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>View Requests</Text>
            <Text style={styles.actionDesc}>8 people want to join you</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow}>
          <View style={[styles.iconBox, styles.iconBoxGold]}>
            <MaterialCommunityIcons name="rocket-launch" size={24} color="black" />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Boost Moment</Text>
            <Text style={styles.actionDesc}>Get 3x more visibility for $5</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>Archive / Delete Moment</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  headerImage: { height: 350, justifyContent: 'space-between' },
  gradient: { ...StyleSheet.absoluteFillObject },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  titleContainer: { padding: 20 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 255, 0, 0.2)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00FF00', marginRight: 6 },
  statusText: { color: '#00FF00', fontSize: 10, fontWeight: 'bold' },
  title: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  price: { color: COLORS.brand.primary, fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 30, marginTop: -50 },
  statBox: { flex: 1, backgroundColor: 'rgba(20,20,20,0.8)', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statVal: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 4 },
  sectionTitle: { color: '#666', fontSize: 14, fontWeight: 'bold', marginBottom: 16, textTransform: 'uppercase' },
  actionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  iconBoxGold: { backgroundColor: '#FFD700' },
  actionText: { flex: 1 },
  actionTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  actionDesc: { color: '#888', fontSize: 12, marginTop: 2 },
  deleteBtn: { marginTop: 20, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FF4444', borderRadius: 16 },
  deleteText: { color: '#FF4444', fontWeight: 'bold' },
});
