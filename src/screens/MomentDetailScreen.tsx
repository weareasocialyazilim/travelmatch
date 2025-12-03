import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { RouteProp, NavigationProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { GiftMomentBottomSheet } from '../components/GiftMomentBottomSheet';
import { GiftSuccessModal } from '../components/GiftSuccessModal';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { useScreenPerformance } from '../utils/performanceBenchmark';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type MomentDetailRouteProp = RouteProp<RootStackParamList, 'MomentDetail'>;

const MomentDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<MomentDetailRouteProp>();
  const { moment, isOwner = false, pendingRequests = 0 } = route.params;

  // Safe access to user data - handle both 'user' and 'creator' properties
  const momentUser = moment.user || moment.creator || {
    name: 'Anonymous',
    avatar: 'https://via.placeholder.com/150',
    type: 'traveler',
    isVerified: false,
    location: 'Unknown',
    travelDays: 0,
  };

  const [showGiftSheet, setShowGiftSheet] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [giftAmount, setGiftAmount] = useState(0);

  // Mock data for pending requests (owner view)
  const [pendingRequestsList, setPendingRequestsList] = useState([
    { id: '1', name: 'John Davidson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', message: 'Would love to join!' },
    { id: '2', name: 'Sarah Miller', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', message: 'This looks amazing!' },
    { id: '3', name: 'Mike Roberts', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', message: 'Count me in!' },
  ]);

  // Mock data for reviews (completed view)
  const completedReviews = [
    { id: '1', name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', rating: 5, text: 'Amazing experience! Highly recommend.' },
    { id: '2', name: 'David Chen', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', rating: 4, text: 'Great host, wonderful time!' },
  ];

  const handleAcceptRequest = (requestId: string) => {
    Alert.alert('Request Accepted', 'The guest has been notified!');
    setPendingRequestsList(prev => prev.filter(r => r.id !== requestId));
  };

  const handleDeclineRequest = (requestId: string) => {
    Alert.alert('Request Declined', 'The guest has been notified.');
    setPendingRequestsList(prev => prev.filter(r => r.id !== requestId));
  };

  const scrollY = useRef(new Animated.Value(0)).current;

  // Performance tracking
  const { trackMount, trackInteraction } = useScreenPerformance('MomentDetail');

  useEffect(() => {
    trackMount();
  }, []);

  // TODO: Animasyon davranışı test edilmeden kaldırılmamalı – görsel akışı korumak için mevcut haliyle bırakıldı.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
    },
  );

  const handleGiftOption = () => {
    trackInteraction('gift_selected');
    setShowGiftSheet(false);
    setGiftAmount(moment.price);

    setTimeout(() => {
      setShowSuccessModal(true);
    }, VALUES.ANIMATION_DURATION);
  };

  const handleViewApprovals = () => {
    setShowSuccessModal(false);
    navigation.navigate('ReceiverApproval', {
      momentTitle: moment.title,
      totalAmount: moment.price,
    });
  };

  const HEADER_MAX_HEIGHT = 400;
  const HEADER_MIN_HEIGHT = 200;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

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

  return (
    <View style={styles.container}>
      {/* Animated Hero Image */}
      <Animated.View
        style={[styles.heroImageContainer, { height: headerHeight }]}
      >
        <Animated.Image
          source={{ uri: moment.imageUrl }}
          style={[styles.heroImage, { opacity: imageOpacity }]}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Header Overlay */}
      <View style={styles.headerOverlay}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={COLORS.text}
              />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              {isOwner && moment.status !== 'completed' && (
                <TouchableOpacity 
                  style={styles.headerIconButton} 
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('EditMoment', { momentId: moment.id })}
                >
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={22}
                    color={COLORS.text}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.headerIconButton} 
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ShareMoment', { momentId: moment.id })}
              >
                <MaterialCommunityIcons
                  name="share-variant-outline"
                  size={22}
                  color={COLORS.text}
                />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Content */}
        <View style={styles.content}>
          {/* User Info */}
          <TouchableOpacity 
            style={styles.userSection}
            onPress={() => navigation.navigate('ProfileDetail', { userId: moment.user?.id || moment.creator?.id || 'unknown' })}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: momentUser.avatar }}
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{momentUser.name}</Text>
                {momentUser.isVerified && (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    color={COLORS.mint}
                  />
                )}
              </View>
              <Text style={styles.viewProfileHint}>Tap to view profile</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>{moment.title}</Text>

          {/* Meta Info */}
          <View style={styles.infoRow}>
            {moment.category && (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryEmoji}>
                  {moment.category.emoji}
                </Text>
                <Text style={styles.categoryName}>{moment.category.label}</Text>
              </View>
            )}
            <Text style={styles.separator}>•</Text>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color={COLORS.textSecondary}
              />
              <Text style={styles.infoText}>
                {moment.location?.city || moment.location?.name || 'Location'}
              </Text>
            </View>
            <Text style={styles.separator}>•</Text>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color={COLORS.textSecondary}
              />
              <Text style={styles.infoText}>
                {moment.availability || moment.date || 'Flexible'}
              </Text>
            </View>
          </View>

          {/* About Section */}
          {moment.story && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>About this moment</Text>
              <Text style={styles.sectionBody}>{moment.story}</Text>
            </View>
          )}

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Location</Text>
            <View style={styles.placeCard}>
              <View style={styles.placeIcon}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={20}
                  color={COLORS.mint}
                />
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{moment.location.name}</Text>
                <Text style={styles.placeAddress}>
                  {moment.location.city}, {moment.location.country}
                </Text>
              </View>
            </View>
          </View>

          {/* Owner Active: Pending Requests Section */}
          {isOwner && moment.status !== 'completed' && pendingRequestsList.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Pending Requests ({pendingRequestsList.length})</Text>
              {pendingRequestsList.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <Image source={{ uri: request.avatar }} style={styles.requestAvatar} />
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestName}>{request.name}</Text>
                    <Text style={styles.requestMessage} numberOfLines={1}>{request.message}</Text>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptRequest(request.id)}
                    >
                      <MaterialCommunityIcons name="check" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={() => handleDeclineRequest(request.id)}
                    >
                      <MaterialCommunityIcons name="close" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Owner Active: No Requests */}
          {isOwner && moment.status !== 'completed' && pendingRequestsList.length === 0 && (
            <View style={styles.section}>
              <View style={styles.emptyRequestsCard}>
                <MaterialCommunityIcons name="account-clock-outline" size={40} color={COLORS.textSecondary} />
                <Text style={styles.emptyRequestsText}>No pending requests yet</Text>
                <Text style={styles.emptyRequestsSubtext}>Share your moment to get more visibility</Text>
              </View>
            </View>
          )}

          {/* Owner Completed: Summary Section */}
          {isOwner && moment.status === 'completed' && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Summary</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <MaterialCommunityIcons name="cash" size={24} color={COLORS.mint} />
                  <Text style={styles.summaryValue}>${moment.price * 3}</Text>
                  <Text style={styles.summaryLabel}>Total Earned</Text>
                </View>
                <View style={styles.summaryCard}>
                  <MaterialCommunityIcons name="account-group" size={24} color={COLORS.mint} />
                  <Text style={styles.summaryValue}>3</Text>
                  <Text style={styles.summaryLabel}>Guests</Text>
                </View>
                <View style={styles.summaryCard}>
                  <MaterialCommunityIcons name="star" size={24} color={COLORS.warning} />
                  <Text style={styles.summaryValue}>4.8</Text>
                  <Text style={styles.summaryLabel}>Rating</Text>
                </View>
              </View>
            </View>
          )}

          {/* Owner Completed: Reviews Section */}
          {isOwner && moment.status === 'completed' && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Reviews</Text>
              {completedReviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
                    <View style={styles.reviewInfo}>
                      <Text style={styles.reviewName}>{review.name}</Text>
                      <View style={styles.reviewStars}>
                        {[...Array(5)].map((_, i) => (
                          <MaterialCommunityIcons
                            key={i}
                            name="star"
                            size={14}
                            color={i < review.rating ? COLORS.warning : COLORS.border}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{review.text}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Action Bar - Only for guests or completed owner */}
      {(!isOwner || moment.status === 'completed') && (
        <View style={styles.bottomBar}>
          {isOwner && moment.status === 'completed' ? (
            // Completed owner - Create Similar button
            <TouchableOpacity
              style={styles.createSimilarButton}
              onPress={() => navigation.navigate('CreateMoment' as never)}
            >
              <MaterialCommunityIcons name="plus" size={20} color={COLORS.white} />
              <Text style={styles.createSimilarText}>Create Similar Moment</Text>
            </TouchableOpacity>
          ) : (
            // Guest view - gift the moment
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowGiftSheet(true)}
            >
              <Text style={styles.buttonText}>Gift this moment</Text>
              <View style={styles.buttonBadge}>
                <Text style={styles.badgeText}>${moment.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Gift Bottom Sheet */}
      <GiftMomentBottomSheet
        visible={showGiftSheet}
        moment={
          showGiftSheet
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
                  avatar: momentUser.avatar,
                  type: momentUser.type,
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
                  name: moment.location.name,
                  city: moment.location.city,
                  country: moment.location.country,
                },
                story: moment.story,
                dateRange: moment.dateRange || {
                  start: new Date(),
                  end: new Date(),
                },
                price: moment.price,
                availability: moment.availability || 'Available',
              }
            : null
        }
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
  backButton: {
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparentLight,
    borderColor: COLORS.whiteTransparentLight,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  bottomBar: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  bottomSpacer: {
    height: 120,
  },
  buttonBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  categoryEmoji: {
    fontSize: 13,
  },
  categoryName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryPill: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  content: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerOverlay: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 100,
  },
  heroImage: {
    height: '100%',
    width: SCREEN_WIDTH,
  },
  heroImageContainer: {
    backgroundColor: COLORS.background,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  infoItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  placeAddress: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  placeCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  placeIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.mintTransparent,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  // Owner view styles
  ownerButtonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.mint,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  editButtonText: {
    color: COLORS.mint,
    fontSize: 15,
    fontWeight: '600',
  },
  manageRequestsButton: {
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  requestsBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 6,
  },
  requestsBadgeText: {
    color: COLORS.mint,
    fontSize: 12,
    fontWeight: '700',
  },
  earningsContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.mintTransparent,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  earningsLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  earningsAmount: {
    color: COLORS.mint,
    fontSize: 20,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.mint,
    borderRadius: 12,
    borderWidth: 1.5,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: COLORS.mint,
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 400,
  },
  section: {
    marginBottom: 24,
  },
  sectionBody: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionHeader: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  separator: {
    color: COLORS.textSecondary,
    fontSize: 14,
    opacity: 0.5,
  },
  shareButton: {
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparentLight,
    borderColor: COLORS.whiteTransparentLight,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  // New styles for header with multiple icons
  headerRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparentLight,
    borderColor: COLORS.whiteTransparentLight,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  // Pending Requests styles
  requestCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 12,
  },
  requestAvatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  requestName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  requestMessage: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  requestActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  declineButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.error,
    borderRadius: 18,
    borderWidth: 1.5,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  emptyRequestsCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  emptyRequestsText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyRequestsSubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  // Summary styles (completed)
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  // Review styles
  reviewCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  reviewAvatar: {
    borderRadius: 18,
    height: 36,
    width: 36,
  },
  reviewInfo: {
    marginLeft: 10,
  },
  reviewName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  reviewText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  // Create Similar button
  createSimilarButton: {
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  createSimilarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
    marginBottom: 16,
  },
  userAvatar: {
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  userNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
  },
  userSection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  viewProfileHint: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});

export default MomentDetailScreen;
