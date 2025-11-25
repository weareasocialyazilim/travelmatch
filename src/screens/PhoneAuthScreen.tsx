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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, CARD_SHADOW } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';

export const PhoneAuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
                  <Icon name="arrow-left" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.content}>
                  {step === 'phone' ? renderPhoneStep() : renderOtpStep()}
                  {/* Üye olmadan devam et butonu */}
                  <TouchableOpacity
                    style={styles.continueWithoutSignupButton}
                    onPress={() => navigation.replace('Home')}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.mint]}
                      style={styles.continueWithoutSignupGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.continueWithoutSignupText}>Üye olmadan devam et</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
        <Text style={styles.title}>Enter Your Phone</Text>
        <Text style={styles.subtitle}>
          We'll send you a verification code to confirm your number
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
          {loading ? (
            <Text style={styles.buttonText}>Sending...</Text>
          ) : (
            <Text style={styles.buttonText}>Send Code</Text>
          )}
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
            ref={(ref) => (otpInputs.current[index] = ref)}
            style={styles.otpInput}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
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
          {loading ? (
            <Text style={styles.buttonText}>Verifying...</Text>
          ) : (
            <Text style={styles.buttonText}>Verify Code</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendButton} onPress={handleSendOTP}>
        <Text style={styles.resendText}>Didn't receive code? </Text>
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
                  onPress={() => navigation.replace('Home')}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.mint]}
                    style={styles.continueWithoutSignupGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.continueWithoutSignupText}>Üye olmadan devam et</Text>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    padding: LAYOUT.padding * 1.5,
    marginLeft: LAYOUT.padding,
  },
  content: {
    flex: 1,
    paddingHorizontal: LAYOUT.padding * 2,
    justifyContent: 'center',
  },
    outerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: LAYOUT.padding * 2,
      backgroundColor: COLORS.background,
    },
    cardContainer: {
      width: '100%',
      maxWidth: 420,
      alignSelf: 'center',
      borderRadius: VALUES.borderRadius * 2,
      overflow: 'hidden',
      ...CARD_SHADOW,
      marginVertical: LAYOUT.padding * 2,
    },
    cardInner: {
      padding: LAYOUT.padding * 2,
      backgroundColor: COLORS.card,
    },
  header: {
    alignItems: 'center',
    marginBottom: LAYOUT.padding * 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: LAYOUT.padding * 2,
    marginBottom: LAYOUT.padding,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneDisplay: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  inputContainer: {
    marginBottom: LAYOUT.padding * 3,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: VALUES.borderRadius,
    paddingHorizontal: LAYOUT.padding * 1.5,
    backgroundColor: COLORS.white,
  },
  countryCode: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: LAYOUT.padding,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    paddingVertical: LAYOUT.padding * 1.5,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.padding * 3,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: VALUES.borderRadius,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    backgroundColor: COLORS.white,
  },
  primaryButton: {
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
    marginBottom: LAYOUT.padding * 2,
  },
  buttonGradient: {
    paddingVertical: LAYOUT.padding * 2,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  resendButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT.padding,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  resendLink: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  changeNumberButton: {
    alignItems: 'center',
    paddingVertical: LAYOUT.padding,
  },
  changeNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  continueWithoutSignupButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueWithoutSignupGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  continueWithoutSignupText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
