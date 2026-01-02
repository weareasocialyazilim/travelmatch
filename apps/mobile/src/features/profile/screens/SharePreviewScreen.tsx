import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const SharePreviewScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="close" size={28} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Share Moment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.previewContainer}>
        <View style={styles.card}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=600' }}
            style={styles.cardImage}
            imageStyle={styles.cardImageBorderRadius}
          >
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.gradient} />
            <View style={styles.cardContent}>
              <View style={styles.logoRow}>
                <MaterialCommunityIcons name="compass-rose" size={24} color={COLORS.brand.primary} />
                <Text style={styles.appName}>TravelMatch</Text>
              </View>
              <Text style={styles.title}>Dinner at Hotel Costes</Text>
              <Text style={styles.price}>$150 Experience</Text>
            </View>
          </ImageBackground>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.shareBtn}>
          <MaterialCommunityIcons name="instagram" size={24} color="white" />
          <Text style={styles.shareText}>Stories</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn}>
          <MaterialCommunityIcons name="whatsapp" size={24} color="white" />
          <Text style={styles.shareText}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.copyBtn}>
          <Text style={styles.copyText}>Copy Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundDark },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  previewContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { width: width * 0.75, height: width * 1.2, borderRadius: 20, overflow: 'hidden', shadowColor: COLORS.brand.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  cardImage: { width: '100%', height: '100%', justifyContent: 'space-between' },
  gradient: { ...StyleSheet.absoluteFillObject },
  cardContent: { padding: 24, justifyContent: 'flex-end', flex: 1 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 'auto', paddingTop: 20 },
  appName: { color: 'white', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 },
  title: { color: 'white', fontSize: 28, fontWeight: '900', marginBottom: 8 },
  price: { color: COLORS.brand.primary, fontSize: 20, fontWeight: 'bold' },
  actions: { padding: 30, flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 50 },
  shareBtn: { alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 16, width: '30%' },
  shareText: { color: 'white', fontSize: 12, fontWeight: '600' },
  copyBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, width: '30%' },
  copyText: { color: 'white', fontSize: 12, fontWeight: '600' },
  headerSpacer: { width: 28 },
  cardImageBorderRadius: { borderRadius: 20 },
});

export default SharePreviewScreen;
