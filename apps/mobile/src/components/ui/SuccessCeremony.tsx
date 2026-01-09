/**
 * Success Ceremony Component
 *
 * A premium celebration screen for successful actions.
 * Used after registration, verification, and other milestone events.
 *
 * Enhanced with:
 * - Liquid splash effect animation
 * - Particle burst celebration
 * - Premium dopamine feedback
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { COLORS, GRADIENTS } from '@/constants/colors';

const { width } = Dimensions.get('window');

export interface SuccessCeremonyProps {
  title: string;
  message: string;
  buttonText: string;
  onPress: () => void;
  icon?: string;
  testID?: string;
}

export const SuccessCeremony: React.FC<SuccessCeremonyProps> = ({
  title,
  message,
  buttonText,
  onPress,
  icon = 'check-circle',
  testID,
}) => {
  const insets = useSafeAreaInsets();

  // Liquid splash particles
  const particle1Scale = useSharedValue(0);
  const particle1Opacity = useSharedValue(1);
  const particle2Scale = useSharedValue(0);
  const particle2Opacity = useSharedValue(1);
  const particle3Scale = useSharedValue(0);
  const particle3Opacity = useSharedValue(1);

  useEffect(() => {
    // Particle 1 - Top right
    particle1Scale.value = withDelay(
      300,
      withSpring(1.5, { damping: 10, stiffness: 100 }),
    );
    particle1Opacity.value = withDelay(
      300,
      withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) }),
      ),
    );

    // Particle 2 - Left
    particle2Scale.value = withDelay(
      400,
      withSpring(1.8, { damping: 10, stiffness: 100 }),
    );
    particle2Opacity.value = withDelay(
      400,
      withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 900, easing: Easing.out(Easing.ease) }),
      ),
    );

    // Particle 3 - Bottom right
    particle3Scale.value = withDelay(
      500,
      withSpring(1.3, { damping: 10, stiffness: 100 }),
    );
    particle3Opacity.value = withDelay(
      500,
      withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 700, easing: Easing.out(Easing.ease) }),
      ),
    );
  }, [
    particle1Scale,
    particle1Opacity,
    particle2Scale,
    particle2Opacity,
    particle3Scale,
    particle3Opacity,
  ]);

  const particle1Style = useAnimatedStyle(() => ({
    transform: [{ scale: particle1Scale.value }],
    opacity: particle1Opacity.value,
  }));

  const particle2Style = useAnimatedStyle(() => ({
    transform: [{ scale: particle2Scale.value }],
    opacity: particle2Opacity.value,
  }));

  const particle3Style = useAnimatedStyle(() => ({
    transform: [{ scale: particle3Scale.value }],
    opacity: particle3Opacity.value,
  }));

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      testID={testID}
    >
      <LinearGradient
        colors={['#121214', '#1E1E20', '#121214']}
        style={StyleSheet.absoluteFill}
      />

      {/* Liquid Splash Particles */}
      <Animated.View style={[styles.particle1, particle1Style]}>
        <LinearGradient
          colors={[COLORS.primary, 'transparent']}
          style={styles.particleGradient}
        />
      </Animated.View>
      <Animated.View style={[styles.particle2, particle2Style]}>
        <LinearGradient
          colors={[COLORS.secondary, 'transparent']}
          style={styles.particleGradient}
        />
      </Animated.View>
      <Animated.View style={[styles.particle3, particle3Style]}>
        <LinearGradient
          colors={[COLORS.primary, 'transparent']}
          style={styles.particleGradient}
        />
      </Animated.View>

      {/* Icon */}
      <Animated.View
        entering={ZoomIn.delay(200).springify()}
        style={styles.iconContainer}
      >
        <LinearGradient colors={GRADIENTS.primary} style={styles.iconGradient}>
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={64}
            color={COLORS.black}
          />
        </LinearGradient>
      </Animated.View>

      {/* Title */}
      <Animated.Text
        entering={FadeInUp.delay(400).springify()}
        style={styles.title}
      >
        {title}
      </Animated.Text>

      {/* Message */}
      <Animated.Text
        entering={FadeInUp.delay(500).springify()}
        style={styles.message}
      >
        {message}
      </Animated.Text>

      {/* Button */}
      <Animated.View
        entering={FadeIn.delay(700)}
        style={styles.buttonContainer}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // Liquid splash particles
  particle1: {
    position: 'absolute',
    top: '25%',
    right: '15%',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  particle2: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  particle3: {
    position: 'absolute',
    bottom: '30%',
    right: '20%',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  particleGradient: {
    flex: 1,
    borderRadius: 100,
  },
  iconContainer: {
    marginBottom: 32,
    zIndex: 10,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 16,
    zIndex: 10,
  },
  message: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    maxWidth: width * 0.8,
    zIndex: 10,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  button: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
});

export default SuccessCeremony;
