import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingState } from '@/components/LoadingState';
import {
  verifyPhoneOtp,
  verifyEmailOtp,
  signInWithPhone,
  signInWithMagicLink,
} from '@/services/supabaseAuthService';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';

type RouteParams = {
  VerifyCode: {
    verificationType: 'phone' | 'email';
    contact: string;
  };
};

const CODE_LENGTH = 6;

export const VerifyCodeScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'VerifyCode'>>();
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const verificationType = route.params?.verificationType || 'phone';
  const contact = route.params?.contact || '';

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleCodeChange = (value: string, index: number) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newCode.every((digit) => digit !== '') && newCode.join('').length === CODE_LENGTH) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode: string) => {
    if (verificationCode.length !== CODE_LENGTH) {
      Alert.alert('Error', 'Please enter the complete verification code');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (verificationType === 'phone') {
        result = await verifyPhoneOtp(contact, verificationCode);
      } else {
        result = await verifyEmailOtp(contact, verificationCode);
      }

      if (result.error) {
        Alert.alert('Error', result.error.message || 'Invalid verification code');
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        return;
      }

      if (result.session) {
        // Successfully authenticated
        Alert.alert(
          'Success',
          'Your account has been verified!',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigation will be handled by auth state change
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      let result;
      if (verificationType === 'phone') {
        result = await signInWithPhone(contact);
      } else {
        result = await signInWithMagicLink(contact);
      }

      if (result.error) {
        Alert.alert('Error', result.error.message || 'Failed to resend code');
        return;
      }

      Alert.alert('Success', 'A new verification code has been sent');
      setResendTimer(60);
      setCanResend(false);
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatContact = () => {
    if (verificationType === 'phone') {
      // Mask phone number for display
      if (contact.length > 4) {
        return `${contact.slice(0, 3)}****${contact.slice(-4)}`;
      }
      return contact;
    }
    // Mask email for display
    const [local, domain] = contact.split('@');
    if (local.length > 2) {
      return `${local.slice(0, 2)}***@${domain}`;
    }
    return contact;
  };

  if (isLoading) {
    return <LoadingState message="Verifying..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify Code</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={verificationType === 'phone' ? 'message-text-lock' : 'email-lock'}
              size={64}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.description}>
            We sent a {CODE_LENGTH}-digit code to{'\n'}
            <Text style={styles.contactText}>{formatContact()}</Text>
          </Text>

          {/* Code Input */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={`code-input-${index}`}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  digit ? styles.codeInputFilled : null,
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              code.some((d) => !d) && styles.verifyButtonDisabled,
            ]}
            onPress={() => handleVerify(code.join(''))}
            disabled={code.some((d) => !d)}
          >
            <Text style={styles.verifyButtonText}>Verify</Text>
          </TouchableOpacity>

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResendCode}>
                <Text style={styles.resendLink}>Resend Code</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendTimer}>
                Resend in {resendTimer}s
              </Text>
            )}
          </View>

          {/* Change Method */}
          <TouchableOpacity
            style={styles.changeMethodButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.changeMethodText}>
              Wrong {verificationType === 'phone' ? 'phone number' : 'email'}?{' '}
              <Text style={styles.changeMethodLink}>Change</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
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
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  contactText: {
    fontWeight: '600',
    color: COLORS.text,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  codeInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 12,
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  verifyButtonText: {
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
  resendLink: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  resendTimer: {
    ...TYPOGRAPHY.body,
    color: COLORS.textTertiary,
  },
  changeMethodButton: {
    paddingVertical: 12,
  },
  changeMethodText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  changeMethodLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
