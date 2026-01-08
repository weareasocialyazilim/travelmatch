/**
 * TravelMatch Onboarding Screen
 *
 * Immersive image-based onboarding with:
 * - Full-screen background images
 * - Smooth gradient overlays
 * - Horizontal swipe navigation
 *
 * Also includes AwwwardsOnboardingScreen variant:
 * - "İlk Etki" - First impression with Liquid spirit
 * - Dynamic neon glow ball following scroll
 * - Animated pagination dots with scale/opacity
 * - TYPOGRAPHY_SYSTEM integration
 * - Turkish labels following "Cinematic Trust Jewelry" aesthetic
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  ImageBackground,
  Animated as RNAnimated,
  TouchableOpacity,
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { StackScreenProps } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY_SYSTEM } from '@/constants/typography';
import { TMButton } from '@/components/ui/TMButton';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useOnboarding } from '@/hooks/useOnboarding';
import { logger } from '../../../utils/logger';
import type { RootStackParamList } from '@/navigation/routeParams';

const { width, height } = Dimensions.get('window');

// ============================================
// SLIDE DATA
// ============================================
const SLIDES = [
  {
    id: '1',
    image:
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200',
    title: 'Discover Local Vibes',
    desc: 'Find exclusive moments curated by locals. From hidden bars to sunset dinners.',
  },
  {
    id: '2',
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200',
    title: 'Connect & Experience',
    desc: "Don't just travel. Meet people who share your taste and gift them a moment.",
  },
  {
    id: '3',
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1200',
    title: 'Secure & Cashless',
    desc: 'Pay safely via the app. No cash, no awkward moments. Just pure vibes.',
  },
];

// ============================================
// TYPES
// ============================================
type OnboardingScreenProps = StackScreenProps<RootStackParamList, 'Onboarding'>;

// ============================================
// MAIN COMPONENT
// ============================================
export const OnboardingScreen: React.FC<Partial<OnboardingScreenProps>> = ({
  navigation: navProp,
}) => {
  const defaultNavigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();
  const navigation = navProp || defaultNavigation;
  const [activeIndex, setActiveIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const analytics = useAnalytics();
  const { completeOnboarding } = useOnboarding();

  // Swipe gesture handler for navigating between slides
  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (direction === 'left' && activeIndex < SLIDES.length - 1) {
        // Swipe left = next slide
        setActiveIndex(activeIndex + 1);
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (_e) {
          // ignore haptics error
        }
      } else if (direction === 'right' && activeIndex > 0) {
        // Swipe right = previous slide
        setActiveIndex(activeIndex - 1);
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (_e) {
          // ignore haptics error
        }
      }
    },
    [activeIndex],
  );

  // PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        // Only respond to horizontal swipes
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 10
        );
      },
      onPanResponderRelease: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        const SWIPE_THRESHOLD = 50;
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          handleSwipe('left');
        } else if (gestureState.dx > SWIPE_THRESHOLD) {
          handleSwipe('right');
        }
      },
    }),
  ).current;

  const handleNext = useCallback(async () => {
    logger.debug('OnboardingScreen handleNext called', {
      activeIndex,
      totalSlides: SLIDES.length,
    });

    // Haptics - wrap in try/catch to prevent crashes
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (hapticError) {
      // Haptics may fail on simulator, ignore
      logger.debug('Haptics failed (expected on simulator)', {
        error: hapticError,
      });
    }

    if (activeIndex < SLIDES.length - 1) {
      const nextIndex = activeIndex + 1;
      logger.debug('OnboardingScreen moving to next slide', { nextIndex });

      // Update state to show next slide
      setActiveIndex(nextIndex);

      analytics.trackEvent('onboarding_page_view', {
        screen: 'onboarding',
        page_number: nextIndex + 1,
        page_id: SLIDES[nextIndex].id,
      });
    } else {
      logger.info(
        'OnboardingScreen completing onboarding and navigating to MainTabs',
      );
      analytics.trackEvent('onboarding_completed', {
        screen: 'onboarding',
        total_screens: SLIDES.length,
      });

      try {
        await completeOnboarding();
        logger.info(
          'OnboardingScreen completeOnboarding success, navigating...',
        );
        // Guest Mode: Go directly to MainTabs so users can browse
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } catch (error) {
        logger.error('Onboarding completion error, navigating anyway', {
          error,
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    }
  }, [activeIndex, navigation, analytics, completeOnboarding]);

  const _renderItem = ({ item }: { item: (typeof SLIDES)[0] }) => (
    <View style={styles.slide}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="cover"
      >
        {/* Lighter gradient for better image visibility */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
          locations={[0.3, 0.6, 1]}
          style={styles.gradient}
        />
      </ImageBackground>
    </View>
  );

  const currentSlide = SLIDES[activeIndex];

  // Debug: Log when component renders
  logger.info('🎬 OnboardingScreen RENDER', {
    activeIndex,
    currentSlide: currentSlide.title,
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Background Image - with fallback color */}
      <View style={[StyleSheet.absoluteFillObject, styles.backgroundFallback]}>
        <ImageBackground
          source={{ uri: currentSlide.image }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
          onLoad={() => logger.info('🖼️ Image loaded', { id: currentSlide.id })}
          onError={(e) =>
            logger.error('🖼️ Image error', { error: e.nativeEvent })
          }
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
            locations={[0.3, 0.6, 1]}
            style={StyleSheet.absoluteFillObject}
          />
        </ImageBackground>
      </View>

      {/* Content overlay - full screen touchable area */}
      <View
        style={[styles.contentContainer, { paddingBottom: insets.bottom + 30 }]}
      >
        {/* Spacer to push content down */}
        <View style={styles.spacer} />

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.desc}>{currentSlide.desc}</Text>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          {/* Paginator */}
          <View style={styles.paginator}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, activeIndex === index && styles.activeDot]}
              />
            ))}
          </View>

          {/* Next Button - Simple Pressable with direct onPress */}
          <Pressable
            onPress={() => {
              logger.info('🔘 BUTTON PRESSED!', { activeIndex });
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch (_e) {
                // ignore haptics error
              }
              handleNext();
            }}
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextButtonPressed,
            ]}
          >
            <LinearGradient
              colors={[COLORS.brand.primary, '#A2FF00']}
              style={styles.nextButtonGradient}
            >
              <Ionicons name="arrow-forward" size={24} color="black" />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  slide: {
    width,
    height,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    padding: 30,
  },
  textContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: 'white',
    marginBottom: 16,
    lineHeight: 46,
  },
  desc: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paginator: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  activeDot: {
    backgroundColor: COLORS.brand.primary,
    width: 24,
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  nextButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  nextButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundFallback: {
    backgroundColor: '#1a1a2e',
  },
  spacer: {
    flex: 1,
  },
});

