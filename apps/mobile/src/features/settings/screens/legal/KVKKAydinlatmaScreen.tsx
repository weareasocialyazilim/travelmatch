/**
 * KVKK Aydınlatma Metni (KVKK Clarification Text)
 *
 * Required by Turkish Personal Data Protection Law (KVKK) Article 10.
 * Must be shown before collecting personal data.
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

type KVKKAydinlatmaScreenProps = StackScreenProps<
  RootStackParamList,
  'KVKKAydinlatma'
>;

// =============================================================================
// CONSTANTS
// =============================================================================

const COMPANY_INFO = {
  name: 'Moment Teknoloji A.Ş.',
  address: 'İstanbul, Türkiye',
  email: 'kvkk@moment.app',
  kep: 'moment@hs01.kep.tr',
  mersis: '0123456789012345',
};

const SECTIONS: Section[] = [
  {
    id: 'veri_sorumlusu',
    title: '1. Veri Sorumlusu',
    content: `${COMPANY_INFO.name} ("Platform" veya "Şirket") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla kişisel verilerinizi işlemekteyiz.

Adres: ${COMPANY_INFO.address}
E-posta: ${COMPANY_INFO.email}
KEP Adresi: ${COMPANY_INFO.kep}
MERSİS No: ${COMPANY_INFO.mersis}`,
  },
  {
    id: 'islenen_veriler',
    title: '2. İşlenen Kişisel Veriler',
    content: `Platformumuz aracılığıyla aşağıdaki kategorilerdeki kişisel verilerinizi işlemekteyiz:

• Kimlik Bilgileri: Ad, soyad, doğum tarihi, T.C. Kimlik Numarası (KYC için)
• İletişim Bilgileri: E-posta adresi, telefon numarası
• Finansal Bilgiler: IBAN (maskelenmiş), ödeme geçmişi
• KYC Bilgileri: Kimlik belgesi görüntüsü, yüz doğrulama (withdrawal KYC için)
• Konum Bilgileri: Anı doğrulama için GPS konumu
• Görsel Veriler: Profil fotoğrafı, anı kanıt fotoğrafları
• Cihaz Bilgileri: IP adresi, cihaz kimliği, tarayıcı bilgileri
• İşlem Bilgileri: Coin geçmişi, withdrawal işlemleri
• Çerez Bilgileri: Oturum çerezleri, analitik çerezleri`,
  },
  {
    id: 'isleme_amac',
    title: '3. Kişisel Verilerin İşlenme Amaçları',
    content: `Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:

• Üyelik ve hesap oluşturma işlemlerinin yürütülmesi
• Kimlik doğrulama ve güvenlik kontrollerinin sağlanması
• Coin ve hediye süreçlerinin yürütülmesi (kullanıcıdan kullanıcıya transfer yapılmaz)
• Anı kanıtlarının doğrulanması
• IAP satın almalarının güvenli şekilde tamamlanması
• Yasal Ödeme Yükümlülükleri: Withdrawal KYC (Müşterini Tanı) prosedürleri kapsamında kimlik doğrulama
• Yasal yükümlülüklerin yerine getirilmesi (5549 sayılı MASAK Kanunu dahil)
• Müşteri memnuniyeti ve destek hizmetlerinin sunulması
• Fraud (dolandırıcılık) tespiti ve önlenmesi
• Hizmetlerimizin iyileştirilmesi ve analizi`,
  },
  {
    id: 'hukuki_sebepler',
    title: '4. Hukuki Sebepler',
    content: `Kişisel verileriniz KVKK'nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:

• Sözleşmenin kurulması veya ifası (Md. 5/2-c): Platform üyelik sözleşmesi, hediye işlemleri
• Kanuni yükümlülük (Md. 5/2-ç): Vergi mevzuatı, e-ticaret düzenlemeleri, 5549 sayılı MASAK Kanunu, withdrawal KYC yükümlülükleri
• Meşru menfaat (Md. 5/2-f): Hizmet kalitesi, güvenlik önlemleri
• Açık rıza (Md. 5/1): Pazarlama iletileri, kişiselleştirme

Özel nitelikli kişisel verileriniz (varsa) yalnızca açık rızanızla işlenmektedir.`,
  },
  {
    id: 'veri_aktarimi',
    title: '5. Kişisel Verilerin Aktarılması',
    content: `Kişisel verileriniz, yukarıda belirtilen amaçlarla sınırlı olmak üzere aşağıdaki taraflara aktarılabilmektedir:

Yurt İçi Aktarımlar:
• PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş. (withdrawal işlemleri ve KYC doğrulama)
  - Aktarılan veriler: Kimlik bilgileri, T.C. Kimlik No, kimlik belgesi görüntüsü
  - Aktarım amacı: Yasal Ödeme Yükümlülükleri, MASAK uyumu, KYC prosedürleri
• Yetkili kamu kurum ve kuruluşları (yasal zorunluluk halinde)

Yurt Dışı Aktarımlar (KVKK Md. 9 uyarınca):
• Amazon Web Services (AWS) - veri depolama
• Google Cloud Platform - analitik hizmetleri
• Sentry - hata takibi

Yurt dışı aktarımlarında KVKK'nın 9. maddesi kapsamında gerekli güvenlik önlemleri alınmaktadır.`,
  },
  {
    id: 'veri_toplama',
    title: '6. Kişisel Verilerin Toplanma Yöntemi',
    content: `Kişisel verileriniz aşağıdaki yöntemlerle toplanmaktadır:

• Mobil uygulama üzerinden doğrudan iletim
• Web sitesi formları
• API entegrasyonları
• Çerezler ve benzeri teknolojiler
• Withdrawal KYC doğrulama süreci (kimlik belgesi tarama)
• IAP ve withdrawal sağlayıcıları aracılığıyla

Veriler otomatik ve yarı otomatik yollarla işlenmektedir.`,
  },
  {
    id: 'saklama_suresi',
    title: '7. Kişisel Verilerin Saklanma Süresi',
    content: `Kişisel verileriniz, işlenme amaçlarının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen zamanaşımı süreleri kadar saklanmaktadır:

• Üyelik bilgileri: Hesap aktif olduğu sürece
• KYC/Kimlik bilgileri: 10 yıl (MASAK mevzuatı)
• İşlem kayıtları: 10 yıl (Türk Ticaret Kanunu)
• Fatura bilgileri: 10 yıl (Vergi mevzuatı)
• Güvenlik logları: 2 yıl
• Pazarlama onayları: İzin geri alınana kadar

Süre sonunda verileriniz silinir, yok edilir veya anonimleştirilir.`,
  },
  {
    id: 'haklariniz',
    title: '8. KVKK Kapsamındaki Haklarınız',
    content: `KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:

a) Kişisel verilerinizin işlenip işlenmediğini öğrenme
b) İşlenmişse buna ilişkin bilgi talep etme
c) İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme
d) Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme
e) Eksik veya yanlış işlenmişse düzeltilmesini isteme
f) KVKK'nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme
g) (e) ve (f) bentleri uyarınca yapılan işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme
h) İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme
ı) Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme`,
  },
  {
    id: 'basvuru',
    title: '9. Başvuru Yöntemi',
    content: `KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:

1. Uygulama İçi Talep: Ayarlar > Gizlilik > Veri Talebi
2. E-posta: ${COMPANY_INFO.email}
3. KEP: ${COMPANY_INFO.kep}
4. Yazılı Başvuru: Şirket adresimize iadeli taahhütlü posta

Başvurularınız en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır. İşlemin ayrıca bir maliyet gerektirmesi hâlinde, Kurul tarafından belirlenen tarife uygulanabilir.`,
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export default function KVKKAydinlatmaScreen({
  navigation,
}: KVKKAydinlatmaScreenProps) {
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
        <Text style={styles.headerTitle}>KVKK Aydınlatma Metni</Text>
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

        {/* KVKK Badge */}
        <View style={styles.kvkkBadge}>
          <MaterialCommunityIcons
            name="shield-check"
            size={24}
            color="#1976D2"
          />
          <Text style={styles.kvkkBadgeText}>
            6698 Sayılı KVKK Md. 10 Kapsamında Aydınlatma Metni
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
            Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması
            Kanunu'nun 10. maddesi ve Aydınlatma Yükümlülüğünün Yerine
            Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca
            hazırlanmıştır.
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
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  versionBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  versionText: {
    ...TYPOGRAPHY.bodySmall,
    color: '#1565C0',
    textAlign: 'center',
  },
  kvkkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  kvkkBadgeText: {
    flex: 1,
    ...TYPOGRAPHY.bodyMedium,
    color: '#1565C0',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    lineHeight: 24,
  },
  sectionContent: {
    ...TYPOGRAPHY.bodyMedium,
    lineHeight: 24,
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
