import type { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import React, { useRef, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { HORIZONTAL_LIST_CONFIG } from '../utils/listOptimization';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAnalytics } from '../hooks/useAnalytics';

const { width: SCREEN_WIDTH, height: _SCREEN_HEIGHT } =
  Dimensions.get('window');

interface OnboardingPage {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

const ONBOARDING_PAGES: OnboardingPage[] = [
  {
    id: '1',
    title: 'Welcome to TravelMatch',
    description:
      'Connect and support travelers on their unique journeys through verified, heartfelt gifts.',
    image: require('../../assets/icon.png'),
  },
  {
    id: '2',
    title: 'Share Your Journey',
    description:
      'Create moments from your travels and receive gifts from supporters around the world.',
    image: require('../../assets/icon.png'),
  },
  {
    id: '3',
    title: 'Build Trust Together',
    description:
      'Every verified moment strengthens our community. Your proof of experience matters.',
    image: require('../../assets/icon.png'),
  },
  {
    id: '4',
    title: 'Start Your Adventure',
    description:
      'Join thousands of travelers connecting through meaningful gifts and authentic experiences.',
    image: require('../../assets/icon.png'),
  },
];

import { useOnboarding } from '../hooks/useOnboarding';
import { useNavigation } from '@react-navigation/native';

type OnboardingScreenProps = StackScreenProps<RootStackParamList, 'Onboarding'>;

export const OnboardingScreen: React.FC<Partial<OnboardingScreenProps>> = ({
  navigation: navProp,
}) => {
  const defaultNavigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const navigation = navProp || defaultNavigation;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const analytics = useAnalytics();
  const { completeOnboarding } = useOnboarding();

  const handleNext = async () => {
    if (currentIndex < ONBOARDING_PAGES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      analytics.trackEvent('onboarding_completed', {
        screen: 'onboarding',
        total_screens: ONBOARDING_PAGES.length,
      });
      await completeOnboarding();
      navigation.replace('Welcome');
    }
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

  const renderPage = ({ item }: { item: OnboardingPage }) => (
    <View style={styles.pageContainer}>
      <View style={styles.imageSection}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.textSection}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.contentWrapper}>
        <FlatList<OnboardingPage>
          ref={flatListRef}
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
          style={styles.flatList}
          {...HORIZONTAL_LIST_CONFIG}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Bottom Controls Section */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {ONBOARDING_PAGES.map((_, index) => (
            <View
              key={index}
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
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        </View>

        {/* Skip Link */}
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
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
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.15,
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
