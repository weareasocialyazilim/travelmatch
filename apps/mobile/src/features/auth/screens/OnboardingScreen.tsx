/**
 * OnboardingScreen - iOS 26.3 Redesigned
 *
 * 5-slide onboarding flow introducing TravelMatch gift-moment concept.
 * Features full-screen imagery, gradient overlays, and animated transitions.
 * Part of iOS 26.3 design system for TravelMatch.
 */
import type {
  StackNavigationProp,
  StackScreenProps,
} from '@react-navigation/stack';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingPage {
  id: string;
  title: string;
  description: string;
  gradient: readonly [string, string];
  icon: string;
}

import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logger } from '../../../utils/logger';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useOnboarding } from '@/hooks/useOnboarding';
import type { RootStackParamList } from '@/navigation/routeParams';

type OnboardingScreenProps = StackScreenProps<RootStackParamList, 'Onboarding'>;

export const OnboardingScreen: React.FC<Partial<OnboardingScreenProps>> = ({
  navigation: navProp,
}) => {
  const defaultNavigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();
  const navigation = navProp || defaultNavigation;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flashListRef = useRef<FlashList<OnboardingPage>>(null);
  const analytics = useAnalytics();
  const { completeOnboarding } = useOnboarding();

  // Animated values for fade-in effect
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 5-slide onboarding flow for gift-moment concept
  // Uses gradient backgrounds with icons for a clean, app-like experience
  const ONBOARDING_PAGES: OnboardingPage[] = [
    {
      id: '1',
      title: 'Ya birisi sana bugün\nbir kahve ısmarlasa?',
      description: 'Yabancılar arasında dostluk kurmanın yeni yolu',
      gradient: GRADIENTS.giftButton,
      icon: 'coffee',
    },
    {
      id: '2',
      title: 'Bir dilek tut 🌟',
      description: 'İstediğin deneyimi paylaş,\nbiri onu sana hediye etsin',
      gradient: GRADIENTS.aurora,
      icon: 'star-shooting',
    },
    {
      id: '3',
      title: 'Birinin gününü\ngüzelleştir 🎁',
      description: 'Küçük bir hediye, büyük bir mutluluk',
      gradient: GRADIENTS.sunset,
      icon: 'gift',
    },
    {
      id: '4',
      title: 'Güvenli kasada,\nmerak etme 🔒',
      description: 'Paran deneyim gerçekleşene kadar koruma altında',
      gradient: GRADIENTS.trust,
      icon: 'lock-check',
    },
    {
      id: '5',
      title: 'Hazır mısın?',
      description: 'Dilekler seni bekliyor',
      gradient: GRADIENTS.celebration,
      icon: 'rocket-launch',
    },
  ];

  const handleNext = async () => {
    // Animate transition
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0.6,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (currentIndex < ONBOARDING_PAGES.length - 1) {
        const nextIndex = currentIndex + 1;
        flashListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setCurrentIndex(nextIndex);

        // Track page view
        analytics.trackEvent('onboarding_page_view', {
          screen: 'onboarding',
          page_number: nextIndex + 1,
          page_title: ONBOARDING_PAGES[nextIndex].title,
        });
      } else {
        analytics.trackEvent('onboarding_completed', {
          screen: 'onboarding',
          total_screens: ONBOARDING_PAGES.length,
        });
        completeOnboarding()
          .then(() => {
            navigation.replace('Welcome');
          })
          .catch((error: unknown) => {
            logger.error('Onboarding completion error', { error });
            // Fallback: still navigate even if storage fails
            navigation.replace('Welcome');
          });
      }

      // Restore animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleSkip = async () => {
    analytics.trackEvent('onboarding_skipped', {
      screen: 'onboarding',
      current_screen: currentIndex + 1,
      total_screens: ONBOARDING_PAGES.length,
      skip_percentage: ((currentIndex + 1) / ONBOARDING_PAGES.length) * 100,
    });
    await completeOnboarding();
    navigation.replace('Welcome');
  };

  const renderPage = ({
    item,
    index: _index,
  }: {
    item: OnboardingPage;
    index: number;
  }) => (
    <Animated.View
      style={[
        styles.pageContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Full-screen gradient background */}
      <LinearGradient
        colors={[item.gradient[0], item.gradient[1], 'rgba(0,0,0,0.9)']}
        locations={[0, 0.4, 1]}
        style={styles.gradientBackground}
      />

      {/* Central icon */}
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
          style={styles.iconGradient}
        >
          <MaterialCommunityIcons
            name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={56}
            color={COLORS.white}
          />
        </LinearGradient>
      </View>

      {/* Content */}
      <View style={styles.contentSection}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </Animated.View>
  );

  const isLastPage = currentIndex === ONBOARDING_PAGES.length - 1;

  return (
    <View style={styles.container}>
      <FlashList<OnboardingPage>
        ref={flashListRef}
        data={ONBOARDING_PAGES}
        renderItem={renderPage}
        horizontal
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
          );
          setCurrentIndex(index);
        }}
        scrollEnabled={true}
        estimatedItemSize={SCREEN_WIDTH}
        showsHorizontalScrollIndicator={false}
      />

      {/* Bottom Controls Section */}
      <SafeAreaView style={styles.bottomSection} edges={['bottom']}>
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {ONBOARDING_PAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsRow}>
          {!isLastPage && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Atla</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleNext}
            style={styles.nextButtonWrapper}
          >
            <LinearGradient
              colors={ONBOARDING_PAGES[currentIndex].gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButton}
            >
              <Text style={styles.nextText}>
                {isLastPage ? 'Başla' : 'Devam'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Explore link on last page */}
        {isLastPage && (
          <TouchableOpacity onPress={handleSkip} style={styles.exploreLink}>
            <Text style={styles.exploreLinkText}>Önce keşfet →</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  pageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  iconContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.25,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  contentSection: {
    position: 'absolute',
    bottom: 220,
    left: 24,
    right: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 16,
    lineHeight: 44,
    textShadowColor: COLORS.overlay,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 18,
    color: COLORS.subtitle,
    lineHeight: 26,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.white,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: COLORS.whiteOverlay30,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  skipText: {
    color: COLORS.whiteOverlay70,
    fontSize: 16,
    fontWeight: '500',
  },
  nextButtonWrapper: {
    flex: 1,
    marginLeft: 16,
  },
  nextButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  exploreLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  exploreLinkText: {
    color: COLORS.whiteOverlay70,
    fontSize: 16,
  },
});
