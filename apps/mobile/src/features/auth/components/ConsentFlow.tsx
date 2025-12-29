/**
 * KVKK Consent Flow Component
 *
 * Handles all required consents for Turkish legal compliance:
 * - KVKK Aydınlatma (mandatory)
 * - Terms of Service (mandatory)
 * - Privacy Policy (mandatory)
 * - Commercial Messages - SMS, Email, Push (optional, separate checkboxes)
 * - Cookie Preferences (optional)
 *
 * Important: Pre-checked boxes are NOT allowed per KVKK guidelines.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { supabase } from '@/lib/supabase';

// =============================================================================
// TYPES
// =============================================================================

export interface ConsentState {
  kvkkAydinlatma: boolean;
  termsOfService: boolean;
  privacyPolicy: boolean;
  commercialSms: boolean;
  commercialEmail: boolean;
  commercialPush: boolean;
  cookieAnalytics: boolean;
  cookieMarketing: boolean;
}

interface ConsentFlowProps {
  visible: boolean;
  onComplete: (consents: ConsentState) => void;
  onCancel?: () => void;
  mode?: 'registration' | 'update';
  initialConsents?: Partial<ConsentState>;
}

interface PaymentConsentProps {
  visible: boolean;
  amount: number;
  currency: string;
  receiverName: string;
  momentTitle: string;
  onAccept: () => void;
  onCancel: () => void;
}

interface ConsentCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  required?: boolean;
  linkText?: string;
  onLinkPress?: () => void;
}

// =============================================================================
// CONSENT CHECKBOX COMPONENT
// =============================================================================

const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({
  label,
  checked,
  onChange,
  required,
  linkText,
  onLinkPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.checkboxRow}
      onPress={() => onChange(!checked)}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && (
          <MaterialCommunityIcons name="check" size={16} color="#fff" />
        )}
      </View>
      <View style={styles.checkboxLabelContainer}>
        <Text style={styles.checkboxLabel}>
          {label}
          {required && <Text style={styles.requiredStar}> *</Text>}
        </Text>
        {linkText && (
          <TouchableOpacity onPress={onLinkPress}>
            <Text style={styles.linkText}>{linkText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

// =============================================================================
// MAIN CONSENT FLOW COMPONENT
// =============================================================================

export const ConsentFlow: React.FC<ConsentFlowProps> = ({
  visible,
  onComplete,
  onCancel,
  mode = 'registration',
  initialConsents = {},
}) => {
  const [consents, setConsents] = useState<ConsentState>({
    kvkkAydinlatma: initialConsents.kvkkAydinlatma || false,
    termsOfService: initialConsents.termsOfService || false,
    privacyPolicy: initialConsents.privacyPolicy || false,
    commercialSms: initialConsents.commercialSms || false,
    commercialEmail: initialConsents.commercialEmail || false,
    commercialPush: initialConsents.commercialPush || false,
    cookieAnalytics: initialConsents.cookieAnalytics || false,
    cookieMarketing: initialConsents.cookieMarketing || false,
  });

  const [loading, setLoading] = useState(false);

  const updateConsent = useCallback((key: keyof ConsentState, value: boolean) => {
    setConsents((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = consents.kvkkAydinlatma && consents.termsOfService && consents.privacyPolicy;

  const handleSubmit = async () => {
    if (!canProceed) {
      Alert.alert(
        'Zorunlu Alanlar',
        'Devam edebilmek için zorunlu metinleri okuduğunuzu onaylamanız gerekmektedir.'
      );
      return;
    }

    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Save consents to database
        const { error } = await supabase.from('user_consents').upsert({
          user_id: user.id,
          kvkk_aydinlatma_accepted: consents.kvkkAydinlatma,
          kvkk_aydinlatma_accepted_at: consents.kvkkAydinlatma ? new Date().toISOString() : null,
          kvkk_aydinlatma_version: '1.0',
          terms_of_service_accepted: consents.termsOfService,
          terms_of_service_accepted_at: consents.termsOfService ? new Date().toISOString() : null,
          terms_of_service_version: '1.0',
          privacy_policy_accepted: consents.privacyPolicy,
          privacy_policy_accepted_at: consents.privacyPolicy ? new Date().toISOString() : null,
          privacy_policy_version: '1.0',
          commercial_sms_allowed: consents.commercialSms,
          commercial_sms_allowed_at: consents.commercialSms ? new Date().toISOString() : null,
          commercial_email_allowed: consents.commercialEmail,
          commercial_email_allowed_at: consents.commercialEmail ? new Date().toISOString() : null,
          commercial_push_allowed: consents.commercialPush,
          commercial_push_allowed_at: consents.commercialPush ? new Date().toISOString() : null,
          cookie_analytics: consents.cookieAnalytics,
          cookie_marketing: consents.cookieMarketing,
          cookie_preferences_set_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

        if (error) {
          console.error('Error saving consents:', error);
          Alert.alert('Hata', 'Onaylar kaydedilirken bir hata oluştu.');
          return;
        }
      }

      onComplete(consents);
    } catch (error) {
      console.error('Error in consent flow:', error);
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {onCancel && (
            <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>
            {mode === 'registration' ? 'Yasal Onaylar' : 'İzin Ayarları'}
          </Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* KVKK Info Banner */}
          <View style={styles.infoBanner}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#1976D2" />
            <Text style={styles.infoBannerText}>
              TravelMatch olarak kişisel verilerinizin güvenliğine önem veriyoruz.
              Aşağıdaki onayları vererek hizmetlerimizden faydalanabilirsiniz.
            </Text>
          </View>

          {/* Mandatory Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zorunlu Onaylar</Text>
            <Text style={styles.sectionSubtitle}>
              Hizmetlerimizi kullanabilmeniz için gereklidir
            </Text>

            <ConsentCheckbox
              label="KVKK Aydınlatma Metnini okudum, anladım."
              checked={consents.kvkkAydinlatma}
              onChange={(v) => updateConsent('kvkkAydinlatma', v)}
              required
              linkText="Metni oku →"
              onLinkPress={() => {/* Navigate to KVKK screen */}}
            />

            <ConsentCheckbox
              label="Kullanım Koşullarını okudum, kabul ediyorum."
              checked={consents.termsOfService}
              onChange={(v) => updateConsent('termsOfService', v)}
              required
              linkText="Koşulları oku →"
              onLinkPress={() => {/* Navigate to Terms screen */}}
            />

            <ConsentCheckbox
              label="Gizlilik Politikasını okudum, kabul ediyorum."
              checked={consents.privacyPolicy}
              onChange={(v) => updateConsent('privacyPolicy', v)}
              required
              linkText="Politikayı oku →"
              onLinkPress={() => {/* Navigate to Privacy screen */}}
            />
          </View>

          {/* Optional Section - Commercial Messages */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ticari İleti İzinleri (Opsiyonel)</Text>
            <Text style={styles.sectionSubtitle}>
              Kampanya ve fırsatlardan haberdar olun
            </Text>

            <ConsentCheckbox
              label="SMS ile kampanya ve fırsatlardan haberdar olmak istiyorum"
              checked={consents.commercialSms}
              onChange={(v) => updateConsent('commercialSms', v)}
            />

            <ConsentCheckbox
              label="E-posta ile kampanya ve fırsatlardan haberdar olmak istiyorum"
              checked={consents.commercialEmail}
              onChange={(v) => updateConsent('commercialEmail', v)}
            />

            <ConsentCheckbox
              label="Bildirim (push) ile kampanya ve fırsatlardan haberdar olmak istiyorum"
              checked={consents.commercialPush}
              onChange={(v) => updateConsent('commercialPush', v)}
            />
          </View>

          {/* Optional Section - Cookies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Çerez Tercihleri (Opsiyonel)</Text>
            <Text style={styles.sectionSubtitle}>
              Deneyiminizi iyileştirmemize yardımcı olun
            </Text>

            <ConsentCheckbox
              label="Analitik çerezlerini kabul ediyorum (site kullanımı analizi)"
              checked={consents.cookieAnalytics}
              onChange={(v) => updateConsent('cookieAnalytics', v)}
            />

            <ConsentCheckbox
              label="Pazarlama çerezlerini kabul ediyorum (kişiselleştirilmiş reklamlar)"
              checked={consents.cookieMarketing}
              onChange={(v) => updateConsent('cookieMarketing', v)}
            />
          </View>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <MaterialCommunityIcons name="information-outline" size={18} color={COLORS.text.tertiary} />
            <Text style={styles.infoNoteText}>
              Opsiyonel izinlerinizi istediğiniz zaman Ayarlar {'>'} Gizlilik bölümünden değiştirebilirsiniz.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, !canProceed && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canProceed || loading}
          >
            <LinearGradient
              colors={canProceed ? ['#FF6B6B', '#FF8E53'] : ['#ccc', '#ccc']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Kaydediliyor...' : mode === 'registration' ? 'Devam Et' : 'Kaydet'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// =============================================================================
// PAYMENT CONSENT COMPONENT
// =============================================================================

export const PaymentConsent: React.FC<PaymentConsentProps> = ({
  visible,
  amount,
  currency,
  receiverName,
  momentTitle,
  onAccept,
  onCancel,
}) => {
  const [preInfoAccepted, setPreInfoAccepted] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);

  const canProceed = preInfoAccepted && contractAccepted;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency === 'TL' ? 'TRY' : currency,
    }).format(value);
  };

  const handleAccept = () => {
    if (canProceed) {
      onAccept();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ödeme Onayı</Text>
            <TouchableOpacity onPress={onCancel}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Summary */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Alıcı</Text>
            <Text style={styles.summaryValue}>{receiverName}</Text>

            <Text style={styles.summaryLabel}>Moment</Text>
            <Text style={styles.summaryValue}>{momentTitle}</Text>

            <View style={styles.divider} />

            <Text style={styles.summaryLabel}>Toplam Ödeme</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(amount)}</Text>
          </View>

          {/* Consents */}
          <View style={styles.paymentConsents}>
            <ConsentCheckbox
              label="Ön Bilgilendirme Formunu okudum, anladım."
              checked={preInfoAccepted}
              onChange={setPreInfoAccepted}
              required
              linkText="Formu oku →"
              onLinkPress={() => {/* Show pre-info form */}}
            />

            <ConsentCheckbox
              label="Mesafeli Satış Sözleşmesini okudum, kabul ediyorum."
              checked={contractAccepted}
              onChange={setContractAccepted}
              required
              linkText="Sözleşmeyi oku →"
              onLinkPress={() => {/* Show contract */}}
            />
          </View>

          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, !canProceed && styles.confirmButtonDisabled]}
              onPress={handleAccept}
              disabled={!canProceed}
            >
              <Text style={styles.confirmButtonText}>
                {formatCurrency(amount)} Öde
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.utility.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
    ...TYPOGRAPHY.bodyMedium,
    color: '#1565C0',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.tertiary,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxLabelContainer: {
    flex: 1,
  },
  checkboxLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  requiredStar: {
    color: '#F44336',
    fontWeight: '700',
  },
  linkText: {
    ...TYPOGRAPHY.bodySmall,
    color: '#1976D2',
    marginTop: 4,
    fontWeight: '600',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.bg.secondary,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoNoteText: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.tertiary,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.utility.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    color: '#fff',
    fontWeight: '700',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.utility.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  summaryBox: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.tertiary,
    marginBottom: 4,
  },
  summaryValue: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.default,
    marginVertical: 12,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  paymentConsents: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    ...TYPOGRAPHY.bodyMedium,
    color: '#fff',
    fontWeight: '700',
  },
});

export default ConsentFlow;
