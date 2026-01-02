/**
 * PassportBook Component
 *
 * Gamified digital passport for KYC/verification process.
 * Each verification is a visa stamp with 3D page flip animation.
 *
 * @example
 * ```tsx
 * <PassportBook
 *   user={{ name: 'John', photoUrl: '...', joinDate: new Date() }}
 *   stamps={user.verificationStamps}
 *   experiences={user.completedExperiences}
 *   onStampPress={handleStampDetail}
 *   newStampId="bank" // Triggers stamp animation
 * />
 * ```
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  CEREMONY_COLORS,
  CEREMONY_TIMING,
  CEREMONY_SIZES,
  CEREMONY_A11Y,
  STAMP_LABELS,
  type PassportStamp,
} from '@/constants/ceremony';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

type PageType = 'cover' | 'photo' | 'stamps' | 'history';

interface Experience {
  id: string;
  title: string;
  date: Date;
  location: string;
}

interface PassportBookProps {
  /** User information */
  user: {
    name: string;
    photoUrl?: string;
    joinDate: Date;
  };
  /** Verification stamps */
  stamps: PassportStamp[];
  /** Completed experiences for history page */
  experiences?: Experience[];
  /** Starting page */
  initialPage?: number;
  /** Page change callback */
  onPageChange?: (page: number) => void;
  /** Stamp press callback */
  onStampPress?: (stamp: PassportStamp) => void;
  /** New stamp ID for animation */
  newStampId?: string;
  /** Test ID */
  testID?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PASSPORT_WIDTH = Math.min(
  CEREMONY_SIZES.passport.width,
  SCREEN_WIDTH - 40,
);
const PASSPORT_HEIGHT = PASSPORT_WIDTH * 1.4;

const PAGES: PageType[] = ['cover', 'photo', 'stamps', 'history'];

