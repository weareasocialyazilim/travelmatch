import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { RouteProp } from '@react-navigation/native';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type ProofHistoryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProofHistory'
>;
type ProofHistoryScreenRouteProp = RouteProp<
  RootStackParamList,
  'ProofHistory'
>;

interface ProofHistoryScreenProps {
  navigation: ProofHistoryScreenNavigationProp;
  route: ProofHistoryScreenRouteProp;
}

interface ProofItem {
  id: string;
  submitter: string;
  status: 'approved' | 'pending' | 'rejected';
  timestamp: string;
  date: string;
}

const PROOF_ITEMS: ProofItem[] = [
  {
    id: '1',
    submitter: 'Lina',
    status: 'approved',
    timestamp: '07:42',
    date: 'Today',
  },
  {
    id: '2',
    submitter: 'Lina',
    status: 'pending',
    timestamp: '15:30',
    date: 'Yesterday',
  },
  {
    id: '3',
    submitter: 'Lina',
    status: 'rejected',
    timestamp: '09:15',
    date: '2 days ago',
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'approved':
      return {
        icon: 'shield-check' as IconName,
        color: '#10B981',
        bgColor: '#10B98120',
        label: 'Approved',
      };
    case 'pending':
      return {
        icon: 'clock-outline' as IconName,
        color: COLORS.warning,
        bgColor: COLORS.warningTransparent20,
        label: 'Pending',
      };
    case 'rejected':
      return {
        icon: 'close-circle' as IconName,
        color: COLORS.error,
        bgColor: COLORS.errorTransparent20,
        label: 'Rejected',
      };
    default:
      return {
        icon: 'help-circle' as IconName,
        color: COLORS.textSecondary,
        bgColor: `${COLORS.textSecondary}20`,
        label: 'Unknown',
      };
  }
};

export const ProofHistoryScreen: React.FC<ProofHistoryScreenProps> = ({
  navigation,
  route,
}) => {
  const _momentId = route.params?.momentId || '';

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons
          name={'camera' as IconName}
          size={40}
          color={COLORS.primary}
        />
      </View>
      <Text style={styles.emptyTitle}>No proofs yet</Text>
      <Text style={styles.emptyDescription}>
        Proofs submitted by the traveler will appear here once they are uploaded
        for verification.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={'arrow-left' as IconName}
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proof History</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Moment Summary Card */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=200',
              }}
              style={styles.summaryImage}
            />
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle} numberOfLines={1}>
                Hiking the Diamond Head Trail
              </Text>
              <Text style={styles.summaryMeta} numberOfLines={2}>
                Honolulu, HI • $50
              </Text>
            </View>
          </View>
        </View>

        {/* Proof List */}
        {PROOF_ITEMS.length > 0 ? (
          <View style={styles.proofList}>
            {PROOF_ITEMS.map((proof) => {
              const config = getStatusConfig(proof.status);
              return (
                <View key={proof.id} style={styles.proofItem}>
                  <View style={styles.proofContent}>
                    <View
                      style={[
                        styles.proofIconContainer,
                        { backgroundColor: config.bgColor },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={config.icon}
                        size={24}
                        color={config.color}
                      />
                    </View>
                    <View style={styles.proofInfo}>
                      <Text style={styles.proofTitle} numberOfLines={1}>
                        Proof from {proof.submitter}
                      </Text>
                      <Text style={styles.proofMeta} numberOfLines={2}>
                        {config.label} • {proof.date} • {proof.timestamp}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.viewButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  summaryMeta: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  proofList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 4,
  },
  proofItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    minHeight: 72,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  proofContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  proofIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proofInfo: {
    flex: 1,
  },
  proofTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  proofMeta: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyState: {
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 32,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 20,
  },
});
