import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function AnimatedButton({
  children,
  onPress,
  variant = 'primary',
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      default:
        return styles.primary;
    }
  };

  return (
    <Animated.View style={[styles.button, getVariantStyles(), animatedStyle]}>
      <Animated.Text
        style={styles.text}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {children}
      </Animated.Text>
    </Animated.View>
  );
}

export function PulseButton({ children, onPress }: AnimatedButtonProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.button, styles.primary, animatedStyle]}>
      <Animated.Text style={styles.text} onPress={onPress}>
        {children}
      </Animated.Text>
    </Animated.View>
  );
}

export function ShimmerButton({ children, onPress }: AnimatedButtonProps) {
  const translateX = useSharedValue(-100);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(100, { duration: 2000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.button, styles.primary]}>
      <Animated.View style={[styles.shimmer, shimmerStyle]} />
      <Animated.Text style={styles.text} onPress={onPress}>
        {children}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primary: {
    backgroundColor: COLORS.brand.primary,
  },
  secondary: {
    backgroundColor: COLORS.feedback.success,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.brand.primary,
  },
  text: {
    color: COLORS.utility.white,
    fontSize: 16,
    fontWeight: '600',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `${COLORS.utility.white}4D`,
    width: 50,
  },
});
