import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

export const MaintenanceScreen = () => {
  const handleCheckStatus = () => {
    Linking.openURL('https://status.travelmatch.app');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="tools" size={50} color="#FFD700" />
        </View>

        <Text style={styles.title}>Bakımdayız</Text>
        <Text style={styles.desc}>
          TravelMatch deneyimini daha iyi hale getirmek için kısa bir mola verdik.
          Çok yakında geri döneceğiz!
        </Text>

        <View style={styles.statusBox}>
          <View style={styles.statusRow}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>Sistem Güncellemesi</Text>
          </View>
          <Text style={styles.timeText}>Tahmini süre: 30 dk</Text>
        </View>
      </View>

      <TouchableOpacity onPress={handleCheckStatus} style={styles.linkBtn}>
        <Text style={styles.linkText}>Sistem Durumunu Kontrol Et</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundDark, padding: 30, justifyContent: 'center' },
  content: { alignItems: 'center' },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)'
  },
  title: { fontSize: 32, fontWeight: '900', color: 'white', marginBottom: 16 },
  desc: { color: COLORS.text.secondary, textAlign: 'center', fontSize: 16, lineHeight: 24, marginBottom: 40 },
  statusBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD700', marginRight: 10 },
  statusText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  timeText: { color: '#888', fontSize: 12, marginLeft: 18 },
  linkBtn: { marginTop: 40, alignSelf: 'center', padding: 10 },
  linkText: { color: COLORS.brand.primary, fontWeight: '600' }
});
