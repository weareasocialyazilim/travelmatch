import React, { useRef, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import { Animated, StyleSheet, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
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
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (haptic) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          style,
          { transform: [{ scale: scaleValue }] },
          disabled && styles.disabled,
        ]}
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
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [fadeValue, delay, duration]);

  return (
    <Animated.View style={[style, { opacity: fadeValue }]}>
      {children}
    </Animated.View>
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
  const translateValue = useRef(
    new Animated.Value(getInitialTranslate(direction)),
  ).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateValue, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateValue, opacityValue, delay, duration]);

  const transform = getTransform(direction, translateValue);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: opacityValue,
          transform,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Pressable with scale effect
 */
export const ScaleOnPress: React.FC<ScaleOnPressProps> = ({
  children,
  onPress,
  style,
  scale = 0.97,
  haptic = true,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: scale,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (haptic) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
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
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: pulseScale,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scaleValue, pulseScale]);

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
      {children}
    </Animated.View>
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
  const shakeValue = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeValue, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeValue, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { shakeValue, shake };
};

/**
 * Success checkmark animation
 */
export const SuccessAnimation: React.FC<{
  visible: boolean;
  onComplete?: () => void;
}> = ({ visible, onComplete }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete?.();
      });
    } else {
      scaleValue.setValue(0);
      opacityValue.setValue(0);
    }
  }, [visible, scaleValue, opacityValue, onComplete]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.successContainer,
        {
          opacity: opacityValue,
          transform: [{ scale: scaleValue }],
        },
      ]}
    >
      <View style={styles.successCircle}>
        <Animated.Text style={styles.successCheckmark}>✓</Animated.Text>
      </View>
    </Animated.View>
  );
};

// Helper functions
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

function getTransform(direction: string, value: Animated.Value) {
  switch (direction) {
    case 'up':
    case 'down':
      return [{ translateY: value }];
    case 'left':
    case 'right':
      return [{ translateX: value }];
    default:
      return [{ translateY: value }];
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
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCheckmark: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: 'bold',
  },
});

export default AnimatedButton;
