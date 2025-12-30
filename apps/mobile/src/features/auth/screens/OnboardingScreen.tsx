/**
 * TravelMatch Awwwards Design System 2026 - Onboarding Screen
 *
 * Immersive storytelling onboarding with:
 * - 3D parallax floating elements
 * - Smooth gradient transitions
 * - Animated emoji interactions
 * - Story-based narrative
 *
 * Designed for Awwwards Best UI/UX nomination
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  withRepeat,
  interpolate,
  Extrapolation,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type {
  StackNavigationProp,
  StackScreenProps,
} from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

import { COLORS, GRADIENTS, PALETTE } from '../../../constants/colors';
import { TYPE_SCALE } from '../../../theme/typography';
import { SPRINGS, TIMINGS } from '../../../hooks/useAnimations';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useOnboarding } from '@/hooks/useOnboarding';
import { logger } from '../../../utils/logger';
import type { RootStackParamList } from '@/navigation/routeParams';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================
interface OnboardingSlide {
  id: string;
  emoji: string;
  emojiSize: number;
  headline: string;
  subheadline: string;
  gradientColors: readonly [string, string, string];
  floatingElements: Array<{
    emoji: string;
    position: { top: number; left: number };
    scale: number;
    rotation: number;
  }>;
}

type OnboardingScreenProps = StackScreenProps<RootStackParamList, 'Onboarding'>;

// ============================================
// SLIDE DATA
// ============================================
const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    emoji: '\u2615', // Coffee emoji
    emojiSize: 120,
    headline: 'Ya birisi sana\nbugün bir kahve\nısmarlasa?',
    subheadline: 'Yabancılar arasında dostluk kurmanın yeni yolu',
    gradientColors: ['#F97316', '#FB923C', '#0C0A09'] as const,
    floatingElements: [
      { emoji: '\u2728', position: { top: 15, left: 10 }, scale: 1.2, rotation: -15 },
      { emoji: '\u{1F9E1}', position: { top: 25, left: 80 }, scale: 0.8, rotation: 10 },
      { emoji: '\u2615', position: { top: 60, left: 85 }, scale: 0.6, rotation: -5 },
    ],
  },
  {
    id: '2',
    emoji: '\u{1F31F}', // Star emoji
    emojiSize: 100,
    headline: 'Bir dilek tut',
    subheadline: 'İstediğin deneyimi paylaş,\nbiri onu sana hediye etsin',
    gradientColors: ['#A855F7', '#C084FC', '#0C0A09'] as const,
    floatingElements: [
      { emoji: '\u{1F4AB}', position: { top: 20, left: 15 }, scale: 1, rotation: 20 },
      { emoji: '\u2B50', position: { top: 35, left: 75 }, scale: 1.1, rotation: -10 },
      { emoji: '\u{1F319}', position: { top: 55, left: 10 }, scale: 0.7, rotation: 5 },
    ],
  },
  {
    id: '3',
    emoji: '\u{1F381}', // Gift emoji
    emojiSize: 110,
    headline: 'Birinin gününü\ngüzelleştir',
    subheadline: 'Küçük bir hediye, büyük bir mutluluk',
    gradientColors: ['#F43F5E', '#FB7185', '#0C0A09'] as const,
    floatingElements: [
      { emoji: '\u{1F49D}', position: { top: 18, left: 20 }, scale: 0.9, rotation: -12 },
      { emoji: '\u{1F389}', position: { top: 40, left: 78 }, scale: 1, rotation: 15 },
      { emoji: '\u2728', position: { top: 58, left: 25 }, scale: 0.8, rotation: -8 },
    ],
  },
  {
    id: '4',
    emoji: '\u{1F510}', // Lock emoji
    emojiSize: 100,
    headline: 'Güvenli kasada,\nmerak etme',
    subheadline: 'Paran deneyim gerçekleşene kadar koruma altında',
    gradientColors: ['#10B981', '#34D399', '#0C0A09'] as const,
    floatingElements: [
      { emoji: '\u{1F6E1}', position: { top: 22, left: 12 }, scale: 1.1, rotation: 8 },
      { emoji: '\u2713', position: { top: 38, left: 82 }, scale: 0.9, rotation: -5 },
      { emoji: '\u{1F48E}', position: { top: 55, left: 70 }, scale: 0.7, rotation: 12 },
    ],
  },
  {
    id: '5',
    emoji: '\u{1F680}', // Rocket emoji
    emojiSize: 120,
    headline: 'Hazır mısın?',
    subheadline: 'Dilekler seni bekliyor',
    gradientColors: ['#3B82F6', '#60A5FA', '#0C0A09'] as const,
    floatingElements: [
      { emoji: '\u{1F30D}', position: { top: 20, left: 15 }, scale: 1.2, rotation: -10 },
      { emoji: '\u2764', position: { top: 45, left: 80 }, scale: 1, rotation: 15 },
      { emoji: '\u{1F3AF}', position: { top: 60, left: 20 }, scale: 0.8, rotation: 5 },
    ],
  },
];

// ============================================
// FLOATING ELEMENT COMPONENT
// ============================================
interface FloatingElementProps {
  emoji: string;
  position: { top: number; left: number };
  scale: number;
  rotation: number;
  slideProgress: SharedValue<number>;
  index: number;
}

const FloatingElement: React.FC<FloatingElementProps> = ({
  emoji,
  position,
  scale,
  rotation,
  slideProgress,
  index,
}) => {
  const floatY = useSharedValue(0);

  useEffect(() => {
    // Floating animation
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000 + index * 200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000 + index * 200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => {
    const parallaxOffset = interpolate(
      slideProgress.value,
      [0, 1],
      [0, -30 * (index + 1)],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateY: parallaxOffset + floatY.value },
        { scale: scale },
        { rotate: `${rotation}deg` },
      ],
      opacity: interpolate(
        slideProgress.value,
        [0, 0.3, 0.7, 1],
        [0, 1, 1, 0],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <Reanimated.Text
      style={[
        styles.floatingEmoji,
        {
          top: `${position.top}%`,
          left: `${position.left}%`,
          fontSize: 40,
        },
        animatedStyle,
      ]}
    >
      {emoji}
    </Reanimated.Text>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const OnboardingScreen: React.FC<Partial<OnboardingScreenProps>> = ({
  navigation: navProp,
}) => {
  const defaultNavigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();
  const navigation = navProp || defaultNavigation;
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const analytics = useAnalytics();
  const { completeOnboarding } = useOnboarding();

  const slideProgress = useSharedValue(0);
  const emojiScale = useSharedValue(1);
  const emojiRotation = useSharedValue(0);
  const contentOpacity = useSharedValue(1);
  const contentTranslateY = useSharedValue(0);

  const currentSlide = SLIDES[currentIndex];

  // Initial entrance animation
  useEffect(() => {
    contentOpacity.value = 0;
    contentTranslateY.value = 20;

    contentOpacity.value = withDelay(200, withTiming(1, TIMINGS.medium));
    contentTranslateY.value = withDelay(200, withSpring(0, SPRINGS.gentle));
  }, [currentIndex]);

  const handleNext = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Bounce animation on emoji
    emojiScale.value = withSequence(
      withSpring(0.8, { damping: 10 }),
      withSpring(1.1, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );
    emojiRotation.value = withSequence(
      withSpring(-10, { damping: 10 }),
      withSpring(10, { damping: 8 }),
      withSpring(0, { damping: 12 })
    );

    // Content fade out and slide
    contentOpacity.value = withTiming(0, { duration: 150 });
    contentTranslateY.value = withTiming(-20, { duration: 150 });

    if (currentIndex < SLIDES.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        slideProgress.value = withSpring((currentIndex + 1) / (SLIDES.length - 1));

        analytics.trackEvent('onboarding_page_view', {
          screen: 'onboarding',
          page_number: currentIndex + 2,
          page_title: SLIDES[currentIndex + 1].headline,
        });
      }, 150);
    } else {
      analytics.trackEvent('onboarding_completed', {
        screen: 'onboarding',
        total_screens: SLIDES.length,
      });

      try {
        await completeOnboarding();
        navigation.replace('Welcome');
      } catch (error) {
        logger.error('Onboarding completion error', { error });
        navigation.replace('Welcome');
      }
    }
  }, [currentIndex, navigation, analytics, completeOnboarding]);

  const handleSkip = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    analytics.trackEvent('onboarding_skipped', {
      screen: 'onboarding',
      current_screen: currentIndex + 1,
      total_screens: SLIDES.length,
    });

    await completeOnboarding();
    navigation.replace('Welcome');
  }, [navigation, currentIndex, analytics, completeOnboarding]);

  const emojiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: emojiScale.value },
      { rotate: `${emojiRotation.value}deg` },
    ],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={currentSlide.gradientColors}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Elements with Parallax */}
      {currentSlide.floatingElements.map((element, idx) => (
        <FloatingElement
          key={`${currentSlide.id}-${idx}`}
          {...element}
          slideProgress={slideProgress}
          index={idx}
        />
      ))}

      {/* Main Emoji - Centered */}
      <View style={styles.emojiContainer}>
        <Reanimated.Text
          style={[
            styles.mainEmoji,
            { fontSize: currentSlide.emojiSize },
            emojiAnimatedStyle,
          ]}
        >
          {currentSlide.emoji}
        </Reanimated.Text>
      </View>

      {/* Content */}
      <Reanimated.View style={[styles.contentContainer, contentAnimatedStyle]}>
        <Text style={styles.headline}>{currentSlide.headline}</Text>
        <Text style={styles.subheadline}>{currentSlide.subheadline}</Text>
      </Reanimated.View>

      {/* Bottom Controls */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <Pressable onPress={handleNext} style={styles.ctaButton}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
            style={styles.ctaGradient}
          >
            <BlurView
              intensity={Platform.OS === 'ios' ? 20 : 50}
              tint="light"
              style={styles.ctaBlur}
            >
              <Text style={styles.ctaText}>
                {currentIndex === SLIDES.length - 1 ? 'Başla' : 'Devam'}
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={PALETTE.white}
              />
            </BlurView>
          </LinearGradient>
        </Pressable>

        {/* Skip Link */}
        {currentIndex < SLIDES.length - 1 && (
          <Pressable style={styles.skipLink} onPress={handleSkip}>
            <Text style={styles.skipText}>Atla</Text>
          </Pressable>
        )}
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
  },
  floatingEmoji: {
    position: 'absolute',
  },
  emojiContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.22,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mainEmoji: {
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 8 },
    textShadowRadius: 20,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 260,
    left: 32,
    right: 32,
  },
  headline: {
    ...TYPE_SCALE.display.h1,
    color: PALETTE.white,
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subheadline: {
    ...TYPE_SCALE.body.large,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 28,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 32,
    right: 32,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: PALETTE.white,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  ctaButton: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
  },
  ctaGradient: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ctaBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
    overflow: 'hidden',
    borderRadius: 28,
  },
  ctaText: {
    ...TYPE_SCALE.label.large,
    color: PALETTE.white,
  },
  skipLink: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    ...TYPE_SCALE.body.base,
    color: 'rgba(255,255,255,0.6)',
  },
});

export default OnboardingScreen;
