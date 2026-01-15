/**
 * PrivacyConsentModal Component
 *
 * GDPR and KVKK compliant privacy consent modal that displays on first app launch.
 * Handles analytics, marketing, and essential cookies consent.
 *
 * @compliance GDPR Article 7, KVKK Madde 5
 * @example
 * ```tsx
 * <PrivacyConsentModal
 *   visible={showConsent}
 *   onAcceptAll={handleAcceptAll}
 *   onCustomize={handleCustomize}
 *   onDeclineOptional={handleDeclineOptional}
 * />
 * ```
 */

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Pressable,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
} from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/theme/typography';
import { logger } from '@/utils/logger';
import { supabase } from '@/config/supabase';
import { callRpc } from '@/services/supabaseRpc';

// Storage key for consent status
const PRIVACY_CONSENT_KEY = 'privacy_consent_status';
const PRIVACY_CONSENT_VERSION = '1.0';

export interface ConsentPreferences {
  essential: boolean; // Always true - required for app functionality
  analytics: boolean; // Performance and crash analytics
  marketing: boolean; // Marketing communications
  personalization: boolean; // Personalized content and recommendations
}

interface PrivacyConsentModalProps {
  visible: boolean;
  userId?: string;
  onConsentGiven: (preferences: ConsentPreferences) => void;
  onDismiss?: () => void;
}

/**
 * Check if user has given consent
 */
export async function checkConsentStatus(): Promise<{
  hasConsented: boolean;
  preferences: ConsentPreferences | null;
  version: string | null;
}> {
  try {
    const stored = await AsyncStorage.getItem(PRIVACY_CONSENT_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        hasConsented: true,
        preferences: data.preferences,
        version: data.version,
      };
    }
    return { hasConsented: false, preferences: null, version: null };
  } catch (error) {
    logger.error('[PrivacyConsent] Error checking consent status:', error);
    return { hasConsented: false, preferences: null, version: null };
  }
}

/**
 * Save consent preferences to local storage and optionally to server
 */
export async function saveConsentPreferences(
  preferences: ConsentPreferences,
  userId?: string,
): Promise<void> {
  try {
    // Save locally
    const consentData = {
      preferences,
      version: PRIVACY_CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem(
      PRIVACY_CONSENT_KEY,
      JSON.stringify(consentData),
    );

    // Save to server if user is authenticated
    if (userId) {
      // Record each consent type in history
      const consentTypes: Array<{ type: string; value: boolean }> = [
        { type: 'analytics', value: preferences.analytics },
        { type: 'marketing', value: preferences.marketing },
        { type: 'personalization', value: preferences.personalization },
      ];

      for (const consent of consentTypes) {
        await callRpc('record_consent', {
          target_user_id: userId,
          consent_type: consent.type,
          consented: consent.value,
          version: PRIVACY_CONSENT_VERSION,
        });
      }

      // Update profile with consent preferences
      await supabase
        .from('profiles')
        .update({
          analytics_consent: preferences.analytics,
          marketing_consent: preferences.marketing,
          gdpr_consent_at: new Date().toISOString(),
          privacy_policy_version: PRIVACY_CONSENT_VERSION,
        })
        .eq('id', userId);
    }

    logger.info('[PrivacyConsent] Consent saved successfully');
  } catch (error) {
    logger.error('[PrivacyConsent] Error saving consent:', error);
    throw error;
  }
}

const ConsentToggle = memo<{
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}>(({ title, description, value, onValueChange, disabled, icon }) => (
  <View style={styles.consentItem}>
    <View style={styles.consentIconContainer}>
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={disabled ? COLORS.text.muted : COLORS.brand.primary}
      />
    </View>
    <View style={styles.consentTextContainer}>
      <Text style={[styles.consentTitle, disabled && styles.disabledText]}>
        {title}
        {disabled && <Text style={styles.requiredBadge}> (Zorunlu)</Text>}
      </Text>
      <Text style={styles.consentDescription}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: COLORS.utility.disabled,
        true: COLORS.brand.primary,
      }}
      thumbColor={COLORS.utility.white}
      accessibilityLabel={`${title} iznini ${value ? 'kapat' : 'aç'}`}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    />
  </View>
));

