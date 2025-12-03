import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, CARD_SHADOW } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { LoadingState } from '../components/LoadingState';

type PhoneAuthScreenProps = StackScreenProps<RootStackParamList, 'PhoneAuth'>;

export const PhoneAuthScreen: React.FC<PhoneAuthScreenProps> = ({
  navigation,
}) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpInputs = useRef<(TextInput | null)[]>([]);

  const handleSendOTP = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStep('otp');
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit code.');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Discover'); // Navigate to discover on success
    }, 1000);
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const renderPhoneStep = () => (
    <>
      <View style={styles.header}>
        <Icon name="cellphone-key" size={64} color={COLORS.primary} />
        <Text style={styles.title}>Enter Your Phone</Text>
        <Text style={styles.subtitle}>
          We&apos;ll send you a verification code to confirm your number
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.phoneInputWrapper}>
          <Text style={styles.countryCode}>+1</Text>
          <TextInput
            style={styles.phoneInput}
            placeholder="(555) 123-4567"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            maxLength={14}
            autoFocus
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSendOTP}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Send Code</Text>
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderOtpStep = () => (
    <>
      <View style={styles.header}>
        <Icon name="message-text" size={64} color={COLORS.primary} />
        <Text style={styles.title}>Verify Your Phone</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.phoneDisplay}>{phoneNumber}</Text>
        </Text>
      </View>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              otpInputs.current[index] = ref;
            }}
            style={styles.otpInput}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={({ nativeEvent }) =>
              handleOtpKeyPress(nativeEvent.key, index)
            }
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleVerifyOTP}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Verify Code</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendButton} onPress={handleSendOTP}>
        <Text style={styles.resendText}>Didn&apos;t receive code? </Text>
        <Text style={[styles.resendText, styles.resendLink]}>Resend</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.changeNumberButton}
        onPress={() => setStep('phone')}
      >
        <Text style={styles.changeNumberText}>Change Phone Number</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {loading && (
        <LoadingState
          type="overlay"
          message={step === 'phone' ? 'Sending...' : 'Verifying...'}
        />
      )}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.outerContent}>
          <View style={styles.cardContainer}>
            <View style={styles.cardInner}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-left" size={20} color={COLORS.text} />
              </TouchableOpacity>

              <View style={styles.content}>
                {step === 'phone' ? renderPhoneStep() : renderOtpStep()}

                {/* Üye olmadan devam et butonu */}
                <TouchableOpacity
                  style={styles.continueWithoutSignupButton}
                  onPress={() => navigation.replace('Discover')}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.mint]}
                    style={styles.continueWithoutSignupGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.continueWithoutSignupText}>
                      Üye olmadan devam et
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginLeft: LAYOUT.padding,
    padding: LAYOUT.padding * 1.5,
  },
  buttonGradient: {
    alignItems: 'center',
    paddingVertical: LAYOUT.padding * 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  cardContainer: {
    alignSelf: 'center',
    borderRadius: VALUES.borderRadius * 2,
    maxWidth: 420,
    overflow: 'hidden',
    width: '100%',
    ...CARD_SHADOW,
    marginVertical: LAYOUT.padding * 2,
  },
  cardInner: {
    backgroundColor: COLORS.card,
    padding: LAYOUT.padding * 2,
  },
  changeNumberButton: {
    alignItems: 'center',
    paddingVertical: LAYOUT.padding,
  },
  changeNumberText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: LAYOUT.padding * 2,
  },
  continueWithoutSignupButton: {
    borderRadius: 12,
    marginTop: 24,
    overflow: 'hidden',
  },
  continueWithoutSignupGradient: {
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
  },
  continueWithoutSignupText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  countryCode: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginRight: LAYOUT.padding,
  },
  header: {
    alignItems: 'center',
    marginBottom: LAYOUT.padding * 4,
  },
  inputContainer: {
    marginBottom: LAYOUT.padding * 3,
  },
  keyboardView: {
    flex: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.padding * 3,
  },
  otpInput: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: VALUES.borderRadius,
    borderWidth: 2,
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    height: 60,
    textAlign: 'center',
    width: 50,
  },
  outerContent: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding * 2,
  },
  phoneDisplay: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  phoneInput: {
    color: COLORS.text,
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: LAYOUT.padding * 1.5,
  },
  phoneInputWrapper: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: VALUES.borderRadius,
    borderWidth: 2,
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.padding * 1.5,
  },
  primaryButton: {
    borderRadius: VALUES.borderRadius,
    marginBottom: LAYOUT.padding * 2,
    overflow: 'hidden',
  },
  resendButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: LAYOUT.padding,
  },
  resendLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  resendText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '400',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: LAYOUT.padding,
    marginTop: LAYOUT.padding * 2,
  },
});
