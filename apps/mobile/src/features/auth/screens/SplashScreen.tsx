import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/routeParams';

const { width: _width } = Dimensions.get('window');

type SplashScreenProps = StackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Logo Pop
    scale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );
    opacity.value = withTiming(1, { duration: 800 });

    // 2. Text Fade In
    textOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));

    // 3. Navigate Away
    const timeout = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: withSpring(textOpacity.value * 0) }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <MaterialCommunityIcons name="compass-rose" size={100} color={COLORS.brand.primary} />
      </Animated.View>

      <Animated.View style={[styles.textContainer, textStyle]}>
        <Animated.Text style={styles.brandName}>TRAVEL<Animated.Text style={styles.brandHighlight}>MATCH.</Animated.Text></Animated.Text>
        <Animated.Text style={styles.tagline}>Gift Moments, Collect Memories.</Animated.Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' },
  logoContainer: { marginBottom: 20, shadowColor: COLORS.brand.primary, shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 0 } },
  textContainer: { alignItems: 'center' },
  brandName: { color: 'white', fontSize: 42, fontWeight: '900', letterSpacing: -1 },
  brandHighlight: { color: COLORS.brand.primary },
  tagline: { color: COLORS.text.secondary, marginTop: 8, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' },
});
