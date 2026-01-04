import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { profileApi } from '@/features/profile/services/profileService';
import { logger } from '@/utils/logger';

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
  type: string;
  status: 'approved' | 'pending' | 'rejected' | 'verified';
  file_url: string | null;
  created_at: string;
  verified_at: string | null;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'approved':
    case 'verified':
      return {
        icon: 'shield-check' as IconName,
        color: COLORS.trust.primary,
        bgColor: COLORS.trustTransparent20,
        label: 'Approved',
      };
    case 'pending':
      return {
        icon: 'clock-outline' as IconName,
        color: COLORS.feedback.warning,
        bgColor: COLORS.warningTransparent20,
        label: 'Pending',
      };
    case 'rejected':
      return {
        icon: 'close-circle' as IconName,
        color: COLORS.feedback.error,
        bgColor: COLORS.errorTransparent20,
        label: 'Rejected',
      };
    default:
      return {
        icon: 'help-circle' as IconName,
        color: COLORS.text.secondary,
        bgColor: `${COLORS.text.secondary}20`,
        label: 'Unknown',
      };
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const ProofHistoryScreen: React.FC<ProofHistoryScreenProps> = ({
  navigation,
  route,
}) => {
  const momentId = route.params?.momentId || '';
  const [proofs, setProofs] = useState<ProofItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [momentDetails, setMomentDetails] = useState<{
    title: string;
    location: string;
    price: number;
    image: string;
  } | null>(null);

  const fetchProofHistory = useCallback(async () => {
    try {
      // Fetch proof history for the current user
      const {
        data: { user },
      } = await (await import('@/config/supabase')).supabase.auth.getUser();
      if (!user) return;

      const data = await profileApi.getProofHistory(user.id);

      // Filter by momentId if provided
      const filteredProofs = momentId
        ? (data || []).filter((p: any) => p.moment_id === momentId)
        : data || [];

      setProofs(
        filteredProofs.map((p: any) => ({
          id: p.id,
          type: p.type,
          status: p.status as ProofItem['status'],
          file_url: p.file_url,
          created_at: p.created_at,
          verified_at: p.verified_at,
        })),
      );

      // Fetch moment details if momentId is provided
      if (momentId) {
        const { supabase } = await import('@/config/supabase');
        const { data: moment } = await supabase
          .from('moments')
          .select('title, location, price, images')
          .eq('id', momentId)
          .single();

        if (moment) {
          setMomentDetails({
            title: moment.title || 'Untitled Moment',
            location: moment.location || '',
            price: moment.price || 0,
            image: moment.images?.[0] || '',
          });
        }
      }
    } catch (error) {
      logger.error('Failed to fetch proof history', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [momentId]);

  useEffect(() => {
    fetchProofHistory();
  }, [fetchProofHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProofHistory();
  }, [fetchProofHistory]);

  const renderEmptyState = () => (
    <EmptyState
      icon="camera"
      title="No moment verifications yet"
      description="Verified moments will appear here once they are authenticated."
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={'arrow-left' as IconName}
              size={24}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Moment Verification</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proof History</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Moment Summary Card */}
        {momentDetails && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Image
                source={{
                  uri:
                    momentDetails.image ||
                    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=200',
                }}
                style={styles.summaryImage}
              />
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryTitle} numberOfLines={1}>
                  {momentDetails.title}
                </Text>
                <Text style={styles.summaryMeta} numberOfLines={2}>
                  {momentDetails.location} • ${momentDetails.price}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Proof List */}
        {proofs.length > 0 ? (
          <View style={styles.proofList}>
            {proofs.map((proof) => {
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
                        {proof.type || 'Moment'} Verification
                      </Text>
                      <Text style={styles.proofMeta} numberOfLines={2}>
                        {config.label} • {formatDate(proof.created_at)} •{' '}
                        {formatTime(proof.created_at)}
                      </Text>
                    </View>
                  </View>
                  {proof.file_url && (
                    <TouchableOpacity
                      style={styles.viewButton}
                      activeOpacity={0.7}
                      onPress={() => {
                        navigation.navigate('ProofDetail', {
                          proofId: proof.id,
                        });
                      }}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                  )}
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
    backgroundColor: COLORS.bg.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
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
    color: COLORS.text.primary,
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
    backgroundColor: COLORS.utility.white,
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
    backgroundColor: COLORS.bg.primary,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  summaryMeta: {
    fontSize: 14,
    color: COLORS.text.secondary,
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
    backgroundColor: COLORS.utility.white,
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
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  proofMeta: {
    fontSize: 14,
    color: COLORS.text.secondary,
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
    color: COLORS.brand.primary,
  },
});
