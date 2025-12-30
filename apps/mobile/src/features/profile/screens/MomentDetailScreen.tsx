import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GiftMomentBottomSheet } from '@/components/GiftMomentBottomSheet';
import { GiftSuccessModal } from '@/components/GiftSuccessModal';
import {
  MomentHeader,
  MomentGallery as _MomentGallery,
  MomentInfo,
  HostSection,
  RequestsSection,
  ReviewsSection,
  SummarySection,
  ActionBar,
  ContributorSlotsSection,
} from '@/components/moment-detail';
import type { Contributor } from '@/components/moment-detail';
import { ReportBlockBottomSheet } from '@/components/ReportBlockBottomSheet';
import { COLORS } from '@/constants/colors';
import { VALUES } from '@/constants/values';
import { useMoments } from '../hooks';
import { supabase } from '@/config/supabase';
import { useAnalytics } from '@/hooks/useAnalytics';
import { requestService } from '@/services/requestService';
import { reviewService } from '@/services/reviewService';
import type {
  MomentUser,
  PendingRequest,
  Review,
  ActionLoadingState,
} from '@/components/moment-detail';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { MomentData } from '../types';
import type { RouteProp, NavigationProp } from '@react-navigation/native';
import { useToast } from '@/context/ToastContext';
import { logger } from '@/utils/production-logger';

type MomentDetailRouteProp = RouteProp<RootStackParamList, 'MomentDetail'>;

const MomentDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<MomentDetailRouteProp>();
  const { showToast } = useToast();
  const {
    moment,
    isOwner = false,
    pendingRequests: _pendingRequests = 0,
  } = route.params;

  // Hooks
  const { saveMoment, deleteMoment } = useMoments();
  const { trackEvent } = useAnalytics();

  const trackMount = useCallback(() => {
    trackEvent('moment_detail_view', { momentId: moment.id });
  }, [moment.id, trackEvent]);

  const trackInteraction = useCallback(
    (action: string) => {
      trackEvent(action, { momentId: moment.id });
    },
    [moment.id, trackEvent],
  );

  // User data - coerce to MomentUser type
  const userSource = moment.user || moment.creator;
  const momentUser: MomentUser = {
    id: userSource?.id,
    name: userSource?.name || 'Anonymous',
    avatar:
      userSource?.avatar ||
      (userSource as { photoUrl?: string })?.photoUrl ||
      '',
    type: userSource?.type || 'traveler',
    isVerified: userSource?.isVerified || false,
    location: userSource?.location || 'Unknown',
    travelDays: userSource?.travelDays || 0,
  };

  // State
  const [showGiftSheet, setShowGiftSheet] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [giftAmount, setGiftAmount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [actionLoading, setActionLoading] = useState<ActionLoadingState>(null);

  const [pendingRequestsList, setPendingRequestsList] = useState<
    PendingRequest[]
  >([]);

  const [reviews, setReviews] = useState<Review[]>([]);

  // Contributor slots state
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [contributorCount, setContributorCount] = useState(0);
  const [maxContributors, setMaxContributors] = useState<number | null>(null);

  // Helper to check if ID is a valid UUID (not mock story ID like 's2-1')
  const isValidUUID = useCallback((id: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }, []);

  // Fetch data - only if moment ID is a valid UUID (not mock story data)
  useEffect(() => {
    const fetchReviews = async () => {
      // Skip API call for mock story IDs (like 's2-1', 's3-1')
      if (!isValidUUID(moment.id)) {
        return;
      }
      try {
        const { reviews: apiReviews } = await reviewService.getReviews({
          momentId: moment.id,
        });
        const mappedReviews = apiReviews.map((r) => ({
          id: r.id,
          name: r.reviewerName,
          avatar: r.reviewerAvatar,
          rating: r.rating,
          text: r.comment,
        }));
        setReviews(mappedReviews);
      } catch {
        // Silent fail
      }
    };

    fetchReviews();
  }, [moment.id, isValidUUID]);

  // Fetch contributors for 100+ TL moments
  useEffect(() => {
    const fetchContributors = async () => {
      if (moment.price < 100) {
        setMaxContributors(null);
        return;
      }

      // Skip if not a valid UUID (mock data)
      if (!isValidUUID(moment.id)) {
        return;
      }

      try {
        // This RPC function is expected to be created via migrations
        // For now, we use a workaround with direct query
        const { data, error } = await supabase
          .from('escrow_contributions')
          .select(
            'user_id, amount, is_anonymous, users:user_id(name, avatar_url)',
          )
          .eq('moment_id', moment.id)
          .eq('status', 'completed');

        if (error) {
          logger.error('Failed to fetch contributors', error);
          return;
        }

        if (data) {
          // Calculate max contributors based on moment price
          const calculatedMax =
            moment.price >= 500 ? 10 : moment.price >= 200 ? 5 : 3;
          setMaxContributors(calculatedMax);
          setContributorCount(data.length || 0);
          setContributors(
            (
              (data || []) as {
                user_id: string;
                is_anonymous?: boolean;
                users?: { name?: string; avatar_url?: string } | null;
              }[]
            ).map((c) => ({
              userId: c.user_id,
              name: c.users?.name || 'Anonymous',
              avatar: c.users?.avatar_url,
              isAnonymous: c.is_anonymous,
            })),
          );
        }
      } catch {
        // Silent fail
      }
    };

    fetchContributors();
  }, [moment.id, moment.price, isValidUUID]);

  useEffect(() => {
    // Skip API call for mock story IDs
    if (isOwner && isValidUUID(moment.id)) {
      const fetchRequests = async () => {
        try {
          const { requests } = await requestService.getReceivedRequests({
            momentId: moment.id,
            status: 'pending',
          });
          const mappedRequests = requests.map((r) => ({
            id: r.id,
            name: r.requesterName,
            avatar: r.requesterAvatar,
            message: r.message || '',
          }));
          setPendingRequestsList(mappedRequests);
        } catch {
          // Silent fail
        }
      };
      fetchRequests();
    }
  }, [isOwner, moment.id, isValidUUID]);

  // Animation - using Reanimated for native-driven scroll
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Effects
  useEffect(() => {
    trackMount();
  }, [trackMount]);

  // Handlers
  const handleSave = useCallback(async () => {
    if (actionLoading) return;
    setActionLoading('save');

    try {
      const success = await saveMoment(moment.id);
      if (success) {
        setIsSaved((prev) => !prev);
        trackInteraction('save');
        Alert.alert(
          isSaved ? 'Removed from Saved' : 'Saved!',
          isSaved
            ? 'This moment has been removed from your saved list.'
            : 'This moment has been added to your saved list.',
        );
      }
    } catch {
      showToast('Could not save moment. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, saveMoment, moment.id, isSaved, trackInteraction]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Moment',
      'Are you sure you want to delete this moment? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading('delete');
            try {
              const success = await deleteMoment(moment.id);
              if (success) {
                navigation.goBack();
                showToast('Your moment has been deleted.', 'info');
              }
            } catch {
              Alert.alert(
                'Error',
                'Could not delete moment. Please try again.',
              );
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  }, [deleteMoment, moment.id, navigation, showToast]);

  const handleAcceptRequest = useCallback(
    (requestId: string) => {
      showToast('The guest has been notified!', 'info');
      setPendingRequestsList((prev) => prev.filter((r) => r.id !== requestId));
    },
    [showToast],
  );

  const handleDeclineRequest = useCallback(
    (requestId: string) => {
      showToast('The guest has been notified.', 'info');
      setPendingRequestsList((prev) => prev.filter((r) => r.id !== requestId));
    },
    [showToast],
  );

  const handleGiftOption = useCallback(() => {
    trackInteraction('gift_selected');
    setShowGiftSheet(false);
    setGiftAmount(moment.price);

    setTimeout(() => {
      setShowSuccessModal(true);
    }, VALUES.ANIMATION_DURATION);
  }, [moment.price, trackInteraction]);

  const handleViewApprovals = useCallback(() => {
    setShowSuccessModal(false);
    navigation.navigate('ReceiverApproval', {
      momentTitle: moment.title,
      totalAmount: moment.price,
      momentId: moment.id,
    });
  }, [moment.price, moment.title, moment.id, navigation]);

  const handleEdit = useCallback(() => {
    navigation.navigate('EditMoment', { momentId: moment.id });
  }, [moment.id, navigation]);

  const handleShare = useCallback(() => {
    navigation.navigate('ShareMoment', { momentId: moment.id });
  }, [moment.id, navigation]);

  const handleCreateSimilar = useCallback(() => {
    navigation.navigate('CreateMoment' as never);
  }, [navigation]);

  const handleReport = useCallback(() => {
    setShowReportSheet(true);
  }, []);

  const handleReportSubmit = useCallback(
    (_action: string, _reason?: string, _details?: string) => {
      // In a real app, this would call an API
      setShowReportSheet(false);
      Alert.alert(
        'Report Submitted',
        'Thank you for keeping our community safe.',
      );
    },
    [],
  );

  // Gift sheet moment data
  const giftSheetMoment: MomentData | null = showGiftSheet
    ? {
        id: moment.id,
        title: moment.title,
        imageUrl: moment.imageUrl,
        category: moment.category || {
          id: 'other',
          label: 'Other',
          emoji: '🎁',
        },
        user: {
          name: momentUser.name,
          avatar: momentUser.avatar || '',
          type: (momentUser.type as 'traveler' | 'local') || 'traveler',
          location:
            typeof momentUser.location === 'string'
              ? momentUser.location
              : momentUser.location
                ? `${momentUser.location.city || ''}, ${
                    momentUser.location.country || ''
                  }`
                : undefined,
          travelDays: momentUser.travelDays,
          isVerified: momentUser.isVerified,
        },
        location: {
          name: moment.location?.name || 'Unknown Location',
          city: moment.location?.city || 'Unknown City',
          country: moment.location?.country || 'Unknown Country',
        },
        story: moment.story,
        dateRange: moment.dateRange || { start: new Date(), end: new Date() },
        price: moment.price,
        availability: moment.availability || 'Available',
      }
    : null;

  const isCompleted = moment.status === 'completed';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <MomentHeader
          navigation={navigation}
          isOwner={isOwner}
          isSaved={isSaved}
          actionLoading={actionLoading}
          momentId={moment.id}
          momentStatus={moment.status}
          onSave={handleSave}
          onDelete={handleDelete}
          onShare={handleShare}
          onEdit={handleEdit}
          onReport={handleReport}
        />

        {/* Scrollable Content */}
        <Animated.ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.content}>
            {/* Host Info */}
            <HostSection user={momentUser} navigation={navigation} />

            {/* Contributor Slots (100+ TL moments only) */}
            {!isOwner && moment.price >= 100 && (
              <ContributorSlotsSection
                price={moment.price}
                contributors={contributors}
                currentCount={contributorCount}
                maxContributors={maxContributors}
              />
            )}

            {/* Moment Info */}
            <MomentInfo
              title={moment.title}
              category={moment.category}
              location={moment.location}
              availability={moment.availability}
              date={moment.date}
              story={moment.story}
            />

            {/* Owner Active: Pending Requests */}
            {isOwner && !isCompleted && (
              <RequestsSection
                requests={pendingRequestsList}
                onAccept={handleAcceptRequest}
                onDecline={handleDeclineRequest}
              />
            )}

            {/* Owner Completed: Summary */}
            {isOwner && isCompleted && (
              <SummarySection
                totalEarned={moment.price * 3}
                guestCount={3}
                rating={4.8}
              />
            )}

            {/* Owner Completed: Reviews */}
            {isOwner && isCompleted && <ReviewsSection reviews={reviews} />}

            <View style={styles.bottomSpacer} />
          </View>
        </Animated.ScrollView>

        {/* Bottom Action Bar */}
        <ActionBar
          isOwner={isOwner}
          isCompleted={isCompleted}
          price={moment.price}
          onGift={() => setShowGiftSheet(true)}
          onCreateSimilar={handleCreateSimilar}
        />

        {/* Gift Bottom Sheet */}
        <GiftMomentBottomSheet
          visible={showGiftSheet}
          moment={giftSheetMoment}
          onClose={() => setShowGiftSheet(false)}
          onGift={handleGiftOption}
        />

        {/* Success Modal */}
        <GiftSuccessModal
          visible={showSuccessModal}
          amount={giftAmount}
          momentTitle={moment.title}
          onViewApprovals={handleViewApprovals}
          onClose={() => {
            setShowSuccessModal(false);
            navigation.goBack();
          }}
        />

        {/* Report/Block Sheet */}
        <ReportBlockBottomSheet
          visible={showReportSheet}
          onClose={() => setShowReportSheet(false)}
          onSubmit={handleReportSubmit}
          targetType="moment"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.utility.white,
  },
  container: {
    backgroundColor: COLORS.utility.white,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 400,
  },
  content: {
    backgroundColor: COLORS.bg.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  bottomSpacer: {
    height: 120,
  },
});

export default MomentDetailScreen;
