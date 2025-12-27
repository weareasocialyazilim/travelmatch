import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from '@/context/ToastContext';
import { useAccessibility } from '@/hooks/useAccessibility';
import { COLORS } from '@/constants/colors';

const TIMEOUT_DURATION = 30; // seconds before showing retry option

export const WaitingForCodeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { props: a11y } = useAccessibility();

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  const spinValue = useState(new Animated.Value(0))[0];
  const pulseValue = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [spinValue, pulseValue]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => {
        if (prev >= TIMEOUT_DURATION) {
          setShowRetry(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleRetry = () => {
    showToast('Requesting new code...', 'info');
    setTimeElapsed(0);
    setShowRetry(false);
    // In real implementation, this would call the API to resend the code
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleManualEntry = () => {
    navigation.navigate('VerifyCode' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
          {...a11y.button('Cancel and go back')}
        >
          <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: pulseValue }] },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <MaterialCommunityIcons
              name="cellphone-message"
              size={64}
              color={COLORS.primary}
            />
          </Animated.View>
        </Animated.View>

        <Text style={styles.title}>Waiting for Code</Text>
        <Text style={styles.subtitle}>
          We're sending a verification code to your device. This usually takes a few seconds.
        </Text>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min((timeElapsed / TIMEOUT_DURATION) * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {showRetry ? 'Taking longer than expected' : `${timeElapsed}s`}
          </Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipRow}>
            <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.success} />
            <Text style={styles.tipText}>Make sure your phone has signal</Text>
          </View>
          <View style={styles.tipRow}>
            <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.success} />
            <Text style={styles.tipText}>Check your SMS inbox</Text>
          </View>
          <View style={styles.tipRow}>
            <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.success} />
            <Text style={styles.tipText}>Code will arrive within 30 seconds</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {showRetry && (
          <View style={styles.retryContainer}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              {...a11y.button('Request new code')}
            >
              <MaterialCommunityIcons name="refresh" size={20} color={COLORS.white} />
              <Text style={styles.retryButtonText}>Request New Code</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Manual Entry Link */}
        <TouchableOpacity
          style={styles.manualEntryButton}
          onPress={handleManualEntry}
          {...a11y.button('Enter code manually')}
        >
          <MaterialCommunityIcons name="keyboard-outline" size={18} color={COLORS.primary} />
          <Text style={styles.manualEntryText}>Already have a code? Enter manually</Text>
        </TouchableOpacity>

        {/* Cancel Link */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          {...a11y.button('Cancel verification')}
        >
          <Text style={styles.cancelText}>Cancel Verification</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.text,
  },
  retryContainer: {
    width: '100%',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    height: 52,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  manualEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginBottom: 8,
  },
  manualEntryText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  cancelButton: {
    padding: 12,
  },
  cancelText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default WaitingForCodeScreen;
