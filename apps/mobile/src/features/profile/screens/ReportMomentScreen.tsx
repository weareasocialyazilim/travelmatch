import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { logger } from '@/utils/logger';
import { BaseReportScreen, ReportSummaryCard } from '../components/report';
import { COLORS } from '../constants/colors';
import type { ReportOption } from '../components/report';
import type { RootStackParamList } from '../navigation/AppNavigator';
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

type ReportReason = 'scam' | 'inappropriate' | 'hate' | 'spam' | 'other';

const REPORT_OPTIONS: ReportOption<ReportReason>[] = [
  { id: 'scam', label: 'Scam or fake story' },
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'hate', label: 'Hate or harassment' },
  { id: 'spam', label: 'Spam or misleading' },
  { id: 'other', label: 'Other' },
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
          Sunrise over the Andes
        </Text>
        <Text style={styles.momentDetails} numberOfLines={1}>
          Cusco, Peru • $50 • Adventure
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
      logger.info('Report submitted', {
        momentId,
        selectedReason: reason,
        additionalDetails: details,
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
      title="Report Moment"
      sectionTitle="Why are you reporting?"
      options={REPORT_OPTIONS}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitButtonText="Submit Report"
      detailsLabel="Anything we should know?"
      detailsPlaceholder="Provide additional details (optional)"
      summaryCard={<MomentSummaryCard />}
      radioPosition="left"
      testID="report-moment-screen"
    />
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: `${COLORS.border}40`,
  },
  momentImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  momentInfo: {
    flex: 1,
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  momentDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
