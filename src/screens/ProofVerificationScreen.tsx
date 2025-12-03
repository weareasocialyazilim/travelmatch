import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import type { RootStackParamList } from '../navigation/AppNavigator';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export const ProofVerificationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [progress, setProgress] = useState(0);
  const spinValue = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    // Rotating animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }),
    ).start();

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Navigate to success screen after completion
          setTimeout(() => {
            navigation.navigate('Success', { type: 'proof_uploaded' });
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [navigation, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Circle */}
        <View style={styles.circleContainer}>
          <Animated.View
            style={[styles.rotatingBorder, { transform: [{ rotate: spin }] }]}
          >
            <View style={styles.dashedCircle} />
          </Animated.View>
          <View style={styles.innerCircle}>
            <MaterialCommunityIcons
              name={'earth' as IconName}
              size={96}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.headline}>Processing proof…</Text>
          <Text style={styles.bodyText}>This usually takes a few seconds.</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  circleContainer: {
    width: 256,
    height: 256,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  rotatingBorder: {
    position: 'absolute',
    width: 256,
    height: 256,
  },
  dashedCircle: {
    width: 256,
    height: 256,
    borderRadius: 128,
    borderWidth: 4,
    borderColor: `${COLORS.primary}4D`,
    borderStyle: 'dashed',
  },
  innerCircle: {
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: `${COLORS.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 32,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: `${COLORS.primary}33`,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    minWidth: 84,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});
