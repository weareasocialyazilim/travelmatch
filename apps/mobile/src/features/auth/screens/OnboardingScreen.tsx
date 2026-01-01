/**
 * TravelMatch Onboarding Screen
 *
 * Immersive image-based onboarding with:
 * - Full-screen background images
 * - Smooth gradient overlays
 * - Horizontal swipe navigation
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { StackScreenProps } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { COLORS } from '@/theme/colors';
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
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200',
    title: 'Discover Local Vibes',
    desc: 'Find exclusive moments curated by locals. From hidden bars to sunset dinners.',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200',
    title: 'Connect & Experience',
    desc: "Don't just travel. Meet people who share your taste and gift them a moment.",
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1551632436-cbf8dd354ca8?q=80&w=1200',
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
  const defaultNavigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const navigation = navProp || defaultNavigation;
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const analytics = useAnalytics();
  const { completeOnboarding } = useOnboarding();

  const handleNext = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });

      analytics.trackEvent('onboarding_page_view', {
        screen: 'onboarding',
        page_number: activeIndex + 2,
        page_id: SLIDES[activeIndex + 1].id,
      });
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
  }, [activeIndex, navigation, analytics, completeOnboarding]);

  const renderItem = ({ item }: { item: (typeof SLIDES)[0] }) => (
    <View style={styles.slide}>
      <ImageBackground source={{ uri: item.image }} style={styles.image} resizeMode="cover">
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)', 'black']}
          style={styles.gradient}
        />
      </ImageBackground>
    </View>
  );

  const currentSlide = SLIDES[activeIndex];

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(ev) => {
          const newIndex = Math.round(ev.nativeEvent.contentOffset.x / width);
          if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
            analytics.trackEvent('onboarding_page_view', {
              screen: 'onboarding',
              page_number: newIndex + 1,
              page_id: SLIDES[newIndex].id,
            });
          }
        }}
        keyExtractor={(item) => item.id}
      />

      {/* Content Overlay */}
      <View style={[styles.overlay, { paddingBottom: insets.bottom + 30 }]}>
        <Animated.View
          key={currentSlide.id}
          entering={FadeInDown.springify()}
          style={styles.textContainer}
        >
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.desc}>{currentSlide.desc}</Text>
        </Animated.View>

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

          {/* Next Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            accessible={true}
            accessibilityLabel={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={[COLORS.brand.primary, '#A2FF00']}
              style={styles.btnGradient}
            >
              <Ionicons name="arrow-forward" size={24} color="black" />
            </LinearGradient>
          </TouchableOpacity>
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
    backgroundColor: 'black',
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
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  activeDot: {
    backgroundColor: COLORS.brand.primary,
    width: 24,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  btnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OnboardingScreen;
