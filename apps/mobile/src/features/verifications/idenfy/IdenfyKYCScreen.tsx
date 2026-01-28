/**
 * Idenfy KYC Verification Screen
 *
 * Simple identity verification using Idenfy SDK.
 * Flow: Check status -> Start verification -> Handle callback -> Show result
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { HapticManager } from '@/services/HapticManager';
import { supabase } from '@/config/supabase';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { FONTS, FONT_SIZES } from '@/constants/typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/routeParams';

type RouteProps = RouteProp<RootStackParamList, 'IdentityVerification'>;

type VerificationStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'verifying'
  | 'success'
  | 'error';

const IdenfyKYCScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check current KYC status on mount
  useEffect(() => {
    checkKycStatus();
  }, []);

  const checkKycStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigation.goBack();
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('kyc_status')
        .eq('id', user.id)
        .single();

      if (profile?.kyc_status === 'verified') {
        setStatus('success');
        setKycStatus('verified');
      } else if (
        profile?.kyc_status === 'pending' ||
        profile?.kyc_status === 'processing'
      ) {
        setStatus('verifying');
        setKycStatus('pending');
      } else {
        setStatus('ready');
      }
    } catch (error) {
      logger.error('Error checking KYC status', { error });
      setStatus('ready');
    }
  };

  const startVerification = async () => {
    try {
      setStatus('loading');
      HapticManager.buttonPress();

      // Call Idenfy verification edge function
      const { data, error } = await supabase.functions.invoke('verify-kyc', {
        method: 'POST',
        body: {},
      });

      if (error) {
        throw new Error(error.message || 'Verification failed to start');
      }

      if (!data?.verificationUrl) {
        throw new Error('Verification URL not received');
      }

      setVerificationUrl(data.verificationUrl);

      // Open Idenfy in browser
      const result = await WebBrowser.openBrowserAsync(data.verificationUrl, {
        dismissButtonStyle: 'close',
        // Note: Color options removed for expo-web-browser compatibility
      });

      // Check if verification was completed
      if (result.type === 'dismiss') {
        // User closed the browser, check status
        setStatus('verifying');
        // Status will be updated via webhook, prompt user to refresh
        Alert.alert(
          'Doğrulama Devam Ediyor',
          "Kimlik doğrulama işleminiz tamamlanmış olabilir. Devam etmek için Tamam'a tıklayın.",
          [{ text: 'Tamam', onPress: () => checkKycStatus() }],
        );
      }
    } catch (error: any) {
      logger.error('Error starting verification', { error });
      setErrorMessage(error.message || 'Doğrulama başlatılamadı');
      setStatus('error');
    }
  };

  const handleRefresh = () => {
    checkKycStatus();
  };

  const handleClose = () => {
    // Return to where user came from
    if (route.params?.returnTo) {
      navigation.navigate(route.params.returnTo as never);
    } else {
      navigation.goBack();
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Kontrol ediliyor...</Text>
          </View>
        );

      case 'success':
        return (
          <View style={styles.centerContent}>
            <View style={styles.successIcon}>
              <Ionicons
                name="checkmark-circle"
                size={80}
                color={COLORS.success}
              />
            </View>
            <Text style={styles.successTitle}>Kimlik Doğrulandı</Text>
            <Text style={styles.successSubtitle}>
              Hesabınız başarıyla doğrulandı. Artık tüm özellikleri
              kullanabilirsiniz.
            </Text>
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={handleClose}
            >
              <LinearGradient
                colors={
                  GRADIENTS.gift as readonly [string, string, ...string[]]
                }
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Devam Et</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );

      case 'verifying':
        return (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={COLORS.warning} />
            <Text style={styles.verifyingTitle}>Doğrulama Bekleniyor</Text>
            <Text style={styles.verifyingSubtitle}>
              Kimlik doğrulama işleminiz işleniyor. Bu işlem birkaç dakika
              sürebilir.
            </Text>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={handleRefresh}
            >
              <Text style={styles.buttonSecondaryText}>Durumu Yenile</Text>
            </TouchableOpacity>
          </View>
        );

      case 'error':
        return (
          <View style={styles.centerContent}>
            <Ionicons name="alert-circle" size={64} color={COLORS.danger} />
            <Text style={styles.errorTitle}>Hata Oluştu</Text>
            <Text style={styles.errorSubtitle}>{errorMessage}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={handleClose}
              >
                <Text style={styles.buttonSecondaryText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={startVerification}
              >
                <LinearGradient
                  colors={
                    GRADIENTS.gift as readonly [string, string, ...string[]]
                  }
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Tekrar Dene</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'ready':
      default:
        return (
          <View style={styles.content}>
            {/* Header Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={
                  GRADIENTS.primary as readonly [string, string, ...string[]]
                }
                style={styles.iconGradient}
              >
                <Ionicons
                  name="id-card-outline"
                  size={48}
                  color={COLORS.white}
                />
              </LinearGradient>
            </View>

            {/* Title */}
            <Text style={styles.title}>Kimlik Doğrulama</Text>
            <Text style={styles.subtitle}>
              Para çekebilmek için kimliğinizi doğrulamanız gerekmektedir.
            </Text>

            {/* Benefits */}
            <GlassCard style={styles.benefitsCard}>
              <View style={styles.benefitItem}>
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.benefitText}>
                  Güvenli doğrulama (256-bit SSL)
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.benefitText}>
                  Doğrulama birkaç dakika sürer
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={COLORS.trust.primary}
                />
                <Text style={styles.benefitText}>
                  Verileriniz şifreli tutulur
                </Text>
              </View>
            </GlassCard>

            {/* Info Card */}
            <GlassCard style={styles.infoCard}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.warning}
              />
              <Text style={styles.infoText}>
                Kimlik doğrulama için pasaport, nüfus cüzdanı veya ehliyet
                kullanabilirsiniz. Belgenizin fotoğrafı net ve okunaklı
                olmalıdır.
              </Text>
            </GlassCard>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <Ionicons name="close" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kimlik Doğrulama</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>

      {/* Bottom CTA for ready state */}
      {status === 'ready' && (
        <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={startVerification}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.gift as readonly [string, string, ...string[]]}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.ctaText}>Doğrulamaya Başla</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.display.bold,
    fontSize: FONT_SIZES.bodyLarge,
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.secondary,
    marginTop: 16,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.display.bold,
    fontSize: FONT_SIZES.h3,
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  benefitsCard: {
    width: '100%',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.text.primary,
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.warning + '15',
  },
  infoText: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.caption,
    color: COLORS.text.secondary,
    lineHeight: 18,
    flex: 1,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontFamily: FONTS.display.bold,
    fontSize: FONT_SIZES.h3,
    color: COLORS.success,
    marginBottom: 8,
  },
  successSubtitle: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  verifyingTitle: {
    fontFamily: FONTS.display.bold,
    fontSize: FONT_SIZES.h4,
    color: COLORS.warning,
    marginTop: 24,
    marginBottom: 8,
  },
  verifyingSubtitle: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorTitle: {
    fontFamily: FONTS.display.bold,
    fontSize: FONT_SIZES.h4,
    color: COLORS.danger,
    marginTop: 24,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  buttonPrimary: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  buttonText: {
    fontFamily: FONTS.body.bold,
    fontSize: FONT_SIZES.body,
    color: COLORS.white,
  },
  buttonSecondary: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  buttonSecondaryText: {
    fontFamily: FONTS.body.semibold,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.primary,
  },
  bottomCta: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: COLORS.bg.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  ctaButton: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  ctaText: {
    fontFamily: FONTS.body.bold,
    fontSize: FONT_SIZES.body,
    color: COLORS.white,
  },
});

export default IdenfyKYCScreen;