export default OnboardingScreen;

// ═══════════════════════════════════════════════════════════════════════════
// AwwwardsOnboardingScreen - "İlk Etki" (First Impression)
// Liquid spirit, neon glow transitions, premium typography
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Onboarding slide data with Turkish labels and color-coded themes
 */
const AWWWARDS_SLIDES = [
  {
    id: '1',
    title: 'Eşsiz Anları\nKeşfet',
    desc: 'Dünyanın dört bir yanından doğrulanmış ve ipeksi deneyimlere tanıklık et.',
    color: COLORS.primary,
  },
  {
    id: '2',
    title: 'Güvenle\nPaylaş',
    desc: 'Trust Score sistemimizle sadece en güvenilir kullanıcılarla bağ kur.',
    color: COLORS.secondary,
  },
  {
    id: '3',
    title: 'Hediye Et,\nİz Bırak',
    desc: 'Sevdiklerine unutulmaz anlar hediye ederek sosyal ağını genişlet.',
    color: COLORS.accent.primary,
  },
];

interface AwwwardsOnboardingScreenProps {
  navigation: any;
}

/**
 * AwwwardsOnboardingScreen - İlk Etki Deneyimi
 *
 * Awwwards-quality onboarding with:
 * - Dynamic neon glow ball that follows scroll position
 * - Animated pagination dots with scale and opacity
 * - 48px display title with heading font
 * - Relaxed line-height description for readability
 * - Full-width 64px rounded action button
 * - Skip option for power users
 * - TYPOGRAPHY_SYSTEM integration throughout
 * - Turkish labels
 */
