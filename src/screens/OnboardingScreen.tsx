import { StackScreenProps } from '@react-navigation/stack';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { VALUES } from '../constants/values';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingPage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: ImageSourcePropType;
  gradient: string[];
}

const ONBOARDING_PAGES: OnboardingPage[] = [
  {
    id: '1',
    title: 'Give from the Heart',
    subtitle: 'Turn Kindness into Verified Proof',
    description:
      'Every moment of generosity deserves to be recognized. Create, verify, and share your kindness journey.',
    image: require('../../assets/icon.png'),
    gradient: [COLORS.primary, COLORS.accent],
  },
  {
    id: '2',
    title: 'Build Trust',
    subtitle: 'Your Kindness Wallet',
    description:
      'Every verified gesture becomes part of your Trust Garden. Watch your impact grow with each act of kindness.',
    image: require('../../assets/icon.png'),
    gradient: [COLORS.accent, COLORS.secondary],
  },
  {
    id: '3',
    title: 'Connect Globally',
    subtitle: 'Join the Proof Economy',
    description:
      'Share meaningful moments with travelers worldwide. Your verified experiences inspire others to give.',
    image: require('../../assets/icon.png'),
    gradient: [COLORS.secondary, COLORS.mint],
  },
];

type OnboardingScreenProps = StackScreenProps<RootStackParamList, 'Onboarding'>;

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  navigation,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_PAGES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      navigation.replace('Welcome');
    }
  };

  const handleSkip = () => {
    navigation.replace('Welcome');
  };

  const renderPage = ({ item }: { item: OnboardingPage }) => (
    <View style={styles.pageContainer}>
      <LinearGradient
        colors={item.gradient}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_PAGES}
        renderItem={renderPage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
          );
          setCurrentIndex(index);
        }}
        scrollEnabled={true}
      />

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {ONBOARDING_PAGES.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === currentIndex && styles.activeDot]}
          />
        ))}
      </View>

      {/* Bottom Actions */}
      <View style={styles.actionsContainer}>
        {currentIndex < ONBOARDING_PAGES.length - 1 ? (
          <>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                style={styles.nextButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.nextText}>Next</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            style={styles.getStartedButton}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              style={styles.getStartedGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: LAYOUT.padding * 2,
    paddingHorizontal: LAYOUT.padding * 2,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  contentContainer: {
    paddingBottom: LAYOUT.padding * 4,
  },
  description: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    opacity: 0.8,
    textAlign: 'center',
  },
  dot: {
    backgroundColor: COLORS.border,
    borderRadius: 4,
    height: 8,
    marginHorizontal: 4,
    width: 8,
  },
  getStartedButton: {
    borderRadius: VALUES.borderRadius,
    flex: 1,
    overflow: 'hidden',
  },
  getStartedGradient: {
    alignItems: 'center',
    borderRadius: VALUES.borderRadius,
    paddingVertical: LAYOUT.padding * 2,
  },
  getStartedText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.padding * 2,
  },
  image: {
    height: SCREEN_HEIGHT * 0.4,
    width: SCREEN_WIDTH * 0.7,
  },
  imageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: LAYOUT.padding * 3,
  },
  nextButton: {
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    borderRadius: VALUES.borderRadius,
    paddingHorizontal: LAYOUT.padding * 4,
    paddingVertical: LAYOUT.padding * 1.5,
  },
  nextText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  pageContainer: {
    height: SCREEN_HEIGHT - 200,
    width: SCREEN_WIDTH,
  },
  paginationContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding * 2,
  },
  skipButton: {
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding,
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: LAYOUT.padding,
    opacity: 0.9,
    textAlign: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: LAYOUT.padding,
    textAlign: 'center',
  },
});
