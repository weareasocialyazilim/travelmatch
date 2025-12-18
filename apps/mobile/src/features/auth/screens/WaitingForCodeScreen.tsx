import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signInWithPhone, signInWithMagicLink } from '@/services/supabaseAuthService';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';

type RouteParams = {
  WaitingForCode: {
    verificationType: 'phone' | 'email';
    contact: string;
  };
};

const RESEND_COOLDOWN = 60; // seconds

export const WaitingForCodeScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'WaitingForCode'>>();
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [isResending, setIsResending] = useState(false);

  const verificationType = route.params?.verificationType || 'phone';
  const contact = route.params?.contact || '';

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatContact = () => {
    if (verificationType === 'phone') {
      if (contact.length > 4) {
        return `${contact.slice(0, 3)}****${contact.slice(-4)}`;
      }
      return contact;
    }
    const [local, domain] = contact.split('@');
    if (local && local.length > 2) {
      return `${local.slice(0, 2)}***@${domain}`;
    }
    return contact;
  };

  const handleResend = useCallback(async () => {
    if (resendTimer > 0 || isResending) return;

    setIsResending(true);
    try {
      if (verificationType === 'phone') {
        await signInWithPhone(contact);
      } else {
        await signInWithMagicLink(contact);
      }
      setResendTimer(RESEND_COOLDOWN);
    } catch (error) {
      // Error handling - show alert if needed
    } finally {
      setIsResending(false);
    }
  }, [verificationType, contact, resendTimer, isResending]);

  const handleEnterCode = () => {
    navigation.navigate('VerifyCode' as never, {
      verificationType,
      contact,
    } as never);
  };

  const handleChangeContact = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Animation/Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <MaterialCommunityIcons
              name={verificationType === 'phone' ? 'cellphone-message' : 'email-send'}
              size={48}
              color={COLORS.primary}
            />
          </View>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={styles.spinner}
          />
        </View>

        <Text style={styles.title}>Check Your {verificationType === 'phone' ? 'Phone' : 'Email'}</Text>

        <Text style={styles.description}>
          We've sent a verification code to{'\n'}
          <Text style={styles.contactText}>{formatContact()}</Text>
        </Text>

        <Text style={styles.hint}>
          {verificationType === 'phone'
            ? 'The SMS should arrive within a few seconds'
            : 'Check your inbox and spam folder'}
        </Text>

        {/* Enter Code Button */}
        <TouchableOpacity
          style={styles.enterCodeButton}
          onPress={handleEnterCode}
        >
          <MaterialCommunityIcons name="numeric" size={20} color={COLORS.white} />
          <Text style={styles.enterCodeButtonText}>Enter Code</Text>
        </TouchableOpacity>

        {/* Resend Section */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>
          {resendTimer > 0 ? (
            <Text style={styles.resendTimer}>
              Resend in {resendTimer}s
            </Text>
          ) : (
            <TouchableOpacity
              onPress={handleResend}
              disabled={isResending}
              style={styles.resendButton}
            >
              {isResending ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.resendLink}>Resend Code</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Change Contact */}
        <TouchableOpacity
          style={styles.changeContactButton}
          onPress={handleChangeContact}
        >
          <Text style={styles.changeContactText}>
            Wrong {verificationType === 'phone' ? 'phone number' : 'email'}?{' '}
            <Text style={styles.changeContactLink}>Change</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontWeight: '600',
    color: COLORS.text,
  },
  hint: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginBottom: 32,
  },
  enterCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  enterCodeButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.white,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  resendTimer: {
    ...TYPOGRAPHY.body,
    color: COLORS.textTertiary,
  },
  resendButton: {
    padding: 8,
  },
  resendLink: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  changeContactButton: {
    paddingVertical: 12,
  },
  changeContactText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  changeContactLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
