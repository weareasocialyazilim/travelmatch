import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

export const BiometricSetupScreen = () => {
  const navigation = useNavigation();
  const handleEnable = () => {
    // Biometric logic
    navigation.reset({ index: 0, routes: [{ name: 'Discover' }] });
  };

  const handleSkip = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Discover' }] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="face-recognition" size={80} color={COLORS.brand.primary} />
          <View style={styles.scanLine} />
        </View>

        <Text style={styles.title}>Secure your Wallet</Text>
        <Text style={styles.desc}>
          Enable FaceID to log in faster and confirm payments securely.
        </Text>

        <View style={styles.spacer} />

        <TouchableOpacity style={styles.enableBtn} onPress={handleEnable}>
          <LinearGradient
             colors={[COLORS.brand.primary, '#A2FF00']}
             style={styles.gradient}
          >
            <MaterialCommunityIcons name="fingerprint" size={24} color="black" style={{ marginRight: 10 }} />
            <Text style={styles.btnText}>Enable Biometrics</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  content: { flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center' },
  iconContainer: { width: 140, height: 140, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  scanLine: { position: 'absolute', width: '100%', height: 2, backgroundColor: COLORS.brand.primary, top: '50%', opacity: 0.5 },
  title: { fontSize: 32, fontWeight: '900', color: 'white', marginBottom: 16, textAlign: 'center' },
  desc: { color: COLORS.text.secondary, textAlign: 'center', fontSize: 16, lineHeight: 24 },
  spacer: { flex: 1 },
  enableBtn: { width: '100%', borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  gradient: { paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
  skipBtn: { padding: 12 },
  skipText: { color: '#666', fontWeight: '600' },
});

export default BiometricSetupScreen;