export const PassportBook: React.FC<PassportBookProps> = ({
  user,
  stamps,
  experiences = [],
  initialPage = 0,
  onPageChange,
  onStampPress,
  newStampId,
  testID,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const flipProgress = useSharedValue(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleFlipPage = useCallback(
    (direction: 'next' | 'prev') => {
      if (isFlipping) return;

      const newPage =
        direction === 'next'
          ? Math.min(currentPage + 1, PAGES.length - 1)
          : Math.max(currentPage - 1, 0);

      if (newPage === currentPage) return;

      setIsFlipping(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      flipProgress.value = withTiming(
        direction === 'next' ? 1 : -1,
        {
          duration: CEREMONY_TIMING.passportFlip,
          easing: Easing.inOut(Easing.ease),
        },
        (finished) => {
          if (finished) {
            runOnJS(setCurrentPage)(newPage);
            runOnJS(onPageChange || (() => {}))(newPage);
            flipProgress.value = 0;
            runOnJS(setIsFlipping)(false);
          }
        },
      );
    },
    [currentPage, isFlipping, onPageChange],
  );

  // Animated styles for 3D flip effect
  const frontPageStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      {
        rotateY: `${interpolate(flipProgress.value, [-1, 0, 1], [0, 0, -180])}deg`,
      },
    ],
    backfaceVisibility: 'hidden',
    zIndex: flipProgress.value > 0 ? 0 : 1,
  }));

  const backPageStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      {
        rotateY: `${interpolate(flipProgress.value, [-1, 0, 1], [-180, 180, 0])}deg`,
      },
    ],
    backfaceVisibility: 'hidden',
    position: 'absolute',
    zIndex: flipProgress.value > 0 ? 1 : 0,
  }));

  const renderPage = (pageType: PageType, _isBack = false) => {
    switch (pageType) {
      case 'cover':
        return <CoverPage userName={user.name} />;
      case 'photo':
        return (
          <PhotoPage
            user={user}
            verifiedCount={stamps.filter((s) => s.verified).length}
          />
        );
      case 'stamps':
        return (
          <StampsPage
            stamps={stamps}
            onStampPress={onStampPress}
            newStampId={newStampId}
          />
        );
      case 'history':
        return <HistoryPage experiences={experiences} />;
      default:
        return null;
    }
  };

  const nextPageType = PAGES[Math.min(currentPage + 1, PAGES.length - 1)];
  const prevPageType = PAGES[Math.max(currentPage - 1, 0)];

  return (
    <View
      style={styles.container}
      testID={testID}
      accessible
      accessibilityLabel={CEREMONY_A11Y.labels.passport}
    >
      {/* Passport book */}
      <View style={styles.passportContainer}>
        {/* Binding edge */}
        <View style={styles.binding} />

        {/* Current page (front) */}
        <Animated.View
          style={[
            styles.page,
            { width: PASSPORT_WIDTH, height: PASSPORT_HEIGHT },
            frontPageStyle,
          ]}
        >
          {renderPage(PAGES[currentPage])}
        </Animated.View>

        {/* Next/Prev page (back) */}
        <Animated.View
          style={[
            styles.page,
            { width: PASSPORT_WIDTH, height: PASSPORT_HEIGHT },
            backPageStyle,
          ]}
        >
          {renderPage(
            flipProgress.value > 0 ? nextPageType : prevPageType,
            true,
          )}
        </Animated.View>
      </View>

      {/* Navigation dots */}
      <View style={styles.pagination}>
        {PAGES.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentPage === index && styles.dotActive]}
          />
        ))}
      </View>

      {/* Navigation buttons */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentPage === 0 && styles.navButtonDisabled,
          ]}
          onPress={() => handleFlipPage('prev')}
          disabled={currentPage === 0 || isFlipping}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={currentPage === 0 ? COLORS.textMuted : COLORS.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>
          {currentPage + 1} / {PAGES.length}
        </Text>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentPage === PAGES.length - 1 && styles.navButtonDisabled,
          ]}
          onPress={() => handleFlipPage('next')}
          disabled={currentPage === PAGES.length - 1 || isFlipping}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={
              currentPage === PAGES.length - 1
                ? COLORS.textMuted
                : COLORS.textPrimary
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Cover Page Component
const CoverPage: React.FC<{ userName: string }> = ({ userName }) => (
  <LinearGradient
    colors={[CEREMONY_COLORS.passport.cover, '#0F172A']}
    style={styles.coverPage}
  >
    <View style={styles.coverDecoration}>
      <View style={styles.coverLine} />
      <View style={styles.coverLine} />
    </View>

    <Text style={styles.coverTitle}>TRAVELMATCH</Text>
    <View style={styles.coverDivider} />

    <View style={styles.globeContainer}>
      <MaterialCommunityIcons name="earth" size={80} color="#3B82F6" />
    </View>

    <Text style={styles.coverSubtitle}>PASSPORT</Text>
    <Text style={styles.coverName}>{userName}</Text>

    <View style={styles.coverFooter}>
      <MaterialCommunityIcons name="shield-check" size={16} color="#60A5FA" />
      <Text style={styles.coverFooterText}>Verified Traveler</Text>
    </View>
  </LinearGradient>
);

// Photo/Identity Page Component
const PhotoPage: React.FC<{
  user: { name: string; photoUrl?: string; joinDate: Date };
  verifiedCount: number;
}> = ({ user, verifiedCount }) => (
  <View style={styles.photoPage}>
    <View style={styles.photoPageHeader}>
      <Text style={styles.pageTitle}>IDENTITY</Text>
      <MaterialCommunityIcons
        name="account-check"
        size={20}
        color={CEREMONY_COLORS.passport.stamp.id}
      />
    </View>

    <View style={styles.photoSection}>
      <View style={styles.photoFrame}>
        {user.photoUrl ? (
          <Image source={{ uri: user.photoUrl }} style={styles.userPhoto} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <MaterialCommunityIcons
              name="account"
              size={40}
              color={COLORS.textMuted}
            />
          </View>
        )}
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.infoLabel}>AD SOYAD</Text>
        <Text style={styles.infoValue}>{user.name}</Text>

        <Text style={styles.infoLabel}>ÜYELİK TARİHİ</Text>
        <Text style={styles.infoValue}>
          {user.joinDate.toLocaleDateString('tr-TR')}
        </Text>

        <Text style={styles.infoLabel}>GÜVEN SEVİYESİ</Text>
        <View style={styles.trustStars}>
          {[...Array(4)].map((_, i) => (
            <MaterialCommunityIcons
              key={i}
              name={i < verifiedCount ? 'star' : 'star-outline'}
              size={16}
              color={COLORS.trustGold}
            />
          ))}
        </View>
      </View>
    </View>

    <View style={styles.pageLines}>
      {[...Array(5)].map((_, i) => (
        <View key={i} style={styles.pageLine} />
      ))}
    </View>
  </View>
);

