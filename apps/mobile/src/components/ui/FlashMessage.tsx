import React, { useEffect } from 'react';
import { Text, StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface FlashMessageProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide: () => void;
}

export const FlashMessage = ({
  message,
  type = 'success',
  onHide,
}: FlashMessageProps) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);

  useEffect(() => {
    // Slide Down
    translateY.value = withSpring(insets.top + 10);

    // Wait & Slide Up
    const timeout = setTimeout(() => {
      translateY.value = withTiming(-150, { duration: 500 }, () => {
        runOnJS(onHide)();
      });
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const getColor = () => {
    switch (type) {
      case 'error':
        return COLORS.feedback.error;
      case 'info':
        return COLORS.feedback.info;
      default:
        return COLORS.feedback.success;
    }
  };

  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'error':
        return 'alert-circle';
      case 'info':
        return 'information-circle';
      default:
        return 'checkmark-circle';
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.bar, { borderLeftColor: getColor() }]}>
        <Ionicons name={getIcon()} size={24} color={getColor()} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  bar: {
    width: width * 0.9,
    backgroundColor: COLORS.background.tertiary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    gap: 12,
  },
  text: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
