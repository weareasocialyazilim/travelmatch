import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Animated, Alert, StyleSheet } from 'react-native';
import type { RouteProp, NavigationProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { GiftMomentBottomSheet } from '../components/GiftMomentBottomSheet';
import { GiftSuccessModal } from '../components/GiftSuccessModal';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { useScreenPerformance } from '../utils/performanceBenchmark';
import { useMoments } from '../hooks';

import {
  MomentHeader,
  MomentGallery,
  MomentInfo,
  HostSection,
  RequestsSection,
  ReviewsSection,
  SummarySection,
  ActionBar,
} from './moment-detail';
import type {
  MomentUser,
  PendingRequest,
  Review,
  ActionLoadingState,
} from './moment-detail';
import type { MomentData } from '../types';

type MomentDetailRouteProp = RouteProp<RootStackParamList, 'MomentDetail'>;

const HEADER_MAX_HEIGHT = 400;
const HEADER_MIN_HEIGHT = 200;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const MomentDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<MomentDetailRouteProp>();
  const {
    moment,
    isOwner = false,
    pendingRequests: _pendingRequests = 0,
  } = route.params;

  // Hooks
  const { saveMoment, deleteMoment } = useMoments();
  const { trackMount, trackInteraction } = useScreenPerformance('MomentDetail');

  // User data - coerce to MomentUser type
  const userSource = moment.user || moment.creator;
  const momentUser: MomentUser = {
    id: userSource?.id,
    name: userSource?.name || 'Anonymous',
    avatar:
      userSource?.avatar ||
      (userSource as { photoUrl?: string })?.photoUrl ||
      'https://via.placeholder.com/150',
    type: userSource?.type || 'traveler',
    isVerified: userSource?.isVerified || false,
    location: userSource?.location || 'Unknown',
    travelDays: userSource?.travelDays || 0,
  };

  // State
  const [showGiftSheet, setShowGiftSheet] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [giftAmount, setGiftAmount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [actionLoading, setActionLoading] = useState<ActionLoadingState>(null);

  const [pendingRequestsList, setPendingRequestsList] = useState<
    PendingRequest[]
  >([
    {
      id: '1',
      name: 'John Davidson',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      message: 'Would love to join!',
    },
    {
      id: '2',
      name: 'Sarah Miller',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      message: 'This looks amazing!',
    },
    {
      id: '3',
      name: 'Mike Roberts',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      message: 'Count me in!',
    },
  ]);

  const completedReviews: Review[] = [
    {
      id: '1',
      name: 'Emma Wilson',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      rating: 5,
      text: 'Amazing experience! Highly recommend.',
    },
    {
      id: '2',
      name: 'David Chen',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      rating: 4,
      text: 'Great host, wonderful time!',
    },
  ];

  // Animation
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8, 0.5],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false },
  );

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
      Alert.alert('Error', 'Could not save moment. Please try again.');
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
                Alert.alert('Deleted', 'Your moment has been deleted.');
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
  }, [deleteMoment, moment.id, navigation]);

  const handleAcceptRequest = useCallback((requestId: string) => {
    Alert.alert('Request Accepted', 'The guest has been notified!');
    setPendingRequestsList((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

  const handleDeclineRequest = useCallback((requestId: string) => {
    Alert.alert('Request Declined', 'The guest has been notified.');
    setPendingRequestsList((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

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
    });
  }, [moment.price, moment.title, navigation]);

  const handleEdit = useCallback(() => {
    navigation.navigate('EditMoment', { momentId: moment.id });
  }, [moment.id, navigation]);

  const handleShare = useCallback(() => {
    navigation.navigate('ShareMoment', { momentId: moment.id });
  }, [moment.id, navigation]);

  const handleCreateSimilar = useCallback(() => {
    navigation.navigate('CreateMoment' as never);
  }, [navigation]);

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
          avatar: momentUser.avatar || 'https://via.placeholder.com/150',
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
    <View style={styles.container}>
      {/* Hero Image */}
      <MomentGallery
        imageUrl={moment.imageUrl}
        headerHeight={headerHeight}
        imageOpacity={imageOpacity}
      />

      {/* Header */}
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
      />

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.content}>
          {/* Host Info */}
          <HostSection user={momentUser} navigation={navigation} />

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
          {isOwner && isCompleted && (
            <ReviewsSection reviews={completedReviews} />
          )}

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 400,
  },
  content: {
    backgroundColor: COLORS.background,
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
