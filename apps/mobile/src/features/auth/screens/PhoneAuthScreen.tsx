import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  signInWithPhone,
  verifyPhoneOtp,
} from '@/services/supabaseAuthService';
import { useToast } from '@/context/ToastContext';
import { useAccessibility } from '@/hooks/useAccessibility';
import { COLORS } from '@/constants/colors';

type PhoneAuthStep = 'phone' | 'otp';

export const PhoneAuthScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { props: a11y } = useAccessibility();

  const [step, setStep] = useState<PhoneAuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    // Format as (XXX) XXX-XXXX
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6,
      10,
    )}`;
  };

  const getE164Phone = () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return `+1${cleaned}`; // Assuming US numbers, adjust as needed
  };

  const handleSendOtp = async () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signInWithPhone(getE164Phone());
      if (error) {
        showToast(error.message || 'Failed to send verification code', 'error');
      } else {
        setStep('otp');
        setCountdown(60);
        showToast('Verification code sent!', 'success');
      }
    } catch {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otpCode];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtpCode(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otpCode];
      newOtp[index] = value;
      setOtpCode(newOtp);

      // Auto-advance to next input
      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      showToast('Please enter the 6-digit code', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await verifyPhoneOtp(getE164Phone(), code);
      if (error) {
        showToast(error.message || 'Invalid verification code', 'error');
      } else {
        showToast('Phone verified successfully!', 'success');
        // Navigation handled by auth state change
      }
    } catch {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (countdown === 0) {
      handleSendOtp();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          {...a11y.button('Back button')}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <View style={styles.header}>
          <MaterialCommunityIcons
            name={step === 'phone' ? 'phone' : 'message-text'}
            size={64}
            color={COLORS.primary}
          />
          <Text style={styles.title}>
            {step === 'phone'
              ? 'Phone Authentication'
              : 'Enter Verification Code'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'phone'
              ? "We'll send you a verification code"
              : `Code sent to ${phoneNumber}`}
          </Text>
        </View>

        {step === 'phone' ? (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneInputWrapper}>
              <Text style={styles.countryCode}>+1</Text>
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                placeholder="(555) 123-4567"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="phone-pad"
                maxLength={14}
                editable={!isLoading}
                {...a11y.textInput('Phone number input')}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={isLoading}
              {...a11y.button('Send verification code', undefined, isLoading)}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Send Code</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Verification Code</Text>
            <View style={styles.otpContainer}>
              {otpCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    otpInputRefs.current[index] = ref;
                  }}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(index, value)}
                  onKeyPress={({ nativeEvent }) =>
                    handleOtpKeyPress(index, nativeEvent.key)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  editable={!isLoading}
                  {...a11y.textInput(`Digit ${index + 1} of verification code`)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={isLoading}
              {...a11y.button('Verify code', undefined, isLoading)}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOtp}
              disabled={countdown > 0}
              {...a11y.button(
                countdown > 0
                  ? `Resend code in ${countdown} seconds`
                  : 'Resend code',
                undefined,
                countdown > 0,
              )}
            >
              <Text
                style={[
                  styles.resendText,
                  countdown > 0 && styles.resendTextDisabled,
                ]}
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.changePhoneButton}
              onPress={() => {
                setStep('phone');
                setOtpCode(['', '', '', '', '', '']);
              }}
              {...a11y.button('Change phone number')}
            >
              <Text style={styles.changePhoneText}>Change Phone Number</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
    padding: 8,
    alignSelf: 'flex-start',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  countryCode: {
    fontSize: 16,
    color: COLORS.text,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    padding: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.text,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    padding: 12,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: COLORS.textSecondary,
  },
  changePhoneButton: {
    alignItems: 'center',
    padding: 12,
  },
  changePhoneText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});

export default PhoneAuthScreen;
