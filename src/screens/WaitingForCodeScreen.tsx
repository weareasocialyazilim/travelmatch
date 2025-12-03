import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import type { RootStackParamList } from '../navigation/AppNavigator';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export const WaitingForCodeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [timer, setTimer] = useState(59);

  useEffect(() => {
    // Countdown timer
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResend = () => {
    if (timer === 0) {
      setTimer(59);
      // Trigger resend code API call here
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name={'arrow-left' as IconName}
            size={24}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        {/* Animated Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconOuterCircle}>
            <View style={styles.iconInnerCircle}>
              <MaterialCommunityIcons
                name={'email-outline' as IconName}
                size={48}
                color={COLORS.primary}
              />
            </View>
          </View>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>Waiting for code…</Text>

        {/* Body */}
        <Text style={styles.body}>
          We&apos;ve sent a 6-digit code to your email. Please check your inbox.
        </Text>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Countdown */}
        <Text style={styles.countdown}>
          You can resend the code in {formatTime(timer)}
        </Text>

        {/* Resend Button */}
        <TouchableOpacity
          onPress={handleResend}
          disabled={timer > 0}
          style={styles.resendButton}
        >
          <Text
            style={[
              styles.resendButtonText,
              timer > 0 && styles.resendButtonTextDisabled,
            ]}
          >
            Resend code
          </Text>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconOuterCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: `${COLORS.primary}1A`, // 10% opacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}33`, // 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  body: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 336,
  },
  spacer: {
    height: 80,
  },
  countdown: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginBottom: 12,
  },
  resendButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  resendButtonTextDisabled: {
    opacity: 0.5,
  },
});
