/**
 * Success Ceremony Component
 *
 * A premium celebration screen for successful actions.
 * Used after registration, verification, and other milestone events.
 */
import React from 'react';
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
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
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

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      testID={testID}
    >
      <LinearGradient
        colors={['#121214', '#1E1E20', '#121214']}
        style={StyleSheet.absoluteFill}
      />

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
  iconContainer: {
    marginBottom: 32,
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
  },
  message: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    maxWidth: width * 0.8,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 24,
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
