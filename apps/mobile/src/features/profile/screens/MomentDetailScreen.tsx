import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export const MomentDetailScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  // route.params'dan data gelir

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=800' }}
            style={styles.image}
          />
          <LinearGradient colors={['transparent', COLORS.background.primary]} style={styles.gradient} />

          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { top: insets.top + 10 }]}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.shareBtn, { top: insets.top + 10 }]}>
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Host Info */}
          <View style={styles.hostRow}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100' }} style={styles.avatar} />
            <View>
              <Text style={styles.hostName}>Hosted by Selin Y.</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>4.9 (45)</Text>
                <View style={styles.dot} />
                <Text style={styles.verified}>Verified Host</Text>
              </View>
            </View>
          </View>

          <Text style={styles.title}>Sunset Dinner at Hotel Costes</Text>

          <View style={styles.tags}>
            <View style={styles.tag}><Text style={styles.tagText}>Dining 🍽️</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>Paris 🇫🇷</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>$$$</Text></View>
          </View>

          <Text style={styles.desc}>
            Join me for an unforgettable dinner at the iconic Hotel Costes.
            Great vibes, amazing music, and the best spicy pasta in town.
            Looking for good company to share stories.
          </Text>

          <View style={styles.mapPreview}>
            <MaterialCommunityIcons name="map-marker-radius" size={24} color={COLORS.brand.primary} />
            <Text style={styles.locationText}>239 Rue Saint-Honoré, Paris</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" style={{ marginLeft: 'auto' }} />
          </View>

          <Text style={styles.sectionTitle}>What to expect</Text>
          <View style={styles.expectRow}>
            <View style={styles.expectItem}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="white" />
              <Text style={styles.expectLabel}>2 Hours</Text>
            </View>
            <View style={styles.expectItem}>
              <MaterialCommunityIcons name="account-group" size={24} color="white" />
              <Text style={styles.expectLabel}>Up to 2 Guests</Text>
            </View>
            <View style={styles.expectItem}>
              <MaterialCommunityIcons name="glass-cocktail" size={24} color="white" />
              <Text style={styles.expectLabel}>Drinks Incl.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <BlurView intensity={90} tint="dark" style={[styles.fab, { paddingBottom: insets.bottom + 20 }]}>
        <View>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.price}>$150<Text style={styles.perPerson}> / person</Text></Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('ChatDetail', { chatId: 'new' })}
        >
          <Text style={styles.bookText}>Request to Join</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  imageContainer: { height: height * 0.45, width: '100%' },
  image: { width: '100%', height: '100%' },
  gradient: { position: 'absolute', bottom: 0, width: '100%', height: 150 },
  backBtn: { position: 'absolute', left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  shareBtn: { position: 'absolute', right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24, marginTop: -40 },
  hostRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, borderWidth: 2, borderColor: COLORS.brand.primary },
  hostName: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: 'white', fontSize: 12, fontWeight: '600' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#666' },
  verified: { color: COLORS.brand.primary, fontSize: 12, fontWeight: 'bold' },
  title: { fontSize: 32, fontWeight: '900', color: 'white', marginBottom: 12, lineHeight: 36 },
  tags: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tag: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tagText: { color: 'white', fontSize: 12, fontWeight: '600' },
  desc: { color: '#ccc', fontSize: 16, lineHeight: 24, marginBottom: 24 },
  mapPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, marginBottom: 30 },
  locationText: { color: 'white', fontWeight: '600', marginLeft: 10, fontSize: 14 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  expectRow: { flexDirection: 'row', justifyContent: 'space-between' },
  expectItem: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, width: '30%' },
  expectLabel: { color: '#ccc', fontSize: 12, marginTop: 8, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 0, width: '100%', padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  priceLabel: { color: '#888', fontSize: 12 },
  price: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  perPerson: { fontSize: 14, fontWeight: 'normal', color: '#888' },
  bookBtn: { backgroundColor: COLORS.brand.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  bookText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});

export default MomentDetailScreen;
