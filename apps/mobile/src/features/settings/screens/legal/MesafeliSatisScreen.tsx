/**
 * Mesafeli Satış Sözleşmesi (Distance Sales Contract)
 *
 * Required by Turkish Consumer Protection Law (6502) and
 * Distance Contracts Regulation.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

// =============================================================================
// TYPES
// =============================================================================

interface Section {
  id: string;
  title: string;
  content: string;
}

type MesafeliSatisScreenProps = StackScreenProps<
  RootStackParamList,
  'MesafeliSatis'
>;

// =============================================================================
// CONSTANTS
// =============================================================================

const COMPANY_INFO = {
  name: 'Moment Teknoloji A.Ş.',
  address: 'İstanbul, Türkiye',
  phone: '+90 850 XXX XX XX',
  email: 'destek@moment.app',
  kep: 'moment@hs01.kep.tr',
  mersis: '0123456789012345',
  vergiDairesi: 'Kadıköy Vergi Dairesi',
  vergiNo: '1234567890',
};

const SECTIONS: Section[] = [
  {
    id: 'taraflar',
    title: 'MADDE 1 – TARAFLAR',
    content: `1.1. SATICI (Platform)
Ticaret Unvanı: ${COMPANY_INFO.name}
Adres: ${COMPANY_INFO.address}
Telefon: ${COMPANY_INFO.phone}
E-posta: ${COMPANY_INFO.email}
KEP Adresi: ${COMPANY_INFO.kep}
MERSİS No: ${COMPANY_INFO.mersis}
Vergi Dairesi/No: ${COMPANY_INFO.vergiDairesi} / ${COMPANY_INFO.vergiNo}

1.2. ALICI (Hediye Gönderen)
Ad Soyad, adres ve iletişim bilgileri sipariş sırasında alınmaktadır.`,
  },
  {
    id: 'konu',
    title: 'MADDE 2 – SÖZLEŞMENİN KONUSU',
    content: `İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait Moment platformu üzerinden elektronik ortamda siparişini verdiği, aşağıda nitelikleri ve satış fiyatı belirtilen hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.

HİZMET TANIMI: Anı Paylaşımı ve Dijital Hediye Aracılığı

Platform, kullanıcıların birbirlerine anı bazlı hediyeler göndermesini sağlayan bir dijital aracı hizmet sunmaktadır. Hediye tutarı LVND coin üzerinden yürütülür; kullanıcılar arası doğrudan para transferi yapılmaz.`,
  },
  {
    id: 'hizmet_bilgileri',
    title: 'MADDE 3 – HİZMET BİLGİLERİ',
    content: `3.1. Hizmet Tanımı: Anı Paylaşımı ve Dijital Hediye Aracılığı Hizmeti

3.2. Hizmet Özellikleri:
- Hediye tutarı LVND coin ile gerçekleşir
- Alıcı deneyimi gerçekleştirip fotoğraflı kanıt yükler
- Kanıt, topluluk güveni ve hizmet kalitesi için kullanılır
- Kullanıcılar arası nakit transfer yapılmaz

3.3. Fiyat Bilgisi:
- Hediye tutarı: Sipariş anında belirlenir
- Platform komisyonu: Tutara bağlı olarak %8-10
- KDV: Komisyona dahildir
- Toplam ödeme: Sipariş özetinde gösterilir

3.4. Ödeme Şekli: Apple App Store / Google Play In‑App Purchase

3.5. Ödeme Hizmet Sağlayıcısı: Apple / Google`,
  },
  {
    id: 'teslimat',
    title: 'MADDE 4 – TESLİMAT',
    content: `4.1. Dijital Hizmet Teslimatı:
Hediye bildirimi, coin işlemi tamamlandıktan hemen sonra alıcıya iletilir.

4.2. İşlem Süreci:
- Kanıt onay süresi: 24-72 saat
- Kullanıcılar arası nakit transfer yapılmaz

4.3. Teslimat Adresi:
Dijital hizmet olduğundan fiziksel teslimat adresi gerekmemektedir.`,
  },
  {
    id: 'cayma_hakki',
    title: 'MADDE 5 – CAYMA HAKKI',
    content: `5.1. ALICI, hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin, hizmetin ifasına başlanmadan önce 14 (ondört) gün içinde cayma hakkına sahiptir.

5.2. Cayma Hakkının Kullanılamayacağı Durumlar:
- Hediye alıcısı deneyimi gerçekleştirmeye başlamışsa
- Kanıt yüklenmiş ve onaylanmışsa
- Kanıt yüklenmiş ve onaylanmışsa

5.3. Cayma Hakkı Kullanımı:
Cayma hakkını kullanmak için:
a) Uygulama içi iptal butonu
b) E-posta: ${COMPANY_INFO.email}
c) KEP: ${COMPANY_INFO.kep}
yollarından biriyle bildirimde bulunabilirsiniz.

5.4. İade Süreci:
Cayma hakkı kullanıldığında, iade süreçleri Apple/Google mağaza politikalarına göre yürütülür.`,
  },
  {
    id: 'garanti',
    title: 'MADDE 6 – GARANTİ',
    content: `6.1. Dijital hizmetlerde yasal garanti süresi yoktur.

6.2. Platform Güvenceleri:
- IAP üzerinden güvenli satın alma
- İtiraz ve şikayet mekanizması
- Müşteri destek hizmeti

6.3. Sorumluluk Sınırı:
Platform, üçüncü kişilerin eylemleri, kullanıcıların birbirleriyle olan anlaşmazlıkları veya deneyim içeriklerinden sorumlu değildir.`,
  },
  {
    id: 'uyusmazlik',
    title: 'MADDE 7 – UYUŞMAZLIK ÇÖZÜMÜ',
    content: `7.1. Tüketici Hakem Heyeti:
- 30.000 TL'ye kadar: İl Tüketici Hakem Heyeti
- 30.000 TL üstü: Tüketici Mahkemesi

7.2. Yetkili Mahkeme:
İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.

7.3. İletişim:
Şikayetleriniz için öncelikle ${COMPANY_INFO.email} adresine veya uygulama içi destek kanalına başvurabilirsiniz.`,
  },
  {
    id: 'diger',
    title: 'MADDE 8 – DİĞER HÜKÜMLER',
    content: `8.1. İşbu sözleşme, ALICI tarafından elektronik ortamda onaylandığı tarihte yürürlüğe girer.

8.2. ALICI, sipariş öncesinde bu sözleşmenin tüm koşullarını okuduğunu, anladığını ve kabul ettiğini beyan eder.

8.3. Bu sözleşmede düzenlenmeyen hususlarda 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uygulanır.

8.4. ALICI, sipariş sırasında verdiği bilgilerin doğruluğundan sorumludur.`,
  },
  {
    id: 'onay',
    title: 'MADDE 9 – ONAY',
    content: `ALICI, bu sözleşmenin tüm maddelerini okuduğunu, anladığını, haklarını bildiğini ve elektronik ortamda onay vererek kabul ettiğini beyan ve taahhüt eder.

Ön Bilgilendirme Formu: ☐ Okudum, anladım.
Mesafeli Satış Sözleşmesi: ☐ Okudum, kabul ediyorum.`,
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export default function MesafeliSatisScreen({
  navigation,
}: MesafeliSatisScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mesafeli Satış Sözleşmesi</Text>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Version & Date */}
        <View style={styles.versionBox}>
          <Text style={styles.versionText}>
            Versiyon 1.0 | Son Güncelleme: 29 Aralık 2024
          </Text>
        </View>

        {/* Legal Badge */}
        <View style={styles.legalBadge}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={24}
            color="#4CAF50"
          />
          <Text style={styles.legalBadgeText}>
            6502 Sayılı Tüketici Kanunu ve Mesafeli Sözleşmeler Yönetmeliği
            Kapsamında Hazırlanmıştır
          </Text>
        </View>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve
            Mesafeli Sözleşmeler Yönetmeliği kapsamında hazırlanmıştır.
          </Text>
          <Text style={styles.footerCompany}>{COMPANY_INFO.name}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  backButton: {
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
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  versionBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  versionText: {
    ...TYPOGRAPHY.bodySmall,
    color: '#2E7D32',
    textAlign: 'center',
  },
  legalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  legalBadgeText: {
    flex: 1,
    ...TYPOGRAPHY.bodyMedium,
    color: '#2E7D32',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    backgroundColor: COLORS.utility.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    lineHeight: 22,
  },
  sectionContent: {
    ...TYPOGRAPHY.bodyMedium,
    lineHeight: 22,
    color: COLORS.text.secondary,
  },
  footer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    alignItems: 'center',
  },
  footerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  footerCompany: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
});