// Stamps Page Component
const StampsPage: React.FC<{
  stamps: PassportStamp[];
  onStampPress?: (stamp: PassportStamp) => void;
  newStampId?: string;
}> = ({ stamps, onStampPress, newStampId }) => (
  <View style={styles.stampsPage}>
    <View style={styles.photoPageHeader}>
      <Text style={styles.pageTitle}>VERIFICATION STAMPS</Text>
    </View>

    <View style={styles.stampsGrid}>
      {stamps.map((stamp) => (
        <StampComponent
          key={stamp.id}
          stamp={stamp}
          onPress={() => onStampPress?.(stamp)}
          isNew={stamp.id === newStampId}
        />
      ))}
    </View>

    <View style={styles.pageLines}>
      {[...Array(3)].map((_, i) => (
        <View key={i} style={styles.pageLine} />
      ))}
    </View>
  </View>
);

// Individual Stamp Component
const StampComponent: React.FC<{
  stamp: PassportStamp;
  onPress: () => void;
  isNew?: boolean;
}> = ({ stamp, onPress, isNew }) => {
  const stampScale = useSharedValue(isNew ? 0 : 1);
  const stampRotation = useSharedValue(isNew ? -15 : 0);

  useEffect(() => {
    if (isNew && stamp.verified) {
      // Stamp press animation
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      stampScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(
          300,
          withSpring(1, {
            damping: 8,
            stiffness: 100,
          }),
        ),
      );

      stampRotation.value = withSequence(
        withTiming(-15, { duration: 0 }),
        withDelay(300, withSpring(0, { damping: 10 })),
      );
    }
  }, [isNew, stamp.verified]);

  const stampAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: stampScale.value },
      { rotate: `${stampRotation.value}deg` },
    ],
    opacity: interpolate(stampScale.value, [0, 0.5, 1], [0, 0.8, 1]),
  }));

  const stampColor = CEREMONY_COLORS.passport.stamp[stamp.type];
  const stampLabel = STAMP_LABELS[stamp.type];

  const getStampIcon = (type: PassportStamp['type']) => {
    switch (type) {
      case 'email':
        return 'email-check';
      case 'phone':
        return 'phone-check';
      case 'id':
        return 'card-account-details';
      case 'bank':
        return 'bank-check';
      default:
        return 'check';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.stamp,
          stamp.verified
            ? { borderColor: stampColor }
            : styles.stampUnverified,
          stampAnimatedStyle,
        ]}
      >
        {stamp.verified ? (
          <>
            <MaterialCommunityIcons
              name={getStampIcon(stamp.type)}
              size={24}
              color={stampColor}
            />
            <Text style={[styles.stampText, { color: stampColor }]}>
              {stampLabel}
            </Text>
            {stamp.verifiedAt && (
              <Text style={styles.stampDate}>
                {stamp.verifiedAt.toLocaleDateString('tr-TR', {
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            )}
          </>
        ) : (
          <>
            <MaterialCommunityIcons
              name={getStampIcon(stamp.type)}
              size={24}
              color={COLORS.textMuted}
            />
            <Text style={styles.stampTextPending}>Bekliyor</Text>
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// History Page Component
const HistoryPage: React.FC<{ experiences: Experience[] }> = ({
  experiences,
}) => (
  <View style={styles.historyPage}>
    <View style={styles.photoPageHeader}>
      <Text style={styles.pageTitle}>TRAVEL HISTORY</Text>
      <MaterialCommunityIcons
        name="map-marker-path"
        size={20}
        color={COLORS.accent}
      />
    </View>

    {experiences.length > 0 ? (
      <View style={styles.experiencesList}>
        {experiences.slice(0, 4).map((exp) => (
          <View key={exp.id} style={styles.experienceItem}>
            <MaterialCommunityIcons
              name="airplane"
              size={16}
              color={COLORS.accent}
            />
            <View style={styles.experienceInfo}>
              <Text style={styles.experienceTitle}>{exp.title}</Text>
              <Text style={styles.experienceDetails}>
                {exp.location} • {exp.date.toLocaleDateString('tr-TR')}
              </Text>
            </View>
          </View>
        ))}
      </View>
    ) : (
      <View style={styles.emptyHistory}>
        <MaterialCommunityIcons
          name="compass-outline"
          size={48}
          color={COLORS.textMuted}
        />
        <Text style={styles.emptyText}>Henüz deneyim yok</Text>
        <Text style={styles.emptySubtext}>
          İlk hediyeni al ve maceraya başla!
        </Text>
      </View>
    )}

    <View style={styles.pageLines}>
      {[...Array(3)].map((_, i) => (
        <View key={i} style={styles.pageLine} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  passportContainer: {
    flexDirection: 'row',
  },
  binding: {
    width: 12,
    backgroundColor: CEREMONY_COLORS.passport.binding,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  page: {
    backgroundColor: CEREMONY_COLORS.passport.pages,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  pagination: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.borderDefault,
  },
  dotActive: {
    backgroundColor: CEREMONY_COLORS.passport.coverGold,
    width: 24,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.lg,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  pageIndicator: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Cover page
  coverPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  coverDecoration: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  coverLine: {
    height: 2,
    backgroundColor: CEREMONY_COLORS.passport.coverAccent,
    marginBottom: 4,
    opacity: 0.3,
  },
  coverTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textInverse,
    letterSpacing: 4,
  },
  coverDivider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.trustGold,
    marginVertical: SPACING.md,
  },
  globeContainer: {
    marginVertical: SPACING.lg,
  },
  coverSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textInverse,
    letterSpacing: 6,
    marginTop: SPACING.md,
  },
  coverName: {
    fontSize: 14,
    color: '#93C5FD',
    marginTop: SPACING.md,
    fontWeight: '500',
  },
  coverFooter: {
    position: 'absolute',
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  coverFooterText: {
    fontSize: 10,
    color: '#60A5FA',
    fontWeight: '500',
  },

  // Photo page
  photoPage: {
    flex: 1,
    padding: SPACING.md,
  },
  photoPageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: CEREMONY_COLORS.passport.pageLines,
  },
  pageTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  photoSection: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  photoFrame: {
    width: 80,
    height: 100,
    borderWidth: 2,
    borderColor: COLORS.borderDefault,
    borderRadius: 4,
    overflow: 'hidden',
  },
  userPhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceMuted,
  },
  userInfo: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: SPACING.xs,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  trustStars: {
    flexDirection: 'row',
    marginTop: 2,
  },
  pageLines: {
    marginTop: 'auto',
    paddingTop: SPACING.md,
  },
  pageLine: {
    height: 1,
    backgroundColor: CEREMONY_COLORS.passport.pageLines,
    marginVertical: 6,
  },

  // Stamps page
  stampsPage: {
    flex: 1,
    padding: SPACING.md,
  },
  stampsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  stamp: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  stampUnverified: {
    borderColor: COLORS.borderDefault,
    opacity: 0.4,
  },
  stampText: {
    fontSize: 7,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  stampTextPending: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  stampDate: {
    fontSize: 7,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // History page
  historyPage: {
    flex: 1,
    padding: SPACING.md,
  },
  experiencesList: {
    gap: SPACING.sm,
  },
  experienceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
  experienceInfo: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  experienceDetails: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  emptyHistory: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  emptySubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
    textAlign: 'center',
  },
});

export default PassportBook;
