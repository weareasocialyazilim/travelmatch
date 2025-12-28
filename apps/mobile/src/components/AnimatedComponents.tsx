import React, { useEffect, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, Pressable, View, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  cancelAnimation,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

interface AnimatedButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  haptic?: boolean;
  children: React.ReactNode;
}

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

interface ScaleOnPressProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  scale?: number;
  haptic?: boolean;
}

interface SlideInViewProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

interface PulseViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  pulseScale?: number;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
};

/**
 * Button with scale animation on press
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  style,
  disabled = false,
  haptic = true,
  children,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, SPRING_CONFIG);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (haptic) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [haptic, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[style, animatedStyle, disabled && styles.disabled]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

/**
 * View that fades in on mount
 */
export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  duration = 300,
  style,
}) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));

    return () => {
      cancelAnimation(opacity);
    };
  }, [opacity, delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
};

/**
 * View that slides in from a direction
 */
export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 300,
  style,
}) => {
  const initialTranslate = getInitialTranslate(direction);
  const translateX = useSharedValue(
    direction === 'left' || direction === 'right' ? initialTranslate : 0,
  );
  const translateY = useSharedValue(
    direction === 'up' || direction === 'down' ? initialTranslate : 0,
  );
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(delay, withTiming(0, { duration }));
    translateY.value = withDelay(delay, withTiming(0, { duration }));
    opacity.value = withDelay(delay, withTiming(1, { duration }));

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(opacity);
    };
  }, [translateX, translateY, opacity, delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
};

/**
 * Pressable with scale effect
 */
export const ScaleOnPress: React.FC<ScaleOnPressProps> = ({
  children,
  onPress,
  style,
  scale: scaleTarget = 0.97,
  haptic = true,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(scaleTarget, SPRING_CONFIG);
  }, [scale, scaleTarget]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (haptic) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  }, [haptic, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
};

/**
 * Pulsing view for notifications/badges
 */
export const PulseView: React.FC<PulseViewProps> = ({
  children,
  style,
  pulseScale = 1.1,
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(pulseScale, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      -1,
      false,
    );

    return () => {
      cancelAnimation(scale);
    };
  }, [scale, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
};

/**
 * Staggered list animation wrapper
 */
export const StaggeredList: React.FC<{
  children: React.ReactNode[];
  staggerDelay?: number;
}> = ({ children, staggerDelay = 50 }) => {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <FadeInView delay={index * staggerDelay}>
          <SlideInView direction="up" delay={index * staggerDelay}>
            {child}
          </SlideInView>
        </FadeInView>
      ))}
    </>
  );
};

/**
 * Shake animation for errors
 */
export const useShakeAnimation = () => {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const shake = useCallback(() => {
    translateX.value = withSequence(
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [translateX]);

  return { animatedStyle, shake };
};

/**
 * Success checkmark animation
 */
export const SuccessAnimation: React.FC<{
  visible: boolean;
  onComplete?: () => void;
}> = ({ visible, onComplete }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, {
        damping: 8,
        stiffness: 100,
      });
      opacity.value = withTiming(1, { duration: 200 });

      // Call onComplete after animation duration
      // Using timeout for compatibility with test mocks
      if (onComplete) {
        const timer = setTimeout(onComplete, 300);
        return () => clearTimeout(timer);
      }
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
    return undefined;
  }, [visible, scale, opacity, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.successContainer, animatedStyle]}>
      <View style={styles.successCircle}>
        <Text style={styles.successCheckmark}>✓</Text>
      </View>
    </Animated.View>
  );
};

// Helper function
function getInitialTranslate(direction: string): number {
  switch (direction) {
    case 'up':
      return 20;
    case 'down':
      return -20;
    case 'left':
      return 20;
    case 'right':
      return -20;
    default:
      return 20;
  }
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  successContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlay30,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.feedback.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCheckmark: {
    color: COLORS.utility.white,
    fontSize: 40,
    fontWeight: 'bold',
  },
});

export default AnimatedButton;
