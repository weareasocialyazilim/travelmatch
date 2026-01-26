/**
 * MyDisputesScreen - Track all dispute submissions and their status
 *
 * P2 FIX: Added dispute status tracking
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from 'react-i18next';
import { disputesApi, type Dispute } from '../services/disputesService';
import { logger } from '@/utils/logger';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

interface DisputeWithStatus extends Dispute {
  displayType: string;
  displayStatus: string;
  statusColor: string;
}

export const MyDisputesScreen: React.FC = () => {
  const { showToast } = useToast();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  const [disputes, setDisputes] = useState<DisputeWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const data = await disputesApi.getMyDisputes();

      const disputesWithStatus: DisputeWithStatus[] = data.map((d) => ({
        ...d,
        displayType: d.transaction_id ? 'İşlem İtirazı' : 'Kanıt İtirazı',
        displayStatus: getStatusDisplay(d.status),
        statusColor: getStatusColor(d.status),
      }));

      setDisputes(disputesWithStatus);
    } catch (error) {
      logger.error('[MyDisputes] Failed to load:', error);
      showToast('Itirazlar yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'in_review':
        return 'İnceleniyor';
      case 'resolved':
        return 'Çözüldü';
      case 'dismissed':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return COLORS.feedback.warning;
      case 'in_review':
        return COLORS.brand.primary;
      case 'resolved':
        return COLORS.feedback.success;
      case 'dismissed':
        return COLORS.feedback.error;
      default:
        return COLORS.text.secondary;
    }
  };

  const handleViewDispute = (dispute: DisputeWithStatus) => {
    navigation.navigate('DisputeStatus', { disputeId: dispute.id });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderDispute = (dispute: DisputeWithStatus) => (
    <TouchableOpacity
      key={dispute.id}
      style={styles.disputeCard}
      onPress={() => handleViewDispute(dispute)}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.disputeType}>{dispute.displayType}</Text>
          <Text style={styles.disputeDate}>
            {formatDate(dispute.created_at)}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: dispute.statusColor + '20' },
          ]}
        >
          <Text style={[styles.statusText, { color: dispute.statusColor }]}>
            {dispute.displayStatus}
          </Text>
        </View>
      </View>

      <Text style={styles.reasonLabel}>Sebep:</Text>
      <Text style={styles.reasonText} numberOfLines={2}>
        {dispute.reason}
      </Text>

      {dispute.notes && (
        <>
          <Text style={styles.notesLabel}>Açıklama:</Text>
          <Text style={styles.notesText} numberOfLines={2}>
            {dispute.notes}
          </Text>
        </>
      )}

      {dispute.evidence && dispute.evidence.length > 0 && (
        <View style={styles.evidenceRow}>
          <MaterialCommunityIcons
            name="attachment"
            size={16}
            color={COLORS.text.secondary}
          />
          <Text style={styles.evidenceCount}>
            {dispute.evidence.length} dosya eklendi
          </Text>
        </View>
      )}

      {dispute.resolution && (
        <View style={styles.resolutionBox}>
          <MaterialCommunityIcons
            name="check-circle"
            size={16}
            color={
              dispute.status === 'resolved'
                ? COLORS.feedback.success
                : COLORS.feedback.error
            }
          />
          <Text style={styles.resolutionText}>{dispute.resolution}</Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.viewDetails}>Detayları Görüntüle</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={COLORS.brand.primary}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        <Text style={styles.headerTitle}>İtirazlarım</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.brand.primary} />
            <Text style={styles.loadingText}>İtirazlar yükleniyor...</Text>
          </View>
        ) : disputes.length > 0 ? (
          <>
            <Text style={styles.sectionInfo}>
              Tüm itirazlarınızı ve durumlarını buradan takip edebilirsiniz.
            </Text>
            {disputes.map(renderDispute)}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={64}
              color={COLORS.text.tertiary}
            />
            <Text style={styles.emptyTitle}>İtiraz Bulunmuyor</Text>
            <Text style={styles.emptyDescription}>
              Henüz bir itiraz oluşturmadınız. Herhangi bir sorun yaşarsanız
              itiraz oluşturabilirsiniz.
            </Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionInfo: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.secondary,
    marginTop: 16,
  },
  disputeCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  disputeType: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  disputeDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  reasonLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  reasonText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  notesLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  notesText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  evidenceCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  resolutionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface.base,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  resolutionText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.primary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  viewDetails: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.brand.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h5,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
  },
  emptyDescription: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
});

export default MyDisputesScreen;
