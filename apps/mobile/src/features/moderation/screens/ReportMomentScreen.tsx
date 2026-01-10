/**
 * ReportMomentScreen - Moment/Proof Report Flow
 *
 * Updated for Moment platform:
 * - Removed travel-related report options (e.g., "Bilet sahte")
 * - Added gift/proof specific options
 * - Liquid Reporting UX - non-threatening feedback flow
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HapticManager } from '@/services/HapticManager';
import { logger } from '@/utils/logger';
import {
  BaseReportScreen,
  ReportSummaryCard,
  type ReportOption,
} from '../components';
import { COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type ReportMomentScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ReportMoment'
>;

type ReportMomentScreenRouteProp = RouteProp<
  RootStackParamList,
  'ReportMoment'
>;

interface ReportMomentScreenProps {
  navigation: ReportMomentScreenNavigationProp;
  route: ReportMomentScreenRouteProp;
}

// Updated report reasons for Moment/Gift platform
type ReportReason =
  | 'misleading_moment' // Anı yanıltıcı
  | 'insufficient_proof' // Kanıt yetersiz
  | 'fake_content' // Sahte içerik
  | 'inappropriate' // Uygunsuz içerik
  | 'harassment' // Taciz
  | 'spam' // Spam
  | 'other'; // Diğer

const REPORT_OPTIONS: ReportOption<ReportReason>[] = [
  {
    id: 'misleading_moment',
    label: 'Anı yanıltıcı',
    description: 'İçerik gerçeği yansıtmıyor veya abartılı',
  },
  {
    id: 'insufficient_proof',
    label: 'Kanıt yetersiz',
    description: 'Sunulan kanıt anıyı doğrulamıyor',
  },
  {
    id: 'fake_content',
    label: 'Sahte içerik',
    description: 'Fotoğraf veya video manipüle edilmiş',
  },
  {
    id: 'inappropriate',
    label: 'Uygunsuz içerik',
    description: 'Topluluk kurallarına aykırı',
  },
  {
    id: 'harassment',
    label: 'Taciz veya zorbalık',
    description: 'Rahatsız edici veya tehditkâr davranış',
  },
  {
    id: 'spam',
    label: 'Spam veya aldatıcı',
    description: 'Tekrarlayan veya aldatıcı içerik',
  },
  {
    id: 'other',
    label: 'Diğer',
    description: 'Yukarıdakilerden farklı bir neden',
  },
];

/**
 * MomentSummaryCard - Displays moment info in report screen
 */
function MomentSummaryCard(): React.JSX.Element {
  return (
    <ReportSummaryCard style={styles.summaryCard}>
      <View style={styles.momentImage} />
      <View style={styles.momentInfo}>
        <Text style={styles.momentTitle} numberOfLines={1}>
          Kapadokya Balon Turu
        </Text>
        <Text style={styles.momentDetails} numberOfLines={1}>
          Kapadokya, Türkiye • ₺2,500 • Macera
        </Text>
      </View>
    </ReportSummaryCard>
  );
}

export const ReportMomentScreen: React.FC<ReportMomentScreenProps> = ({
  navigation,
  route,
}) => {
  const { momentId } = route.params;

  const handleSubmit = useCallback(
    (reason: ReportReason, details: string) => {
      // Haptic feedback for submission
      HapticManager.success();

      logger.info('Moment report submitted', {
        momentId,
        selectedReason: reason,
        additionalDetails: details,
        category: 'gift_proof_dispute', // Updated category
      });
      navigation.goBack();
    },
    [momentId, navigation],
  );

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <BaseReportScreen
      title="Anı Bildir"
      sectionTitle="Neden bildiriyorsunuz?"
      options={REPORT_OPTIONS}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitButtonText="Raporu Gönder"
      detailsLabel="Ek bilgi vermek ister misiniz?"
      detailsPlaceholder="Detayları buraya yazın (isteğe bağlı)"
      summaryCard={<MomentSummaryCard />}
      radioPosition="left"
      testID="report-moment-screen"
    />
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: `${COLORS.border.default}40`,
  },
  momentImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: COLORS.border.default,
  },
  momentInfo: {
    flex: 1,
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  momentDetails: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});