ConsentToggle.displayName = 'ConsentToggle';

export const PrivacyConsentModal = memo<PrivacyConsentModalProps>(
  ({ visible, userId, onConsentGiven, onDismiss }) => {
    const [showCustomize, setShowCustomize] = useState(false);
    const [preferences, setPreferences] = useState<ConsentPreferences>({
      essential: true,
      analytics: true,
      marketing: false,
      personalization: true,
    });
    const [loading, setLoading] = useState(false);

    const handleAcceptAll = useCallback(async () => {
      setLoading(true);
      const allAccepted: ConsentPreferences = {
        essential: true,
        analytics: true,
        marketing: true,
        personalization: true,
      };
      try {
        await saveConsentPreferences(allAccepted, userId);
        onConsentGiven(allAccepted);
      } catch (error) {
        logger.error('[PrivacyConsent] Error accepting all:', error);
      } finally {
        setLoading(false);
      }
    }, [userId, onConsentGiven]);

    const handleAcceptEssential = useCallback(async () => {
      setLoading(true);
      const essentialOnly: ConsentPreferences = {
        essential: true,
        analytics: false,
        marketing: false,
        personalization: false,
      };
      try {
        await saveConsentPreferences(essentialOnly, userId);
        onConsentGiven(essentialOnly);
      } catch (error) {
        logger.error('[PrivacyConsent] Error accepting essential:', error);
      } finally {
        setLoading(false);
      }
    }, [userId, onConsentGiven]);

    const handleSavePreferences = useCallback(async () => {
      setLoading(true);
      try {
        await saveConsentPreferences(preferences, userId);
        onConsentGiven(preferences);
      } catch (error) {
        logger.error('[PrivacyConsent] Error saving preferences:', error);
      } finally {
        setLoading(false);
      }
    }, [preferences, userId, onConsentGiven]);

    const handleOpenPrivacyPolicy = useCallback(() => {
      Linking.openURL('https://www.lovendo.xyz/privacy');
    }, []);

    const handleOpenCookiePolicy = useCallback(() => {
      Linking.openURL('https://www.lovendo.xyz/cookies');
    }, []);

    const updatePreference = useCallback(
      (key: keyof ConsentPreferences, value: boolean) => {
        setPreferences((prev) => ({ ...prev, [key]: value }));
      },
      [],
    );

    if (!visible) return null;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={onDismiss}
      >
        <View style={styles.overlay}>
          <Animated.View
            entering={SlideInDown.springify().damping(20)}
            exiting={FadeOut}
            style={styles.modalContainer}
          >
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Header */}
                <View style={styles.header}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={48}
                    color={COLORS.brand.primary}
                  />
                  <Text style={styles.title}>Gizlilik Tercihleriniz</Text>
                  <Text style={styles.subtitle}>
                    Size daha iyi bir deneyim sunabilmek için izinlerinize
                    ihtiyacımız var
                  </Text>
                </View>

                {showCustomize ? (
                  /* Customize View */
                  <Animated.View
                    entering={FadeIn}
                    style={styles.customizeContainer}
                  >
                    <ConsentToggle
                      title="Temel Çerezler"
                      description="Uygulamanın çalışması için zorunlu. Oturum yönetimi ve güvenlik için gerekli."
                      value={preferences.essential}
                      onValueChange={() => {}}
                      disabled
                      icon="cookie"
                    />

                    <ConsentToggle
                      title="Analitik"
                      description="Uygulama performansını iyileştirmek için anonim kullanım verileri."
                      value={preferences.analytics}
                      onValueChange={(v) => updatePreference('analytics', v)}
                      icon="chart-line"
                    />

                    <ConsentToggle
                      title="Pazarlama"
                      description="Yeni özellikler, kampanyalar ve özel teklifler hakkında bildirimler."
                      value={preferences.marketing}
                      onValueChange={(v) => updatePreference('marketing', v)}
                      icon="bullhorn"
                    />

                    <ConsentToggle
                      title="Kişiselleştirme"
                      description="İlgi alanlarınıza göre özelleştirilmiş deneyim ve öneriler."
                      value={preferences.personalization}
                      onValueChange={(v) =>
                        updatePreference('personalization', v)
                      }
                      icon="account-star"
                    />

                    <View style={styles.buttonGroup}>
                      <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setShowCustomize(false)}
                        disabled={loading}
                        accessibilityLabel="Geri dön"
                        accessibilityRole="button"
                      >
                        <Text style={styles.backButtonText}>Geri</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.primaryButton,
                          loading && styles.disabledButton,
                        ]}
                        onPress={handleSavePreferences}
                        disabled={loading}
                        accessibilityLabel="Tercihleri kaydet"
                        accessibilityRole="button"
                      >
                        <Text style={styles.primaryButtonText}>
                          {loading ? 'Kaydediliyor...' : 'Tercihleri Kaydet'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                ) : (
                  /* Default View */
                  <Animated.View
                    entering={FadeIn}
                    style={styles.defaultContainer}
                  >
                    <View style={styles.infoCard}>
                      <MaterialCommunityIcons
                        name="information-outline"
                        size={20}
                        color={COLORS.brand.primary}
                      />
                      <Text style={styles.infoText}>
                        Verilerinizi KVKK ve GDPR kapsamında koruyoruz.
                        Tercihlerinizi istediğiniz zaman Ayarlar &gt; Gizlilik
                        bölümünden değiştirebilirsiniz.
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        loading && styles.disabledButton,
                      ]}
                      onPress={handleAcceptAll}
                      disabled={loading}
                      accessibilityLabel="Tümünü kabul et"
                      accessibilityRole="button"
                    >
                      <Text style={styles.primaryButtonText}>
                        {loading ? 'Yükleniyor...' : 'Tümünü Kabul Et'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => setShowCustomize(true)}
                      disabled={loading}
                      accessibilityLabel="Tercihleri özelleştir"
                      accessibilityRole="button"
                    >
                      <Text style={styles.secondaryButtonText}>Özelleştir</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.textButton}
                      onPress={handleAcceptEssential}
                      disabled={loading}
                      accessibilityLabel="Sadece zorunlu çerezleri kabul et"
                      accessibilityRole="button"
                    >
                      <Text style={styles.textButtonText}>
                        Sadece Zorunlu Olanları Kabul Et
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}

                {/* Footer Links */}
                <View style={styles.footer}>
                  <Pressable
                    onPress={handleOpenPrivacyPolicy}
                    accessibilityLabel="Gizlilik politikasını oku"
                    accessibilityRole="link"
                  >
                    <Text style={styles.footerLink}>Gizlilik Politikası</Text>
                  </Pressable>
                  <Text style={styles.footerDivider}>•</Text>
                  <Pressable
                    onPress={handleOpenCookiePolicy}
                    accessibilityLabel="Çerez politikasını oku"
                    accessibilityRole="link"
                  >
                    <Text style={styles.footerLink}>Çerez Politikası</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

PrivacyConsentModal.displayName = 'PrivacyConsentModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.bg.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 22,
  },
  defaultContainer: {
    gap: SPACING.md,
  },
  customizeContainer: {
    gap: SPACING.sm,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.brand.primaryLight || `${COLORS.brand.primary}15`,
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  consentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.base,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  consentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.brand.primaryLight || `${COLORS.brand.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  consentTextContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  consentTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  consentDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  disabledText: {
    color: COLORS.text.muted,
  },
  requiredBadge: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.primaryMuted,
    fontWeight: '400',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.brand.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface.elevated,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  textButton: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  textButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textDecorationLine: 'underline',
  },
  backButton: {
    backgroundColor: COLORS.surface.elevated,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  backButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  footerLink: {
    ...TYPOGRAPHY.caption,
    color: COLORS.brand.primary,
    textDecorationLine: 'underline',
  },
  footerDivider: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
  },
});

export default PrivacyConsentModal;
