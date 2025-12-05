import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { logger } from '@/utils/logger';
import { BaseReportScreen, ReportSummaryCard } from '../components/report';
import type { ReportOption } from '../components/report';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';

type ReportUserScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ReportUser'
>;

type ReportUserScreenRouteProp = RouteProp<RootStackParamList, 'ReportUser'>;

interface ReportUserScreenProps {
  navigation: ReportUserScreenNavigationProp;
  route: ReportUserScreenRouteProp;
}

type ReportReason = 'scam' | 'hate' | 'fake' | 'inappropriate' | 'other';

const REPORT_OPTIONS: ReportOption<ReportReason>[] = [
  { id: 'scam', label: 'Scam or payment issue' },
  { id: 'hate', label: 'Hate, threats or harassment' },
  { id: 'fake', label: 'Fake identity or fake trip' },
  { id: 'inappropriate', label: 'Inappropriate messages' },
  { id: 'other', label: 'Other' },
];

/**
 * UserSummaryCard - Displays user info in report screen
 */
function UserSummaryCard(): React.JSX.Element {
  return (
    <ReportSummaryCard>
      <View style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>John Appleseed</Text>
        <Text style={styles.userRole}>Traveler / Local</Text>
      </View>
    </ReportSummaryCard>
  );
}

export const ReportUserScreen: React.FC<ReportUserScreenProps> = ({
  navigation,
  route,
}) => {
  const { userId } = route.params;

  const handleSubmit = useCallback(
    (reason: ReportReason, details: string) => {
      logger.info('Report submitted', {
        userId,
        selectedReason: reason,
        additionalDetails: details,
      });
      navigation.goBack();
    },
    [userId, navigation],
  );

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <BaseReportScreen
      title="Report User"
      sectionTitle="What's the issue?"
      options={REPORT_OPTIONS}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitButtonText="Send report"
      detailsLabel="Add details (optional)"
      detailsPlaceholder="Please provide more information..."
      summaryCard={<UserSummaryCard />}
      radioPosition="right"
      testID="report-user-screen"
    />
  );
};

const styles = StyleSheet.create({
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.border,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
