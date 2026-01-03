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
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  signInWithPhone,
  verifyPhoneOtp,
} from '../services/authService';
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
    return undefined;
  }, [countdown]);

  const formatPhoneNumber = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    // Format as XXX XXX XX XX (Turkish format)
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 8)
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  };

  const getE164Phone = () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return `+90${cleaned}`; // Turkish phone numbers
  };

  const handleSendOtp = async () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      showToast('Lütfen geçerli bir 10 haneli telefon numarası girin', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signInWithPhone(getE164Phone());
      if (error) {
        showToast(error.message || 'Doğrulama kodu gönderilemedi', 'error');
      } else {
        setStep('otp');
        setCountdown(60);
        showToast('Doğrulama kodu gönderildi!', 'success');
      }
    } catch {
      showToast('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
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
      showToast('Lütfen 6 haneli kodu girin', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await verifyPhoneOtp(getE164Phone(), code);
      if (error) {
        showToast(error.message || 'Geçersiz doğrulama kodu', 'error');
      } else {
        showToast('Telefon başarıyla doğrulandı!', 'success');
        // Navigation handled by auth state change
      }
    } catch {
      showToast('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
              color={COLORS.text.primary}
            />
          </TouchableOpacity>

          <View style={styles.header}>
            <MaterialCommunityIcons
              name={step === 'phone' ? 'phone' : 'message-text'}
              size={64}
              color={COLORS.brand.primary}
            />
            <Text style={styles.title}>
              {step === 'phone'
                ? 'Telefon ile Giriş'
                : 'Doğrulama Kodunu Girin'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'phone'
                ? 'Size bir doğrulama kodu göndereceğiz'
                : `Kod gönderildi: ${phoneNumber}`}
            </Text>
          </View>

          {step === 'phone' ? (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Telefon Numarası</Text>
              <View style={styles.phoneInputWrapper}>
                <Text style={styles.countryCode}>+90</Text>
                <TextInput
                  style={styles.phoneInput}
                  value={phoneNumber}
                  onChangeText={(text) =>
                    setPhoneNumber(formatPhoneNumber(text))
                  }
                  placeholder="5XX XXX XX XX"
                  placeholderTextColor={COLORS.text.secondary}
                  keyboardType="phone-pad"
                  maxLength={13}
                  editable={!isLoading}
                  {...a11y.textInput('Telefon numarası girişi')}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={isLoading}
                {...a11y.button('Doğrulama kodu gönder', undefined, isLoading)}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Kod Gönder</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Doğrulama Kodu</Text>
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
                    {...a11y.textInput(
                      `Digit ${index + 1} of verification code`,
                    )}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
                {...a11y.button('Kodu doğrula', undefined, isLoading)}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Doğrula</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOtp}
                disabled={countdown > 0}
                {...a11y.button(
                  countdown > 0
                    ? `${countdown} saniye sonra tekrar gönder`
                    : 'Tekrar gönder',
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
                  {countdown > 0
                    ? `${countdown} saniye bekleyin`
                    : 'Tekrar Gönder'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changePhoneButton}
                onPress={() => {
                  setStep('phone');
                  setOtpCode(['', '', '', '', '', '']);
                }}
                {...a11y.button('Telefon numarasını değiştir')}
              >
                <Text style={styles.changePhoneText}>Numarayı Değiştir</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
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
    color: COLORS.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.base,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    marginBottom: 24,
  },
  countryCode: {
    fontSize: 16,
    color: COLORS.text.primary,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: COLORS.border.default,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
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
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.surface.base,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.text.primary,
  },
  otpInputFilled: {
    borderColor: COLORS.brand.primary,
    backgroundColor: COLORS.brand.primaryLight,
  },
  button: {
    backgroundColor: COLORS.brand.primary,
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
    color: COLORS.brand.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: COLORS.text.secondary,
  },
  changePhoneButton: {
    alignItems: 'center',
    padding: 12,
  },
  changePhoneText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
});

export default PhoneAuthScreen;
