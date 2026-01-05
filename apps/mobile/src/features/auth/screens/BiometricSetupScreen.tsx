import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { biometricAuth, BiometricType } from '@/services/biometricAuth';
import { useToast } from '@/context/ToastContext';

const BIOMETRIC_REMINDER_KEY = '@biometric_remind_later';

export const BiometricSetupScreen = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Face ID');

  useEffect(() => {
    // Get biometric type name for display
    const initBiometric = async () => {
      await biometricAuth.initialize();
      setBiometricType(biometricAuth.getBiometricTypeName());
    };
    initBiometric();
  }, []);

  const handleEnable = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      // Clear any remind later flag
      await AsyncStorage.removeItem(BIOMETRIC_REMINDER_KEY);

      // Enable biometric authentication (this will prompt for verification)
      const enabled = await biometricAuth.enable();

      if (enabled) {
        showToast(`${biometricType} başarıyla etkinleştirildi`, 'success');
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' as never }] });
      } else {
        showToast(`${biometricType} doğrulaması başarısız`, 'error');
      }
    } catch (error) {
      showToast('Biyometrik kurulumu başarısız oldu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' as never }] });
  };

  const handleRemindLater = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Set remind later flag with timestamp
    const remindDate = new Date();
    remindDate.setDate(remindDate.getDate() + 3); // Remind in 3 days
    await AsyncStorage.setItem(
      BIOMETRIC_REMINDER_KEY,
      remindDate.toISOString(),
    );
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' as never }] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="face-recognition"
            size={80}
            color={COLORS.brand.primary}
          />
          <View style={styles.scanLine} />
        </View>

        <Text style={styles.title}>Cüzdanını Güvence Altına Al</Text>
        <Text style={styles.desc}>
          Daha hızlı giriş yapmak ve ödemelerini güvenle onaylamak için
          {biometricType}'yi etkinleştir.
        </Text>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitRow}>
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={20}
              color={COLORS.brand.primary}
            />
            <Text style={styles.benefitText}>Saniyeler içinde giriş yap</Text>
          </View>
          <View style={styles.benefitRow}>
            <MaterialCommunityIcons
              name="shield-check"
              size={20}
              color={COLORS.brand.primary}
            />
            <Text style={styles.benefitText}>Ödemeleri güvenle onayla</Text>
          </View>
          <View style={styles.benefitRow}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={COLORS.brand.primary}
            />
            <Text style={styles.benefitText}>Şifre hatırlamaya son</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={[styles.enableBtn, isLoading && styles.disabledBtn]}
          onPress={handleEnable}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[COLORS.brand.primary, '#A2FF00']}
            style={styles.gradient}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="black" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={24}
                  color="black"
                  style={styles.fingerprintIcon}
                />
                <Text style={styles.btnText}>
                  {biometricType}'yi Etkinleştir
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Sonra Hatırlat - UX improvement */}
        <TouchableOpacity style={styles.remindBtn} onPress={handleRemindLater}>
          <MaterialCommunityIcons
            name="bell-outline"
            size={18}
            color={COLORS.brand.primary}
          />
          <Text style={styles.remindText}>Sonra Hatırlat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Şimdilik Geç</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  content: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: COLORS.brand.primary,
    top: '50%',
    opacity: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  desc: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  benefitsContainer: { width: '100%', gap: 12, marginBottom: 16 },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  benefitText: { color: COLORS.text.primary, fontSize: 14 },
  spacer: { flex: 1, minHeight: 20 },
  enableBtn: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  gradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerprintIcon: { marginRight: 10 },
  btnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginBottom: 8,
  },
  remindText: { color: COLORS.brand.primary, fontWeight: '600', fontSize: 15 },
  skipBtn: { padding: 12 },
  skipText: { color: '#666', fontWeight: '600' },
});

export default BiometricSetupScreen;
