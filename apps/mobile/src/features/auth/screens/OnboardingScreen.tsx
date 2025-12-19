import type {
  StackNavigationProp,
  StackScreenProps,
} from '@react-navigation/stack';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ImageSourcePropType } from 'react-native';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';

const { width: SCREEN_WIDTH, height: _SCREEN_HEIGHT } =
  Dimensions.get('window');

interface OnboardingPage {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logger } from '../../../utils/logger';
import { COLORS } from '@/constants/colors';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useOnboarding } from '@/hooks/useOnboarding';
import { HORIZONTAL_LIST_CONFIG } from '@/utils/listOptimization';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type OnboardingScreenProps = StackScreenProps<RootStackParamList, 'Onboarding'>;

export const OnboardingScreen: React.FC<Partial<OnboardingScreenProps>> = ({
  navigation: navProp,
}) => {
  const { t } = useTranslation();
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

  // Dynamic onboarding pages from i18n
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const iconImage = require('../../../../assets/icon.png') as ImageSourcePropType;
  
  const ONBOARDING_PAGES: OnboardingPage[] = [
    {
      id: '1',
      title: t('onboarding.page1.title'),
      description: t('onboarding.page1.description'),
      image: iconImage,
    },
    {
      id: '2',
      title: t('onboarding.page2.title'),
      description: t('onboarding.page2.description'),
      image: iconImage,
    },
    {
      id: '3',
      title: t('onboarding.page3.title'),
      description: t('onboarding.page3.description'),
      image: iconImage,
    },
    {
      id: '4',
      title: t('onboarding.page4.title'),
      description: t('onboarding.page4.description'),
      image: iconImage,
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
        flashListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
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
        completeOnboarding().then(() => {
          navigation.replace('Welcome');
        }).catch((error: unknown) => {
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

  const renderPage = ({ item, index }: { item: OnboardingPage; index: number }) => (
    <Animated.View 
      style={[
        styles.pageContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.imageSection}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.textSection}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        
        {/* Progress indicator text */}
        <Text style={styles.progressText}>
          {index + 1} / {ONBOARDING_PAGES.length}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.contentWrapper}>
        <FlashList<OnboardingPage>
          ref={flashListRef}
          data={ONBOARDING_PAGES}
          renderItem={renderPage}
          estimatedItemSize={SCREEN_WIDTH}
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
          style={styles.flatList}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Bottom Controls Section */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {ONBOARDING_PAGES.map((page, index) => (
            <View
              key={page.id}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
                index !== currentIndex && styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextText}>
              {currentIndex < ONBOARDING_PAGES.length - 1
                ? t('onboarding.next')
                : t('onboarding.getStarted')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skip Link */}
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentWrapper: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  pageContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  imageSection: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    paddingTop: 24,
    paddingBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingBottom: 12,
    paddingTop: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
  bottomSection: {
    backgroundColor: COLORS.background,
    paddingBottom: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  dot: {
    height: 8,
    borderRadius: 9999,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 8,
    backgroundColor: COLORS.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: COLORS.primary,
    opacity: 0.2,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nextButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  skipButton: {
    alignItems: 'center',
    paddingTop: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
});
