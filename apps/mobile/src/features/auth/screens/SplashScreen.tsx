import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { COLORS } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SplashScreenProps = StackScreenProps<RootStackParamList, 'Splash'>;

/**
 * SplashScreen - The first screen users see when launching the app
 *
 * Design Guidelines (Adrian K / DESIGNME):
 * - Keep it minimal with just the name, logo, or slogan
 * - Center all elements
 * - Display for only 1-3 seconds or add a loading indicator
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  // Animated values
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(sloganOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, logoOpacity, logoScale, sloganOpacity]);

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.surface]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
             
            source={require('../../../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Slogan */}
        <Animated.Text
          style={[
            styles.slogan,
            { opacity: sloganOpacity },
          ]}
        >
          Connect with locals. Share experiences.
        </Animated.Text>
      </View>

      {/* Subtle loading indicator */}
      <View style={styles.footer}>
        <View style={styles.loadingDots}>
          <LoadingDot delay={0} />
          <LoadingDot delay={200} />
          <LoadingDot delay={400} />
        </View>
      </View>
    </LinearGradient>
  );
};

// Animated loading dot component
const LoadingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, delay]);

  return <Animated.View style={[styles.dot, { opacity }]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: SCREEN_WIDTH * 0.4,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  slogan: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  footer: {
    paddingBottom: 60,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});
