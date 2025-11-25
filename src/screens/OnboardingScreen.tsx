import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { STRINGS } from '../constants/strings';
import { LAYOUT } from '../constants/layout';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingPage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: any;
  gradient: string[];
}

const ONBOARDING_PAGES: OnboardingPage[] = [
  {
    id: '1',
    title: 'Give from the Heart',
    subtitle: 'Turn Kindness into Verified Proof',
    description: 'Every moment of generosity deserves to be recognized. Create, verify, and share your kindness journey.',
    image: require('../../assets/icon.png'),
    gradient: [COLORS.primary, COLORS.accent],
  },
  {
    id: '2',
    title: 'Build Trust',
    subtitle: 'Your Kindness Wallet',
    description: 'Every verified gesture becomes part of your Trust Garden. Watch your impact grow with each act of kindness.',
    image: require('../../assets/icon.png'),
    gradient: [COLORS.accent, COLORS.secondary],
  },
  {
    id: '3',
    title: 'Connect Globally',
    subtitle: 'Join the Proof Economy',
    description: 'Share meaningful moments with travelers worldwide. Your verified experiences inspire others to give.',
    image: require('../../assets/icon.png'),
    gradient: [COLORS.secondary, COLORS.mint],
  },
];

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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
          <Image source={item.image} style={styles.image} resizeMode="contain" />
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
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        scrollEnabled={true}
      />

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {ONBOARDING_PAGES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
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
          <TouchableOpacity onPress={handleNext} style={styles.getStartedButton}>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  pageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.padding * 2,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: LAYOUT.padding * 3,
  },
  image: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_HEIGHT * 0.4,
  },
  contentContainer: {
    paddingBottom: LAYOUT.padding * 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: LAYOUT.padding,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: LAYOUT.padding,
    textAlign: 'center',
    opacity: 0.9,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: LAYOUT.padding * 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingBottom: LAYOUT.padding * 2,
  },
  skipButton: {
    paddingVertical: LAYOUT.padding,
    paddingHorizontal: LAYOUT.padding * 2,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  nextButton: {
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: LAYOUT.padding * 1.5,
    paddingHorizontal: LAYOUT.padding * 4,
    borderRadius: VALUES.borderRadius,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  getStartedButton: {
    flex: 1,
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
  },
  getStartedGradient: {
    paddingVertical: LAYOUT.padding * 2,
    alignItems: 'center',
    borderRadius: VALUES.borderRadius,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
});
