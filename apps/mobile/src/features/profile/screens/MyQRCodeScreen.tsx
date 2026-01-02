import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const MyQRCodeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const PROFILE_LINK = 'travelmatch.app/u/selin';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 20 }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.cardContainer}>
        <LinearGradient
          colors={[COLORS.brand.primary, COLORS.brand.secondary]}
          style={styles.gradientCard}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
              }}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.name}>Selin Yılmaz</Text>
          <Text style={styles.handle}>@selin.y</Text>

          <View style={styles.qrBg}>
            <QRCode value={PROFILE_LINK} size={180} />
          </View>

          <Text style={styles.scanText}>Scan to find my vibes</Text>
        </LinearGradient>
      </View>

      <TouchableOpacity style={styles.shareBtn}>
        <Text style={styles.shareText}>Share Profile Link</Text>
        <Ionicons name="share-outline" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: width * 0.85,
    height: width * 1.1,
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  gradientCard: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    padding: 30,
    justifyContent: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'white',
  },
  name: { fontSize: 24, fontWeight: 'bold', color: 'black' },
  handle: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.6)',
    marginBottom: 30,
    fontWeight: '600',
  },
  qrBg: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
  },
  scanText: { color: 'rgba(0,0,0,0.7)', fontWeight: '600', letterSpacing: 1 },
  shareBtn: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
  },
  shareText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
