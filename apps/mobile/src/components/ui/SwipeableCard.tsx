import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = CARD_WIDTH * 0.4,
}: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      'worklet';
      const shouldDismiss = Math.abs(translateX.value) > threshold;

      if (shouldDismiss) {
        const swipedRight = translateX.value > 0;
        // Animate card off screen
        translateX.value = withSpring(
          swipedRight ? SCREEN_WIDTH : -SCREEN_WIDTH,
          { damping: 20, stiffness: 90 },
          (finished) => {
            'worklet';
            // Callback after animation
            if (finished) {
              if (swipedRight && onSwipeRight) {
                runOnJS(onSwipeRight)();
              } else if (!swipedRight && onSwipeLeft) {
                runOnJS(onSwipeLeft)();
              }
            }
          }
        );
      } else {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-CARD_WIDTH, 0, CARD_WIDTH],
      [-15, 0, 15],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, threshold],
      [1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ] as const,
      opacity,
    };
  });

  const leftIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, threshold],
      [0, 1],
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  const rightIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-threshold, 0],
      [1, 0],
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Animated.View style={[styles.indicator, styles.leftIndicator, leftIndicatorStyle]}>
          <Animated.Text style={styles.indicatorText}>LIKE</Animated.Text>
        </Animated.View>

        <Animated.View style={[styles.indicator, styles.rightIndicator, rightIndicatorStyle]}>
          <Animated.Text style={styles.indicatorText}>NOPE</Animated.Text>
        </Animated.View>

        {children}
      </Animated.View>
    </GestureDetector>
  );
}

export function DismissibleCard({ children, onDismiss }: { children: React.ReactNode; onDismiss: () => void }) {
  const translateY = useSharedValue(0);
  const height = useSharedValue(100);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow downward swipe
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd(() => {
      'worklet';
      if (translateY.value > 100) {
        // Animate out
        translateY.value = withTiming(500, { duration: 300 });
        height.value = withTiming(0, { duration: 300 }, (finished) => {
          'worklet';
          if (finished) {
            runOnJS(onDismiss)();
          }
        });
      } else {
        // Return to position
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: height.value,
    opacity: interpolate(translateY.value, [0, 100], [1, 0], Extrapolate.CLAMP),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.dismissibleCard, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  indicator: {
    position: 'absolute',
    top: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 3,
  },
  leftIndicator: {
    right: 20,
    borderColor: '#22c55e',
  },
  rightIndicator: {
    left: 20,
    borderColor: '#ef4444',
  },
  indicatorText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dismissibleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