export const AwwwardsOnboardingScreen: React.FC<
  AwwwardsOnboardingScreenProps
> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useOnboarding();
  const scrollX = useRef(new RNAnimated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentIndex < AWWWARDS_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await completeOnboarding();
      navigation.replace('Welcome');
    }
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await completeOnboarding();
    navigation.replace('Welcome');
  };

  const renderSlide = ({ item }: { item: (typeof AWWWARDS_SLIDES)[0] }) => (
    <View style={awwwardsStyles.slide}>
      <View style={awwwardsStyles.textContainer}>
        <Text style={awwwardsStyles.title}>{item.title}</Text>
        <Text style={awwwardsStyles.description}>{item.desc}</Text>
      </View>
    </View>
  );

  // Get current slide color for dynamic theming
  const currentColor = AWWWARDS_SLIDES[currentIndex].color;

  return (
    <View style={awwwardsStyles.container}>
      {/* Dynamic Neon Glow Background */}
      <RNAnimated.View
        style={[
          awwwardsStyles.glowContainer,
          {
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: [0, width, width * 2],
                  outputRange: [width * 0.2, -width * 0.2, -width * 0.5],
                }),
              },
            ],
          },
        ]}
      >
        <View
          style={[awwwardsStyles.glowBall, { backgroundColor: currentColor }]}
        />
      </RNAnimated.View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={AWWWARDS_SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={RNAnimated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
      />

      {/* Footer Controls */}
      <View
        style={[awwwardsStyles.footer, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* Animated Pagination Dots */}
        <View style={awwwardsStyles.pagination}>
          {AWWWARDS_SLIDES.map((_, i) => {
            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            const scale = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [1, 1.5, 1],
              extrapolate: 'clamp',
            });
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });

            return (
              <RNAnimated.View
                key={i}
                style={[
                  awwwardsStyles.dot,
                  {
                    opacity,
                    transform: [{ scale }],
                    backgroundColor: currentColor,
                    width: dotWidth,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Action Button */}
        <TMButton
          title={
            currentIndex === AWWWARDS_SLIDES.length - 1
              ? 'Hadi Başlayalım'
              : 'Devam Et'
          }
          variant="primary"
          onPress={handleContinue}
          style={awwwardsStyles.button}
        />

        {/* Skip Button */}
        <TouchableOpacity
          style={awwwardsStyles.skipButton}
          onPress={handleSkip}
        >
          <Text style={awwwardsStyles.skipText}>Atla</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const awwwardsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },

  // ─────────────────────────────────────────────────────────────────
  // Glow Effect
  // ─────────────────────────────────────────────────────────────────
  glowContainer: {
    position: 'absolute',
    top: height * 0.1,
    width: width * 2,
    alignItems: 'center',
    zIndex: -1,
  },
  glowBall: {
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.15,
  },

  // ─────────────────────────────────────────────────────────────────
  // Slides
  // ─────────────────────────────────────────────────────────────────
  slide: {
    width: width,
    height: height,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  textContainer: {
    marginTop: height * 0.15,
  },
  title: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.heading,
    fontSize: 48,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.black,
    color: COLORS.text.primary,
    lineHeight: 54,
    letterSpacing: TYPOGRAPHY_SYSTEM.letterSpacing.tight,
  },
  description: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyL,
    color: COLORS.text.secondary,
    marginTop: 24,
    lineHeight:
      TYPOGRAPHY_SYSTEM.sizes.bodyL * TYPOGRAPHY_SYSTEM.lineHeights.relaxed,
  },

  // ─────────────────────────────────────────────────────────────────
  // Footer
  // ─────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    // Neon glow shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    shadowOpacity: 0.3,
    elevation: 10,
  },
  skipButton: {
    marginTop: 20,
    padding: 10,
  },
  skipText: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    color: COLORS.text.muted,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyS,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.semibold,
    letterSpacing: 1,
  },
});
