import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui';
import { useAccessibility } from '@/hooks/useAccessibility';
import { COLORS } from '@/constants/colors';
import { useMoments, type Moment } from '@/hooks/useMoments';
import { DeleteMomentDialog } from '@/features/moments/components/DeleteMomentDialog';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { Moment as MomentType } from '../types';
import type { NavigationProp } from '@react-navigation/native';

type TabType = 'active' | 'completed';

const MyMomentsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const { props: a11y } = useAccessibility();

  const {
    myMoments,
    myMomentsLoading,
    loadMyMoments,
    deleteMoment,
    pauseMoment,
    activateMoment,
  } = useMoments();

  // Delete dialog state
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [momentToDelete, setMomentToDelete] = useState<Moment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadMyMoments();
  }, [loadMyMoments]);

  const activeMoments = useMemo(
    () =>
      myMoments.filter((m) => ['active', 'paused', 'draft'].includes(m.status)),
    [myMoments],
  );

  const completedMoments = useMemo(
    () => myMoments.filter((m) => m.status === 'completed'),
    [myMoments],
  );

  const moments = activeTab === 'active' ? activeMoments : completedMoments;

  // Convert Moment to full Moment type for navigation
  const convertToMoment = (moment: any): MomentType & { status?: string } => {
    const locationStr =
      typeof moment.location === 'string'
        ? moment.location
        : `${moment.location?.city || ''}, ${moment.location?.country || ''}`;

    const [city, country] = locationStr.split(', ');

    return {
      id: moment.id,
      title: moment.title,
      story: moment.description || `Experience ${moment.title}`,
      imageUrl: moment.images?.[0] || '',
      image: moment.images?.[0] || '',
      price: moment.pricePerGuest,
      status: moment.status,
      location: {
        city: city || 'Unknown City',
        country: country || '',
      },
      availability: moment.status === 'active' ? 'Available' : 'Completed',
      user: {
        id: moment.hostId,
        name: moment.hostName,
        avatar: moment.hostAvatar,
        type: 'local',
        isVerified: true,
        location: locationStr,
        travelDays: 0,
      },
      giftCount: 0,
      category: {
        id: moment.category,
        label: moment.category,
        emoji: '✨',
      },
    };
  };

  const getStatusBadge = (status: string, giftOfferCount?: number) => {
    switch (status) {
      case 'active':
        return (
          <View style={[styles.statusBadge, styles.activeBadge]}>
            <Text style={styles.activeBadgeText}>
              {giftOfferCount && giftOfferCount > 0
                ? `${giftOfferCount} gift offers`
                : 'Live'}
            </Text>
          </View>
        );
      case 'draft':
        return (
          <View style={[styles.statusBadge, styles.pendingBadge]}>
            <Text style={styles.pendingBadgeText}>Draft</Text>
          </View>
        );
      case 'completed':
        return (
          <View style={[styles.statusBadge, styles.completedBadge]}>
            <MaterialCommunityIcons
              name="check"
              size={12}
              color={COLORS.mint}
            />
            <Text style={styles.completedBadgeText}>Completed</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const handleMomentPress = (moment: any) => {
    const fullMoment = convertToMoment(moment);
    navigation.navigate('MomentDetail', {
      moment: fullMoment,
      isOwner: true,
      pendingRequests: 0,
    });
  };

  const handleCreateMoment = () => {
    navigation.navigate('CreateMoment');
  };

  // Handle edit moment
  const handleEditMoment = useCallback(
    (moment: Moment) => {
      navigation.navigate('EditMoment', { momentId: moment.id });
    },
    [navigation],
  );

  // Handle delete moment - show confirmation dialog
  const handleDeleteMoment = useCallback((moment: Moment) => {
    setMomentToDelete(moment);
    setDeleteDialogVisible(true);
  }, []);

  // Confirm delete
  const confirmDelete = useCallback(async () => {
    if (!momentToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deleteMoment(momentToDelete.id);
      if (success) {
        setDeleteDialogVisible(false);
        setMomentToDelete(null);
      } else {
        Alert.alert('Hata', 'Moment silinemedi. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsDeleting(false);
    }
  }, [momentToDelete, deleteMoment]);

  // Handle pause/activate moment
  const handleToggleStatus = useCallback(
    async (moment: Moment) => {
      if (moment.status === 'active') {
        const success = await pauseMoment(moment.id);
        if (!success) {
          Alert.alert('Hata', 'Moment duraklatılamadı.');
        }
      } else if (moment.status === 'paused') {
        const success = await activateMoment(moment.id);
        if (!success) {
          Alert.alert('Hata', 'Moment aktifleştirilemedi.');
        }
      }
    },
    [pauseMoment, activateMoment],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          {...a11y.button('Go back', 'Return to previous screen')}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
            accessible={false}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} {...a11y.header('My Moments')}>
          My Moments
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateMoment}
          {...a11y.button('Create new moment', 'Add a new travel moment')}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={COLORS.brand.secondary}
            accessible={false}
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
          {...a11y.tab(
            `Active moments, ${activeMoments.length} items`,
            activeTab === 'active',
          )}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'active' && styles.activeTabText,
            ]}
          >
            Active ({activeMoments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
          {...a11y.tab(
            `Completed moments, ${completedMoments.length} items`,
            activeTab === 'completed',
          )}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'completed' && styles.activeTabText,
            ]}
          >
            Completed ({completedMoments.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={myMomentsLoading}
            onRefresh={loadMyMoments}
            tintColor={COLORS.brand.secondary}
          />
        }
      >
        {myMomentsLoading && myMoments.length === 0 ? (
          <SkeletonList type="moment" count={3} />
        ) : moments.length === 0 ? (
          <EmptyState
            illustrationType={
              activeTab === 'active' ? 'no_moments' : 'no_moments'
            }
            icon={activeTab === 'active' ? 'map-marker-star' : 'check-circle'}
            title={
              activeTab === 'active'
                ? 'No active moments'
                : 'No completed moments yet'
            }
            description={
              activeTab === 'active'
                ? 'Create your first moment to start receiving requests'
                : 'Complete your first moment to see it here'
            }
            actionLabel={activeTab === 'active' ? 'Create Moment' : undefined}
            onAction={activeTab === 'active' ? handleCreateMoment : undefined}
          />
        ) : (
          moments.map((moment) => (
            <View key={moment.id} style={styles.momentCardContainer}>
              <TouchableOpacity
                style={styles.momentCard}
                onPress={() => handleMomentPress(moment)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: moment.image || moment.images?.[0] }}
                  style={styles.momentImage}
                />
                <View style={styles.momentContent}>
                  <View style={styles.momentHeader}>
                    <Text style={styles.momentTitle} numberOfLines={1}>
                      {moment.title}
                    </Text>
                    {getStatusBadge(moment.status, moment.requestCount)}
                  </View>
                  <View style={styles.momentLocation}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={14}
                      color={COLORS.text.secondary}
                    />
                    <Text style={styles.momentLocationText}>
                      {typeof moment.location === 'string'
                        ? moment.location
                        : `${moment.location.city}, ${moment.location.country}`}
                    </Text>
                  </View>
                  <View style={styles.momentFooter}>
                    <Text style={styles.momentPrice}>
                      ${moment.price ?? moment.pricePerGuest}
                    </Text>
                    {moment.status === 'completed' && moment.rating && (
                      <View style={styles.ratingContainer}>
                        <MaterialCommunityIcons
                          name="star"
                          size={14}
                          color={COLORS.softOrange}
                        />
                        <Text style={styles.ratingText}>{moment.rating}.0</Text>
                      </View>
                    )}
                    {moment.status === 'completed' && moment.completedDate && (
                      <Text style={styles.completedDate}>
                        {moment.completedDate}
                      </Text>
                    )}
                  </View>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={COLORS.softGray}
                />
              </TouchableOpacity>

              {/* Action Buttons - only for active/paused/draft moments */}
              {['active', 'paused', 'draft'].includes(moment.status) && (
                <View style={styles.actionButtons}>
                  {/* Pause/Activate Toggle */}
                  {(moment.status === 'active' ||
                    moment.status === 'paused') && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.toggleButton]}
                      onPress={() => handleToggleStatus(moment)}
                    >
                      <MaterialCommunityIcons
                        name={moment.status === 'active' ? 'pause' : 'play'}
                        size={16}
                        color={COLORS.text.secondary}
                      />
                      <Text style={styles.actionButtonText}>
                        {moment.status === 'active'
                          ? 'Duraklat'
                          : 'Aktifleştir'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Edit Button */}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditMoment(moment)}
                  >
                    <MaterialCommunityIcons
                      name="pencil"
                      size={16}
                      color={COLORS.brand.secondary}
                    />
                    <Text
                      style={[styles.actionButtonText, styles.editButtonText]}
                    >
                      Düzenle
                    </Text>
                  </TouchableOpacity>

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteMoment(moment)}
                  >
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={16}
                      color={COLORS.feedback.error}
                    />
                    <Text
                      style={[styles.actionButtonText, styles.deleteButtonText]}
                    >
                      Sil
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}

        {/* Summary Card for Completed */}
        {activeTab === 'completed' && completedMoments.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total completed</Text>
              <Text style={styles.summaryValue}>
                {completedMoments.length} moments
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total earned</Text>
              <Text style={styles.summaryValueHighlight}>
                $
                {completedMoments.reduce(
                  (sum, m) => sum + (m.price ?? m.pricePerGuest ?? 0),
                  0,
                )}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <DeleteMomentDialog
        visible={deleteDialogVisible}
        onClose={() => {
          setDeleteDialogVisible(false);
          setMomentToDelete(null);
        }}
        onConfirm={confirmDelete}
        momentTitle={momentToDelete?.title || ''}
        isDeleting={isDeleting}
      />
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
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.bg.primary,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: COLORS.brand.secondary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: COLORS.utility.white,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Moment Card
  momentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  momentImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: COLORS.bg.primary,
  },
  momentContent: {
    flex: 1,
    marginLeft: 12,
  },
  momentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  momentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: 8,
  },
  momentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  momentLocationText: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  momentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  momentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.brand.secondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  completedDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },

  // Status Badges
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: COLORS.brand.secondaryTransparent,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.brand.secondary,
  },
  pendingBadge: {
    backgroundColor: COLORS.softOrangeTransparent,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.softOrange,
  },
  completedBadge: {
    backgroundColor: COLORS.mintTransparent,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.mint,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  summaryValueHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.mint,
  },

  bottomSpacer: {
    height: 40,
  },

  // Moment card container for action buttons
  momentCardContainer: {
    marginBottom: 16,
  },

  // Action buttons row
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  toggleButton: {
    backgroundColor: COLORS.surface.base,
  },
  editButton: {
    backgroundColor: COLORS.brand.secondaryTransparent,
  },
  deleteButton: {
    backgroundColor: COLORS.feedback.error + '15',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  editButtonText: {
    color: COLORS.brand.secondary,
  },
  deleteButtonText: {
    color: COLORS.feedback.error,
  },
});

export default MyMomentsScreen;
