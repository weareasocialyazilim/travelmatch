import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { GiftMomentBottomSheet } from '../components/GiftMomentBottomSheet';
import { GiftSuccessModal } from '../components/GiftSuccessModal';
import { COLORS, CARD_SHADOW } from '../constants/colors';
import { VALUES } from '../constants/values';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type MomentDetailRouteProp = RouteProp<RootStackParamList, 'MomentDetail'>;

const MomentDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<MomentDetailRouteProp>();
  const { moment } = route.params;

  const [showGiftSheet, setShowGiftSheet] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [giftAmount, setGiftAmount] = useState(0);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleScroll = useCallback(
    Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: false }
    ),
    [scrollY]
  );

  const handleGiftOption = (paymentMethod: 'apple-pay' | 'google-pay' | 'card') => {
    setShowGiftSheet(false);
    setGiftAmount(moment.price);
    
    setTimeout(() => {
      setShowSuccessModal(true);
    }, VALUES.ANIMATION_DURATION);
  };

  const handleViewApprovals = () => {
    setShowSuccessModal(false);
    navigation.navigate('ReceiverApprovalV2', {
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
      <Animated.View style={[styles.heroImageContainer, { height: headerHeight }]}>
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
              <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.shareButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="share-variant-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <Animated.ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={{ paddingTop: 400 }}
      >
          {/* Content */}
          <View style={styles.content}>
            {/* User Info */}
            <View style={styles.userSection}>
              <Image 
                source={{ uri: moment.user.avatar }} 
                style={styles.userAvatar}
              />
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{moment.user.name}</Text>
                  {moment.user.isVerified && (
                    <MaterialCommunityIcons name="check-decagram" size={16} color={COLORS.mint} />
                  )}
                </View>
              </View>
              <Text style={styles.userRole}>
                {moment.user.type === 'traveler' ? '✈️' : '📍'}
              </Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{moment.title}</Text>

            {/* Meta Info */}
            <View style={styles.infoRow}>
              {moment.category && (
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryEmoji}>{moment.category.emoji}</Text>
                  <Text style={styles.categoryName}>{moment.category.label}</Text>
                </View>
              )}
              <Text style={styles.separator}>•</Text>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{moment.location.city}</Text>
              </View>
              <Text style={styles.separator}>•</Text>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{moment.availability}</Text>
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
                  <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.mint} />
                </View>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{moment.location.name}</Text>
                  <Text style={styles.placeAddress}>{moment.location.city}, {moment.location.country}</Text>
                </View>
              </View>
            </View>

            <View style={{ height: 120 }} />
          </View>
        </Animated.ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => setShowGiftSheet(true)}
          >
            <Text style={styles.buttonText}>Gift this moment</Text>
            <View style={styles.buttonBadge}>
              <Text style={styles.badgeText}>${moment.price}</Text>
            </View>
          </TouchableOpacity>
        </View>

      {/* Gift Bottom Sheet */}
      <GiftMomentBottomSheet
        visible={showGiftSheet}
        moment={showGiftSheet ? {
          id: moment.id,
          title: moment.title,
          imageUrl: moment.imageUrl,
          category: moment.category,
          user: {
            name: moment.user.name,
            avatar: moment.user.avatar,
            type: moment.user.type,
            location: moment.user.location,
            travelDays: moment.user.travelDays,
            isVerified: moment.user.isVerified,
          },
          location: {
            name: moment.location.name,
            city: moment.location.city,
            country: moment.location.country,
          },
          story: moment.story,
          dateRange: moment.dateRange || {
            start: new Date(),
            end: new Date()
          },
          price: moment.price
        } : null}
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
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  scrollView: {
    flex: 1,
  },
  heroImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  content: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  userRole: {
    fontSize: 16,
  },
  userLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  userBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  userBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 34,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 13,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  separator: {
    fontSize: 14,
    color: COLORS.textSecondary,
    opacity: 0.5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
    marginBottom: 16,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  placeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(166, 229, 193, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  placeAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    marginBottom: 24,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  storySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  locationSection: {
    marginBottom: 24,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    gap: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.mint,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  buttonBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
});

export default MomentDetailScreen;
