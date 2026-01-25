import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';

interface InfoItem {
  id: string;
  title: string;
  description: string;
}

const INFO_ITEMS: InfoItem[] = [
  {
    id: '1',
    title: 'Escrow Koruması',
    description:
      'Tüm hediye fonları güvenli bir escrow hesabında tutulur. Fonlar yalnızca kanıt onaylandıktan sonra alıcıya aktarılır.',
  },
  {
    id: '2',
    title: 'Kanıt Gereksinimleri',
    description:
      'Fonların serbest bırakılması için alıcıların hediye şartlarına uygun kanıt sunması gerekir (örn: konum etiketli fotoğraflar, bilet).',
  },
  {
    id: '3',
    title: 'Kimlik Doğrulama (KYC)',
    description:
      'Güvenlik ve yasal uyum için, ilk para çekme işleminizden önce tek seferlik kimlik doğrulaması gereklidir.',
  },
  {
    id: '4',
    title: 'Güvenli Ödemeler',
    description:
      'Kart bilgileriniz bizde saklanmaz. Tüm işlemler PCI-DSS uyumlu PayTR altyapısı üzerinden gerçekleştirilir.',
  },
  {
    id: '5',
    title: 'KYC Kontrolleri',
    description:
      'Devlet tarafından verilmiş kimlik belgesi (TC Kimlik, Ehliyet veya Pasaport) ve biyometrik karşılaştırma için selfie doğrulaması.',
  },
];

import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type PaymentsKYCScreenProps = StackScreenProps<
  RootStackParamList,
  'PaymentsKYC'
>;

export default function PaymentsKYCScreen({
  navigation,
}: PaymentsKYCScreenProps) {
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
            color={COLORS.utility.white}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ödemeler ve KYC</Text>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Title */}
        <Text style={styles.mainTitle}>Ödemeler, Escrow ve Doğrulama</Text>

        {/* Trust Badge */}
        <Text style={styles.disclaimer}>
          Lovendo, finansal güvenliğinizi en üst düzeyde korur. PayTR altyapısı
          ile PCI-DSS uyumlu, BDDK lisanslı güvenli ödeme sistemi
          kullanılmaktadır.
        </Text>

        {/* Info Items List */}
        <View style={styles.itemsList}>
          {INFO_ITEMS.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.bullet} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}:</Text>
                <Text style={styles.itemDescription}> {item.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.brownDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.brownDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.whiteTransparentDarkest,
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
    color: COLORS.utility.white,
    textAlign: 'center',
    paddingRight: 48,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
  },
  mainTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.utility.white,
    marginBottom: 16,
  },
  disclaimer: {
    ...TYPOGRAPHY.bodySmall,
    lineHeight: 20,
    color: COLORS.brownGray,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  itemsList: {
    gap: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.orangeBright,
    marginTop: 8,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.utility.white,
    lineHeight: 24,
  },
  itemDescription: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '400',
    color: COLORS.utility.white,
    lineHeight: 24,
  },
});
