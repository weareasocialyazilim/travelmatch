import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';

/**
 * RefundRequestScreen - PayTR Escrow İtiraz Akışı
 *
 * Gönderici (Giver) bu ekrandan itiraz açabilir:
 * - Kanıt (Proof) sahte veya yüklenmedi
 * - Deneyim gerçekleşmedi
 * - Farklı deneyim yaşandı
 *
 * Talepler Admin Panel'e düşer ve manuel değerlendirilir.
 */
export const RefundRequestScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState('');

  const REASONS = [
    {
      id: 'fake_proof',
      label: 'Kanıt sahte veya yüklenmedi 📸',
      icon: 'camera-off-outline' as const,
    },
    {
      id: 'no_show',
      label: 'Ev sahibi gelmedi',
      icon: 'account-off-outline' as const,
    },
    {
      id: 'different',
      label: 'Deneyim farklıydı',
      icon: 'alert-outline' as const,
    },
    {
      id: 'cancelled',
      label: 'Deneyim iptal edildi',
      icon: 'calendar-remove-outline' as const,
    },
    {
      id: 'safety',
      label: 'Güvenlik endişesi',
      icon: 'shield-alert-outline' as const,
    },
    {
      id: 'accidental',
      label: 'Yanlışlıkla gönderildi',
      icon: 'gesture-tap' as const,
    },
  ];
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const handleSubmit = () => {
    Keyboard.dismiss();
    // Submit to admin panel
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', COLORS.bg.primary]}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İade Talebi</Text>
        <View style={styles.spacer} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Transaction Summary */}
        <View style={styles.txSummary}>
          <MaterialCommunityIcons
            name="gift-outline"
            size={32}
            color={COLORS.brand.primary}
          />
          <Text style={styles.txLabel}>Hediye #TM-8921</Text>
          <Text style={styles.txAmount}>₺150.00</Text>
          <View style={styles.escrowBadge}>
            <MaterialCommunityIcons
              name="shield-check"
              size={14}
              color={COLORS.brand.primary}
            />
            <Text style={styles.escrowText}>PayTR Escrow Koruması</Text>
          </View>
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={20}
            color={COLORS.feedback.warning}
          />
          <Text style={styles.warningText}>
            İade talepleri Admin ekibimiz tarafından 24-48 saat içinde
            değerlendirilir. Sahte talepler hesap askıya alınmasına neden
            olabilir.
          </Text>
        </View>

        <Text style={styles.label}>İtiraz Nedeni</Text>
        <View style={styles.reasons}>
          {REASONS.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[
                styles.reasonChip,
                selectedReason === r.id && styles.activeReason,
              ]}
              onPress={() => setSelectedReason(r.id)}
            >
              <MaterialCommunityIcons
                name={r.icon}
                size={20}
                color={selectedReason === r.id ? COLORS.brand.primary : '#888'}
              />
              <Text
                style={[
                  styles.reasonText,
                  selectedReason === r.id && styles.activeReasonText,
                ]}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Detaylar</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Lütfen durumu detaylı açıkla. Varsa ekran görüntüsü veya kanıt sunman değerlendirmeyi hızlandırır..."
          placeholderTextColor="#666"
          value={reason}
          onChangeText={setReason}
        />

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information"
            size={20}
            color={COLORS.brand.primary}
          />
          <Text style={styles.infoText}>
            Onaylanan iadeler PayTR üzerinden 3-5 iş günü içinde
            kartına/hesabına yansır.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, !selectedReason && styles.disabledBtn]}
          disabled={!selectedReason}
          onPress={handleSubmit}
        >
          <MaterialCommunityIcons name="send" size={20} color="black" />
          <Text style={styles.submitText}>Talebi Gönder</Text>
        </TouchableOpacity>

        {/* Support Link */}
        <TouchableOpacity style={styles.supportLink}>
          <Text style={styles.supportText}>
            Acil destek için{' '}
            <Text style={styles.supportHighlight}>destek@travelmatch.com</Text>{' '}
            adresine yazabilirsin
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: 'white' },
  content: { padding: 24, paddingBottom: 48 },
  txSummary: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  txLabel: { color: '#888', marginTop: 8, fontSize: 13 },
  txAmount: { color: 'white', fontSize: 28, fontWeight: '700', marginTop: 4 },
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.brand.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  escrowText: { color: COLORS.brand.primary, fontSize: 12, fontWeight: '600' },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.feedback.warning}15`,
    padding: 14,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  warningText: {
    color: COLORS.feedback.warning,
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  label: { color: 'white', fontWeight: '600', marginBottom: 14, fontSize: 15 },
  reasons: { gap: 10, marginBottom: 24 },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  activeReason: {
    borderColor: COLORS.brand.primary,
    backgroundColor: `${COLORS.brand.primary}10`,
  },
  reasonText: { color: '#aaa', fontSize: 14 },
  activeReasonText: { color: 'white', fontWeight: '600' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.brand.primary}10`,
    padding: 14,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    color: COLORS.brand.primary,
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.brand.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledBtn: { backgroundColor: '#333', opacity: 0.6 },
  submitText: { color: 'black', fontWeight: '700', fontSize: 16 },
  spacer: { width: 24 },
  supportLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  supportText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  supportHighlight: {
    color: COLORS.brand.primary,
    fontWeight: '600',
  },
});
