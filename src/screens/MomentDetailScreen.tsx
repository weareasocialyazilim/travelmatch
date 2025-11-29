import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { GiftMomentBottomSheet } from '../components/GiftMomentBottomSheet';
import { GiftSuccessModal } from '../components/GiftSuccessModal';
import { COLORS } from '../constants/colors';
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

  // TODO: Animasyon davranışı test edilmeden kaldırılmamalı – görsel akışı korumak için mevcut haliyle bırakıldı.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
    },
  );

  const handleGiftOption = () => {
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
            <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
              <MaterialCommunityIcons
                name="share-variant-outline"
                size={24}
                color={COLORS.text}
              />
            </TouchableOpacity>
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
          <View style={styles.userSection}>
            <Image
              source={{ uri: moment.user.avatar }}
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{moment.user.name}</Text>
                {moment.user.isVerified && (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    color={COLORS.mint}
                  />
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
              <Text style={styles.infoText}>{moment.location.city}</Text>
            </View>
            <Text style={styles.separator}>•</Text>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color={COLORS.textSecondary}
              />
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

          <View style={styles.bottomSpacer} />
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
        moment={
          showGiftSheet
            ? {
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
                  end: new Date(),
                },
                price: moment.price,
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
});

export default MomentDetailScreen;
